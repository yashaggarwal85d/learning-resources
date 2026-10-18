import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TopicMeta } from '../topics/registry';
import { NOTES_FILE, lineDiff, problemsFor } from '../lib/notes-rules';
import { EditError, SAVE_LIVE_MINUTES, commitMessage, getToken, readFile, setToken, writeFile } from './github-edit';

export type Tab = 'prereq' | 'pre' | 'post' | 'sources';
export type Panel = { id: string; tab: Tab; section?: string };

export const TABS: { id: Tab; label: string }[] = [
  { id: 'prereq', label: 'Prerequisites' },
  { id: 'pre', label: 'Pre-notes' },
  { id: 'post', label: 'Post-notes' },
  { id: 'sources', label: 'Sources' },
];

const EDITABLE = (t: Tab): t is 'pre' | 'post' => t === 'pre' || t === 'post';
const notesPath = (t: TopicMeta, kind: 'pre' | 'post') => `site/src/topics/${t.slug}/${NOTES_FILE[kind]}`;

/** Markdown to safe HTML, the same renderer for the preview and for a just-saved text (loaded only when someone edits). */
async function render(md: string) {
  const [{ marked }, { default: DOMPurify }] = await Promise.all([import('marked'), import('dompurify')]);
  return DOMPurify.sanitize(marked.parse(md, { async: false }) as string, { ADD_ATTR: ['data-section'] });
}

type Status = { kind: 'idle' } | { kind: 'busy'; msg: string } | { kind: 'error'; msg: string } | { kind: 'saved'; at: number };
type Conflict = { theirs: string; sha: string };

/** The right-hand panel: Prerequisites, Pre-notes, Post-notes and Sources of one topic. On a phone it is a full-height drawer.
 * Pre- and Post-notes can be edited in place when an edit token is set; a save is a commit to main (github-edit.ts). */
