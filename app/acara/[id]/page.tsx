import { Suspense } from "react";
import Overview from "./overview";

async function EventOverview({ params }: PageProps<"/acara/[id]">) {
  const { id } = await params;
  return <Overview slug={id} />;
}

export default function Page(props: PageProps<"/acara/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <EventOverview {...props} />
    </Suspense>
  );
}
