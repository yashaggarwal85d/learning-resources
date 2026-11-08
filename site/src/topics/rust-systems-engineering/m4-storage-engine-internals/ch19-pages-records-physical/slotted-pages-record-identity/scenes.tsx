import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A slotted page's whole point is that a record's own identity (its slot
// index) and its physical offset are two different things, deliberately:
// compacting the page moves the offset, and the slot index never has to
// know. A record too big for the page is rejected cleanly rather than
// corrupting it, exactly why a real system moves oversized values out of
// line entirely.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// One slotted page: slot boxes at the front, records packed from the back, an arrow from each slot to its record.
function SlotPage({ t, recX, recY, recO, arrowAt, empty }: { t: number; recX: number[]; recY: number[]; recO: number[]; arrowAt: number[]; empty?: number }) {
  const SLOTS = [{ id: 'A', w: 110 }, { id: 'B', w: 70 }, { id: 'C', w: 90 }];
  return (
    <g>
      <rect x={30} y={40} width={540} height={110} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={40} y={32} s={13} f={C.taupe}>slots</T>
      <T x={560} y={32} s={13} a="end" f={C.taupe}>records</T>
      {SLOTS.map((s, i) => {
        const sx = 44 + i * 40;
        const tx = recX[i] + s.w / 2;
        const drawn = t >= arrowAt[i] + 0.4;
        return (
          <g key={s.id}>
            <rect x={sx} y={52} width={32} height={24} rx={3} fill="none" stroke={C.crema} strokeWidth={1.5} />
            <T x={sx + 16} y={69} s={13} a="middle" f={C.crema}>{s.id}</T>
            {empty === i ? null : drawn ? (
              <path d={`M${sx + 16} 76 Q${(sx + 16 + tx) / 2} 96 ${tx} ${recY[i]}`} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={recO[i]} />
            ) : (
              <Draw pts={[[sx + 16, 76], [(sx + 16 + tx) / 2, 92], [tx, recY[i]]]} t={t} from={arrowAt[i]} to={arrowAt[i] + 0.4} stroke={C.taupe} w={1.5} />
            )}
            <rect x={recX[i]} y={recY[i]} width={s.w - 4} height={34} rx={3} fill={C.caramel} opacity={recO[i]} />
            <T x={recX[i] + s.w / 2 - 2} y={recY[i] + 22} s={13} a="middle" f={C.espresso} w={600} o={recO[i]}>{s.id}</T>
          </g>
        );
      })}
    </g>
  );
}

// A list row that lands on its beat: its text slides in from the left while its marker draws
// (a tick for a recap point, a growing dot for one of several names, a cross for a failure).
function Row({ t, at, y, text, mark = 'tick' }: { t: number; at: number; y: number; text: string; mark?: 'tick' | 'dot' | 'cross' }) {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      {mark === 'tick' && <Draw pts={[[23, y], [28, y + 5], [37, y - 6]]} t={t} from={at + 0.1} to={at + 0.4} stroke={C.caramel} w={2} />}
      {mark === 'cross' && <Draw pts={[[25, y - 5], [35, y + 5]]} t={t} from={at + 0.1} to={at + 0.3} stroke={C.cherryText} w={2} />}
      {mark === 'cross' && <Draw pts={[[35, y - 5], [25, y + 5]]} t={t} from={at + 0.25} to={at + 0.45} stroke={C.cherryText} w={2} />}
      {mark === 'dot' && <circle cx={30} cy={y} r={5 * k} fill={C.caramel} />}
      <g opacity={k} transform={`translate(${((1 - k) * -28).toFixed(1)} 0)`}>
        <T x={48} y={y + 6} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
}

// ── 1 · Does a record's identity survive compaction (predict, hook) ──────────────────────────────
export function CompactionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a slot array: offset and length, indexed by slot"
        lines={['page.delete(slot); page.compact();', '// does the slot index survive the move?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: round trip, then compaction moved the offset (swipe test's "from" step) ────────
export function CompactionReveal({ t }: StepCtx) {
  // Insert three records (each drops into place as its slot's arrow draws). Delete the middle one, then compact:
  // the last record slides over into the freed space, and its slot's arrow follows it — new offset, same slot.
  const home = [460, 390, 300];
  const drop = [0, 1, 2].map((_, i) => easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25)));
  const gone = easeOut(seg(t, 1.2, 1.5));
  const slide = easeOut(seg(t, 1.6, 2.1));
  const recX = [home[0], home[1], home[2] + slide * 70];
  const recY = drop.map((k, i) => lerp(170, 104, k) + (i === 1 ? gone * 40 : 0));
  const recO = drop.map((k, i) => (i === 1 ? k * (1 - gone) : k));
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={230}>
      <SlotPage t={t} recX={recX} recY={recY} recO={recO} arrowAt={[0.35, 0.6, 0.85]} empty={gone > 0.5 ? 1 : undefined} />
      <Draw pts={[[300, 175], [370, 175]]} t={t} from={1.6} to={2.1} stroke={C.cinnamon} w={2} />
      <Decode text="offset changed" t={t} at={2.0} x={335} y={198} s={13} a="middle" f={C.cinnamon} />
      <Decode text="same slot" t={t} at={2.2} x={140} y={198} s={13} a="middle" f={C.caramel} />
      <Reticle x={140} y={64} w={44} h={36} t={t} at={2.3} />
    </Svg>
  );
}

