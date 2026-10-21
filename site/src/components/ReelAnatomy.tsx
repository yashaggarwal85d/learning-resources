import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';

/**
 * How every topic teaches: the ten layers of a reel, played as a reel.
 * A segmented progress bar (one segment per layer) fills as it plays;
 * tapping a segment jumps there.
 */
const LAYERS = [
  { name: 'The problem', text: 'A hard, real situation the topic resolves, and what you will be able to do afterwards.' },
  { name: 'Predict first', text: 'Commit to an answer before the reveal. Being wrong first makes the explanation stick.' },
  { name: 'The mechanism', text: 'How it actually works, animated and interactive, one step at a time, at your pace.' },
  { name: 'Trade-offs & numbers', text: 'The alternatives, what each costs, where each breaks, and the numbers that matter.' },
  { name: 'Into the internals', text: 'The paper, the design doc, the exact source code. Formal precision where it matters.' },
  { name: 'Build, break, measure', text: 'A lab in your browser: build it, inject failures, measure what happens.' },
  { name: 'In production', text: 'How it fails in the real world: incidents, post-mortems, the misconceptions experts still hold.' },
  { name: 'The frontier', text: 'What is still unsolved, and where the field is heading.' },
  { name: 'Prove it', text: 'Predict the outcome, debug this, estimate the cost, defend the design.' },
  { name: 'Sources', text: 'Every claim traceable to a primary source, with the date it was last verified.' },
];
const STEP = 2600;

export default function ReelAnatomy() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { amount: 0.4 });
  const [i, setI] = useState(0);
  const [p, setP] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    let start = performance.now() - p * STEP;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const u = (now - start) / STEP;
      if (u >= 1) {
        start = now;
        setI((x) => (x + 1) % LAYERS.length);
        setP(0);
      } else setP(u);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, i]);

  const L = LAYERS[i];
  return (
    <div ref={box} className="relative mx-auto max-w-3xl overflow-hidden rounded-lg border border-line bg-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,.5)] sm:p-9">
      <div className="flex gap-1.5" role="tablist" aria-label="Layers of a reel">
        {LAYERS.map((l, k) => (
          <button
            key={l.name}
            role="tab"
            aria-selected={k === i}
            aria-label={l.name}
            onClick={() => {
              setI(k);
              setP(0);
            }}
            className="group relative h-6 flex-1"
          >
            <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-crema/15 transition-[height] group-hover:h-[5px]">
              <span
                className="block h-full rounded-full bg-caramel"
                style={{ width: `${k < i ? 100 : k === i ? (reduce ? 100 : p * 100) : 0}%` }}
              />
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 grid min-h-[200px] items-center gap-8 sm:grid-cols-[1fr_auto]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow text-latte">
              Layer {String(i + 1).padStart(2, '0')} / {LAYERS.length}
            </p>
            <h3 className="mt-3 font-display text-4xl font-[350] leading-none text-chalk sm:text-5xl">{L.name}</h3>
            <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-latte">{L.text}</p>
          </motion.div>
        </AnimatePresence>
        <motion.div
          key={`dial-${i}`}
          initial={{ scale: 0.6, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="hidden h-40 w-40 place-items-center rounded-full border border-crema/15 sm:grid"
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(237,237,237,.1)" strokeWidth="5" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${(i + (reduce ? 1 : p)) / LAYERS.length} 1`}
            />
          </svg>
          <span className="absolute font-display text-5xl font-[300] text-chalk">{i + 1}</span>
        </motion.div>
      </div>
      <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-taupe">
        A reel waits for you at every step · no time limit · tap to go on, hold to pause
      </p>
    </div>
  );
}
