const IMAGEKIT_ENDPOINT = (process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT || "").trim().replace(/\/$/, "");

interface CdnOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png" | "mp4" | "webm";
}

function buildImageKitTransform(options: CdnOptions): string {
  const parts: string[] = [];
  if (options.width) parts.push(`w-${options.width}`);
  if (options.height) parts.push(`h-${options.height}`);
  if (options.quality) parts.push(`q-${options.quality}`);
  if (options.format) parts.push(`f-${options.format}`);
  return parts.length > 0 ? `tr:${parts.join(",")}` : "";
}

function buildWsrvUrl(originalUrl: string, options?: CdnOptions): string {
  try {
    const params = new URLSearchParams();
    params.set("url", originalUrl);
    if (options?.width) params.set("w", String(options.width));
    if (options?.height) params.set("h", String(options.height));
    params.set("q", String(options?.quality || 80));
    params.set("output", options?.format === "png" ? "png" : "webp");
    params.set("we", "1");
    return `https://wsrv.nl/?${params.toString()}`;
  } catch {
    return originalUrl;
  }
}

export function toCdnUrl(originalUrl: string, options?: CdnOptions): string {
  if (!originalUrl) return "";

  if (
    IMAGEKIT_ENDPOINT &&
    !IMAGEKIT_ENDPOINT.includes("your_imagekit_id")
  ) {
    try {
      const transform = options ? buildImageKitTransform(options) : "";
      if (transform) {
        return `${IMAGEKIT_ENDPOINT}/${transform}/${originalUrl}`;
      }
      return `${IMAGEKIT_ENDPOINT}/${originalUrl}`;
    } catch {
      return buildWsrvUrl(originalUrl, options);
    }
  }

  return buildWsrvUrl(originalUrl, options);
}

export function toVideoUrl(originalUrl: string): string {
  if (!originalUrl) return "";
  if (IMAGEKIT_ENDPOINT && !IMAGEKIT_ENDPOINT.includes("your_imagekit_id")) {
    return `${IMAGEKIT_ENDPOINT}/tr:q-75,f-auto/${originalUrl}`;
  }
  return originalUrl;
}

export function toVideoPosterUrl(originalUrl: string): string {
  if (!originalUrl) return "";
  if (IMAGEKIT_ENDPOINT && !IMAGEKIT_ENDPOINT.includes("your_imagekit_id")) {
    return `${IMAGEKIT_ENDPOINT}/tr:so-1,w-800,q-80,f-auto/${originalUrl}`;
  }
  return "";
}

export function toThumbnailUrl(originalUrl: string): string {
  return toCdnUrl(originalUrl, {
    width: 400,
    quality: 75,
    format: "auto",
  });
}

export function toPreviewUrl(originalUrl: string): string {
  return toCdnUrl(originalUrl, {
    width: 1400,
    quality: 85,
    format: "auto",
  });
}

export function isImageType(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("image/");
}

export function isVideoType(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("video/");
}

export function getDeliveryUrl(
  originalUrl: string,
  fileType: string | null
): { preview: string; download: string; thumbnail: string; poster?: string } {
  const isImg = isImageType(fileType);
  const isVid = isVideoType(fileType);

  if (isVid) {
    return {
      preview: toVideoUrl(originalUrl),
      download: originalUrl,
      thumbnail: toVideoPosterUrl(originalUrl),
      poster: toVideoPosterUrl(originalUrl),
    };
  }

  if (isImg) {
    return {
      preview: toPreviewUrl(originalUrl),
      download: originalUrl,
      thumbnail: toThumbnailUrl(originalUrl),
    };
  }

  return {
    preview: originalUrl,
    download: originalUrl,
    thumbnail: "",
  };
}
