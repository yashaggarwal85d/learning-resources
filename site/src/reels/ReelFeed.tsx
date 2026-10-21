import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Mark from '../components/Mark';
import type { TopicMeta } from '../topics/registry';
import type { Reel } from './types';
import ReelPlayer from './ReelPlayer';
import NotesPanel, { type Panel, type Tab } from './NotesPanel';
import { allProgress, getProgress, lastTopic, setLastTopic, type TopicProgress } from './progress';

export type FeedDomain = { id: string; title: string; live: number };
export type TreeDomain = {
  id: string;
  title: string;
  coming: number;
  milestones: { number: number; title: string; chapters: { number: number; title: string; topics: { id: string; title: string }[] }[] }[];
};
type NextInfo = { title: string; live: boolean } | null;

type Props = {
  base: string; // site base path, ending in '/'
  domains: FeedDomain[];
  topics: TopicMeta[];
  initialDomain: string;
  initialTopic?: string;
  nextAfter: Record<string, NextInfo>;
  upcoming: Record<string, string[]>;
  tree: TreeDomain[];
  comingTotal: number;
};

const loaders = import.meta.glob<{ default: Reel }>('../topics/**/reel.tsx');
const loaderFor = (t: TopicMeta) => loaders[`../topics/${t.slug}/reel.tsx`];

