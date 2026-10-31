import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a resident entry; latte = secondary labels; taupe = a
// ghost entry (identifier only, no data) or an entry not yet touched; caramel = the thing to
// look at (the entry just hit, the target size that just grew, the low-reuse-distance set);
// cinnamon (rare) = the alternative policy being compared; cherry/cherryText = the scan's bad
// outcome for a recency-only cache (reused from topic 40's grammar).

function box(x: number, y: number, label: string, colour = C.crema, opacity = 1) {
  return (
    <g key={`${x}-${y}`} opacity={opacity}>
      <rect x={x} y={y} width={60} height={36} rx={4} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + 30} y={y + 23} s={13} a="middle" f={colour}>{label}</T>
    </g>
  );
}

// 1 · Can a cache remember something besides recency?
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const aQ = easeOut(seg(t, 1.4, 2.3));
  return (
    <Svg label="A bar showing LRU and CLOCK's hit rate dropping after a scan, beside a question about what else a cache could remember" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>measured last topic: hit rate, before and after a scan</T>
      <g opacity={a}>
        <T x={60} y={80} s={13} f={C.crema}>LRU</T>
        <Bar x={160} y={68} w={0.4667 * 300} h={14} full={300} fill={C.crema} />
        <T x={60} y={116} s={13} f={C.caramel}>LRU, after</T>
        <Bar x={160} y={104} w={0.3767 * 300} h={14} full={300} fill={C.caramel} />
        <T x={60} y={162} s={13} f={C.cinnamon}>CLOCK</T>
        <Bar x={160} y={150} w={0.4767 * 300} h={14} full={300} fill={C.cinnamon} />
        <T x={60} y={198} s={13} f={C.caramel}>CLOCK, after</T>
        <Bar x={160} y={186} w={0.3733 * 300} h={14} full={300} fill={C.caramel} />
      </g>
      <g opacity={aQ}>
        <T x={300} y={260} s={14} a="middle" f={C.latte}>recency alone missed something</T>
        <T x={300} y={288} s={14} a="middle" f={C.latte}>what else could a cache track?</T>
      </g>
    </Svg>
  );
}

// 2 · Evict the least frequently used
export function LFU({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const entries = [
    { k: 'hot', n: 'many', hot: true },
    { k: 'hot', n: 'many', hot: true },
    { k: 'scan', n: 'one', hot: false },
  ];
  return (
    <Svg label="A row of entries each labelled with a hit count, hot entries with a high count, a scan entry with a count of one" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a count per entry, not a timestamp</T>
      {entries.map((e, i) => {
        const x = 100 + i * 150;
        return (
          <g key={i} opacity={a}>
            {box(x, 100, e.k, e.hot ? C.crema : C.cherryText)}
            <T x={x + 30} y={160} s={12} a="middle" f={C.latte}>{e.n} hits</T>
          </g>
        );
      })}
      <T x={300} y={230} s={13} a="middle" f={C.caramel}>the scan entry never outranks a hot one</T>
    </Svg>
  );
}

// 3 · A rule that never forgets (predict)
export function NeverForgets({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A count that only ever rises over time, with no mechanism shown to bring it back down" h={280}>
      <g opacity={a}>
        {box(270, 90, 'count', C.crema)}
        <T x={300} y={150} s={13} a="middle" f={C.latte}>rises on every touch</T>
        <T x={300} y={175} s={13} a="middle" f={C.taupe}>nothing brings it back down</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>what goes wrong, eventually?</T>
    </Svg>
  );
}

// 4 · Decay, and Redis's real counter (takeaway)
export function Decay({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const shrink = easeOut(seg(t, 1.4, 2.6));
  return (
    <Svg label="A count bar shrinking over several decay ticks, beside a small probabilistic counter that grows more slowly as it climbs" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>a count, decaying on a timer</T>
      <g opacity={a}>
        <Bar x={100} y={70} w={(1 - shrink * 0.6) * 300} h={16} full={300} fill={C.caramel} />
        <T x={420} y={82} s={12} f={C.latte}>decay ticks</T>
      </g>
      <T x={30} y={150} s={13} f={C.latte}>a real probabilistic counter</T>
      <T x={30} y={172} s={12} f={C.taupe}>grows slower as it climbs</T>
      <T x={30} y={192} s={12} f={C.taupe}>decays on its own timer</T>
    </Svg>
  );
}

// 5 · The ghost list idea
export function GhostIdea({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A holding queue for first-time entries, feeding a smaller ghost queue of identifiers only, feeding a real cache on a second touch" h={320}>
      <g opacity={a}>
        <T x={60} y={30} s={13} f={C.latte}>holding queue</T>
        {box(60, 50, 'new', C.crema)}
        <path d="M130 68 L220 68" stroke={C.caramel} strokeWidth={1.4} fill="none" markerEnd="none" />
        <T x={240} y={30} s={13} f={C.latte}>ghost queue</T>
        {box(240, 50, 'id', C.taupe)}
        <path d="M310 68 L430 68" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="3 3" fill="none" />
        <T x={430} y={30} s={13} f={C.latte}>real cache</T>
        {box(430, 50, 'kept', C.crema)}
      </g>
      <T x={300} y={180} s={13} a="middle" f={C.latte}>a second touch, while still a ghost, earns a seat</T>
    </Svg>
  );
}

// 6 · What does a ghost entry cost? (predict)
export function GhostCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A full entry box beside a tiny identifier-only box, comparing their size" h={280}>
      <g opacity={a}>
        <T x={150} y={60} s={13} a="middle" f={C.latte}>a resident entry</T>
        <rect x={100} y={80} width={100} height={60} rx={4} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={150} y={115} s={12} a="middle" f={C.crema}>key + value</T>
        <T x={450} y={60} s={13} a="middle" f={C.latte}>a ghost entry</T>
        <rect x={430} y={95} width={40} height={30} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <T x={450} y={115} s={11} a="middle" f={C.taupe}>key</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>same question, far less memory</T>
    </Svg>
  );
}

