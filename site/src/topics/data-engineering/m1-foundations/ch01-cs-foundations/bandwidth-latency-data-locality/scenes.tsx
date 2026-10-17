import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing to look at (the pipe, the broadcast), cherry/cherryText = a
// bad outcome (window-bound stall, the expensive shuffle), taupe = quiet/waiting, latte = labels,
// crema = data, cinnamon = the alternative being compared.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · The pipe: width and length.
export function Problem({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="A network path as a pipe: its width is the bandwidth, its length is the round-trip time, and its volume is the data that must be in flight" h={300}>
      <rect x={60} y={90} width={lerp(0, 420, grow)} height={60} rx={16} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
      <T x={60} y={76} s={13} f={C.latte}>width = bandwidth (β)</T>
      <T x={480} y={200} s={13} f={C.latte} a="end">length = round-trip time</T>
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={90 + i * 50} cy={120} r={6} fill={C.caramel} opacity={clamp(grow * 8 - i)} />
      ))}
      <T x={300} y={250} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>volume: data that must be on the wire</T>
    </Svg>
  );
}

// 2 · The bandwidth-delay product.
export function BdpPipe({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="BDP equals bandwidth times round-trip time: about six hundred ten kibibytes in the same zone, about seventy one and a half mebibytes cross-region" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>same zone, 0.5 ms round trip</T>
      <rect x={25} y={54} width={40} height={26} rx={6} fill={C.caramel} opacity={a} />
      <T x={75} y={72} s={14} f={C.crema} o={a}>610 KiB</T>

      <T x={25} y={130} s={14} f={C.latte}>cross-region, 60 ms round trip</T>
      <rect x={25} y={144} width={300} height={26} rx={6} fill={C.cinnamon} opacity={b} />
      <T x={335} y={162} s={14} f={C.crema} o={b}>71.5 MiB</T>
      <T x={300} y={240} s={13} f={C.taupe} a="middle" o={b}>same link, a hundredfold more in flight</T>
    </Svg>
  );
}

// 3 · Predict: window smaller than the pipe.
export function WindowCapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const fill = answered ? 0.3 : 0.3 + 0.2 * Math.sin(t * 2);
  return (
    <Svg label="A window smaller than the pipe fills, then stalls a whole round trip waiting for an acknowledgement, leaving the pipe part empty" h={300}>
      <rect x={60} y={90} width={420} height={60} rx={16} fill={C.cocoa} stroke={C.taupe} strokeWidth={2} />
      <rect x={60} y={90} width={420 * fill} height={60} rx={16} fill={C.cherry} opacity={0.7} />
      {!answered && <T x={300} y={200} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={200} s={18} f={C.cherryText} a="middle" w={600}>capped at window ÷ round-trip time</T>}
    </Svg>
  );
}

// 4 · A sixteen-bit field caps the window at 64 KiB.
export function WindowField({ t }: StepCtx) {
  const N = 16;
  const bits = easeOut(seg(t, 0.3, 1.6));
  const scale = easeOut(seg(t, 2.0, 3.2));
  return (
    <Svg label="A sixteen-bit field tops out at sixty five thousand five hundred thirty five bytes, sixty four kibibytes; window scaling lifts the ceiling to one gibibyte" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>receive window field, 16 bits</T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={25 + i * 32} y={48} width={26} height={26} rx={4} fill={i < bits * N ? C.caramel : C.cocoa} />
      ))}
      <T x={300} y={120} s={22} f={C.caramel} a="middle" w={700} o={bits}>65,535 B = 64 KiB max</T>
      <T x={300} y={190} s={15} f={C.crema} a="middle" o={scale}>window scaling: shift up to 14</T>
      <T x={300} y={220} s={18} f={C.caramel} a="middle" w={700} o={scale}>ceiling lifts to 1 GiB</T>
    </Svg>
  );
}

// 5 · Latency and throughput are different axes.
export function LatencyThroughputAxes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="Latency is fixed by distance and cannot be bought down; throughput can be bought up by widening the pipe or running more at once" h={300}>
      <T x={160} y={60} s={15} f={C.latte} a="middle">latency</T>
      <circle cx={160} cy={120} r={40} fill="none" stroke={C.cherry} strokeWidth={3} opacity={a} />
      <T x={160} y={190} s={13} f={C.cherryText} a="middle" o={a}>fixed by distance</T>

      <T x={440} y={60} s={15} f={C.latte} a="middle">throughput</T>
      <rect x={400} y={100} width={80 + 60 * b} height={40} rx={10} fill={C.caramel} opacity={b} />
      <T x={440} y={190} s={13} f={C.crema} a="middle" o={b}>bought up with more</T>
      <T x={300} y={250} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>Little&rsquo;s law: in-flight = throughput × latency</T>
    </Svg>
  );
}

