interface Blob {
  size: number;
  top: string;
  left: string;
  color: string;
  animation: string;
}

// Radial gradients instead of blurred divs: same look, no expensive blur filter.
const BLOBS: Blob[] = [
  { size: 900, top: "20%", left: "70%", color: "rgba(0, 90, 45, 0.5)", animation: "animate-aurora-1" },
  { size: 760, top: "75%", left: "15%", color: "rgba(0, 60, 70, 0.4)", animation: "animate-aurora-2" },
  { size: 620, top: "45%", left: "40%", color: "rgba(0, 110, 55, 0.3)", animation: "animate-aurora-3" },
];

export default function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-void">
      {BLOBS.map(({ size, top, left, color, animation }) => (
        <div
          key={animation}
          className={`absolute rounded-full will-change-transform ${animation}`}
          style={{
            width: size,
            height: size,
            top,
            left,
            marginTop: -size / 2,
            marginLeft: -size / 2,
            background: `radial-gradient(circle at center, ${color} 0%, transparent 65%)`,
          }}
        />
      ))}
    </div>
  );
}
