// Saving a notes file from the browser: the file is read anonymously (the repository is public), and a save is always a
// GitHub issue opened by the owner, never a write from the browser. The notes-edit workflow
// (.github/workflows/notes-edit.yml, scripts/apply-notes-edit.mjs) checks the issue and commits it with the
// repository's NOTES_EDIT_TOKEN secret (owner decision 2026-10-22: one path, no token ever lives in a browser). The
// issue carries the sha the edit started from, so the workflow refuses it rather than overwrite a change made meanwhile.

export const OWNER = 'yashaggarwal85d';
export const REPO = 'learning-resources';
export const BRANCH = 'main';
export const SAVE_LIVE_MINUTES = 4;

export class EditError extends Error {
  constructor(public kind: 'missing' | 'network' | 'other', message: string) {
    super(message);
  }
}

const base64ToText = (b64: string) => {
  const bin = atob(b64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

async function api(path: string, init: RequestInit = {}) {
  let res: Response;
  try {
    res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/${path}`, {
      ...init,
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch {
    throw new EditError('network', 'Could not reach GitHub. Check the connection and try again.');
  }
  if (res.ok) return res.json();
  if (res.status === 403) throw new EditError('network', 'GitHub is limiting requests from this network for now. Try again in a few minutes.');
  if (res.status === 404) throw new EditError('missing', 'GitHub says this file or repository is not visible.');
  throw new EditError('other', `GitHub answered ${res.status}.`);
}

export type RemoteFile = { text: string; sha: string };

/** The file as it is on main right now (its text and the sha a save must quote). */
export async function readFile(path: string): Promise<RemoteFile> {
  const j = await api(`contents/${path}?ref=${BRANCH}`);
  return { text: base64ToText(j.content), sha: j.sha };
}

// The issue route. The body format is what scripts/apply-notes-edit.mjs parses: keep the two in step.
export const ISSUE_TITLE_PREFIX = '[notes-edit]';
/** GitHub refuses (414) prefilled issue links much past 8 KB; past this the body goes through the clipboard instead. */
export const ISSUE_URL_MAX = 7500;

export function issueBody(kind: 'pre' | 'post', topicId: string, path: string, baseSha: string, text: string) {
  const longest = Math.max(3, ...(text.match(/~+/g) ?? []).map((m) => m.length));
  const fence = '~'.repeat(longest + 1);
  return [
    '<!-- notes-edit: applied by .github/workflows/notes-edit.yml when the repository owner opens it -->',
    `Topic: ${topicId}`,
    `File: ${path}`,
    `Base: ${baseSha}`,
    `Kind: ${kind}`,
    '',
    `${fence}markdown`,
    text.replace(/\n$/, ''),
    fence,
    '',
  ].join('\n');
}

/** The prefilled "new issue" link; `body` null leaves a note to paste the clipboard over (the text was too long for a link). */
export function issueUrl(kind: 'pre' | 'post', title: string, body: string | null) {
  const params = new URLSearchParams({
    title: `${ISSUE_TITLE_PREFIX} ${kind === 'pre' ? 'Pre-notes' : 'Post-notes'}: ${title}`,
    body: body ?? 'The edit is on your clipboard: select all of this text and paste over it, then submit.',
  });
  return `https://github.com/${OWNER}/${REPO}/issues/new?${params}`;
}
