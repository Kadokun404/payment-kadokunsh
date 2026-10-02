import moment from "moment-timezone";
import crypto from "node:crypto";
import { loadSession, saveSession } from "./token-store.js";

const BASE_URL = 'https://api.gobiz.co.id';
const CLIENT_ID = 'go-biz-web-new';

function generateUUID() {
  return crypto.randomUUID();
}

function getAuthHeaders(uniqueId, accessToken) {
  return {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US',
    'Authentication-Type': 'go-id',
    'Authorization': accessToken ? `Bearer ${accessToken}` : 'Bearer',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Gojek-Country-Code': 'ID',
    'Gojek-Timezone': 'Asia/Jakarta',
    'Origin': 'https://portal.gofoodmerchant.co.id',
    'Referer': 'https://portal.gofoodmerchant.co.id/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'X-AppVersion': 'platform-v3.107.0-94ce5d57',
    'X-PhoneMake': 'Windows 10 64-bit',
    'X-PhoneModel': 'Chrome 149.0.0.0 on Windows 10 64-bit',
    'X-Platform': 'Web',
    'X-User-Locale': 'en-US',
    'X-User-Type': 'merchant',
    'sec-ch-ua': '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'x-DeviceOS': 'Web',
    'x-appId': 'go-biz-web-dashboard',
    'x-uniqueid': uniqueId
  };
}

async function loginWithPassword(email, password) {
  const uniqueId = generateUUID();
  const headers = getAuthHeaders(uniqueId);

  console.log(`[Auth] Validating email: ${email}`);
  const reqRes = await fetch(`${BASE_URL}/goid/login/request`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, login_type: 'password', client_id: CLIENT_ID })
  });

  const valData = await reqRes.json().catch(() => ({}));
  if (valData.errors?.length > 0) {
    console.warn(`[Auth] Email validation warning: ${valData.errors[0].message}`);
  }

  console.log('[Auth] Sending login credentials...');
  const tokenRes = await fetch(`${BASE_URL}/goid/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      client_id: CLIENT_ID,
      grant_type: 'password',
      data: { email, password }
    })
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || tokenData.errors?.length > 0) {
    throw new Error(`Login failed (${tokenRes.status}): ${tokenData.errors?.[0]?.message || 'Incorrect password or account issue'}`);
  }

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in
  };
}

// NOTE: the grant_type/payload shape here is inferred from the password-grant
// call above (Gobiz has no public docs for this). Watch the logs after
// deploying — if refresh keeps failing, this endpoint/shape needs adjusting,
// and it'll transparently fall back to a full password login either way.
async function refreshWithToken(refreshToken) {
  const uniqueId = generateUUID();
  const headers = getAuthHeaders(uniqueId);

  const tokenRes = await fetch(`${BASE_URL}/goid/token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      data: { refresh_token: refreshToken }
    })
  });

  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || tokenData.errors?.length > 0) {
    throw new Error(`Refresh failed (${tokenRes.status}): ${tokenData.errors?.[0]?.message || 'refresh token rejected'}`);
  }

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || refreshToken,
    expires_in: tokenData.expires_in
  };
}

