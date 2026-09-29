export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "";

declare global {
  interface Window {
    clarity?: (command: string, ...args: unknown[]) => void;
  }
}

export function trackEvent(name: string) {
  if (typeof window !== "undefined" && window.clarity) {
    window.clarity("event", name);
  }
}

export function trackShareCreated(type: "file" | "paste", isEncrypted: boolean) {
  trackEvent(`share_${type}`);
  if (isEncrypted) {
    trackEvent("share_encrypted");
  }
}

export function trackDownload(fileName: string) {
  trackEvent("file_download");
}
