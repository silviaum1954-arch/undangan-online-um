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
import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "@/lib/supabase/use-user";
import type { ShellEvent } from "@/lib/data/events";
import Switch from "../switch";
import {
  toAccount,
  toDbType,
  toTransfer,
  type GiftSettings,
  MAX_ACCOUNTS,
  initials,
  logoFor,
  rupiah,
  type Account,
  type Transfer,
} from "./data";
import {
  AccountModal,
  QrisModal,
  TransferFormModal,
  TransferModal,
  type AccountValues,
} from "./modals";

const card = "rounded-2xl border border-line bg-white p-6";
const cardTitle = "text-[15px] font-bold";
const iconBtn =
  "grid size-8 place-items-center rounded-lg text-ink-mute transition hover:bg-brand-50 hover:text-brand-700";

export default function AngpaoDigitalPage({
  slug,
  shell,
  eventId,
  initialAccounts,
  initialTransfers,
  initialSettings,
  initialQrisPath,
}: {
  slug: string;
  shell: ShellEvent;
  eventId: string;
  initialAccounts: Account[];
  initialTransfers: Transfer[];
  initialSettings: GiftSettings;
  initialQrisPath: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const user = useCurrentUser();
  const [sectionActive, setSectionActive] = useState(initialSettings.enabled);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [qrisPath, setQrisPath] = useState<string | null>(initialQrisPath);
  const hasQris = qrisPath !== null;
  const qrisUrl = qrisPath
    ? supabase.storage.from("event-media").getPublicUrl(qrisPath).data.publicUrl
    : null;
  const [transferOpen, setTransferOpen] = useState(false);

  const [personalOnly, setPersonalOnly] = useState(initialSettings.personalOnly);
  const [transferForm, setTransferForm] = useState(initialSettings.transferForm);
  const [emailNotif, setEmailNotif] = useState(initialSettings.emailNotify);

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

  async function toggleAccount(a: Account) {
    const { error } = await supabase
      .from("payment_accounts")
      .update({ is_active: !a.isActive })
      .eq("id", a.id);
    if (error) return showToast(`Gagal memperbarui: ${error.message}`);
    setAccounts((p) => p.map((x) => (x.id === a.id ? { ...x, isActive: !x.isActive } : x)));
    showToast(
      a.isActive
        ? `${a.bankName} disembunyikan dari undangan.`
        : `${a.bankName} kini tayang di undangan.`,
    );
  }

  async function removeAccount(a: Account) {
    if (!confirm(`Hapus rekening ${a.bankName}?`)) return;
    const { error } = await supabase.from("payment_accounts").delete().eq("id", a.id);
    if (error) return showToast(`Gagal menghapus: ${error.message}`);
    const rest = accounts.filter((x) => x.id !== a.id);
    // keep exactly one primary account when any remain
    if (a.isPrimary && rest.length > 0) {
      const { error: e2 } = await supabase
        .from("payment_accounts")
        .update({ is_primary: true })
        .eq("id", rest[0].id);
      if (!e2) rest[0] = { ...rest[0], isPrimary: true };
    }
    setAccounts(rest);
    showToast(`Rekening ${a.bankName} dihapus.`);
  }

  async function saveAccount(v: AccountValues) {
    const fields = {
      bank_name: v.bankName,
      type: toDbType(v.type),
      account_number: v.accountNumber,
      account_holder: v.accountHolder,
    };
    if (editing) {
      const { data, error } = await supabase
        .from("payment_accounts")
        .update(fields)
        .eq("id", editing.id)
        .select()
        .single();
      if (error) return showToast(`Gagal menyimpan: ${error.message}`);
      setAccounts((p) => p.map((x) => (x.id === editing.id ? toAccount(data) : x)));
      showToast(`Rekening ${v.bankName} diperbarui.`);
    } else {
      const { data, error } = await supabase
        .from("payment_accounts")
        .insert({
          ...fields,
          event_id: eventId,
          is_primary: accounts.length === 0,
          sort_order: accounts.length,
        })
        .select()
        .single();
      if (error) return showToast(`Gagal menambah rekening: ${error.message}`);
      setAccounts((p) => [...p, toAccount(data)]);
      showToast(`Rekening ${v.bankName} ditambahkan.`);
    }
    setAccountOpen(false);
    setEditing(null);
  }

  async function saveAll() {
    setSaving(true);
    const { error } = await supabase
      .from("events")
      .update({
        gift_personal_only: personalOnly,
        gift_transfer_form: transferForm,
        gift_email_notify: emailNotif,
      })
      .eq("id", eventId);
    setSaving(false);
    showToast(error ? `Gagal menyimpan: ${error.message}` : "Pengaturan angpao disimpan.");
  }

  async function toggleSection(v: boolean) {
    const { error } = await supabase.from("events").update({ gift_enabled: v }).eq("id", eventId);
    if (error) return showToast(`Gagal menyimpan: ${error.message}`);
    setSectionActive(v);
    showToast(
      v ? "Bagian angpao tampil di undangan." : "Bagian angpao disembunyikan dari undangan.",
    );
  }

  async function uploadQris(file: File) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${auth.user.id}/${eventId}/qris-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("event-media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (up.error) return false;
    const { error } = await supabase.from("events").update({ qris_path: path }).eq("id", eventId);
    if (error) return false;
    if (qrisPath) await supabase.storage.from("event-media").remove([qrisPath]);
    setQrisPath(path);
    setQrisOpen(false);
    showToast("Kode QRIS diperbarui.");
    return true;
  }

  function exportCsv() {
    if (transfers.length === 0) return showToast("Belum ada transfer untuk diekspor.");
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const rows = [
      "Pengirim,Tujuan,Nominal,Waktu",
      ...transfers.map((t) => [esc(t.sender), esc(t.destination), t.amount, esc(t.time)].join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konfirmasi-transfer-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${transfers.length} konfirmasi diekspor ke CSV.`);
  }

  async function removeQris() {
    if (!qrisPath) return;
    const { error } = await supabase.from("events").update({ qris_path: null }).eq("id", eventId);
    if (error) return showToast(`Gagal menghapus: ${error.message}`);
    await supabase.storage.from("event-media").remove([qrisPath]);
    setQrisPath(null);
    showToast("Kode QRIS dihapus.");
  }

  async function addTransfer(v: { sender: string; amount: number; destination: string }) {
    const { data, error } = await supabase
      .from("gift_confirmations")
      .insert({
        event_id: eventId,
        sender_name: v.sender,
        amount: v.amount,
        destination: v.destination,
      })
      .select()
      .single();
    if (error) return showToast(`Gagal mencatat transfer: ${error.message}`);
    setTransfers((p) => [toTransfer(data), ...p]);
    setTransferOpen(false);
    showToast("Transfer dicatat.");
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
      desc: `Kirim email ke ${user?.email ?? "email akun Anda"} setiap ada konfirmasi baru.`,
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
        event={shell}
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
              onChange={toggleSection}
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
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferOpen(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-[13px] font-bold text-white transition hover:bg-brand-700"
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                    Catat
                  </button>
                  <button
                    type="button"
                    onClick={() => exportCsv()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line px-3.5 text-[13px] font-semibold transition hover:border-brand-200 hover:bg-brand-50"
                  >
                    <Download className="size-4 text-ink-mute" />
                    Ekspor CSV
                  </button>
                </div>
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
          <aside className="space-y-6 lg:sticky lg:top-32">
            <section className={card}>
              <h2 className={cardTitle}>Kode QRIS</h2>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                Dipindai langsung dari aplikasi bank atau e-wallet mana pun.
              </p>

              {hasQris ? (
                <div className="mt-5 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrisUrl ?? ""}
                    alt="Kode QRIS acara"
                    className="mx-auto size-44 rounded-xl border border-line bg-white object-contain p-2"
                  />
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
                      onClick={removeQris}
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
          defaultHolder={user?.name ?? ""}
          onClose={() => {
            setAccountOpen(false);
            setEditing(null);
          }}
          onSubmit={saveAccount}
        />
      )}
      {qrisOpen && (
        <QrisModal onClose={() => setQrisOpen(false)} onUpload={uploadQris} />
      )}
      {transferOpen && (
        <TransferFormModal
          destinations={[
            ...accounts.filter((a) => a.isActive).map((a) => `${a.bankName} · ${a.accountHolder}`),
            ...(hasQris ? ["QRIS"] : []),
            "Lainnya",
          ]}
          onClose={() => setTransferOpen(false)}
          onSubmit={addTransfer}
        />
      )}
      {detail && <TransferModal transfer={detail} onClose={() => setDetail(null)} />}
    </>
  );
}
