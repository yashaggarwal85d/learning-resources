import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, MONO, SERIF, Stack, Svg, T, Bar } from '../../../../../reels/kit';

// Every number shown here is executed and checked by examples.py.

const ZONES = [
  { x: 180, y: 95 },
  { x: 420, y: 95 },
  { x: 300, y: 215 },
];

function ZoneRing({ bad, label }: { bad: number | null; label: string }) {
  return (
    <>
      <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>{label}</T>
      {ZONES.map((z, i) => (
        <g key={i}>
          <circle cx={z.x} cy={z.y} r={32} fill="none" stroke={bad === i ? C.bad : C.mocha} strokeWidth={bad === i ? 3 : 2} />
          <T x={z.x} y={z.y + 5} s={14} a="middle" f={bad === i ? C.badText : C.latte}>Zone {String.fromCharCode(65 + i)}</T>
        </g>
      ))}
    </>
  );
}

function ServiceRow({ x, y, label, status, bad, muted }: { x: number; y: number; label: string; status?: string; bad?: boolean; muted?: boolean }) {
  return (
    <g opacity={muted ? 0.45 : 1}>
      <rect x={x} y={y} width={520} height={40} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={x + 20} y={y + 25} s={14} f={C.crema} serif>{label}</T>
      {status && <T x={x + 500} y={y + 25} s={14} a="end" f={bad ? C.badText : C.caramel} w={700}>{status}</T>}
    </g>
  );
}

// 1 · One zone goes dark: three services, three outcomes.
export function OneZoneDark({ t }: StepCtx) {
  const bad = t > 1 ? 0 : null;
  const shown = bad !== null;
  return (
    <Stack>
      <Svg label="A zone fails; a single-zone database goes dark while a regional store and a multi-zone cluster keep serving" h={420}>
        <ZoneRing bad={bad} label="One region, three zones" />
        <ServiceRow x={40} y={260} label="Single-zone database" status={shown ? 'DOWN' : undefined} bad />
        <ServiceRow x={40} y={312} label="Regional object store" status={shown ? 'serving' : undefined} />
        <ServiceRow x={40} y={364} label="Multi-zone streaming" status={shown ? 'serving' : undefined} />
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which of the three keeps serving when the zone fails?
export function WhichSurvives({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Three services pinned to the same failing zone; only the regional object store keeps serving" h={400}>
        <ZoneRing bad={revealed ? 0 : null} label="This zone just failed" />
        <ServiceRow x={40} y={250} label="Block volume" status={revealed ? 'down' : undefined} bad muted={revealed} />
        <ServiceRow x={40} y={302} label="Single-zone database" status={revealed ? 'down' : undefined} bad muted={revealed} />
        <ServiceRow x={40} y={354} label="Object-storage bucket" status={revealed ? 'survives' : undefined} />
      </Svg>
    </Stack>
  );
}

// 3 · Zonal vs regional vs multi-AZ, named the same way by three clouds.
export function ZonalRegionalStrip({ t }: StepCtx) {
  const rows = [
    { svc: 'Block volume', tag: 'zonal', bad: true },
    { svc: 'Managed database', tag: 'multi-zone, opt-in', bad: false },
    { svc: 'Object storage', tag: 'regional', bad: false },
  ];
  return (
    <Stack>
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => {
          const show = clamp(seg(t, 0.2 + i * 0.5, 0.2 + i * 0.5 + 0.35) * 3);
          return (
            <div key={i} className="flex flex-col gap-1 rounded-lg border px-4 py-2" style={{ borderColor: C.mocha, opacity: show }}>
              <span style={{ color: C.crema, fontFamily: SERIF, fontSize: 14 }}>{r.svc}</span>
              <span style={{ color: r.bad ? C.badText : C.caramel, fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>{r.tag}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center" style={{ color: C.taupe, fontFamily: SERIF, fontSize: 13 }}>
        Named the same way in AWS's, Google Cloud's and Azure's own documentation.
      </div>
    </Stack>
  );
}

// 4 · Cross-zone replication traffic is billed, not free.
export function CrossAzCost({ t }: StepCtx) {
  const gbPerDay = 500;
  const rate = 0.01;
  const dailyCost = Math.round(gbPerDay * rate * 2 * 100) / 100;
  const fill = easeOut(seg(t, 0.2, 1.4));
  const shown = Math.round(dailyCost * fill * 100) / 100;
  return (
    <Stack>
      <Svg label="Five hundred gigabytes replicated each direction per day, at one cent per gigabyte each way, costs ten dollars a day" h={200}>
        <T x={40} y={36} s={14} f={C.taupe}>Cross-zone replication traffic</T>
        <Bar x={40} y={64} w={520 * fill} h={26} full={520} fill={C.second} />
        <T x={40} y={120} s={13} f={C.latte}>{gbPerDay.toLocaleString('en-US')} GB each way / day</T>
        <T x={40} y={142} s={13} f={C.latte}>$0.01/GB each direction</T>
        <T x={40} y={182} s={24} f={C.caramel} w={700}>${shown.toFixed(2)} / day</T>
      </Svg>
    </Stack>
  );
}

// 5 · A cell bounds a failure to its own customers.
export function CellBlastRadius({ t }: StepCtx) {
  const total = 20;
  const cols = 5;
  const badAt = seg(t, 0.4, 1);
  return (
    <Stack>
      <Svg label="A grid of twenty independent cells; one cell turns bad while every other cell keeps serving its own customers" h={240} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Twenty cells, one routing layer</T>
        {Array.from({ length: total }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = 110 + col * 90;
          const y = 55 + row * 50;
          const bad = i === 0 && badAt > 0.5;
          return (
            <rect key={i} x={x} y={y} width={64} height={34} rx={6} fill={bad ? C.bad : 'none'} stroke={bad ? C.bad : C.mocha} strokeWidth={1.5} opacity={bad ? clamp((badAt - 0.5) * 4) : 1} />
          );
        })}
      </Svg>
      <div className="text-center" style={{ color: C.latte, fontFamily: MONO, fontSize: 13 }}>
        one bad cell, five percent of customers — not every customer
      </div>
    </Stack>
  );
}

// 6 · Recap.
export function Recap(_: StepCtx) {
  const lines = [
    'Zonal, regional or multi-zone: check the service, every time.',
    'Cross-zone traffic for redundancy is billed, per gigabyte.',
    'A cell bounds a failure below the whole region.',
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
