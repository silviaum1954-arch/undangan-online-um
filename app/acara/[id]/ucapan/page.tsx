import { Suspense } from "react";
import Body from "./body";

async function Content({ params }: PageProps<"/acara/[id]/ucapan">) {
  const { id } = await params;
  return <Body slug={id} />;
}

export default function Page(props: PageProps<"/acara/[id]/ucapan">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <Content {...props} />
    </Suspense>
  );
}
