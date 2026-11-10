import React from "react";

export default function DocsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12 w-full">
      <div className="mb-10">
        <span className="badge-neo bg-sky-200 -rotate-2 mb-3">API Reference</span>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Dokumentasi API JSON</h1>
        <p className="font-semibold text-slate-600">
          Integrasikan sistem pembayaran QRIS GoPay dinamis ke website toko atau bot kamu dalam hitungan menit.
        </p>
      </div>

      {/* AUTH */}
      <div className="card-neo p-7 bg-white mb-8">
        <h2 className="text-xl font-black mb-3 text-slate-900">🔐 Autentikasi</h2>
        <p className="font-semibold text-slate-600 text-sm mb-4">
          Semua endpoint API membutuhkan autentikasi header <code className="bg-sky-100 border border-slate-900 px-1.5 py-0.5 rounded font-bold">x-internal-token</code>.
        </p>
        <div className="code-box">
Headers:
  x-internal-token: kado_live_xxxxxxxxxxxx
  Content-Type: application/json
        </div>
      </div>

      {/* ENDPOINT CREATE */}
      <div className="card-neo p-7 bg-white mb-8">
        <div className="flex gap-2.5 items-center mb-3">
          <span className="badge-neo bg-blue-600 text-white">POST</span>
          <span className="font-mono font-bold text-lg">/api/gopay/create</span>
        </div>
        <p className="font-semibold text-slate-600 text-sm mb-4">
          Generate kode QRIS dinamis untuk nominal tertentu secara instan.
        </p>
        <div className="text-xs font-black uppercase text-slate-500 mb-1">Request Body (JSON):</div>
        <div className="code-box mb-4">
{`{
  "amount": 50000
}`}
        </div>
        <div className="text-xs font-black uppercase text-slate-500 mb-1">Response (200 OK):</div>
        <div className="code-box">
{`{
  "ok": true,
  "ref_no": "TRX-KDK-192841",
  "amount": 50000,
  "qr_content": "00020101021226670014ID.GO-JEK.WWW...",
  "expires_in": 300
}`}
        </div>
      </div>

      {/* ENDPOINT STATUS */}
      <div className="card-neo p-7 bg-white mb-8">
        <div className="flex gap-2.5 items-center mb-3">
          <span className="badge-neo bg-emerald-400">GET</span>
          <span className="font-mono font-bold text-lg">/api/gopay/status</span>
        </div>
        <p className="font-semibold text-slate-600 text-sm mb-4">
          Cek status pembayaran mutasi GoPay apakah sudah lunas atau belum.
        </p>
        <div className="text-xs font-black uppercase text-slate-500 mb-1">Query Parameters:</div>
        <div className="code-box mb-4">
GET /api/gopay/status?ref=TRX-KDK-192841&amount=50000
        </div>
        <div className="text-xs font-black uppercase text-slate-500 mb-1">Response:</div>
        <div className="code-box">
{`{
  "ok": true,
  "paid": true,
  "ref": "TRX-KDK-192841",
  "amount": 50000
}`}
        </div>
      </div>

      {/* WEBHOOK */}
      <div className="card-neo p-7 bg-sky-100 mb-8">
        <div className="flex gap-2 items-center mb-3">
          <span className="text-2xl">🚀</span>
          <h2 className="text-xl font-black text-slate-900">Webhook Realtime Callback</h2>
        </div>
        <p className="font-semibold text-slate-600 text-sm mb-4">
          Saat pembayaran terdeteksi di mutasi GoPay, server otomatis menembak webhook POST ke URL tokomu:
        </p>
        <div className="code-box">
{`POST https://tokokamu.com/api/callback
Content-Type: application/json

{
  "event": "payment.success",
  "ref": "TRX-KDK-192841",
  "amount": 50000,
  "status": "PAID"
}`}
        </div>
      </div>
    </div>
  );
}
