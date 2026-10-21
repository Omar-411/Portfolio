import { ImageResponse } from "next/og";

export const alt = "Omar Ajimi — Full-Stack & Blockchain Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(circle at 80% 20%, #0a3a20 0%, #020b06 60%)",
          color: "#f0fff4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#00c87a" }}>{"> PORTFOLIO"}</div>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 800, marginTop: 24, lineHeight: 1 }}>OMAR</div>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 800, color: "#00ff6a", lineHeight: 1 }}>AJIMI</div>
        <div style={{ display: "flex", fontSize: 34, marginTop: 36, color: "rgba(240,255,244,0.7)" }}>
          Full-Stack · Blockchain · Web3
        </div>
      </div>
    ),
    size
  );
}
