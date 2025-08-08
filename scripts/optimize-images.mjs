import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

// Supported extensions we will process
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const MAX_WIDTH = 1200;
const VARIANT_WIDTHS = [200, 400, 800, 1200];

async function* walk(dir) {
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else yield entry;
  }
}

async function optimizeImage(file) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) return { file, skipped: true };

  try {
    const input = sharp(file);
    const meta = await input.metadata();
    const stat = await fs.stat(file);
    let pipeline = input.rotate();

    const shouldResize = meta.width && meta.width > MAX_WIDTH;
    if (shouldResize)
      pipeline = pipeline.resize({
        width: MAX_WIDTH,
        withoutEnlargement: true,
      });

    if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: 70, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 70 });
    } else if (ext === ".avif") {
      pipeline = pipeline.avif({ quality: 45 });
    }

    const buffer = await pipeline.toBuffer();

    // Decide overwrite: if resized or file got at least ~2% smaller
    const shouldWrite = shouldResize || buffer.length < stat.size * 0.98;
    if (shouldWrite) {
      await fs.writeFile(file, buffer);
      return {
        file,
        before: stat.size,
        after: buffer.length,
        optimized: true,
        meta,
      };
    }
    return {
      file,
      before: stat.size,
      after: buffer.length,
      optimized: false,
      meta,
    };
  } catch (err) {
    // Non-fatal: mark as skipped to silence noisy errors for unsupported/corrupt files
    const msg = err && err.message ? err.message : String(err);
    if (
      msg.includes("unsupported image format") ||
      msg.includes("Input file is missing") ||
      msg.includes("VIPS")
    ) {
      return { file, skipped: true };
    }
    return { file, error: msg };
  }
}

async function ensureDirExists(fp) {
  const dir = path.dirname(fp);
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

async function generateVariant(file, width, format) {
  const ext = path.extname(file).toLowerCase();
  const dir = path.dirname(file);
  const base = path.basename(file, ext);
  const outPath = path.join(dir, `${base}-w${width}.${format}`);
  try {
    let s = sharp(file).rotate().resize({ width, withoutEnlargement: true });
    if (format === "avif") s = s.avif({ quality: 45 });
    else if (format === "webp") s = s.webp({ quality: 70 });
    else if (format === "jpeg" || format === "jpg")
      s = s.jpeg({ quality: 70, mozjpeg: true });
    else if (format === "png")
      s = s.png({ compressionLevel: 9, palette: true });
    const buf = await s.toBuffer();
    await ensureDirExists(outPath);
    await fs.writeFile(outPath, buf);
    return { outPath, bytes: buf.length };
  } catch (e) {
    // treat as skipped; no console noise
    return { outPath, skipped: true };
  }
}

async function generateResponsiveVariants(file, meta) {
  const ext = path.extname(file).toLowerCase();
  const originalFormat = ext.replace(".", "");
  const maxW = typeof meta?.width === "number" ? meta.width : MAX_WIDTH;
  const widths = VARIANT_WIDTHS.filter((w) => w <= maxW);
  if (widths.length === 0) return { generated: 0 };

  let generated = 0;
  for (const w of widths) {
    // AVIF and WebP variants
    const r1 = await generateVariant(file, w, "avif");
    const r2 = await generateVariant(file, w, "webp");
    // Fallback variant using original extension when useful
    if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      const fallbackFormat = originalFormat === "jpeg" ? "jpg" : originalFormat;
      const r3 = await generateVariant(file, w, fallbackFormat);
      if (!r3.skipped) generated++;
    }
    if (!r1.skipped) generated++;
    if (!r2.skipped) generated++;
  }
  return { generated };
}

async function main() {
  const roots = process.argv.slice(2);
  const targets = roots.length ? roots : ["public"];

  const results = [];
  for (const root of targets) {
    try {
      for await (const file of walk(root)) {
        const res = await optimizeImage(file);
        // After basic optimize, also generate responsive variants for local images
        if (
          !res.error &&
          !res.skipped &&
          (res.optimized || typeof res.before === "number")
        ) {
          const gen = await generateResponsiveVariants(file, res.meta);
          res.generated = gen.generated || 0;
        }
        results.push(res);
      }
    } catch (e) {
      console.error(`[skip] ${root}: ${e.message}`);
    }
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;
  let generated = 0;
  let errors = 0;
  let skipped = 0;
  for (const r of results) {
    if (r.skipped) {
      skipped++;
      continue;
    }
    if (r.error) {
      errors++;
      continue;
    }
    if (r.optimized) changed++;
    if (r.generated) generated += r.generated;
    if (typeof r.before === "number" && typeof r.after === "number") {
      totalBefore += r.before;
      totalAfter += r.after;
    }
  }
  const saved = totalBefore - totalAfter;
  const pct = totalBefore ? ((saved / totalBefore) * 100).toFixed(2) : "0.00";
  console.log(
    `Optimized: ${changed}, Variants: ${generated}, Skipped: ${skipped}, Errors: ${errors}, Saved: ${(
      saved /
      1024 /
      1024
    ).toFixed(2)} MB (${pct}%)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
