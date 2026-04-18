import { RouteShell } from "@/components/route-shell";

type DatabaseEntryPageProps = {
  params: Promise<{ game: string; category: string; slug: string }>;
};

export default async function DatabaseEntryPage({ params }: DatabaseEntryPageProps) {
  const { game, category, slug } = await params;
  return (
    <RouteShell
      title={`${game} DB: ${category}/${slug}`}
      details="Database entry route shell for per-game reference content."
    />
  );
}
