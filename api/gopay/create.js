import crypto from "node:crypto";
import { buildDynamicQris } from "../../lib/gopay-engine.js";

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

  const staticQr = process.env.GOPAY_STATIC_QR;
  if (!staticQr) {
    return res.status(500).json({ error: "GOPAY_STATIC_QR not configured" });
  }

  try {
    const amount = Math.trunc(Number(req.body && req.body.amount));
    if (!Number.isFinite(amount) || amount < 1) {
      return res.status(400).json({ error: "amount must be a positive integer" });
    }

    const qr_content = buildDynamicQris(staticQr, amount);
    const ref_no = "GP-" + crypto.randomBytes(10).toString("hex");
    const created_at = new Date().toISOString();

    return res.status(200).json({
      ref_no,
      amount,
      qr_content,
      created_at,
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
