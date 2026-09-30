import type { Metadata } from "next";
import { getShare } from "@/lib/db";
import { APP_NAME } from "@/lib/constants";
import { toVideoPosterUrl, toThumbnailUrl } from "@/lib/cdn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const share = await getShare(id);

  if (!share || share.expires_at <= Date.now()) {
    return {
      title: `Content Expired or Not Found | ${APP_NAME}`,
      description: `This link has expired or no longer exists on ${APP_NAME}.`,
      openGraph: {
        title: `Content Expired or Not Found | ${APP_NAME}`,
        description: `This link has expired or no longer exists on ${APP_NAME}.`,
        images: ["/opengraph-image"],
      },
      twitter: {
        card: "summary_large_image",
        title: `Content Expired or Not Found | ${APP_NAME}`,
        description: `This link has expired or no longer exists on ${APP_NAME}.`,
        images: ["/opengraph-image"],
      },
    };
  }

  const isLocked = Boolean(share.password_hash || share.encrypted);
  const sizeText = formatSize(share.file_size);
  const isVideo =
    share.type === "file" &&
    (share.file_type?.startsWith("video/") ||
      /\.(mp4|webm|mov|mkv|ogg)$/i.test(share.file_name || ""));
  const isImage = share.type === "file" && Boolean(share.file_type?.startsWith("image/"));

  if (isLocked) {
    const title = `🔒 [Protected] ${share.file_name || "File"} | ${APP_NAME}`;
    const description = `Password-protected ${share.type}${sizeText ? ` (${sizeText})` : ""}. Click to unlock and view on ${APP_NAME}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: APP_NAME,
        images: ["/opengraph-image"],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/opengraph-image"],
      },
    };
  }

  // Public / unencrypted media
  const title = share.file_name
    ? `${share.file_name} | ${APP_NAME}`
    : `Shared ${share.type} | ${APP_NAME}`;
  const description = isVideo
    ? `Watch ${share.file_name || "video"}${sizeText ? ` (${sizeText})` : ""} on ${APP_NAME}`
    : isImage
    ? `View ${share.file_name || "image"}${sizeText ? ` (${sizeText})` : ""} on ${APP_NAME}`
    : `View shared ${share.type}${sizeText ? ` (${sizeText})` : ""} on ${APP_NAME}`;

  const videoPoster =
    share.content && isVideo
      ? toVideoPosterUrl(share.content) || toThumbnailUrl(share.content) || "/opengraph-image"
      : "/opengraph-image";

  if (isVideo && share.content) {
    const videoUrl = share.content;
    const mimeType = share.file_type || "video/mp4";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "video.other",
        siteName: APP_NAME,
        videos: [
          {
            url: videoUrl,
            secureUrl: videoUrl,
            type: mimeType,
            width: 1280,
            height: 720,
          },
        ],
        images: [
          {
            url: videoPoster,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "player",
        title,
        description,
        players: [
          {
            playerUrl: videoUrl,
            streamUrl: videoUrl,
            width: 1280,
            height: 720,
          },
        ],
        images: [videoPoster],
      },
    };
  }

  if (isImage && share.content) {
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        siteName: APP_NAME,
        images: [{ url: share.content, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [share.content],
      },
    };
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: APP_NAME,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
