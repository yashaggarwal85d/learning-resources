import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A file descriptor is a handle, not the resource itself — a duplicated one genuinely
// shares its original's offset, a dropped OwnedFd genuinely closes the real resource,
// and a leaked one genuinely survives into a child it was never meant to reach.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Several names pour into one idea: a line from each row's dot runs down the left gutter into one node,
// where the idea they share decodes and is locked on.
function Converge({ t, n, y0, dy, at, verdict }: { t: number; n: number; y0: number; dy: number; at: number; verdict: string }) {
  const yN = y0 + n * dy + 5;
  const k = easeOut(seg(t, at + 0.5, at + 0.8));
  const w = 44 + verdict.length * 10;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Draw key={i} pts={[[30, y0 + i * dy], [14, y0 + i * dy], [14, yN], [30, yN]]} t={t} from={at + i * 0.1} to={at + 0.5 + i * 0.1} stroke={C.taupe} w={1.5} />
      ))}
      <circle cx={30} cy={yN} r={7 * k} fill={C.caramel} />
      <Decode text={verdict} t={t} at={at + 0.6} x={48} y={yN + 5} s={14} f={C.caramel} w={600} />
      <Reticle x={20 + w / 2} y={yN} w={w} h={30} t={t} at={at + 1.0} />
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

// ── 1 · Duplicate, then read from each (predict, hook) ──────────────────────────────────────────
export function DupPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="dup the fd, then read from each in turn"
        lines={['let dup_raw = libc::dup(original.as_raw_fd());', 'original.read_exact(&mut first_half)?;', 'duplicate_file.read_exact(&mut second_half)?;']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 2 · Measured: continues from the shared offset (this is the swipe test's "from" step — NO takeaway) ──
export function DupReveal({ t }: StepCtx) {
  const slide = easeOut(seg(t, 0.5, 0.85));
  const dx = slide * 110;
  return (
    <Svg label="dup_shares_the_same_offset.rs: one offset, two fds" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>original reads: the first half</T>
      <circle cx={60 + dx} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>duplicate reads: the second half</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>one offset, shared, not two</T>
    </Svg>
  );
}

// ── 3 · Drop an OwnedFd, then a raw syscall (predict) ────────────────────────────────────────────
export function OwnedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="drop it, then try a raw syscall on that same number"
        lines={['drop(owned);', 'libc::fcntl(raw, F_GETFD);', '// does this still work?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: closed outright, borrow stays valid (takeaway) ────────────────────────────────
export function OwnedReveal({ t }: StepCtx) {
  const close = easeOut(seg(t, 0.5, 0.8));
  const dy = close * 20;
  return (
    <Svg label="owned_fd_closes_on_drop.rs: a real close" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>dropped OwnedFd's number: EBADF</T>
      <circle cx={260} cy={57 + dy} r={4} fill={C.cherry} opacity={1 - close * 0.6} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>a separate BorrowedFd: still valid</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>ownership decides, not the number</T>
    </Svg>
  );
}

// ── 5 · Fork and exec, clear CLOEXEC on one (predict) ────────────────────────────────────────────
export function CloexecPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="clear CLOEXEC on one, then fork and exec"
        lines={['libc::fcntl(leaked_fd, F_SETFD, 0);', 'Command::new("/bin/sh").status();', '// which fd is still open in the child?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 6 · Measured: default fd gone, leaked fd survives (takeaway) ────────────────────────────────
export function CloexecReveal({ t }: StepCtx) {
  // Two fds ride the exec into the child: the default one hits the close-on-exec gate and drops away,
  // the one with the flag cleared rolls straight through and lands inside the child.
  const go1 = easeOut(seg(t, 0.4, 0.95));
  const drop = easeOut(seg(t, 0.95, 1.4));
  const go2 = easeOut(seg(t, 1.1, 1.9));
  const chip = (x: number, y: number, label: string, o = 1, stroke: string = C.caramel) => (
    <g opacity={o} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <rect x={0} y={-14} width={92} height={26} rx={5} fill={C.roast} stroke={stroke} strokeWidth={1.5} />
      <T x={46} y={4} s={13} a="middle" f={C.crema}>{label}</T>
    </g>
  );
  return (
    <Svg label="cloexec_default_blocks_the_leak.rs: a real exec" h={230}>
      <rect x={20} y={30} width={170} height={130} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={30} y={52} s={13} f={C.taupe}>parent</T>
      <rect x={410} y={30} width={170} height={130} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <T x={420} y={52} s={13} f={C.taupe}>child</T>
      <line x1={300} y1={30} x2={300} y2={160} stroke={C.mocha} strokeDasharray="4 4" />
      <T x={300} y={22} s={13} a="middle" f={C.latte} o={fa(t, 0.2, 0.3)}>exec</T>
      {chip(lerp(48, 205, go1), 85 + drop * 55, 'default', 1 - drop, C.cherryText)}
      {chip(lerp(48, 448, go2), 128, 'cleared')}
      <T x={300} y={185} s={13} a="middle" f={C.cherryText} o={fa(t, 1.2, 0.3)}>default: gone</T>
      <Decode text="leaked" t={t} at={1.95} x={494} y={185} s={13} a="middle" f={C.caramel} w={600} />
      <Reticle x={494} y={128} w={110} h={38} t={t} at={2.2} />
      <T x={300} y={218} s={13} a="middle" f={C.latte} o={fa(t, 2.0, 0.4)}>a default working exactly as it should</T>
    </Svg>
  );
}

// ── 7 · Why any of this matters (predict) ───────────────────────────────────────────────────────
export function LimitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="every fd this chapter has opened, counted"
        lines={['// a real, long-running service', '// how many fds can it hold open at once?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · RLIMIT_NOFILE, the real ceiling (no takeaway, connecting step) ──────────────────────────
export function LimitReveal({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.2, 0.6));
  return (
    <Svg label="getrlimit(2): a real, enforced ceiling" h={160}>
      <rect x={60} y={40} width={260} height={10} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <rect x={60} y={40} width={grow * 260} height={10} rx={3} fill={C.caramel} opacity={0.7} />
      <T x={60} y={75} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>one more than the highest fd a process may hold</T>
      <T x={60} y={105} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>RLIMIT_NOFILE — exceeding it is EMFILE</T>
    </Svg>
  );
}

// ── 9 · A handle, not the resource (takeaway) ───────────────────────────────────────────────────
export function HandleReveal({ t }: StepCtx) {
  const rows = [
    'duplicated — shares the real offset',
    'dropped — closes the real resource',
    'leaked — survives exec without CLOEXEC',
  ];
  return (
    <Svg label="three behaviors, one real resource" h={220}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="one kernel resource" />
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a duplicated fd genuinely shares its offset',
    "an OwnedFd's drop genuinely closes the resource",
    'a normal fd genuinely does not leak across exec',
    'a leaked one genuinely does',
  ];
  return (
    <Svg label="recap: a shared offset, a real close, a real leak" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={140} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
