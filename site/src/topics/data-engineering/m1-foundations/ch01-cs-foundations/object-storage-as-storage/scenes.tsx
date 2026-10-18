import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing to look at (the device, the fix), cherry/cherryText = a bad outcome
// (torn write, slow-down, refused writer), taupe = quiet/waiting, latte = labels, crema = data, cinnamon = the alternative.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · Near-unlimited capacity, at a price.
export function Problem({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.2, 1.6));
  const cost = easeOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="Object storage trades the microseconds of a local disk for near-unlimited capacity, at tens to hundreds of milliseconds per request" h={360}>
      <T x={300} y={36} s={14} f={C.latte} a="middle">capacity</T>
      <rect x={60} y={50} width={lerp(40, 480, grow)} height={30} rx={8} fill={C.caramel} opacity={0.85} />
      <T x={60} y={100} s={13} f={C.taupe}>near-unlimited · cheap · durable</T>

      <T x={300} y={176} s={30} f={C.crema} a="middle" serif>vs</T>

      <T x={300} y={230} s={14} f={C.latte} a="middle">one request&rsquo;s latency</T>
      <rect x={60} y={246} width={30} height={30} rx={6} fill={C.taupe} />
      <T x={110} y={267} s={13} f={C.taupe}>local disk: microseconds</T>
      <rect x={60} y={296} width={lerp(0, 420, cost)} height={30} rx={6} fill={C.cherry} />
      <T x={575} y={318} s={13} f={C.cherryText} a="end" o={cost}>object store: tens–hundreds of ms</T>
    </Svg>
  );
}

// 2 · A flat namespace, not a filesystem.
export function FlatNamespace({ t }: StepCtx) {
  const key = 'events/part.parquet';
  const chars = Math.floor(seg(t, 0.2, 1.4) * key.length);
  const puts = easeOut(seg(t, 1.8, 2.6));
  const copyDel = easeOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="A key is a plain string mapping to a blob; writes replace the whole object, and moving one is copy then delete, two steps" h={360}>
      <T x={25} y={36} s={14} f={C.latte}>key (just a string)</T>
      <rect x={25} y={50} width={420} height={34} rx={8} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
      <T x={40} y={73} s={14} f={C.crema}>{key.slice(0, chars)}</T>
      <T x={25} y={110} s={13} f={C.taupe}>no folders: the slashes are just characters</T>

      <T x={25} y={166} s={14} f={C.latte} o={puts}>PUT replaces the whole object</T>
      <rect x={25} y={180} width={160} height={30} rx={7} fill={C.cocoa} opacity={puts} />
      <T x={105} y={200} s={13} f={C.crema} a="middle" o={puts}>object v1</T>
      <rect x={220} y={180} width={160} height={30} rx={7} fill={C.caramel} opacity={puts} />
      <T x={300} y={200} s={13} f={C.espresso} a="middle" o={puts} w={600}>object v2</T>

      <T x={25} y={246} s={14} f={C.latte} o={copyDel}>moving one: copy, then delete</T>
      <rect x={25} y={260} width={120} height={28} rx={6} fill={C.cinnamon} opacity={copyDel} />
      <T x={85} y={279} s={12} f={C.crema} a="middle" o={copyDel}>copy</T>
      <rect x={165} y={260} width={120} height={28} rx={6} fill={C.cherry} opacity={copyDel} />
      <T x={225} y={279} s={12} f={C.crema} a="middle" o={copyDel}>delete</T>
      <T x={320} y={279} s={13} f={C.cherryText} o={copyDel}>two steps, not one</T>
    </Svg>
  );
}

