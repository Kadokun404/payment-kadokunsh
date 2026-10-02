# payment-kadokunsh

Gateway QRIS GoPay/GoBiz untuk Vercel. URL: https://payment-kadokunsh.vercel.app

## Deploy
1. Ekstrak zip, masuk ke folder `payment-kadokunsh`.
2. `npm i -g vercel`, lalu `vercel login`.
3. `vercel` di dalam folder. Saat ditanya nama project, isi `payment-kadokunsh` (supaya URL-nya sama).
4. Isi Environment Variables (lihat `.env.example`), minimal `GOPAY_EMAIL`, `GOPAY_PASSWORD`, `GOPAY_STATIC_QR`, `INTERNAL_TOKEN`:
   `vercel env add GOPAY_EMAIL production` (ulangi untuk tiap variabel), atau lewat dashboard Vercel.
5. `vercel --prod`.
6. Cek: buka https://payment-kadokunsh.vercel.app/health, harus keluar JSON.

## Endpoint (semua kecuali / dan /health butuh header `x-internal-token`)
- `POST /api/gopay/create` { amount } -> { ref_no, amount, qr_content, created_at }
- `GET /api/gopay/status?ref=&amount=&created_at=` -> { paid, status }
- `POST /api/gopay/cancel` -> { ok } (tidak membatalkan QR, hanya respon ok)
- `POST /api/maker/struk` -> { ok, mime, filename, base64 } (PNG)
