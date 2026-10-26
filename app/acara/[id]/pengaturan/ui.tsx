import type { ReactNode } from "react";

export const field =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-mute focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
export const btnGhost =
  "h-10 rounded-xl px-4 text-[13px] font-semibold text-ink-soft hover:bg-brand-50";
export const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700";
export const btnOutline =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50";

export function Section({
  title,
  desc,
  action,
  tone,
  children,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  tone?: "danger";
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border bg-white p-6 ${
        tone === "danger" ? "border-rose-200" : "border-line"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className={`text-[15px] font-bold ${tone === "danger" ? "text-rose-700" : ""}`}
          >
            {title}
          </h2>
          {desc && <p className="mt-0.5 max-w-xl text-[13px] text-ink-soft">{desc}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold">
        {children}
      </label>
      {hint && <span className="text-xs text-ink-mute">{hint}</span>}
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  min,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  label: string;
}) {
  const b =
    "grid size-9 place-items-center rounded-lg border border-line bg-white text-lg font-semibold text-ink transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-white";
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Kurangi ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={b}
      >
        −
      </button>
      <span className="min-w-10 text-center text-lg font-extrabold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Tambah ${label}`}
        onClick={() => onChange(value + 1)}
        className={b}
      >
        +
      </button>
    </div>
  );
}
