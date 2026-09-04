import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface TypewriterProps {
  targets: string[];
  speed?: number; // ms per char when typing
  deleteSpeed?: number; // ms per char when deleting
  hold?: number; // ms to hold full text before deleting
  className?: string;
}

/**
 * Typewriter — cycles through placeholder strings.
 * Type → hold → delete → next.
 */
export function Typewriter({
  targets,
  speed = 55,
  deleteSpeed = 28,
  hold = 1400,
  className,
}: TypewriterProps) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  // Respect reduced-motion: render the first target statically.
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <span className={className}>{targets[0] ?? ""}</span>;
  }

  useEffect(() => {
    if (!targets.length || !targets[i]) return;
    const target = targets[i];

    if (typing) {
      if (text.length < target.length) {
        const id = setTimeout(
          () => setText(target.slice(0, text.length + 1)),
          speed,
        );
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setTyping(false), hold);
      return () => clearTimeout(id);
    }

    if (text.length > 0) {
      const id = setTimeout(() => setText(text.slice(0, -1)), deleteSpeed);
      return () => clearTimeout(id);
    }
    setI((i + 1) % targets.length);
    setTyping(true);
  }, [text, typing, i, targets, speed, deleteSpeed, hold]);

  return <span className={className}>{text}</span>;
}