// ── 3 · Did the slot indices themselves change (predict) ─────────────────────────────────────────
export function IdentityPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two records, after compaction"
        lines={['let (slot_a, slot_c) = (0, 2);', '// did compaction renumber either one?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: slot index unchanged, offset changed (takeaway) ────────────────────────────────
export function IdentityReveal({ t }: StepCtx) {
  const shift = easeOut(seg(t, 0.5, 0.85));
  const dx = shift * 60;
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two surviving records, after compaction</T>
      <rect x={200 + dx} y={70} width={30} height={10} rx={2} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>offset: changed. slot index: unchanged</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>neither record was ever renumbered</T>
    </Svg>
  );
}

// ── 5 · Does the content still match after the move (predict) ────────────────────────────────────
export function ReadbackPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="reading by slot index, after the physical move"
        lines={['page.get(slot_a); page.get(slot_c);', '// same content as before compaction?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: content exactly matches after the move (takeaway) ──────────────────────────────
export function ReadbackReveal({ t }: StepCtx) {
  const read = easeOut(seg(t, 0.5, 0.85));
  const dy = (1 - read) * -24;
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same slot index, read after compaction</T>
      <Draw pts={[[240, 50], [240, 85]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2} pen />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g transform={`translate(0,${dy})`} opacity={read}>
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>content: exactly the same for both</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the caller never had to notice the move</T>
    </Svg>
  );
}

// ── 7 · An oversized insert (predict) ─────────────────────────────────────────────────────────────
export function OverflowPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a record far too big for the free space left"
        lines={['page.insert(&oversized);', '// written anyway, or rejected cleanly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: rejected cleanly, everything else intact (connecting step, NO takeaway) ────────
export function OverflowReveal({ t }: StepCtx) {
  // A record far wider than the free gap slides toward the page, meets the gap's edge and is pushed back out
  // ("rejected"); then a tick draws over every record already there — all intact.
  const home = [460, 390, 300];
  const hit = seg(t, 0.3, 1.2);
  const x = hit < 0.5 ? lerp(620, 190, easeOut(hit * 2)) : lerp(190, 620, easeOut(hit * 2 - 1) * 0.35);
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={230}>
      <SlotPage t={t + 10} recX={home} recY={[104, 104, 104]} recO={[1, 1, 1]} arrowAt={[0, 0, 0]} />
      <rect x={x} y={168} width={330} height={22} rx={3} fill="none" stroke={C.cherryText} strokeWidth={2} />
      <line x1={190} y1={160} x2={190} y2={196} stroke={C.mocha} strokeDasharray="3 3" />
      <Decode text="rejected cleanly" t={t} at={1.1} x={30} y={215} s={13} f={C.cherryText} />
      {home.map((hx, i) => (
        <Draw key={hx} pts={[[hx + [110, 70, 90][i] / 2 - 12, 96], [hx + [110, 70, 90][i] / 2 - 6, 101], [hx + [110, 70, 90][i] / 2 + 6, 89]]} t={t} from={1.5 + i * 0.2} to={1.75 + i * 0.2} stroke={C.caramel} w={2} />
      ))}
      <Decode text="every record intact" t={t} at={2.2} x={570} y={215} s={13} a="end" f={C.caramel} />
    </Svg>
  );
}

// ── 9 · A fixed page size is why TOAST exists (surprising fact, takeaway) ────────────────────────
export function FixedSizeReveal({ t }: StepCtx) {
  // A value wider than the page slides in; its overhang turns red at the page's fixed edge and cannot spill onto
  // the next page. So it breaks into chunks that drop into separate storage, leaving a small pointer behind.
  const pageX = 60, pageW = 220;
  const slide = easeOut(seg(t, 0.3, 0.8));
  const split = easeOut(seg(t, 1.3, 1.9));
  const vx = lerp(620, pageX + 10, slide);
  const chunks = [0, 1, 2];
  return (
    <Svg label="PostgreSQL docs, quoted" h={230}>
      <T x={pageX} y={36} s={13} f={C.taupe}>one page, fixed size</T>
      <rect x={pageX} y={46} width={pageW} height={56} rx={5} fill="none" stroke={C.caramel} strokeWidth={2} />
      <rect x={pageX + pageW + 20} y={46} width={pageW} height={56} rx={5} fill="none" stroke={C.mocha} strokeDasharray="4 4" />
      <T x={pageX + pageW + 130} y={36} s={13} a="middle" f={C.taupe}>next page</T>
      {split <= 0 && <rect x={vx} y={62} width={pageW - 20} height={24} rx={3} fill={C.latte} />}
      {split <= 0 && <rect x={vx + pageW - 20} y={62} width={160} height={24} rx={3} fill={C.cherryText} opacity={slide} />}
      {split <= 0 && <line x1={pageX + pageW + 10} y1={52} x2={pageX + pageW + 10} y2={96} stroke={C.cherryText} strokeWidth={3} opacity={fa(t, 0.8, 0.2)} />}
      <T x={pageX + pageW + 130} y={124} s={13} a="middle" f={C.cherryText} o={fa(t, 0.85, 0.3) * (1 - split)}>no spill</T>
      {chunks.map((i) => {
        const k = easeOut(seg(t, 1.3 + i * 0.12, 1.9 + i * 0.12));
        if (split <= 0) return null;
        return <rect key={i} x={lerp(pageX + 10 + i * 120, 330 + i * 76, k)} y={lerp(62, 172, k)} width={lerp(116, 70, k)} height={24} rx={3} fill={i === 2 ? C.cherryText : C.latte} />;
      })}
      {split > 0 && <rect x={pageX + 10} y={62} width={30 * split} height={24} rx={3} fill={C.cinnamon} />}
      <rect x={320} y={160} width={250} height={48} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, 1.2, 0.3)} />
      <T x={445} y={152} s={13} a="middle" f={C.taupe} o={fa(t, 1.2, 0.3)}>stored elsewhere</T>
      <Draw pts={[[pageX + 40, 86], [pageX + 40, 184], [316, 184]]} t={t} from={1.9} to={2.3} stroke={C.cinnamon} w={1.5} />
      <T x={pageX} y={215} s={13} f={C.cinnamon} o={fa(t, 2.0, 0.3)}>a pointer stays</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a slot index is a stable name, not a place',
    'compaction moves the offset, not the identity',
    'an oversized insert is rejected, not silent',
    'a fixed size is why values move out of line',
  ];
  return (
    <Svg label="recap: identity, decoupled from location" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={90} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
