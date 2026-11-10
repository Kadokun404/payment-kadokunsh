/**
 * QRIS Merchant Kadokun - Application Logic
 * Playful Neobrutalism Client Logic & State Management
 */

const STORAGE_KEYS = {
  MERCHANT: "kadokun_merchant_data",
  TRANSACTIONS: "kadokun_transactions_list",
  API_KEY: "kadokun_api_key",
  WEBHOOK_URL: "kadokun_webhook_url"
};

// Default initial state
function getMerchantData() {
  const saved = localStorage.getItem(STORAGE_KEYS.MERCHANT);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  const defaultData = {
    name: "Kadokun Store",
    email: "owner@kadokunn.com",
    balance: 485000,
    totalVolume: 3420000,
    totalOrders: 142,
    bankCode: "gopay",
    bankName: "GoPay (E-Wallet)",
    accountNumber: "087867140397",
    accountHolder: "KADOKUN OWNER",
    apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || "kado_live_" + Math.random().toString(36).substring(2, 12),
    webhookUrl: localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || "https://toko.kadokunsh.biz.id/api/payment/callback"
  };
  saveMerchantData(defaultData);
  return defaultData;
}

function saveMerchantData(data) {
  localStorage.setItem(STORAGE_KEYS.MERCHANT, JSON.stringify(data));
  if (data.apiKey) localStorage.setItem(STORAGE_KEYS.API_KEY, data.apiKey);
  if (data.webhookUrl) localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, data.webhookUrl);
}

function getTransactions() {
  const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  const defaultTx = [
    {
      id: "TRX-KDK-9821",
      customer: "Fajar Pratama",
      amount: 45000,
      fee: 0,
      net: 45000,
      status: "PAID",
      date: new Date(Date.now() - 15 * 60 * 1000).toLocaleString("id-ID"),
      method: "QRIS GoPay"
    },
    {
      id: "TRX-KDK-9820",
      customer: "Siti Rahma",
      amount: 120000,
      fee: 0,
      net: 120000,
      status: "PAID",
      date: new Date(Date.now() - 45 * 60 * 1000).toLocaleString("id-ID"),
      method: "QRIS BCA Mobile"
    },
    {
      id: "TRX-KDK-9819",
      customer: "Rizky Dwi",
      amount: 25000,
      fee: 0,
      net: 25000,
      status: "PENDING",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString("id-ID"),
      method: "QRIS DANA"
    },
    {
      id: "TRX-KDK-9818",
      customer: "Dimas Anggara",
      amount: 75000,
      fee: 0,
      net: 75000,
      status: "PAID",
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString("id-ID"),
      method: "QRIS ShopeePay"
    },
    {
      id: "TRX-KDK-9817",
      customer: "Wahyu Hidayat",
      amount: 15000,
      fee: 0,
      net: 15000,
      status: "EXPIRED",
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleString("id-ID"),
      method: "QRIS GoPay"
    }
  ];
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTx));
  return defaultTx;
}

function saveTransactions(list) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
}

// Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number);
}

// Toast Helper
function showToast(message, type = "success") {
  let toast = document.getElementById("toast-component");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-component";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }
  const icon = type === "success" ? "✨" : (type === "error" ? "❌" : "ℹ️");
  toast.innerHTML = `<span style="font-size: 1.25rem;">${icon}</span> <span>${message}</span>`;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// Copy to Clipboard
function copyText(text, label = "Teks") {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} berhasil disalin!`);
    }).catch(() => fallbackCopy(text, label));
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  showToast(`${label} berhasil disalin!`);
}

// Modal Helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
});
