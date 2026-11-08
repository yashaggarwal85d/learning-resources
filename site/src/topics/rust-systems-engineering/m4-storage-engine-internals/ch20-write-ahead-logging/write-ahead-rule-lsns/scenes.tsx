import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';


/** A check mark that draws itself over `k` (0..1). */
const Tick = ({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? <path d={`M${x} ${y} l6 6 l12 -14`} fill="none" stroke={f} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - k)} /> : null;
/** A cross that draws itself over `k`. */
const Cross = ({ x, y, k, f = C.cherryText }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? (
    <g stroke={f} strokeWidth={2.5} strokeLinecap="round">
      <line x1={x} y1={y - 7} x2={x + 14 * Math.min(1, k * 2)} y2={y - 7 + 14 * Math.min(1, k * 2)} />
      {k > 0.5 && <line x1={x + 14} y1={y - 7} x2={x + 14 - 14 * (k - 0.5) * 2} y2={y - 7 + 14 * (k - 0.5) * 2} />}
    </g>
  ) : null;

// Log first, data later: the same crash survives when the log comes
// first and silently loses the update when it's reversed. Comparing a
// page's own LSN against a record's own LSN makes redo safe to run more
// than once. And a torn page is caught by its own checksum, fixed by
// restoring the log's own already-durable full-page image.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Log-first or data-first: which survives the crash (predict, hook) ──
export function OrderPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same crash, two orderings"
        lines={['log(change); write_page(change);', '// or: write_page(change); log(change);']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: log-first survives, data-first loses it (takeaway) ──────
export function OrderReveal({ t }: StepCtx) {
  const crash = 1.0;
  const lane = (y: number, logFirst: boolean) => {
    const into = easeOut(seg(t, 0.2, 0.75));
    const chipX = logFirst ? lerp(20, 130, into) : lerp(20, 430, into);
    const wiped = logFirst ? 0 : easeInOut(seg(t, crash + 0.1, crash + 0.6));
    const redo = logFirst ? easeInOut(seg(t, 1.5, 2.1)) : 0;
    const verdict = seg(t, 2.2, 2.6);
    return (
      <g>
        <T x={40} y={y - 34} s={13} f={C.latte}>{logFirst ? 'log first' : 'page first'}</T>
        <rect x={60} y={y - 20} width={150} height={40} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <rect x={370} y={y - 20} width={150} height={40} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={135} y={y + 38} s={13} a="middle" f={C.taupe}>log</T>
        <T x={445} y={y + 38} s={13} a="middle" f={C.taupe}>page</T>
        {/* the change, arriving in the log (top) or the page (bottom); the crash wipes the unlogged one */}
        {into > 0 && wiped < 1 && (
          <g transform={`translate(${chipX} ${y}) scale(${(1 - wiped).toFixed(3)})`}>
            <rect x={-10} y={-11} width={20} height={22} rx={3} fill={!logFirst && t > crash ? C.cherryText : C.caramel} />
          </g>
        )}
        {/* recovery: the record replays across the crash into the page */}
        {logFirst && <Draw pts={[[160, y], [400, y]]} t={t} from={1.5} to={2.1} stroke={C.caramel} w={2} dash="6 5" />}
        {redo > 0 && <rect x={lerp(150, 435, redo) - 10} y={y - 11} width={20} height={22} rx={3} fill={C.crema} />}
        {logFirst ? <Tick x={540} y={y} k={easeOut(verdict)} /> : <Cross x={540} y={y} k={easeOut(verdict)} />}
        {verdict > 0 && (
          <Decode text={logFirst ? 'recovered' : 'lost, silently'} t={t} at={2.2} dur={0.5} x={520} y={y - 34} s={13} a="end" f={logFirst ? C.caramel : C.cherryText} />
        )}
      </g>
    );
  };
  return (
    <Svg label="log_first_redo_idempotent_torn_page.rs, measured" h={270}>
      {lane(70, true)}
      {lane(200, false)}
      {/* the crash, at the same point in both lanes */}
      <Draw pts={[[290, 20], [290, 240]]} t={t} from={crash} to={crash + 0.35} stroke={C.cherryText} w={2} />
      {t > crash + 0.35 && <T x={290} y={262} s={13} a="middle" f={C.cherryText}>crash</T>}
    </Svg>
  );
}
// ── 8 · PostgreSQL's own words on WAL (connecting step, NO takeaway) ─────
// The rule acted out: the record reaches the log first, only then does the
// data file get written; then a change still missing from a page is
// redone from the log. Each beat lands under its quoted phrase.

// ── 3 · Does redo re-apply an already-applied record (predict) ───────────
export function IdempotentPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a record already reflected in the page"
        lines={['redo(old_record, &mut page);', '// re-applied, or a genuine no-op?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: a genuine no-op, twice over (takeaway) ─────────────────
export function IdempotentReveal({ t }: StepCtx) {
  const pass = (a: number, y: number, label: string) => {
    const k = seg(t, a, a + 0.6);
    const x = k < 0.6 ? lerp(120, 330, k / 0.6) : lerp(330, 250, (k - 0.6) / 0.4);
    return (
      <g>
        <T x={40} y={y + 5} s={13} f={C.latte} o={seg(t, a - 0.1, a)}>{label}</T>
        {k > 0 && k < 1 && <rect x={x} y={y - 11} width={34} height={22} rx={3} fill={C.cinnamon} />}
        {k >= 1 && <T x={250} y={y + 5} s={13} f={C.cinnamon}>no-op</T>}
      </g>
    );
  };
  return (
    <Svg label="log_first_redo_idempotent_torn_page.rs, measured" h={260}>
      <rect x={370} y={40} width={180} height={150} rx={6} fill="none" stroke={C.crema} strokeWidth={1.5} />
      <T x={460} y={30} s={13} a="middle" f={C.crema}>page</T>
      <T x={460} y={120} s={15} a="middle" f={C.caramel} w={700}>page.lsn</T>
      <T x={460} y={146} s={13} a="middle" f={C.latte} o={seg(t, 0.5, 0.7)}>≥ record.lsn</T>
      {pass(0.3, 80, 'replay')}
      {pass(1.3, 150, 'second pass')}
      <Tick x={520} y={176} k={easeOut(seg(t, 2.1, 2.4))} />
      <Decode text="page unchanged" t={t} at={2.2} dur={0.4} x={460} y={226} s={15} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 6 · Measured: caught and fixed (takeaway) ─────────────────────────────
// A crash mid-write: half the page's blocks land new, half stay old. The
// checksum runs over the bytes and no longer matches. Then the log's own
// full-page image slides in over the torn page, and the checksum matches.

// ── 5 · Does a checksum catch a torn page (predict) ───────────────────────
export function TornPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a page torn by a partial write"
        lines={['page.is_torn(); // part new bytes, part old', '// caught by its own checksum, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: caught and fixed (takeaway) ─────────────────────────────
export function TornReveal({ t }: StepCtx) {
  const n = 8, x0 = 120, cw = 46;
  const tear = seg(t, 0.2, 0.7) * n;
  const scan = seg(t, 0.8, 1.3);
  const fix = easeInOut(seg(t, 1.5, 2.0));
  return (
    <Svg label="log_first_redo_idempotent_torn_page.rs, measured" h={260}>
      <T x={x0} y={56} s={13} f={C.latte}>page</T>
      {Array.from({ length: n }, (_, i) => {
        const fresh = i < 5 && tear > i;
        return <rect key={i} x={x0 + i * cw} y={66} width={cw - 6} height={36} rx={2} fill={fresh ? C.crema : C.taupe} />;
      })}
      {scan > 0 && scan < 1 && <line x1={x0 + scan * n * cw} y1={58} x2={x0 + scan * n * cw} y2={110} stroke={C.cinnamon} strokeWidth={2} />}
      <Decode text={fix >= 1 ? 'checksum: matches' : 'checksum: mismatch'} t={t} at={fix >= 1 ? 2.0 : 1.3} dur={0.35} x={x0} y={140} s={15} f={fix >= 1 ? C.caramel : C.cherryText} w={700} />
      {/* the full-page image from the log */}
      <T x={x0} y={196} s={13} f={C.caramel} o={seg(t, 1.4, 1.6)}>full-page image, from the log</T>
      <g transform={`translate(0 ${lerp(144, 0, fix).toFixed(1)})`} opacity={seg(t, 1.4, 1.6)}>
        {Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + i * cw} y={66} width={cw - 6} height={36} rx={2} fill="none" stroke={C.caramel} strokeWidth={2} />)}
      </g>
      {fix >= 1 && Array.from({ length: n }, (_, i) => <rect key={i} x={x0 + i * cw} y={66} width={cw - 6} height={36} rx={2} fill={C.crema} />)}
    </Svg>
  );
}
// ── 9 · PostgreSQL's own full-page write (surprising fact, takeaway) ─────
// Before the page on disk is first modified, a complete image of it goes
// into the log. Then the page is written, and a crash tears it. Recovery
// copies the image back: the page is whole again.

// ── 7 · Why doesn't commit need every page flushed (predict) ─────────────
export function PgWalPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own write-ahead rule"
        lines={['commit(); // which pages must be flushed first?', '// all of them, or none?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · PostgreSQL's own words on WAL (connecting step, NO takeaway) ─────
export function PgWalReveal({ t }: StepCtx) {
  const rec = easeOut(seg(t, 0.2, 0.7));
  const write = easeInOut(seg(t, 0.9, 1.4));
  const redo = easeInOut(seg(t, 1.7, 2.3));
  return (
    <Svg label="PostgreSQL docs, quoted" h={260}>
      <rect x={60} y={40} width={160} height={50} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <rect x={380} y={40} width={160} height={50} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={140} y={30} s={13} a="middle" f={C.taupe}>WAL</T>
      <T x={460} y={30} s={13} a="middle" f={C.taupe}>data file</T>
      {/* 1: the record lands in the log */}
      {rec > 0 && <rect x={lerp(10, 125, rec)} y={54} width={30} height={22} rx={3} fill={C.caramel} />}
      {/* 2: only then is the data file written */}
      <Draw pts={[[225, 65], [375, 65]]} t={t} from={0.9} to={1.4} stroke={C.crema} w={2} />
      {write >= 1 && <rect x={395} y={54} width={30} height={22} rx={3} fill={C.crema} />}
      {/* 3: a change not yet applied, redone from the log */}
      {t > 1.6 && <rect x={480} y={54} width={30} height={22} rx={3} fill="none" stroke={C.latte} strokeDasharray="4 3" />}
      <Draw pts={[[140, 92], [140, 140], [495, 140], [495, 80]]} t={t} from={1.7} to={2.3} stroke={C.caramel} w={2} dash="6 5" />
      {redo >= 1 && <rect x={480} y={54} width={30} height={22} rx={3} fill={C.caramel} />}
      <T x={40} y={190} s={13} f={C.crema} o={seg(t, 0.8, 1.1)}>“written only after … logged”</T>
      <Draw pts={[[40, 198], [300, 198]]} t={t} from={1.0} to={1.5} stroke={C.caramel} w={1.5} pen={false} />
      <T x={40} y={232} s={13} f={C.crema} o={seg(t, 1.6, 1.9)}>“can be redone from the WAL”</T>
      <Draw pts={[[40, 240], [290, 240]]} t={t} from={1.9} to={2.4} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// Each lesson slides in on its beat with its verdict drawing beside it; a
// spine draws down through them, and the lock-on lands on the rule itself.

// ── 9 · PostgreSQL's own full-page write (surprising fact, takeaway) ─────
export function FullPageWriteReveal({ t }: StepCtx) {
  const img = easeInOut(seg(t, 0.3, 0.9));
  const tear = seg(t, 1.2, 1.4);
  const back = easeInOut(seg(t, 1.7, 2.3));
  return (
    <Svg label="PostgreSQL docs, quoted" h={260}>
      <T x={40} y={30} s={13} f={C.latte}>WAL</T>
      <rect x={40} y={40} width={520} height={44} rx={4} fill="none" stroke={C.mocha} />
      <T x={40} y={150} s={13} f={C.latte}>page on disk</T>
      <rect x={40} y={160} width={160} height={44} rx={4} fill="none" stroke={C.crema} strokeWidth={1.5} />
      {/* the complete image goes into the log first */}
      <rect x={lerp(46, 300, img)} y={lerp(166, 46, img)} width={148} height={32} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} opacity={img > 0 ? 1 : 0} />
      {img >= 1 && <rect x={300} y={46} width={148} height={32} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={374} y={67} s={13} a="middle" f={C.caramel} o={seg(t, 0.8, 1.0)}>full image</T>
      {/* then the write, torn by a crash */}
      <rect x={46} y={166} width={74} height={32} rx={2} fill={C.crema} opacity={seg(t, 1.0, 1.2)} />
      {tear > 0 && back < 1 && <line x1={124} y1={156} x2={116} y2={208} stroke={C.cherryText} strokeWidth={2.5} />}
      {tear > 0 && back < 1 && <T x={220} y={188} s={13} f={C.cherryText} o={tear * (1 - back)}>torn</T>}
      {/* restored from the image */}
      {back > 0 && <rect x={lerp(300, 46, back)} y={lerp(46, 166, back)} width={148} height={32} rx={3} fill={back >= 1 ? C.caramel : 'none'} stroke={C.caramel} strokeWidth={2} />}
      <Decode text="restored from the image" t={t} at={2.3} dur={0.45} x={220} y={188} s={13} f={C.caramel} />
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows: [string, boolean][] = [
    ['log first, data later', true],
    ['the reversed order silently loses it', false],
    ['LSN comparison makes redo safe to repeat', true],
    ['a torn page: caught, fixed from the log', true],
  ];
  return (
    <Svg label="recap: log first, data later" h={260}>
      <Draw pts={[[30, 34], [30, 226]]} t={t} from={0.15} to={1.9} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map(([r, good], i) => {
        const a = 0.2 + i * 0.45;
        const k = easeOut(seg(t, a, a + 0.45));
        const y = 40 + i * 60;
        return (
          <g key={r}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <circle cx={30} cy={y} r={5} fill={i === 0 ? C.caramel : C.crema} />
              <T x={50} y={y + 5} s={i === 0 ? 15 : 13} f={i === 0 ? C.caramel : C.crema} w={i === 0 ? 700 : 500}>{r}</T>
            </g>
            {good ? <Tick x={548} y={y} k={easeOut(seg(t, a + 0.35, a + 0.7))} /> : <Cross x={548} y={y} k={easeOut(seg(t, a + 0.35, a + 0.7))} />}
          </g>
        );
      })}
      <Reticle x={160} y={40} w={290} h={36} t={t} at={2.3} />
    </Svg>
  );
}
