"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Transaction {
  id: string;
  customer: string;
  amount: number;
  fee: number;
  net: number;
  status: "PAID" | "PENDING" | "EXPIRED";
  date: string;
  method: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(485000);
  const [apiKey, setApiKey] = useState<string>("kado_live_79a291bf02");
  const [webhookUrl, setWebhookUrl] = useState<string>("https://toko.kadokunsh.biz.id/api/callback");
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "TRX-KDK-9821",
      customer: "Fajar Pratama",
      amount: 45000,
      fee: 0,
      net: 45000,
      status: "PAID",
      date: "10/11/2026, 17:15",
      method: "QRIS GoPay"
    },
    {
      id: "TRX-KDK-9820",
      customer: "Siti Rahma",
      amount: 120000,
      fee: 0,
      net: 120000,
      status: "PAID",
      date: "10/11/2026, 16:45",
      method: "QRIS BCA Mobile"
    },
    {
      id: "TRX-KDK-9819",
      customer: "Rizky Dwi",
      amount: 25000,
      fee: 0,
      net: 25000,
      status: "PENDING",
      date: "10/11/2026, 15:30",
      method: "QRIS DANA"
    }
  ]);

  const [modalWithdraw, setModalWithdraw] = useState<boolean>(false);
  const [modalCreateQR, setModalCreateQR] = useState<boolean>(false);
  const [modalSettings, setModalSettings] = useState<boolean>(false);

  const [wdAmount, setWdAmount] = useState<number>(50000);
  const [wdBank, setWdBank] = useState<string>("GoPay (087867140397 - KADOKUN)");
  
  const [newCust, setNewCust] = useState<string>("Customer Toko");
  const [newAmount, setNewAmount] = useState<number>(25000);
  const [createdQR, setCreatedQR] = useState<{ id: string; amount: number } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleWithdraw = () => {
    if (wdAmount <= 0 || wdAmount > balance) {
      alert("Nominal penarikan tidak valid atau melebihi saldo!");
      return;
    }
    setBalance(prev => prev - wdAmount);
    setTransactions(prev => [
      {
        id: "WD-KDK-" + Math.floor(1000 + Math.random() * 9000),
        customer: `Penarikan ke ${wdBank}`,
        amount: wdAmount,
        fee: 0,
        net: wdAmount,
        status: "PAID",
        date: new Date().toLocaleString("id-ID"),
        method: "Auto-Payout"
      },
      ...prev
    ]);
    setModalWithdraw(false);
    alert(`Berhasil menarik ${formatRupiah(wdAmount)}! Uang otomatis dikirim ke rekening tujuan.`);
  };

  const handleCreateQR = () => {
    const id = "TRX-KDK-" + Math.floor(1000 + Math.random() * 9000);
    setCreatedQR({ id, amount: newAmount });
    setTransactions(prev => [
      {
        id,
        customer: newCust,
        amount: newAmount,
        fee: 0,
        net: newAmount,
        status: "PENDING",
        date: new Date().toLocaleString("id-ID"),
        method: "QRIS GoPay"
      },
      ...prev
    ]);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10 w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-5 mb-8">
        <div>
          <div className="flex gap-2.5 items-center mb-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Merchant</h1>
            <span className="badge-neo bg-sky-200">Verified</span>
          </div>
          <p className="text-slate-500 font-semibold text-sm">
            Pantau mutasi masuk realtime, generate tagihan QRIS instan, dan tarik saldo otomatis.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="btn-neo btn-secondary text-sm" onClick={() => { setCreatedQR(null); setModalCreateQR(true); }}>
            ⚡ <span>Buat QRIS Baru</span>
          </button>
          <button className="btn-neo btn-primary text-sm" onClick={() => setModalWithdraw(true)}>
            💸 <span>Tarik Saldo</span>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="card-neo bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider opacity-90">Saldo Siap Tarik</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-black mb-2">{formatRupiah(balance)}</div>
          <div className="text-xs font-bold opacity-90">100% Bersih • Bebas Fee</div>
        </div>

        <div className="card-neo bg-sky-100 p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">Total Volume</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-black mb-2 text-slate-900">Rp 3.420.000</div>
          <div className="text-xs font-bold text-slate-500">142 Transaksi Berhasil</div>
        </div>

        <div className="card-neo bg-white p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">Kecepatan Mutasi</span>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="text-3xl font-black mb-2 text-emerald-600">~2.4 Detik</div>
          <div className="text-xs font-bold text-slate-500">Realtime Webhook</div>
        </div>

        <div className="card-neo bg-amber-100 p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">Fee Terhemat (0%)</span>
            <span className="text-2xl">🎉</span>
          </div>
          <div className="text-3xl font-black mb-2 text-slate-900">Rp 23.940</div>
          <div className="text-xs font-bold text-slate-500">Gratis Selamanya</div>
        </div>
      </div>

      {/* TOKEN BANNER */}
      <div className="card-neo p-5 bg-white mb-8 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-4 items-center">
          <div className="text-3xl">🔑</div>
          <div>
            <div className="text-xs font-black uppercase text-slate-500">Merchant API Key (x-internal-token)</div>
            <div className="font-mono font-bold text-base text-slate-900">{apiKey}</div>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button className="btn-neo btn-secondary text-xs" onClick={() => { navigator.clipboard.writeText(apiKey); alert("API Key disalin!"); }}>
            📋 Salin Token
          </button>
          <button className="btn-neo btn-secondary text-xs" onClick={() => setModalSettings(true)}>
            ⚙️ Webhook URL
          </button>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="card-neo p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Riwayat Mutasi & Transaksi</h2>
            <p className="text-xs font-semibold text-slate-500">Daftar transaksi masuk yang tercatat otomatis 24 jam.</p>
          </div>
        </div>

        <div className="overflow-x-auto border-[2.5px] border-slate-900 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-[2.5px] border-slate-900 text-xs font-black uppercase text-slate-700">
                <th className="p-3.5">ID Transaksi</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5">Nominal</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm font-semibold">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold">{tx.id}</td>
                  <td className="p-3.5">{tx.customer}</td>
                  <td className="p-3.5"><span className="badge-neo bg-white text-xs">{tx.method}</span></td>
                  <td className="p-3.5 font-black">{formatRupiah(tx.amount)}</td>
                  <td className="p-3.5">
                    <span className={`badge-neo text-xs ${tx.status === "PAID" ? "bg-emerald-300" : (tx.status === "PENDING" ? "bg-amber-300" : "bg-rose-300")}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-xs text-slate-500">{tx.date}</td>
                  <td className="p-3.5">
                    <a href={`/pay?ref=${tx.id}&amount=${tx.amount}`} target="_blank" className="btn-neo text-xs py-1 px-3 bg-white">
                      Buka
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TARIK SALDO */}
      {modalWithdraw && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-neo bg-white p-7 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black">💸 Tarik Saldo Instan</h3>
              <button className="font-black text-xl" onClick={() => setModalWithdraw(false)}>✕</button>
            </div>
            <p className="text-xs font-semibold text-slate-600 mb-4">
              Uang otomatis meluncur ke rekening/e-wallet tujuan detik itu juga tanpa potongan biaya admin!
            </p>

            <div className="bg-sky-100 border-2 border-slate-900 rounded-xl p-3 mb-4">
              <div className="text-xs font-bold text-sky-800 uppercase">Saldo Tersedia</div>
              <div className="text-2xl font-black">{formatRupiah(balance)}</div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">Tujuan Penarikan:</label>
              <select className="input-neo text-sm" value={wdBank} onChange={(e) => setWdBank(e.target.value)}>
                <option value="GoPay (087867140397 - KADOKUN)">GoPay (087867140397 - KADOKUN)</option>
                <option value="DANA (087867140397 - KADOKUN)">DANA (087867140397 - KADOKUN)</option>
                <option value="BCA (8410291823 - KADOKUN)">BCA (8410291823 - KADOKUN)</option>
                <option value="Mandiri (131002918291 - KADOKUN)">Mandiri (131002918291 - KADOKUN)</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">Nominal Penarikan (Rp):</label>
              <input
                type="number"
                className="input-neo"
                value={wdAmount}
                min={10000}
                step={10000}
                onChange={(e) => setWdAmount(parseInt(e.target.value, 10) || 0)}
              />
            </div>

            <button className="btn-neo btn-primary w-full justify-center" onClick={handleWithdraw}>
              <span>Konfirmasi & Cairkan Uang</span> 🚀
            </button>
          </div>
        </div>
      )}

      {/* MODAL BUAT QRIS */}
      {modalCreateQR && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-neo bg-white p-7 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black">⚡ Buat Tagihan QRIS</h3>
              <button className="font-black text-xl" onClick={() => setModalCreateQR(false)}>✕</button>
            </div>

            {!createdQR ? (
              <div>
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Nama Customer:</label>
                  <input type="text" className="input-neo" value={newCust} onChange={(e) => setNewCust(e.target.value)} />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Nominal (Rp):</label>
                  <input type="number" className="input-neo" value={newAmount} step={5000} onChange={(e) => setNewAmount(parseInt(e.target.value, 10) || 10000)} />
                </div>
                <button className="btn-neo btn-primary w-full justify-center" onClick={handleCreateQR}>
                  <span>Generate QRIS</span> 🚀
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-block bg-white p-3 border-2 border-slate-900 rounded-xl mb-3 shadow-[3px_3px_0px_#0f172a]">
                  <QRCodeSVG value={`00020101021226670014ID.GO-JEK.WWW01189360091438921041920215G082914109283710303UMI51440014ID.LINKAJA.WWW0215LK0829141092837520458125303360540${String(createdQR.amount).length}${createdQR.amount}5802ID5913KADOKUN STORE6007BANDUNG61054011562070703A016304`} size={170} />
                </div>
                <div className="font-black text-xl">{formatRupiah(createdQR.amount)}</div>
                <div className="text-xs font-bold text-slate-500 mb-4">{createdQR.id}</div>
                <div className="flex gap-2">
                  <a href={`/pay?ref=${createdQR.id}&amount=${createdQR.amount}`} target="_blank" className="btn-neo btn-secondary flex-1 text-xs justify-center">
                    Buka Checkout
                  </a>
                  <button className="btn-neo btn-primary flex-1 text-xs justify-center" onClick={() => setModalCreateQR(false)}>
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SETTINGS */}
      {modalSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-neo bg-white p-7 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black">⚙️ Pengaturan Webhook</h3>
              <button className="font-black text-xl" onClick={() => setModalSettings(false)}>✕</button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">Webhook Callback URL:</label>
              <input type="url" className="input-neo" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
            </div>
            <button className="btn-neo btn-primary w-full justify-center" onClick={() => { setModalSettings(false); alert("Pengaturan disimpan!"); }}>
              <span>Simpan Pengaturan</span> 💾
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
