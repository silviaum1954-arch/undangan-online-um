"use client";

import { useState } from "react";
import EventShell from "../shell";
import { EVENT } from "../event";
import {
  Palette,
  Mail,
  Cake,
  MapPin,
  Image as ImageIcon,
  Music,
  Sliders,
  Calendar,
  Clock,
  Shirt,
  CloudUpload,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
  RotateCcw,
} from "lucide-react";


export default function EditUndanganPage({ slug }: { slug: string }) {

  // Accordion open states (Sections 1 & 3 expanded by default as in screenshot)
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    1: true,
    2: false,
    3: true,
    4: false,
    5: false,
    6: false,
    7: false,
  });

  function toggleSection(idx: number) {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  // Active theme & accent
  const [activeTheme, setActiveTheme] = useState<"flora" | "noir" | "soft" | "gold">("flora");
  const [activeAccentHex, setActiveAccentHex] = useState("#634C89");

  // Form Fields (synced with mobile preview)
  const [hostName, setHostName] = useState("Shilvia Anisa");
  const [ageMoment, setAgeMoment] = useState("21 Tahun");
  const [tagline, setTagline] = useState("Strawberry Garden Elegance: A Sweet 21st Chapter");
  const [eventDate, setEventDate] = useState("Kamis, 15 Oktober 2026");
  const [eventTime, setEventTime] = useState("16:00 - 20:00 WIB");
  const [dressCode, setDressCode] = useState("Soft Pastels / Cream, Sage Olive, & Dusty Pink");
  const [venueName, setVenueName] = useState("The Glass House Bistro");
  const [venueAddress, setVenueAddress] = useState("Senopati, Jakarta Selatan");

  // Mobile preview states
  const [previewTab, setPreviewTab] = useState<"cover" | "undangan" | "lokasi">("undangan");
  const [previewZoom, setPreviewZoom] = useState<100 | 80>(100);

  // Status & toast
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }

  function handlePublish() {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setHasUnsavedChanges(false);
      showToast("Perubahan undangan berhasil diterbitkan langsung ke link tamu!");
    }, 800);
  }

  function handleReset() {
    setHostName("Shilvia Anisa");
    setAgeMoment("21 Tahun");
    setTagline("Strawberry Garden Elegance: A Sweet 21st Chapter");
    setEventDate("Kamis, 15 Oktober 2026");
    setEventTime("16:00 - 20:00 WIB");
    setDressCode("Soft Pastels / Cream, Sage Olive, & Dusty Pink");
    setActiveTheme("flora");
    setActiveAccentHex("#634C89");
    setHasUnsavedChanges(false);
    showToast("Pengaturan dikembalikan ke versi tersimpan.");
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-brand-900 px-5 py-3.5 text-sm text-white shadow-2xl shadow-brand-900/40 ring-1 ring-white/20 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="size-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <EventShell slug={slug} active="edit" eventName={EVENT.name} eventDate={EVENT.date}>

          {/* PAGE CONTENT CONTAINER */}
          <div className="space-y-6">
            {/* HEADER BANNER WITH ACTION BUTTONS */}
            <section className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                    Edit Undangan
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Terbit
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-soft">
                  Atur tampilan tema, informasi perayaan, dan konten undangan digital secara langsung.
                </p>
              </div>

              {/* Action Buttons: Status, Batal/Reset, Terbitkan */}
              <div className="flex flex-wrap items-center gap-2.5">
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 border border-brand-100">
                    <span className="size-2 rounded-full bg-brand-600" />
                    Perubahan belum disimpan
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white px-4 text-xs font-bold text-ink hover:bg-slate-50 transition cursor-pointer"
                >
                  <RotateCcw className="size-3.5 text-ink-soft" />
                  <span>Batal / Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-xs font-bold text-white shadow-md shadow-brand-900/20 hover:bg-[#432a63] transition cursor-pointer disabled:opacity-75"
                >
                  <CloudUpload className={`size-4 ${isPublishing ? "animate-bounce" : ""}`} />
                  <span>Terbitkan Perubahan</span>
                </button>
              </div>
            </section>

            {/* TWO-COLUMN LAYOUT: ACCORDION EDITOR (LEFT) + LIVE MOBILE PREVIEW (RIGHT) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_0.95fr] items-start">
              {/* LEFT COLUMN: ACCORDION SECTIONS 1 TO 7 */}
              <div className="space-y-4">
                {/* SECTION 1: TEMA & PALET WARNA (Expanded) */}
                <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition">
                  <button
                    type="button"
                    onClick={() => toggleSection(1)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#fbfafc] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <Palette className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">
                          1. Tema &amp; Palet Warna
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Pilih palet warna, tipografi, dan nuansa kartu
                        </p>
                      </div>
                    </div>
                    {openSections[1] ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {openSections[1] && (
                    <div className="border-t border-line/70 p-5 space-y-5 bg-[#faf9fc]/30">
                      {/* TEMA DESAIN AKTIF (4 Cards) */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-2.5">
                          Tema Desain Aktif
                        </label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            {
                              id: "flora",
                              badge: "Flora",
                              name: "Violet Bloom",
                              gradient: "from-purple-100 via-pink-50 to-purple-50",
                              border: "border-purple-300",
                              badgeColor: "text-purple-700 bg-purple-100/80",
                            },
                            {
                              id: "noir",
                              badge: "Noir",
                              name: "Midnight",
                              gradient: "from-slate-900 via-slate-800 to-slate-900",
                              border: "border-slate-800",
                              badgeColor: "text-amber-200 bg-slate-800",
                              isDark: true,
                            },
                            {
                              id: "soft",
                              badge: "Soft",
                              name: "Pastel",
                              gradient: "from-indigo-100 via-purple-50 to-pink-50",
                              border: "border-indigo-200",
                              badgeColor: "text-indigo-700 bg-indigo-100/80",
                            },
                            {
                              id: "gold",
                              badge: "Gold",
                              name: "Golden",
                              gradient: "from-amber-100 via-orange-50 to-amber-50",
                              border: "border-amber-300",
                              badgeColor: "text-amber-800 bg-amber-100/80",
                            },
                          ].map((themeItem) => {
                            const isSelected = activeTheme === themeItem.id;
                            return (
                              <button
                                key={themeItem.id}
                                type="button"
                                onClick={() => {
                                  setActiveTheme(themeItem.id as typeof activeTheme);
                                  setHasUnsavedChanges(true);
                                }}
                                className={`group relative rounded-2xl border p-3.5 text-left transition cursor-pointer bg-linear-to-br ${themeItem.gradient} ${
                                  isSelected
                                    ? "ring-2 ring-brand-600 border-brand-500 shadow-md"
                                    : "border-line opacity-80 hover:opacity-100"
                                }`}
                              >
                                <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-2 ${themeItem.badgeColor}`}>
                                  {themeItem.badge}
                                </span>
                                <div className="flex items-center justify-between">
                                  <span className={`font-serif text-xs font-bold truncate ${themeItem.isDark ? "text-white" : "text-ink"}`}>
                                    {themeItem.name}
                                  </span>
                                  {isSelected && (
                                    <Check className="size-3.5 text-brand-600 shrink-0 stroke-3" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* WARNA AKSEN DOMINAN */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-2.5">
                          Warna Aksen Dominan
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          {[
                            "#634C89",
                            "#7e57c2",
                            "#5c6bc0",
                            "#ab47bc",
                            "#311b92",
                          ].map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => {
                                setActiveAccentHex(hex);
                                setHasUnsavedChanges(true);
                              }}
                              style={{ backgroundColor: hex }}
                              className={`grid size-8 place-items-center rounded-full shadow-sm transition cursor-pointer ${
                                activeAccentHex === hex
                                  ? "ring-2 ring-offset-2 ring-brand-600 scale-110"
                                  : "hover:scale-105"
                              }`}
                            >
                              {activeAccentHex === hex && (
                                <Check className="size-3.5 text-white stroke-3" />
                              )}
                            </button>
                          ))}

                          {/* HEX input box */}
                          <div className="flex items-center rounded-xl border border-line bg-white px-2.5 py-1 text-xs ml-auto">
                            <span className="font-bold text-ink-mute mr-1.5 text-[10px]">
                              HEX
                            </span>
                            <input
                              type="text"
                              value={activeAccentHex}
                              onChange={(e) => {
                                setActiveAccentHex(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              className="w-20 font-mono text-xs font-bold text-ink outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: TAMPILAN SAMPUL / COVER (Collapsed) */}
                <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition">
                  <button
                    type="button"
                    onClick={() => toggleSection(2)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#fbfafc] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <Mail className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">
                          2. Tampilan Sampul / Cover
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Amplop pembuka, teks pembuka, dan tombol interaktif
                        </p>
                      </div>
                    </div>
                    {openSections[2] ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {openSections[2] && (
                    <div className="border-t border-line/70 p-5 space-y-4 bg-[#faf9fc]/30 text-xs">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
                          Teks Pada Amplop Virtual
                        </label>
                        <input
                          type="text"
                          defaultValue="Spesial untuk Tamu Terhormat"
                          className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs text-ink outline-none focus:border-brand-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
                          Tombol Buka Undangan
                        </label>
                        <input
                          type="text"
                          defaultValue="Buka Undangan"
                          className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs text-ink outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: INFO DETAIL ACARA (Expanded as in screenshot) */}
                <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition">
                  <button
                    type="button"
                    onClick={() => toggleSection(3)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#fbfafc] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <Cake className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">
                          3. Info Detail Acara
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Nama yang berulang tahun, tanggal, jam, dan dress code
                        </p>
                      </div>
                    </div>
                    {openSections[3] ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {openSections[3] && (
                    <div className="border-t border-line/70 p-5 space-y-4 bg-[#faf9fc]/30">
                      {/* Row 1: Nama yang Berulang Tahun & Usia / Momen */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.5fr_1fr]">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1.5">
                            Nama yang Berulang Tahun
                          </label>
                          <input
                            type="text"
                            value={hostName}
                            onChange={(e) => {
                              setHostName(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-xs font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1.5">
                            Usia / Momen
                          </label>
                          <input
                            type="text"
                            value={ageMoment}
                            onChange={(e) => {
                              setAgeMoment(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-xs font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                          />
                        </div>
                      </div>

                      {/* Row 2: Tagline / Tema Acara */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1.5">
                          Tagline / Tema Acara
                        </label>
                        <input
                          type="text"
                          value={tagline}
                          onChange={(e) => {
                            setTagline(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-xs font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                        />
                      </div>

                      {/* Row 3: Tanggal Acara & Waktu (WIB) */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1.5">
                            Tanggal Acara
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={eventDate}
                              onChange={(e) => {
                                setEventDate(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              className="h-11 w-full rounded-xl border border-line bg-white pl-3.5 pr-10 text-xs font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            />
                            <Calendar className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1.5">
                            Waktu (WIB)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={eventTime}
                              onChange={(e) => {
                                setEventTime(e.target.value);
                                setHasUnsavedChanges(true);
                              }}
                              className="h-11 w-full rounded-xl border border-line bg-white pl-3.5 pr-10 text-xs font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                            />
                            <Clock className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-mute" />
                          </div>
                        </div>
                      </div>

                      {/* Row 4: Dress Code / Catatan Pakaian */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1.5">
                          Dress Code / Catatan Pakaian
                        </label>
                        <div className="relative">
                          <Shirt className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-600" />
                          <input
                            type="text"
                            value={dressCode}
                            onChange={(e) => {
                              setDressCode(e.target.value);
                              setHasUnsavedChanges(true);
                            }}
                            className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3.5 text-xs font-semibold text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 4: LOKASI & PETA (Collapsed) */}
                <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition">
                  <button
                    type="button"
                    onClick={() => toggleSection(4)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#fbfafc] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <MapPin className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">
                          4. Lokasi &amp; Peta
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Nama gedung, alamat lengkap, dan Google Maps pinpoint
                        </p>
                      </div>
                    </div>
                    {openSections[4] ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {openSections[4] && (
                    <div className="border-t border-line/70 p-5 space-y-4 bg-[#faf9fc]/30 text-xs">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
                          Nama Gedung / Tempat
                        </label>
                        <input
                          type="text"
                          value={venueName}
                          onChange={(e) => {
                            setVenueName(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs text-ink outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-ink-mute block mb-1">
                          Alamat Lengkap
                        </label>
                        <input
                          type="text"
                          value={venueAddress}
                          onChange={(e) => {
                            setVenueAddress(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          className="h-10 w-full rounded-xl border border-line bg-white px-3 text-xs text-ink outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 5: GALERI FOTO KENANGAN (Collapsed) */}
                <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition">
                  <button
                    type="button"
                    onClick={() => toggleSection(5)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#fbfafc] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <ImageIcon className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">
                          5. Galeri Foto Kenangan (4/10) (Opsional)
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Maksimal 10 foto format JPG/PNG berkualitas tinggi
                        </p>
                      </div>
                    </div>
                    {openSections[5] ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {openSections[5] && (
                    <div className="border-t border-line/70 p-5 bg-[#faf9fc]/30 text-xs">
                      <p className="text-ink-soft">
                        4 foto telah diunggah. Klik untuk menambah foto kenangan perayaan.
                      </p>
                    </div>
                  )}
                </div>

                {/* SECTION 6: MUSIK LATAR OTOMATIS (Collapsed) */}
                <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition">
                  <button
                    type="button"
                    onClick={() => toggleSection(6)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#fbfafc] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <Music className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">
                          6. Musik Latar Otomatis
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Lagu instrumental menyala lembut saat tamu membuka amplop
                        </p>
                      </div>
                    </div>
                    {openSections[6] ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {openSections[6] && (
                    <div className="border-t border-line/70 p-5 bg-[#faf9fc]/30 text-xs">
                      <p className="text-ink-soft">
                        Lagu aktif: 🎵 <i>Acoustic Birthday Melody — Soft Piano &amp; Strings</i>
                      </p>
                    </div>
                  )}
                </div>

                {/* SECTION 7: FITUR INTERAKSI & COUNTDOWN (Collapsed) */}
                <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition">
                  <button
                    type="button"
                    onClick={() => toggleSection(7)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-[#fbfafc] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <Sliders className="size-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-extrabold text-ink">
                          7. Fitur Interaksi &amp; Countdown Timer
                        </h3>
                        <p className="text-xs text-ink-soft">
                          Countdown timer, simpan tanggal ke kalender, tombol bagikan
                        </p>
                      </div>
                    </div>
                    {openSections[7] ? (
                      <ChevronUp className="size-4 text-ink-mute" />
                    ) : (
                      <ChevronDown className="size-4 text-ink-mute" />
                    )}
                  </button>

                  {openSections[7] && (
                    <div className="border-t border-line/70 p-5 bg-[#faf9fc]/30 text-xs">
                      <p className="text-ink-soft">
                        Countdown timer, Google Calendar sync, dan tombol share WhatsApp aktif secara default.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE REALISTIC MOBILE PREVIEW */}
              <div className="sticky top-20 flex flex-col items-center">
                {/* PREVIEW TABS BAR (Cover, Undangan, Lokasi) */}
                <div className="mb-4 flex items-center rounded-full border border-line bg-white p-1 shadow-sm">
                  {[
                    { id: "cover", label: "Cover" },
                    { id: "undangan", label: "Undangan" },
                    { id: "lokasi", label: "Lokasi" },
                  ].map((tab) => {
                    const isActive = previewTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPreviewTab(tab.id as typeof previewTab)}
                        className={`h-8 px-4 rounded-full text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? "bg-brand-700 text-white shadow-sm"
                            : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* SMARTPHONE FRAME CONTAINER */}
                <div
                  className="w-full max-w-85 rounded-[48px] border-10 border-slate-900 bg-white shadow-2xl overflow-hidden ring-4 ring-black/10 transition-transform duration-300"
                  style={{
                    transform: previewZoom === 80 ? "scale(0.85)" : "scale(1)",
                  }}
                >
                  {/* PHONE TOP NOTCH & STATUS BAR */}
                  <div className="relative flex h-8 items-center justify-between bg-slate-900 px-6 text-[11px] font-bold text-white">
                    <span>09:41</span>
                    {/* Dynamic island notch */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1 h-4 w-20 rounded-full bg-black" />
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* PHONE SCREEN CONTENT VIEWPORT */}
                  <div className="h-135 overflow-y-auto bg-[#faf8fc] text-ink select-none scrollbar-none">
                    {/* TAB: UNDANGAN (Matching reference image) */}
                    {previewTab === "undangan" && (
                      <div className="space-y-4 p-4">
                        {/* HERO IMAGE CONTAINER WITH SWEET TWENTY ONE OVERLAY */}
                        <div className="relative h-56 w-full overflow-hidden rounded-3xl shadow-sm bg-linear-to-t from-black/60 to-transparent">
                          {/* Aesthetic celebration photo representation */}
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-100 via-rose-100 to-purple-200" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="size-32 rounded-full border-4 border-white/90 overflow-hidden shadow-lg bg-rose-200 flex items-center justify-center">
                              <span className="text-3xl font-serif text-brand-900 font-bold">SA</span>
                            </div>
                          </div>

                          {/* Gradient shadow overlay for text readability */}
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent text-white">
                            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-rose-200">
                              Sweet Twenty One
                            </p>
                            <h2 className="font-serif text-xl font-bold leading-tight">
                              {hostName}
                            </h2>
                          </div>
                        </div>

                        {/* MENGHITUNG HARI BAHAGIA (Countdown) */}
                        <div className="rounded-2xl border border-line bg-white p-3.5 text-center shadow-sm">
                          <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-ink-mute">
                            Menghitung Hari Bahagia
                          </p>
                          <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                            <div className="rounded-xl bg-[#fbfafc] p-2 border border-line/60">
                              <p className="text-base font-extrabold text-ink">28</p>
                              <p className="text-[9px] text-ink-mute font-medium uppercase">Hari</p>
                            </div>
                            <div className="rounded-xl bg-[#fbfafc] p-2 border border-line/60">
                              <p className="text-base font-extrabold text-ink">14</p>
                              <p className="text-[9px] text-ink-mute font-medium uppercase">Jam</p>
                            </div>
                            <div className="rounded-xl bg-[#fbfafc] p-2 border border-line/60">
                              <p className="text-base font-extrabold text-ink">35</p>
                              <p className="text-[9px] text-ink-mute font-medium uppercase">Mnt</p>
                            </div>
                            <div className="rounded-xl bg-[#fbfafc] p-2 border border-line/60">
                              <p className="text-base font-extrabold text-ink">12</p>
                              <p className="text-[9px] text-ink-mute font-medium uppercase">Dtk</p>
                            </div>
                          </div>
                        </div>

                        {/* TANGGAL & WAKTU CARD */}
                        <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-sm">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600">
                            <Calendar className="size-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-ink">{eventDate}</p>
                            <p className="text-[11px] text-ink-soft mt-0.5">{eventTime}</p>
                          </div>
                        </div>

                        {/* LOKASI GEDUNG CARD */}
                        <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-sm">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                            <MapPin className="size-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-ink">{venueName}</p>
                            <p className="text-[11px] text-ink-soft mt-0.5">{venueAddress}</p>
                          </div>
                        </div>

                        {/* DRESS CODE BANNER */}
                        <div
                          className="rounded-2xl p-3.5 text-center border border-purple-200/80 bg-purple-50/70"
                          style={{
                            borderColor: activeAccentHex + "40",
                          }}
                        >
                          <p className="text-xs font-bold text-brand-900">
                            Dress Code: {dressCode}
                          </p>
                          <p className="text-[11px] text-ink-soft mt-0.5">
                            Kehadiran Anda adalah kado terindah
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAB: COVER */}
                    {previewTab === "cover" && (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="size-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 shadow-md">
                          <Mail className="size-9" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-mute">
                            Undangan Eksklusif
                          </p>
                          <h3 className="font-serif text-xl font-bold text-ink mt-1">
                            {hostName}
                          </h3>
                          <p className="text-xs text-ink-soft mt-1">
                            Spesial untuk Tamu Terhormat
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewTab("undangan")}
                          className="w-full rounded-2xl bg-brand-700 py-3 text-xs font-bold text-white shadow-md hover:bg-[#432a63]"
                        >
                          Buka Undangan
                        </button>
                      </div>
                    )}

                    {/* TAB: LOKASI */}
                    {previewTab === "lokasi" && (
                      <div className="p-4 space-y-4">
                        <div className="h-44 w-full rounded-2xl bg-slate-200 flex items-center justify-center border border-line">
                          <span className="text-xs text-ink-soft font-semibold flex items-center gap-1.5">
                            <MapPin className="size-4 text-rose-500" />
                            Peta Google Maps {venueName}
                          </span>
                        </div>
                        <div className="rounded-2xl border border-line bg-white p-3.5">
                          <p className="text-xs font-bold text-ink">{venueName}</p>
                          <p className="text-[11px] text-ink-soft mt-1">{venueAddress}</p>
                          <button
                            type="button"
                            onClick={() => showToast("Membuka petunjuk arah")}
                            className="mt-3 w-full rounded-xl bg-brand-600 py-2 text-xs font-bold text-white"
                          >
                            Petunjuk Arah Google Maps
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTTOM PREVIEW UTILITIES (Buka di Tab Baru, Zoom 100% / 80%) */}
                <div className="mt-4 flex items-center gap-4 text-xs text-ink-soft">
                  <button
                    type="button"
                    onClick={() => showToast("Membuka tampilan tamu di tab baru")}
                    className="inline-flex items-center gap-1.5 hover:text-brand-700 transition font-medium cursor-pointer"
                  >
                    <span>Buka di Tab Baru</span>
                    <ExternalLink className="size-3.5" />
                  </button>

                  <span className="text-slate-300">|</span>

                  {/* Zoom Switcher */}
                  <div className="flex items-center gap-1 font-semibold">
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(100)}
                      className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                        previewZoom === 100
                          ? "bg-brand-100 text-brand-800 font-bold"
                          : "hover:text-ink"
                      }`}
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(80)}
                      className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                        previewZoom === 80
                          ? "bg-brand-100 text-brand-800 font-bold"
                          : "hover:text-ink"
                      }`}
                    >
                      80%
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </EventShell>
    </>
  );
}
