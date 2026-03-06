/**
 * Utilitários simples de autenticação para o frontend.
 * Todos usam localStorage, então só funcionam no browser.
 */

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem("roomsync_token");
}

export function getUsuario() {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem("roomsync_usuario");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (!isBrowser()) return;
  localStorage.removeItem("roomsync_token");
  localStorage.removeItem("roomsync_usuario");
}

export function isAuthenticated() {
  return !!getToken();
}

