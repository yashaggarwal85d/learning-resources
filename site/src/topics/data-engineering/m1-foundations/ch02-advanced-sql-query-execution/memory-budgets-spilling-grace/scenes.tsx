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

/** A label above a bar, with its display value below — safe for long labels (topic 21's looks-review fix). */
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

export function TwoSpills({ t }: StepCtx) {
  return (
    <Svg label="the same ~35 megabyte spill, two very different outcomes" h={220}>
      <Row y={70} label="work_mem = 4 MB, spills 35 MB" value="785 ms" valueColor={C.focus} />
      <Row y={130} label="work_mem = 64 kB, spills 35 MB" value="1089 ms" valueColor={C.cherryText} />
      {t > 2 && (
        <T x={300} y={185} s={15} f={C.latte} a="middle">
          same query, same disk written — not the same cost
        </T>
      )}
    </Svg>
  );
}

export function PredictSpillSlower({ t }: StepCtx) {
  return (
    <Svg label="2,000,000 rows, ORDER BY sort_key, no LIMIT" h={200}>
      <Row y={70} label="rows to sort" value="2,000,000" />
      <Row y={130} label="work_mem" value="4 MB (the default)" />
    </Svg>
  );
}

export function RevealNotNecessarily({ t }: StepCtx) {
  return (
    <Svg label="quicksort in memory vs external merge, nearly the same time" h={370}>
      {timeBar(30, 110, 849 / 849, '849 ms, quicksort, 111,653 kB memory', 'work_mem = 256 MB', C.latte)}
      {timeBar(30, 230, 785 / 849, '785 ms, external merge, 35,248 kB disk', 'work_mem = 4 MB (default)', C.focus)}
      {t > 2 && (
        <T x={300} y={330} s={15} f={C.latte} a="middle">
          spilling 35 MB measured faster here, not slower
        </T>
      )}
    </Svg>
  );
}

export function HowWorkMemBudgets({ t }: StepCtx) {
  return (
    <Svg label="work_mem budgets one operation, not one query or one session" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          every sort or hash in a query —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          gets its own work_mem budget
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            several operations, or several sessions,
          </T>
          <T x={300} y={173} s={15} f={C.focus} a="middle">
            can each spend it at once
          </T>
        </>
      )}
    </Svg>
  );
}

export function RevealWhatGetsSlow({ t }: StepCtx) {
  return (
    <Svg label="785ms at the default vs over 1000ms once work_mem is starved" h={410}>
      {timeBar(30, 100, 785 / 1089, '785 ms, 35,248 kB spilled', 'work_mem = 4 MB (default)', C.focus)}
      {timeBar(30, 210, 1066 / 1089, '1066 ms, 35,288 kB spilled', 'work_mem = 128 kB', C.cherryText)}
      {timeBar(30, 320, 1089 / 1089, '1089 ms, 35,296 kB spilled', 'work_mem = 64 kB', C.cherryText)}
      {t > 2.4 && (
        <T x={300} y={390} s={14} f={C.latte} a="middle">
          almost the same disk — the merge passes cost time
        </T>
      )}
    </Svg>
  );
}

export function HowHashGetsMoreRoom({ t }: StepCtx) {
  return (
    <Svg label="hash_mem_multiplier gives hash tables more room than sort gets" h={240}>
      <Row y={60} label="work_mem 4 MB, multiplier ×1.0" value="8 batches" valueColor={C.cherryText} />
      <Row y={120} label="work_mem 4 MB, multiplier ×4.0" value="2 batches" valueColor={C.focus} />
      {t > 2 && (
        <T x={300} y={175} s={15} f={C.latte} a="middle">
          same work_mem — hash gets 4× the room, not 1×
        </T>
      )}
    </Svg>
  );
}

export function PredictHashShrink({ t }: StepCtx) {
  return (
    <Svg label="a 500,000-row build side, work_mem shrinking" h={200}>
      <Row y={70} label="build side" value="500,000 rows" />
      <Row y={130} label="work_mem" value="256 MB → 64 kB" />
    </Svg>
  );
}

