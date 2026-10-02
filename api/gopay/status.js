import { merchant } from "../../lib/gopay-engine.js";

function checkToken(req) {
  const secret = process.env.INTERNAL_TOKEN || process.env.SCRAPER_TOKEN;
  if (!secret) return false; // INTERNAL_TOKEN wajib diisi, kalau kosong semua request ditolak

  const headerToken = req.headers["x-internal-token"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "") || req.query.token;
  return headerToken === secret;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!checkToken(req)) {
    return res.status(401).json({ error: "Unauthorized — invalid or missing x-internal-token" });
  }

  const ref = req.query.ref ? String(req.query.ref).trim() : "";
  const amount = Math.trunc(Number(req.query.amount));
  const createdAt = String(req.query.created_at || "");

  if (!ref && (!Number.isFinite(amount) || !createdAt)) {
    return res.status(400).json({ error: "ref OR (amount and created_at) query params are required" });
  }

  try {
    const historyRes = await merchant.getHistory({ days: 1, size: 30 });
    let isPaid = false;

    if (historyRes && historyRes.status && Array.isArray(historyRes.data?.histories)) {
      const createdMs = createdAt ? new Date(createdAt).getTime() : Date.now();
      const SKEW_MS = 90 * 1000;

      for (const item of historyRes.data.histories) {
        const raw = item.raw || {};
        const grossAmount = typeof raw.gross_amount === "number" ? raw.gross_amount / 100 : NaN;
        const txTime = raw.transaction_time ? new Date(raw.transaction_time).getTime() : NaN;
        const txId = raw.id || raw.wallstreet_transaction_id || "";

        // If ref is provided and matches transaction ID or ref format
        if (ref && (txId === ref || String(raw.order_id) === ref)) {
          isPaid = true;
          break;
        }

        // Match by amount + time
        if (Number.isFinite(amount) && grossAmount === amount && Number.isFinite(txTime)) {
          if (txTime >= createdMs - SKEW_MS) {
            isPaid = true;
            break;
          }
        }
      }
    }

    return res.status(200).json({
      paid: isPaid,
      status: isPaid ? "PAID" : "PENDING",
      ref_no: ref || undefined,
    });
  } catch (e) {
    return res.status(500).json({
      error: e?.message || String(e),
      paid: false,
      status: "ERROR",
    });
  }
}
