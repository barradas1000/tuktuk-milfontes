import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const MAX_WIDTH = 1600;

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
    if (shouldResize) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 75, mozjpeg: true });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 75 });
    } else if (ext === '.avif') {
      pipeline = pipeline.avif({ quality: 50 });
    }

    const buffer = await pipeline.toBuffer();

    // Decide overwrite: if resized or file got at least ~2% smaller
    const shouldWrite = shouldResize || buffer.length < stat.size * 0.98;
    if (shouldWrite) {
      await fs.writeFile(file, buffer);
      return { file, before: stat.size, after: buffer.length, optimized: true };
    }
    return { file, before: stat.size, after: buffer.length, optimized: false };
  } catch (err) {
    return { file, error: err.message };
  }
}

async function main() {
  const roots = process.argv.slice(2);
  const targets = roots.length ? roots : ['public'];

  const results = [];
  for (const root of targets) {
    try {
      for await (const file of walk(root)) {
        results.push(await optimizeImage(file));
      }
    } catch (e) {
      console.error(`[skip] ${root}: ${e.message}`);
    }
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;
  let errors = 0;
  for (const r of results) {
    if (r.error) { errors++; continue; }
    if (r.optimized) changed++;
    if (typeof r.before === 'number' && typeof r.after === 'number') {
      totalBefore += r.before;
      totalAfter += r.after;
    }
  }
  const saved = totalBefore - totalAfter;
  const pct = totalBefore ? ((saved / totalBefore) * 100).toFixed(2) : '0.00';
  console.log(`Optimized files: ${changed}, Errors: ${errors}, Saved: ${(saved/1024/1024).toFixed(2)} MB (${pct}%)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
