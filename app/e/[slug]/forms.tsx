"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Gift,
  Lock,
  Minus,
  Plus,
  QrCode,
  Send,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateShort, initials, rupiah, timeAgo } from "@/lib/format";
import { storageUrl, type PublicEvent, type PublicWish } from "./model";
import { SectionHeading, card, primaryBtn, softBtn } from "./sections";

const input =
  "w-full rounded-xl border border-(--inv-line) bg-(--inv-tint)/60 px-4 text-[14px] text-(--inv-ink) outline-none transition placeholder:text-(--inv-soft)/70 focus:border-(--inv-accent) focus:ring-4 focus:ring-(--inv-tint)";
const label = "mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-(--inv-accent)";

function Notice({ tone, children }: { tone: "ok" | "err" | "info"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
      : tone === "err"
        ? "bg-rose-50 text-rose-900 border-rose-200"
        : "bg-(--inv-tint) text-(--inv-ink) border-(--inv-line)";
  return (
    <p role={tone === "err" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-[13px] ${cls}`}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ RSVP */

type RsvpChoice = "fiks" | "ragu" | "batal";

function Stepper({
  title,
  hint,
  value,
  min,
  canAdd,
  onChange,
}: {
  title: string;
  hint: string;
  value: number;
  min: number;
  canAdd: boolean;
  onChange: (n: number) => void;
}) {
  const b =
    "grid size-10 place-items-center rounded-full bg-(--inv-tint) text-(--inv-accent) transition disabled:opacity-40";
  return (
    <div className={`${card} flex items-center justify-between p-4`}>
      <div>
        <p className="text-[15px] font-bold">{title}</p>
        <p className="text-xs text-(--inv-soft)">{hint}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" aria-label={`Kurangi ${title}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={b}>
          <Minus className="size-4" />
        </button>
        <span className="min-w-4 text-center font-serif text-lg font-bold tabular-nums">{value}</span>
        <button type="button" aria-label={`Tambah ${title}`} disabled={!canAdd} onClick={() => onChange(value + 1)} className={b}>
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function RsvpSection({ data, guestSlug }: { data: PublicEvent; guestSlug: string | null }) {
  const guest = data.guest;
  const supabase = useMemo(() => createClient(), []);
  const answered = guest && guest.status !== "pending";
  const [status, setStatus] = useState<RsvpChoice>(
    guest && guest.status !== "pending" ? guest.status : "fiks",
  );
  const [adults, setAdults] = useState(Math.max(1, guest?.adults ?? 1));
  const [children, setChildren] = useState(guest?.children ?? 0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<boolean>(!!answered);

  const quota = guest?.quota ?? 1;
  const total = status === "batal" ? 0 : adults + children;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!guestSlug) return;
    setSending(true);
    setError(null);
    const { error } = await supabase.rpc("submit_rsvp", {
      p_slug: data.event.slug,
      p_guest: guestSlug,
      p_status: status,
      p_adults: status === "batal" ? 0 : adults,
      p_children: status === "batal" ? 0 : children,
    });
    setSending(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  const options: { id: RsvpChoice; text: string; icon: typeof Check }[] = [
    { id: "fiks", text: "Fiks datang", icon: CheckCircle2 },
    { id: "ragu", text: "Belum pasti", icon: Clock },
    { id: "batal", text: "Berhalangan", icon: XCircle },
  ];

  return (
    <div className="space-y-4">
      <SectionHeading
        badge="Konfirmasi RSVP"
        title="Konfirmasi Kehadiran"
        desc="Mohon konfirmasi kehadiran Anda demi kenyamanan acara"
      />

      {!guest ? (
        <Notice tone="info">
          Buka undangan dari tautan personal yang dikirim kepada Anda untuk mengonfirmasi
          kehadiran.
        </Notice>
      ) : !data.rsvp_open ? (
        <Notice tone="info">Konfirmasi kehadiran sudah ditutup.</Notice>
      ) : done ? (
        <div className={`${card} space-y-3 p-6 text-center`}>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-(--inv-tint) text-(--inv-accent)">
            <Check className="size-7" />
          </span>
          <h3 className="font-serif text-2xl font-bold">Terima kasih, {guest.name}!</h3>
          <p className="text-[13px] text-(--inv-soft)">
            {status === "batal"
              ? "Kami mencatat Anda berhalangan hadir. Terima kasih sudah memberi kabar."
              : `Konfirmasi Anda tercatat: ${total} orang (${adults} dewasa, ${children} anak).`}
          </p>
          <button type="button" onClick={() => setDone(false)} className={softBtn}>
            Ubah jawaban
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className={`${card} p-4`}>
            <span className={label}>Nama undangan</span>
            <p className="rounded-xl bg-(--inv-tint)/60 px-4 py-3 text-[15px] font-semibold">
              {guest.name}
            </p>
            <span className={`${label} mt-4`}>Status kehadiran</span>
            <div className="grid grid-cols-3 gap-2">
              {options.map(({ id, text, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={status === id}
                  onClick={() => setStatus(id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-[12px] font-semibold transition ${
                    status === id
                      ? "bg-(--inv-accent) text-(--inv-on)"
                      : "bg-(--inv-tint) text-(--inv-ink)"
                  }`}
                >
                  <Icon className="size-5" />
                  {text}
                </button>
              ))}
            </div>
          </div>

          {status !== "batal" && (
            <>
              <Stepper
                title="Dewasa"
                hint="Usia 12+ tahun (min. 1)"
                value={adults}
                min={1}
                canAdd={adults + children < quota}
                onChange={setAdults}
              />
              <Stepper
                title="Anak-anak"
                hint="Di bawah 12 tahun"
                value={children}
                min={0}
                canAdd={adults + children < quota}
                onChange={setChildren}
              />
              <p className="flex items-center gap-2 px-1 text-[13px] text-(--inv-soft)">
                <Users className="size-4" /> Total:{" "}
                <strong className="text-(--inv-accent)">{total} orang</strong>
                <span className="ml-auto text-xs">maks. {quota}</span>
              </p>
            </>
          )}

          {error && <Notice tone="err">{error}</Notice>}
          <button type="submit" disabled={sending} className={primaryBtn}>
            <Send className="size-4" />
            {sending
              ? "Mengirim…"
              : status === "batal"
                ? "Kirim konfirmasi"
                : `Kirim konfirmasi (${total} orang)`}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-(--inv-soft)">
            <Lock className="size-3" /> Datamu aman dan hanya dilihat oleh penyelenggara acara.
          </p>
        </form>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Ucapan */

type ListWish = PublicWish & { pending?: boolean };

export function WishSection({
  data,
  guestSlug,
  now,
}: {
  data: PublicEvent;
  guestSlug: string | null;
  now: number;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [wishes, setWishes] = useState<ListWish[]>(data.wishes);
  const storeKey = `undangkuy:wishes:${data.event.slug}`;

  // Wishes waiting for approval aren't public yet; keep this visitor's own
  // visible to them (this device only) until the owner approves them.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const mine = JSON.parse(localStorage.getItem(storeKey) ?? "[]") as PublicWish[];
        const live = new Set(data.wishes.map((w) => `${w.sender}\n${w.message}`));
        const pending = mine.filter((w) => !live.has(`${w.sender}\n${w.message}`));
        localStorage.setItem(storeKey, JSON.stringify(pending));
        if (pending.length) setWishes([...pending.map((w) => ({ ...w, pending: true })), ...data.wishes]);
      } catch {
        /* storage unavailable */
      }
    }, 0);
    return () => clearTimeout(t);
  }, [data.wishes, storeKey]);
  const [sender, setSender] = useState(data.guest?.name ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const limit = data.wish_settings.char_limit ?? 300;
  const closed = data.wish_settings.closed;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setNotice(null);
    const { data: res, error } = await supabase.rpc("submit_wish", {
      p_slug: data.event.slug,
      p_guest: guestSlug ?? "",
      p_sender: sender,
      p_message: message,
    });
    setSending(false);
    if (error) return setError(error.message);
    const visible = (res as { visible?: boolean } | null)?.visible;
    if (visible) {
      setWishes((p) => [
        { id: crypto.randomUUID(), sender: sender.trim(), message: message.trim(), created_at: new Date().toISOString() },
        ...p,
      ]);
      setNotice("Terima kasih, ucapan Anda sudah tampil.");
    } else {
      const mine: PublicWish = {
        id: crypto.randomUUID(),
        sender: sender.trim(),
        message: message.trim(),
        created_at: new Date().toISOString(),
      };
      setWishes((p) => [{ ...mine, pending: true }, ...p]);
      try {
        const prev = JSON.parse(localStorage.getItem(storeKey) ?? "[]") as PublicWish[];
        localStorage.setItem(storeKey, JSON.stringify([mine, ...prev].slice(0, 20)));
      } catch {
        /* storage unavailable */
      }
      setNotice("Terima kasih! Ucapan Anda tersimpan dan akan tampil untuk semua tamu setelah disetujui penyelenggara.");
    }
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        badge="Buku tamu & pesan"
        title="Ucapan & Doa"
        desc="Tinggalkan pesan manis untuk di hari istimewanya"
      />

      {closed ? (
        <Notice tone="info">Buku ucapan sedang ditutup.</Notice>
      ) : (
        <form onSubmit={submit} className={`${card} space-y-3 p-4`}>
          <div>
            <label htmlFor="w-sender" className={label}>
              Pengirim
            </label>
            <input
              id="w-sender"
              required
              maxLength={200}
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Nama Anda"
              className={`${input} h-12`}
            />
          </div>
          <div>
            <label htmlFor="w-message" className="sr-only">
              Ucapan
            </label>
            <textarea
              id="w-message"
              required
              rows={4}
              maxLength={limit}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis ucapan dan doamu di sini…"
              className={`${input} resize-none py-3`}
            />
            <p className="mt-1 text-right text-xs text-(--inv-soft)">
              {message.length}/{limit}
            </p>
          </div>
          {error && <Notice tone="err">{error}</Notice>}
          {notice && <Notice tone="ok">{notice}</Notice>}
          <button type="submit" disabled={sending} className={primaryBtn}>
            <Send className="size-4" />
            {sending ? "Mengirim…" : "Kirim ucapan"}
          </button>
        </form>
      )}

      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold">Pesan &amp; doa terkini</h3>
          <span className="rounded-full bg-(--inv-tint) px-3 py-1 text-[11px] font-bold text-(--inv-accent)">
            {wishes.length} ucapan
          </span>
        </div>
        {wishes.length === 0 ? (
          <p className="mt-4 text-center text-[13px] text-(--inv-soft)">
            Belum ada ucapan. Jadilah yang pertama!
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {wishes.map((w) => (
              <li key={w.id} className="flex gap-3 rounded-2xl border border-(--inv-line) p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-(--inv-tint) text-[12px] font-bold text-(--inv-accent)">
                  {initials(w.sender)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[14px] font-bold">{w.sender}</p>
                    <span className="shrink-0 text-[11px] text-(--inv-soft)">
                      {now ? timeAgo(w.created_at, now) : formatDateShort(w.created_at)}
                    </span>
                  </div>
                  {w.pending && (
                    <span className="mt-1 inline-block rounded-full bg-(--inv-tint) px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--inv-accent)">
                      Menunggu persetujuan
                    </span>
                  )}
                  <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-relaxed">
                    {w.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Angpao */

export function GiftSection({ data, guestSlug }: { data: PublicEvent; guestSlug: string | null }) {
  const gift = data.gift;
  const [qrisOpen, setQrisOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text.replace(/\D/g, ""));
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeading
        badge="Tanda kasih & angpao"
        title="Kirim Angpao"
        desc="Kehadiran & doa Anda adalah hadiah terindah. Namun bila hendak memberi tanda kasih, dapat melalui:"
      />

      {!gift ? (
        <Notice tone="info">
          <Lock className="mr-1.5 inline size-3.5" />
          Informasi tanda kasih hanya tampil untuk tamu dengan tautan undangan personal.
        </Notice>
      ) : (
        <>
          {gift.accounts.length === 0 && !gift.qris_path && (
            <Notice tone="info">Informasi rekening belum tersedia.</Notice>
          )}

          {gift.accounts.map((a) => (
            <div key={a.id} className={`${card} p-4`}>
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 font-bold">
                  <span className="grid size-9 place-items-center rounded-full bg-(--inv-tint) text-[10px] font-bold text-(--inv-accent)">
                    {a.bank_name.slice(0, 3).toUpperCase()}
                  </span>
                  {a.bank_name}
                </p>
                <span className="rounded-full bg-(--inv-tint) px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-(--inv-accent)">
                  {a.type === "bank" ? "Rekening" : "E-Wallet"}
                </span>
              </div>
              <div className="mt-3 rounded-xl bg-(--inv-tint)/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--inv-soft)">
                  Nomor rekening
                </p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="font-serif text-2xl font-bold tabular-nums tracking-wide">
                    {a.account_number}
                  </p>
                  <p className="text-right text-[12px] text-(--inv-soft)">a.n. {a.account_holder}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copy(a.id, a.account_number)}
                className={`${primaryBtn} mt-3`}
              >
                <Copy className="size-4" />
                {copied === a.id ? "Nomor tersalin" : "Salin nomor rekening"}
              </button>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {gift.qris_path && (
              <button type="button" onClick={() => setQrisOpen(true)} className={softBtn}>
                <QrCode className="size-4" /> Lihat QRIS
              </button>
            )}
            {gift.transfer_form && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className={`${softBtn} ${gift.qris_path ? "" : "col-span-2"}`}
              >
                <CheckCircle2 className="size-4" /> Konfirmasi
              </button>
            )}
          </div>
          <p className="flex items-center gap-2 rounded-xl bg-(--inv-tint)/70 px-4 py-3 text-[12px] text-(--inv-soft)">
            <Lock className="size-3.5 shrink-0" />
            Pastikan penerima sesuai dengan nama pada rekening di atas.
          </p>
        </>
      )}

      {qrisOpen && gift?.qris_path && (
        <Modal onClose={() => setQrisOpen(false)} title="QRIS Pembayaran Digital">
          <p className="text-center text-[13px] text-(--inv-soft)">
            Scan melalui aplikasi bank atau e-wallet apa saja
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storageUrl(gift.qris_path)}
            alt="Kode QRIS"
            className="mx-auto mt-4 size-64 rounded-2xl border border-(--inv-line) bg-white object-contain p-3"
          />
          <a
            href={storageUrl(gift.qris_path)}
            download
            target="_blank"
            rel="noreferrer"
            className={`${primaryBtn} mt-4`}
          >
            <Download className="size-4" /> Unduh QR code
          </a>
          <button type="button" onClick={() => setQrisOpen(false)} className={`${softBtn} mt-2`}>
            Tutup &amp; kembali
          </button>
        </Modal>
      )}

      {confirmOpen && gift && (
        <ConfirmTransfer
          data={data}
          guestSlug={guestSlug}
          destinations={[
            ...gift.accounts.map((a) => `${a.bank_name} · ${a.account_holder}`),
            ...(gift.qris_path ? ["QRIS"] : []),
          ]}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-100 overflow-y-auto rounded-3xl bg-(--inv-surface) p-5 text-(--inv-ink) shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-serif text-2xl font-bold text-(--inv-accent)">{title}</h3>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-(--inv-tint) text-(--inv-accent)"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmTransfer({
  data,
  guestSlug,
  destinations,
  onClose,
}: {
  data: PublicEvent;
  guestSlug: string | null;
  destinations: string[];
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [sender, setSender] = useState(data.guest?.name ?? "");
  const [destination, setDestination] = useState(destinations[0] ?? "Lainnya");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (amount <= 0) return setError("Isi nominal angpao terlebih dahulu.");
    setSending(true);
    setError(null);
    const { error } = await supabase.rpc("submit_gift", {
      p_slug: data.event.slug,
      p_guest: guestSlug ?? "",
      p_sender: sender,
      p_amount: amount,
      p_destination: destination,
      p_note: note || undefined,
    });
    setSending(false);
    if (error) return setError(error.message);
    setDone(true);
  }

  return (
    <Modal onClose={onClose} title="Konfirmasi Transfer">
      {done ? (
        <div className="space-y-4 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-(--inv-tint) text-(--inv-accent)">
            <Gift className="size-7" />
          </span>
          <p className="text-[14px]">
            Terima kasih! Tanda kasih Anda sudah tercatat dan hanya dilihat penyelenggara.
          </p>
          <button type="button" onClick={onClose} className={primaryBtn}>
            Tutup
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-[13px] text-(--inv-soft)">
            Bantu mencatat tanda kasih dan doa tulus yang telah Anda kirimkan.
          </p>
          <div>
            <label htmlFor="g-sender" className={label}>
              Nama pengirim
            </label>
            <input
              id="g-sender"
              required
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className={`${input} h-12`}
            />
          </div>
          <div>
            <span className={label}>Ditransfer melalui</span>
            <div className="grid grid-cols-2 gap-2">
              {destinations.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={destination === d}
                  onClick={() => setDestination(d)}
                  className={`rounded-xl px-3 py-2.5 text-left text-[12px] font-semibold ${
                    destination === d
                      ? "bg-(--inv-accent) text-(--inv-on)"
                      : "bg-(--inv-tint) text-(--inv-ink)"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="g-amount" className={label}>
              Nominal angpao
            </label>
            <input
              id="g-amount"
              required
              inputMode="numeric"
              value={amount ? amount.toLocaleString("id-ID") : ""}
              onChange={(e) => setAmount(Number(e.target.value.replace(/\D/g, "")) || 0)}
              placeholder="Contoh: 100.000"
              className={`${input} h-12`}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {[100000, 250000, 500000].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount((a) => a + n)}
                  className="rounded-full bg-(--inv-tint) px-3 py-1.5 text-[12px] font-semibold text-(--inv-accent)"
                >
                  +{n / 1000}rb
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(0)}
                className="ml-auto text-[12px] text-(--inv-soft)"
              >
                Hapus
              </button>
            </div>
            {amount > 0 && (
              <p className="mt-1 text-xs text-(--inv-soft)">{rupiah(amount)}</p>
            )}
          </div>
          <div>
            <label htmlFor="g-note" className={label}>
              Pesan tambahan (opsional)
            </label>
            <textarea
              id="g-note"
              rows={2}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${input} resize-none py-3`}
            />
          </div>
          {error && <Notice tone="err">{error}</Notice>}
          <button type="submit" disabled={sending} className={primaryBtn}>
            {sending ? "Mengirim…" : "Kirim konfirmasi angpao"}
          </button>
        </form>
      )}
    </Modal>
  );
}