// 6 · Predict: one stream or ten?
export function StreamsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const N = 10;
  return (
    <Svg label="One stream has far too little in flight to fill a long pipe; ten streams each with a slice of the window sum to the whole bandwidth-delay product" h={300}>
      <T x={25} y={40} s={13} f={C.latte}>one stream</T>
      <rect x={25} y={54} width={40} height={26} rx={6} fill={C.cherry} />
      <T x={25} y={130} s={13} f={C.latte}>ten streams</T>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.08, 0.5 + i * 0.08));
        return <rect key={i} x={25 + i * 44} y={144} width={36} height={26} rx={5} fill={C.caramel} opacity={clamp(a)} />;
      })}
      {answered && <T x={300} y={240} s={16} f={C.caramel} a="middle" w={600}>ten streams: easily first</T>}
    </Svg>
  );
}

// 7 · The cheapest byte is the one never sent.
export function DataLocality({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Sending the computation to the machine holding the data beats sending the data across the network; pushdown shrinks the bytes before any transfer" h={300}>
      <circle cx={150} cy={130} r={50} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={150} y={135} s={13} f={C.crema} a="middle" o={a}>data</T>
      <path d="M230 130 L350 130" stroke={C.caramel} strokeWidth={3} opacity={a} markerEnd="none" />
      <circle cx={400} cy={130} r={20} fill={C.caramel} opacity={a} />
      <T x={400} y={135} s={11} f={C.espresso} a="middle" w={600} o={a}>job</T>
      <T x={300} y={220} s={14} f={C.crema} a="middle" o={b}>compute travels; the big bytes stay put</T>
    </Svg>
  );
}

// 8 · The shop join, repriced in time.
export function JoinReprice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  const b = easeOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="Shuffling both sides sends about nine hundred ninety gigabytes, about eight seconds per machine; broadcasting the small side sends about nine point nine gigabytes, about eight hundredths of a second" h={320}>
      <T x={25} y={40} s={14} f={C.latte}>shuffle, 100 machines</T>
      <rect x={25} y={54} width={420 * a} height={30} rx={7} fill={C.cherry} />
      <T x={25} y={110} s={16} f={C.cherryText} o={a}>≈ 990 GB · ≈ 8 s per machine</T>

      <T x={25} y={176} s={14} f={C.latte}>broadcast, 100 machines</T>
      <rect x={25} y={190} width={Math.max(4, 420 * a * 0.01)} height={30} rx={7} fill={C.caramel} />
      <T x={25} y={246} s={16} f={C.caramel} o={b}>≈ 9.9 GB · ≈ 0.08 s per machine</T>
      <T x={300} y={300} s={14} f={C.crema} a="middle" o={b}>same join, a hundred times less traffic</T>
    </Svg>
  );
}

// 9 · Predict: shuffle vs broadcast, in dollars.
export function DollarPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="At a penny per gigabyte each direction, the shuffle costs about twenty dollars and the broadcast about twenty cents, a hundred to one" h={300}>
      {!answered && <T x={300} y={130} s={46} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={160} y={100} s={14} f={C.latte} a="middle">shuffle</T>
          <T x={160} y={140} s={28} f={C.cherryText} a="middle" w={700}>$20</T>
          <T x={440} y={100} s={14} f={C.latte} a="middle">broadcast</T>
          <T x={440} y={140} s={28} f={C.caramel} a="middle" w={700}>$0.20</T>
          <T x={300} y={210} s={14} f={C.crema} a="middle">a hundred to one: the exact byte ratio</T>
        </>
      )}
    </Svg>
  );
}

// 10 · Back to the shop: the meter is a design constraint.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { label: 'inside one zone', value: 'free', color: C.caramel },
    { label: 'across zones', value: 'metered, each direction', color: C.cinnamon },
    { label: 'out to the internet', value: 'metered, one way', color: C.cherry },
  ];
  return (
    <Svg label="Traffic inside one zone is free, across zones is metered each direction, and out to the internet is metered one way: data gravity pins compute to storage" h={280}>
      {rows.map((r, i) => {
        const o = easeOut(seg(t, 0.2 + i * 0.4, 0.8 + i * 0.4));
        return (
          <g key={r.label} opacity={o}>
            <T x={25} y={56 + i * 56} s={15} f={C.latte}>{r.label}</T>
            <T x={25} y={82 + i * 56} s={17} f={r.color} w={600}>{r.value}</T>
          </g>
        );
      })}
    </Svg>
  );
}
