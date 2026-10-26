"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, SlidersHorizontal, User, type LucideIcon } from "lucide-react";
import EventShell from "../shell";
import { createClient } from "@/lib/supabase/client";
import { uniqueSlug } from "@/lib/format";
import type { ShellEvent } from "@/lib/data/events";
import AcaraTab from "./acara-tab";
import { AkunTab, PreferensiTab } from "./other-tabs";
import { DuplicateModal, ImageModal } from "./modals";
import type { EventStatus, Prefs, ProfileData, Settings } from "./data";

type Tab = "acara" | "akun" | "preferensi";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "acara", label: "Acara ini", icon: Calendar },
  { id: "akun", label: "Akun", icon: User },
  { id: "preferensi", label: "Preferensi", icon: SlidersHorizontal },
];

export default function PengaturanAcaraPage({
  slug: routeSlug,
  shell,
  event,
  initialSettings,
  profile,
}: {
  slug: string;
  shell: ShellEvent;
  event: { id: string; title: string; status: EventStatus; usedQuota: number };
  initialSettings: Settings;
  profile: ProfileData;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("acara");
  const [saved, setSaved] = useState<Settings>(initialSettings);
  const [form, setForm] = useState<Settings>(initialSettings);
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const invalid = form.slug.length < 3;
  const ogImageUrl = form.ogImagePath
    ? supabase.storage.from("event-media").getPublicUrl(form.ogImagePath).data.publicUrl
    : null;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function update(patch: Partial<Settings>) {
    setForm((p) => ({ ...p, ...patch }));
  }

  async function save() {
    if (invalid) return;
    setSaving(true);
    const { error } = await supabase
      .from("events")
      .update({
        slug: form.slug,
        auto_close: form.autoClose,
        close_timing: form.closeTiming,
        remind_archive: form.reminderArchive,
        og_title: form.metaTitle || null,
        og_description: form.metaDescription || null,
        og_image_path: form.ogImagePath || null,
        total_quota: form.totalQuota,
        max_pax: form.maxPax,
      })
      .eq("id", event.id);
    setSaving(false);
    if (error) {
      return showToast(
        error.code === "23505"
          ? "Tautan itu sudah dipakai acara lain. Pilih tautan berbeda."
          : `Gagal menyimpan: ${error.message}`,
      );
    }
    setSaved(form);
    showToast("Pengaturan acara disimpan.");
    // the slug is part of the URL, so move to the new address
    if (form.slug !== routeSlug) router.replace(`/acara/${form.slug}/pengaturan`);
    else router.refresh();
  }

  async function changeStatus(next: EventStatus) {
    const { error } = await supabase
      .from("events")
      .update({
        status: next,
        published_at: next === "terbit" ? new Date().toISOString() : undefined,
        archived_at: next === "diarsipkan" ? new Date().toISOString() : null,
      })
      .eq("id", event.id);
    if (error) return showToast(`Gagal mengubah status: ${error.message}`);
    setStatus(next);
    router.refresh();
  }

  async function uploadOgImage(file: File) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${auth.user.id}/${event.id}/og-${Date.now()}.${ext}`;
    const up = await supabase.storage
      .from("event-media")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) return false;
    update({ ogImagePath: path });
    setImageOpen(false);
    showToast("Gambar cuplikan dipilih. Simpan untuk menerapkan.");
    return true;
  }

  async function duplicate(name: string) {
    const { data: src, error: readError } = await supabase
      .from("events")
      .select("*")
      .eq("id", event.id)
      .single();
    if (readError) return showToast(`Gagal menduplikasi: ${readError.message}`);
    const slug = uniqueSlug(name || src.title);
    const { error } = await supabase.from("events").insert({
      title: name || `${src.title} (salinan)`,
      slug,
      status: "draf",
      event_date: src.event_date,
      event_time: src.event_time,
      venue_name: src.venue_name,
      venue_address: src.venue_address,
      maps_url: src.maps_url,
      theme: src.theme,
      design: src.design,
      auto_close: src.auto_close,
      close_timing: src.close_timing,
      remind_archive: src.remind_archive,
      og_title: src.og_title,
      og_description: src.og_description,
      total_quota: src.total_quota,
      max_pax: src.max_pax,
      wishes_auto_publish: src.wishes_auto_publish,
      wishes_manual_approval: src.wishes_manual_approval,
      wishes_spam_filter: src.wishes_spam_filter,
      wishes_char_limit: src.wishes_char_limit,
      gift_enabled: src.gift_enabled,
      gift_personal_only: src.gift_personal_only,
      gift_transfer_form: src.gift_transfer_form,
      gift_email_notify: src.gift_email_notify,
    });
    if (error) return showToast(`Gagal menduplikasi: ${error.message}`);
    setDuplicateOpen(false);
    router.push("/beranda");
  }

  async function remove() {
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) return showToast(`Gagal menghapus: ${error.message}`);
    router.replace("/beranda");
    router.refresh();
  }

  async function saveProfile(v: { fullName: string; phone: string }) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return showToast("Sesi berakhir. Silakan masuk lagi.");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: v.fullName, phone: v.phone || null })
      .eq("id", auth.user.id);
    if (error) return showToast(`Gagal menyimpan: ${error.message}`);
    // keep the navbar name in sync (display only)
    await supabase.auth.updateUser({ data: { full_name: v.fullName } });
    showToast("Profil akun diperbarui.");
  }

  async function savePrefs(p: Prefs) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return showToast("Sesi berakhir. Silakan masuk lagi.");
    const { error } = await supabase
      .from("profiles")
      .update({ preferences: p })
      .eq("id", auth.user.id);
    showToast(error ? `Gagal menyimpan: ${error.message}` : "Preferensi disimpan.");
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

      <EventShell slug={routeSlug} active="pengaturan" event={shell}>
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
              onStatus={changeStatus}
              onToast={showToast}
              eventTitle={event.title}
              usedQuota={event.usedQuota}
              ogImageUrl={ogImageUrl}
              onImage={() => setImageOpen(true)}
              onDuplicate={() => setDuplicateOpen(true)}
              onDelete={remove}
            />
          )}
          {tab === "akun" && <AkunTab profile={profile} onSave={saveProfile} />}
          {tab === "preferensi" && <PreferensiTab prefs={profile.prefs} onSave={savePrefs} />}
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

      {imageOpen && <ImageModal onClose={() => setImageOpen(false)} onUpload={uploadOgImage} />}
      {duplicateOpen && (
        <DuplicateModal
          eventTitle={event.title}
          onClose={() => setDuplicateOpen(false)}
          onConfirm={duplicate}
        />
      )}
    </>
  );
}
