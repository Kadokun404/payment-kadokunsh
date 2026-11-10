"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const amountParam = parseInt(searchParams.get("amount") || "25000", 10);
  const refParam = searchParams.get("ref") || "TRX-KDK-829141";

  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [status, setStatus] = useState<"WAITING" | "PAID" | "EXPIRED">("WAITING");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus("EXPIRED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const qrisPayload = `00020101021226670014ID.GO-JEK.WWW01189360091438921041920215G082914109283710303UMI51440014ID.LINKAJA.WWW0215LK0829141092837520458125303360540${String(amountParam).length}${amountParam}5802ID5913KADOKUN STORE6007BANDUNG61054011562070703A016304`;

  return (
    <div className="card-neo max-w-md w-full p-8 text-center bg-white">
      <div className="flex items-center justify-center gap-2.5 mb-4">
        <img src="/favicon.png" alt="Logo" className="w-9 h-9 rounded-xl border-2 border-slate-900" />
        <span className="font-black text-lg">QRIS Merchant <span className="text-blue-600">Kadokun</span></span>
      </div>

      <div className="mb-5">
        <div className="text-xs font-black uppercase text-slate-500">Total Pembayaran</div>
        <div className="text-4xl font-black text-slate-900">{formatRupiah(amountParam)}</div>
        <div className="text-xs font-bold text-slate-500 mt-1 font-mono">{refParam}</div>
      </div>

      <div className="inline-block bg-white p-3.5 border-[3px] border-slate-900 rounded-2xl shadow-[3px_3px_0px_#0f172a] mb-5">
        <QRCodeSVG value={qrisPayload} size={200} level="M" />
      </div>

      <div className="flex justify-center mb-5">
        <span className="badge-neo bg-amber-300">
          ⏳ Sisa Waktu: {minutes}:{seconds}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
        Buka aplikasi <b>BCA, GoPay, DANA, OVO, ShopeePay</b> atau m-banking lainnya ➔ Pilih menu <b>Scan / QRIS</b> ➔ Arahkan ke kode di atas.
      </p>

      <div className={`border-2 border-slate-900 rounded-xl p-3 font-black text-sm flex items-center justify-center gap-2 ${status === "PAID" ? "bg-emerald-300" : (status === "EXPIRED" ? "bg-rose-300" : "bg-sky-100")}`}>
        {status === "WAITING" && <span>🔄 Menunggu Pembayaran Masuk...</span>}
        {status === "PAID" && <span>✅ Pembayaran Berhasil Diterima!</span>}
        {status === "EXPIRED" && <span>❌ Pembayaran Kedaluwarsa</span>}
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <div className="flex items-center justify-center min-h-[85vh] p-4">
      <Suspense fallback={<div>Memuat halaman checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
