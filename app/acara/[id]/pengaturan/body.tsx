"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, SlidersHorizontal, User, type LucideIcon } from "lucide-react";
import EventShell from "../shell";
import { EVENT } from "../event";
import AcaraTab from "./acara-tab";
import { AkunTab, PreferensiTab } from "./other-tabs";
import { DuplicateModal, ImageModal } from "./modals";
import { DEFAULT_SETTINGS, type EventStatus, type Settings } from "./data";

type Tab = "acara" | "akun" | "preferensi";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "acara", label: "Acara ini", icon: Calendar },
  { id: "akun", label: "Akun", icon: User },
  { id: "preferensi", label: "Preferensi", icon: SlidersHorizontal },
];

export default function PengaturanAcaraPage({
  slug: routeSlug,
}: {
  slug: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("acara");
  const [saved, setSaved] = useState<Settings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<Settings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<EventStatus>("terbit");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const invalid = form.slug.length < 3;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function update(patch: Partial<Settings>) {
    setForm((p) => ({ ...p, ...patch }));
  }

  function save() {
    if (invalid) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(form);
      showToast("Pengaturan acara disimpan.");
    }, 600);
  }

  return (
    <>
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-brand-900 px-4 py-3 text-sm font-medium text-white shadow-2xl"
        >
          <Check className="size-4 shrink-0 text-emerald-400" />
          {toast}
        </div>
      )}

      <EventShell
        slug={routeSlug}
        active="pengaturan"
        eventName={EVENT.name}
        eventDate={EVENT.date}
      >
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
          Pengaturan
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Kelola tautan, siklus acara, kuota, dan preferensi akun Anda.
        </p>

        <div role="tablist" className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
          {TABS.map(({ id, label, icon: Icon }) => {
            const on = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(id)}
                className={`-mb-px flex h-11 shrink-0 items-center gap-2 border-b-2 px-3.5 text-sm font-semibold transition ${
                  on
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {label}
                {id === "acara" && dirty && (
                  <span
                    className="size-1.5 rounded-full bg-amber-400"
                    aria-label="Ada perubahan belum disimpan"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === "acara" && (
            <AcaraTab
              form={form}
              update={update}
              status={status}
              onStatus={setStatus}
              onToast={showToast}
              onImage={() => setImageOpen(true)}
              onDuplicate={() => setDuplicateOpen(true)}
              onDelete={() => {
                showToast("Acara dihapus permanen.");
                setTimeout(() => router.push("/beranda"), 800);
              }}
            />
          )}
          {tab === "akun" && <AkunTab onSave={() => showToast("Profil akun diperbarui.")} />}
          {tab === "preferensi" && (
            <PreferensiTab onSave={() => showToast("Preferensi disimpan.")} />
          )}
        </div>

        {tab === "acara" && dirty && (
          <div
            role="region"
            aria-label="Perubahan belum disimpan"
            className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-2xl bg-brand-900 px-5 py-3 text-white shadow-2xl"
          >
            <p className="text-[13px] font-medium">Ada perubahan yang belum disimpan.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm(saved)}
                className="h-9 rounded-lg px-3.5 text-[13px] font-semibold text-brand-100 hover:bg-white/10"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || invalid}
                className="h-9 rounded-lg bg-white px-4 text-[13px] font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
              >
                {saving ? "Menyimpan…" : "Simpan perubahan"}
              </button>
            </div>
          </div>
        )}
      </EventShell>

      {imageOpen && (
        <ImageModal
          onClose={() => setImageOpen(false)}
          onPick={() => {
            update({ ogImageName: "og-banner-shilvia-custom.jpg" });
            setImageOpen(false);
            showToast("Gambar cuplikan diperbarui. Simpan untuk menerapkan.");
          }}
        />
      )}
      {duplicateOpen && (
        <DuplicateModal
          onClose={() => setDuplicateOpen(false)}
          onConfirm={() => {
            setDuplicateOpen(false);
            showToast("Acara diduplikat. Membuka daftar acara…");
            setTimeout(() => router.push("/beranda"), 800);
          }}
        />
      )}
    </>
  );
}
