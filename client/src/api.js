/**
 * Auth-aware fetch wrapper.
 * Reads the JWT from localStorage and attaches it as a Bearer token.
 * On 401, clears the stored token so the app can re-authenticate.
 */

const TOKEN_KEY = 'impactiq_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(path, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    // Dispatch a custom event so the app can show a login prompt
    window.dispatchEvent(new Event('impactiq:unauthorized'))
  }

  return res
}
