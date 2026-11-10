"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function HomePage() {
  const [demoAmount, setDemoAmount] = useState<number>(10000);
  const [demoRef, setDemoRef] = useState<string>("TRX-DEMO-991");

  const handleGenerate = () => {
    setDemoRef("TRX-" + Math.floor(100000 + Math.random() * 900000));
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const qrisPayload = `00020101021226670014ID.GO-JEK.WWW01189360091438921041920215G082914109283710303UMI51440014ID.LINKAJA.WWW0215LK0829141092837520458125303360540${String(demoAmount).length}${demoAmount}5802ID5913KADOKUN STORE6007BANDUNG61054011562070703A016304`;

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 w-full">
      {/* HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-20">
        <div>
          <div className="flex gap-2.5 mb-5 flex-wrap">
            <span className="badge-neo bg-amber-300 -rotate-2">⚡ 0% Fee Transaksi</span>
            <span className="badge-neo bg-sky-200">✨ Deteksi Mutasi 3 Detik</span>
            <span className="badge-neo bg-emerald-300 rotate-2">🚀 Auto Payout</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-[1.15] mb-5 tracking-tight text-slate-900">
            Gateway QRIS Realtime,{" "}
            <span className="text-blue-600 underline decoration-amber-400 decoration-wavy decoration-4">
              Tinggal Tap Tap!
            </span>
          </h1>

          <p className="text-lg font-semibold text-slate-600 mb-8 leading-relaxed">
            Terima pembayaran dari seluruh e-wallet & m-banking Indonesia tanpa potongan komisi sepeserpun. Lengkap dengan webhook instan, API JSON praktis, dan auto-disbursement!
          </p>

          <div className="flex gap-4 flex-wrap mb-9">
            <a href="/dashboard" className="btn-neo btn-primary text-base py-3.5 px-8">
              <span>Buka Dashboard</span> ➔
            </a>
            <a href="/docs" className="btn-neo btn-secondary text-base py-3.5 px-8">
              <span>Dokumentasi API</span> 📖
            </a>
          </div>

          <div className="flex gap-6 items-center border-t-2 border-dashed border-slate-300 pt-5">
            <div>
              <div className="text-2xl font-black text-blue-600">0% Fee</div>
              <div className="text-xs font-bold text-slate-500">Tanpa Potongan</div>
            </div>
            <div className="w-0.5 h-9 bg-slate-300"></div>
            <div>
              <div className="text-2xl font-black text-slate-900">&lt; 3 Detik</div>
              <div className="text-xs font-bold text-slate-500">Respon Mutasi</div>
            </div>
            <div className="w-0.5 h-9 bg-slate-300"></div>
            <div>
              <div className="text-2xl font-black text-emerald-600">100%</div>
              <div className="text-xs font-bold text-slate-500">Dana Masuk Utuh</div>
            </div>
          </div>
        </div>

        {/* HERO BANNER CARD */}
        <div className="card-neo p-3.5 bg-white">
          <img
            src="/thumbnail.jpg"
            alt="QRIS Merchant Kadokun"
            className="w-full rounded-2xl border-2 border-slate-900 block"
          />
          <div className="p-4 flex justify-between items-center">
            <span className="font-extrabold text-sm text-slate-900">⚡ TypeScript + Next.js App Router Edition</span>
            <span className="badge-neo bg-blue-600 text-white">Live System</span>
          </div>
        </div>
      </div>

      {/* FITUR GRID */}
      <section id="fitur" className="mb-20">
        <div className="text-center mb-10">
          <span className="badge-neo bg-sky-200 -rotate-2 mb-3">Keunggulan Utama</span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Kenapa Memilih QRIS Kadokun?</h2>
          <p className="font-semibold text-slate-500 mt-2">Dibuat khusus untuk kemudahan toko online, bot, dan developer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-neo p-7 bg-white">
            <div className="text-4xl mb-3">💸</div>
            <h3 className="text-xl font-black mb-2 text-slate-900">0% Biaya Transaksi</h3>
            <p className="text-slate-600 font-semibold text-sm leading-relaxed">
              Tidak ada potongan persentase jahat 0.7% atau biaya per transaksi. Uang pembeli masuk utuh 100% ke saldo merchant kamu!
            </p>
          </div>

          <div className="card-neo p-7 bg-sky-100">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-black mb-2 text-slate-900">Mutasi Cepat 3 Detik</h3>
            <p className="text-slate-600 font-semibold text-sm leading-relaxed">
              Begitu customer scan & bayar via BCA, DANA, GoPay, OVO, ShopeePay, mutasi langsung terdeteksi otomatis detik itu juga.
            </p>
          </div>

          <div className="card-neo p-7 bg-white">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-black mb-2 text-slate-900">Auto-Disbursement Ready</h3>
            <p className="text-slate-600 font-semibold text-sm leading-relaxed">
              Tarik saldo kapanpun tanpa perlu nunggu berhari-hari. Saldo di dashboard langsung cair ke nomor e-wallet atau rekening bank kamu.
            </p>
          </div>

          <div className="card-neo p-7 bg-white">
            <div className="text-4xl mb-3">🧾</div>
            <h3 className="text-xl font-black mb-2 text-slate-900">Struk Digital Kasir HD</h3>
            <p className="text-slate-600 font-semibold text-sm leading-relaxed">
              Otomatis membuat gambar struk kasir profesional (PNG/Base64) lengkap dengan rincian barang, total bayar, kasir, dan nomor referensi.
            </p>
          </div>

          <div className="card-neo p-7 bg-amber-100">
            <div className="text-4xl mb-3">🧩</div>
            <h3 className="text-xl font-black mb-2 text-slate-900">Integrasi JSON 1-Baris</h3>
            <p className="text-slate-600 font-semibold text-sm leading-relaxed">
              Hanya butuh 1 HTTP POST untuk buat QRIS dan 1 webhook listener untuk terima pembayaran. Kompatibel dengan PHP, Node.js, Python, & Go!
            </p>
          </div>

          <div className="card-neo p-7 bg-white">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-xl font-black mb-2 text-slate-900">Hosted Checkout Page</h3>
            <p className="text-slate-600 font-semibold text-sm leading-relaxed">
              Cukup redirect pembeli ke link checkout resmi dengan countdown timer 5 menit dan deteksi otomatis lunas.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO INTERAKTIF */}
      <section className="card-neo p-9 bg-white mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="badge-neo bg-emerald-200 -rotate-1 mb-3">Interactive Demo</span>
            <h2 className="text-3xl font-black mb-3 text-slate-900">Coba Generate QRIS Sekarang</h2>
            <p className="font-semibold text-slate-600 mb-6 text-sm leading-relaxed">
              Masukkan nominal yang ingin kamu tes. QRIS dinamis akan otomatis di-generate secara instan di layar kamu!
            </p>

            <div className="mb-4">
              <label className="block font-black text-xs uppercase text-slate-700 mb-2">Nominal Pembayaran (Rp):</label>
              <input
                type="number"
                className="input-neo"
                value={demoAmount}
                min={1000}
                max={5000000}
                step={1000}
                onChange={(e) => setDemoAmount(parseInt(e.target.value, 10) || 10000)}
              />
            </div>

            <div className="flex gap-2.5 mb-6">
              <button className="btn-neo text-xs py-1.5 px-3 bg-white" onClick={() => setDemoAmount(5000)}>Rp 5.000</button>
              <button className="btn-neo text-xs py-1.5 px-3 bg-white" onClick={() => setDemoAmount(25000)}>Rp 25.000</button>
              <button className="btn-neo text-xs py-1.5 px-3 bg-white" onClick={() => setDemoAmount(50000)}>Rp 50.000</button>
            </div>

            <button className="btn-neo btn-primary w-full justify-center" onClick={handleGenerate}>
              <span>Generate Dynamic QRIS</span> ⚡
            </button>
          </div>

          <div className="flex flex-col items-center justify-center bg-slate-50 border-[2.5px] border-slate-900 rounded-2xl p-6 text-center">
            <div className="bg-white p-3.5 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_#0f172a] mb-4">
              <QRCodeSVG value={qrisPayload} size={180} level="M" />
            </div>
            <div className="font-black text-xl text-slate-900">{formatRupiah(demoAmount)}</div>
            <div className="text-xs font-bold text-slate-500 mt-1">Ref ID: {demoRef} • Berlaku 5 Menit</div>
            <div className="mt-3">
              <span className="badge-neo bg-sky-200">BCA • DANA • GoPay • OVO • ShopeePay</span>
            </div>
          </div>
        </div>
      </section>

      {/* DONASI */}
      <section className="card-neo p-10 bg-blue-600 text-white text-center mb-10">
        <span className="badge-neo bg-amber-300 text-slate-900 rotate-2 mb-3.5">Bebas Biaya Selamanya</span>
        <h2 className="text-3xl font-black mb-3">Dukung Server & Pengembangan</h2>
        <p className="max-w-xl mx-auto font-semibold text-sm opacity-90 mb-7 leading-relaxed">
          Kami tidak memotong fee sepeserpun dari hasil penjualan tokomu. Jika gateway ini membantu bisnismu, kamu bisa traktir segelas kopi untuk developer Kadokun & Mommy Ara!
        </p>
        <div className="flex justify-center gap-3.5 flex-wrap">
          <a href="https://trakteer.id/kadokun" target="_blank" className="btn-neo bg-amber-400 text-slate-900 font-black">
            <span>Trakteer Kopi</span> ☕
          </a>
          <a href="https://saweria.co/kadokun" target="_blank" className="btn-neo bg-white text-slate-900 font-black">
            <span>Saweria</span> 💖
          </a>
        </div>
      </section>
    </main>
  );
}
