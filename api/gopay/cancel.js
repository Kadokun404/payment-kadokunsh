function checkToken(req) {
  const secret = process.env.INTERNAL_TOKEN || process.env.SCRAPER_TOKEN;
  if (!secret) return false; // INTERNAL_TOKEN wajib diisi, kalau kosong semua request ditolak

  const headerToken = req.headers["x-internal-token"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  return headerToken === secret;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!checkToken(req)) {
    return res.status(401).json({ error: "Unauthorized — invalid or missing x-internal-token" });
  }

  const ref = req.body && req.body.ref ? String(req.body.ref) : null;
  const amount = Math.trunc(Number(req.body && req.body.amount));

  return res.status(200).json({
    ok: true,
    cancelled: true,
    ref: ref || undefined,
    amount: Number.isFinite(amount) ? amount : undefined
  });
}