// 7 · 2Q, measured against the same scan (takeaway)
export function TwoQReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="Scan entries flowing through the holding queue into the ghost queue without reaching the protected list, beside a flat before-and-after bar" h={340}>
      <g opacity={a}>
        {box(60, 60, 'scan', C.cherryText)}
        <path d="M130 78 L220 78" stroke={C.cherryText} strokeWidth={1.4} fill="none" />
        {box(240, 60, 'id', C.taupe)}
        <T x={270} y={40} s={12} f={C.taupe}>ghost only</T>
      </g>
      <T x={30} y={150} s={13} f={C.latte}>2Q's hot set, before and after the scan</T>
      <T x={60} y={190} s={13} f={C.crema}>no scan</T>
      <Bar x={200} y={178} w={0.48 * 300} h={14} full={300} fill={C.crema} />
      <T x={60} y={226} s={13} f={C.caramel}>after scan</T>
      <Bar x={200} y={214} w={0.50 * 300} h={14} full={300} fill={C.caramel} />
    </Svg>
  );
}

// 8 · What does a ghost hit say? (predict)
export function ArcPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="An identifier in a ghost queue being touched again, with an arrow asking what that touch implies about the list it left" h={280}>
      <g opacity={a}>
        {box(270, 70, 'id', C.taupe)}
        <T x={300} y={130} s={13} a="middle" f={C.caramel}>touched again, while still a ghost</T>
      </g>
      <T x={300} y={190} s={13} a="middle" f={C.latte}>what does that say about the list it left?</T>
    </Svg>
  );
}

// 9 · ARC adapts, by hand (takeaway)
export function ArcReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const grow = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="A target size bar growing by one step right after a ghost hit, beside the four lists ARC keeps" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>target size, before and after a ghost hit</T>
      <g opacity={a}>
        <T x={60} y={80} s={13} f={C.crema}>before</T>
        <Bar x={160} y={68} w={40} h={16} full={240} fill={C.crema} />
        <T x={60} y={126} s={13} f={C.caramel}>after</T>
        <Bar x={160} y={114} w={40 + grow * 40} h={16} full={240} fill={C.caramel} />
      </g>
      <T x={30} y={200} s={13} f={C.latte}>recent, frequent, and each one's ghost</T>
      <T x={30} y={222} s={12} f={C.taupe}>no tuning, no frequency counts</T>
    </Svg>
  );
}

// 10 · Reuse distance
export function ReuseDistance({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A loop of entries slightly larger than the cache, each entry's reuse distance marked as the number of distinct entries between two of its own uses" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>a loop, slightly bigger than the cache</T>
      {Array.from({ length: 10 }, (_, i) => {
        const a2 = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const cx = 300 + Math.cos(a2) * 100;
        const cy = 170 + Math.sin(a2) * 100;
        return <circle key={i} cx={cx} cy={cy} r={9} fill="none" stroke={i === 0 ? C.caramel : C.crema} strokeWidth={1.6} opacity={a} />;
      })}
      <T x={300} y={280} s={13} a="middle" f={C.latte}>bounded distance, whatever the loop's own pace</T>
    </Svg>
  );
}

// 11 · The measured comparison
export function Comparison({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const rows: [string, number][] = [
    ['LRU', 0.3767 / 0.4667],
    ['CLOCK', 0.3733 / 0.4767],
    ['LFU', 1.0],
    ['2Q', 1.0],
    ['ARC', 1.0],
    ['LIRS', 1.0],
  ];
  return (
    <Svg label="Six bars showing hit rate retained after the same scan: LRU and CLOCK dropping, the other four holding flat" h={360}>
      <T x={30} y={24} s={13} f={C.latte}>hit rate kept, right after the scan</T>
      {rows.map(([name, frac], i) => (
        <g key={name} opacity={a}>
          <T x={60} y={68 + i * 46} s={13} f={i < 2 ? C.cherryText : C.crema}>{name}</T>
          <Bar x={170} y={56 + i * 46} w={frac * 300} h={14} full={300} fill={i < 2 ? C.cherryText : C.crema} />
        </g>
      ))}
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Four small labels, each naming one extra thing a policy remembers beyond recency" h={300}>
      <g opacity={a}>
        <T x={90} y={90} s={13} a="middle" f={C.crema}>LFU</T>
        <T x={90} y={114} s={11} a="middle" f={C.latte}>a count</T>
        <T x={230} y={90} s={13} a="middle" f={C.crema}>2Q</T>
        <T x={230} y={114} s={11} a="middle" f={C.latte}>a ghost</T>
        <T x={370} y={90} s={13} a="middle" f={C.crema}>ARC</T>
        <T x={370} y={114} s={11} a="middle" f={C.latte}>an adapted split</T>
        <T x={510} y={90} s={13} a="middle" f={C.crema}>LIRS</T>
        <T x={510} y={114} s={11} a="middle" f={C.latte}>a distance</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.caramel}>one extra signal each, one extra cost each</T>
    </Svg>
  );
}
