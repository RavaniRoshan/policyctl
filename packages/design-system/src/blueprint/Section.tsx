import type { ReactNode } from "react";
import { CurvyRect } from "./CurvyRect";

interface SectionProps {
  index: number;
  total: number;
  label?: string;
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  compact?: boolean;
  children?: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Section — Firecrawl blueprint section header pattern.
 * Wraps content with CurvyRect + bottom hairline.
 */
export function Section({
  index,
  total,
  label,
  badge,
  title,
  subtitle,
  compact,
  children,
  className,
  id,
}: SectionProps) {
  const idx = String(index).padStart(2, "0");
  const tot = String(total).padStart(2, "0");

  return (
    <section id={id} className={`pcl-section ${compact ? "pcl-section--compact" : ""} ${className ?? ""}`}>
      <CurvyRect sides="allSides" />
      <div className="absolute bottom-0 left-0 h-1 w-screen left-[calc(50%-50vw)] bg-border-faint pointer-events-none" />

      <div className="pcl-section__head">
        {badge && (
          <div className="flex justify-center">
            <span className="pcl-section__badge">{badge}</span>
          </div>
        )}
        <h2 className="pcl-section__title">{title}</h2>
        {subtitle && <div className="pcl-section__subtitle">{subtitle}</div>}
      </div>

      {children}

      <div className="pcl-index-strip">
        <div className="pcl-index-strip__cell">
          <span className="pcl-index-strip__tick" />
          <span className="pcl-index-strip__num">[{idx}</span>
          <span className="pcl-index-strip__sep">/</span>
          <span className="pcl-index-strip__num">{tot}]</span>
          {label && (
            <>
              <span className="pcl-index-strip__sep">·</span>
              <span className="pcl-index-strip__label">{label}</span>
            </>
          )}
        </div>
        <div className="pcl-index-strip__cell" />
      </div>
    </section>
  );
}

/**
 * IndexStrip — the section index row, usable standalone (e.g. between sections).
 */
export function IndexStrip({
  index,
  total,
  label,
}: {
  index: number;
  total: number;
  label: string;
}) {
  const idx = String(index).padStart(2, "0");
  const tot = String(total).padStart(2, "0");
  return (
    <div className="pcl-index-strip">
      <div className="pcl-index-strip__cell">
        <span className="pcl-index-strip__tick" />
        <span className="pcl-index-strip__num">[{idx}</span>
        <span className="pcl-index-strip__sep">/</span>
        <span className="pcl-index-strip__num">{tot}]</span>
        <span className="pcl-index-strip__sep">·</span>
        <span className="pcl-index-strip__label">{label}</span>
      </div>
      <div className="pcl-index-strip__cell" />
    </div>
  );
}

export const FooterStrip = ({ className }: { className?: string }) => (
  <div className={`pcl-index-strip pl-5 lg:pl-10 ${className ?? ""}`}>
    <div className="pcl-index-strip__cell">
      <span className="pcl-index-strip__label">FOOTER</span>
    </div>
    <div className="pcl-index-strip__cell" />
  </div>
);