export default function NotesPanel({ panel, topics, onTab, onClose, dirty }: { panel: Panel | null; topics: TopicMeta[]; onTab: (t: Tab) => void; onClose: () => void; dirty: MutableRefObject<boolean> }) {
  const topic = useMemo(() => topics.find((t) => t.id === panel?.id), [topics, panel?.id]);
  const body = useRef<HTMLDivElement>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [tokenForm, setTokenForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [base, setBase] = useState({ text: '', sha: '' });
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [previewHtml, setPreviewHtml] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [conflict, setConflict] = useState<Conflict | null>(null);
  // Saved this visit: shown instead of the built page until the site is rebuilt.
  const [saved, setSaved] = useState<Record<string, { html: string; at: number }>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => setTokenState(getToken()), [panel?.id]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(id);
  }, []);

  const tab = panel?.tab;
  const key = panel && tab && EDITABLE(tab) ? `${panel.id}:${tab}` : null;
  const problems = useMemo(() => (editing && tab && EDITABLE(tab) ? problemsFor(tab, text) : []), [editing, tab, text]);
  const changed = editing && text !== base.text;
  useEffect(() => {
    dirty.current = changed;
    return () => {
      dirty.current = false;
    };
  }, [changed, dirty]);

  // Leaving the topic or the tab ends an edit that has nothing unsaved (the tab bar asks first otherwise).
  useEffect(() => {
    setEditing(false);
    setConflict(null);
    setStatus((s) => (s.kind === 'saved' ? s : { kind: 'idle' }));
    setMode('write');
  }, [panel?.id, tab]);

  // Reading: copy the page's own hidden rendering of the tab (or the just-saved text) into the panel.
  useEffect(() => {
    if (!panel || !body.current || editing) return;
    const host = body.current;
    const done = () =>
      requestAnimationFrame(() => {
        const target = panel.section ? host.querySelector(`[data-section="${panel.section}"]`) : null;
        if (target) target.scrollIntoView({ block: 'start' });
        else host.parentElement?.scrollTo({ top: 0 });
      });
    const override = key ? saved[key] : undefined;
    if (override) {
      const wrap = document.createElement('article');
      wrap.innerHTML = override.html;
      host.replaceChildren(wrap);
    } else {
      const node = document.getElementById(`${panel.tab}-${panel.id}`);
      if (node) {
        const copy = node.cloneNode(true) as HTMLElement;
        copy.removeAttribute('id');
        copy.hidden = false;
        host.replaceChildren(copy);
      } else host.replaceChildren();
    }
    host.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    done();
  }, [panel, editing, key, saved]);

  // The preview follows the text a moment after typing stops.
  useEffect(() => {
    if (!editing || mode !== 'preview') return;
    const id = window.setTimeout(() => render(text).then(setPreviewHtml), 120);
    return () => clearTimeout(id);
  }, [editing, mode, text]);

  const startEdit = useCallback(async () => {
    if (!topic || !tab || !EDITABLE(tab)) return;
    setStatus({ kind: 'busy', msg: 'Loading the latest version from GitHub…' });
    try {
      const f = await readFile(notesPath(topic, tab));
      setBase(f);
      setText(f.text);
      setEditing(true);
      setConflict(null);
      setStatus({ kind: 'idle' });
    } catch (e) {
      setStatus({ kind: 'error', msg: (e as Error).message });
    }
  }, [topic, tab]);

  const save = useCallback(async () => {
    if (!topic || !tab || !EDITABLE(tab) || !key) return;
    setStatus({ kind: 'busy', msg: 'Saving to GitHub…' });
    try {
      const sha = await writeFile(notesPath(topic, tab), text, base.sha, commitMessage(tab, topic.title, topic.id));
      const html = await render(text);
      const at = Date.now();
      setSaved((s) => ({ ...s, [key]: { html, at } }));
      setNow(at);
      setBase({ text, sha });
      setEditing(false);
      setStatus({ kind: 'saved', at });
    } catch (e) {
      if (e instanceof EditError && e.kind === 'conflict') {
        try {
          const theirs = await readFile(notesPath(topic, tab));
          setConflict({ theirs: theirs.text, sha: theirs.sha });
          setStatus({ kind: 'error', msg: 'The file changed on GitHub while you were editing. Nothing was overwritten.' });
        } catch (e2) {
          setStatus({ kind: 'error', msg: (e2 as Error).message });
        }
      } else setStatus({ kind: 'error', msg: (e as Error).message });
    }
  }, [topic, tab, key, text, base.sha]);

  const requestTab = (t: Tab) => {
    if (t === tab) return;
    if (changed && !window.confirm('Discard your unsaved edits?')) return;
    dirty.current = false;
    onTab(t);
  };

  const minutesLeft = status.kind === 'saved' ? Math.max(0, SAVE_LIVE_MINUTES - Math.floor(Math.max(0, now - status.at) / 60000)) : 0;
  const diff = useMemo(() => (conflict ? lineDiff(conflict.theirs, text) : []), [conflict, text]);

  return (
    <AnimatePresence>
      {panel && topic && (
        <motion.div className="fixed inset-0 z-[55]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 hidden bg-void/55 sm:block" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Notes"
            className="absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-crema/10 bg-roast shadow-[-30px_0_80px_rgba(0,0,0,.55)] sm:w-[min(36rem,92vw)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 34 }}
          >
            <div className="flex items-start justify-between gap-3 px-4 pb-1 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
              <div className="min-w-0">
                <p className="eyebrow text-[0.62rem] text-caramel">
                  §{topic.chapter.section} · Milestone {topic.milestone.number} · Ch.{topic.chapter.number}
                </p>
                <h2 className="truncate font-display text-xl font-bold text-crema">{topic.title}</h2>
              </div>
              <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-latte hover:bg-crema/10 hover:text-crema" aria-label="Close panel">
                ✕
              </button>
            </div>

            <div role="tablist" aria-label="Notes" className="flex gap-1 overflow-x-auto px-3 pb-2 pt-1 sm:px-5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => requestTab(t.id)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${tab === t.id ? 'bg-caramel text-espresso font-semibold' : 'border border-crema/15 text-latte hover:border-caramel hover:text-crema'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {status.kind === 'saved' && !editing && (
              <p role="status" className="mx-4 mb-2 rounded-xl border border-caramel/40 bg-caramel/10 px-3 py-2 text-[0.82rem] text-crema sm:mx-6">
                Saved to GitHub.{' '}
                {minutesLeft > 0 ? `Live on the site in about ${minutesLeft} min; this panel shows your text until then.` : 'The site should be rebuilt now; reload to see the published page.'}
              </p>
            )}
            {status.kind === 'busy' && <p role="status" className="mx-4 mb-2 text-[0.82rem] text-latte sm:mx-6">{status.msg}</p>}
            {status.kind === 'error' && (
              <p role="alert" className="mx-4 mb-2 rounded-xl border border-red-400/40 bg-red-400/10 px-3 py-2 text-[0.82rem] text-crema sm:mx-6">
                {status.msg}
              </p>
            )}

            {editing && tab && EDITABLE(tab) ? (
              <div className="flex min-h-0 flex-1 flex-col px-4 pb-3 sm:px-6">
                <div className="mb-2 flex items-center gap-2">
                  {(['write', 'preview'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-full px-3 py-1 text-sm ${mode === m ? 'bg-crema/15 text-crema' : 'text-latte hover:text-crema'}`}>
                      {m === 'write' ? 'Markdown' : 'Preview'}
                    </button>
                  ))}
                  <span className="ml-auto text-[0.72rem] text-latte">{NOTES_FILE[tab]}</span>
                </div>
                {mode === 'write' ? (
                  <textarea
                    aria-label={`Edit ${NOTES_FILE[tab]}`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    spellCheck
                    className="min-h-0 flex-1 resize-none rounded-xl border border-crema/15 bg-espresso/70 p-3 font-mono text-[0.8rem] leading-relaxed text-crema outline-none focus:border-caramel"
                  />
                ) : (
                  <div className="deep min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border border-crema/10 p-3" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                )}
                {problems.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-[0.78rem] text-caramel" aria-label="Problems that would fail the build">
                    {problems.map((p) => (
                      <li key={p}>This file {p}</li>
                    ))}
                  </ul>
                )}
                {conflict && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-crema/15 bg-espresso/60 p-2 font-mono text-[0.72rem] leading-snug" aria-label="Differences from the version on GitHub">
                    <p className="mb-1 font-sans text-[0.78rem] text-latte">GitHub (red, −) against yours (green, +):</p>
                    {diff
                      .filter((d, i) => d.op !== ' ' || diff.slice(Math.max(0, i - 1), i + 2).some((n) => n.op !== ' '))
                      .map((d, i) => (
                        <div key={i} className={d.op === '-' ? 'text-red-300' : d.op === '+' ? 'text-emerald-300' : 'text-taupe'}>
                          {d.op} {d.line}
                        </div>
                      ))}
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {conflict ? (
                    <>
                      <button
                        type="button"
                        className="rounded-full bg-caramel px-4 py-2 text-sm font-semibold text-espresso"
                        onClick={() => {
                          setBase({ text: conflict.theirs, sha: conflict.sha });
                          setText(conflict.theirs);
                          setConflict(null);
                          setStatus({ kind: 'idle' });
                        }}
                      >
                        Take GitHub’s version
                      </button>
                      <button type="button" className="rounded-full border border-crema/20 px-4 py-2 text-sm text-crema" onClick={() => navigator.clipboard?.writeText(text)}>
                        Copy my text
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={!changed || problems.length > 0 || status.kind === 'busy'}
                      onClick={save}
                      className="rounded-full bg-caramel px-4 py-2 text-sm font-semibold text-espresso disabled:opacity-40"
                    >
                      Save to GitHub
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-full border border-crema/20 px-4 py-2 text-sm text-crema"
                    onClick={() => {
                      if (changed && !window.confirm('Discard your unsaved edits?')) return;
                      setEditing(false);
                      setConflict(null);
                      setStatus({ kind: 'idle' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6">
                {token && tab && EDITABLE(tab) && (
                  <button type="button" onClick={startEdit} disabled={status.kind === 'busy'} className="mb-2 mt-1 rounded-full border border-crema/20 px-4 py-1.5 text-sm text-crema hover:border-caramel disabled:opacity-50">
                    Edit {tab === 'pre' ? 'pre-notes' : 'post-notes'}
                  </button>
                )}
                <div ref={body} className="deep" />
              </div>
            )}

            <div className="border-t border-crema/10 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[0.74rem] text-latte sm:px-6">
              {tokenForm ? (
                <form
                  className="flex flex-wrap items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const v = new FormData(e.currentTarget).get('token')?.toString().trim() ?? '';
                    setToken(v || null);
                    setTokenState(v || null);
                    setTokenForm(false);
                  }}
                >
                  <label className="sr-only" htmlFor="edit-token">GitHub token</label>
                  <input id="edit-token" name="token" type="password" autoComplete="off" placeholder="Fine-grained token (Contents: read and write)" className="min-w-0 flex-1 rounded-lg border border-crema/20 bg-espresso/70 px-2 py-1 text-crema outline-none focus:border-caramel" />
                  <button type="submit" className="rounded-full bg-caramel px-3 py-1 font-semibold text-espresso">Keep in this browser</button>
                  {token && (
                    <button type="button" className="rounded-full border border-crema/20 px-3 py-1 text-crema" onClick={() => { setToken(null); setTokenState(null); setTokenForm(false); }}>
                      Remove
                    </button>
                  )}
                  <button type="button" className="px-2 py-1" onClick={() => setTokenForm(false)}>Cancel</button>
                </form>
              ) : (
                <button type="button" className="underline-offset-2 hover:underline" onClick={() => setTokenForm(true)}>
                  {token ? 'Editing is on in this browser · change or remove the token' : 'Editing is off · set an edit token'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
