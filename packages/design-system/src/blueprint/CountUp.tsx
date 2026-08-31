import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  delay?: number; // ms
  prefix?: string;
  suffix?: string;
  className?: string;
  format?: (n: number) => string;
}

/**
 * CountUp — 5s count-up with optional value/100 delay.
 * Visibility-gated via IntersectionObserver.
 */
export function CountUp({
  value,
  duration = 5000,
  delay = 0,
  prefix = "",
  suffix = "",
  className,
  format,
}: CountUpProps) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [active, setActive] = useState(false);
  const startedRef = useRef(false);

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
    if (!active || startedRef.current) return;
    startedRef.current = true;
    const ease = (t: number) =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2; // cubic-bezier(.25,.1,.25,1)-ish
    const start = performance.now() + delay;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - start);
      const t = Math.min(1, elapsed / duration);
      setN(value * ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value, duration, delay]);

  const formatted = format ? format(n) : Math.floor(n).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}