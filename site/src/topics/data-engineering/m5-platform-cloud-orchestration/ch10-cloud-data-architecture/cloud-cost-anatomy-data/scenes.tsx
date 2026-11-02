import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T, Bar } from '../../../../../reels/kit';

// Every number shown here is computed by examples.py from disclosed rates, or measured against
// a real local S3-compatible server for the lab. See SOURCES.md / OUTLINE.md's "Changes from
// the chapter plan" for which numbers are quoted verbatim and which are documented constants.

// 1 · Hook: one million tiny files, flat storage line, huge requests line.
export function LooksFree({ t }: StepCtx) {
  const grow = clamp(seg(t, 0.2, 1));
  return (
    <Stack>
      <Svg label="Two bars for the same ten gigabytes: storage stays flat, requests balloons once the bytes are split into a million tiny files" h={300}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Ten GB, two layouts</T>

        <T x={150} y={56} s={13} a="middle" f={C.latte} serif>storage</T>
        <Bar x={60} y={66} w={180} h={28} full={180} fill={C.second} />
        <T x={450} y={56} s={13} a="middle" f={C.latte} serif>requests</T>
        <Bar x={340} y={66} w={200 * grow} h={28} full={200} fill={C.bad} o={0.75} />

        <T x={150} y={120} s={12} a="middle" f={C.taupe}>storage, fine either way</T>
        <T x={450} y={120} s={12} a="middle" f={grow > 0.8 ? C.badText : C.taupe} w={700}>{grow > 0.8 ? 'a million tiny PUTs' : 'growing...'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which line is driving the bill?
export function WhichLineIsDriving({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Four candidate bill lines, with requests highlighted once the answer is revealed" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Which line moved?</T>
        {['storage', 'compute', 'requests', 'network'].map((label, i) => {
          const isRequests = label === 'requests';
          return (
            <g key={label}>
              <rect x={60 + i * 120} y={60} width={100} height={50} rx={8} fill="none" stroke={revealed && isRequests ? C.caramel : C.mocha} strokeWidth={2} />
              <T x={110 + i * 120} y={90} s={12} a="middle" f={revealed && isRequests ? C.caramel : C.latte} w={revealed && isRequests ? 700 : 400}>{label}</T>
            </g>
          );
        })}
        <T x={300} y={150} s={13} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'billed per operation, not per byte' : 'the bytes stored never changed'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Storage is billed twice.
export function StorageTwice({ t }: StepCtx) {
  const showOp = clamp(seg(t, 0.3, 0.6));
  return (
    <Stack>
      <Svg label="One box for bytes held per month, a second box for every operation performed against them" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Two separate meters</T>
        <rect x={80} y={56} width={180} height={70} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={170} y={96} s={13} a="middle" f={C.latte} serif>bytes held</T>

        <g opacity={showOp}>
          <rect x={340} y={56} width={180} height={70} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={430} y={86} s={13} a="middle" f={C.caramel} serif>every PUT,</T>
          <T x={430} y={106} s={13} a="middle" f={C.caramel} serif>LIST, GET</T>
        </g>

        <T x={300} y={170} s={12} a="middle" f={C.taupe}>same ten gigabytes, billed on two different meters</T>
      </Svg>
    </Stack>
  );
}

// 4 · Compute: reserved vs consumed.
export function ReservedVsConsumed({ t }: StepCtx) {
  const consumed = clamp(seg(t, 0.2, 0.7));
  return (
    <Stack>
      <Svg label="A reserved-capacity bar filled fully, with a consumed-capacity bar growing to fill only part of it" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Reserved vs consumed</T>
        <T x={150} y={56} s={12} a="middle" f={C.latte} serif>reserved</T>
        <Bar x={60} y={66} w={220} h={28} full={220} fill={C.mocha} />
        <T x={450} y={56} s={12} a="middle" f={C.latte} serif>consumed</T>
        <Bar x={340} y={66} w={220} h={28} full={220} fill={C.second} o={0.3} />
        <Bar x={340} y={66} w={220 * 0.4 * consumed} h={28} full={220} fill={C.caramel} />
        <T x={300} y={140} s={12} a="middle" f={C.taupe}>the unfilled part is paid for and never used</T>
      </Svg>
    </Stack>
  );
}

// 5 · Network: every boundary has its own price.
export function EveryBoundary({ t }: StepCtx) {
  const stages = ['same zone', 'cross-AZ', 'cross-region', 'internet', 'NAT gateway'];
  return (
    <Stack>
      <Svg label="Five boundaries a byte can cross, each lit in turn with its own price tag" h={300}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Every boundary, its own price</T>
        {stages.map((label, i) => {
          const show = clamp(seg(t, 0.12 * i, 0.12 * i + 0.18));
          return (
            <g key={label} opacity={0.4 + 0.6 * show}>
              <rect x={40 + i * 108} y={56} width={94} height={60} rx={8} fill="none" stroke={show > 0.6 ? C.caramel : C.mocha} strokeWidth={2} />
              <T x={87 + i * 108} y={82} s={10} a="middle" f={show > 0.6 ? C.caramel : C.latte}>{label.split(' ')[0]}</T>
              <T x={87 + i * 108} y={98} s={10} a="middle" f={show > 0.6 ? C.caramel : C.latte}>{label.split(' ')[1] ?? ''}</T>
            </g>
          );
        })}
        <T x={300} y={150} s={12} a="middle" f={C.taupe}>free, then priced, then priced again, left to right</T>
      </Svg>
    </Stack>
  );
}

// 6 · Managed-service premium.
export function ManagedPremium({ t }: StepCtx) {
  const gap = clamp(seg(t, 0.2, 0.7));
  return (
    <Stack>
      <Svg label="A self-hosted bar and a taller managed-service bar, with the gap between them labeled as moved operational burden" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>The premium buys something</T>
        <T x={150} y={56} s={12} a="middle" f={C.latte} serif>self-hosted</T>
        <Bar x={60} y={66} w={200} h={28} full={200} fill={C.mocha} />
        <T x={450} y={56} s={12} a="middle" f={C.latte} serif>managed</T>
        <Bar x={340} y={66} w={200} h={28} full={200} fill={C.mocha} />
        <Bar x={340} y={66} w={200 * 0.35 * gap} h={28} full={200} fill={C.caramel} />
        <T x={450} y={120} s={11} a="middle" f={gap > 0.6 ? C.caramel : C.taupe} w={700}>{gap > 0.6 ? 'patching, scaling, failover' : ''}</T>
      </Svg>
    </Stack>
  );
}

// 7 · The worked Spark-job teardown.
export function SparkTeardown({ t }: StepCtx) {
  const slices = [
    { label: 'storage', value: 11.5, color: C.mocha },
    { label: 'network', value: 1.65, color: C.caramel },
    { label: 'NAT', value: 0.315, color: C.bad },
    { label: 'requests', value: 0.03, color: C.second },
  ];
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let acc = 0;
  return (
    <Stack>
      <Svg label="A four-slice pie for one Spark job's bill, built from storage, network, NAT and request charges" h={300}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>One job, every dollar labeled</T>
        <g transform="translate(180,150)">
          {slices.map((s, i) => {
            const show = clamp(seg(t, 0.15 * i, 0.15 * i + 0.25));
            const startAngle = (acc / total) * 2 * Math.PI - Math.PI / 2;
            acc += s.value;
            const endAngle = (acc / total) * 2 * Math.PI - Math.PI / 2;
            const r = 70;
            const x1 = r * Math.cos(startAngle), y1 = r * Math.sin(startAngle);
            const x2 = r * Math.cos(startAngle + (endAngle - startAngle) * show), y2 = r * Math.sin(startAngle + (endAngle - startAngle) * show);
            const large = endAngle - startAngle > Math.PI ? 1 : 0;
            return <path key={s.label} d={`M0,0 L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`} fill={s.color} opacity={0.85} />;
          })}
        </g>
        {slices.map((s, i) => (
          <T key={s.label} x={380} y={100 + i * 26} s={12} a="start" f={s.color} w={700}>{s.label}</T>
        ))}
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['storage: bytes + operations', 'compute: reserved vs used', 'network: every boundary', 'premium: buys moved burden'];
  return (
    <Stack>
      <Svg label="The four dimensions recapped as a stacked list" h={280} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Four dimensions, four meters</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.15 * i, 0.15 * i + 0.2));
          return (
            <T key={label} x={300} y={76 + i * 36} s={13} a="middle" f={C.latte} o={show} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 9 · Prove it: price the naive vs conditional race.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Two request-cost bars for the lab's own naive and conditional races, the conditional one taller once revealed" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Same race, two request counts</T>
        <T x={150} y={56} s={12} a="middle" f={C.latte} serif>naive</T>
        <Bar x={60} y={66} w={60} h={28} full={60} fill={C.mocha} />
        <T x={450} y={56} s={12} a="middle" f={C.latte} serif>conditional</T>
        <Bar x={340} y={66} w={revealed ? 140 : 60} h={28} full={140} fill={revealed ? C.caramel : C.mocha} />
        <T x={300} y={140} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'retries are real, counted requests' : '?'}</T>
      </Svg>
    </Stack>
  );
}
