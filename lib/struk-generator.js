// Struk/receipt PDF generator — pixel-faithful port of the Figma "Keyra —
// Receipt Design": cream showcase, white card w/ scalloped bottom, dashed
// dividers, highlighted TOTAL box, optional PAID stamp, deterministic
// barcode. Runs fully locally — no external HTTP calls.
//
// Fonts: if lib/fonts/Inter-{Regular,Medium,SemiBold,Bold}.ttf are present,
// they're used for pixel-perfect typography. Otherwise this falls back to
// PDFKit's built-in Helvetica family automatically, so the generator works
// out of the box with zero extra assets.
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const FONTDIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "fonts");

// palette (exact from design)
const CREAM = "#e9e4db", INK = "#181513", MUTED = "#8c8781";
const SOFT = "#f2f0ec", DASH = "#dcd8d1", GREEN = "#2e7d5b", WHITE = "#ffffff";

const rupiah = (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;
const angka = (v) => Number(v || 0).toLocaleString("id-ID");
const has = (v) => v != null && String(v).trim() !== "" && String(v).trim() !== "-";

function waktuSekarang() {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const g = (t) => parts.find((p) => p.type === t)?.value;
  return { tanggal: `${g("day")}/${g("month")}/${g("year")}`, jam: `${g("hour")}:${g("minute")}` };
}

const hitungQty = (items) => items.reduce((t, i) => t + Number(i.qtyTotal ?? i.qty ?? 0), 0);
const hitungTotal = (items) => items.reduce((t, i) => t + Number(i.qty || 0) * Number(i.harga || 0), 0);

// Register Inter if available, otherwise map the same logical names ("reg",
// "med", "semi", "bold") onto PDFKit's built-in Helvetica family so the rest
// of the drawing code never needs to know which one is active.
function registerFonts(doc) {
  const want = {
    reg: "Inter-Regular.ttf",
    med: "Inter-Medium.ttf",
    semi: "Inter-SemiBold.ttf",
    bold: "Inter-Bold.ttf",
  };
  const haveAllInter = Object.values(want).every((f) => fs.existsSync(path.join(FONTDIR, f)));
  if (haveAllInter) {
    for (const [alias, file] of Object.entries(want)) {
      doc.registerFont(alias, path.join(FONTDIR, file));
    }
    return;
  }
  // Fallback: built-in standard fonts, no external files needed.
  doc.registerFont("reg", "Helvetica");
  doc.registerFont("med", "Helvetica");
  doc.registerFont("semi", "Helvetica-Bold");
  doc.registerFont("bold", "Helvetica-Bold");
}

export async function generateStruk(data = {}) {
  const {
    toko = {}, kasir = null, pelanggan = null, alamatPelanggan = null,
    nomorStruk = null, items = [], bayar = 0, metodeBayar = "Cash",
    paid = false, lunas = false, uniqueCode = 0,
  } = data;
  const uCode = Math.max(0, Number(uniqueCode) || 0);
  if (!Array.isArray(items) || items.length === 0) throw new Error("items must be a non-empty array");
  if (items.length > 50) throw new Error("too many items (max 50)");
  const isPaid = paid === true || paid === "true" || lunas === true || lunas === "true";

  const now = waktuSekarang();
  const finalNomor = nomorStruk || Date.now().toString().slice(-8);

  // ── geometry (design units = PDF points) ──
  const SHOW_W = 720, SIDE = 180, PAD = 96;      // showcase width, card side margin, cream pad
  const cardLeft = SIDE, cardW = SHOW_W - SIDE * 2; // 360
  const inL = cardLeft + 28, inW = cardW - 56, inR = inL + inW; // content 304
  const cardTop = PAD, contentTop = cardTop + 36;
  const GAP = 18, DIV = GAP + 0 + GAP; // divider block

  // address lines present
  const addrLines = [toko.alamat, toko.kota, has(toko.telp) ? `Telp ${toko.telp}` : null].filter(has);
  const H_header = 92 + 17 * addrLines.length;
  const metaRows = 2 + (has(kasir) ? 1 : 0) + (has(pelanggan) ? 1 : 0) + (has(alamatPelanggan) ? 1 : 0);
  const H_meta = metaRows * 13 + (metaRows - 1) * 9;
  const H_items = items.length * 30 + (items.length - 1) * 14;
  const H_totals = 147 + (uCode > 0 ? 23 : 0), H_footer = 97;
  const cardContent = H_header + H_meta + H_items + H_totals + H_footer + 4 * DIV;
  const cardH = 36 + cardContent + 40;
  const SHOW_H = PAD + cardH + PAD;

  const doc = new PDFDocument({ size: [SHOW_W, SHOW_H], margin: 0 });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  registerFonts(doc);

  const txt = (s, font, size, color, x, y, w, align, ls) => {
    doc.font(font).fontSize(size).fillColor(color);
    const o = { width: w, align: align || "left", lineBreak: false };
    if (ls != null) o.characterSpacing = ls;
    doc.text(String(s ?? ""), x, y, o);
  };
  const truncateToWidth = (s, font, size, maxWidth) => {
    const str = String(s ?? "");
    doc.font(font).fontSize(size);
    if (doc.widthOfString(str) <= maxWidth) return str;
    let lo = 0, hi = str.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const candidate = str.slice(0, mid) + "…";
      if (doc.widthOfString(candidate) <= maxWidth) lo = mid;
      else hi = mid - 1;
    }
    return str.slice(0, lo) + "…";
  };
  const line = (y) => {
    doc.save().lineWidth(1).strokeColor(DASH).dash(3, { space: 3 })
      .moveTo(inL, y).lineTo(inR, y).stroke().undash().restore();
  };
  const kv = (label, value, y) => {
    txt(label, "reg", 11, MUTED, inL, y, inW, "left");
    txt(value, "med", 11, INK, inL, y, inW, "right");
  };

  // ── background + card + soft shadow + scallop ──
  doc.rect(0, 0, SHOW_W, SHOW_H).fill(CREAM);
  for (let i = 0; i < 3; i++) {
    doc.save().opacity(0.05).roundedRect(cardLeft, cardTop + 3 + i * 2, cardW, cardH, 22).fill("#000000").restore();
  }
  doc.roundedRect(cardLeft, cardTop, cardW, cardH, 22).fill(WHITE);

  // ── content (absolute y cursor) ──
  let Y = contentTop;

  // Header
  const badge = 56, bx = cardLeft + cardW / 2 - badge / 2;
  doc.roundedRect(bx, Y, badge, badge, 16).fill(INK);
  txt("K", "bold", 26, WHITE, bx, Y + 13, badge, "center");
  const nameY = Y + 70;
  txt((toko.nama || "Store").toUpperCase(), "bold", 18, INK, inL, nameY, inW, "center", 0.6);
  let ay = nameY + 26;
  for (const l of addrLines) { txt(l, "reg", 10.5, MUTED, inL, ay, inW, "center"); ay += 17; }
  Y += H_header;

  // Meta
  Y += GAP; line(Y); Y += GAP;
  kv("Receipt No.", finalNomor, Y); Y += 22;
  kv("Date", `${now.tanggal}  ${now.jam}`, Y);
  if (has(kasir)) { Y += 22; kv("Cashier", kasir, Y); }
  if (has(pelanggan)) { Y += 22; kv("Customer", pelanggan, Y); }
  if (has(alamatPelanggan)) { Y += 22; kv("Address", alamatPelanggan, Y); }
  Y += 13; // last row height

  // Items
  Y += GAP; line(Y); Y += GAP;
  let total = 0;
  items.forEach((it, i) => {
    const nama = it.nama || "-", qty = Number(it.qty || 0), satuan = it.satuan || "", harga = Number(it.harga || 0);
    const sub = qty * harga; total += sub;
    const namaMaxW = inW - 80;
    const subtitle = satuan ? `${qty} ${satuan} × ${angka(harga)}` : `${qty} × ${angka(harga)}`;
    txt(truncateToWidth(nama, "semi", 12.5, namaMaxW), "semi", 12.5, INK, inL, Y, namaMaxW, "left");
    txt(truncateToWidth(subtitle, "reg", 10.5, namaMaxW), "reg", 10.5, MUTED, inL, Y + 17, namaMaxW, "left");
    txt(rupiah(sub), "med", 12.5, INK, inL, Y, inW, "right");
    Y += 30 + (i < items.length - 1 ? 14 : 0);
  });

  // Totals
  Y += GAP; const lineIT = Y; line(Y); Y += GAP;
  const totalQty = hitungQty(items), subTotal = hitungTotal(items);
  const boxTotal = subTotal + uCode;
  kv("Total Items", `${totalQty} pcs`, Y); Y += 23;
  kv("Subtotal", rupiah(subTotal), Y); Y += 23;
  if (uCode > 0) { kv("Unique Code", rupiah(uCode), Y); Y += 23; }
  // Total box
  const boxH = 52;
  doc.roundedRect(inL, Y, inW, boxH, 12).fill(SOFT);
  txt("TOTAL", "bold", 13, INK, inL + 18, Y + 18, 100, "left", 0.5);
  txt(rupiah(boxTotal), "bold", 18, INK, inL, Y + 15, inW - 18, "right");
  Y += boxH + 10 + 4;
  kv(`Paid · ${metodeBayar}`, rupiah(bayar), Y); Y += 22;
  kv("Change", rupiah(Number(bayar || 0) - boxTotal), Y); Y += 13;

  // Footer
  Y += GAP; line(Y); Y += GAP;
  txt("Thank You For Your Purchase", "semi", 12.5, INK, inL, Y, inW, "center");
  txt("Please keep this receipt as proof of payment", "reg", 9.5, MUTED, inL, Y + 21, inW, "center");
  // Barcode (deterministic)
  const bcY = Y + 45, bcH = 34;
  let seed = 0; for (const ch of finalNomor) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const targetW = 150, gap = 2;
  const widths = []; let tw = 0;
  while (tw < targetW) { const w = 1 + Math.round(rand() * 2); if (tw + w > targetW) break; widths.push(w); tw += w + gap; }
  let bxc = cardLeft + cardW / 2 - (tw - gap) / 2;
  doc.fillColor(INK);
  for (const w of widths) { doc.rect(bxc, bcY, w, bcH).fill(INK); bxc += w + gap; }
  const digits = finalNomor.split("").join(" ");
  txt(digits, "reg", 9, MUTED, inL, bcY + bcH + 8, inW, "center", 2);

  // ── scalloped bottom edge (cream circles straddling card bottom) ──
  const scR = 12, cy = cardTop + cardH;
  for (let cx = cardLeft + scR; cx <= cardLeft + cardW - scR + 0.1; cx += scR * 2) {
    doc.circle(cx, cy, scR).fill(CREAM);
  }

  // ── PAID stamp (drawn last, on top) ──
  if (isPaid) {
    const sw = 124, sh = 43, cxs = cardLeft + cardW / 2, cys = lineIT + 25;
    doc.save();
    doc.rotate(-10, { origin: [cxs, cys] });
    doc.opacity(0.5);
    doc.lineWidth(2.5).strokeColor(GREEN).roundedRect(cxs - sw / 2, cys - sh / 2, sw, sh, 10).stroke();
    doc.font("bold").fontSize(22).fillColor(GREEN)
      .text("PAID", cxs - sw / 2, cys - 13, { width: sw, align: "center", characterSpacing: 3, lineBreak: false });
    doc.opacity(1).restore();
  }

  doc.end();
  await new Promise((resolve, reject) => { doc.on("end", resolve); doc.on("error", reject); });
  return Buffer.concat(chunks);
}
