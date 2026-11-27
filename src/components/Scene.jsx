"use client";
import { useEffect, useRef } from "react";
import { swamiSay, setHeroVisible } from "./swamiBus";

// A page section. When it reaches the middle of the screen the Swami reacts
// with the given mood and line. `hero` marks the section that shows the big Swami.
export function Scene({ mood, say, vision, hero = false, as: Tag = "section", children, ...rest }) {
  const ref = useRef(null);
  const latest = useRef({ mood, say, vision });
  latest.current = { mood, say, vision };
  const active = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        active.current = entry.isIntersecting;
        if (hero) setHeroVisible(entry.isIntersecting);
        const s = latest.current;
        if (entry.isIntersecting && s.say) swamiSay(s.mood || "calm", s.say, s.vision);
      },
      { rootMargin: hero ? "0px 0px -55% 0px" : "-42% 0px -42% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (hero) setHeroVisible(false);
    };
  }, [hero]);

  // If the line changes while the section is on screen (live data arriving), say the new one.
  useEffect(() => {
    if (active.current && say) swamiSay(mood || "calm", say, vision);
  }, [mood, say, vision]);

  return <Tag ref={ref} className={`scene ${rest.className || ""}`} {...{ ...rest, className: undefined }}>{children}</Tag>;
}

let shared;
function observer() {
  if (!shared) {
    shared = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); shared.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
  }
  return shared;
}

// Fades and lifts its children in the first time they scroll into view.
export function Reveal({ delay = 0, flip = false, as: Tag = "div", className = "", style, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    observer().observe(el);
    return () => shared && shared.unobserve(el);
  }, []);
  return <Tag ref={ref} className={`reveal ${flip ? "flip" : ""} ${className}`} style={{ "--d": `${delay}ms`, ...style }} {...rest}>{children}</Tag>;
}
