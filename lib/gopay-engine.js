import crypto from "node:crypto";
import GoPayMerchant from "./gobiz.js";

function crc16(input) {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function parseTLV(s) {
  const out = [];
  let i = 0;
  while (i + 4 <= s.length) {
    const tag = s.substr(i, 2);
    const len = parseInt(s.substr(i + 2, 2), 10);
    if (!Number.isFinite(len) || i + 4 + len > s.length) break;
    out.push({ tag, val: s.substr(i + 4, len) });
    i += 4 + len;
  }
  return out;
}

const enc = (t) => t.tag + String(t.val.length).padStart(2, "0") + t.val;

export function buildDynamicQris(staticQ, amount) {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error("amount must be a positive integer");
  let body = staticQ.trim();
  const crcIdx = body.lastIndexOf("6304");
  if (crcIdx !== -1 && crcIdx >= body.length - 8) body = body.slice(0, crcIdx);
  const tlv = parseTLV(body);
  if (!tlv.length) throw new Error("invalid QRIS");
  const poi = tlv.find((t) => t.tag === "01");
  if (poi) poi.val = "12";
  const amt = { tag: "54", val: String(amount) };
  const out = [];
  let ins = false;
  for (const t of tlv) {
    if (t.tag === "54") continue;
    out.push(t);
    if (t.tag === "53" && !ins) {
      out.push(amt);
      ins = true;
    }
  }
  if (!ins) {
    const cc = out.findIndex((t) => t.tag === "58");
    if (cc === -1) throw new Error("invalid QRIS: no 53/58 tag");
    out.splice(cc, 0, amt);
  }
  const rebuilt = out.map(enc).join("") + "6304";
  return rebuilt + crc16(rebuilt);
}

export const merchant = new GoPayMerchant();