async function getUserMerchants(accessToken) {
  const uniqueId = generateUUID();
  console.log('[Auth] Fetching merchant list...');

  const response = await fetch(`${BASE_URL}/v1/merchants/search`, {
    method: 'POST',
    headers: getAuthHeaders(uniqueId, accessToken),
    body: JSON.stringify({ from: 0, to: 50, _source: ['id', 'merchant_name'] })
  });

  const resData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Failed to fetch merchant list (${response.status}): ${resData?.errors?.[0]?.message || 'Authentication failed'}`);
  }

  return resData;
}

export default class GoPayMerchant {
  constructor(options = {}) {
    this.token = options.token || process.env.GOPAY_TOKEN || null;
    this.refreshToken = options.refreshToken || null;
    this.merchantId = options.merchantId || process.env.GOPAY_MERCHANT_ID || null;
    this._initialized = false;
  }

  async _isTokenValid(token) {
    try {
      const uniqueId = generateUUID();
      const res = await fetch(`${BASE_URL}/v1/merchants/search`, {
        method: 'POST',
        headers: getAuthHeaders(uniqueId, token),
        body: JSON.stringify({ from: 0, to: 1, _source: ['id'] })
      });
      return res.status !== 401;
    } catch {
      return false;
    }
  }

  async _persistSession() {
    await saveSession({
      access_token: this.token,
      refresh_token: this.refreshToken,
      merchant_id: this.merchantId
    });
  }

  async _doLogin() {
    const email = process.env.GOPAY_EMAIL;
    const password = process.env.GOPAY_PASSWORD;

    if (!email || !password) {
      throw new Error('[GoPayMerchant] GOPAY_EMAIL and GOPAY_PASSWORD are not set in environment variables');
    }

    console.log(`[GoPayMerchant] Auto logging in as: ${email}`);
    const authData = await loginWithPassword(email, password);
    this.token = authData.access_token;
    this.refreshToken = authData.refresh_token || null;
    console.log('[GoPayMerchant] Login successful.');
  }

  async _reauthenticate() {
    if (this.refreshToken) {
      try {
        console.log('[GoPayMerchant] Attempting token refresh...');
        const authData = await refreshWithToken(this.refreshToken);
        this.token = authData.access_token;
        this.refreshToken = authData.refresh_token;
        console.log('[GoPayMerchant] Refresh successful.');
        await this._persistSession();
        return;
      } catch (e) {
        console.warn(`[GoPayMerchant] Refresh failed (${e.message}), falling back to password login.`);
      }
    }

    await this._doLogin();
    await this._persistSession();
  }

  async init() {
    if (this._initialized) return;

    if (!this.token || !this.refreshToken) {
      const cached = await loadSession();
      if (cached) {
        console.log('[GoPayMerchant] Found cached session in KV, verifying...');
        this.token = this.token || cached.access_token || null;
        this.refreshToken = this.refreshToken || cached.refresh_token || null;
        this.merchantId = this.merchantId || cached.merchant_id || null;
      } else {
        console.log('[GoPayMerchant] No cached session in KV.');
      }
    }

    if (!this.token || !(await this._isTokenValid(this.token))) {
      console.log('[GoPayMerchant] Token invalid or missing, re-logging in...');
      await this._reauthenticate();
    } else {
      console.log('[GoPayMerchant] Reusing cached token, no login needed.');
    }

    if (!this.merchantId) {
      console.log('[GoPayMerchant] Detecting Merchant ID automatically...');
      const merchants = await getUserMerchants(this.token);

      let merchantList = [];
      if (Array.isArray(merchants)) {
        merchantList = merchants;
      } else if (merchants?.merchants && Array.isArray(merchants.merchants)) {
        merchantList = merchants.merchants;
      } else if (merchants?.hits && Array.isArray(merchants.hits)) {
        merchantList = merchants.hits;
      } else if (merchants?.hits?.hits && Array.isArray(merchants.hits.hits)) {
        merchantList = merchants.hits.hits.map(h => h._source || h);
      } else if (merchants?.data && Array.isArray(merchants.data)) {
        merchantList = merchants.data;
      }

      if (merchantList.length === 0) {
        throw new Error('[GoPayMerchant] No merchants associated with this account.');
      }

      this.merchantId = merchantList[0].id || merchantList[0].merchant_id;
      const merchantName = merchantList[0].merchant_name || 'Unknown';
      console.log(`[GoPayMerchant] Using merchant: ${merchantName} (ID: ${this.merchantId})`);
      await this._persistSession();
    }

    this._initialized = true;
  }

  async getHistory({ days = 1, size = 50 } = {}) {
    try {
      await this.init();
      const data = await this.getTransactionsAnalytics({ days, size });
      const histories = [];

      if (data && Array.isArray(data.transactions)) {
        for (const tx of data.transactions) {
          const realAmount = typeof tx.gross_amount === "number" ? tx.gross_amount / 100 : 0;
          const timeFormatted = tx.transaction_time
            ? moment(tx.transaction_time).tz("Asia/Jakarta").locale("en").format("DD MMM YYYY - HH:mm:ss")
            : "";

          histories.push({
            type: "payin",
            amount: { displayed_text: `Rp ${realAmount}` },
            time: timeFormatted,
            raw: tx
          });
        }
        return { status: true, data: { histories } };
      }

      return { status: false, message: "No transaction history found." };
    } catch (error) {
      return { status: false, message: error.message || "Error fetching transaction history." };
    }
  }

  async getTransactionsAnalytics({ days = 1, size = 50 } = {}) {
    await this.init();
    const url = new URL("https://api.gojekapi.com/merchant-analytics/v2/merchants/transactions");

    const startTime = moment().subtract(days, "days").tz("Asia/Jakarta").toISOString();
    const endTime = moment().tz("Asia/Jakarta").toISOString();

    url.searchParams.append("from", "0");
    url.searchParams.append("size", String(size));
    url.searchParams.append("statuses", "SETTLEMENT,CAPTURE,REFUND,PARTIAL_REFUND");
    url.searchParams.append("payment_types", "QRIS,GOPAY,OFFLINE_CREDIT_CARD,OFFLINE_DEBIT_CARD,CREDIT_CARD");
    url.searchParams.append("start_time", startTime);
    url.searchParams.append("end_time", endTime);
    url.searchParams.append("merchant_ids", this.merchantId);

    const headers = {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "authentication-type": "go-id",
      "authorization": `Bearer ${this.token}`,
      "content-type": "application/json",
      "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    };

    const response = await fetch(url.toString(), { method: "GET", headers });

    if (response.status === 401) {
      console.log('[GoPayMerchant] Token expired (Analytics), re-logging in...');
      this._initialized = false;
      this.token = null;
      await this.init();
      const retryResponse = await fetch(url.toString(), {
        method: "GET",
        headers: { ...headers, "authorization": `Bearer ${this.token}` }
      });
      if (!retryResponse.ok) throw new Error(`HTTP Error Analytics (retry): ${retryResponse.status} ${retryResponse.statusText}`);
      return await retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`HTTP Error Analytics (${response.status}): ${response.statusText}`);
    }

    return await response.json();
  }
}