// 3 · Strong read-after-write, since 2020.
export function Consistency({ t }: StepCtx) {
  const before = seg(t, 0.3, 1.4);
  const after = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Before December 2020 a read could see a stale copy after a write; since then every read-after-write is strongly consistent" h={360}>
      <T x={25} y={36} s={14} f={C.latte}>before</T>
      <rect x={25} y={50} width={120} height={30} rx={7} fill={C.caramel} />
      <T x={85} y={70} s={12} f={C.espresso} a="middle" w={600}>PUT</T>
      <rect x={200} y={50} width={120} height={30} rx={7} fill={C.taupe} opacity={0.5 + 0.5 * Math.sin(before * 6)} />
      <T x={260} y={70} s={12} f={C.crema} a="middle">GET → old?</T>

      <T x={25} y={146} s={14} f={C.latte}>since 2020</T>
      <rect x={25} y={160} width={120} height={30} rx={7} fill={C.caramel} opacity={after} />
      <T x={85} y={180} s={12} f={C.espresso} a="middle" w={600} o={after}>PUT</T>
      <rect x={200} y={160} width={120} height={30} rx={7} fill={C.caramel} opacity={after} />
      <T x={260} y={180} s={12} f={C.espresso} a="middle" w={600} o={after}>GET → new</T>
      <line x1={145} y1={175} x2={195} y2={175} stroke={C.caramel} strokeWidth={2.5} opacity={after} />

      <T x={300} y={246} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>a racing read: the old object, or the new,</T>
      <T x={300} y={268} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>never a torn mix</T>
      <T x={300} y={300} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>still not atomic: swapping two keys at once</T>
    </Svg>
  );
}

// 4 · The cost of one request: alpha + n/beta.
export function CostShape({ t }: StepCtx) {
  const bar = easeOut(seg(t, 0.2, 1.2));
  const pct = easeOut(seg(t, 1.8, 3.2));
  const ticks = [
    { label: 'p50', x: 90 },
    { label: 'p99', x: 300 },
    { label: 'p99.9', x: 480 },
  ];
  return (
    <Svg label="A fixed latency of roughly 100 to 200 milliseconds, plus bytes over bandwidth; latency is a distribution, so percentiles matter" h={360}>
      <T x={25} y={40} s={14} f={C.latte}>latency, small object</T>
      <rect x={25} y={54} width={420} height={28} rx={7} fill={C.cocoa} />
      <rect x={25} y={54} width={420 * bar} height={28} rx={7} fill={C.caramel} />
      <T x={455} y={74} s={14} f={C.crema} o={bar}>100–200 ms</T>

      <T x={25} y={150} s={14} f={C.latte}>the same latency, as a distribution</T>
      <path d="M30 230 Q 150 90 300 220 T 560 230" stroke={C.taupe} strokeWidth={2} fill="none" opacity={pct} />
      {ticks.map((tk) => (
        <g key={tk.label} opacity={pct}>
          <line x1={tk.x} y1={160} x2={tk.x} y2={236} stroke={C.cinnamon} strokeDasharray="3 5" />
          <T x={tk.x} y={254} s={13} f={C.cinnamon} a="middle">{tk.label}</T>
        </g>
      ))}
      <T x={300} y={300} s={14} f={C.crema} a="middle" o={pct}>a job waiting on many requests waits on a slow one</T>
    </Svg>
  );
}

// 5 · Predict: where does waiting equal transferring?
export function AlphaBetaPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const grow = answered ? 1 : 0.5 + 0.4 * Math.sin(t * 1.8);
  return (
    <Svg label="A seesaw between waiting out the request's latency and transferring its bytes, balancing near nine megabytes" h={320}>
      <T x={25} y={40} s={14} f={C.latte}>waiting (α)</T>
      <rect x={25} y={54} width={160} height={28} rx={7} fill={C.cherry} />
      <T x={25} y={116} s={14} f={C.latte}>transferring (n / β)</T>
      <rect x={25} y={130} width={Math.max(10, 160 * grow)} height={28} rx={7} fill={C.caramel} />
      {!answered && <T x={300} y={220} s={60} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={300} y={210} s={34} f={C.caramel} a="middle" w={700}>9 MB</T>
          <T x={300} y={246} s={14} f={C.crema} a="middle">α · β: a tenth of a second times 90 MB/s</T>
          <T x={300} y={274} s={13} f={C.taupe} a="middle">AWS&rsquo;s own range sizes: 8 or 16 MB</T>
        </>
      )}
    </Svg>
  );
}

