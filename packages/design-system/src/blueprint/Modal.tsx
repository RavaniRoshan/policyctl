import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CurvyRect } from "./CurvyRect";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function useFocusTrap(open: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const el = containerRef.current;
    if (!el) return;

    const focusables = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (focusables.length) focusables[0].focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const items = el.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    el.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  return containerRef;
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: "right" | "left";
  width?: number;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  side = "right",
  width = 480,
}: SheetProps) {
  const containerRef = useFocusTrap(open, onClose);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black-alpha-40 z-[2000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
            onClick={onClose}
          />
          <motion.aside
            ref={containerRef}
            tabIndex={-1}
            className={`fixed top-0 bottom-0 ${
              side === "right" ? "right-0" : "left-0"
            } bg-background-base z-[2001] flex flex-col`}
            style={{ width: "min(100%, 480px)" }}
            initial={{ x: side === "right" ? width : -width }}
            animate={{ x: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
            exit={{
              x: side === "right" ? width : -width,
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            <CurvyRect sides={side === "right" ? "left" : "right"} color="var(--border-faint)" />
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-border-faint">
                <h3 className="text-title-h5 text-accent-black">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-black-alpha-48 hover:text-accent-black size-8 rounded-8 hover:bg-black-alpha-4"
                  aria-label="Close panel"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, children, maxWidth = 480 }: ModalProps) {
  const containerRef = useFocusTrap(open, onClose);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black-alpha-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.2, delay: 0.1 } }}
            onClick={onClose}
          />
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            className="relative bg-surface rounded-20 border border-border-faint shadow-lg max-h-[90vh] overflow-y-auto"
            style={{ maxWidth, width: "100%" }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.15 } }}
          >
            <CurvyRect sides="allSides" />
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-border-faint">
                <h3 className="text-title-h5 text-accent-black">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-black-alpha-48 hover:text-accent-black size-8 rounded-8 hover:bg-black-alpha-4"
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}