import type { Metadata } from "next";
import { getShare } from "@/lib/db";
import { APP_NAME } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const share = await getShare(id);

  if (!share || share.expires_at <= Date.now()) {
    return {
      title: `Shared Content | ${APP_NAME}`,
    };
  }

  const isVideo =
    share.type === "file" &&
    (share.file_type?.startsWith("video/") ||
      /\.(mp4|webm|mov|mkv|ogg)$/i.test(share.file_name || ""));
  const isImage = share.type === "file" && share.file_type?.startsWith("image/");
  const title = share.file_name
    ? `${share.file_name} | ${APP_NAME}`
    : `Shared ${share.type} | ${APP_NAME}`;
  const description = isVideo
    ? `Watch ${share.file_name || "video"} on ${APP_NAME}`
    : `View shared ${share.type} on ${APP_NAME}`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: isVideo ? "video.other" : "website",
      siteName: APP_NAME,
    },
    twitter: {
      card: isVideo ? "player" : isImage ? "summary_large_image" : "summary",
      title,
      description,
    },
  };

  // If public/unencrypted video or image, provide direct media player embedding for Discord, Twitter, Telegram, etc.
  if (!share.password_hash && !share.encrypted && share.content) {
    if (isVideo) {
      metadata.openGraph = {
        ...metadata.openGraph,
        videos: [
          {
            url: share.content,
            secureUrl: share.content,
            type: share.file_type || "video/mp4",
            width: 1280,
            height: 720,
          },
        ],
      };
      metadata.twitter = {
        ...metadata.twitter,
        card: "player",
        players: [
          {
            playerUrl: share.content,
            streamUrl: share.content,
            width: 1280,
            height: 720,
          },
        ],
      };
    } else if (isImage) {
      metadata.openGraph = {
        ...metadata.openGraph,
        images: [{ url: share.content }],
      };
    }
  }

  return metadata;
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
