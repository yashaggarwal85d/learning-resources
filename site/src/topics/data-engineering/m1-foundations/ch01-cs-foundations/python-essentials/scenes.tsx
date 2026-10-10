import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';

// Every example shown here is executed and checked by examples.py.
const C = { roast: '#2a1d16', cocoa: '#3b2a21', mocha: '#5a4032', taupe: '#8b7766', latte: '#c8ac8c', crema: '#e9d9bf', caramel: '#d49a57', cinnamon: '#b8612f', cherry: '#8e2f2a', espresso: '#17100c' };
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const SERIF = 'Fraunces, Georgia, serif';

const Stack = ({ children }: { children: ReactNode }) => <div className="flex h-full w-full flex-col justify-center gap-3 landscape:gap-5">{children}</div>;
const Svg = ({ label, h = 260, children }: { label: string; h?: number; children: ReactNode }) => (
  <svg viewBox={`0 0 600 ${h}`} className="min-h-0 w-full flex-1" role="img" aria-label={label}>
    {children}
  </svg>
);
const T = ({ x, y, s = 15, f = C.latte, a = 'start', w = 500, o = 1, serif = false, children }: { x: number; y: number; s?: number; f?: string; a?: 'start' | 'middle' | 'end'; w?: number; o?: number; serif?: boolean; children: ReactNode }) => (
  <text x={x} y={y} fontSize={s} fill={f} textAnchor={a} fontWeight={w} opacity={o} fontFamily={serif ? SERIF : MONO} letterSpacing={serif ? 0 : '0.03em'}>
    {children}
  </text>
);