// 6 · Predict: how many requests fill the link?
export function ConcurrencyPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const N = 14;
  const lit = answered ? N : Math.floor(((t * 2) % (N + 2)));
  return (
    <Svg label="Many ninety-megabyte-per-second requests side by side, filling a ten-gigabit link; the count settles at fourteen" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>requests at 90 MB/s each, filling a 10 Gbit/s link</T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={25 + i * 38} y={50} width={30} height={60} rx={6} fill={i < lit ? C.caramel : C.cocoa} opacity={i < lit ? 1 : 0.5} />
      ))}
      {answered ? (
        <>
          <T x={300} y={180} s={34} f={C.caramel} a="middle" w={700}>14 requests</T>
          <T x={300} y={214} s={14} f={C.crema} a="middle">1,250 MB/s ÷ 90 MB/s</T>
          <T x={300} y={246} s={13} f={C.taupe} a="middle">no bucket bandwidth cap: add requests, then add machines</T>
        </>
      ) : (
        <T x={300} y={180} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      )}
    </Svg>
  );
}

// 7 · Each prefix has its own ceiling.
export function PrefixLimits({ t }: StepCtx) {
  const fillA = easeOut(seg(t, 0.3, 1.4));
  const fillB = easeOut(seg(t, 1.6, 2.6));
  const slow = easeOutBack(seg(t, 2.8, 3.6));
  return (
    <Svg label="Each prefix tolerates thousands of writes and reads a second; past that it answers five oh three, slow down, while it repartitions" h={340}>
      <T x={25} y={36} s={14} f={C.latte}>prefix: writes per second</T>
      <rect x={25} y={50} width={300} height={26} rx={6} fill={C.cocoa} />
      <rect x={25} y={50} width={300 * fillA} height={26} rx={6} fill={C.caramel} />
      <T x={335} y={70} s={14} f={C.crema} o={fillA}>3,500</T>

      <T x={25} y={116} s={14} f={C.latte}>prefix: reads per second</T>
      <rect x={25} y={130} width={300} height={26} rx={6} fill={C.cocoa} />
      <rect x={25} y={130} width={300 * fillB} height={26} rx={6} fill={C.cinnamon} />
      <T x={335} y={150} s={14} f={C.crema} o={fillB}>5,500</T>

      <g transform={`translate(300 240) scale(${slow})`} opacity={clamp(slow)}>
        <rect x={-110} y={-26} width={220} height={52} rx={26} fill={C.roast} stroke={C.cherry} strokeWidth={2} />
        <T x={0} y={6} s={18} f={C.cherryText} a="middle" w={600}>503 slow down</T>
      </g>
      <T x={300} y={300} s={13} f={C.taupe} a="middle" o={clamp(slow)}>back-pressure, not a bug: spread keys across prefixes</T>
    </Svg>
  );
}

// 8 · A range GET reads just a slice.
export function RangeGet({ t }: StepCtx) {
  const N = 30, hit = 3;
  const footer = easeOut(seg(t, 0.2, 0.9));
  const scan = easeOut(seg(t, 1.2, 2.8));
  return (
    <Svg label="A columnar object's footer is read first, then only the needed column chunks: three of thirty columns moves about a tenth of the bytes" h={340}>
      <T x={25} y={34} s={14} f={C.latte}>object, columns laid out, footer at the end</T>
      {Array.from({ length: N }, (_, i) => {
        const want = i % 10 === 2;
        const lit = want && scan > i / N;
        return <rect key={i} x={25 + i * 17} y={50} width={13} height={60} rx={3} fill={lit ? C.caramel : C.cocoa} opacity={lit ? 1 : 0.6} />;
      })}
      <rect x={25 + N * 17 + 6} y={50} width={20} height={60} rx={4} fill={C.cinnamon} opacity={footer} />
      <T x={25 + N * 17 + 16} y={128} s={11} f={C.taupe} a="middle" o={footer}>footer</T>
      <T x={300} y={170} s={14} f={C.crema} a="middle" o={scan}>3 of 30 columns needed</T>
      <T x={300} y={200} s={20} f={C.caramel} a="middle" w={700} o={scan}>≈ a tenth of the bytes</T>
    </Svg>
  );
}

