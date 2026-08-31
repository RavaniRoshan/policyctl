import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  duration?: number; // ms
  className?: string;
  pauseOffscreen?: boolean;
}

/**
 * Marquee — smooth infinite scroll using Framer Motion.
 * Renders the children twice for seamless looping.
 */
export function Marquee({
  children,
  reverse = false,
  duration = 80_000,
  className,
  pauseOffscreen = true,
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [active, setActive] = useState(!pauseOffscreen);

  // Measure the width of one track (half of the total container).
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const measure = () => {
      setTrackWidth(el.scrollWidth / 2);
    };

    measure();
    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  // Pause when off-screen.
  useEffect(() => {
    if (!pauseOffscreen || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [pauseOffscreen]);

  const xFrom = reverse ? -trackWidth : 0;
  const xTo = reverse ? 0 : -trackWidth;

  return (
    <div
      ref={ref}
      className={`flex w-max overflow-hidden ${className ?? ""}`}
    >
      <motion.div
        className="flex shrink-0"
        animate={active ? { x: [xFrom, xTo] } : { x: xFrom }}
        transition={{
          x: {
            duration: duration / 1000,
            repeat: active ? Infinity : 0,
            ease: "linear",
            repeatType: "loop",
          },
        }}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex shrink-0"
        aria-hidden="true"
        animate={active ? { x: [xFrom, xTo] } : { x: xFrom }}
        transition={{
          x: {
            duration: duration / 1000,
            repeat: active ? Infinity : 0,
            ease: "linear",
            repeatType: "loop",
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}