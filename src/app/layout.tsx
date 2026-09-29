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

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        )}
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
