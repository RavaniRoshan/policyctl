import type { CSSProperties } from "react";

export type CurvyRectSides =
  | "allSides"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "bottomRight"
  | "topRight"
  | "topLeft";

interface CurvyRectProps {
  sides?: CurvyRectSides;
  className?: string;
  color?: string;
  thickness?: number;
}

/**
 * CurvyRect — the signature Firecrawl corner brackets.
 * 4 SVG corner paths, 11×11 each. No box, just brackets.
 */
export function CurvyRect({
  sides = "allSides",
  className,
  color = "var(--border-faint)",
  thickness = 1,
}: CurvyRectProps) {
  const base: CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    contain: "layout paint",
  };

  const corner = (corner: "tl" | "tr" | "bl" | "br", rotate: number) => (
    <svg
      key={corner}
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      style={{
        ...base,
        top: corner.startsWith("b") ? "auto" : -1,
        bottom: corner.startsWith("b") ? -1 : "auto",
        left: corner.endsWith("l") ? -1 : "auto",
        right: corner.endsWith("r") ? -1 : "auto",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <path
        d="M11 1L11 11L10 11L10 7C10 3.68629 7.31371 1 4 1L0 1L0 0L11 0L11 1Z"
        fill={color}
        stroke={color}
        strokeWidth={thickness}
      />
    </svg>
  );

  const corners: Record<string, [string, number][]> = {
    allSides: [
      ["tl", 0],
      ["tr", 90],
      ["br", 180],
      ["bl", 270],
    ],
    top: [
      ["tl", 0],
      ["tr", 90],
    ],
    bottom: [
      ["bl", 270],
      ["br", 180],
    ],
    left: [
      ["tl", 0],
      ["bl", 270],
    ],
    right: [
      ["tr", 90],
      ["br", 180],
    ],
    bottomRight: [["br", 180]],
    topRight: [["tr", 90]],
    topLeft: [["tl", 0]],
  };

  return (
    <div
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", contain: "layout paint" }}
    >
      {corners[sides].map(([c, r]) => corner(c as "tl", r))}
    </div>
  );
}

export const ConnectorCross = ({ className }: { className?: string }) => (
  <svg
    width="22"
    height="21"
    viewBox="0 0 22 21"
    fill="none"
    className={className}
    style={{ contain: "layout paint" }}
  >
    <path
      d="M10.5 4C10.5 7.31371 7.81371 10 4.5 10H0.5V11H4.5C7.81371 11 10.5 13.6863 10.5 17V21H11.5V17C11.5 13.6863 14.1863 11 17.5 11H21.5V10H17.5C14.1863 10 11.5 7.31371 11.5 4V0H10.5V4Z"
      fill="var(--border-faint)"
    />
  </svg>
);