// 9 · Large objects upload in parts.
export function MultipartUpload({ t }: StepCtx) {
  const N = 10;
  const r = rng(3);
  const order = Array.from({ length: N }, (_, i) => i).sort(() => r() - 0.5);
  const done = (i: number) => t > 0.3 + order.indexOf(i) * 0.28;
  const assembled = easeOut(seg(t, 3.2, 4.0));
  return (
    <Svg label="A large object splits into up to ten thousand parts, uploaded in parallel and assembled by one final call; our terabyte needs parts near one hundred and five mebibytes" h={360}>
      <T x={25} y={34} s={14} f={C.latte}>parts, uploading out of order, in parallel</T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={25 + i * 46} y={50} width={38} height={38} rx={6} fill={done(i) ? C.caramel : C.cocoa} opacity={done(i) ? 1 : 0.5} />
      ))}
      <T x={25} y={128} s={13} f={C.taupe}>up to 10,000 parts, 5 MiB to 5 GiB each</T>

      <rect x={25} y={160 + 40 * (1 - assembled)} width={430} height={40} rx={8} fill={C.cinnamon} opacity={assembled} />
      <T x={240} y={186 + 40 * (1 - assembled)} s={14} f={C.espresso} a="middle" w={600} o={assembled}>assembled into one object</T>
      <T x={300} y={266} s={13} f={C.taupe} a="middle" o={easeOut(seg(t, 3.6, 4.2))}>nothing visible under the key until this finishes</T>
      <T x={300} y={300} s={18} f={C.caramel} a="middle" w={700} o={easeOut(seg(t, 3.8, 4.4))}>1 TiB ÷ 10,000 parts ≈ 105 MiB minimum</T>
    </Svg>
  );
}

// 10 · Predict: two writers, one key.
export function ConditionalWrite({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const raceA = easeOut(seg(t, 0.2, 1.2));
  const raceB = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Two writers race to create the same key with a create-only precondition; exactly one succeeds, the other is refused" h={340}>
      <T x={25} y={40} s={14} f={C.latte}>writer A</T>
      <rect x={25} y={54} width={lerp(0, 220, raceA)} height={28} rx={7} fill={answered ? C.caramel : C.taupe} />
      <T x={25} y={110} s={14} f={C.latte}>writer B</T>
      <rect x={25} y={124} width={lerp(0, 220, raceB)} height={28} rx={7} fill={answered ? C.cherry : C.taupe} />
      <rect x={270} y={75} width={100} height={60} rx={10} fill={C.roast} stroke={C.mocha} />
      <T x={320} y={110} s={13} f={C.crema} a="middle">key: absent</T>
      {answered && (
        <>
          <T x={300} y={220} s={16} f={C.caramel} a="middle" w={600}>A: write succeeds</T>
          <T x={300} y={250} s={16} f={C.cherryText} a="middle" w={600}>B: precondition failed</T>
        </>
      )}
    </Svg>
  );
}

// 11 · Back to the tier: count requests, not bytes.
export function Verdict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const b = easeOut(seg(t, 1.1, 1.9));
  const c = easeOut(seg(t, 2.0, 2.8));
  const rows = [
    { label: 'size each range near', value: '9 MB', color: C.caramel, o: a },
    { label: 'run at once, per link', value: '14 requests', color: C.cinnamon, o: b },
    { label: 'minimum part, this upload', value: '105 MiB', color: C.cherry, o: c },
  ];
  return (
    <Svg label="Three settled numbers for the tier: size ranges near nine megabytes, run about fourteen requests to fill a link, and this upload's parts near one hundred and five mebibytes" h={320}>
      {rows.map((r, i) => (
        <g key={r.label} opacity={r.o} transform={`translate(0 ${(1 - r.o) * 10})`}>
          <T x={25} y={70 + i * 80} s={15} f={C.latte}>{r.label}</T>
          <T x={25} y={104 + i * 80} s={26} f={r.color} w={700}>{r.value}</T>
        </g>
      ))}
    </Svg>
  );
}
