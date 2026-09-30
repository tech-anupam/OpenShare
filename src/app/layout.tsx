import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import { ThemeProvider } from "@/hooks/use-theme";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SplashScreen } from "@/components/splash-screen";
import { WebGLBackground } from "@/components/webgl-background";
import { ToastProvider } from "@/components/toast";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://opensharee.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OpenShare",
    template: "%s | OpenShare",
  },
  description: "Anonymous file and paste sharing with client-side encryption",
  openGraph: {
    title: "OpenShare",
    description: "Anonymous file and paste sharing with client-side encryption",
    siteName: "OpenShare",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenShare",
    description: "Anonymous file and paste sharing with client-side encryption",
  },
  icons: {
    icon: "/icon",
    apple: "/icon",
  },
};

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "ypvctmfjct";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
        <ThemeProvider>
          <ToastProvider>
            <SplashScreen />
            <WebGLBackground />
            <Navbar />
            <main className="relative z-10 pt-20 pb-12 px-4 mx-auto max-w-2xl min-h-screen">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
