export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).json({
    service: "gopay-qris-gateway",
    host: "https://payment-kadokunsh.vercel.app",
    auth: "REQUIRED header: x-internal-token: $INTERNAL_TOKEN (all routes except / & /health)",
    totalEndpoints: 4,
    endpoints: [
      {
        method: "POST",
        path: "/api/gopay/create",
        description: "POST: Generate dynamic GoPay QRIS code",
        params: ["amount"]
      },
      {
        method: "GET",
        path: "/api/gopay/status",
        description: "GET: Check GoPay transaction payment status",
        params: ["ref", "amount", "created_at"]
      },
      {
        method: "POST",
        path: "/api/gopay/cancel",
        description: "POST: Cancel pending QRIS charge",
        params: ["ref", "amount"]
      },
      {
        method: "POST",
        path: "/api/maker/struk",
        description: "POST: Generate receipt image (PNG, base64)",
        params: ["toko", "items", "bayar", "metodeBayar", "nomorStruk"]
      }
    ]
  });
}
