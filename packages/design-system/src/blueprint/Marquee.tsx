import { useEffect, useRef, useState, type ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  duration?: number; // ms
  className?: string;
  pauseOffscreen?: boolean;
}

/**
 * Marquee — Firecrawl double-track marquee engine.
 * Measures scrollWidth/2 after mount + ResizeObserver, animates linearly.
 * Pauses off-screen via IntersectionObserver when pauseOffscreen is true.
 */
export function Marquee({
  children,
  reverse = false,
  duration = 80_000,
  className,
  pauseOffscreen = true,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(0);
  const [active, setActive] = useState(!pauseOffscreen);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const measure = () => {
      const total = el.scrollWidth / 2;
      setW(total);
    };

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => requestAnimationFrame(measure));
    });
    ro.observe(el);
    requestAnimationFrame(() => requestAnimationFrame(measure));

    return () => ro.disconnect();
  }, [children]);

  useEffect(() => {
    if (!pauseOffscreen || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { threshold: 0.01 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pauseOffscreen]);

  return (
    <div
      ref={ref}
      className={`flex w-max transform-gpu will-change-transform ${className ?? ""}`}
      style={{
        animationPlayState: active ? "running" : "paused",
      }}
    >
      <div
        className="flex"
        style={{
          animation: w
            ? `pcl-marquee ${duration / 1000}s linear infinite`
            : undefined,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: active ? "running" : "paused",
        }}
      >
        {children}
      </div>
      <div
        className="flex"
        aria-hidden="true"
        style={{
          animation: w
            ? `pcl-marquee ${duration / 1000}s linear infinite`
            : undefined,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: active ? "running" : "paused",
        }}
      >
        {children}
      </div>
    </div>
  );
}