// PARTICLES — effetti atmosferici per piano
import { FLOOR_PARTICLE, _pData } from "../data/assets";

export default function Particles({ floor }) {
  const fp = FLOOR_PARTICLE[floor] || FLOOR_PARTICLE[1];
  const pts = _pData[floor] || _pData[1];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, overflow: "hidden" }}>
      {pts.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: fp.colors[p.id % fp.colors.length],
            animationName: `ptcl_${fp.type}`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            filter: `blur(${fp.type === "steam" ? 4 : fp.type === "stars" ? 0 : 1}px)`,
            "--pd": `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
