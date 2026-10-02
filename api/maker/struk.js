import { generateStrukImage } from "../../lib/struk-image.js";

function checkToken(req) {
  const secret = process.env.INTERNAL_TOKEN || process.env.SCRAPER_TOKEN;
  if (!secret) return false;

  const headerToken = req.headers["x-internal-token"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  return headerToken === secret;
}

// Struk/receipt image generator (POST body: {toko, items[], kasir, pelanggan, bayar, ...}).
// Generated fully in-process — no more calling out to media.keyrafara.com.
//
// Returns a PNG (not a PDF) because the main consumer of this endpoint is
// the WhatsApp bot, which needs actual image bytes for its `image` message
// field. If you need a print-quality PDF instead, lib/struk-generator.js
// still has the pdfkit-based generateStruk() — wire up a separate route for
// that if/when you need it.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!checkToken(req)) {
    return res.status(401).json({ error: "Unauthorized — invalid or missing x-internal-token" });
  }

  try {
    const body = req.body || {};
    if (JSON.stringify(body).length > 32 * 1024) {
      return res.status(413).json({ error: "payload too large (max 32kb)" });
    }

    const png = await generateStrukImage(body);

    return res.status(200).json({
      ok: true,
      mime: "image/png",
      filename: `struk-${body.nomorStruk || Date.now()}.png`,
      base64: png.toString("base64"),
    });
  } catch (e) {
    return res.status(400).json({
      ok: false,
      error: e?.message || String(e),
    });
  }
}
