import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
}

interface FeatureTabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
  size?: "default" | "large";
}

/**
 * FeatureTabs — sliding-pill tab nav (Firecrawl Search/Scrape/Interact).
 * Spring (200/23) on the pill position; mobile scrollable.
 */
export function FeatureTabs({
  tabs,
  active,
  onChange,
  className,
  size = "default",
}: FeatureTabsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (!containerRef.current || !pillRef.current) return;
    const container = containerRef.current;
    const pill = pillRef.current;
    const activeEl = container.querySelector<HTMLButtonElement>(
      `[data-tab-id="${active}"]`,
    );
    if (!activeEl) return;

    const offset = activeEl.offsetLeft + 12;
    const width = activeEl.offsetWidth - 24;

    // Cancel any in-flight animation before starting a new one.
    animRef.current?.cancel();
    animRef.current = pill.animate(
      [
        { transform: `translateX(${offset}px)`, width: `${width}px` },
      ],
      { duration: 280, fill: "forwards" },
    );
  }, [active, tabs]);

  return (
    <div
      ref={containerRef}
      className={`relative flex ${
        size === "large" ? "gap-0" : "gap-2"
      } overflow-x-auto hide-scrollbar lg:gap-3 ${
        size === "large" ? "p-0" : "py-8 lg:py-12 px-12 lg:px-12"
      } -my-8 ${className ?? ""}`}
    >
      <div
        ref={pillRef}
        className={`absolute ${
          size === "large" ? "inset-y-0" : "inset-y-8 lg:inset-y-12"
        } left-0 bg-white-alpha-72 backdrop-blur-4 rounded-12 lg:rounded-20 shadow-lg pointer-events-none`}
        style={{ width: 0 }}
        aria-hidden
      />
      {tabs.map((t) => (
        <button
          key={t.id}
          data-tab-id={t.id}
          onClick={() => onChange(t.id)}
          className={`relative z-[1] flex-shrink-0 flex items-center gap-2 lg:flex-col lg:items-start lg:gap-2 lg:w-full lg:p-16 p-8 rounded-12 transition-all duration-150 active:scale-[0.98] ${
            active === t.id ? "text-accent-black" : "text-black-alpha-48 hover:text-black-alpha-72"
          }`}
        >
          {t.icon && <span className="lg:size-7 size-5 grayscale-0">{t.icon}</span>}
          <span className="text-label-large">{t.label}</span>
          {t.description && (
            <span className="hidden lg:block text-body-medium text-black-alpha-72 mt-1 max-w-[230px]">
              {t.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface PillTabsProps {
  tabs: { id: string; label: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * PillTabs — smaller pill-shaped tabs (lang switcher, endpoint switcher).
 * Same WAAPI spring physics.
 */
export function PillTabs({ tabs, active, onChange, className }: PillTabsProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (!ref.current || !pillRef.current) return;
    const activeEl = ref.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${active}"]`,
    );
    if (!activeEl) return;
    animRef.current?.cancel();
    animRef.current = pillRef.current.animate(
      [
        {
          transform: `translateX(${activeEl.offsetLeft + 8}px)`,
          width: `${activeEl.offsetWidth - 16}px`,
        },
      ],
      { duration: 280, fill: "forwards" },
    );
  }, [active]);

  return (
    <div ref={ref} className={`relative flex p-2 bg-black-alpha-4 rounded-10 ${className ?? ""}`}>
      <div
        ref={pillRef}
        className="absolute top-2 left-0 h-[calc(100%-16px)] bg-surface rounded-8 shadow-sm transition-transform"
        style={{ width: 0 }}
        aria-hidden
      />
      {tabs.map((t) => (
        <button
          key={t.id}
          data-tab-id={t.id}
          onClick={() => onChange(t.id)}
          className={`relative z-[1] px-6 py-2 text-label-small transition-colors ${
            active === t.id ? "text-accent-black" : "text-black-alpha-64 hover:text-black-alpha-88"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}