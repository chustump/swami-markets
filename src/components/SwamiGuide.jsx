"use client";
import { useEffect, useState } from "react";
import Swami from "./Swami";
import { subscribeSwami } from "./swamiBus";

const QUIPS = [
  "Ah, you poked the oracle. Bold.",
  "The stars say: scroll on, seeker.",
  "I see a question forming in you. Ask it.",
  "My crystal ball runs on data and a little incense.",
  "No refunds on destiny. Analysis only.",
];

// The small Swami who follows visitors down the page and comments on each section.
export default function SwamiGuide() {
  const [s, setS] = useState({ mood: "calm", text: "", heroVisible: true, vision: "" });
  const [closed, setClosed] = useState(false);
  const [quip, setQuip] = useState(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => subscribeSwami((next) => { setS(next); setQuip(null); }), []);
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < 640);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  useEffect(() => {
    if (!quip) return;
    const t = setTimeout(() => setQuip(null), 4200);
    return () => clearTimeout(t);
  }, [quip]);

  const text = quip || s.text;
  const mood = quip ? "wink" : s.mood;
  return (
    <div className={`guide ${s.heroVisible ? "" : "show"}`} aria-hidden={s.heroVisible}>
      {text && !closed && (
        <div className="bubble" key={text} role="status" aria-live="polite">
          {text}
          <button className="x" aria-label="Hide the Swami's comments" onClick={() => setClosed(true)}>✕</button>
        </div>
      )}
      <button
        className="who"
        aria-label="The Swami"
        tabIndex={s.heroVisible ? -1 : 0}
        onClick={() => { setClosed(false); setQuip(QUIPS[Math.floor(Math.random() * QUIPS.length)]); }}
      >
        <Swami size={mobile ? 74 : 104} mood={mood} vision={s.vision} mandala={false} />
      </button>
    </div>
  );
}
