"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, CloudUpload, ExternalLink, RotateCcw } from "lucide-react";
import EventShell from "../shell";
import { createClient } from "@/lib/supabase/client";
import type { EventStatus, ShellEvent } from "@/lib/data/events";
import EditorPanels from "./panels";
import Preview, { type PreviewTab } from "./preview";
import { MAX_PHOTOS, isHex, patchFromForm, type InvitationForm, type Photo } from "./data";

const TABS: { id: PreviewTab; label: string }[] = [
  { id: "cover", label: "Cover" },
  { id: "undangan", label: "Undangan" },
  { id: "lokasi", label: "Lokasi" },
];

/** Minute-resolution clock; 0 on the server so hydration stays consistent. */
function subscribe(cb: () => void) {
  const t = setInterval(cb, 30000);
  return () => clearInterval(t);
}
const getNow = () => Math.floor(Date.now() / 60000) * 60000;
const getServerNow = () => 0;

const STATUS_CHIP: Record<EventStatus, { label: string; cls: string; dot: string }> = {
  draf: { label: "Draf", cls: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-400" },
  terbit: { label: "Terbit", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  selesai: { label: "Selesai", cls: "bg-brand-50 text-brand-700 ring-brand-200", dot: "bg-brand-500" },
  diarsipkan: { label: "Diarsipkan", cls: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};

export default function EditUndanganPage({
  slug,
  shell,
  event,
  initialForm,
  initialPhotos,
}: {
  slug: string;
  shell: ShellEvent;
  event: { id: string; status: EventStatus };
  initialForm: InvitationForm;
  initialPhotos: Photo[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [saved, setSaved] = useState<InvitationForm>(initialForm);
  const [form, setForm] = useState<InvitationForm>(initialForm);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [tab, setTab] = useState<PreviewTab>("undangan");
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const now = useSyncExternalStore(subscribe, getNow, getServerNow);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const invalid = !isHex(form.accent) || !form.hostName.trim();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function update(patch: Partial<InvitationForm>) {
    setForm((p) => ({ ...p, ...patch }));
  }

  async function publish() {
    if (invalid) return;
    setPublishing(true);
    const { error } = await supabase
      .from("events")
      .update(patchFromForm(form))
      .eq("id", event.id);
    setPublishing(false);
    if (error) return showToast(`Gagal menyimpan: ${error.message}`);
    setSaved(form);
    showToast(
      event.status === "terbit"
        ? "Perubahan diterbitkan ke tautan tamu."
        : "Perubahan disimpan.",
    );
  }

  async function addPhoto(file: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
      return showToast("Gunakan file JPG, PNG, atau WebP.");
    if (file.size > 5 * 1024 * 1024) return showToast("Ukuran foto maksimal 5 MB.");
    if (photos.length >= MAX_PHOTOS) return showToast(`Maksimal ${MAX_PHOTOS} foto.`);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return showToast("Sesi berakhir. Silakan masuk lagi.");
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${auth.user.id}/${event.id}/photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

    const up = await supabase.storage
      .from("event-media")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) return showToast(`Gagal mengunggah: ${up.error.message}`);

    const { data, error } = await supabase
      .from("event_photos")
      .insert({ event_id: event.id, storage_path: path, sort_order: photos.length })
      .select()
      .single();
    if (error) {
      await supabase.storage.from("event-media").remove([path]);
      return showToast(`Gagal menyimpan foto: ${error.message}`);
    }
    const url = supabase.storage.from("event-media").getPublicUrl(path).data.publicUrl;
    setPhotos((p) => [...p, { id: data.id, path, url }]);
    showToast("Foto ditambahkan.");
  }

  async function uploadMusic(file: File) {
    if (!/\.(mp3|m4a)$/i.test(file.name) && !file.type.startsWith("audio/"))
      return showToast("Gunakan file MP3 atau M4A.");
    if (file.size > 5 * 1024 * 1024) return showToast("Ukuran file musik maksimal 5 MB.");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return showToast("Sesi berakhir. Silakan masuk lagi.");
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
    const path = `${auth.user.id}/${event.id}/music-${Date.now()}.${ext}`;
    const up = await supabase.storage
      .from("event-media")
      .upload(path, file, {
        contentType: file.type || (ext === "m4a" ? "audio/mp4" : "audio/mpeg"),
        upsert: false,
      });
    if (up.error) return showToast(`Gagal mengunggah musik: ${up.error.message}`);
    update({ musicPath: path });
    showToast("Musik diunggah. Simpan untuk menerapkan.");
  }

  async function removePhoto(photo: Photo) {
    const { error } = await supabase.from("event_photos").delete().eq("id", photo.id);
    if (error) return showToast(`Gagal menghapus foto: ${error.message}`);
    await supabase.storage.from("event-media").remove([photo.path]);
    setPhotos((p) => p.filter((x) => x.id !== photo.id));
    showToast("Foto dihapus.");
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
        slug={slug}
        active="edit"
        event={shell}
        wide
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                Edit undangan
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${STATUS_CHIP[event.status].cls}`}
              >
                <span className={`size-1.5 rounded-full ${STATUS_CHIP[event.status].dot}`} />
                {STATUS_CHIP[event.status].label}
              </span>
              {dirty && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Belum disimpan
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              Atur tema dan isi undangan; pratinjau di samping ikut berubah.
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setForm(saved);
                showToast("Perubahan dibatalkan.");
              }}
              disabled={!dirty}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-white"
            >
              <RotateCcw className="size-4 text-ink-mute" />
              Batalkan
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={!dirty || publishing || invalid}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(101,67,143,0.7)] transition hover:bg-brand-700 disabled:opacity-50 disabled:shadow-none"
            >
              <CloudUpload className={`size-4 ${publishing ? "animate-bounce" : ""}`} />
              {publishing ? "Menyimpan…" : event.status === "terbit" ? "Terbitkan" : "Simpan"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <EditorPanels
            form={form}
            update={update}
            photos={photos}
            onAddPhoto={addPhoto}
            onRemovePhoto={removePhoto}
          musicUrl={
            form.musicPath
              ? supabase.storage.from("event-media").getPublicUrl(form.musicPath).data.publicUrl
              : ""
          }
          onUploadMusic={uploadMusic}
          />

          <div className="flex flex-col items-center lg:sticky lg:top-32">
            <div
              role="tablist"
              aria-label="Halaman pratinjau"
              className="mb-4 flex rounded-full bg-brand-50 p-1"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`h-8 rounded-full px-4 text-xs font-semibold transition ${
                    tab === t.id
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Preview
              form={form}
              photos={photos}
              tab={tab}
              now={now}
              onOpen={() => setTab("undangan")}
              onDirections={() => showToast("Membuka petunjuk arah…")}
            />

            <a
              href={`/e/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition hover:text-brand-700"
            >
              Buka di tab baru <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </EventShell>
    </>
  );
}
