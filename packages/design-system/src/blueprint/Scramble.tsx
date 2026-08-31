import { useEffect, useRef, useState } from "react";

interface ScrambleProps {
  text: string;
  randomizeChance?: number;
  speed?: number; // ms per tick
  className?: string;
}

const POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*=?!".split("");

function randomChar() {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

/**
 * Scramble — Firecrawl-style glyph scramble-decoder.
 * Ticks every `speed`ms; each character is preserved with probability (1 - randomizeChance),
 * otherwise replaced by a glyph from the pool.
 */
export function Scramble({
  text,
  randomizeChance = 0.7,
  speed = 60,
  className,
}: ScrambleProps) {
  const [out, setOut] = useState(text.replace(/[A-Za-z0-9]/g, () => randomChar()));
  const ref = useRef<HTMLSpanElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let progress = 0;
    const id = setInterval(() => {
      progress = Math.min(1, progress + 0.2);
      setOut(
        text
          .split("")
          .map((c) => {
            if (c === " " || c === "[" || c === "]" || c === ".") return c;
            if (Math.random() < 1 - randomizeChance * (1 - progress)) return c;
            return randomChar();
          })
          .join(""),
      );
      if (progress >= 1) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, randomizeChance, speed, active]);

  return (
    <span ref={ref} className={className}>
      {out}
    </span>
  );
}