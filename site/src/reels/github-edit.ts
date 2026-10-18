// Saving a notes file from the browser: the GitHub REST contents API, as the owner, with a fine-grained personal access
// token (Contents: read and write, this repository only) that lives in this browser's localStorage and nowhere else.
// A save is a commit to main; the Deploy workflow then rebuilds the site (SAVE_LIVE_MINUTES is its usual duration).
// The API takes the sha of the file being replaced and refuses the write when the file has changed since, so a save
// never overwrites someone else's edit: the caller shows both versions instead.

export const OWNER = 'yashaggarwal85d';
export const REPO = 'learning-resources';
export const BRANCH = 'main';
export const SAVE_LIVE_MINUTES = 4;
const TOKEN_KEY = 'lr.edit.token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};
export const setToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t.trim());
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private window: the token simply isn't kept */
  }
};

export class EditError extends Error {
  constructor(public kind: 'auth' | 'missing' | 'conflict' | 'network' | 'other', message: string) {
    super(message);
  }
}

const bytesToBase64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const base64ToText = (b64: string) => {
  const bin = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

async function api(path: string, init: RequestInit = {}) {
  const token = getToken();
  if (!token) throw new EditError('auth', 'No edit token is set in this browser.');
  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
      ...init,
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch {
    throw new EditError('network', 'Could not reach GitHub. Check the connection and try again.');
  }
  if (res.ok) return res.json();
  if (res.status === 401) throw new EditError('auth', 'GitHub rejected the token (expired or revoked). Set a new one.');
  if (res.status === 403) throw new EditError('auth', 'The token is not allowed to write here. It needs Contents: read and write on this repository.');
  if (res.status === 404) throw new EditError('missing', 'GitHub says this file or repository is not visible to the token.');
  if (res.status === 409 || res.status === 422) throw new EditError('conflict', 'The file changed on GitHub after you opened it.');
  throw new EditError('other', `GitHub answered ${res.status}.`);
}

export type RemoteFile = { text: string; sha: string };

/** The file as it is on main right now (its text and the sha a save must quote). */
export async function readFile(path: string): Promise<RemoteFile> {
  const j = await api(`contents/${path}?ref=${BRANCH}`);
  return { text: base64ToText(j.content), sha: j.sha };
}

/** Replace the file, quoting the sha it was read at; resolves with the new sha. Throws EditError('conflict') when it moved. */
export async function writeFile(path: string, text: string, sha: string, message: string): Promise<string> {
  const j = await api(`contents/${path}`, { method: 'PUT', body: JSON.stringify({ message, content: bytesToBase64(text), sha, branch: BRANCH }) });
  return j.content.sha;
}

/** The commit message of an owner edit: the Unlock line is what lets the locked-reel check accept a change to a live topic. */
export const commitMessage = (kind: 'pre' | 'post', title: string, topicId: string) =>
  `Edit ${kind}-notes: ${title}\n\nEdited in the page by the owner.\nUnlock: ${topicId}`;
