"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Entrada suave al entrar en viewport. Jerarquía: aparece en el orden en que se lee. */
export function Reveal({
  delay = 0,
  y = 28,
  className,
  children,
  as = "div",
  ...rest
}: { delay?: number; y?: number; as?: "div" | "li" | "p" | "h2" | "span" } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** La imagen se "revela" como una copia en el cuarto oscuro: máscara de abajo hacia arriba. */
export function MaskReveal({
  className,
  children,
  delay = 0,
  from = "bottom",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right";
}) {
  const reduce = useReducedMotion();
  const hidden = { bottom: "inset(100% 0% 0% 0%)", left: "inset(0% 100% 0% 0%)", right: "inset(0% 0% 0% 100%)" }[from];
  // Se observa el contenedor sin recorte: Chrome considera el clip-path del propio elemento
  // en IntersectionObserver, y un elemento recortado al 100% nunca "entraría" en viewport.
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
    >
      <motion.div
        className="absolute inset-0"
        variants={{ hidden: { clipPath: hidden }, shown: { clipPath: "inset(0% 0% 0% 0%)" } }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Sticker gráfico arrastrable. La imperfección se puede tocar.
 * Decorativo: aria-hidden. Con reduced motion no flota, pero se puede seguir arrastrando.
 */
export function Sticker({
  children,
  at,
  className = "",
  rotate = -6,
  constraints,
  float = true,
}: {
  children: React.ReactNode;
  /** Clases de posición (absolute ya aplicado), p. ej. "right-6 top-24" */
  at: string;
  /** Clases visuales del sticker */
  className?: string;
  rotate?: number;
  constraints?: React.RefObject<HTMLElement | null>;
  float?: boolean;
}) {
  const reduce = useReducedMotion();
  const floating = float && !reduce;
  return (
    <motion.div
      aria-hidden
      className={`absolute z-10 ${at}`}
      animate={floating ? { y: [0, -9, 0] } : undefined}
      transition={floating ? { duration: 5.5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <motion.div
        data-cursor="Drag"
        drag
        dragConstraints={constraints}
        dragSnapToOrigin={!constraints}
        dragElastic={0.18}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 18 }}
        style={{ rotate }}
        whileDrag={{ scale: 1.08, rotate: rotate + 8, cursor: "grabbing" }}
        whileHover={{ scale: 1.05, rotate: rotate + 3 }}
        className={`sticker cursor-grab touch-none ${className}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** La única marquesina del home. Se pausa al pasar el cursor y con reduced motion queda fija. */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="display px-6 text-[clamp(2.2rem,6vw,5.5rem)]">{t}</span>
          <span className="mx-2 inline-block h-[0.5em] w-[0.5em] rotate-45 bg-sunburn text-[clamp(2.2rem,6vw,5.5rem)]" aria-hidden />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <p className="sr-only">{items.join(". ")}</p>
      <div className="marquee-track flex w-max" aria-hidden>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
