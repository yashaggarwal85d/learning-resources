import type { Tab } from './NotesPanel';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'motion/react';
import type { Reel } from './types';
import type { TopicMeta } from '../topics/registry';
import { saveProgress } from './progress';
import { clamp } from './anim';
import { Debrief } from './Debrief';
import { decodeText } from './kit';
import { useNarration, type Clip } from './narration';

type Next = { title: string; live: boolean } | null;

type Props = {
  meta: TopicMeta;
  reel: Reel;
  active: boolean; // in view: plays and takes the keyboard
  startStep: number;
  next: Next;
  onPlayNext: () => void;
  onOpenSheet: (tab?: Tab, section?: string) => void;
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
/** The house entrance curve (DESIGN.md → Motion): fast out, long settle, no overshoot. */
const EASE = [0.16, 1, 0.3, 1] as const;
const DOMAIN_CODE: Record<string, string> = { 'data-engineering': 'DE', 'data-structures-and-algorithms': 'DSA', 'rust-systems-engineering': 'RUST' };
const nn = (n: number) => String(n).padStart(2, '0');

export default function ReelPlayer({ meta, reel, active, startStep, next, onPlayNext, onOpenSheet, onOpenTree, onToast }: Props) {
  const steps = reel.steps;
  const last = steps.length - 1;
  const [step, setStep] = useState(() => clamp(startStep, 0, last));
  const [t, setT] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [nudge, setNudge] = useState(0); // shakes the options when "next" is pressed unanswered
  // The shake runs on controls, not on a changing key: remounting the options under a finger that is still down made the
  // browser drop the next touch (the swipe that triggers a nudge ends on the very element that is replaced).
  const shake = useAnimationControls();
  useEffect(() => {
    if (nudge) shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
  }, [nudge, shake]);
  const portrait = usePortrait();
  const tRef = useRef(0);
  const cur = steps[step];
  const answer = answers[step] ?? null;
  const needsAnswer = !!cur.predict && answer === null;
  const done = t >= cur.duration;

  // Narration: one clip per step (01, 02, …) and one per predict answer (02a, …).
  const narr = useNarration(meta.id);
  const stepClip = String(step + 1).padStart(2, '0');
  const wantClip = answer !== null && narr.has(`${stepClip}a`) ? `${stepClip}a` : stepClip;
  const narrRef = useRef(narr);
  narrRef.current = narr;
  useEffect(() => {
    const n = narrRef.current;
    if (!n.on || !active || ended || paused) n.pause();
    else n.play(wantClip);
  }, [narr.on, narr.available, active, ended, paused, wantClip]);

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

  const forward = useCallback((skipAnimation = false) => {
    if (ended) return;
    if (tRef.current < cur.duration && !(skipAnimation && !needsAnswer)) {
      // First tap completes the animation; the next one moves on.
      tRef.current = cur.duration;
      setT(cur.duration);
      return;
    }
    if (needsAnswer) {
      tRef.current = cur.duration;
      setT(cur.duration);
      setNudge((n) => n + 1);
      return;
    }
    if (step < last) goTo(step + 1);
    else setEnded(true);
  }, [ended, cur.duration, needsAnswer, step, last, goTo]);

  // Visible controls: replay the current step's animation, or the whole reel.
  const replayStep = useCallback(() => {
    setPaused(false);
    tRef.current = 0;
    setT(0);
    setEnded(false);
    if (narrRef.current.on) narrRef.current.play(wantClip, true);
  }, [wantClip]);
  const restartReel = useCallback(() => {
    setPaused(false);
    setAnswers({});
    goTo(0);
    if (narrRef.current.on) narrRef.current.play('01', true);
  }, [goTo]);

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
      } else if (e.key === 'm' || e.key === 'M') {
        narrRef.current.toggle();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (e.shiftKey) restartReel();
        else replayStep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, forward, back, replayStep, restartReel]);

  // Tap the left third to go back, anywhere else to go on; hold to pause.
  // Swipe left for the next step, right for the previous one (vertical swipes scroll the feed).
  const press = useRef<{ x: number; y: number; timer: number; held: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, [data-interactive]')) return;
    ignoreClick.current = false;
    const held = { x: e.clientX, y: e.clientY, timer: 0, held: false };
    held.timer = window.setTimeout(() => {
      held.held = true;
      setPaused(true);
    }, 280);
    press.current = held;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    // A finger that moves is swiping, not holding.
    if (p && !p.held && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 10) clearTimeout(p.timer);
  };
  const swipe = useCallback(
    (dir: 1 | -1) => {
      if (dir < 0) return back();
      if (ended) return;
      if (needsAnswer) {
        tRef.current = cur.duration;
        setT(cur.duration);
        setNudge((n) => n + 1);
        return;
      }
      if (step < last) goTo(step + 1);
      else setEnded(true);
    },
    [back, ended, needsAnswer, cur.duration, step, last, goTo],
  );
  // A tap is handled from the browser's `click`, not from pointerup: on a real phone a finger that drifts a few pixels
  // makes the browser cancel the pointer (it may be a scroll), which silently dropped taps; a click is sent for every tap.
  const ignoreClick = useRef(false);
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    clearTimeout(p.timer);
    if (p.held) {
      ignoreClick.current = true;
      return setPaused(false);
    }
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > 1.4 * Math.abs(dy)) {
      ignoreClick.current = true;
      return swipe(dx < 0 ? 1 : -1);
    }
  };
  const onClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, [data-interactive]')) return;
    if (ignoreClick.current) {
      ignoreClick.current = false;
      return;
    }
    // Left third goes back, anywhere else goes on, like Instagram stories; a tap always moves on, even mid-animation.
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX - box.left < box.width * 0.3) back();
    else forward(true);
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

  // Keep the current step in view in the step index (long reels scroll it); scrolls the list only, never the feed.
  const indexList = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const ol = indexList.current;
    const li = ol?.children[step] as HTMLElement | undefined;
    if (!ol || !li || !ol.offsetParent) return;
    const target = li.offsetTop - ol.offsetTop - ol.clientHeight / 2 + li.offsetHeight / 2;
    ol.scrollTo({ top: Math.max(0, target), behavior: reduceMotion() ? 'auto' : 'smooth' });
  }, [step]);

  const Visual = cur.Visual;
  const p = cur.duration > 0 ? clamp(t / cur.duration) : 1;
  const code = DOMAIN_CODE[meta.domain] ?? meta.domain.toUpperCase();
  const eyebrow = `${code} §${meta.chapter.section}${meta.kind === 'refresher' ? ' · Refresher' : ''} · ${nn(step + 1)}/${nn(steps.length)}`;

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-hidden" aria-roledescription="reel">
      <div
        className="reel-stage relative flex min-h-0 flex-1 cursor-pointer flex-col landscape:grid landscape:grid-cols-[minmax(300px,0.8fr)_1.45fr] xl:landscape:grid-cols-[12.5rem_minmax(300px,0.8fr)_1.45fr]"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
      >
        {/* Step index: wide screens only */}
        <nav aria-label="Reel steps" className="relative z-10 hidden min-h-0 flex-col justify-center py-24 pl-7 xl:landscape:flex">
          <p className="eyebrow mb-3 text-[0.56rem] leading-relaxed text-taupe">{meta.title}</p>
          <ol ref={indexList} className="no-scrollbar min-h-0 overflow-y-auto [mask-image:linear-gradient(to_bottom,black_88%,transparent)]">
            {steps.map((s, i) => (
              <li key={i} className="relative">
                {i === step && <motion.span layoutId={`index-${meta.id}`} className="absolute inset-y-1 -left-3 w-px bg-caramel" transition={{ duration: 0.5, ease: EASE }} />}
                <button
                  type="button"
                  onClick={() => goTo(i, i < step)}
                  aria-label={`Go to step ${i + 1}: ${s.title}`}
                  className={`grid w-full grid-cols-[1.7rem_1fr] gap-1 py-[0.4rem] pr-3 text-left text-[0.74rem] leading-snug transition-colors duration-300 ${i === step ? 'text-chalk' : i < step ? 'text-latte hover:text-chalk' : 'text-taupe hover:text-crema'}`}
                >
                  <span className="pt-px font-mono text-[0.6rem] tabular-nums">{nn(i + 1)}</span>
                  <span className="line-clamp-2">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Visual, in its frame */}
        <div className="relative min-h-[38%] flex-1 landscape:order-2 landscape:min-h-0 xl:landscape:order-3">
          <Frame step={step} fig={cur.fig} t={t} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={step}
              data-visual
              className="absolute inset-0 overflow-hidden px-2 pt-16 landscape:py-20 landscape:pl-6 landscape:pr-24"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <Visual t={t} p={p} portrait={portrait} answer={answer} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div className="no-scrollbar relative z-10 flex max-h-[62%] shrink-0 flex-col overflow-y-auto px-5 pb-3 pr-16 landscape:order-1 landscape:max-h-none landscape:justify-center landscape:py-24 landscape:pl-[max(2rem,5vw)] landscape:pr-4 xl:landscape:order-2 xl:landscape:pl-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
              {step === 0 && (
                <div className="mb-3 max-w-[34rem] border-l border-mocha pl-3 landscape:mb-4">
                  <p className="eyebrow text-[0.56rem] text-taupe portrait:hidden">From the last topic</p>
                  <p className="font-display text-[0.88rem] italic leading-snug text-crema landscape:mt-1 landscape:text-[0.98rem]">{meta.bridge}</p>
                </div>
              )}
              <p className="eyebrow text-[0.6rem] text-latte">
                <DecodeText text={eyebrow} />
                <span className="text-taupe max-sm:hidden xl:landscape:hidden"> · {meta.title}</span>
              </p>
              {/* The mask's padding keeps descenders visible; the negative margin gives the height back (phones need it for the drawing). */}
              <div className="-mb-1 mt-2 overflow-hidden pb-1">
                <motion.h2
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.06 }}
                  className="font-display text-[clamp(1.45rem,3.1vw,2.7rem)] font-[350] leading-[1.05] tracking-[-0.012em] text-chalk [text-wrap:balance]"
                >
                  {cur.title}
                </motion.h2>
              </div>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE, delay: 0.18 }} className="mt-2 h-px max-w-[38rem] origin-left bg-line portrait:hidden" />
              {/* The caption's key carries the step, and nothing else shares it: an options key that counted nudges once
                  collided with it and left an orphan copy of the text behind on every nudge (QUALITY.md #48). */}
              <Caption key={`caption-${step}`} portrait={portrait && !cur.predict}>
                {cur.body}
              </Caption>
              {cur.predict && (
                <motion.div animate={shake} className="mt-3 grid grid-cols-2 gap-2 landscape:mt-4">
                  {cur.predict.options.map((o, i) => {
                    const picked = answer === i;
                    const show = answer !== null;
                    const tone = !show
                      ? 'border-crema/15 bg-crema/[0.03] text-chalk hover:border-crema/50 hover:bg-crema/[0.07]'
                      : o.correct
                        ? 'border-caramel bg-caramel text-espresso'
                        : picked
                          ? 'border-cherry bg-cherry/25 text-chalk'
                          : 'border-crema/8 text-latte/50';
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={show}
                        onClick={() => setAnswers((a) => ({ ...a, [step]: i }))}
                        className={`flex items-start gap-2.5 rounded-md border px-3 py-2 text-left text-[0.82rem] font-medium leading-snug transition duration-300 sm:py-2.5 sm:text-sm ${tone}`}
                      >
                        {/* The letter is for wide screens; on a phone the two columns are too narrow to spare its width. */}
                        <span className="mt-px font-mono text-[0.66rem] opacity-60 portrait:hidden">{'ABCDEF'[i]}</span>
                        <span>{o.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
              {cur.predict && answer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="reel-body mt-3 rounded-md border border-crema/15 bg-crema/[0.04] p-3 text-[0.86rem] leading-relaxed text-crema sm:p-4 sm:text-[0.95rem]"
                >
                  <p className={`eyebrow mb-1 text-[0.58rem] ${cur.predict.options[answer].correct ? 'text-chalk' : 'text-signal'}`}>
                    {cur.predict.options[answer].correct ? 'Correct' : 'Not quite'}
                  </p>
                  {cur.predict.explain}
                </motion.div>
              )}
              {cur.takeaway && done && !needsAnswer && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-4 max-w-[38rem] border-t border-line pt-3">
                  <p className="eyebrow text-[0.56rem] text-taupe">Takeaway</p>
                  <p className="mt-1 font-display text-[1.06rem] italic leading-snug text-chalk">{cur.takeaway}</p>
                </motion.div>
              )}
              {step === 0 && (
                <button
                  type="button"
                  onClick={() => onOpenSheet('pre')}
                  className="mt-3 inline-flex items-center gap-2 rounded-md border border-crema/15 px-3 py-1.5 text-left font-mono text-[0.64rem] uppercase tracking-[0.14em] text-latte portrait:tracking-[0.05em] landscape:mt-4 transition hover:border-crema/45 hover:text-chalk"
                >
                  <IconSteps size={14} />
                  New to this? Read the pre-notes first
                </button>
              )}
              <NextHint visible={done && !needsAnswer && !ended} paused={paused} predict={needsAnswer && done} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Side rail */}
      <div className="absolute bottom-16 right-2.5 z-20 flex flex-col items-center gap-2 landscape:gap-3.5 landscape:bottom-auto landscape:right-4 landscape:top-1/2 landscape:-translate-y-1/2">
        <RailButton label="Prereqs" title="Prerequisites" onClick={() => onOpenSheet('prereq')} icon={<IconSteps />} />
        <RailButton label="Pre-notes" onClick={() => onOpenSheet('pre')} icon={<IconBook />} />
        <RailButton label="Post-notes" onClick={() => onOpenSheet('post')} icon={<IconLayers />} />
        <RailButton label="Sources" onClick={() => onOpenSheet('sources')} icon={<IconBook />} />
        <RailButton label="Share" onClick={share} icon={<IconSend />} />
      </div>

      {narr.on && narr.clip && narr.clipId === wantClip && <Captions clip={narr.clip} time={narr.time} playing={narr.playing} />}

      {/* Playback controls and segmented progress */}
      <div className="relative z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 sm:px-5">
        <div className="flex items-center gap-1.5" role="group" aria-label="Playback">
          <ControlButton label={paused ? 'Play (P)' : 'Pause (P)'} onClick={() => setPaused((v) => !v)} primary>
            {paused ? (
              <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
            ) : (
              <>
                <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
                <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
              </>
            )}
          </ControlButton>
          <ControlButton label="Replay this step (R)" onClick={replayStep}>
            <path d="M4 12a8 8 0 1 0 2.6-5.9" />
            <path d="M4 4v4.5h4.5" />
          </ControlButton>
          <ControlButton label="Restart the reel (Shift+R)" onClick={restartReel}>
            <path d="M6 5v14" />
            <path d="M19 5.5v13L9 12z" fill="currentColor" stroke="none" />
          </ControlButton>
          {narr.available && (
            <ControlButton label={narr.on ? 'Turn narration off (M)' : 'Turn narration on (M)'} onClick={narr.toggle} primary={narr.on}>
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none" />
              {narr.on ? (
                <>
                  <path d="M15.5 9a4.5 4.5 0 0 1 0 6" />
                  <path d="M18 6.5a8 8 0 0 1 0 11" />
                </>
              ) : (
                <path d="m16 9.5 5 5m0-5-5 5" />
              )}
            </ControlButton>
          )}
          {narr.available && !narr.on && (
            <button type="button" onClick={narr.toggle} className="hidden rounded-full border border-crema/25 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-crema transition hover:border-crema/60 hover:text-chalk sm:inline-block">
              Turn on narration
            </button>
          )}
          <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-latte" aria-live="polite">
            {paused ? 'Paused' : ''}
          </span>
          <span className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.16em] text-taupe tabular-nums max-sm:hidden" aria-hidden="true">
            Step {nn(step + 1)} / {nn(steps.length)}
          </span>
        </div>
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
                data-predict={s.predict ? '' : undefined}
                onClick={() => goTo(i, i < step)}
              >
                <span className={`block h-[2px] overflow-hidden rounded-full transition-colors duration-300 ${s.predict ? 'bg-crema/25 group-hover:bg-crema/45' : 'bg-crema/12 group-hover:bg-crema/30'}`}>
                  <span className="block h-full rounded-full bg-caramel" style={{ width: `${fill * 100}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {ended && (
          <EndCard
            meta={meta}
            steps={steps.length}
            takeaways={steps.flatMap((s) => (s.takeaway ? [s.takeaway] : []))}
            next={next}
            onReplay={() => goTo(0)}
            onBack={() => setEnded(false)}
            onPlayNext={onPlayNext}
            onOpenTree={onOpenTree}
            onOpenSheet={() => onOpenSheet('post')}
            active={active}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** A short mono label that resolves left to right when it changes (DESIGN.md → Motion, "Decode"). */
function DecodeText({ text }: { text: string }) {
  const [k, setK] = useState(() => (reduceMotion() ? 1 : 0));
  useEffect(() => {
    if (reduceMotion()) return setK(1);
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const v = clamp((now - start) / 650);
      setK(v);
      if (v < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{decodeText(text, k)}</span>
    </>
  );
}

/** The figure's frame: corner ticks, a scan line as the step arrives, and on wide screens the figure's name and clock. */
function Frame({ step, fig, t }: { step: number; fig?: string; t: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-1 bottom-0 top-14 landscape:inset-x-auto landscape:bottom-14 landscape:left-3 landscape:right-[5.25rem] landscape:top-16">
      <motion.div key={`ticks-${step}`} className="ticks absolute inset-0" initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE }} />
      <div key={`scan-${step}`} className="scan absolute inset-0 border-t border-crema/35" />
      <div className="absolute inset-x-6 top-0 hidden -translate-y-1/2 items-center justify-between gap-4 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-taupe landscape:flex">
        <span className="truncate">
          Fig {nn(step + 1)}
          {fig ? ` · ${fig}` : ''}
        </span>
        <span className="shrink-0 tabular-nums">T+{t.toFixed(1).padStart(4, '0')}s</span>
      </div>
    </div>
  );
}

/** On phones a long caption shows three lines and a "more", like an Instagram caption. */
function Caption({ portrait, children }: { portrait: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const clamp = portrait && !open;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
      className="reel-body mt-2 max-w-[38rem] text-[0.92rem] leading-[1.6] text-crema sm:text-[1.03rem] landscape:mt-3 landscape:leading-[1.65]"
    >
      <div className={clamp ? 'line-clamp-3' : ''}>{children}</div>
      {portrait && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-chalk">
          {open ? 'less' : 'more'}
        </button>
      )}
    </motion.div>
  );
}

function NextHint({ visible, paused, predict }: { visible: boolean; paused: boolean; predict: boolean }) {
  return (
    <div className="mt-3 h-5 landscape:mt-5 landscape:h-6">
      <AnimatePresence>
        {(visible || predict) && !paused && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.2em] text-latte">
            {predict ? (
              'Pick an answer to continue'
            ) : (
              <>
                <span className="next-pulse inline-block h-1.5 w-1.5 rounded-full bg-caramel" />
                Tap to continue
                <span className="hidden landscape:inline text-taupe">· → or space</span>
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
  steps,
  takeaways,
  next,
  onReplay,
  onBack,
  onPlayNext,
  onOpenTree,
  onOpenSheet,
  active,
}: {
  meta: TopicMeta;
  steps: number;
  takeaways: string[];
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
      const l = Math.max(0, 3 + 1.6 - (now - start) / 1000);
      setLeft(l);
      if (l <= 0) onPlayNext();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [auto, onPlayNext]);
  const after = 0.25 + steps * 0.05;
  const rise = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: after + d, duration: 0.7, ease: EASE } });
  const ghost = 'rounded-full border border-crema/20 px-4 py-2 text-sm text-crema transition hover:border-crema/60 hover:text-chalk';

  return (
    <motion.div className="absolute inset-0 z-40 grid place-items-center overflow-y-auto bg-espresso/96 px-5 py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Debrief steps={steps} />
        <motion.p {...rise(0.3)} className="eyebrow mt-5 text-[0.62rem] text-latte">
          Debrief · {steps} of {steps} steps
        </motion.p>
        <motion.h3 {...rise(0.4)} className="mt-2 font-display text-[1.9rem] font-[350] leading-tight text-chalk [text-wrap:balance]">
          {meta.title}
        </motion.h3>
        {takeaways.length > 0 && (
          <motion.ul {...rise(0.5)} className="mt-5 w-full space-y-2 border-t border-line pt-4 text-left">
            {takeaways.map((k, i) => (
              <li key={i} className="grid grid-cols-[1.6rem_1fr] text-[0.88rem] leading-snug text-crema">
                <span className="pt-px font-mono text-[0.62rem] text-taupe">{nn(i + 1)}</span>
                <span className="font-display italic">{k}</span>
              </li>
            ))}
          </motion.ul>
        )}

        <motion.div {...rise(0.6)} className="mt-7 w-full rounded-md border border-line bg-panel p-5 text-left">
          <p className="eyebrow text-[0.58rem] text-taupe">{next?.live ? 'Up next' : next ? 'Next reel · in production' : 'That was the last reel'}</p>
          {next && <p className="mt-1.5 font-display text-xl text-chalk">{next.title}</p>}
          <p className="mt-1.5 text-sm leading-relaxed text-latte">{meta.handoff}</p>
          {next?.live ? (
            <div className="mt-4 flex items-center gap-3">
              <button type="button" onClick={onPlayNext} className="relative inline-flex items-center gap-2 rounded-full bg-caramel px-5 py-2.5 font-semibold text-espresso transition hover:bg-chalk">
                {!cancelled && (
                  <svg className="-ml-1" width="20" height="20" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(11,11,11,.2)" strokeWidth="2.5" />
                    <circle cx="10" cy="10" r="8" fill="none" stroke="#0b0b0b" strokeWidth="2.5" strokeDasharray={50.3} strokeDashoffset={50.3 * (Math.min(left, 3) / 3)} transform="rotate(-90 10 10)" />
                  </svg>
                )}
                Play now
              </button>
              {!cancelled && (
                <button type="button" onClick={() => setCancelled(true)} className="text-sm text-latte underline-offset-4 hover:text-chalk hover:underline">
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

        <motion.div {...rise(0.75)} className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onOpenSheet} className={ghost}>
            Post-notes
          </button>
          <button type="button" onClick={onReplay} className={ghost}>
            Replay
          </button>
          <button type="button" onClick={onOpenTree} className={ghost}>
            Curriculum
          </button>
          <button type="button" onClick={onBack} className="rounded-full px-4 py-2 text-sm text-latte hover:text-chalk">
            ← Last step
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** The narration line being spoken, with words lighting up as they are said. */
function Captions({ clip, time, playing }: { clip: Clip; time: number; playing: boolean }) {
  const line = [...clip.lines].reverse().find((l) => time >= l.start - 0.05) ?? clip.lines[0];
  if (!line || (!playing && time >= clip.duration - 0.1)) return null;
  const words = line.text.split(' ');
  const progress = Math.max(0, Math.min(1, (time - line.start) / Math.max(0.1, line.end - line.start)));
  const lit = Math.ceil(progress * words.length);
  return (
    <div className="reel-captions pointer-events-none relative z-20 px-4 pb-1 text-center" aria-live="off">
      <p lang={line.lang ?? 'en'} className={`mx-auto inline-block max-w-3xl rounded-md border border-crema/10 bg-void/85 px-3 py-1.5 text-[0.92rem] leading-snug sm:text-base ${line.lang === 'de' ? 'font-semibold italic' : ''}`}>
        {words.map((w, i) => (
          <span key={i} className={`transition-colors duration-150 ${i < lit ? (line.lang === 'de' ? 'text-caramel' : 'text-crema') : 'text-latte/50'}`}>
            {w}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

function ControlButton({ label, onClick, primary, children }: { label: string; onClick: () => void; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-full border transition duration-200 active:scale-90 ${primary ? 'border-caramel bg-caramel text-espresso hover:bg-chalk' : 'border-crema/15 bg-espresso/60 text-crema hover:border-crema/50 hover:text-chalk'}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function RailButton({ label, title, icon, onClick }: { label: string; title?: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-1 text-crema" aria-label={title ?? label}>
      <span className="grid h-10 w-10 place-items-center rounded-md border border-crema/12 bg-espresso/70 backdrop-blur transition duration-200 group-hover:border-crema/50 group-hover:text-chalk group-active:scale-90 landscape:h-11 landscape:w-11">
        {icon}
      </span>
      <span className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-latte max-sm:portrait:hidden">{label}</span>
    </button>
  );
}

const svg = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const IconSteps = ({ size = 20 }: { size?: number }) => (
  <svg {...svg} width={size} height={size}>
    <path d="M3 20h5v-5h5v-5h5V5h3" />
    <path d="M3 20V16" />
  </svg>
);
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
