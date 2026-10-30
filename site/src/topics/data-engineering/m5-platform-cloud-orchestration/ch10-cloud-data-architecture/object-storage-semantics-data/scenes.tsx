import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, SERIF, Stack, Svg, T, Bar } from '../../../../../reels/kit';

// Every number shown here is executed and checked by examples.py.

function ClientBox({ x, y, label, status, bad }: { x: number; y: number; label: string; status?: string; bad?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={240} height={70} rx={8} fill="none" stroke={bad ? C.bad : C.mocha} strokeWidth={bad ? 3 : 2} />
      <T x={x + 20} y={y + 28} s={14} f={C.crema} serif>{label}</T>
      {status && <T x={x + 20} y={y + 54} s={14} f={bad ? C.badText : C.caramel} w={700}>{status}</T>}
    </g>
  );
}

// 1 · Hook: two clients both write the same key; no error, one write vanishes.
export function TwoWritersOneKey({ t }: StepCtx) {
  const bothWrote = t > 1.2;
  const overwritten = t > 2.4;
  return (
    <Stack>
      <Svg label="Two clients both check a key, both find it absent, and both write it; the second write silently overwrites the first" h={340}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>One key, two writers</T>
        <ClientBox x={30} y={60} label="Client A: key absent, PUT" status={bothWrote ? 'HTTP 200' : undefined} />
        <ClientBox x={330} y={60} label="Client B: key absent, PUT" status={bothWrote ? 'HTTP 200' : undefined} />
        <rect x={150} y={180} width={300} height={60} rx={8} fill="none" stroke={overwritten ? C.bad : C.mocha} strokeWidth={2} />
        <T x={300} y={205} s={14} a="middle" f={C.taupe} serif>the key, as stored</T>
        <T x={300} y={228} s={14} a="middle" f={overwritten ? C.badText : C.latte} w={700}>
          {overwritten ? "B's write — A's write is gone" : 'absent'}
        </T>
        <T x={300} y={280} s={13} a="middle" f={C.taupe}>no exception, no warning, from either client</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which guarantee closes this gap?
export function WhichGuaranteeCloses({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A precondition badge attaches to the second write and it flips from succeeding to a rejected precondition, with the first write staying intact" h={320}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Same race, a precondition attached</T>
        <ClientBox x={30} y={60} label="Client A: PUT, no condition" status="HTTP 200" />
        <ClientBox
          x={330}
          y={60}
          label={revealed ? 'Client B: PUT, if-none-match' : 'Client B: PUT, no condition'}
          status={revealed ? 'rejected' : undefined}
          bad={revealed}
        />
        <rect x={150} y={180} width={300} height={60} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={205} s={14} a="middle" f={C.taupe} serif>the key, as stored</T>
        <T x={300} y={228} s={14} a="middle" f={C.caramel} w={700}>A&apos;s write — intact</T>
      </Svg>
    </Stack>
  );
}

// 3 · What strong consistency promised, and when.
export function ConsistencyTimeline({ t }: StepCtx) {
  const after = clamp(seg(t, 0.3, 1));
  return (
    <Stack>
      <Svg label="Before December two thousand twenty, a read right after a write could be stale; since then every read or list request on S3 immediately reflects the most recent write" h={320}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Strong consistency, before and after</T>

        <rect x={60} y={60} width={480} height={54} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={80} y={92} s={14} a="start" f={C.latte} serif>before Dec 2020</T>
        <T x={520} y={92} s={14} a="end" f={C.badText} w={700}>a list could miss it</T>

        <rect x={60} y={128} width={480} height={54} rx={8} fill="none" stroke={after > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={80} y={160} s={14} a="start" f={C.latte} serif>since Dec 2020</T>
        <T x={520} y={160} s={14} a="end" f={after > 0.5 ? C.caramel : C.latte} w={700}>always current</T>

        <T x={300} y={220} s={13} a="middle" f={C.taupe}>a single key&apos;s own read was never the hard case</T>
        <T x={300} y={250} s={14} a="middle" f={C.latte} serif>at no additional cost</T>
      </Svg>
    </Stack>
  );
}

// 4 · One PUT is atomic; a rename never was, unless the store has a hierarchy.
export function AtomicPutVsRename({ t }: StepCtx) {
  const showCopy = t > 1.5;
  const showHns = t > 3;
  return (
    <Stack>
      <Svg label="A single PUT is one indivisible operation; a rename on a flat store is a copy then a delete with a real gap between them; a hierarchical namespace updates one directory entry instead" h={380} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>One key, versus two</T>
        <rect x={40} y={50} width={160} height={70} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={120} y={80} s={13} a="middle" f={C.crema} serif>single PUT</T>
        <T x={120} y={102} s={13} a="middle" f={C.caramel} w={700}>atomic</T>

        <rect x={230} y={50} width={160} height={70} rx={8} fill="none" stroke={showCopy ? C.bad : C.mocha} strokeWidth={2} />
        <T x={310} y={76} s={13} a="middle" f={C.crema} serif>copy, delete</T>
        <T x={310} y={98} s={13} a="middle" f={showCopy ? C.badText : C.latte} w={700}>{showCopy ? 'both keys exist' : 'two operations'}</T>

        <rect x={420} y={50} width={150} height={70} rx={8} fill="none" stroke={showHns ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={495} y={76} s={13} a="middle" f={C.crema} serif>ADLS Gen2</T>
        <T x={495} y={98} s={13} a="middle" f={showHns ? C.caramel : C.latte} w={700}>one entry</T>

        <T x={300} y={170} s={13} a="middle" f={C.taupe}>updates are key-based — no way to make one key&apos;s write depend on another&apos;s</T>
        <T x={300} y={200} s={13} a="middle" f={C.taupe}>unless the application builds that itself</T>
      </Svg>
    </Stack>
  );
}

// 5 · Conditional writes: create-if-absent, and update-if-unchanged.
export function ConditionalLock({ t }: StepCtx) {
  const race = t > 1.2;
  const lease = t > 3.2;
  return (
    <Stack>
      <Svg label="Two clients race to create the same key with if-none-match; the first succeeds, the second is rejected. A lease key renewed with if-match rejects a stale holder" h={380} fill>
        <T x={300} y={26} s={16} a="middle" f={C.taupe} serif>A key, used as a lock</T>
        <T x={150} y={54} s={13} a="middle" f={C.latte} serif>create-if-absent</T>
        <ClientBox x={30} y={64} label="Writer A: if-none-match" status={race ? 'created' : undefined} />
        <ClientBox x={30} y={144} label="Writer B: if-none-match" status={race ? 'rejected' : undefined} bad={race} />

        <T x={450} y={54} s={13} a="middle" f={C.latte} serif>update-if-unchanged</T>
        <ClientBox x={330} y={64} label="Holder: renews lease" status={lease ? 'renewed' : undefined} />
        <ClientBox x={330} y={144} label="Stale holder: renews lease" status={lease ? 'rejected' : undefined} bad={lease} />

        <T x={300} y={250} s={13} a="middle" f={C.taupe}>both checks run inside the store, at write time — not inside either client</T>
      </Svg>
    </Stack>
  );
}

// 6 · A hot key range throttles, even though the bucket has no limit.
export function HotPrefixThrottle({ t }: StepCtx) {
  const writeRate = 3500;
  const burst = 4000;
  const throttledSingle = burst - writeRate;
  const fillSingle = easeOut(seg(t, 0.2, 1));
  const fillSharded = easeOut(seg(t, 1.2, 2));
  return (
    <Stack>
      <Svg label="A burst of four thousand requests against one prefix throttles five hundred of them; the same burst spread across four prefixes throttles none" h={300}>
        <T x={40} y={34} s={14} f={C.taupe}>One prefix, {burst.toLocaleString('en-US')} requests/sec, baseline {writeRate.toLocaleString('en-US')}/sec</T>
        <Bar x={40} y={50} w={520 * fillSingle} h={24} full={520} fill={fillSingle > 0.85 ? C.bad : C.second} />
        <T x={40} y={100} s={13} f={C.badText} w={700}>{Math.round(throttledSingle * fillSingle).toLocaleString('en-US')} requests get 503 Slow Down</T>

        <T x={40} y={150} s={14} f={C.taupe}>Same requests, spread across four prefixes</T>
        <Bar x={40} y={166} w={520 * fillSharded} h={24} full={520} fill={C.second} />
        <T x={40} y={216} s={13} f={C.caramel} w={700}>zero requests throttled</T>
      </Svg>
    </Stack>
  );
}

// 7 · Recap.
export function Recap(_: StepCtx) {
  const lines = [
    'Strong consistency on every read or list, since Dec 2020.',
    'One key is atomic; a rename never is, without a hierarchy.',
    'A conditional write is compare-and-swap; a hot prefix throttles alone.',
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

// 8 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A client holds a tag it read three refreshes ago; the key has been written twice since by someone else; its conditional write is checked against the key's current tag, not the client's memory of it" h={300}>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>One client, two writes it never saw</T>
        <ClientBox x={30} y={70} label="Client: holds an old tag" />
        <rect x={330} y={70} width={240} height={110} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={450} y={96} s={13} a="middle" f={C.latte} serif>the key, since the client read it</T>
        <T x={450} y={122} s={13} a="middle" f={C.caramel} w={700}>written by someone else</T>
        <T x={450} y={146} s={13} a="middle" f={C.caramel} w={700}>written again, by someone else</T>
        <T x={300} y={230} s={14} a="middle" f={revealed ? C.badText : C.taupe} w={700}>
          {revealed ? "client's write: rejected, stale tag" : 'client now writes, if-match: old tag'}
        </T>
      </Svg>
    </Stack>
  );
}
