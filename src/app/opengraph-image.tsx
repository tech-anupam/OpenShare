import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OpenShare - Anonymous Encrypted Sharing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050505 0%, #0c1222 50%, #030712 100%)",
          fontFamily: "sans-serif",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* Glow ambient circle */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "110px",
            height: "110px",
            borderRadius: "32px",
            background: "linear-gradient(135deg, #38bdf8 0%, #3b82f6 45%, #6366f1 100%)",
            boxShadow: "0 20px 50px -10px rgba(59, 130, 246, 0.5)",
            marginBottom: "36px",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Brand Name */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            marginBottom: "16px",
            color: "#ffffff",
          }}
        >
          OpenShare
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            letterSpacing: "-0.01em",
            maxWidth: "750px",
            textAlign: "center",
          }}
        >
          Anonymous file and paste sharing with client-side encryption
        </div>

        {/* Tech tags */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginTop: "38px",
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#60a5fa",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            AES-256 Encrypted
          </div>
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Self Destructing
          </div>
          <div
            style={{
              padding: "8px 20px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Zero Logs
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
