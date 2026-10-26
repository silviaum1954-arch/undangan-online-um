import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Invitation from "./invitation";
import { storageUrl, type PublicEvent } from "./model";

async function load(slug: string, guest: string | null) {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_event", {
    p_slug: slug,
    p_guest: guest ?? undefined,
  });
  if (error) throw new Error(error.message);
  return data as unknown as PublicEvent | null;
}

async function Content({ params, searchParams }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  const { to } = await searchParams;
  const guest = typeof to === "string" && to ? to : null;

  const data = await load(slug, guest);
  if (!data) notFound();

  return <Invitation data={data} guestSlug={guest} />;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { to } = await searchParams;
  const data = await load(slug, typeof to === "string" && to ? to : null);
  if (!data) return { title: "Undangan Digital", robots: { index: false } };

  const e = data.event;
  const title = e.og_title || e.title;
  const description =
    e.og_description ||
    (typeof e.design.tagline === "string" && e.design.tagline) ||
    "Anda diundang. Buka undangan digital ini untuk detail acara.";
  const image = e.og_image_path ? [storageUrl(e.og_image_path)] : undefined;

  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: image, type: "website" },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}

export default function Page(props: PageProps<"/e/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fff3f0]" aria-busy="true" />}>
      <Content {...props} />
    </Suspense>
  );
}
