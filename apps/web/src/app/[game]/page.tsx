import { RouteShell } from "@/components/route-shell";

type GameHomeProps = {
  params: Promise<{ game: string }>;
};

export default async function GameHome({ params }: GameHomeProps) {
  const { game } = await params;
  return (
    <RouteShell
      title={`${game} Home`}
      details="Game landing page shell. Add highlights, featured guides, and guild spotlights."
    />
  );
}
