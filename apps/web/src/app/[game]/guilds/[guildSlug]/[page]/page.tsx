import { RouteShell } from "@/components/route-shell";

type GuildSubPageProps = {
  params: Promise<{ game: string; guildSlug: string; page: string }>;
};

export default async function GuildSubPage({ params }: GuildSubPageProps) {
  const { game, guildSlug, page } = await params;
  return (
    <RouteShell
      title={`${game} Guild: ${guildSlug}/${page}`}
      details="Guild subpage shell for roster, events, and strategy pages."
    />
  );
}
