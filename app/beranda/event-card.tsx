"use client";

import Link from "next/link";
import {
  Archive,
  ArrowRight,
  Calendar,
  Copy,
  Eye,
  Link2,
  Lock,
  MoreHorizontal,
  Palette,
  Trash2,
  Users,
} from "lucide-react";
import type { EventItem } from "@/lib/data/events";
import { STATUS_META } from "./data";

interface Props {
  event: EventItem;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onCopyLink: () => void;
  onPreview: () => void;
  onDuplicate: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}

const menuItem =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink hover:bg-brand-50";

export default function EventCard({
  event: evt,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onCopyLink,
  onPreview,
  onDuplicate,
  onToggleArchive,
  onDelete,
}: Props) {
  const meta = STATUS_META[evt.status];
  const dark = evt.theme.dark;
  const isDraft = evt.status === "draf";
  const pct = evt.target ? Math.round((evt.confirmed / evt.target) * 100) : 0;
  const href = `/acara/${evt.slug}`;

  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-white transition hover:border-brand-200 hover:shadow-[0_12px_32px_-12px_rgba(42,27,69,0.18)]">
      {/* Cover */}
      <div
        className={`relative h-28 rounded-t-2xl bg-linear-to-br ${evt.theme.hero}`}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-t-2xl opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, rgba(255,255,255,.7), transparent 45%)",
          }}
        />
        <span
          className={`absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${meta.badge}`}
        >
          <span className={`size-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>

        <div className="absolute right-3 top-3">
          <button
            type="button"
            aria-label="Menu acara"
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
            className="grid size-8 place-items-center rounded-lg bg-white/80 text-ink-soft ring-1 ring-black/5 backdrop-blur transition hover:bg-white hover:text-ink"
          >
            <MoreHorizontal className="size-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={onCloseMenu} />
              <div className="absolute right-0 top-10 z-30 w-60 rounded-xl border border-line bg-white p-1.5 shadow-xl">
                <Link href={`${href}/edit`} className={menuItem}>
                  <Palette className="size-4 text-brand-600" />
                  Edit desain undangan
                </Link>
                <button type="button" onClick={onCopyLink} className={menuItem}>
                  <Link2 className="size-4 text-brand-600" />
                  Salin tautan undangan
                </button>
                <button type="button" onClick={onPreview} className={menuItem}>
                  <Eye className="size-4 text-brand-600" />
                  Pratinjau tampilan tamu
                </button>
                <button type="button" onClick={onDuplicate} className={menuItem}>
                  <Copy className="size-4 text-brand-600" />
                  Duplikat acara
                </button>
                <div className="my-1 border-t border-line" />
                <button
                  type="button"
                  onClick={onToggleArchive}
                  className={`${menuItem} text-ink-soft`}
                >
                  <Archive className="size-4" />
                  {evt.status === "diarsipkan"
                    ? "Pulihkan dari arsip"
                    : "Arsipkan acara"}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className={`${menuItem} text-rose-600 hover:bg-rose-50`}
                >
                  <Trash2 className="size-4" />
                  Hapus acara
                </button>
              </div>
            </>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-3.5">
          <p
            className={`font-serif text-lg font-semibold leading-tight ${
              dark ? "text-amber-100" : "text-ink"
            }`}
          >
            {evt.theme.name}
          </p>
          <p
            className={`text-[11px] ${dark ? "text-slate-300" : "text-ink-soft"}`}
          >
            {evt.theme.description}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-snug text-ink">
          <Link href={href} className="hover:text-brand-700">
            {evt.title}
          </Link>
        </h3>

        <dl className="mt-2.5 space-y-1.5 text-[13px] text-ink-soft">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 shrink-0 text-ink-mute" />
            <dd>{evt.dateFormatted}</dd>
          </div>
          <div className="flex items-center gap-2">
            {isDraft ? (
              <Lock className="size-3.5 shrink-0 text-ink-mute" />
            ) : (
              <Link2 className="size-3.5 shrink-0 text-ink-mute" />
            )}
            <dd className="truncate">
              {isDraft ? "Belum dipublikasikan" : `/e/${evt.slug}`}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-ink-soft">
              <Users className="size-3.5 text-ink-mute" />
              {isDraft ? "Target tamu" : "Kehadiran"}
            </span>
            <span className="font-semibold text-ink">
              {isDraft ? (
                `${evt.target} tamu`
              ) : (
                <>
                  {evt.confirmed}
                  <span className="font-medium text-ink-mute">
                    {" "}
                    / {evt.target}
                  </span>
                </>
              )}
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-50"
            role="progressbar"
            aria-valuenow={isDraft ? 0 : pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full ${meta.bar}`}
              style={{ width: `${isDraft ? 0 : pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-ink-mute">
            {isDraft
              ? evt.stepInfo
              : evt.status === "diarsipkan"
                ? evt.archiveNote
                : `${pct}% dari target tamu`}
          </p>
        </div>

        <Link
          href={href}
          className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line text-[13px] font-semibold text-brand-700 transition hover:border-brand-200 hover:bg-brand-50 group-hover:border-brand-200"
        >
          {meta.action}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}
