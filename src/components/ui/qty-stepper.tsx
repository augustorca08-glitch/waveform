"use client";

import { Minus, Plus } from "@phosphor-icons/react";

export function QtyStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-11" : "h-12";
  const btn = `grid ${size === "sm" ? "w-10" : "w-12"} place-items-center rounded-full transition-colors hover:bg-ink/[0.07] disabled:opacity-30 disabled:hover:bg-transparent`;
  return (
    <div role="group" aria-label={label} className={`inline-flex ${h} items-stretch rounded-full shadow-[inset_0_0_0_1.5px_var(--color-line)]`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Restar uno">
        <Minus size={14} weight="bold" aria-hidden />
      </button>
      <output className="mono grid min-w-8 place-items-center text-sm font-semibold" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Sumar uno">
        <Plus size={14} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
