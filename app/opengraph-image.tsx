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
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "#8B2635" }} />

        {/* Compass icon — SVG rendered inline */}
        <svg width="120" height="120" viewBox="0 0 86 86" fill="none">
          <circle cx="43" cy="43" r="38" stroke="#8B2635" strokeWidth="1.5" />
          <circle cx="43" cy="43" r="32" stroke="#C4A44A" strokeWidth="0.65" strokeDasharray="2.5 4" />
          <line x1="43" y1="6" x2="43" y2="13.5" stroke="#8B2635" strokeWidth="2.25" />
          <line x1="43" y1="72.5" x2="43" y2="80" stroke="#8B2635" strokeWidth="1.5" />
          <line x1="6" y1="43" x2="13.5" y2="43" stroke="#8B2635" strokeWidth="1.5" />
          <line x1="72.5" y1="43" x2="80" y2="43" stroke="#8B2635" strokeWidth="1.5" />
          <polygon points="43,12 39,43 43,36.5 47,43" fill="#8B2635" />
          <polygon points="43,74 39,43 43,49.5 47,43" fill="#cdc2a0" />
          <circle cx="43" cy="43" r="5" fill="#8B2635" />
          <circle cx="43" cy="43" r="2.2" fill="#C4A44A" />
        </svg>

        {/* LIFE wordmark */}
        <div style={{ color: "#C4A44A", fontSize: 18, letterSpacing: 12, marginTop: 24, marginBottom: 4 }}>
          LIFE
        </div>

        {/* Sentinel wordmark */}
        <div style={{ color: "#8B2635", fontSize: 72, fontWeight: 700, letterSpacing: 1, lineHeight: 1 }}>
          Sentinel
        </div>

        {/* Divider */}
        <div style={{ width: 60, height: 1, background: "#C4A44A", margin: "28px 0" }} />

        {/* Tagline */}
        <div style={{ color: "#57534e", fontSize: 24, letterSpacing: 0.5, textAlign: "center", maxWidth: 600 }}>
          Prepared for life. Ready for whatever comes next.
        </div>

        {/* Bottom URL */}
        <div style={{ position: "absolute", bottom: 36, color: "#a8a29e", fontSize: 16, letterSpacing: 2 }}>
          lifesentinelfamily.com
        </div>

        {/* Bottom border accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "#8B2635" }} />
      </div>
    ),
    { ...size }
  );
}
