type RouteShellProps = {
  title: string;
  details: string;
};

export function RouteShell({ title, details }: RouteShellProps) {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>{title}</h1>
      <p>{details}</p>
    </main>
  );
}
