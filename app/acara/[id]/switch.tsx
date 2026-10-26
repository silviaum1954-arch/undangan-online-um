"use client";

export default function Switch({
  checked,
  onChange,
  label,
  small,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 ${
        small ? "h-5 w-9" : "h-6 w-11"
      } ${checked ? "bg-brand-600" : "bg-slate-200"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 rounded-full bg-white shadow transition-transform ${
          small ? "size-4" : "size-5"
        } ${checked ? (small ? "translate-x-4" : "translate-x-5") : ""}`}
      />
    </button>
  );
}
