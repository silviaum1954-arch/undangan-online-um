export interface Wish {
  id: string;
  sender: string;
  tag: string;
  timeAgo: string;
  /** age in minutes, used for sorting */
  minutes: number;
  message: string;
  status: "tampil" | "disembunyikan";
  isSpam?: boolean;
  liked?: boolean;
}

export const INITIAL_WISHES: Wish[] = [
  {
    id: "w-1",
    sender: "Clarissa & Pasangan",
    tag: "Fiks hadir",
    timeAgo: "15 menit lalu",
    minutes: 15,
    message:
      "Happy 21st Birthday Shilvia sayang! Can't wait to celebrate together tomorrow! Semoga panjang umur, sehat selalu, makin bersinar karir dan studinya, and keep inspiring everyone around you! See you at The Glass House! 🥳✨",
    status: "tampil",
    liked: true,
  },
  {
    id: "w-2",
    sender: "Budi Pratama",
    tag: "Keluarga besar",
    timeAgo: "1 jam lalu",
    minutes: 60,
    message:
      "Selamat ulang tahun yang ke-21 Shilvia! Sukses selalu buat skripsi dan rencananya ke depan. Maaf nanti anak saya rada aktif ya hehe, titip salam buat om & tante sekeluarga.",
    status: "tampil",
  },
  {
    id: "w-3",
    sender: "Jessica Tanudjaya",
    tag: "Sahabat kuliah",
    timeAgo: "3 jam lalu",
    minutes: 180,
    message:
      "Selamat menginjak usia 21 Sil! Bahagia selalu, dilancarkan semua urusan, dan doa terbaik selalu menyertaimu. Outfit pastel sage udah siap buat besok! Can't wait!",
    status: "tampil",
  },
  {
    id: "w-4",
    sender: "Om Dani & Keluarga",
    tag: "Tamu VIP",
    timeAgo: "5 jam lalu",
    minutes: 300,
    message:
      "Barakallahu fii umrik ananda Shilvia tersayang. Semoga selalu dalam lindungan Allah SWT, menjadi kebanggaan orang tua, dan berkah di usia yang ke-21 tahun ini. Salam hangat dari Om Dani sekeluarga.",
    status: "tampil",
    liked: true,
  },
  {
    id: "w-5",
    sender: "Maya Salsabila",
    tag: "Rekan kerja",
    timeAgo: "7 jam lalu",
    minutes: 420,
    message:
      "Shilviaaa! Happy birthday cantik! Sedih banget berhalangan hadir langsung karena tugas kantor di luar kota, tapi doa tulusku selalu bersama kamu. Nanti kita catch up yaa sepulangku ke Jakarta! 🎂💖",
    status: "tampil",
  },
  {
    id: "w-6",
    sender: "Akun anonim",
    tag: "Terdeteksi spam",
    timeAgo: "Kemarin, 14:20",
    minutes: 1500,
    message:
      "Promo pinjaman dana tunai cepat cair tanpa jaminan bunga rendah hubungi wa 0812xxxxxx...",
    status: "disembunyikan",
    isSpam: true,
  },
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
