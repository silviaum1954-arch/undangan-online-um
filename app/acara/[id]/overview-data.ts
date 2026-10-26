export type ActivityKind = "hadir" | "ragu" | "batal" | "wish" | "gift";

export interface Activity {
  key: string;
  kind: ActivityKind;
  who: string;
  what: string;
  when: string;
}

export interface OverviewData {
  event: {
    id: string;
    title: string;
    slug: string;
    status: "draf" | "terbit" | "selesai" | "diarsipkan";
    dateISO: string;
    dateLabel: string;
    time: string | null;
    venueName: string | null;
    venueAddress: string | null;
    themeId: string;
  };
  rsvp: { hadir: number; ragu: number; batal: number; pending: number };
  catering: { pax: number; adults: number; children: number };
  activities: Activity[];
}
