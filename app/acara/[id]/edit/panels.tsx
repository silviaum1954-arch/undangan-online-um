"use client";

import { useState, type ReactNode } from "react";
import {
  Cake,
  Check,
  ChevronDown,
  Image as ImageIcon,
  Mail,
  MapPin,
  Music,
  Palette,
  Plus,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import Switch from "../switch";
import { Label, field } from "../ui";
import {
  ACCENTS,
  MAX_PHOTOS,
  THEMES,
  formatDate,
  isHex,
  type InvitationForm,
  type Photo,
} from "./data";

type Update = (patch: Partial<InvitationForm>) => void;

function Panel({
  id,
  icon: Icon,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`panel-${id}`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-brand-50/40"
        >
          <span className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold">{title}</span>
              <span className="block truncate text-xs text-ink-mute">{summary}</span>
            </span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-ink-mute transition ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {open && (
        <div id={`panel-${id}`} className="space-y-4 border-t border-line px-5 py-5">
          {children}
        </div>
      )}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[13px] font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-ink-mute">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export default function EditorPanels({
  form,
  update,
  photos,
  onAddPhoto,
  onRemovePhoto,
  musicUrl,
  onUploadMusic,
}: {
  form: InvitationForm;
  update: Update;
  photos: Photo[];
  onAddPhoto: (file: File) => Promise<void>;
  onRemovePhoto: (photo: Photo) => Promise<void>;
  musicUrl: string;
  onUploadMusic: (file: File) => Promise<void>;
}) {
  const [musicBusy, setMusicBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ tema: true, info: true });
  const toggle = (k: string) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  const theme = THEMES.find((t) => t.id === form.theme) ?? THEMES[0];
  const hexOk = isHex(form.accent);

  return (
    <div className="space-y-3">
      <Panel
        id="tema"
        icon={Palette}
        title="Tema & warna"
        summary={`${theme.name} · aksen ${form.accent.toUpperCase()}`}
        open={!!open.tema}
        onToggle={() => toggle("tema")}
      >
        <div>
          <span className="mb-2 block text-[13px] font-semibold">Tema desain</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {THEMES.map((t) => {
              const on = form.theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ theme: t.id })}
                  className={`overflow-hidden rounded-xl border text-left transition ${
                    on
                      ? "border-brand-600 ring-2 ring-brand-100"
                      : "border-line hover:border-brand-200"
                  }`}
                >
                  <div className={`h-14 bg-linear-to-br ${t.hero}`} />
                  <div className="flex items-center justify-between p-2.5">
                    <span>
                      <span className="block font-serif text-xs font-semibold">
                        {t.name}
                      </span>
                      <span className="block text-[10px] uppercase tracking-wider text-ink-mute">
                        {t.badge}
                      </span>
                    </span>
                    {on && <Check className="size-4 text-brand-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[13px] font-semibold">Warna aksen</span>
          <div className="flex flex-wrap items-center gap-3">
            {ACCENTS.map((hex) => {
              const on = form.accent.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  aria-label={`Warna ${hex}`}
                  aria-pressed={on}
                  onClick={() => update({ accent: hex })}
                  style={{ backgroundColor: hex }}
                  className={`grid size-8 place-items-center rounded-full transition ${
                    on ? "ring-2 ring-brand-600 ring-offset-2" : "hover:scale-105"
                  }`}
                >
                  {on && <Check className="size-3.5 text-white" strokeWidth={3} />}
                </button>
              );
            })}
            <div className="ml-auto">
              <label htmlFor="accent-hex" className="sr-only">
                Kode warna HEX
              </label>
              <input
                id="accent-hex"
                value={form.accent}
                onChange={(e) => update({ accent: e.target.value })}
                aria-invalid={!hexOk}
                className={`h-9 w-28 rounded-lg border bg-white px-3 text-sm font-semibold tabular-nums outline-none ${
                  hexOk
                    ? "border-line focus:border-brand-500"
                    : "border-rose-300 focus:border-rose-400"
                }`}
              />
            </div>
          </div>
          {!hexOk && (
            <p className="mt-2 text-xs text-rose-600">
              Gunakan format HEX 6 digit, misalnya #634C89.
            </p>
          )}
        </div>
      </Panel>

      <Panel
        id="sampul"
        icon={Mail}
        title="Sampul"
        summary={`“${form.openLabel}” · ${form.envelopeText}`}
        open={!!open.sampul}
        onToggle={() => toggle("sampul")}
      >
        <TextField
          id="env-text"
          label="Teks pada amplop"
          value={form.envelopeText}
          onChange={(v) => update({ envelopeText: v })}
        />
        <TextField
          id="open-label"
          label="Teks tombol buka"
          value={form.openLabel}
          onChange={(v) => update({ openLabel: v })}
        />
      </Panel>

      <Panel
        id="info"
        icon={Cake}
        title="Info acara"
        summary={`${form.hostName} · ${formatDate(form.eventDate)}`}
        open={!!open.info}
        onToggle={() => toggle("info")}
      >
        <div className="grid gap-4 sm:grid-cols-[3fr_2fr]">
          <TextField
            id="host"
            label="Nama yang berulang tahun"
            value={form.hostName}
            onChange={(v) => update({ hostName: v })}
          />
          <TextField
            id="age"
            label="Usia / momen"
            value={form.ageMoment}
            onChange={(v) => update({ ageMoment: v })}
          />
        </div>
        <TextField
          id="tagline"
          label="Tagline"
          value={form.tagline}
          onChange={(v) => update({ tagline: v })}
        />
        <Row>
          <TextField
            id="date"
            type="date"
            label="Tanggal acara"
            value={form.eventDate}
            onChange={(v) => update({ eventDate: v })}
          />
          <TextField
            id="time"
            label="Waktu"
            value={form.eventTime}
            onChange={(v) => update({ eventTime: v })}
          />
        </Row>
        <TextField
          id="dress"
          label="Dress code"
          value={form.dressCode}
          onChange={(v) => update({ dressCode: v })}
        />
      </Panel>

      <Panel
        id="lokasi"
        icon={MapPin}
        title="Lokasi & peta"
        summary={`${form.venueName}, ${form.venueAddress}`}
        open={!!open.lokasi}
        onToggle={() => toggle("lokasi")}
      >
        <TextField
          id="venue"
          label="Nama tempat"
          value={form.venueName}
          onChange={(v) => update({ venueName: v })}
        />
        <TextField
          id="address"
          label="Alamat lengkap"
          value={form.venueAddress}
          onChange={(v) => update({ venueAddress: v })}
        />
        <TextField
          id="maps"
          type="url"
          label="Tautan Google Maps"
          value={form.mapsUrl}
          placeholder="https://maps.app.goo.gl/…"
          onChange={(v) => update({ mapsUrl: v })}
        />
      </Panel>

      <Panel
        id="galeri"
        icon={ImageIcon}
        title="Galeri foto"
        summary={`${photos.length} dari ${MAX_PHOTOS} foto · opsional`}
        open={!!open.galeri}
        onToggle={() => toggle("galeri")}
      >
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {photos.map((ph, i) => (
            <li
              key={ph.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-brand-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                aria-label={`Hapus foto ${i + 1}`}
                onClick={() => onRemovePhoto(ph)}
                className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-white/90 text-ink-soft opacity-0 shadow transition hover:text-rose-600 focus-visible:opacity-100 group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
          {photos.length < MAX_PHOTOS && (
            <li>
              <label
                className={`grid aspect-square w-full cursor-pointer place-items-center rounded-xl border-2 border-dashed border-brand-200 text-brand-600 transition hover:bg-brand-50 ${
                  uploading ? "opacity-60" : ""
                }`}
              >
                <Plus className="size-5" />
                <span className="sr-only">Tambah foto</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  aria-label="Tambah foto"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setUploading(true);
                    await onAddPhoto(file);
                    setUploading(false);
                  }}
                />
              </label>
            </li>
          )}
        </ul>
        <p className="text-xs text-ink-mute">
          Maksimal {MAX_PHOTOS} foto JPG, PNG, atau WebP (maks. 5 MB per foto). Foto langsung tersimpan.
        </p>
      </Panel>

      <Panel
        id="musik"
        icon={Music}
        title="Musik latar"
        summary={
          form.musicOn
            ? form.musicPath
              ? (form.musicPath.split("/").pop() ?? "Musik aktif")
              : "Aktif · belum ada file"
            : "Nonaktif"
        }
        open={!!open.musik}
        onToggle={() => toggle("musik")}
      >
        <ToggleRow
          label="Putar musik otomatis"
          desc="Musik menyala lembut saat tamu membuka amplop. Tamu bisa mematikannya."
          checked={form.musicOn}
          onChange={(v) => update({ musicOn: v })}
        />
        {form.musicOn && (
          <div className="space-y-3">
            {form.musicPath ? (
              <>
                <audio controls src={musicUrl} className="w-full" />
                <button
                  type="button"
                  onClick={() => update({ musicPath: "" })}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Hapus musik
                </button>
              </>
            ) : null}
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 px-4 py-4 text-[13px] font-semibold text-brand-700 transition hover:bg-brand-50 ${
                musicBusy ? "opacity-60" : ""
              }`}
            >
              <Music className="size-4" />
              {musicBusy ? "Mengunggah…" : form.musicPath ? "Ganti file musik" : "Unggah file MP3"}
              <input
                type="file"
                accept="audio/mpeg,audio/mp4,audio/x-m4a,.mp3,.m4a"
                className="sr-only"
                aria-label="File musik"
                disabled={musicBusy}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setMusicBusy(true);
                  await onUploadMusic(file);
                  setMusicBusy(false);
                }}
              />
            </label>
            <p className="text-xs text-ink-mute">
              MP3 atau M4A, maksimal 5 MB. Pastikan Anda berhak memakai lagu tersebut.
            </p>
          </div>
        )}
      </Panel>

      <Panel
        id="fitur"
        icon={SlidersHorizontal}
        title="Fitur interaksi"
        summary={
          [
            form.showCountdown && "Countdown",
            form.showCalendar && "Kalender",
            form.showShare && "Bagikan",
          ]
            .filter(Boolean)
            .join(" · ") || "Semua nonaktif"
        }
        open={!!open.fitur}
        onToggle={() => toggle("fitur")}
      >
        <ToggleRow
          label="Hitung mundur"
          desc="Tampilkan sisa hari menuju acara."
          checked={form.showCountdown}
          onChange={(v) => update({ showCountdown: v })}
        />
        <ToggleRow
          label="Simpan ke kalender"
          desc="Tamu bisa menambahkan acara ke Google Calendar."
          checked={form.showCalendar}
          onChange={(v) => update({ showCalendar: v })}
        />
        <ToggleRow
          label="Tombol bagikan"
          desc="Tamu bisa membagikan undangan lewat WhatsApp."
          checked={form.showShare}
          onChange={(v) => update({ showShare: v })}
        />
      </Panel>
    </div>
  );
}
