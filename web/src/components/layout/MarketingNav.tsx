import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { List, X, ArrowRight, SquaresFour, ShieldCheck, ChartBar, Gear, Sparkle, Scroll } from "@phosphor-icons/react";
import { NotchNav, type NotchItemData } from "@/components/ui/adaptive-notch-navigation-bar";

const GITHUB = "https://github.com/RavaniRoshan/policyctl";

const NAV_ITEMS: NotchItemData[] = [
  { id: "docs", label: "Docs", icon: Scroll },
  { id: "features", label: "Features", icon: Sparkle },
  { id: "pricing", label: "Pricing", icon: ChartBar },
];

export function MarketingNav() {
  const location = useLocation();
  const [activeId, setActiveId] = useState("docs");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && NAV_ITEMS.some((item) => item.id === hash)) {
      setActiveId(hash);
    }
  }, [location]);

  const scrollToAnchor = (id: string) => {
    const el = document.querySelector(`#${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const LogoSlot = (
    <div className="flex items-center gap-2 h-8.5">
      <div className="flex size-7 items-center justify-center rounded-lg bg-heat-100">
        <FlameMark className="size-4 text-accent-white" />
      </div>
      <span className="hidden sm:inline text-xs sm:text-sm font-bold tracking-tight">
        policyctl
      </span>
    </div>
  );

  const RightContentSlot = (
    <div className="flex items-center gap-2 h-8.5">
      <Link
        to="/login"
        className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-black-alpha-72 hover:text-accent-black outline-none"
      >
        Sign in
      </Link>
      <Link
        to="/signup"
        className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-accent-black text-accent-white text-xs font-medium hover:bg-black-alpha-88 active:scale-[0.98] transition-all duration-200"
      >
        Get started
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );

  return (
    <NotchNav
      items={NAV_ITEMS}
      activeId={activeId}
      logo={LogoSlot}
      rightContent={RightContentSlot}
      showLogo={true}
      showRightContent={true}
      onActiveChange={(id) => {
        setActiveId(id);
        if (id === "features" || id === "pricing") {
          scrollToAnchor(id);
        }
      }}
    >
      <div className="flex w-full items-center justify-center">
        {/* Content is rendered by the page */}
      </div>
    </NotchNav>
  );
}

function FlameMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" fill="none" className={className} aria-hidden>
      <path
        d="M300 80c-50 70-90 110-90 200 0 100 80 200 90 220 10-20 90-120 90-220 0-90-40-130-90-200z"
        fill="currentColor"
      />
    </svg>
  );
}