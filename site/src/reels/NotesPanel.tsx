import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { TopicMeta } from '../topics/registry';
import { NOTES_FILE, problemsFor } from '../lib/notes-rules';
import { ISSUE_URL_MAX, SAVE_LIVE_MINUTES, issueBody, issueUrl, readFile } from './github-edit';

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

type Status = { kind: 'idle' } | { kind: 'busy'; msg: string } | { kind: 'error'; msg: string } | { kind: 'sent'; clipboard: boolean };

/** The right-hand panel: Prerequisites, Pre-notes, Post-notes and Sources of one topic. On a phone it is a full-height drawer.
 * Pre- and Post-notes can be edited in place on any device: Save opens a prefilled GitHub issue that the notes-edit
 * workflow applies with the repository's NOTES_EDIT_TOKEN secret (github-edit.ts) — no token ever lives in the browser. */
export default function NotesPanel({ panel, topics, onTab, onClose, dirty }: { panel: Panel | null; topics: TopicMeta[]; onTab: (t: Tab) => void; onClose: () => void; dirty: MutableRefObject<boolean> }) {
  const topic = useMemo(() => topics.find((t) => t.id === panel?.id), [topics, panel?.id]);
  const body = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [base, setBase] = useState({ text: '', sha: '' });
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [previewHtml, setPreviewHtml] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const tab = panel?.tab;
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
    setStatus({ kind: 'idle' });
    setMode('write');
  }, [panel?.id, tab]);

  // Reading: copy the page's own hidden rendering of the tab into the panel.
  useEffect(() => {
    if (!panel || !body.current || editing) return;
    const host = body.current;
    const done = () =>
      requestAnimationFrame(() => {
        const target = panel.section ? host.querySelector(`[data-section="${panel.section}"]`) : null;
        if (target) target.scrollIntoView({ block: 'start' });
        else host.parentElement?.scrollTo({ top: 0 });
      });
    const node = document.getElementById(`${panel.tab}-${panel.id}`);
    if (node) {
      const copy = node.cloneNode(true) as HTMLElement;
      copy.removeAttribute('id');
      copy.hidden = false;
      host.replaceChildren(copy);
    } else host.replaceChildren();
    host.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    done();
  }, [panel, editing]);

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
      setStatus({ kind: 'idle' });
    } catch (e) {
      setStatus({ kind: 'error', msg: (e as Error).message });
    }
  }, [topic, tab]);

  // Save always hands the edit to GitHub as an issue. The tab opens inside the click (a popup blocker allows that); the
  // editor stays open, so nothing is lost if the issue is never submitted.
  const save = useCallback(() => {
    if (!topic || !tab || !EDITABLE(tab)) return;
    const body = issueBody(tab, topic.id, notesPath(topic, tab), base.sha, text);
    const direct = issueUrl(tab, topic.title, body);
    const viaClipboard = direct.length > ISSUE_URL_MAX;
    if (viaClipboard) navigator.clipboard?.writeText(body);
    window.open(viaClipboard ? issueUrl(tab, topic.title, null) : direct, '_blank', 'noopener');
    setStatus({ kind: 'sent', clipboard: viaClipboard });
  }, [topic, tab, base.sha, text]);

  const requestTab = (t: Tab) => {
    if (t === tab) return;
    if (changed && !window.confirm('Discard your unsaved edits?')) return;
    dirty.current = false;
    onTab(t);
  };

  return (
    <AnimatePresence>
      {panel && topic && (
        <motion.div className="fixed inset-0 z-[55]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close" className="absolute inset-0 hidden bg-void/60 sm:block" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Notes"
            className="absolute inset-y-0 right-0 flex h-dvh w-full flex-col border-l border-line bg-panel shadow-[-30px_0_80px_rgba(0,0,0,.6)] sm:w-[min(36rem,92vw)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 36 }}
          >
            <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-[max(0.9rem,env(safe-area-inset-top))] sm:px-6">
              <div className="min-w-0">
                <p className="eyebrow text-[0.6rem] text-taupe">
                  Dossier · §{topic.chapter.section} · Milestone {topic.milestone.number} · Ch.{topic.chapter.number}
                </p>
                <h2 className="mt-1 truncate font-display text-[1.35rem] font-[350] text-chalk">{topic.title}</h2>
              </div>
              <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-crema/12 text-latte transition hover:border-crema/45 hover:text-chalk" aria-label="Close panel">
                ✕
              </button>
            </div>

            <div role="tablist" aria-label="Notes" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 sm:px-5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => requestTab(t.id)}
                  className={`relative shrink-0 whitespace-nowrap px-2.5 pb-2.5 pt-2 text-[0.86rem] transition-colors duration-300 ${tab === t.id ? 'text-chalk' : 'text-taupe hover:text-crema'}`}
                >
                  {t.label}
                  {tab === t.id && <motion.span layoutId="notes-tab" className="absolute inset-x-2 -bottom-px h-[1.5px] bg-caramel" transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} />}
                </button>
              ))}
            </div>
            <div className="h-3 shrink-0" />

            {status.kind === 'sent' && (
              <p role="status" className="mx-4 mb-2 rounded-md border border-crema/25 bg-crema/[0.05] px-3 py-2 text-[0.82rem] text-chalk sm:mx-6">
                {status.clipboard ? 'Opened a GitHub issue in a new tab; the edit was too long for a link, so it is on your clipboard: paste it over the issue text. ' : 'Opened a GitHub issue in a new tab with your edit. '}
                Submit it there (signed in as the owner): it is checked and committed, and live in about {SAVE_LIVE_MINUTES + 1} min. If it can’t be applied, the issue says why.
              </p>
            )}
            {status.kind === 'busy' && <p role="status" className="mx-4 mb-2 text-[0.82rem] text-latte sm:mx-6">{status.msg}</p>}
            {status.kind === 'error' && (
              <p role="alert" className="mx-4 mb-2 rounded-md border border-signal/40 bg-signal/10 px-3 py-2 text-[0.82rem] text-chalk sm:mx-6">
                {status.msg}
              </p>
            )}

            {editing && tab && EDITABLE(tab) ? (
              <div className="flex min-h-0 flex-1 flex-col px-4 pb-3 sm:px-6">
                <div className="mb-2 flex items-center gap-2">
                  {(['write', 'preview'] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-md px-3 py-1 text-sm ${mode === m ? 'bg-crema/12 text-chalk' : 'text-taupe hover:text-crema'}`}>
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
                    className="min-h-0 flex-1 resize-none rounded-md border border-line bg-espresso/80 p-3 font-mono text-[0.8rem] leading-relaxed text-crema outline-none focus:border-crema/60"
                  />
                ) : (
                  <div className="deep min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md border border-line p-3" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                )}
                {problems.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-[0.78rem] text-signal" aria-label="Problems that would fail the build">
                    {problems.map((p) => (
                      <li key={p}>This file {p}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!changed || problems.length > 0 || status.kind === 'busy'}
                    onClick={save}
                    className="rounded-full bg-caramel px-4 py-2 text-sm font-semibold text-espresso transition hover:bg-chalk disabled:opacity-40"
                  >
                    Save via GitHub issue
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-crema/20 px-4 py-2 text-sm text-crema transition hover:border-crema/60 hover:text-chalk"
                    onClick={() => {
                      if (changed && !window.confirm('Discard your unsaved edits?')) return;
                      setEditing(false);
                      setStatus({ kind: 'idle' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6">
                {tab && EDITABLE(tab) && (
                  <button type="button" onClick={startEdit} disabled={status.kind === 'busy'} className="mb-2 mt-1 rounded-full border border-crema/20 px-4 py-1.5 text-sm text-crema transition hover:border-crema/60 hover:text-chalk disabled:opacity-50">
                    Edit {tab === 'pre' ? 'pre-notes' : 'post-notes'}
                  </button>
                )}
                <div ref={body} className="deep" />
              </div>
            )}

            <p className="border-t border-line px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[0.74rem] text-taupe sm:px-6">
              Edits save through a GitHub issue, applied automatically.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
