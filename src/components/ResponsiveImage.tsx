import React from "react";

type ResponsiveImageProps = {
  src: string; // base path to the original image in /public (e.g. /lovable-uploads/pic.jpg) or remote URL
  alt: string;
  widths?: number[]; // physical widths for srcset candidates
  sizes?: string; // sizes attribute
  className?: string;
  style?: React.CSSProperties;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
};

const DEFAULT_WIDTHS = [400, 800, 1200];

export default function ResponsiveImage({
  src,
  alt,
  widths = DEFAULT_WIDTHS,
  sizes = "100vw",
  className,
  style,
  loading = "lazy",
  decoding = "async",
}: ResponsiveImageProps) {
  // If it's a remote URL, don't attempt to generate local variant URLs
  if (/^https?:\/\//i.test(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
      />
    );
  }

  // Build variant URLs using the convention: name-w{width}.{ext}
  const dotIdx = src.lastIndexOf(".");
  const slashIdx = src.lastIndexOf("/");
  const dir = slashIdx !== -1 ? src.slice(0, slashIdx) : "";
  const filename = slashIdx !== -1 ? src.slice(slashIdx + 1) : src;
  const base =
    dotIdx !== -1 ? filename.slice(0, filename.lastIndexOf(".")) : filename;
  const ext =
    dotIdx !== -1
      ? filename.slice(filename.lastIndexOf(".") + 1).toLowerCase()
      : "";

  const makePath = (format: string, w: number) =>
    `${dir ? dir + "/" : ""}${base}-w${w}.${format}`;

  const avifSrcSet = widths
    .map((w) => `${makePath("avif", w)} ${w}w`)
    .join(", ");
  const webpSrcSet = widths
    .map((w) => `${makePath("webp", w)} ${w}w`)
    .join(", ");
  const fallbackSrcSet = ext
    ? widths.map((w) => `${makePath(ext, w)} ${w}w`).join(", ")
    : undefined;

  return (
    <picture>
      {/* Prefer AVIF then WebP if available */}
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={src}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
      />
    </picture>
  );
}
