const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const KEY = 'gobiz:session'

function available() {
  const ok = Boolean(REST_URL && REST_TOKEN)
  if (!ok) console.warn('[TokenStore] KV_REST_API_URL/UPSTASH_REDIS_REST_URL or the matching token env var is missing — session caching is disabled, every cold start will re-login.')
  return ok
}

async function kvCommand(command) {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) {
    console.warn(`[TokenStore] Upstash command ${command[0]} failed (${res.status}): ${data.error || res.statusText}`)
    return null
  }
  return data.result
}

export async function loadSession() {
  if (!available()) return null
  const raw = await kvCommand(['GET', KEY])
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.warn(`[TokenStore] Cached session was not valid JSON: ${e.message}`)
    return null
  }
}

export async function saveSession(session) {
  if (!available()) return
  const result = await kvCommand(['SET', KEY, JSON.stringify(session)])
  if (result === 'OK') {
    console.log('[TokenStore] Session cached to KV.')
  } else {
    console.warn(`[TokenStore] SET did not return OK (got ${JSON.stringify(result)}) — session may not have been cached.`)
  }
}

export async function clearSession() {
  if (!available()) return
  await kvCommand(['DEL', KEY])
}
