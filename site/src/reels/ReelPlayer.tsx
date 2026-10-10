import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Reel } from './types';
import type { TopicMeta } from '../topics/registry';
import { saveProgress } from './progress';
import { clamp } from './anim';
import { Brewed } from './Brewed';

type Next = { title: string; live: boolean } | null;

type Props = {
  meta: TopicMeta;
  reel: Reel;
  active: boolean; // in view: plays and takes the keyboard
  startStep: number;
  next: Next;
  onPlayNext: () => void;
  onOpenSheet: (section?: string) => void;
  onOpenTree: () => void;
  onToast: (msg: string) => void;
};

const usePortrait = () => {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const set = () => setPortrait(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);
  return portrait;
};

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ReelPlayer({ meta, reel, active, startStep, next, onPlayNext, onOpenSheet, onOpenTree, onToast }: Props) {
  const steps = reel.steps;
  const last = steps.length - 1;
  const [step, setStep] = useState(() => clamp(startStep, 0, last));
  const [t, setT] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [nudge, setNudge] = useState(0); // shakes the options when "next" is pressed unanswered
  const portrait = usePortrait();
  const tRef = useRef(0);
  const cur = steps[step];
  const answer = answers[step] ?? null;
  const needsAnswer = !!cur.predict && answer === null;
  const done = t >= cur.duration;

  // A step opens at its start, or at its end state with reduced motion.
  const goTo = useCallback(
    (i: number, atEnd = false) => {
      const s = clamp(i, 0, last);
      setStep(s);
      const start = atEnd || reduceMotion() ? steps[s].duration : 0;
      tRef.current = start;
      setT(start);
      setEnded(false);
    },
    [last, steps],
  );

  // The clock: runs only while this reel is in view, not paused and not done.
  useEffect(() => {
    if (!active || paused || ended) return;
    let raf = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      if (!document.hidden) {
        const nt = Math.min(tRef.current + dt, cur.duration + 0.0001);
        if (nt !== tRef.current) {
          tRef.current = nt;
          setT(nt);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, paused, ended, cur.duration]);

  // Steps that don't hold flow straight on.
  useEffect(() => {
    if (done && cur.hold === false && !needsAnswer && step < last) goTo(step + 1);
  }, [done, cur.hold, needsAnswer, step, last, goTo]);

  useEffect(() => {
    saveProgress(meta.id, { step, steps: steps.length, done: ended });
  }, [meta.id, step, steps.length, ended]);

  useEffect(() => {
    if (reduceMotion()) {
      tRef.current = steps[step].duration;
      setT(tRef.current);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const forward = useCallback(() => {
    if (ended) return;
    if (tRef.current < cur.duration) {
      // First tap completes the animation; the next one moves on.
      tRef.current = cur.duration;
      setT(cur.duration);
      return;
    }
    if (needsAnswer) {
      setNudge((n) => n + 1);
      return;
    }
    if (step < last) goTo(step + 1);
    else setEnded(true);
  }, [ended, cur.duration, needsAnswer, step, last, goTo]);

  const back = useCallback(() => {
    if (ended) return setEnded(false);
    if (step > 0) goTo(step - 1, true);
    else goTo(0);
  }, [ended, step, goTo]);

  // Keyboard, for the reel in view.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select, [role="dialog"]')) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (el.closest('button, a') && e.key !== 'ArrowRight') return;
        e.preventDefault();
        forward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      } else if (e.key === 'p' || e.key === 'k') {
        setPaused((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, forward, back]);

  // Tap the left third to go back, anywhere else to go on; hold to pause.
  const press = useRef<{ x: number; timer: number; held: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, [data-interactive]')) return;
    const held = { x: e.clientX, timer: 0, held: false };
    held.timer = window.setTimeout(() => {
      held.held = true;
      setPaused(true);
    }, 280);
    press.current = held;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    clearTimeout(p.timer);
    if (p.held) return setPaused(false);
    if (Math.abs(e.clientX - p.x) > 30) return;
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX - box.left < box.width * 0.3) back();
    else forward();
  };
  const onPointerCancel = () => {
    if (press.current) clearTimeout(press.current.timer);
    if (press.current?.held) setPaused(false);
    press.current = null;
  };

  const share = async () => {
    const url = new URL(window.location.href);
    url.search = step > 0 ? `?step=${step + 1}` : '';
    url.hash = '';
    try {
      await navigator.clipboard.writeText(url.toString());
      onToast(step > 0 ? `Link to step ${step + 1} copied` : 'Link copied');
    } catch {
      onToast(url.toString());
    }
  };

  const Visual = cur.Visual;
  const p = cur.duration > 0 ? clamp(t / cur.duration) : 1;

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-hidden" aria-roledescription="reel">
      <div
        className="relative flex min-h-0 flex-1 cursor-pointer flex-col landscape:grid landscape:grid-cols-[minmax(300px,0.8fr)_1.45fr]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      >
        {/* Visual */}
        <div className="relative min-h-[38%] flex-1 landscape:order-2 landscape:min-h-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={step}
              className="absolute inset-0 px-2 pt-16 landscape:py-20 landscape:pl-6 landscape:pr-24"
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Visual t={t} p={p} portrait={portrait} answer={answer} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div className="no-scrollbar relative z-10 flex max-h-[62%] shrink-0 flex-col overflow-y-auto px-5 pb-3 pr-16 landscape:order-1 landscape:max-h-none landscape:justify-center landscape:py-24 landscape:pl-[max(2rem,5vw)] landscape:pr-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow text-[0.62rem] text-caramel">
                {step + 1}/{steps.length} · §{meta.chapter.section}
                <span className="max-sm:hidden"> · {meta.title}</span>
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.45rem,3.2vw,2.6rem)] font-bold leading-[1.05] text-crema [text-wrap:balance]">
                {cur.title}
              </h2>
              <Caption key={step} portrait={portrait && !cur.predict}>
                {cur.body}
              </Caption>
              {cur.predict && (
                <motion.div
                  key={nudge}
                  animate={nudge ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="mt-3 grid grid-cols-2 gap-2"
                >
                  {cur.predict.options.map((o, i) => {
                    const picked = answer === i;
                    const show = answer !== null;
                    const tone = !show
                      ? 'border-crema/20 bg-crema/5 text-crema hover:border-caramel hover:bg-caramel/10'
                      : o.correct
                        ? 'border-caramel bg-caramel text-espresso'
                        : picked
                          ? 'border-cherry bg-cherry/30 text-crema'
                          : 'border-crema/10 text-latte/60';
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={show}
                        onClick={() => setAnswers((a) => ({ ...a, [step]: i }))}
                        className={`rounded-xl border px-3 py-2 text-left text-[0.82rem] font-medium leading-snug transition sm:px-4 sm:py-2.5 sm:text-sm ${tone}`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
              {cur.predict && answer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="reel-body mt-3 rounded-xl border border-caramel/30 bg-caramel/10 p-3 text-[0.86rem] leading-relaxed text-crema sm:p-4 sm:text-[0.95rem]"
                >
                  <p className="eyebrow mb-1 text-[0.6rem] text-caramel">
                    {cur.predict.options[answer].correct ? 'Right' : 'Not quite'}
                  </p>
                  {cur.predict.explain}
                </motion.div>
              )}
              <NextHint visible={done && !needsAnswer && !ended} paused={paused} predict={needsAnswer && done} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Side rail */}
      <div className="absolute bottom-16 right-2.5 z-20 flex flex-col items-center gap-4 landscape:bottom-auto landscape:right-4 landscape:top-1/2 landscape:-translate-y-1/2">
        <RailButton label="Deep dive" onClick={() => onOpenSheet()} icon={<IconLayers />} />
        <RailButton label="Sources" onClick={() => onOpenSheet('sources')} icon={<IconBook />} />
        <RailButton label="Share" onClick={share} icon={<IconSend />} />
      </div>

      {/* Segmented progress */}
      <div className="relative z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 sm:px-5">
        <div className="flex items-center gap-1" role="group" aria-label="Steps">
          {steps.map((s, i) => {
            const fill = i < step || ended ? 1 : i === step ? p : 0;
            return (
              <button
                key={i}
                type="button"
                className="group flex-1 py-2"
                aria-label={`Step ${i + 1}: ${s.title}`}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => goTo(i, i < step)}
              >
                <span className="block h-[3px] overflow-hidden rounded-full bg-crema/15 transition group-hover:bg-crema/30">
                  <span className="block h-full rounded-full bg-caramel" style={{ width: `${fill * 100}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {paused && !ended && (
        <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-espresso/70 text-crema backdrop-blur">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.5" /><rect x="14" y="4" width="5" height="16" rx="1.5" /></svg>
          </span>
        </div>
      )}

      <AnimatePresence>
        {ended && (
          <EndCard
            meta={meta}
            next={next}
            onReplay={() => goTo(0)}
            onBack={() => setEnded(false)}
            onPlayNext={onPlayNext}
            onOpenTree={onOpenTree}
            onOpenSheet={() => onOpenSheet()}
            active={active}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** On phones a long caption shows three lines and a "more", like an Instagram caption. */
function Caption({ portrait, children }: { portrait: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const clamp = portrait && !open;
  return (
    <div className="reel-body mt-2 max-w-[38rem] text-[0.92rem] leading-relaxed text-latte sm:text-[1.05rem] landscape:mt-3">
      <div className={clamp ? 'line-clamp-3' : ''}>{children}</div>
      {portrait && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-caramel"
        >
          {open ? 'less' : 'more'}
        </button>
      )}
    </div>
  );
}

function NextHint({ visible, paused, predict }: { visible: boolean; paused: boolean; predict: boolean }) {
  return (
    <div className="mt-3 h-5 landscape:mt-5 landscape:h-6">
      <AnimatePresence>
        {(visible || predict) && !paused && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-latte/80"
          >
            {predict ? (
              'Pick an answer to continue'
            ) : (
              <>
                <span className="next-pulse inline-block h-1.5 w-1.5 rounded-full bg-caramel" />
                Tap to continue
                <span className="hidden landscape:inline text-latte/50">· → or space</span>
              </>
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function EndCard({
  meta,
  next,
  onReplay,
  onBack,
  onPlayNext,
  onOpenTree,
  onOpenSheet,
  active,
}: {
  meta: TopicMeta;
  next: Next;
  onReplay: () => void;
  onBack: () => void;
  onPlayNext: () => void;
  onOpenTree: () => void;
  onOpenSheet: () => void;
  active: boolean;
}) {
  const [left, setLeft] = useState(3);
  const [cancelled, setCancelled] = useState(false);
  const auto = !!next?.live && !cancelled && active;
  useEffect(() => {
    if (!auto) return;
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const l = Math.max(0, 3 + 1.4 - (now - start) / 1000);
      setLeft(l);
      if (l <= 0) onPlayNext();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [auto, onPlayNext]);

  return (
    <motion.div
      className="absolute inset-0 z-40 grid place-items-center overflow-y-auto bg-espresso/92 px-5 py-20 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Brewed />
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="eyebrow mt-4 text-caramel">
          Topic complete
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-2 font-display text-3xl font-bold text-crema [text-wrap:balance]"
        >
          {meta.title}, brewed.
        </motion.h3>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 160, damping: 20 }}
          className="mt-8 w-full rounded-2xl border border-crema/12 bg-roast p-5 text-left"
        >
          <p className="eyebrow text-[0.6rem] text-latte">{next?.live ? 'Up next' : next ? 'Next reel · in production' : 'That was the last reel'}</p>
          {next && <p className="mt-1.5 font-display text-xl font-semibold text-crema">{next.title}</p>}
          {next?.live ? (
            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={onPlayNext} className="relative inline-flex items-center gap-2 rounded-full bg-caramel px-5 py-2.5 font-semibold text-espresso">
                {!cancelled && (
                  <svg className="-ml-1" width="20" height="20" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(23,16,12,.25)" strokeWidth="2.5" />
                    <circle cx="10" cy="10" r="8" fill="none" stroke="#17100c" strokeWidth="2.5" strokeDasharray={50.3} strokeDashoffset={50.3 * (Math.min(left, 3) / 3)} transform="rotate(-90 10 10)" />
                  </svg>
                )}
                Play now
              </button>
              {!cancelled && (
                <button type="button" onClick={() => setCancelled(true)} className="text-sm text-latte underline-offset-4 hover:underline">
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-latte">
              {next ? 'It goes live as soon as it is finished and verified. Meanwhile, go deeper into this one.' : 'More reels are on the way.'}
            </p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onOpenSheet} className="rounded-full border border-crema/20 px-4 py-2 text-sm text-crema hover:border-caramel">
            Deep dive
          </button>
          <button type="button" onClick={onReplay} className="rounded-full border border-crema/20 px-4 py-2 text-sm text-crema hover:border-caramel">
            Replay
          </button>
          <button type="button" onClick={onOpenTree} className="rounded-full border border-crema/20 px-4 py-2 text-sm text-crema hover:border-caramel">
            Curriculum
          </button>
          <button type="button" onClick={onBack} className="rounded-full px-4 py-2 text-sm text-latte hover:text-crema">
            ← Last step
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function RailButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-1 text-crema" aria-label={label}>
      <span className="grid h-11 w-11 place-items-center rounded-full border border-crema/10 bg-espresso/60 backdrop-blur transition group-hover:border-caramel group-hover:text-caramel group-active:scale-90">
        {icon}
      </span>
      <span className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-latte">{label}</span>
    </button>
  );
}

const svg = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const IconLayers = () => (
  <svg {...svg}>
    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);
const IconBook = () => (
  <svg {...svg}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
  </svg>
);
const IconSend = () => (
  <svg {...svg}>
    <path d="M21 3 10 14" />
    <path d="m21 3-7 18-4-7-7-4 18-7Z" />
  </svg>
);
