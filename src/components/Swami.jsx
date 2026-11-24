"use client";
import { useEffect, useId, useRef } from "react";

// The Swami. Moods: calm, greet, gaze, reveal, think, wink.
// His eyes follow the cursor (or the scroll direction on touch screens); the
// tracking writes two CSS variables straight to the SVG, so React never re-renders.
export default function Swami({ size = 220, mood = "calm", vision = "", track = true, mandala = true, title = "The Swami" }) {
  const ref = useRef(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    if (!track) return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let lastY = window.scrollY;
    let settle;
    const set = (px, py, tilt) => {
      el.style.setProperty("--px", `${px.toFixed(2)}px`);
      el.style.setProperty("--py", `${py.toFixed(2)}px`);
      el.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
    };
    const onMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width * 0.5);
        const dy = e.clientY - (r.top + r.height * 0.42);
        const d = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, d / 160);
        set((dx / d) * 3.2 * reach, (dy / d) * 2.6 * reach, Math.max(-5, Math.min(5, dx / 90)));
      });
    };
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      if (Math.abs(dy) < 2) return;
      set(0, dy > 0 ? 2.6 : -2.2, 0);
      clearTimeout(settle);
      settle = setTimeout(() => set(0, 0, 0), 700);
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    else window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [track]);

  const u = (n) => `url(#${id}${n})`;
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);

  return (
    <svg ref={ref} className="swami" data-mood={mood} width={size} height={size * 1.125} viewBox="0 0 240 270" role="img" aria-label={title}>
      <defs>
        <radialGradient id={`${id}aura`} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#b388ff" stopOpacity=".5" /><stop offset="55%" stopColor="#ff9d4d" stopOpacity=".16" /><stop offset="100%" stopColor="#ff9d4d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}turban`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff7a3d" /><stop offset="55%" stopColor="#f6a23a" /><stop offset="100%" stopColor="#f6c453" />
        </linearGradient>
        <linearGradient id={`${id}robe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7b3fe4" /><stop offset="100%" stopColor="#3b1d7a" />
        </linearGradient>
        <radialGradient id={`${id}face`} cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#e6bf95" /><stop offset="100%" stopColor="#c2915f" />
        </radialGradient>
        <radialGradient id={`${id}ball`} cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff4ff" /><stop offset="28%" stopColor="#cdb4ff" /><stop offset="68%" stopColor="#6a3fd0" /><stop offset="100%" stopColor="#2a1466" />
        </radialGradient>
        <radialGradient id={`${id}glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d9c2ff" stopOpacity=".9" /><stop offset="45%" stopColor="#b388ff" stopOpacity=".35" /><stop offset="100%" stopColor="#b388ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="118" r="118" fill={u("aura")} />
      {mandala && (
        <g opacity=".55">
          <g className="mandala">
            {petals.map((a) => <ellipse key={a} cx="120" cy="22" rx="7" ry="18" fill="none" stroke="#f6c453" strokeWidth="1" transform={`rotate(${a} 120 116)`} opacity=".7" />)}
            <circle cx="120" cy="116" r="94" fill="none" stroke="#f6c453" strokeWidth=".8" strokeDasharray="2 7" />
          </g>
          <g className="mandala slow">
            {petals.filter((_, i) => i % 2 === 0).map((a) => <circle key={a} cx="120" cy="44" r="3" fill="#ff9d4d" transform={`rotate(${a + 11} 120 116)`} />)}
            <circle cx="120" cy="116" r="72" fill="none" stroke="#b388ff" strokeWidth=".8" strokeDasharray="1 5" />
          </g>
        </g>
      )}

      <g className="float">
        {/* robe */}
        <path d="M70 176 Q84 160 120 158 Q156 160 170 176 L200 262 Q120 276 40 262 Z" fill={u("robe")} />
        <path d="M120 160 L112 262 M120 160 L128 262" stroke="#f6c453" strokeWidth="1.4" opacity=".55" fill="none" />
        <path d="M92 168 Q120 190 148 168" stroke="#f6c453" strokeWidth="2" fill="none" opacity=".8" />
        <circle cx="120" cy="184" r="4" fill="#f6c453" />

        {/* head */}
        <g className="head">
          <rect x="108" y="146" width="24" height="18" rx="7" fill="#b98556" />
          <ellipse cx="120" cy="118" rx="36" ry="40" fill={u("face")} />
          <ellipse cx="84" cy="120" rx="5" ry="8" fill="#c2915f" /><ellipse cx="156" cy="120" rx="5" ry="8" fill="#c2915f" />
          <circle cx="84" cy="130" r="3" fill="#f6c453" /><circle cx="156" cy="130" r="3" fill="#f6c453" />
          {/* turban */}
          <path d="M78 100 Q74 58 120 52 Q166 58 162 100 Q142 86 120 86 Q98 86 78 100 Z" fill={u("turban")} />
          <path d="M82 96 Q100 62 150 64" stroke="#fff3c4" strokeWidth="1.6" fill="none" opacity=".55" />
          <path d="M88 100 Q118 70 158 84" stroke="#b5521c" strokeWidth="1.4" fill="none" opacity=".45" />
          <path d="M120 52 Q128 34 140 40 Q132 46 130 56 Z" fill="#f6c453" />
          <circle cx="120" cy="80" r="8" fill="#3ddbb4" stroke="#fff3c4" strokeWidth="1.5" />
          <circle cx="117.5" cy="77.5" r="2.4" fill="#fff" opacity=".85" />
          {/* eyes */}
          <ellipse cx="106" cy="116" rx="7" ry="6" fill="#fffaf0" /><ellipse cx="134" cy="116" rx="7" ry="6" fill="#fffaf0" />
          <g className="pupil">
            <circle cx="106" cy="116" r="3.8" fill="#2a1436" /><circle cx="134" cy="116" r="3.8" fill="#2a1436" />
            <circle cx="107.4" cy="114.6" r="1.2" fill="#fff" /><circle cx="135.4" cy="114.6" r="1.2" fill="#fff" />
          </g>
          <ellipse className="lid" cx="106" cy="116" rx="7.6" ry="6.6" fill="#d3a473" />
          <ellipse className="lid r" cx="134" cy="116" rx="7.6" ry="6.6" fill="#d3a473" />
          <path className="brow" d="M95 106 Q105 99 115 105" stroke="#f1ece6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path className="brow r" d="M125 105 Q135 99 145 106" stroke="#f1ece6" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M117 120 Q120 131 124 126" stroke="#a87548" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* beard, mouth, moustache */}
          <path d="M86 132 Q92 178 120 186 Q148 178 154 132 Q138 146 120 146 Q102 146 86 132 Z" fill="#f4f0ea" />
          <path d="M96 150 Q104 172 120 177 Q136 172 144 150" stroke="#d9d2c7" strokeWidth="1.6" fill="none" />
          <g className="mouth">
            <path className="m-smile" d="M111 144 Q120 151 129 144" stroke="#7a3b2a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <ellipse className="m-open" cx="120" cy="146" rx="5" ry="6" fill="#5a2018" />
            <path className="m-grin" d="M109 142 Q120 157 131 142 Z" fill="#5a2018" />
          </g>
          <path d="M120 136 Q108 130 96 140 Q108 142 120 138 Q132 142 144 140 Q132 130 120 136 Z" fill="#fffdf8" />
        </g>

        {/* arms */}
        <g className="arm l">
          <path d="M82 180 Q62 200 68 228" stroke="#6a35cf" strokeWidth="17" fill="none" strokeLinecap="round" />
          <circle cx="68" cy="231" r="8.5" fill="#d3a473" />
        </g>
        <g className="arm r">
          <path d="M158 180 Q178 200 172 228" stroke="#6a35cf" strokeWidth="17" fill="none" strokeLinecap="round" />
          <circle cx="172" cy="231" r="8.5" fill="#d3a473" />
        </g>

        {/* crystal ball */}
        <circle className="ball-glow" cx="120" cy="234" r="46" fill={u("glow")} />
        <path d="M98 258 Q120 268 142 258 L146 266 Q120 274 94 266 Z" fill="#f6c453" />
        <circle cx="120" cy="234" r="27" fill={u("ball")} stroke="#e5d4ff" strokeWidth="1.2" />
        <g className="swirl" opacity=".7">
          <path d="M104 236 Q112 216 130 224 Q140 234 126 246" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".6" />
          <path d="M110 246 Q102 232 118 224" stroke="#ffd9a0" strokeWidth="1" fill="none" opacity=".6" />
        </g>
        <ellipse cx="110" cy="222" rx="8" ry="5" fill="#fff" opacity=".55" />
        <text className="vision" x="120" y="240" textAnchor="middle" fontSize="15" fill="#fff8e6">{vision}</text>
        <g fill="#ffe7a8">
          {[[72, 196], [170, 190], [58, 244], [186, 240]].map(([x, y], i) => (
            <path key={i} className="spark" d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} />
          ))}
        </g>
      </g>
    </svg>
  );
}

export function SwamiMini({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ display: "block", flexShrink: 0 }} aria-hidden="true">
      <circle cx="30" cy="30" r="29" fill="#b388ff" opacity=".18" />
      <circle cx="30" cy="33" r="14" fill="#d9ab7c" />
      <path d="M13 28 Q12 9 30 8 Q48 9 47 28 Q38 21 30 21 Q22 21 13 28 Z" fill="#f6a23a" />
      <circle cx="30" cy="19" r="3.4" fill="#3ddbb4" stroke="#fff3c4" strokeWidth="1" />
      <circle cx="25" cy="31" r="2" fill="#2a1436" /><circle cx="35" cy="31" r="2" fill="#2a1436" />
      <path d="M19 38 Q22 50 30 52 Q38 50 41 38 Q35 43 30 43 Q25 43 19 38 Z" fill="#f4f0ea" />
    </svg>
  );
}
