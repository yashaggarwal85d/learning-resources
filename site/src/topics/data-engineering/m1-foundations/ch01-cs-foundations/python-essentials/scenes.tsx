import { useEffect, useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { RefresherList } from '../refreshers';
import { C, MONO, SERIF, Reticle, Draw } from '../../../../../reels/kit';

// Every example shown here is executed and checked by examples.py.

const Stack = ({ children }: { children: ReactNode }) => <div className="flex h-full w-full flex-col justify-center gap-3 landscape:gap-5">{children}</div>;
const Svg = ({ label, h = 260, children }: { label: string; h?: number; children: ReactNode }) => (
  <svg viewBox={`0 0 600 ${h}`} className="min-h-0 w-full flex-1" role="img" aria-label={label}>
    {children}
  </svg>
);
const T = ({
  x,
  y,
  s = 15,
  f = C.latte,
  a = 'start',
  w = 500,
  o = 1,
  serif = false,
  children,
}: {
  x: number;
  y: number;
  s?: number;
  f?: string;
  a?: 'start' | 'middle' | 'end';
  w?: number;
  o?: number;
  serif?: boolean;
  children: ReactNode;
}) => (
  <text
    x={x}
    y={y}
    fontSize={s}
    style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))` }}
    fill={f}
    textAnchor={a}
    fontWeight={w}
    opacity={o}
    fontFamily={serif ? SERIF : MONO}
    letterSpacing={serif ? 0 : '0.03em'}
  >
    {children}
  </text>
);

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const v = (performance.now() - t0) / 1000;
      setS(v);
      if (v < 6) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A small value chip: one item in a list or a slot. */
const Chip = ({ x, y, v, c }: { x: number; y: number; v: string; c: string }) => (
  <g>
    <rect x={x - 13} y={y - 13} width={26} height={26} rx={4} fill={C.panel} stroke={c} strokeWidth={1.3} />
    <T x={x} y={y + 5} s={13} a="middle" f={c}>
      {v}
    </T>
  </g>
);

// 1 · Where we are: the five refreshers that open the chapter.
// The list's rows slide in (../refreshers). A "you are here" marker then runs down the rail past the refreshers
// already done and stops at this one, and brackets lock onto its row.
export const Opening = (c: StepCtx) => {
  const run = easeInOut(seg(c.t, 0.9, 1.5));
  const y = lerp(40, 96, run);
  return (
    <div className="relative h-full w-full">
      <RefresherList {...c} current={0} />
      <svg viewBox="0 0 600 420" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <line x1={14} y1={40} x2={14} y2={360} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(c.t, 0.6, 1.0))} />
        <Draw pts={[[14, 40], [14, 96]]} t={c.t} from={0.9} to={1.5} w={2.5} pen={false} />
        {run > 0 && <circle cx={14} cy={y} r={6} fill={C.focus} />}
        <Reticle x={300} y={96} w={556} h={64} t={c.t} at={1.45} />
      </svg>
    </div>
  );
};

// 2 · Mutable default arguments. The drawing: the function object holds its one default list, made when def runs. After
// the answer, call 1 and call 2 each drop a 1 into that same list; then the fix gives each call a fresh list of its own.
export function MutableDefault({ t, answer, portrait }: StepCtx) {
  const fixed = answer !== null;
  const s = useSinceAnswer(fixed);
  const made = easeOutBack(seg(t, 0.5, 1.0));
  const d1 = fixed ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  const d2 = fixed ? easeInOut(seg(s, 1.0, 1.6)) : 0;
  const fix = fixed ? easeInOut(seg(s, 2.2, 2.9)) : 0;
  const calls = fixed ? 1 - seg(s, 1.9, 2.2) : 1;
  const drop = (k: number, cx: number, from: number) => (k <= 0 ? null : <Chip x={lerp(from, cx, k)} y={lerp(112, 48, k)} v="1" c={C.focus} />);
  return (
    <Stack>
      {!(portrait && fixed) && (
        <Code
          title="defaults.py"
          t={t}
          end={1}
          lines={['def append_one(xs=[]):', '    xs.append(1)', '    return xs', '', 'append_one()   # [1]', `append_one()   # ${fixed ? '[1, 1]  ← the same list' : '?'}`]}
          highlight={fixed ? [0, 5] : [5]}
        />
      )}
      {fixed && (!portrait || s >= 4.5) && (
        <Code title="the fix" t={t + 10} lines={['def append_one(xs=None):', '    if xs is None:', '        xs = []', '    xs.append(1)', '    return xs']} highlight={[0, 1, 2]} />
      )}
      {(!portrait || (fixed && s < 4.5)) && (
        <Svg label="the function object keeps one default list; both calls append to that same list" h={170}>
          <g opacity={easeOut(seg(t, 0, 0.4))}>
            <rect x={25} y={26} width={170} height={44} rx={6} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} />
            <T x={110} y={53} s={13} a="middle" f={C.primary}>
              append_one
            </T>
            <T x={25} y={16} s={13} f={C.quiet}>
              def runs once
            </T>
          </g>
          <g opacity={clamp(made) * (1 - fix)}>
            <line x1={195} y1={48} x2={250} y2={48} stroke={C.secondary} strokeDasharray="3 3" />
            <rect x={250} y={30} width={130} height={36} rx={4} fill="none" stroke={d2 > 0.9 ? C.badText : C.focus} strokeWidth={1.5} />
            <T x={315} y={20} s={13} a="middle" f={C.secondary}>
              the one list
            </T>
            {drop(d1, 285, 440)}
            {drop(d2, 345, 520)}
            <T x={315} y={96} s={13} a="middle" f={C.badText} o={fixed ? easeOut(seg(s, 1.6, 1.9)) : 0}>
              shared by every call
            </T>
          </g>
          {calls > 0 && (
            <g opacity={calls}>
              {['call 1', 'call 2'].map((c, i) => (
                <g key={c} opacity={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))}>
                  <T x={440 + i * 80} y={140} s={13} a="middle" f={C.primary}>
                    {c}
                  </T>
                </g>
              ))}
              {!fixed && (
                <T x={480} y={110} s={14} a="middle" f={C.focus} o={easeOut(seg(t, 0.9, 1.15))}>
                  ?
                </T>
              )}
            </g>
          )}
          {fix > 0 && (
            <g opacity={fix}>
              {[0, 1].map((i) => (
                <g key={i}>
                  <line x1={195} y1={48} x2={lerp(195, 250 + i * 170, fix)} y2={lerp(48, 120, fix)} stroke={C.second} strokeDasharray="3 3" />
                  <rect x={250 + i * 170} y={102} width={110} height={36} rx={4} fill="none" stroke={C.second} strokeWidth={1.5} />
                  <Chip x={285 + i * 170} y={120} v="1" c={C.second} />
                  <T x={305 + i * 170} y={160} s={13} a="middle" f={C.second}>
                    {`call ${i + 1}: new`}
                  </T>
                </g>
              ))}
            </g>
          )}
        </Svg>
      )}
    </Stack>
  );
}

