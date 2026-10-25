const KEY = "levsha_tokens";

export const tokens = {
  get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  },
  set(t) { localStorage.setItem(KEY, JSON.stringify(t)); },
  clear() { localStorage.removeItem(KEY); },
};

async function refresh() {
  const t = tokens.get();
  if (!t?.refresh) return false;
  const r = await fetch("/api/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: t.refresh }),
  });
  if (!r.ok) { tokens.clear(); return false; }
  tokens.set({ ...t, access: (await r.json()).access });
  return true;
}

/** fetch с JWT и одной попыткой обновить access-токен. Тело FormData отправляется как есть. */
export async function api(path, { method = "GET", body, retry = true } = {}) {
  const headers = {};
  const t = tokens.get();
  if (t?.access) headers.Authorization = `Bearer ${t.access}`;
  const isForm = body instanceof FormData;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const r = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  if (r.status === 401 && retry && t?.refresh && (await refresh())) {
    return api(path, { method, body, retry: false });
  }
  const data = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) {
    const err = new Error(data?.detail || "Ошибка запроса");
    err.status = r.status;
    err.data = data;
    throw err;
  }
  return data;
}
