import { RouteShell } from "@/components/route-shell";

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  return (
    <RouteShell
      title={`User: ${username}`}
      details="Public user profile shell."
    />
  );
}
