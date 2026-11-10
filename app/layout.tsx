import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRIS Merchant Kadokun — Gateway QRIS Bebas Fee",
  description: "Gateway QRIS dinamis 0% fee tanpa potongan dengan mutasi otomatis 3 detik, auto-disbursement, dan API JSON praktis.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "QRIS Merchant Kadokun",
    description: "Endpoint JSON Praktis, Tinggal Tap Tap! Mutasi otomatis dalam hitungan detik.",
    images: ["/thumbnail.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <header className="bg-white border-b-[2.5px] border-slate-900 sticky top-0 z-50 shadow-[0_4px_0px_rgba(15,23,42,0.06)]">
          <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-3 no-underline text-slate-900">
              <img src="/favicon.png" alt="Logo" className="w-10 h-10 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]" />
              <div className="text-xl font-black tracking-tight">
                QRIS Merchant <span className="text-blue-600">Kadokun</span>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-7">
              <a href="/" className="font-bold text-[0.95rem] text-slate-900 hover:text-blue-600 transition">Beranda</a>
              <a href="/#fitur" className="font-bold text-[0.95rem] text-slate-900 hover:text-blue-600 transition">Fitur</a>
              <a href="/docs" className="font-bold text-[0.95rem] text-slate-900 hover:text-blue-600 transition">Dokumentasi API</a>
              <a href="/dashboard" className="font-bold text-[0.95rem] text-slate-900 hover:text-blue-600 transition">Dashboard</a>
            </nav>

            <div>
              <a href="/dashboard" className="btn-neo btn-primary text-sm py-2 px-5">
                <span>Dashboard</span> 🚀
              </a>
            </div>
          </div>
        </header>

        {children}

        <footer className="bg-white border-t-[2.5px] border-slate-900 mt-20 py-8 px-6">
          <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="Logo" className="w-8 h-8 rounded-lg border-2 border-slate-900" />
              <div className="font-black text-sm">QRIS Merchant Kadokun • 0% Fee Gateway</div>
            </div>
            <div className="text-sm font-bold text-slate-600">
              Made with 💙 by <a href="https://kadokunn.com" target="_blank" className="text-blue-600 hover:underline">Kadokun</a> & Mommy Ara
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