export function RevealBatchesDouble({ t }: StepCtx) {
  const rows: Array<[string, string, string, string]> = [
    ['256 MB', '1 batch', '524,288 buckets', C.latte],
    ['4 MB', '4 batches', '262,144 buckets', C.crema],
    ['1 MB', '16 batches', '65,536 buckets', C.crema],
    ['256 kB', '64 batches', '16,384 buckets', C.focus],
    ['64 kB', '256 batches', '4,096 buckets', C.cherryText],
  ];
  return (
    <Svg label="batches climb from 1 to 256 as work_mem shrinks from 256MB to 64kB" h={330}>
      {rows.map(([wm, batches, buckets, color], i) => (
        <g key={wm}>
          <T x={25} y={55 + i * 50} s={14} f={C.latte}>
            work_mem = {wm}
          </T>
          <T x={575} y={55 + i * 50} s={18} f={color} a="end" w={600}>
            {batches}
          </T>
          <T x={575} y={55 + i * 50 + 18} s={11} f={C.taupe} a="end" w={600}>
            {buckets}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function HowBatchesSpill({ t }: StepCtx) {
  return (
    <Svg label="a row that doesn't fit the current batch goes to a numbered partition file" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          a row that misses the in-memory slice —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          goes to a numbered partition file instead
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            each partition is joined on its own,
          </T>
          <T x={300} y={173} s={15} f={C.focus} a="middle">
            one batch at a time
          </T>
        </>
      )}
    </Svg>
  );
}

export function PredictConcurrency({ t }: StepCtx) {
  return (
    <Svg label="two sessions, same work_mem, running at the same time" h={200}>
      <Row y={70} label="sessions running at once" value="2" />
      <Row y={130} label="work_mem, each session" value="4 MB" />
    </Svg>
  );
}

export function RevealConcurrencyMultiplies({ t }: StepCtx) {
  return (
    <Svg label="one spiller's 35MB vs two spillers' combined 69MB" h={370}>
      {timeBar(30, 110, 35 / 69, '35,248 kB, one session alone', 'one session', C.latte)}
      {timeBar(30, 230, 69 / 69, '69 MB combined, measured live', 'two sessions, overlapping', C.cherryText)}
      {t > 2 && (
        <T x={300} y={330} s={15} f={C.latte} a="middle">
          each session still only ever sees its own 4 MB
        </T>
      )}
    </Svg>
  );
}

export function WhySkewNeedsProtection({ t }: StepCtx) {
  return (
    <Svg label="one key carries 1% of all rows — it needs its own protection" h={240}>
      {t > 0 && (
        <T x={300} y={55} s={16} f={C.crema} a="middle">
          one key, 20,000 of 2,000,000 rows —
        </T>
      )}
      {t > 1 && (
        <T x={300} y={100} s={15} f={C.latte} a="middle">
          would get re-spilled into every batch
        </T>
      )}
      {t > 2 && (
        <>
          <T x={300} y={150} s={15} f={C.focus} a="middle">
            a dedicated in-memory bucket keeps it —
          </T>
          <T x={300} y={173} s={15} f={C.taupe} a="middle">
            not independently visible in EXPLAIN on this version
          </T>
        </>
      )}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  const lines = [
    'work_mem budgets one operation, not one query',
    'hash gets work_mem × hash_mem_multiplier',
    'spilling itself measured fine here, not slower',
    'a hash join partitions into batches instead of failing',
    'every concurrent spiller pays its own budget again',
  ];
  return (
    <Svg label="recap: budgets, spilling, batching, concurrency" h={260}>
      {lines.map((l, i) => t > i * 0.6 && (
        <T key={l} x={300} y={55 + i * 40} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle">
          {l}
        </T>
      ))}
    </Svg>
  );
}

export function ProveBatches({ t }: StepCtx) {
  return (
    <Svg label="EXPLAIN snippet: Buckets: 16384  Batches: 64  Memory Usage: 256kB" h={220}>
      <T x={300} y={70} s={15} f={C.crema} a="middle">
        Buckets: 16384  Batches: 64
      </T>
      <T x={300} y={100} s={15} f={C.crema} a="middle">
        Memory Usage: 256kB
      </T>
      <Row y={160} label="is this hash join spilling?" value="?" />
    </Svg>
  );
}

export function ProveConcurrency({ t }: StepCtx) {
  return (
    <Svg label="6 concurrent sessions, each work_mem = 8MB — worst case?" h={220}>
      <Row y={70} label="concurrent sessions" value="6" />
      <Row y={130} label="work_mem, each" value="8 MB" />
    </Svg>
  );
}