// 2b · Closures look names up when they run. The drawing: one cell named i that the loop rewrites 0, 1, 2; each lambda
// made along the way points at the name, not at a value. After the answer all three read the cell: 2, 2, 2. The fix
// copies the value into each lambda as its own default.
export function LateBinding({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const loop = seg(t, 0.2, 1.1);
  const iv = Math.min(2, Math.floor(loop * 3));
  const fix = shown ? easeInOut(seg(s, 2.2, 2.9)) : 0;
  return (
    <Stack>
      {!(portrait && shown) && (
        <Code
          title="closures.py"
          t={t}
          end={1}
          lines={['fs = [lambda: i for i in range(3)]', `[f() for f in fs]   # ${shown ? '[2, 2, 2]  ← all see the last i' : '?'}`]}
          highlight={shown ? [1] : []}
        />
      )}
      {shown && (!portrait || s >= 4.5) && <Code title="bind the value now" t={t + 10} lines={['fs = [lambda i=i: i for i in range(3)]', '[f() for f in fs]   # [0, 1, 2]']} highlight={[0]} />}
      {(!portrait || (shown && s < 4.5)) && (
        <Svg label="three lambdas all point at the one name i, which ends the loop holding 2" h={170}>
          <g opacity={easeOut(seg(t, 0, 0.4)) * (1 - fix)}>
            <rect x={250} y={14} width={100} height={44} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
            <T x={268} y={42} s={14} f={C.secondary}>
              i =
            </T>
            <T x={318} y={42} s={16} f={C.focus}>
              {`${loop > 0 ? iv : 0}`}
            </T>
          </g>
          {[0, 1, 2].map((k) => {
            const born = easeOutBack(seg(t, 0.2 + k * 0.3, 0.5 + k * 0.3));
            const x = 40 + k * 190;
            const read = shown ? easeOut(seg(s, 0.3 + k * 0.4, 0.6 + k * 0.4)) : 0;
            return (
              <g key={k} opacity={clamp(born)}>
                <line x1={x + 60} y1={100} x2={300} y2={58} stroke={read > 0 && fix < 1 ? C.focus : C.line} strokeDasharray="3 3" opacity={1 - fix} />
                <rect x={x} y={100} width={120} height={36} rx={18} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} />
                <T x={x + 60} y={124} s={13} a="middle" f={C.primary}>
                  {fix > 0.5 ? `λ i=${k}: i` : 'λ: i'}
                </T>
                {read > 0 && (
                  <T x={x + 60} y={160} s={14} a="middle" f={fix > 0.5 ? C.second : C.focus} o={read}>
                    {fix > 0.5 ? `→ ${k}` : '→ 2'}
                  </T>
                )}
              </g>
            );
          })}
          {!shown && (
            <T x={300} y={160} s={14} a="middle" f={C.focus} o={easeOut(seg(t, 0.9, 1.15))}>
              f() → ?
            </T>
          )}
        </Svg>
      )}
    </Stack>
  );
}

