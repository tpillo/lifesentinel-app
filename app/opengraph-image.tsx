import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Life Sentinel — Prepared for life. Ready for whatever comes next.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#faf8f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Top border accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "#8B2635", display: "flex" }} />

        {/* Compass — CSS circles */}
        <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute", width: 110, height: 110, borderRadius: "50%",
            border: "2px solid #8B2635", display: "flex",
          }} />
          {/* Inner ring */}
          <div style={{
            position: "absolute", width: 90, height: 90, borderRadius: "50%",
            border: "1px solid #C4A44A", display: "flex",
          }} />
          {/* North needle */}
          <div style={{
            position: "absolute", top: 14, left: "50%",
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderBottom: "28px solid #8B2635",
            transform: "translateX(-50%)",
            display: "flex",
          }} />
          {/* South needle */}
          <div style={{
            position: "absolute", bottom: 14, left: "50%",
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "28px solid #cdc2a0",
            transform: "translateX(-50%)",
            display: "flex",
          }} />
          {/* Center dot */}
          <div style={{
            width: 14, height: 14, borderRadius: "50%",
            background: "#8B2635", display: "flex",
          }} />
        </div>

        {/* LIFE wordmark */}
        <div style={{ color: "#C4A44A", fontSize: 18, letterSpacing: 12, marginTop: 28, marginBottom: 2, display: "flex" }}>
          LIFE
        </div>

        {/* Sentinel wordmark */}
        <div style={{ color: "#8B2635", fontSize: 78, fontWeight: 700, letterSpacing: 1, lineHeight: 1, display: "flex" }}>
          Sentinel
        </div>

        {/* Divider */}
        <div style={{ width: 60, height: 1, background: "#C4A44A", margin: "28px 0", display: "flex" }} />

        {/* Tagline */}
        <div style={{ color: "#57534e", fontSize: 26, letterSpacing: 0.5, textAlign: "center", maxWidth: 600, display: "flex" }}>
          Prepared for life. Ready for whatever comes next.
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: 36, color: "#a8a29e", fontSize: 16, letterSpacing: 2, display: "flex" }}>
          lifesentinelfamily.com
        </div>

        {/* Bottom border accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#8B2635", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
