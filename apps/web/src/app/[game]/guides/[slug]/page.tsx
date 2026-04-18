import { RouteShell } from "@/components/route-shell";

type GuidePageProps = {
  params: Promise<{ game: string; slug: string }>;
};

export default async function GuidePage({ params }: GuidePageProps) {
  const { game, slug } = await params;
  return (
    <RouteShell
      title={`${game} Guide: ${slug}`}
      details="Editorial guide route scaffold (SSR/ISR target)."
    />
  );
}
