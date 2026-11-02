import { C, Svg, T, Draw, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end">
        {value}
      </T>
    </g>
  );
}

const LIVE_Y = 110;

export function Hook({ t }: StepCtx) {
  const dots = [80, 150, 220, 290, 360, 430, 500];
  return (
    <Svg label="one feature in twenty disagrees. Both code paths look correct." h={220}>
      <line x1={40} y1={LIVE_Y} x2={560} y2={LIVE_Y} stroke={C.line} strokeWidth={1.5} />
      {dots.map((x, i) => {
        const bad = i === 2 || i === 5;
        const k = easeOut(seg(t, 0.1 + i * 0.1, 0.1 + i * 0.1 + 0.2));
        return <circle key={x} cx={x} cy={LIVE_Y} r={5} fill={bad ? C.cherry : C.focus} opacity={k} />;
      })}
      <T x={300} y={170} s={13} f={C.taupe} a="middle" w={600}>
        a fraud model's offline and served vectors, compared
      </T>
    </Svg>
  );
}

export function PredictWhatLoggingBuys({ t }: StepCtx) {
  return (
    <Svg label="read the code again, or diff two logged numbers. Which finds it?" h={220}>
      <Row y={60} label="reading the code" value="finds nothing new" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="logging the served vector" value="?" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
    </Svg>
  );
}

export function RevealLoggingMechanism({ t }: StepCtx) {
  const tapX = 300;
  return (
    <Svg label="a log point after the transformation, not before it." h={240}>
      <rect x={210} y={30} width={180} height={40} rx={6} fill={C.panel} stroke={C.line} />
      <T x={300} y={54} s={13} f={C.crema} a="middle">
        transformation
      </T>
      <Draw pts={[[300, 70], [300, 100]]} t={t} from={0.2} to={0.4} stroke={C.focus} w={2} />
      <circle cx={tapX} cy={100} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.6))} />
      <Draw pts={[[300, 100], [300, 140]]} t={t} from={0.4} to={0.6} stroke={C.focus} w={2} />
      <Draw pts={[[300, 100], [460, 140], [460, 180]]} t={t} from={0.5} to={0.8} stroke={C.taupe} w={1.5} />
      <rect x={400} y={185} width={120} height={28} rx={4} fill={C.cocoa} opacity={easeOut(seg(t, 0.8, 1))} />
      <T x={460} y={204} s={11} f={C.crema} a="middle" opacity={easeOut(seg(t, 0.8, 1))}>
        vector, version, id
      </T>
      <T x={150} y={204} s={12} f={C.taupe} a="middle" w={200}>
        raw input: not logged
      </T>
    </Svg>
  );
}

export function RevealLogAndWaitJoin({ t }: StepCtx) {
  return (
    <Svg label="a label arrives weeks later. Join by request id, no recomputation." h={220}>
      <T x={100} y={40} s={12} f={C.taupe} a="middle">
        logged row
      </T>
      <rect x={40} y={55} width={120} height={28} rx={4} fill={C.cocoa} />
      <T x={100} y={74} s={11} f={C.crema} a="middle">
        vector + version
      </T>
      <T x={500} y={40} s={12} f={C.taupe} a="middle">
        delayed label
      </T>
      <rect x={440} y={55} width={120} height={28} rx={4} fill={C.cocoa} />
      <T x={500} y={74} s={11} f={C.crema} a="middle">
        churned: yes
      </T>
      <Draw pts={[[160, 69], [500, 69]]} t={t} from={0.3} to={0.8} stroke={C.focus} w={1.5} />
      <Reticle x={330} y={69} w={30} h={30} t={t} at={0.8} color={C.focus} />
      <T x={300} y={140} s={12} f={C.taupe} a="middle" w={500}>
        joined by request id — one logged number, reused
      </T>
    </Svg>
  );
}

