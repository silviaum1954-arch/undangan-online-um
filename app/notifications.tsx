"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Gift, MessageSquare, UserCheck, UserX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { rupiah, timeAgo } from "@/lib/format";

interface Item {
  key: string;
  at: number;
  icon: typeof Bell;
  tone: string;
  title: string;
  sub: string;
  href: string;
}

const SEEN_KEY = "undangkuy:notif-seen";

/** Recent RSVPs, wishes and gifts across the owner's events. */
export default function Notifications({ className }: { className: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [seen, setSeen] = useState(0);

  useEffect(() => {
    let alive = true;
    try {
      setTimeout(() => alive && setSeen(Number(localStorage.getItem(SEEN_KEY)) || 0), 0);
    } catch {
      /* storage unavailable */
    }

    (async () => {
      const [g, w, a] = await Promise.all([
        supabase
          .from("guests")
          .select("name, status, adults, children, responded_at, events(title, slug)")
          .not("responded_at", "is", null)
          .neq("status", "pending")
          .order("responded_at", { ascending: false })
          .limit(8),
        supabase
          .from("wishes")
          .select("id, sender_name, created_at, events(title, slug)")
          .eq("is_spam", false)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("gift_confirmations")
          .select("id, sender_name, amount, created_at, events(title, slug)")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      if (!alive) return;
      const now = Date.now();
      const list: Item[] = [];
      for (const r of g.data ?? []) {
        const ev = r.events;
        if (!ev || !r.responded_at) continue;
        const yes = r.status === "fiks";
        list.push({
          key: `g-${r.name}-${r.responded_at}`,
          at: new Date(r.responded_at).getTime(),
          icon: yes ? UserCheck : UserX,
          tone: yes ? "bg-emerald-50 text-emerald-600" : r.status === "ragu" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600",
          title: `${r.name} ${yes ? "konfirmasi hadir" : r.status === "ragu" ? "belum pasti hadir" : "berhalangan hadir"}`,
          sub: `${ev.title} · ${timeAgo(r.responded_at, now)}`,
          href: `/acara/${ev.slug}/tamu`,
        });
      }
      for (const r of w.data ?? []) {
        const ev = r.events;
        if (!ev) continue;
        list.push({
          key: `w-${r.id}`,
          at: new Date(r.created_at).getTime(),
          icon: MessageSquare,
          tone: "bg-brand-50 text-brand-600",
          title: `Ucapan baru dari ${r.sender_name}`,
          sub: `${ev.title} · ${timeAgo(r.created_at, now)}`,
          href: `/acara/${ev.slug}/ucapan`,
        });
      }
      for (const r of a.data ?? []) {
        const ev = r.events;
        if (!ev) continue;
        list.push({
          key: `a-${r.id}`,
          at: new Date(r.created_at).getTime(),
          icon: Gift,
          tone: "bg-amber-50 text-amber-600",
          title: `${r.sender_name} mengirim angpao ${rupiah(r.amount)}`,
          sub: `${ev.title} · ${timeAgo(r.created_at, now)}`,
          href: `/acara/${ev.slug}/angpao`,
        });
      }
      list.sort((x, y) => y.at - x.at);
      setItems(list.slice(0, 8));
    })();

    return () => {
      alive = false;
    };
  }, [supabase]);

  const unread = (items ?? []).filter((i) => i.at > seen).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && items?.length) {
      const latest = items[0].at;
      try {
        localStorage.setItem(SEEN_KEY, String(latest));
      } catch {
        /* storage unavailable */
      }
      // keep the badge visible while the panel is open, clear it afterwards
      setTimeout(() => setSeen(latest), 1500);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifikasi, ${unread} baru` : "Notifikasi"}
        aria-expanded={open}
        onClick={toggle}
        className={className}
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-600 ring-2 ring-white" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-white p-2 shadow-xl">
            <p className="px-2.5 py-2 text-xs font-semibold text-ink-mute">Aktivitas terbaru</p>
            {items === null ? (
              <p className="px-2.5 py-4 text-[13px] text-ink-soft">Memuat…</p>
            ) : items.length === 0 ? (
              <p className="px-2.5 py-4 text-[13px] text-ink-soft">
                Belum ada aktivitas. Konfirmasi tamu, ucapan, dan angpao akan muncul di sini.
              </p>
            ) : (
              <ul>
                {items.map((i) => (
                  <li key={i.key}>
                    <Link
                      href={i.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-lg px-2.5 py-2 hover:bg-brand-50"
                    >
                      <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${i.tone}`}>
                        <i.icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold leading-snug">{i.title}</span>
                        <span className="block truncate text-xs text-ink-soft">{i.sub}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
