export interface InviteEvent {
  title: string;
  dateLabel: string;
  time: string | null;
  venue: string | null;
}

/** WhatsApp invitation text for one guest. */
export function inviteMessage(event: InviteEvent, guestName: string, link: string) {
  const lines = [
    `Halo ${guestName}! ✨`,
    "",
    `Kami mengundang Anda untuk hadir di *${event.title}*.`,
    "",
    `📅 ${event.dateLabel}${event.time ? ` · ${event.time}` : ""}`,
    event.venue ? `📍 ${event.venue}` : null,
    "",
    "Buka undangan personal Anda di:",
    link,
    "",
    "Mohon konfirmasi kehadiran Anda. Terima kasih! 🙏",
  ];
  return lines.filter((l) => l !== null).join("\n");
}
