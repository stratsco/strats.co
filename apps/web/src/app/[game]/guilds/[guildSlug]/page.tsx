import { RouteShell } from "@/components/route-shell";

type GuildHomePageProps = {
  params: Promise<{ game: string; guildSlug: string }>;
};

export default async function GuildHomePage({ params }: GuildHomePageProps) {
  const { game, guildSlug } = await params;
  return (
    <RouteShell
      title={`${game} Guild: ${guildSlug}`}
      details="Guild home route shell with verification status and linked Discord metadata."
    />
  );
}
