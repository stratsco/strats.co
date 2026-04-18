export async function GET() {
  return Response.json({
    ok: true,
    service: "strats-web",
    timestamp: new Date().toISOString()
  });
}