// 3 · Comprehensions: filter, then map.
export function Comprehension({ t }: StepCtx) {
  const items = [1, 2, 3, 4, 5];
  return (
    <Stack>
      <Code title="comprehension" t={t} end={0.9} lines={['[x * x for x in xs if x % 2]   # [1, 9, 25]']} />
      <Svg label="Items pass a filter for odd numbers, are squared, and land in a new list">
        <rect x={250} y={40} width={86} height={120} rx={14} fill="none" stroke={C.latte} strokeDasharray="5 6" />
        <T x={293} y={30} s={13} a="middle" f={C.latte}>
          IF x % 2
        </T>
        <rect x={380} y={40} width={86} height={120} rx={14} fill="none" stroke={C.caramel} strokeDasharray="5 6" />
        <T x={423} y={30} s={13} a="middle" f={C.caramel}>
          x * x
        </T>
        <T x={30} y={30} s={13} f={C.taupe}>
          xs
        </T>
        <T x={530} y={30} s={13} f={C.taupe} a="middle">
          result
        </T>
        {items.map((v, i) => {
          const k = t - (1.0 + i * 0.5);
          const odd = v % 2 === 1;
          let x = 50 + i * 36;
          let y = 100;
          let label = String(v);
          let o = 1;
          if (k > 0) {
            const e1 = easeInOut(clamp(k / 0.5));
            x = lerp(50 + i * 36, 293, e1);
            if (!odd) {
              const drop = easeInOut(clamp((k - 0.5) / 0.4));
              y = lerp(100, 220, drop);
              o = 1 - drop;
            } else {
              const e2 = easeInOut(clamp((k - 0.5) / 0.4));
              const e3 = easeInOut(clamp((k - 0.9) / 0.4));
              x = lerp(lerp(x, 423, e2), 530, e3);
              const slot = items.filter((q) => q % 2 === 1).indexOf(v);
              y = lerp(100, 74 + slot * 34, e3);
              if (k > 0.75) label = String(v * v);
            }
          }
          return (
            <g key={v} opacity={o}>
              <circle cx={x} cy={y} r={15} fill={odd ? C.caramel : C.mocha} />
              <T x={x} y={y + 5} s={13} a="middle" f={odd ? C.espresso : C.crema} w={700}>
                {label}
              </T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 4 · Generators stream; lists materialize.
export function Generators({ t }: StepCtx) {
  const e = easeInOut(seg(t, 1.0, 4.0));
  const listMB = 40.4 * e;
  return (
    <Stack>
      <Code title="same answer" t={t} end={0.9} lines={['sum([i * i for i in range(1_000_000)])  # list', 'sum(i * i for i in range(1_000_000))    # generator']} />
      <Svg label="Peak memory: the list version climbs to about 40 MB, the generator stays under 1 KB">
        <T x={30} y={34} s={13} f={C.taupe}>
          PEAK MEMORY (MEASURED, CPYTHON 3.13)
        </T>
        <T x={30} y={84} s={14} f={C.crema} w={600}>
          list
        </T>
        <rect x={130} y={64} width={400} height={30} rx={8} fill={C.cocoa} />
        <rect x={130} y={64} width={400 * e} height={30} rx={8} fill={C.cherry} />
        <T x={540} y={86} s={14} f={C.crema} a="end" w={700}>
          {listMB.toFixed(1)} MB
        </T>
        <T x={30} y={154} s={14} f={C.crema} w={600}>
          generator
        </T>
        <rect x={130} y={134} width={400} height={30} rx={8} fill={C.cocoa} />
        <rect x={130} y={134} width={4} height={30} rx={2} fill={C.caramel} />
        {Array.from({ length: 6 }, (_, i) => {
          const p = ((t * 0.9 + i / 6) % 1) * (t > 1 ? 1 : 0);
          return <circle key={i} cx={140 + p * 380} cy={149} r={5} fill={C.caramel} opacity={Math.sin(Math.PI * p)} />;
        })}
        <T x={540} y={156} s={14} f={C.caramel} a="end" w={700}>
          0.5 KB
        </T>
        <T x={300} y={222} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.6, 4.2))}>
          ONE ITEM AT A TIME: FILES BIGGER THAN RAM STREAM THROUGH
        </T>
      </Svg>
    </Stack>
  );
}

// 5 · yield pauses; next() resumes.
export function YieldBatches({ t }: StepCtx) {
  const batches = ['[0, 1]', '[2, 3]', '[4]'];
  const n = Math.min(3, Math.floor(seg(t, 1.4, 4.4) * 3.999));
  return (
    <Stack>
      <Code
        title="batches.py"
        t={t}
        end={1.2}
        highlight={t > 1.4 ? [5] : []}
        lines={[
          'def read_batches(rows, size):',
          '    batch = []',
          '    for r in rows:',
          '        batch.append(r)',
          '        if len(batch) == size:',
          '            yield batch      # pause here',
          '            batch = []',
          '    if batch:',
          '        yield batch',
        ]}
      />
      <Svg label="Each next() call runs the function to its next yield and hands back one batch" h={110}>
        <T x={30} y={26} s={13} f={C.taupe}>
          list(read_batches(range(5), 2))
        </T>
        {batches.map((b, i) => {
          const a = easeOutBack(seg(t, 1.4 + i * 1.0, 1.9 + i * 1.0));
          return (
            <g key={b} transform={`translate(${40 + i * 150} 46) scale(${clamp(a)})`} opacity={i < n + 1 ? clamp(a) : 0}>
              <rect width={130} height={44} rx={12} fill={C.roast} stroke={C.caramel} />
              <T x={65} y={28} s={15} a="middle" f={C.crema} w={600}>
                {b}
              </T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 6 · Context managers: cleanup always runs.
export function ContextManager({ t }: StepCtx) {
  const steps = [
    { k: 'open', at: 1.0, c: C.caramel },
    { k: 'use conn', at: 1.8, c: C.latte },
    { k: 'ValueError!', at: 2.6, c: C.cherry },
    { k: 'close', at: 3.4, c: C.caramel },
  ];
  return (
    <Stack>
      <Code
        title="with.py"
        t={t}
        end={0.9}
        highlight={t > 3.4 ? [5] : t > 2.6 ? [8] : []}
        lines={[
          '@contextmanager',
          'def connection():',
          "    log.append('open')",
          '    try:',
          "        yield 'conn'",
          "    finally:  log.append('close')",
          '',
          'with connection() as c:',
          "    raise ValueError('boom')",
        ]}
      />
      <Svg label="The body raises an error, and the connection still closes" h={120}>
        <line x1={40} y1={60} x2={560} y2={60} stroke={C.mocha} strokeWidth={3} />
        {steps.map((s, i) => {
          const a = easeOutBack(seg(t, s.at, s.at + 0.5));
          const x = 70 + i * 150;
          return (
            <g key={s.k} transform={`translate(${x} 60) scale(${clamp(a)})`} opacity={clamp(a)}>
              <circle r={14} fill={s.c} />
              <T x={0} y={44} s={14} a="middle" f={s.c === C.cherry ? C.cherryText : C.crema} w={600}>
                {s.k}
              </T>
            </g>
          );
        })}
        <T x={300} y={22} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.6, 4.1))}>
          CLEANUP RAN ANYWAY
        </T>
      </Svg>
    </Stack>
  );
}

// 7 · Decorators wrap functions.
export function Decorator({ t }: StepCtx) {
  const wrap = easeOutBack(seg(t, 1.2, 2.0));
  const names = easeOut(seg(t, 2.4, 3.0));
  return (
    <Stack>
      <Code
        title="timed.py"
        t={t}
        end={1}
        lines={[
          'def timed(fn):',
          '    @wraps(fn)',
          '    def wrapper(*args, **kwargs):',
          '        return fn(*args, **kwargs)',
          '    return wrapper',
          '',
          '@timed            # load = timed(load)',
          'def load(path): ...',
        ]}
        highlight={t > 1.2 ? [6] : []}
      />
      <Svg label="The decorator wraps load in a new function; wraps keeps the original name" h={168}>
        <g transform="translate(300 70)">
          <rect x={-70} y={-24} width={140} height={48} rx={12} fill={C.caramel} />
          <T x={0} y={7} s={17} a="middle" f={C.espresso} w={700}>
            load
          </T>
          <g transform={`scale(${lerp(1.6, 1, clamp(wrap))})`} opacity={clamp(wrap)}>
            <rect x={-110} y={-48} width={220} height={96} rx={20} fill="none" stroke={C.cinnamon} strokeWidth={3} strokeDasharray="7 6" />
            <T x={0} y={-56} s={13} a="middle" f={C.cinnamon} w={600}>
              timed
            </T>
          </g>
        </g>
        <g opacity={names}>
          <T x={300} y={140} s={13} a="middle" f={C.crema}>
            with @wraps: load.__name__ == 'load'
          </T>
          <T x={300} y={162} s={13} a="middle" f={C.taupe}>
            without @wraps: 'wrapper'
          </T>
        </g>
      </Svg>
    </Stack>
  );
}

// 8 · Dataclasses write the boilerplate.
export function Dataclass({ t }: StepCtx) {
  const gens = ['__init__', '__repr__', '__eq__'];
  return (
    <Stack>
      <Code title="event.py" t={t} end={0.9} lines={['@dataclass(frozen=True, slots=True)', 'class Event:', '    id: int', '    kind: str']} highlight={t > 1 ? [0] : []} />
      <Svg label="The dataclass generates init, repr and eq; frozen blocks assignment; slots removes the per-instance dict" h={200}>
        {gens.map((g, i) => {
          const a = easeOutBack(seg(t, 1.1 + i * 0.3, 1.6 + i * 0.3));
          return (
            <g key={g} transform={`translate(${70 + i * 165} 40) scale(${clamp(a)})`} opacity={clamp(a)}>
              <rect x={-62} y={-20} width={124} height={40} rx={20} fill={C.roast} stroke={C.caramel} />
              <T x={0} y={6} s={14} a="middle" f={C.crema} w={600}>
                {g}
              </T>
            </g>
          );
        })}
        <g opacity={easeOut(seg(t, 2.3, 2.8))}>
          <T x={30} y={104} s={14} f={C.crema} w={600}>
            frozen=True
          </T>
          <T x={30} y={128} s={14} f={C.latte}>
            e.kind = 'view' → FrozenInstanceError
          </T>
        </g>
        <g opacity={easeOut(seg(t, 2.9, 3.4))}>
          <T x={30} y={166} s={14} f={C.crema} w={600}>
            slots=True
          </T>
          <T x={30} y={190} s={14} f={C.latte}>
            no per-instance __dict__: smaller records
          </T>
        </g>
      </Svg>
    </Stack>
  );
}

// 8b · Classes: defining __eq__ removes __hash__. The drawing: a dict's buckets, and the Key heading for one. After the
// answer it reaches the hash() gate, finds __hash__ = None and bounces back: unhashable. Frozen, it hashes and lands.
export function Hashable({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const go = shown ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  const back = shown ? easeInOut(seg(s, 1.1, 1.6)) : 0;
  const frz = shown ? easeOut(seg(s, 2.2, 2.6)) : 0;
  const land = shown ? easeInOut(seg(s, 2.7, 3.5)) : 0;
  const kx = land > 0 ? lerp(25, 354, land) : 25 + 120 * go - 120 * back;
  const ky = land > 0 ? lerp(30, 104, land) : 30;
  const refused = shown && s > 0.8 && land === 0;
  return (
    <Stack>
      {!(portrait && shown) && (
        <Code
          title="keys.py"
          t={t}
          end={1}
          lines={['@dataclass', 'class Key:', '    table: str', '', `{Key('orders'): 1}   # ${shown ? "TypeError: unhashable type: 'Key'" : '?'}`]}
          highlight={shown ? [4] : [0]}
        />
      )}
      {shown && (!portrait || s >= 4.5) && <Code title="the fix" t={t + 10} lines={['@dataclass(frozen=True)', 'class Key:', '    table: str', "{Key('orders'): 1}   # works"]} highlight={[0]} />}
      {(!portrait || (shown && s < 4.5)) && (
        <Svg label="the key reaches the hash gate, finds no __hash__ and is refused; frozen, it hashes into a bucket" h={170}>
          <g opacity={easeOut(seg(t, 0, 0.4))}>
            <T x={330} y={162} s={13} f={C.quiet}>
              dict buckets
            </T>
            {[0, 1, 2, 3].map((b) => (
              <rect key={b} x={330 + b * 62} y={96} width={54} height={44} rx={4} fill="none" stroke={b === 1 && land >= 1 ? C.second : C.line} strokeWidth={1.2} />
            ))}
            <line x1={300} y1={18} x2={300} y2={140} stroke={refused ? C.badText : C.secondary} strokeWidth={2} />
            <T x={310} y={30} s={13} f={C.secondary}>
              hash()
            </T>
          </g>
          <g transform={`translate(${kx} ${ky})`} opacity={easeOut(seg(t, 0.3, 0.7))}>
            <rect x={0} y={0} width={land > 0 ? 130 : 150} height={36} rx={5} fill={C.panel} stroke={frz > 0 ? C.second : C.focus} strokeWidth={1.4} />
            <T x={land > 0 ? 65 : 75} y={23} s={13} a="middle" f={frz > 0 ? C.second : C.primary}>
              {frz > 0.5 ? 'frozen Key' : "Key('orders')"}
            </T>
          </g>
          {refused && (
            <g opacity={easeOut(seg(s, 0.8, 1.1))}>
              <T x={310} y={56} s={13} f={C.badText}>
                __hash__ = None
              </T>
              <T x={25} y={100} s={13} f={C.badText} o={easeOut(seg(s, 1.5, 1.8))}>
                unhashable
              </T>
            </g>
          )}
          {!shown && (
            <T x={110} y={100} s={14} a="middle" f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
              a key?
            </T>
          )}
        </Svg>
      )}
    </Stack>
  );
}

// 9 · Type hints are not enforced at runtime. The drawing: 'ab' walks straight through the n: int label, which is only a
// sign, and comes out 'abab'. Then the same call meets mypy in CI: a real gate, and the bad call stops there.
export function TypeHints({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const walk = shown ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const ci = shown ? easeOut(seg(s, 2.0, 2.4)) : 0;
  const stop = shown ? easeInOut(seg(s, 2.4, 3.0)) : 0;
  const x = walk <= 0.38 ? lerp(25, 204, walk / 0.38) : lerp(370, 470, Math.max(0, walk - 0.62) / 0.38);
  return (
    <Stack>
      {!(portrait && shown) && (
        <Code
          title="hints.py"
          t={t}
          end={0.9}
          lines={['def double(n: int) -> int:', '    return n * 2', '', `double('ab')   # ${shown ? "'abab': hints are not checked at runtime" : '?'}`]}
          highlight={shown ? [3] : []}
        />
      )}
      {shown && (!portrait || s >= 4.5) && (
        <Code title="where hints count" t={t + 10} lines={['$ mypy pipeline.py', 'pipeline.py:4: error: Argument 1 to "double" has', '  incompatible type "str"; expected "int"  [arg-type]']} />
      )}
      {(!portrait || (shown && s < 4.5)) && (
        <Svg label="at runtime the string passes the hint untouched; a type checker in CI stops it" h={170}>
          <g opacity={easeOut(seg(t, 0, 0.4))}>
            <T x={25} y={20} s={13} f={C.quiet}>
              at runtime
            </T>
            <rect x={240} y={34} width={120} height={40} rx={6} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} />
            <T x={300} y={59} s={13} a="middle" f={C.primary}>
              double
            </T>
            <line x1={200} y1={30} x2={200} y2={78} stroke={C.secondary} strokeDasharray="3 4" />
            <T x={194} y={94} s={13} a="end" f={C.secondary}>
              n: int
            </T>
          </g>
          <g opacity={easeOut(seg(t, 0.4, 0.8))}>
            {(walk <= 0.38 || walk >= 0.62) && (
              <T x={x} y={59} s={14} f={walk >= 0.62 ? C.focus : C.primary}>
                {walk >= 0.62 ? "'abab'" : "'ab'"}
              </T>
            )}
          </g>
          {!shown && (
            <T x={470} y={59} s={14} f={C.focus} o={easeOut(seg(t, 0.8, 1.15))}>
              ?
            </T>
          )}
          {ci > 0 && (
            <g opacity={ci}>
              <T x={25} y={120} s={13} f={C.second}>
                in CI
              </T>
              <line x1={200} y1={108} x2={200} y2={156} stroke={C.badText} strokeWidth={2.5} />
              <T x={212} y={137} s={13} f={C.badText} o={stop > 0.9 ? 1 : 0}>
                mypy: error
              </T>
              <T x={lerp(110, 140, stop)} y={137} s={14} f={C.primary}>
                'ab'
              </T>
            </g>
          )}
        </Svg>
      )}
    </Stack>
  );
}

// 10 · Recap in one breath.
const RECAP = [
  ['Defaults', 'run once, at def'],
  ['Closures', 'look names up late; i=i binds now'],
  ['Comprehensions', 'filter, then map'],
  ['Generators', 'stream one item at a time'],
  ['with', 'always cleans up'],
  ['Decorators', 'wrap a function; use @wraps'],
  ['Dataclasses', 'write the boilerplate'],
  ['Classes', '__eq__ drops __hash__; freeze keys'],
  ['Type hints', 'checked by tools, not at runtime'],
];
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Recap of the nine points" h={536}>
      {RECAP.map(([k, v], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.15, 0.6 + i * 0.15));
        const y = 4 + i * 59;
        // The point's name above its one-line summary: no two labels share a line, so nothing can collide at any font.
        return (
          <g key={k} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={30} y={y} width={540} height={53} rx={11} fill={C.roast} />
            <T x={50} y={y + 22} s={16} f={C.caramel} serif w={700}>
              {k}
            </T>
            <T x={50} y={y + 43} s={14} f={C.crema}>
              {v}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}
