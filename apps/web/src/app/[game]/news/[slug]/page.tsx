import { RouteShell } from "@/components/route-shell";

type NewsPageProps = {
  params: Promise<{ game: string; slug: string }>;
};

export default async function NewsPage({ params }: NewsPageProps) {
  const { game, slug } = await params;
  return (
    <RouteShell
      title={`${game} News: ${slug}`}
      details="News detail route shell for game announcements and updates."
    />
  );
}
