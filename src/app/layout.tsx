import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import { ThemeProvider } from "@/hooks/use-theme";
import { Navbar } from "@/components/navbar";
import { SplashScreen } from "@/components/splash-screen";
import { WebGLBackground } from "@/components/webgl-background";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "OpenShare",
  description: "Anonymous file and paste sharing with encryption",
  icons: { icon: "/favicon.ico" },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <SplashScreen />
            <WebGLBackground />
            <Navbar />
            <main className="relative z-10 pt-20 pb-12 px-4 mx-auto max-w-2xl min-h-screen">
              {children}
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