export default function ReelFeed({ base, domains, topics, initialDomain, initialTopic, nextAfter, upcoming, tree, comingTotal }: Props) {
  const [domain, setDomain] = useState(initialDomain);
  const list = useMemo(() => topics.filter((t) => t.domain === domain), [topics, domain]);
  const [active, setActive] = useState(-1);
  const [reels, setReels] = useState<Record<string, Reel>>({});
  const [starts, setStarts] = useState<Record<string, { step: number; epoch: number }>>({});
  const [sheet, setSheet] = useState<Panel | null>(null);
  const dirty = useRef(false); // the panel holds unsaved edits
  const [treeOpen, setTreeOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; action?: { label: string; run: () => void } } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);

  const showToast = useCallback((msg: string, action?: { label: string; run: () => void }) => {
    setToast({ msg, action });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), toast.action ? 5000 : 2400);
    return () => clearTimeout(id);
  }, [toast]);

  // Load the reel in view and the one after it, so the next swipe starts instantly.
  useEffect(() => {
    [active, active + 1].forEach((i) => {
      const t = list[i];
      if (!t || reels[t.id]) return;
      loaderFor(t)?.().then((m) => setReels((r) => ({ ...r, [t.id]: m.default })));
    });
  }, [active, list, reels]);

  const scrollToIndex = useCallback((i: number, smooth = true) => {
    const el = sections.current[i];
    if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
  }, []);

  // Where to start: the linked topic and step, else where you left off.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedHere = list.some((t) => t.id === initialTopic) ? initialTopic : undefined;
    const id = linkedHere ?? lastTopic(domain) ?? list[0]?.id;
    const idx = Math.max(0, list.findIndex((t) => t.id === id));
    const t = list[idx];
    if (!t) {
      setActive(0);
      return;
    }
    const linked = initialTopic === t.id && params.get('step');
    const saved = getProgress(t.id);
    let step = 0;
    if (linked) step = Math.max(0, Number(params.get('step')) - 1 || 0);
    else if (saved && !saved.done && saved.step > 0) {
      step = saved.step;
      showToast(`Resumed at step ${step + 1}`, {
        label: 'Start over',
        run: () => setStarts((s) => ({ ...s, [t.id]: { step: 0, epoch: (s[t.id]?.epoch ?? 0) + 1 } })),
      });
    }
    setStarts((s) => ({ ...s, [t.id]: { step, epoch: s[t.id]?.epoch ?? 0 } }));
    requestAnimationFrame(() => scrollToIndex(idx, false));
    setActive(idx);
  }, [domain]); // eslint-disable-line react-hooks/exhaustive-deps

  // The section mostly in view is the active one.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { root: scroller.current, threshold: [0.6] },
    );
    sections.current.forEach((s) => s && io.observe(s));
    return () => io.disconnect();
  }, [list]);

  // Keep the address bar on the topic in view, so a refresh or share lands here.
  useEffect(() => {
    const t = list[active];
    if (!t) return;
    setLastTopic(domain, t.id);
    const url = `${base}${t.slug}/`;
    if (window.location.pathname !== url) history.replaceState(null, '', url);
    document.title = `${t.title} · The Learning Experience`;
  }, [active, list, base, domain]);

  const closeSheet = useCallback(() => {
    if (dirty.current && !window.confirm('Discard your unsaved edits?')) return;
    dirty.current = false;
    setSheet(null);
  }, []);

  // ↑ / ↓ move between topics.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSheet();
        setTreeOpen(false);
        return;
      }
      if (sheet || treeOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToIndex(Math.min(active + 1, list.length));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToIndex(Math.max(active - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, list.length, scrollToIndex, sheet, treeOpen, closeSheet]);

  const playTopic = (id: string) => {
    const t = topics.find((x) => x.id === id);
    if (!t) return;
    setTreeOpen(false);
    const saved = getProgress(id);
    const step = saved && !saved.done ? saved.step : 0;
    setStarts((s) => ({ ...s, [id]: { step, epoch: (s[id]?.epoch ?? 0) + 1 } }));
    if (t.domain !== domain) {
      setLastTopic(t.domain, id);
      setDomain(t.domain);
      return;
    }
    scrollToIndex(list.findIndex((x) => x.id === id));
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="fixed inset-0 bg-espresso text-crema">
      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-center gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <a
          href={base}
          className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-md border border-crema/12 bg-espresso/80 text-chalk backdrop-blur transition hover:border-crema/45"
          aria-label="Home"
        >
          <Mark size={22} />
        </a>
        <nav className="no-scrollbar pointer-events-auto mx-auto flex min-w-0 gap-1 overflow-x-auto rounded-full border border-crema/12 bg-espresso/80 p-1 backdrop-blur" aria-label="Domains">
          {domains.map((d) => {
            const on = d.id === domain;
            return (
              <button
                key={d.id}
                type="button"
                disabled={!d.live}
                onClick={() => setDomain(d.id)}
                className={`relative shrink-0 rounded-full px-3 py-1.5 text-[0.8rem] transition sm:px-4 ${on ? 'text-espresso' : d.live ? 'text-latte hover:text-chalk' : 'cursor-not-allowed text-latte/40'}`}
              >
                {on && <motion.span layoutId="feed-chip" className="absolute inset-0 rounded-full bg-chalk" transition={{ type: 'spring', stiffness: 380, damping: 36 }} />}
                <span className="relative whitespace-nowrap">
                  {d.title}
                  {!d.live && <span className="ml-1.5 font-mono text-[0.58rem] uppercase tracking-wider">soon</span>}
                </span>
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => setTreeOpen(true)}
          className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-md border border-crema/12 bg-espresso/80 text-crema backdrop-blur transition hover:border-crema/45 hover:text-chalk"
          aria-label="Curriculum"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="5" cy="5" r="2" />
            <path d="M5 7v12M5 12h6M5 19h6" />
            <circle cx="14" cy="12" r="2" />
            <circle cx="14" cy="19" r="2" />
            <path d="M16 12h5M16 19h5" />
          </svg>
        </button>
      </header>

      {/* The feed */}
      <div ref={scroller} className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto overscroll-contain">
        {list.map((t, i) => {
          const reel = reels[t.id];
          const start = starts[t.id] ?? { step: 0, epoch: 0 };
          return (
            <section
              key={t.id}
              ref={(el) => {
                sections.current[i] = el;
              }}
              data-index={i}
              className="grain reel-bg relative h-[100dvh] snap-start snap-always overflow-hidden"
              aria-label={t.title}
            >
              <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
              {reel ? (
                <ReelPlayer
                  key={`${t.id}-${start.epoch}`}
                  meta={t}
                  reel={reel}
                  active={active === i && !sheet && !treeOpen}
                  startStep={start.step}
                  next={nextAfter[t.id] ?? null}
                  onPlayNext={() => scrollToIndex(i + 1)}
                  onOpenSheet={(tab: Tab = 'post', section?: string) => setSheet({ id: t.id, tab, section })}
                  onOpenTree={() => setTreeOpen(true)}
                  onToast={(m) => showToast(m)}
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <span className="h-8 w-8 animate-spin rounded-full border border-crema/15 border-t-chalk" />
                </div>
              )}
            </section>
          );
        })}
        <section
          ref={(el) => {
            sections.current[list.length] = el;
          }}
          data-index={list.length}
          className="grain relative grid h-[100dvh] snap-start place-items-center bg-void px-6"
        >
          <div className="w-full max-w-md text-center">
            <svg className="mx-auto text-chalk" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m7.5 12.5 3 3 6-7" />
            </svg>
            <p className="eyebrow mt-5 text-[0.62rem] text-taupe">End of the feed</p>
            <h2 className="mt-2 font-display text-3xl font-[350] text-chalk">You're all caught up</h2>
            <p className="mt-2 text-latte">
              {list.length === 1 ? 'That is the one reel live in this domain so far.' : `That is all ${list.length} reels live in this domain so far.`} New topics go live one at a time, as each one is finished and verified.
            </p>
            {upcoming[domain]?.length > 0 && (
              <div className="mt-8 rounded-md border border-line bg-panel p-5 text-left">
                <p className="eyebrow text-[0.6rem] text-taupe">Next in production</p>
                <ol className="mt-3 space-y-2.5">
                  {upcoming[domain].map((u, i) => (
                    <li key={u} className="flex gap-3 text-sm text-crema">
                      <span className="font-mono text-taupe">{String(i + 1).padStart(2, '0')}</span>
                      {u}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="mt-6 flex justify-center gap-2">
              <button type="button" onClick={() => setTreeOpen(true)} className="rounded-full bg-caramel px-5 py-2.5 font-semibold text-espresso transition hover:bg-chalk">
                Open curriculum
              </button>
              <a href={base} className="rounded-full border border-crema/20 px-5 py-2.5 text-crema transition hover:border-crema/60 hover:text-chalk">
                Home
              </a>
            </div>
          </div>
        </section>
      </div>

      <NotesPanel panel={sheet} topics={topics} dirty={dirty} onTab={(tab) => setSheet((p) => (p ? { id: p.id, tab } : p))} onClose={closeSheet} />
      <AnimatePresence>{treeOpen && <Tree tree={tree} coming={comingTotal} current={list[active]?.id} onClose={() => setTreeOpen(false)} onPlay={playTopic} />}</AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed left-1/2 top-20 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-md border border-crema/15 bg-panel/95 px-4 py-2 text-sm text-chalk shadow-2xl backdrop-blur"
            role="status"
          >
            <span className="truncate">{toast.msg}</span>
            {toast.action && (
              <button
                type="button"
                className="shrink-0 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-chalk underline underline-offset-4"
                onClick={() => {
                  toast.action?.run();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}

/** The curriculum, live reels only, with progress. */
function Tree({ tree, coming, current, onClose, onPlay }: { tree: TreeDomain[]; coming: number; current?: string; onClose: () => void; onPlay: (id: string) => void }) {
  const [progress, setProgress] = useState<Record<string, TopicProgress>>({});
  useEffect(() => setProgress(allProgress()), []);
  return (
    <motion.div className="fixed inset-0 z-[56] overflow-y-auto bg-espresso/96 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Curriculum">
      <div className="mx-auto max-w-2xl px-5 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <p className="eyebrow text-latte">Library · live reels</p>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-md border border-crema/15 text-crema transition hover:border-crema/50 hover:text-chalk" aria-label="Close curriculum">
            ✕
          </button>
        </div>
        {tree.map((d, di) => (
          <motion.section key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + di * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mt-10">
            <h2 className="font-display text-3xl font-[350] text-chalk">{d.title}</h2>
            {d.milestones.map((m) => (
              <div key={m.number} className="mt-5">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-taupe">
                  Milestone {m.number} · {m.title}
                </p>
                {m.chapters.map((c) => (
                  <div key={c.number} className="mt-3 border-l border-line pl-4">
                    <p className="text-sm text-latte">
                      <span className="font-mono text-[0.75rem] text-chalk">Ch.{c.number}</span> {c.title}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {c.topics.map((t) => {
                        const pr = progress[t.id];
                        const frac = pr ? (pr.done ? 1 : (pr.step + 1) / pr.steps) : 0;
                        const isCur = t.id === current;
                        return (
                          <li key={t.id}>
                            <button
                              type="button"
                              onClick={() => onPlay(t.id)}
                              className={`flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition duration-200 hover:border-crema/45 ${isCur ? 'border-crema/50 bg-crema/[0.06]' : 'border-line bg-panel/70'}`}
                            >
                              <Ring frac={frac} done={!!pr?.done} />
                              <span className="min-w-0 flex-1">
                                <span className="block font-medium text-chalk">{t.title}</span>
                                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-taupe">
                                  {pr?.done ? 'Watched' : pr ? `Step ${pr.step + 1} of ${pr.steps}` : 'Not started'}
                                  {isCur ? ' · playing' : ''}
                                </span>
                              </span>
                              <span className="text-[0.7rem] text-crema">▶</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </motion.section>
        ))}
        <p className="mt-10 text-center font-mono text-xs uppercase tracking-[0.16em] text-taupe">{coming.toLocaleString('en-US')} more topics on the way</p>
      </div>
    </motion.div>
  );
}

function Ring({ frac, done }: { frac: number; done: boolean }) {
  const c = 2 * Math.PI * 9;
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(237,237,237,.14)" strokeWidth="2" />
      <circle cx="12" cy="12" r="9" fill="none" stroke="#ededed" strokeWidth="2" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} strokeLinecap="round" transform="rotate(-90 12 12)" />
      {done && <path d="m8 12.3 2.6 2.6L16 9.5" fill="none" stroke="#ededed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
