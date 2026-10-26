"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Info,
  Pencil,
  Plus,
  QrCode,
  ShieldCheck,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import EventShell from "../shell";
import { EVENT } from "../event";
import Switch from "../switch";
import {
  INITIAL_ACCOUNTS,
  INITIAL_TRANSFERS,
  MAX_ACCOUNTS,
  initials,
  logoFor,
  rupiah,
  type Account,
  type Transfer,
} from "./data";
import {
  AccountModal,
  QrisCode,
  QrisModal,
  TransferModal,
  type AccountValues,
} from "./modals";

const card = "rounded-2xl border border-line bg-white p-6";
const cardTitle = "text-[15px] font-bold";
const iconBtn =
  "grid size-8 place-items-center rounded-lg text-ink-mute transition hover:bg-brand-50 hover:text-brand-700";

export default function AngpaoDigitalPage({ slug }: { slug: string }) {
  const [sectionActive, setSectionActive] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transfers] = useState<Transfer[]>(INITIAL_TRANSFERS);
  const [hasQris, setHasQris] = useState(true);

  const [personalOnly, setPersonalOnly] = useState(true);
  const [transferForm, setTransferForm] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [qrisOpen, setQrisOpen] = useState(false);
  const [detail, setDetail] = useState<Transfer | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  const summary = useMemo(() => {
    const total = transfers.reduce((n, t) => n + t.amount, 0);
    return {
      total,
      count: transfers.length,
      avg: transfers.length ? Math.round(total / transfers.length) : 0,
    };
  }, [transfers]);

  const slotsLeft = MAX_ACCOUNTS - accounts.length;

  function copyNumber(a: Account) {
    navigator.clipboard?.writeText(a.accountNumber.replace(/\D/g, ""));
    showToast(`Nomor ${a.bankName} disalin.`);
  }

  function toggleAccount(a: Account) {
    setAccounts((p) =>
      p.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)),
    );
    showToast(
      a.isActive
        ? `${a.bankName} disembunyikan dari undangan.`
        : `${a.bankName} kini tayang di undangan.`,
    );
  }

  function removeAccount(a: Account) {
    if (!confirm(`Hapus rekening ${a.bankName}?`)) return;
    setAccounts((p) => p.filter((x) => x.id !== a.id));
    showToast(`Rekening ${a.bankName} dihapus.`);
  }

  function saveAccount(v: AccountValues) {
    if (editing) {
      setAccounts((p) => p.map((x) => (x.id === editing.id ? { ...x, ...v } : x)));
      showToast(`Rekening ${v.bankName} diperbarui.`);
    } else {
      setAccounts((p) => [
        ...p,
        { id: `acc-${crypto.randomUUID()}`, ...v, isActive: true },
      ]);
      showToast(`Rekening ${v.bankName} ditambahkan.`);
    }
    setAccountOpen(false);
    setEditing(null);
  }

  function saveAll() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Pengaturan angpao disimpan.");
    }, 700);
  }

  const privacy = [
    {
      label: "Khusus tamu personal",
      desc: "Nomor rekening dan QRIS hanya terlihat oleh tamu dengan tautan ber-nama.",
      checked: personalOnly,
      set: setPersonalOnly,
    },
    {
      label: "Formulir “Saya sudah transfer”",
      desc: "Tamu bisa melampirkan bukti transfer dan ucapan tanda kasih.",
      checked: transferForm,
      set: setTransferForm,
    },
    {
      label: "Notifikasi email",
      desc: "Kirim email ke shilvia@gmail.com setiap ada konfirmasi baru.",
      checked: emailNotif,
      set: setEmailNotif,
    },
  ];

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
        active="angpao"
        eventName={EVENT.name}
        eventDate={EVENT.date}
        wide
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
              Angpao digital
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Atur rekening, e-wallet, dan QRIS untuk tanda kasih dari tamu.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-white py-2.5 pl-4 pr-3.5">
            <div>
              <p className="text-[13px] font-semibold">Tampilkan di undangan</p>
              <p
                className={`flex items-center gap-1.5 text-xs ${
                  sectionActive ? "text-emerald-700" : "text-ink-mute"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    sectionActive ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                {sectionActive ? "Aktif" : "Nonaktif"}
              </p>
            </div>
            <Switch
              checked={sectionActive}
              onChange={(v) => {
                setSectionActive(v);
                showToast(
                  v
                    ? "Bagian angpao tampil di undangan."
                    : "Bagian angpao disembunyikan dari undangan.",
                );
              }}
              label="Tampilkan bagian angpao di undangan"
            />
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 text-[13px] text-ink-soft">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-mute" />
          UndangKuy hanya menampilkan informasi rekening dan QRIS. Transaksi
          berlangsung langsung antar rekening atau aplikasi, tanpa potongan biaya.
        </p>

        <dl className="mt-5 grid grid-cols-1 divide-line rounded-2xl border border-line bg-white sm:grid-cols-3 sm:divide-x">
          {[
            { k: "Total tanda kasih", v: rupiah(summary.total), n: "dari konfirmasi tamu" },
            { k: "Konfirmasi masuk", v: String(summary.count), n: "transfer" },
            { k: "Rata-rata", v: rupiah(summary.avg), n: "per tamu" },
          ].map((s, i) => (
            <div
              key={s.k}
              className={`px-5 py-4 ${i > 0 ? "border-t border-line sm:border-t-0" : ""}`}
            >
              <dt className="text-xs font-medium text-ink-soft">{s.k}</dt>
              <dd className="mt-1.5">
                <span className="block whitespace-nowrap text-2xl font-extrabold tabular-nums">{s.v}</span>
                <span className="text-xs text-ink-mute">{s.n}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            {/* Accounts */}
            <section className={card}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={cardTitle}>Rekening &amp; e-wallet</h2>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    {accounts.length} dari {MAX_ACCOUNTS} slot terpakai
                  </p>
                </div>
                <button
                  type="button"
                  disabled={slotsLeft === 0}
                  onClick={() => {
                    setEditing(null);
                    setAccountOpen(true);
                  }}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-[13px] font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                  Tambah
                </button>
              </div>

              <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
                {accounts.length === 0 && (
                  <li className="flex flex-col items-center px-6 py-10 text-center">
                    <Wallet className="size-7 text-ink-mute" />
                    <p className="mt-2 text-sm font-semibold">Belum ada rekening</p>
                    <p className="text-[13px] text-ink-soft">
                      Tambahkan rekening agar tamu tahu ke mana mengirim tanda kasih.
                    </p>
                  </li>
                )}
                {accounts.map((a) => {
                  const logo = logoFor(a.bankName);
                  return (
                    <li
                      key={a.id}
                      className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                        a.isActive ? "" : "bg-brand-50/30"
                      }`}
                    >
                      <div
                        className={`flex min-w-0 items-center gap-3.5 ${
                          a.isActive ? "" : "opacity-60"
                        }`}
                      >
                        <span
                          className={`grid size-11 shrink-0 place-items-center rounded-xl text-[11px] font-extrabold text-white ${logo.bg}`}
                        >
                          {logo.text}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-bold">{a.bankName}</h3>
                            {a.isPrimary ? (
                              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                                Utama
                              </span>
                            ) : (
                              <span className="text-xs text-ink-mute">· {a.type}</span>
                            )}
                          </div>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-soft">
                            <span className="font-semibold tabular-nums text-ink">
                              {a.accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyNumber(a)}
                              aria-label={`Salin nomor ${a.bankName}`}
                              className="text-ink-mute hover:text-brand-600"
                            >
                              <Copy className="size-3.5" />
                            </button>
                            <span>a.n. {a.accountHolder}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <span className="mr-1 text-xs text-ink-soft">Tayang</span>
                        <Switch
                          small
                          checked={a.isActive}
                          onChange={() => toggleAccount(a)}
                          label={`Tayangkan ${a.bankName}`}
                        />
                        <span className="mx-2 h-4 w-px bg-line" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(a);
                            setAccountOpen(true);
                          }}
                          aria-label={`Edit ${a.bankName}`}
                          className={iconBtn}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAccount(a)}
                          aria-label={`Hapus ${a.bankName}`}
                          className={`${iconBtn} hover:bg-rose-50 hover:text-rose-600`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {slotsLeft > 0 && accounts.length > 0 && (
                <p className="mt-3 text-xs text-ink-mute">
                  {slotsLeft} slot tersisa — tambahkan Mandiri, Jenius, BNI, OVO,
                  atau ShopeePay.
                </p>
              )}
            </section>

            {/* Transfers */}
            <section className={card}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className={cardTitle}>Konfirmasi transfer tamu</h2>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    Dari formulir “Saya sudah transfer”. Cocokkan nominal lewat
                    mutasi bank atau e-wallet Anda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    showToast(`${transfers.length} konfirmasi diekspor ke CSV.`)
                  }
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line px-3.5 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <Download className="size-4 text-ink-mute" />
                  Ekspor CSV
                </button>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-line">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-brand-50/50 text-xs font-semibold text-ink-soft">
                      <th className="px-4 py-3 font-semibold">Tamu</th>
                      <th className="px-3 py-3 font-semibold">Tujuan</th>
                      <th className="px-3 py-3 text-right font-semibold">Nominal</th>
                      <th className="px-4 py-3 font-semibold">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {transfers.map((t) => (
                      <tr key={t.id} className="transition hover:bg-brand-50/30">
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setDetail(t)}
                            className="flex items-center gap-3 text-left"
                          >
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                              {initials(t.sender)}
                            </span>
                            <span className="whitespace-nowrap font-semibold hover:text-brand-700">
                              {t.sender}
                            </span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[13px] text-ink-soft">
                          {t.destination}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums">
                          {rupiah(t.amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-mute">
                          {t.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Side */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            <section className={card}>
              <h2 className={cardTitle}>Kode QRIS</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Dipindai langsung dari aplikasi bank atau e-wallet mana pun.
              </p>

              {hasQris ? (
                <div className="mt-5 text-center">
                  <QrisCode />
                  <p className="mt-3 text-[13px] font-bold">
                    SHILVIA ANISA 21ST BIRTHDAY
                  </p>
                  <p className="text-xs text-ink-mute">NMID: ID1024308123915</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQrisOpen(true)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line px-3.5 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50"
                    >
                      <Upload className="size-4 text-brand-600" />
                      Ganti
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHasQris(false);
                        showToast("Kode QRIS dihapus.");
                      }}
                      aria-label="Hapus QRIS"
                      className="grid size-9 place-items-center rounded-xl border border-line text-ink-mute transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-line px-5 py-8 text-center">
                  <QrCode className="size-8 text-ink-mute" />
                  <p className="mt-2 text-[13px] font-semibold">Belum ada kode QRIS</p>
                  <button
                    type="button"
                    onClick={() => setQrisOpen(true)}
                    className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-[13px] font-bold text-white hover:bg-brand-700"
                  >
                    <Upload className="size-4" />
                    Unggah QRIS
                  </button>
                </div>
              )}
            </section>

            <section className={card}>
              <h2 className={cardTitle}>Privasi &amp; fitur</h2>
              <ul className="mt-3 divide-y divide-line">
                {privacy.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-start justify-between gap-4 py-3.5 first:pt-1 last:pb-0"
                  >
                    <div>
                      <p className="text-[13px] font-semibold">{s.label}</p>
                      <p className="mt-0.5 text-xs leading-snug text-ink-mute">
                        {s.desc}
                      </p>
                    </div>
                    <Switch checked={s.checked} onChange={s.set} label={s.label} />
                  </li>
                ))}
              </ul>
            </section>

            <button
              type="button"
              onClick={saveAll}
              disabled={saving}
              className="h-12 w-full rounded-xl bg-brand-600 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(101,67,143,0.7)] transition hover:bg-brand-700 disabled:opacity-70"
            >
              {saving ? "Menyimpan…" : "Simpan pengaturan angpao"}
            </button>

            <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-ink-mute">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
              Perubahan nomor rekening memerlukan verifikasi kata sandi akun untuk
              mencegah phishing.
            </p>
          </aside>
        </div>
      </EventShell>

      {accountOpen && (
        <AccountModal
          key={editing?.id ?? "new"}
          account={editing}
          onClose={() => {
            setAccountOpen(false);
            setEditing(null);
          }}
          onSubmit={saveAccount}
        />
      )}
      {qrisOpen && (
        <QrisModal
          onClose={() => setQrisOpen(false)}
          onSave={() => {
            setHasQris(true);
            setQrisOpen(false);
            showToast("Kode QRIS diperbarui.");
          }}
        />
      )}
      {detail && <TransferModal transfer={detail} onClose={() => setDetail(null)} />}
    </>
  );
}
