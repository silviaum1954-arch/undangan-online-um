"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { QrCode, Upload, X } from "lucide-react";
import {
  BANKS,
  rupiah,
  type Account,
  type AccountType,
  type Transfer,
} from "./data";

const field =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-mute focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const btnGhost =
  "h-10 rounded-xl px-4 text-[13px] font-semibold text-ink-soft hover:bg-brand-50";
const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700";

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            {subtitle && <p className="text-[13px] text-ink-soft">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-mute hover:bg-brand-50"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold">
      {children}
    </label>
  );
}

export interface AccountValues {
  bankName: string;
  type: AccountType;
  accountNumber: string;
  accountHolder: string;
}

export function AccountModal({
  account,
  onClose,
  onSubmit,
}: {
  account: Account | null;
  onClose: () => void;
  onSubmit: (v: AccountValues) => void;
}) {
  const editing = account !== null;
  const [v, setV] = useState<AccountValues>({
    type: account?.type ?? "Bank",
    bankName: account?.bankName ?? BANKS.Bank[1],
    accountNumber: account?.accountNumber ?? "",
    accountHolder: account?.accountHolder ?? "Shilvia Anisa",
  });

  const banks = BANKS[v.type].includes(v.bankName)
    ? BANKS[v.type]
    : [v.bankName, ...BANKS[v.type]];

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!v.accountNumber.trim() || !v.accountHolder.trim()) return;
    onSubmit(v);
  }

  return (
    <Modal
      onClose={onClose}
      title={editing ? "Edit rekening" : "Tambah rekening"}
      subtitle="Bank maupun dompet digital."
    >
      <form onSubmit={submit} className="space-y-4">
        <div
          role="group"
          aria-label="Jenis layanan"
          className="grid grid-cols-2 rounded-xl bg-brand-50 p-1"
        >
          {(["Bank", "E-Wallet"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={v.type === t}
              onClick={() =>
                setV((p) => ({ ...p, type: t, bankName: BANKS[t][t === "Bank" ? 1 : 0] }))
              }
              className={`h-9 rounded-lg text-[13px] font-semibold transition ${
                v.type === t
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {t === "Bank" ? "Bank" : "Dompet digital"}
            </button>
          ))}
        </div>

        <div>
          <Label htmlFor="a-bank">
            {v.type === "Bank" ? "Nama bank" : "Dompet digital"}
          </Label>
          <select
            id="a-bank"
            value={v.bankName}
            onChange={(e) => setV((p) => ({ ...p, bankName: e.target.value }))}
            className={field}
          >
            {banks.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="a-number">
            {v.type === "Bank" ? "Nomor rekening" : "Nomor ponsel terdaftar"}
          </Label>
          <input
            id="a-number"
            required
            autoFocus
            inputMode="numeric"
            value={v.accountNumber}
            onChange={(e) => setV((p) => ({ ...p, accountNumber: e.target.value }))}
            placeholder="Contoh: 1230009876543"
            className={`${field} tabular-nums`}
          />
        </div>

        <div>
          <Label htmlFor="a-holder">Atas nama</Label>
          <input
            id="a-holder"
            required
            value={v.accountHolder}
            onChange={(e) => setV((p) => ({ ...p, accountHolder: e.target.value }))}
            className={field}
          />
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line pt-5">
          <button type="button" onClick={onClose} className={btnGhost}>
            Batal
          </button>
          <button type="submit" className={btnPrimary}>
            {editing ? "Simpan perubahan" : "Tambah rekening"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function QrisModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal
      onClose={onClose}
      title="Unggah kode QRIS"
      subtitle="Tamu bisa memindai langsung tanpa mengetik nomor rekening."
    >
      <button
        type="button"
        className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 px-6 py-8 text-center transition hover:bg-brand-50"
      >
        <Upload className="size-7 text-brand-600" />
        <span className="mt-2 text-[13px] font-semibold">Pilih file QRIS</span>
        <span className="mt-1 text-xs text-ink-mute">
          PNG atau JPG, maksimal 2 MB, rasio 1:1, minimal 500×500 px
        </span>
      </button>
      <p className="mt-3 text-xs text-ink-soft">
        Pastikan kontras hitam-putih jelas dan QRIS masih berlaku. QRIS dari bank
        atau merchant e-wallet mana pun bisa dipindai semua aplikasi.
      </p>
      <div className="mt-5 flex justify-end gap-2.5 border-t border-line pt-5">
        <button type="button" onClick={onClose} className={btnGhost}>
          Batal
        </button>
        <button type="button" onClick={onSave} className={btnPrimary}>
          Simpan QRIS
        </button>
      </div>
    </Modal>
  );
}

export function TransferModal({
  transfer,
  onClose,
}: {
  transfer: Transfer;
  onClose: () => void;
}) {
  const rows = [
    ["Pengirim", transfer.sender],
    ["Tujuan", transfer.destination],
    ["Waktu kirim", transfer.time],
  ];
  return (
    <Modal onClose={onClose} title="Rincian konfirmasi">
      <div className="rounded-2xl bg-brand-50 p-5 text-center">
        <p className="text-xs font-medium text-ink-soft">Tanda kasih</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums text-brand-700">
          {rupiah(transfer.amount)}
        </p>
      </div>
      <dl className="mt-4 divide-y divide-line text-[13px]">
        {rows.map(([k, val]) => (
          <div key={k} className="flex justify-between gap-4 py-2.5">
            <dt className="text-ink-soft">{k}</dt>
            <dd className="text-right font-semibold">{val}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={onClose} className={`${btnPrimary} mt-5 w-full`}>
        Tutup
      </button>
    </Modal>
  );
}

export function QrisCode() {
  return (
    <div className="relative mx-auto size-44 rounded-xl border border-line bg-white p-2.5">
      <svg viewBox="0 0 100 100" className="size-full fill-slate-900" aria-hidden>
        <rect x="0" y="0" width="28" height="28" rx="4" />
        <rect x="4" y="4" width="20" height="20" fill="white" rx="2" />
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <rect x="72" y="0" width="28" height="28" rx="4" />
        <rect x="76" y="4" width="20" height="20" fill="white" rx="2" />
        <rect x="80" y="8" width="12" height="12" rx="2" />
        <rect x="0" y="72" width="28" height="28" rx="4" />
        <rect x="4" y="76" width="20" height="20" fill="white" rx="2" />
        <rect x="8" y="80" width="12" height="12" rx="2" />
        {[
          [36, 8], [48, 14], [58, 8], [36, 24], [52, 24], [8, 36], [20, 42], [8, 54],
          [74, 36], [86, 42], [74, 54], [86, 60], [36, 74], [48, 80], [58, 74],
          [36, 88], [52, 88], [74, 74], [86, 82], [80, 90],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" />
        ))}
      </svg>
      <div className="absolute inset-0 m-auto grid size-9 place-items-center rounded-lg bg-brand-600 text-white shadow">
        <QrCode className="size-4" />
      </div>
    </div>
  );
}
