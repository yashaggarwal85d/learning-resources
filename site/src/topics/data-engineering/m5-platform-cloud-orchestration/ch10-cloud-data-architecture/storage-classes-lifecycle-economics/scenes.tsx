import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, SERIF, Stack, Svg, T, Bar } from '../../../../../reels/kit';

// Every number shown here is executed and checked by examples.py.

// 1 · Hook: a lifecycle rule deletes a file a snapshot still needs.
export function LifecycleHook({ t }: StepCtx) {
  const swept = t > 1.2;
  const broken = t > 2.4;
  return (
    <Stack>
      <Svg label="A lifecycle rule sweeps and deletes a file that a table's manifest still points at; the arrow is left dangling" h={340}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>One rule, one table, no warning</T>
        <rect x={60} y={60} width={480} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={80} y={90} s={14} a="start" f={C.latte} serif>lifecycle rule</T>
        <T x={520} y={90} s={14} a="end" f={swept ? C.caramel : C.taupe} w={700}>{swept ? 'swept old files' : 'past cutoff'}</T>

        <rect x={60} y={130} width={480} height={50} rx={8} fill="none" stroke={broken ? C.bad : C.mocha} strokeWidth={2} />
        <T x={80} y={160} s={14} a="start" f={C.latte} serif>table manifest</T>
        <T x={520} y={160} s={14} a="end" f={broken ? C.badText : C.taupe} w={700}>{broken ? 'points at nothing' : 'points at file'}</T>

        <T x={300} y={220} s={13} a="middle" f={C.taupe}>same rule, run exactly as configured</T>
        <T x={300} y={250} s={14} a="middle" f={broken ? C.badText : C.latte} w={700}>{broken ? 'time travel now errors' : 'time travel works'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what is the rule blind to?
export function WhatIsItBlindTo({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A snapshot's own reference to the file lights up, visibly independent of the rule's age-based sweep" h={320}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>What the rule can see</T>
        <rect x={60} y={64} width={480} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={80} y={94} s={14} a="start" f={C.latte} serif>age, tags, prefix</T>
        <T x={520} y={94} s={14} a="end" f={C.caramel} w={700}>visible to the rule</T>

        <rect x={60} y={134} width={480} height={50} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={80} y={164} s={14} a="start" f={C.latte} serif>live snapshot reference</T>
        <T x={520} y={164} s={14} a="end" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'invisible to the rule' : '?'}</T>

        <T x={300} y={230} s={13} a="middle" f={C.taupe}>the rule is time-based only</T>
      </Svg>
    </Stack>
  );
}

// 3 · Hot, infrequent, archive: the same three tiers, three vendors.
export function ThreeCloudsThreeTiers({ t }: StepCtx) {
  const cols = [
    { cloud: 'S3', tiers: ['hot', 'infrequent', 'archive'], mins: ['none', 'thirty days', 'ninety–one eighty'] },
    { cloud: 'GCS', tiers: ['hot', 'infrequent', 'archive'], mins: ['none', 'thirty days', 'three sixty-five'] },
    { cloud: 'Azure Blob', tiers: ['hot', 'infrequent', 'archive'], mins: ['none', 'thirty–ninety', 'one eighty'] },
  ];
  return (
    <Stack>
      <Svg label="Three clouds, each with hot, infrequent and archive tiers, each stating its own minimum storage duration" h={360} fill>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Same shape, three vendors</T>
        {cols.map((col, i) => {
          const x = 40 + i * 180;
          const show = clamp(seg(t, 0.2 + i * 0.4, 0.2 + i * 0.4 + 0.3));
          return (
            <g key={col.cloud} opacity={show}>
              <T x={x + 80} y={54} s={13} a="middle" f={C.crema} serif>{col.cloud}</T>
              {col.tiers.map((tier, j) => (
                <g key={tier}>
                  <rect x={x} y={70 + j * 80} width={160} height={64} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
                  <T x={x + 80} y={70 + j * 80 + 26} s={13} a="middle" f={C.latte} serif>{tier}</T>
                  <T x={x + 80} y={70 + j * 80 + 48} s={12} a="middle" f={C.caramel} w={700}>{col.mins[j]}</T>
                </g>
              ))}
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 4 · Cheaper to store, slower and costlier to read back.
export function RetrievalLadder({ t }: StepCtx) {
  const rows = [
    { label: 'expedited', frac: 0.08 },
    { label: 'standard', frac: 0.4 },
    { label: 'bulk', frac: 1 },
  ];
  return (
    <Stack>
      <Svg label="Expedited is fastest and costliest, standard takes hours, bulk is cheapest and slowest, each a longer wait than the one before it" h={260}>
        <T x={40} y={30} s={14} f={C.taupe}>Retrieval speed, archive tier</T>
        {rows.map((r, i) => {
          const fill = easeOut(seg(t, 0.2 + i * 0.4, 0.2 + i * 0.4 + 0.3));
          const y = 50 + i * 56;
          return (
            <g key={r.label}>
              <T x={40} y={y + 16} s={13} f={C.latte} serif>{r.label}</T>
              <Bar x={130} y={y} w={430 * r.frac * fill} h={20} full={430} fill={C.second} />
            </g>
          );
        })}
        <T x={40} y={230} s={12} f={C.taupe}>minutes, then hours, then longer — cheaper each step down</T>
      </Svg>
    </Stack>
  );
}

// 5 · Automated tiering moves the data; it doesn't make the decision free.
export function AutomatedTiering({ t }: StepCtx) {
  const idle = clamp(seg(t, 0.3, 1.2));
  const tier = idle > 0.7 ? 'archive' : idle > 0.3 ? 'infrequent' : 'hot';
  return (
    <Stack>
      <Svg label="An object's access pattern cools over time; automated tiering moves it down through the tiers on its own, with its own monitoring fee" h={280}>
        <T x={300} y={30} s={14} a="middle" f={C.taupe} serif>Access cools, tier follows</T>
        <rect x={60} y={60} width={480} height={30} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <Bar x={60} y={60} w={480 * (1 - idle)} h={30} full={480} fill={C.second} o={0.5} />
        <T x={300} y={80} s={13} a="middle" f={C.crema} w={700}>{tier}</T>
        <T x={300} y={130} s={13} a="middle" f={C.taupe}>moved automatically, no manual choice</T>
        <T x={300} y={170} s={14} a="middle" f={C.caramel} w={700}>plus a monitoring fee, per object</T>
      </Svg>
    </Stack>
  );
}

// 6 · The ordering fix, reproduced.
export function OrderingFix({ t }: StepCtx) {
  const broken = t > 1.2;
  const fixed = t > 2.8;
  return (
    <Stack>
      <Svg label="Delete-before-expire corrupts the table; expire-before-delete leaves it intact, reproduced on a local stand-in twice" h={340}>
        <T x={300} y={28} s={14} a="middle" f={C.taupe} serif>Same delete, two orders</T>

        <T x={150} y={56} s={13} a="middle" f={C.latte} serif>delete, then expire</T>
        <rect x={40} y={66} width={220} height={60} rx={8} fill="none" stroke={broken ? C.bad : C.mocha} strokeWidth={2} />
        <T x={150} y={100} s={13} a="middle" f={broken ? C.badText : C.taupe} w={700}>{broken ? 'corrupted' : 'running'}</T>

        <T x={450} y={56} s={13} a="middle" f={C.latte} serif>expire, then delete</T>
        <rect x={340} y={66} width={220} height={60} rx={8} fill="none" stroke={fixed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={450} y={100} s={13} a="middle" f={fixed ? C.caramel : C.taupe} w={700}>{fixed ? 'intact' : 'running'}</T>

        <T x={300} y={180} s={13} a="middle" f={C.taupe}>the only difference is which step runs first</T>
      </Svg>
    </Stack>
  );
}

// 7 · Object Lock trades flexibility for a guarantee you can't take back.
export function ObjectLockModes({ t }: StepCtx) {
  const show = t > 1;
  return (
    <Stack>
      <Svg label="Governance mode blocks most users but one permission can override it; compliance mode blocks everyone including the account root" h={300}>
        <T x={300} y={28} s={14} a="middle" f={C.taupe} serif>Two modes, one irreversible</T>

        <rect x={40} y={60} width={240} height={90} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={160} y={86} s={13} a="middle" f={C.crema} serif>governance</T>
        <T x={160} y={110} s={12} a="middle" f={C.latte} w={700}>most users blocked</T>
        <T x={160} y={130} s={12} a="middle" f={C.caramel} w={700}>one permission overrides</T>

        <rect x={320} y={60} width={240} height={90} rx={8} fill="none" stroke={show ? C.bad : C.mocha} strokeWidth={2} />
        <T x={440} y={86} s={13} a="middle" f={C.crema} serif>compliance</T>
        <T x={440} y={110} s={12} a="middle" f={show ? C.badText : C.latte} w={700}>every user blocked</T>
        <T x={440} y={130} s={12} a="middle" f={show ? C.badText : C.latte} w={700}>including the root user</T>

        <T x={300} y={200} s={13} a="middle" f={C.taupe}>the only way out early: delete the whole account</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap(_: StepCtx) {
  const lines = [
    'Hot, infrequent, archive: the same shape, every cloud, its own minimum stay.',
    'Cheaper to store means slower and costlier to read back.',
    'Expire the snapshot before any age-based rule runs.',
  ];
  return (
    <Stack>
      <div className="flex flex-col gap-3">
        {lines.map((l, i) => (
          <div key={i} className="rounded-lg border px-4 py-3" style={{ borderColor: C.mocha }}>
            <span style={{ color: C.crema, fontFamily: SERIF, fontSize: 15 }}>{l}</span>
          </div>
        ))}
      </div>
    </Stack>
  );
}

// 9 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A nightly snapshot-expiry job at two and a lifecycle rule at one; the rule runs first, so it can still delete a file the previous day's snapshot needs" h={300}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Which job runs first, tonight</T>
        <rect x={60} y={64} width={480} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={80} y={94} s={14} a="start" f={C.latte} serif>lifecycle rule, one in the morning</T>

        <rect x={60} y={134} width={480} height={50} rx={8} fill="none" stroke={revealed ? C.bad : C.mocha} strokeWidth={2} />
        <T x={80} y={164} s={14} a="start" f={C.latte} serif>snapshot expiry, two in the morning</T>

        <T x={300} y={230} s={14} a="middle" f={revealed ? C.badText : C.taupe} w={700}>
          {revealed ? 'rule runs first — same risk as the hook' : 'which runs first?'}
        </T>
      </Svg>
    </Stack>
  );
}