export function RevealShadowVsCanary({ t }: StepCtx) {
  return (
    <Svg label="both log the same way. Only one reaches the decision." h={220}>
      <line x1={40} y1={50} x2={560} y2={50} stroke={C.line} strokeWidth={1.5} />
      <T x={30} y={54} s={11} f={C.taupe}>
        live
      </T>
      <rect x={500} y={35} width={50} height={30} rx={4} fill={C.panel} stroke={C.focus} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <line x1={40} y1={100} x2={560} y2={100} stroke={C.line} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
      <T x={30} y={104} s={11} f={C.taupe}>
        shadow
      </T>
      <rect x={500} y={85} width={50} height={30} rx={4} fill="none" stroke={C.taupe} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.4, 0.6))} />
      <line x1={40} y1={150} x2={560} y2={150} stroke={C.line} strokeWidth={1.5} opacity={0.5} />
      <T x={30} y={154} s={11} f={C.taupe}>
        canary
      </T>
      <rect x={500} y={135} width={50} height={30} rx={4} fill={C.panel} stroke={C.focus} opacity={easeOut(seg(t, 0.6, 0.8))} />
      <T x={525} y={54} s={9} f={C.crema} a="middle">
        decides
      </T>
      <T x={525} y={104} s={9} f={C.taupe} a="middle">
        unused
      </T>
      <T x={525} y={154} s={9} f={C.crema} a="middle">
        decides
      </T>
    </Svg>
  );
}

export function PredictStorageCost({ t }: StepCtx) {
  return (
    <Svg label="one million requests a day, two kilobytes each. How much a year?" h={220}>
      <Row y={60} label="requests per day" value="one million" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="vector size" value="two kilobytes" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="a year of logs" value="?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealStorageMeasured({ t }: StepCtx) {
  const n = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="rate times width times retention, measured." h={200}>
      <T x={25} y={40} s={14} f={C.latte}>
        logged bytes, accumulating over a year
      </T>
      <rect x={25} y={55} width={520} height={28} rx={4} fill={C.cocoa} />
      <rect x={25} y={55} width={520 * n} height={28} rx={4} fill={C.focus} opacity={0.85} />
      <T x={575} y={102} s={14} f={C.taupe} a="end">
        measured total
      </T>
    </Svg>
  );
}

export function RevealPiiRetention({ t }: StepCtx) {
  const cells = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Svg label="customer id redacted. The rest still describes one person." h={220}>
      <T x={300} y={35} s={13} f={C.crema} a="middle" w={600}>
        a logged feature vector
      </T>
      {cells.map((i) => {
        const struck = i === 0;
        const k = easeOut(seg(t, 0.1 + i * 0.08, 0.1 + i * 0.08 + 0.25));
        return (
          <g key={i} opacity={k}>
            <rect x={40 + i * 65} y={60} width={50} height={40} rx={4} fill={struck ? C.cocoa : C.panel} stroke={C.line} />
            {struck && <line x1={42 + i * 65} y1={100} x2={88 + i * 65} y2={60} stroke={C.cherry} strokeWidth={2} />}
          </g>
        );
      })}
      <T x={65} y={130} s={11} f={C.taupe} a="middle">
        id
      </T>
      <T x={300} y={170} s={12} f={C.taupe} a="middle" w={600}>
        the remaining fields still combine to one person
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="log the exact vector. Join the label later. Know the cost and the exposure." h={240}>
      <Row y={50} label="served vector" value="logged, not re-derived" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="delayed label" value="joined by request id" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="storage and PII" value="a cost and a policy, not exempt" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0, 0.4));
  const b = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="every vector, full sample rate, forever, no retention policy. Safe?" h={220}>
      <g opacity={a}>
        <T x={25} y={60} s={14} f={C.latte}>
          log everything
        </T>
        <T x={25} y={85} s={16} f={C.crema}>
          full rate, no retention limit
        </T>
      </g>
      <g opacity={b}>
        <T x={25} y={140} s={14} f={C.latte}>
          is that the safest setup
        </T>
        <T x={25} y={165} s={16} f={C.focus}>
          or a liability, growing
        </T>
      </g>
    </Svg>
  );
}
