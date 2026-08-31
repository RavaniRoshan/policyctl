import { useEffect, useRef, useState } from "react";

interface AsciiCanvasProps {
  frames: string[][];
  interval?: number; // ms per frame
  className?: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  fontFamily?: string;
  ariaLabel?: string;
}

/**
 * AsciiCanvas — animated ASCII art on a Roboto Mono canvas.
 * Visibility-gated; pauses off-screen.
 */
export function AsciiCanvas({
  frames,
  interval = 80,
  className,
  fontSize = 10,
  lineHeight = 12.5,
  color = "rgba(0, 0, 0, 0.2)",
  fontFamily = "'Roboto Mono', monospace",
  ariaLabel,
}: AsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current || frames.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = (f: number) => {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = widthApprox * dpr;
      const h = heightApprox * dpr;
      // Resize the canvas buffer to match the display size × dPR.
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${fontSize * dpr}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = "top";
      const lines = frames[f % frames.length];
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, i * lineHeight * dpr);
      });
    };

    drawFrame(0);
    const id = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % frames.length;
      drawFrame(frameRef.current);
    }, interval);
    return () => clearInterval(id);
  }, [active, frames, interval, fontSize, lineHeight, color, fontFamily]);

  if (frames.length === 0) return null;

  // Compute intrinsic dimensions from first frame
  const maxLine = frames[0].reduce((m, l) => Math.max(m, l.length), 0);
  const widthApprox = maxLine * (fontSize * 0.6);
  const heightApprox = frames[0].length * lineHeight;

  return (
    <div ref={wrapperRef} className={className} aria-hidden={!ariaLabel} aria-label={ariaLabel}>
      <canvas
        ref={canvasRef}
        style={{ width: widthApprox, height: heightApprox, pointerEvents: "none" }}
      />
    </div>
  );
}