// Struk/receipt PNG generator — Kadokun Playful Tech UI (Neobrutalism × Kawaii Tech)
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTDIR = path.join(__dirname, "fonts");
const LOGO_PATH = path.join(__dirname, "..", "public", "favicon.png");

const rupiah = (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;
const angka = (v) => Number(v || 0).toLocaleString("id-ID");
const has = (v) => v != null && String(v).trim() !== "" && String(v).trim() !== "-";

function waktuSekarang() {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const g = (t) => parts.find((p) => p.type === t)?.value;
  return { tanggal: `${g("day")}/${g("month")}/${g("year")}`, jam: `${g("hour")}:${g("minute")}` };
}

const hitungQty = (items) => items.reduce((t, i) => t + Number(i.qtyTotal ?? i.qty ?? 0), 0);
const hitungTotal = (items) => items.reduce((t, i) => t + Number(i.qty || 0) * Number(i.harga || 0), 0);

let fontMode = null;
const FAMILY = { reg: "Inter-Regular", med: "Inter-Medium", semi: "Inter-SemiBold", bold: "Inter-Bold" };
const FALLBACK_FAMILY = { reg: "sans-serif", med: "sans-serif", semi: "sans-serif", bold: "sans-serif" };

function ensureFonts() {
  if (fontMode) return fontMode === "inter" ? FAMILY : FALLBACK_FAMILY;
  const files = {
    reg: "Inter-Regular.ttf", med: "Inter-Medium.ttf",
    semi: "Inter-SemiBold.ttf", bold: "Inter-Bold.ttf",
  };
  const haveAll = Object.values(files).every((f) => fs.existsSync(path.join(FONTDIR, f)));
  if (haveAll) {
    for (const [alias, file] of Object.entries(files)) {
      GlobalFonts.registerFromPath(path.join(FONTDIR, file), FAMILY[alias]);
    }
    fontMode = "inter";
    return FAMILY;
  }
  fontMode = "fallback";
  return FALLBACK_FAMILY;
}

let cachedLogo = null;
async function getLogo() {
  if (cachedLogo) return cachedLogo;
  if (fs.existsSync(LOGO_PATH)) {
    try {
      cachedLogo = await loadImage(LOGO_PATH);
      return cachedLogo;
    } catch {}
  }
  return null;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateStrukImage(data = {}) {
  const {
    toko = {}, kasir = null, pelanggan = null, alamatPelanggan = null,
    nomorStruk = null, items = [], bayar = 0, metodeBayar = "QRIS GOPAY",
    paid = false, lunas = false, uniqueCode = 0,
  } = data;
  const uCode = Math.max(0, Number(uniqueCode) || 0);
  if (!Array.isArray(items) || items.length === 0) throw new Error("items must be a non-empty array");
  if (items.length > 50) throw new Error("too many items (max 50)");
  const isPaid = paid === true || paid === "true" || lunas === true || lunas === "true";

  const FONT = ensureFonts();
  let customLogoImg = null;
  if (toko.logo || data.logo) {
    try {
      customLogoImg = await loadImage(toko.logo || data.logo);
    } catch {}
  }
  const now = waktuSekarang();
  const finalNomor = nomorStruk || Date.now().toString().slice(-8);

  const SCALE = 2;
  const W = 460;
  const CARD_PAD_X = 36;
  const CARD_PAD_TOP = 32;
  const CANVAS_W = W + CARD_PAD_X * 2;

  const inL = CARD_PAD_X + 24;
  const inR = CARD_PAD_X + W - 24;
  const cw = W;
  const cx = CARD_PAD_X;
  const cy = CARD_PAD_TOP;

  const addrLines = [toko.alamat, toko.kota, has(toko.telp) ? `Telp: ${toko.telp}` : null].filter(has);
  const H_header = 145 + 18 * addrLines.length;

  const metaList = [
    { label: "No. Struk", val: finalNomor, bold: true },
    { label: "Waktu", val: `${now.tanggal}  ${now.jam} WITA`, bold: false },
    has(kasir) ? { label: "Kasir", val: kasir, bold: false } : null,
    has(pelanggan) ? { label: "Pelanggan", val: pelanggan, bold: false } : null,
    has(alamatPelanggan) ? { label: "Alamat", val: alamatPelanggan, bold: false } : null,
  ].filter(Boolean);
  const H_meta = metaList.length * 18 + 10;

  const H_items = items.length * 38;
  const H_totals = 175 + (uCode > 0 ? 18 : 0);
  const H_footer = 145;

  const ch = H_header + H_meta + H_items + H_totals + H_footer;
  const CANVAS_H = cy + ch + 36;

  const canvas = createCanvas(CANVAS_W * SCALE, CANVAS_H * SCALE);
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);

  // Background
  ctx.fillStyle = "#E8EEF5";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Subtle Dot Grid
  ctx.fillStyle = "#CBD5E1";
  for (let x = 12; x < CANVAS_W; x += 22) {
    for (let y = 12; y < CANVAS_H; y += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Scalloped bottom calculation
  const SHADOW_OFFSET_X = 8;
  const SHADOW_OFFSET_Y = 8;
  const scR = 10;
  const countSc = Math.floor(cw / (scR * 2));
  const scActualR = cw / (countSc * 2);

  function buildReceiptPath(ctx, startX, startY) {
    ctx.beginPath();
    ctx.moveTo(startX + 20, startY);
    ctx.lineTo(startX + cw - 20, startY);
    ctx.quadraticCurveTo(startX + cw, startY, startX + cw, startY + 20);
    ctx.lineTo(startX + cw, startY + ch);
    for (let i = countSc - 1; i >= 0; i--) {
      const centerX = startX + i * (scActualR * 2) + scActualR;
      ctx.arc(centerX, startY + ch, scActualR, 0, Math.PI, true);
    }
    ctx.lineTo(startX, startY + 20);
    ctx.quadraticCurveTo(startX, startY, startX + 20, startY);
    ctx.closePath();
  }

  // Draw Neobrutalist Hard Shadow
  buildReceiptPath(ctx, cx + SHADOW_OFFSET_X, cy + SHADOW_OFFSET_Y);
  ctx.fillStyle = "#1E293B";
  ctx.fill();

  // Draw Main White Card
  buildReceiptPath(ctx, cx, cy);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#0F172A";
  ctx.stroke();

  // Header Banner Accent (Kadokun Electric Blue)
  ctx.save();
  buildReceiptPath(ctx, cx, cy);
  ctx.clip();
  ctx.fillStyle = "#0055FF";
  ctx.fillRect(cx, cy, cw, 92);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#0F172A";
  ctx.beginPath();
  ctx.moveTo(cx, cy + 92);
  ctx.lineTo(cx + cw, cy + 92);
  ctx.stroke();
  ctx.restore();

  // Logo Badge
  const logoSize = 64;
  const logoX = cx + (cw - logoSize) / 2;
  const logoY = cy + 58;

  roundRect(ctx, logoX + 3.5, logoY + 3.5, logoSize, logoSize, 18);
  ctx.fillStyle = "#0F172A";
  ctx.fill();

  roundRect(ctx, logoX, logoY, logoSize, logoSize, 18);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#0F172A";
  ctx.stroke();

  if (customLogoImg) {
    ctx.save();
    roundRect(ctx, logoX + 2, logoY + 2, logoSize - 4, logoSize - 4, 16);
    ctx.clip();
    ctx.drawImage(customLogoImg, logoX + 2, logoY + 2, logoSize - 4, logoSize - 4);
    ctx.restore();
  } else {
    // Kadokun "K." Signature Logo Badge (Blue & White with Black Neobrutalist Accents)
    const pad = 5.5;
    const innerSize = logoSize - pad * 2;
    const innerX = logoX + pad;
    const innerY = logoY + pad;

    roundRect(ctx, innerX, innerY, innerSize, innerSize, 12);
    ctx.fillStyle = "#0055FF";
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = "#0F172A";
    ctx.stroke();

    // Geometric "K." in crisp white
    const s = innerSize / 64;
    ctx.save();
    ctx.translate(innerX, innerY);
    ctx.scale(s, s);

    // K stem
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(15, 16, 7, 32, 2.5);
    ctx.fill();

    // K diagonal branches
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(25, 32);
    ctx.lineTo(43, 16);
    ctx.moveTo(25, 32);
    ctx.lineTo(39, 46);
    ctx.stroke();

    // Dot "."
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(48, 44, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Header Texts
  let curY = logoY + logoSize + 18;
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A";
  ctx.font = `bold 18px "${FONT.bold}"`;
  ctx.fillText((toko.nama || "Kadokun Store").toUpperCase(), cx + cw / 2, curY);

  ctx.font = `11px "${FONT.reg}"`;
  ctx.fillStyle = "#64748B";
  for (const line of addrLines) {
    curY += 17;
    ctx.fillText(line, cx + cw / 2, curY);
  }

  const drawDash = (y) => {
    ctx.save();
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(inL, y);
    ctx.lineTo(inR, y);
    ctx.stroke();
    ctx.restore();
  };

  curY += 16;
  drawDash(curY);

  // Meta Section
  curY += 20;
  const kv = (label, val, boldVal = false) => {
    ctx.textAlign = "left";
    ctx.fillStyle = "#64748B";
    ctx.font = `11px "${FONT.reg}"`;
    ctx.fillText(label, inL, curY);

    ctx.textAlign = "right";
    ctx.fillStyle = "#0F172A";
    ctx.font = boldVal ? `bold 11px "${FONT.bold}"` : `11px "${FONT.med}"`;
    ctx.fillText(val, inR, curY);
    curY += 18;
  };

  for (const m of metaList) {
    kv(m.label, m.val, m.bold);
  }

  curY += 2;
  drawDash(curY);

  // Items Section
  curY += 20;
  items.forEach((it) => {
    const nama = it.nama || "-";
    const qty = Number(it.qty || 0);
    const satuan = it.satuan || "";
    const harga = Number(it.harga || 0);
    const sub = qty * harga;

    ctx.textAlign = "left";
    ctx.fillStyle = "#0F172A";
    ctx.font = `bold 12.5px "${FONT.semi}"`;
    ctx.fillText(nama, inL, curY);

    ctx.textAlign = "right";
    ctx.font = `bold 12.5px "${FONT.semi}"`;
    ctx.fillText(rupiah(sub), inR, curY);

    curY += 16;
    ctx.textAlign = "left";
    ctx.fillStyle = "#64748B";
    ctx.font = `11px "${FONT.reg}"`;
    const subtitle = satuan ? `${qty} ${satuan} × ${angka(harga)}` : `${qty} × ${angka(harga)}`;
    ctx.fillText(subtitle, inL, curY);
    curY += 22;
  });

  drawDash(curY);

  // Totals Section
  const totalQty = hitungQty(items);
  const subTotal = hitungTotal(items);
  const boxTotal = subTotal + uCode;

  curY += 18;
  kv("Total Item", `${totalQty} pcs`);
  kv("Subtotal", rupiah(subTotal));
  if (uCode > 0) kv("Kode Unik", rupiah(uCode));

  curY += 4;
  const tbH = 54;
  roundRect(ctx, inL + 3.5, curY + 3.5, inR - inL, tbH, 12);
  ctx.fillStyle = "#0F172A";
  ctx.fill();

  roundRect(ctx, inL, curY, inR - inL, tbH, 12);
  ctx.fillStyle = "#E0EEFF";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#0055FF";
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#0055FF";
  ctx.font = `bold 14px "${FONT.bold}"`;
  ctx.fillText("TOTAL", inL + 16, curY + 33);

  ctx.textAlign = "right";
  ctx.fillStyle = "#0F172A";
  ctx.font = `bold 19px "${FONT.bold}"`;
  ctx.fillText(rupiah(boxTotal), inR - 16, curY + 34);

  curY += tbH + 18;
  kv(`Bayar (${metodeBayar})`, rupiah(bayar));
  kv("Kembali", rupiah(Math.max(0, Number(bayar || 0) - boxTotal)));

  // LUNAS Stamp
  if (isPaid) {
    const stampX = cx + cw / 2 + 82;
    const stampY = curY - 20;
    ctx.save();
    ctx.translate(stampX, stampY);
    ctx.rotate((9 * Math.PI) / 180);

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#10B981";
    roundRect(ctx, -50, -18, 100, 36, 8);
    ctx.stroke();

    ctx.lineWidth = 1;
    roundRect(ctx, -46, -14, 92, 28, 6);
    ctx.stroke();

    ctx.fillStyle = "#10B981";
    ctx.font = `bold 13.5px "${FONT.bold}"`;
    ctx.textAlign = "center";
    ctx.fillText("✓ LUNAS", 0, 4.5);
    ctx.restore();
  }

  curY += 8;
  drawDash(curY);

  // Footer: Thank you & Barcode
  curY += 20;
  ctx.textAlign = "center";
  ctx.fillStyle = "#0F172A";
  ctx.font = `bold 12.5px "${FONT.semi}"`;
  ctx.fillText("Terima Kasih Atas Kunjungan Anda!", cx + cw / 2, curY);

  curY += 16;
  ctx.fillStyle = "#64748B";
  ctx.font = `10px "${FONT.reg}"`;
  ctx.fillText("Struk ini adalah bukti pembayaran yang sah", cx + cw / 2, curY);

  curY += 20;
  const bcW = 200, bcH = 34;
  const bcX = cx + (cw - bcW) / 2;
  ctx.fillStyle = "#0F172A";

  let seed = 0;
  for (const ch of finalNomor) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

  let bcur = bcX;
  while (bcur < bcX + bcW) {
    const bw = rand() > 0.6 ? 3 : (rand() > 0.3 ? 2 : 1);
    ctx.fillRect(bcur, curY, bw, bcH);
    bcur += bw + (rand() > 0.5 ? 2 : 1);
  }

  curY += bcH + 12;
  ctx.fillStyle = "#94A3B8";
  ctx.font = `10px "${FONT.med}"`;
  ctx.fillText(finalNomor.split("").join(" "), cx + cw / 2, curY);

  return canvas.toBuffer("image/png");
}
