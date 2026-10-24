import { Bar, C, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, big = false }: { y: number; label: string; value: string; valueColor?: string; big?: boolean }) {
  return (
    <g>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A label above a bar, with its display value below — safe for long labels. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string) {
  return (
    <g key={label}>
      <T x={x} y={y - 20} s={13} f={C.latte}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema}>
        {display}
      </T>
    </g>
  );
}

export function TwoCosts({ t }: StepCtx) {
  return (
    <Svg label="same query, same 20,000,000-row table, same answer — very different time" h={370}>
      {timeBar(30, 90, 3956.844 / 3956.844, '3956.844 ms, single-threaded', 'PostgreSQL', C.cherryText)}
      {timeBar(30, 210, 240.726 / 3956.844, '240.726 ms, single-threaded', 'DuckDB', C.focus)}
      {t > 2.4 && (
        <T x={300} y={330} s={15} f={C.latte} a="middle">
          same answer, checked — not assumed
        </T>
      )}
    </Svg>
  );
}

export function PredictWhyGap({ t }: StepCtx) {
  return (
    <Svg label="same table, same SQL, same answer — 16.4x apart" h={200}>
      <Row y={70} label="query, table, answer" value="identical" />
      <Row y={130} label="time to get there" value="16.4× apart" valueColor={C.cherryText} />
    </Svg>
  );
}

export function RevealVolcano({ t }: StepCtx) {
  return (
    <Svg label="pull one row at a time, all the way up the plan" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          the top operator asks the one below it —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          for one row, and gets exactly one row
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            every operator, every row,
          </T>
          <T x={300} y={173} s={15} f={C.focus} a="middle">
            one at a time, top to bottom
          </T>
        </>
      )}
    </Svg>
  );
}

export function HowIteratorRuns({ t }: StepCtx) {
  return (
    <Svg label="one function call per operator, per row, 19,587,629 times" h={240}>
      <Row y={60} label="rows pulled through the plan" value="19,587,629" />
      <Row y={120} label="function calls, per operator" value="one per row" valueColor={C.cherryText} />
      {t > 2 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          interpretation overhead, no room for the compiler
        </T>
      )}
    </Svg>
  );
}

export function RevealVectorization({ t }: StepCtx) {
  return (
    <Svg label="an array of rows per operator call, not one row" h={200}>
      <Row y={70} label="DuckDB's default vector" value="2048 rows" valueColor={C.focus} />
      <Row y={130} label="the research engine's default" value="1024 rows" />
    </Svg>
  );
}

export function HowVectorizedRuns({ t }: StepCtx) {
  return (
    <Svg label="one loop over a cache-sized array, not a call per row" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          same filter, same multiply,
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          same 19,587,629 rows —
        </T>
      )}
      {t > 2 && (
        <T x={300} y={150} s={15} f={C.focus} a="middle">
          looped over in batches, not summoned one at a time
        </T>
      )}
    </Svg>
  );
}

export function PredictBiggerBatch({ t }: StepCtx) {
  return (
    <Svg label="2048 rows per call beats 1 — does bigger keep winning?" h={200}>
      <Row y={70} label="1 row per call" value="slowest" valueColor={C.cherryText} />
      <Row y={130} label="2048 rows per call" value="much faster" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSweetSpot({ t }: StepCtx) {
  const rows: Array<[string, string, string]> = [
    ['1 row per call', 'as slow as a pure interpreter', C.cherryText],
    ['~1,000 rows per call', 'the best measured', C.focus],
    ['past 8,000 rows per call', 'falls off again', C.cherryText],
  ];
  return (
    <Svg label="vector size 1: slow. ~1000: best. past 8000: worse again." h={260}>
      {rows.map(([label, note, color], i) => (
        <g key={label}>
          <T x={25} y={55 + i * 55} s={15} f={C.latte}>
            {label}
          </T>
          <T x={575} y={55 + i * 55} s={14} f={color} a="end" w={600}>
            {note}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function HowCompilingGoesFurther({ t }: StepCtx) {
  return (
    <Svg label="scan + filter + build, blurred into one code fragment" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          scan, filter, hash build —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          compiled into one piece of machine code
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            values stay in CPU registers —
          </T>
          <T x={300} y={173} s={15} f={C.focus} a="middle">
            pushed forward, never pulled
          </T>
        </>
      )}
    </Svg>
  );
}

export function PredictThreeModels({ t }: StepCtx) {
  return (
    <Svg label="iterator vs vectorized vs compiled — one core, same plan" h={220}>
      <Row y={60} label="pull one row at a time" value="iterator" />
      <Row y={115} label="process a cache-sized batch" value="vectorized" />
      <Row y={170} label="generate machine code for the plan" value="compiled" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTradeoff({ t }: StepCtx) {
  return (
    <Svg label="fastest to run, slowest to start — and hardest to debug" h={260}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          hand-written C++ ≈ compiled engine —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          both far ahead of a classical iterator
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.cherryText} a="middle">
            but every query compiles before row one —
          </T>
          <T x={300} y={173} s={15} f={C.cherryText} a="middle">
            and a crash in generated code is harder to read
          </T>
        </>
      )}
    </Svg>
  );
}

export function MorselDriven({ t }: StepCtx) {
  return (
    <Svg label="1 thread to 4, work split into morsels at run time" h={370}>
      {timeBar(30, 90, 240.726 / 240.726, '240.726 ms', '1 thread', C.cherryText)}
      {timeBar(30, 210, 72.693 / 240.726, '72.693 ms', '4 threads, same work', C.focus)}
      {t > 2.4 && (
        <T x={300} y={330} s={15} f={C.latte} a="middle">
          about 3.3× on 4 cores, split at run time
        </T>
      )}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'pulling one row at a time costs a function call per row',
    'a batch amortizes that call, if it fits the cache',
    'compiling removes the batch too — at a compile-time cost',
    'morsels replace a fixed thread count with a run-time one',
  ];
  return (
    <Svg label="recap: pull vs push, batch size, compiling, morsels" h={240}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 42} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveBatchSignal({ t }: StepCtx) {
  return (
    <Svg label="a plan reports ~4,000,000 rows for a whole stage" h={200}>
      <Row y={70} label="rows reported per plan step" value="~4,000,000" />
      <Row y={130} label="pulling tuple-at-a-time, or batched?" value="?" />
    </Svg>
  );
}

export function ProveScaling({ t }: StepCtx) {
  return (
    <Svg label="240.726 ms on 1 thread, 72.693 ms on 4 — what kind of scaling?" h={200}>
      <Row y={70} label="1 thread" value="240.726 ms" />
      <Row y={130} label="4 threads, same work" value="72.693 ms" valueColor={C.focus} />
    </Svg>
  );
}
