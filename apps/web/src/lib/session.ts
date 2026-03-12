const SESSION_KEY = "festspil_session_id";

/** Cached in module scope — only reads sessionStorage once */
let cachedSessionId: string | null = null;

export function getSessionId(): string {
  if (cachedSessionId) return cachedSessionId;

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }

  cachedSessionId = id;
  return id;
}
