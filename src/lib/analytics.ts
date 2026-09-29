export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | object,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export function pageview(url: string) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("config", GA_ID, {
    page_path: url,
  });
}

export function event(action: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", action, params);
}

export function trackShareCreated(type: "file" | "paste", isEncrypted: boolean) {
  event("share_created", {
    content_type: type,
    is_encrypted: isEncrypted,
  });
}

export function trackDownload(fileName: string) {
  event("file_download", {
    file_name: fileName,
  });
}
