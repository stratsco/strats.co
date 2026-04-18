import { RouteShell } from "@/components/route-shell";

type ToolPageProps = {
  params: Promise<{ game: string; tool: string }>;
};

export default async function ToolPage({ params }: ToolPageProps) {
  const { game, tool } = await params;
  return (
    <RouteShell
      title={`${game} Tool: ${tool}`}
      details="Tool shell route with room for collaborative state and saved artifacts."
    />
  );
}
