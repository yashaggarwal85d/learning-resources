import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A file descriptor is a handle, not the resource itself — a duplicated one genuinely
// shares its original's offset, a dropped OwnedFd genuinely closes the real resource,
// and a leaked one genuinely survives into a child it was never meant to reach.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  return (
    <Svg label="dup_shares_the_same_offset.rs: one offset, two fds" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>original reads: the first half</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>duplicate reads: the second half</T>
      </g>
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
  return (
    <Svg label="owned_fd_closes_on_drop.rs: a real close" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>dropped OwnedFd's number: EBADF</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>a separate BorrowedFd: still valid</T>
      </g>
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
  return (
    <Svg label="cloexec_default_blocks_the_leak.rs: a real exec" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>default fd, in the child: gone</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>CLOEXEC-cleared fd: still there</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a default working exactly as it should</T>
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
  return (
    <Svg label="getrlimit(2): a real, enforced ceiling" h={160}>
      <T x={60} y={70} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>one more than the highest fd a process may hold</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>RLIMIT_NOFILE — exceeding it is EMFILE</T>
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
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
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
    <Svg label="recap: a shared offset, a real close, a real leak" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
