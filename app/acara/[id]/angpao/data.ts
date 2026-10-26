export type AccountType = "Bank" | "E-Wallet";

export interface Account {
  id: string;
  bankName: string;
  type: AccountType;
  accountNumber: string;
  accountHolder: string;
  isPrimary?: boolean;
  isActive: boolean;
}

export interface Transfer {
  id: string;
  sender: string;
  destination: string;
  amount: number;
  time: string;
}

export const MAX_ACCOUNTS = 5;

export const BANKS: Record<AccountType, string[]> = {
  Bank: [
    "Bank Central Asia (BCA)",
    "Bank Mandiri",
    "Bank BNI",
    "Bank BRI",
    "Bank Syariah Indonesia (BSI)",
    "Bank Jenius (BTPN)",
    "Bank CIMB Niaga",
  ],
  "E-Wallet": ["GoPay", "ShopeePay", "OVO", "DANA", "LinkAja"],
};

/** Brand tile for known providers; falls back to the product purple. */
export function logoFor(name: string): { bg: string; text: string } {
  const n = name.toLowerCase();
  if (n.includes("bca")) return { bg: "bg-[#003882]", text: "BCA" };
  if (n.includes("mandiri")) return { bg: "bg-[#003d79]", text: "MDR" };
  if (n.includes("bni")) return { bg: "bg-[#f15a24]", text: "BNI" };
  if (n.includes("bri")) return { bg: "bg-[#00529c]", text: "BRI" };
  if (n.includes("gopay")) return { bg: "bg-[#00aed6]", text: "GoPay" };
  if (n.includes("ovo")) return { bg: "bg-[#4c3298]", text: "OVO" };
  if (n.includes("shopee")) return { bg: "bg-[#ee4d2d]", text: "SPay" };
  if (n.includes("dana")) return { bg: "bg-[#118eea]", text: "DANA" };
  return { bg: "bg-brand-700", text: name.slice(0, 3).toUpperCase() };
}

export const rupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    bankName: "Bank Central Asia (BCA)",
    type: "Bank",
    accountNumber: "522-089-1234",
    accountHolder: "Shilvia Anisa",
    isPrimary: true,
    isActive: true,
  },
  {
    id: "acc-2",
    bankName: "GoPay",
    type: "E-Wallet",
    accountNumber: "0812-3456-7890",
    accountHolder: "Shilvia Anisa",
    isActive: true,
  },
];

export const INITIAL_TRANSFERS: Transfer[] = [
  { id: "tf-1", sender: "Clarissa & Pasangan", destination: "BCA · Shilvia Anisa", amount: 500000, time: "Hari ini, 14:20 WIB" },
  { id: "tf-2", sender: "Budi Pratama", destination: "QRIS", amount: 350000, time: "Hari ini, 11:05 WIB" },
  { id: "tf-3", sender: "Om Dani & Keluarga", destination: "BCA · Shilvia Anisa", amount: 1000000, time: "Kemarin, 20:15 WIB" },
  { id: "tf-4", sender: "Jessica Tanudjaya", destination: "GoPay · Shilvia Anisa", amount: 250000, time: "Kemarin, 16:40 WIB" },
];

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter((p) => /[a-z0-9]/i.test(p))
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "?"
  );
}