// 1 · Where we are: the five refreshers that open the chapter.
const REFRESHERS = ['Python essentials', 'Git history workflows', 'Linux shell and processes', 'Software delivery workflow', 'Asymptotic notation and logarithms'];
export function Opening({ t }: StepCtx) {
  return (
    <Svg label="Chapter 1 opens with five refreshers; this is the first" h={420}>
      <T x={30} y={40} s={13} f={C.taupe}>§1.1 · REFRESHERS · SKIM WHAT YOU KNOW</T>
      {REFRESHERS.map((r, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.22, 0.8 + i * 0.22));
        const on = i === 0;
        const y = 70 + i * 66;
        return (
          <g key={r} transform={`translate(${30 + (1 - clamp(a)) * -40} ${y})`} opacity={clamp(a)}>
            <rect width={540} height={52} rx={14} fill={on ? C.caramel : C.roast} stroke={on ? C.caramel : C.mocha} />
            <T x={22} y={33} s={14} f={on ? C.espresso : C.taupe} w={600}>{String(i + 1).padStart(2, '0')}</T>
            <T x={64} y={33} s={19} f={on ? C.espresso : C.crema} serif w={700}>{r}</T>
            {on && <T x={518} y={33} s={13} f={C.espresso} a="end" w={600}>NOW ▶</T>}
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Mutable default arguments.
export function MutableDefault({ t, answer, portrait }: StepCtx) {
  const fixed = answer !== null;
  return (
    <Stack>
      {!(portrait && fixed) && <Code
        title="defaults.py"
        t={t}
        end={1}
        lines={['def append_one(xs=[]):', '    xs.append(1)', '    return xs', '', 'append_one()   # [1]', `append_one()   # ${fixed ? '[1, 1]  ← the same list' : '?'}`]}
        highlight={fixed ? [0, 5] : [5]}
      />}
      {fixed && (
        <Code
          title="the fix"
          t={t + 10}
          lines={['def append_one(xs=None):', '    if xs is None:', '        xs = []', '    xs.append(1)', '    return xs']}
          highlight={[0, 1, 2]}
        />
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
        <T x={293} y={30} s={13} a="middle" f={C.latte}>IF x % 2</T>
        <rect x={380} y={40} width={86} height={120} rx={14} fill="none" stroke={C.caramel} strokeDasharray="5 6" />
        <T x={423} y={30} s={13} a="middle" f={C.caramel}>x * x</T>
        <T x={30} y={30} s={13} f={C.taupe}>xs</T>
        <T x={530} y={30} s={13} f={C.taupe} a="middle">result</T>
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
              <T x={x} y={y + 5} s={13} a="middle" f={odd ? C.espresso : C.crema} w={700}>{label}</T>
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
      <Code
        title="same answer"
        t={t}
        end={0.9}
        lines={['sum([i * i for i in range(1_000_000)])  # list', 'sum(i * i for i in range(1_000_000))    # generator']}
      />
      <Svg label="Peak memory: the list version climbs to about 40 MB, the generator stays under 1 KB">
        <T x={30} y={34} s={13} f={C.taupe}>PEAK MEMORY (MEASURED, CPYTHON 3.13)</T>
        <T x={30} y={84} s={14} f={C.crema} w={600}>list</T>
        <rect x={130} y={64} width={400} height={30} rx={8} fill={C.cocoa} />
        <rect x={130} y={64} width={400 * e} height={30} rx={8} fill={C.cherry} />
        <T x={540} y={86} s={14} f={C.crema} a="end" w={700}>{listMB.toFixed(1)} MB</T>
        <T x={30} y={154} s={14} f={C.crema} w={600}>generator</T>
        <rect x={130} y={134} width={400} height={30} rx={8} fill={C.cocoa} />
        <rect x={130} y={134} width={4} height={30} rx={2} fill={C.caramel} />
        {Array.from({ length: 6 }, (_, i) => {
          const p = ((t * 0.9 + i / 6) % 1) * (t > 1 ? 1 : 0);
          return <circle key={i} cx={140 + p * 380} cy={149} r={5} fill={C.caramel} opacity={Math.sin(Math.PI * p)} />;
        })}
        <T x={540} y={156} s={14} f={C.caramel} a="end" w={700}>0.5 KB</T>
        <T x={300} y={222} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.6, 4.2))}>ONE ITEM AT A TIME: FILES BIGGER THAN RAM STREAM THROUGH</T>
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
        lines={['def read_batches(rows, size):', '    batch = []', '    for r in rows:', '        batch.append(r)', '        if len(batch) == size:', '            yield batch      # pause here', '            batch = []', '    if batch:', '        yield batch']}
      />
      <Svg label="Each next() call runs the function to its next yield and hands back one batch" h={110}>
        <T x={30} y={26} s={13} f={C.taupe}>list(read_batches(range(5), 2))</T>
        {batches.map((b, i) => {
          const a = easeOutBack(seg(t, 1.4 + i * 1.0, 1.9 + i * 1.0));
          return (
            <g key={b} transform={`translate(${40 + i * 150} 46) scale(${clamp(a)})`} opacity={i < n + 1 ? clamp(a) : 0}>
              <rect width={130} height={44} rx={12} fill={C.roast} stroke={C.caramel} />
              <T x={65} y={28} s={15} a="middle" f={C.crema} w={600}>{b}</T>
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
        lines={['@contextmanager', 'def connection():', "    log.append('open')", '    try:', "        yield 'conn'", "    finally:  log.append('close')", '', 'with connection() as c:', "    raise ValueError('boom')"]}
      />
      <Svg label="The body raises an error, and the connection still closes" h={120}>
        <line x1={40} y1={60} x2={560} y2={60} stroke={C.mocha} strokeWidth={3} />
        {steps.map((s, i) => {
          const a = easeOutBack(seg(t, s.at, s.at + 0.5));
          const x = 70 + i * 150;
          return (
            <g key={s.k} transform={`translate(${x} 60) scale(${clamp(a)})`} opacity={clamp(a)}>
              <circle r={14} fill={s.c} />
              <T x={0} y={44} s={14} a="middle" f={s.c === C.cherry ? '#e07a6e' : C.crema} w={600}>{s.k}</T>
            </g>
          );
        })}
        <T x={300} y={22} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.6, 4.1))}>CLEANUP RAN ANYWAY</T>
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
      <Code title="timed.py" t={t} end={1} lines={['def timed(fn):', '    @wraps(fn)', '    def wrapper(*args, **kwargs):', '        return fn(*args, **kwargs)', '    return wrapper', '', '@timed            # load = timed(load)', 'def load(path): ...']} highlight={t > 1.2 ? [6] : []} />
      <Svg label="The decorator wraps load in a new function; wraps keeps the original name" h={150}>
        <g transform="translate(300 70)">
          <rect x={-70} y={-24} width={140} height={48} rx={12} fill={C.caramel} />
          <T x={0} y={7} s={17} a="middle" f={C.espresso} w={700}>load</T>
          <g transform={`scale(${lerp(1.6, 1, clamp(wrap))})`} opacity={clamp(wrap)}>
            <rect x={-110} y={-48} width={220} height={96} rx={20} fill="none" stroke={C.cinnamon} strokeWidth={3} strokeDasharray="7 6" />
            <T x={0} y={-56} s={13} a="middle" f={C.cinnamon} w={600}>timed</T>
          </g>
        </g>
        <g opacity={names}>
          <T x={30} y={140} s={13} f={C.crema}>with @wraps: load.__name__ == 'load'</T>
          <T x={570} y={140} s={13} a="end" f={C.taupe}>without: 'wrapper'</T>
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
      <Svg label="The dataclass generates init, repr and eq; frozen blocks assignment; slots removes the per-instance dict" h={170}>
        {gens.map((g, i) => {
          const a = easeOutBack(seg(t, 1.1 + i * 0.3, 1.6 + i * 0.3));
          return (
            <g key={g} transform={`translate(${70 + i * 165} 40) scale(${clamp(a)})`} opacity={clamp(a)}>
              <rect x={-62} y={-20} width={124} height={40} rx={20} fill={C.roast} stroke={C.caramel} />
              <T x={0} y={6} s={14} a="middle" f={C.crema} w={600}>{g}</T>
            </g>
          );
        })}
        <g opacity={easeOut(seg(t, 2.3, 2.8))}>
          <T x={30} y={112} s={14} f={C.crema} w={600}>frozen=True</T>
          <T x={190} y={112} s={14} f={C.latte}>e.kind = 'view'  → FrozenInstanceError</T>
        </g>
        <g opacity={easeOut(seg(t, 2.9, 3.4))}>
          <T x={30} y={150} s={14} f={C.crema} w={600}>slots=True</T>
          <T x={190} y={150} s={14} f={C.latte}>no per-instance __dict__: smaller records</T>
        </g>
      </Svg>
    </Stack>
  );
}

// 9 · Type hints are not enforced at runtime.
export function TypeHints({ t, answer, portrait }: StepCtx) {
  return (
    <Stack>
      {!(portrait && answer !== null) && <Code
        title="hints.py"
        t={t}
        end={0.9}
        lines={['def double(n: int) -> int:', '    return n * 2', '', `double('ab')   # ${answer !== null ? "'abab': hints are not checked at runtime" : '?'}`]}
        highlight={answer !== null ? [3] : []}
      />}
      {answer !== null && (
        <Code title="where hints count" t={t + 10} lines={['$ mypy pipeline.py', 'pipeline.py:4: error: Argument 1 to "double" has', '  incompatible type "str"; expected "int"  [arg-type]']} />
      )}
    </Stack>
  );
}

// 10 · Recap in one breath.
const RECAP = [
  ['Defaults', 'run once, at def'],
  ['Comprehensions', 'filter, then map'],
  ['Generators', 'stream one item at a time'],
  ['with', 'always cleans up'],
  ['Decorators', 'wrap a function; use @wraps'],
  ['Dataclasses', 'write the boilerplate'],
  ['Type hints', 'checked by tools, not at runtime'],
];
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Recap of the seven points" h={470}>
      {RECAP.map(([k, v], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.18, 0.6 + i * 0.18));
        const y = 30 + i * 62;
        return (
          <g key={k} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={30} y={y} width={540} height={50} rx={12} fill={C.roast} />
            <T x={52} y={y + 32} s={19} f={C.caramel} serif w={700}>{k}</T>
            <T x={250} y={y + 31} s={14} f={C.crema}>{v}</T>
          </g>
        );
      })}
    </Svg>
  );
}
