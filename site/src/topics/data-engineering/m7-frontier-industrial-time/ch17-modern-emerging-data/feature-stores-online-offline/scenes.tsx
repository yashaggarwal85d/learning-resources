import { C, Svg, T, Draw, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row. Keep both sides short (QUALITY.md: long label+value pairs on one baseline collide). */
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

/** The chapter's two-parallel-pipes figure: one definition box, an offline pipe and an online pipe below it. */
const BOX = { x: 220, y: 20, w: 160, h: 40 };
const OFFLINE_X = 130;
const ONLINE_X = 470;
const CHECK_Y = 190;

function DefinitionBox({ o = 1 }: { o?: number }) {
  return (
    <g opacity={o}>
      <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={6} fill={C.panel} stroke={C.line} />
      <T x={BOX.x + BOX.w / 2} y={BOX.y + 25} s={13} f={C.crema} a="middle">
        one feature definition
      </T>
    </g>
  );
}

function Pipes({ t, from = 0.2, to = 0.7, matched = true }: { t: number; from?: number; to?: number; matched?: boolean }) {
  const boxBottom = BOX.y + BOX.h;
  return (
    <g>
      <Draw pts={[[BOX.x + 20, boxBottom], [OFFLINE_X, 120], [OFFLINE_X, CHECK_Y]]} t={t} from={from} to={to} stroke={C.focus} w={2} />
      <Draw pts={[[BOX.x + BOX.w - 20, boxBottom], [ONLINE_X, 120], [ONLINE_X, CHECK_Y]]} t={t} from={from} to={to} stroke={C.focus} w={2} />
      <T x={OFFLINE_X} y={135} s={12} f={C.taupe} a="middle">
        offline
      </T>
      <T x={ONLINE_X} y={135} s={12} f={C.taupe} a="middle">
        online
      </T>
      <line x1={60} y1={CHECK_Y} x2={540} y2={CHECK_Y} stroke={C.line} strokeWidth={1} strokeDasharray="3 3" />
      <circle cx={OFFLINE_X} cy={CHECK_Y} r={6} fill={matched ? C.focus : C.cherry} opacity={easeOut(seg(t, to, to + 0.2))} />
      <circle cx={ONLINE_X} cy={CHECK_Y} r={6} fill={matched ? C.focus : C.cherry} opacity={easeOut(seg(t, to, to + 0.2))} />
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="strong offline. Worse the week it went live. No code changed." h={240}>
      <Row y={40} label="offline tests" value="strong" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={75} label="first live week" value="worse" valueColor={C.cherryText} o={easeOut(seg(t, 0.15, 0.45))} />
      <DefinitionBox o={easeOut(seg(t, 0.4, 0.7))} />
      <Pipes t={t} from={0.5} to={0.9} matched={false} />
    </Svg>
  );
}

export function PredictSkewCause({ t }: StepCtx) {
  return (
    <Svg label="a timezone boundary differs between the two pipelines. Which cause is this?" h={240}>
      <DefinitionBox />
      <Pipes t={t} from={0.2} to={0.6} matched={false} />
      <T x={300} y={225} s={13} f={C.taupe} a="middle" w={600}>
        stale value, or a second definition?
      </T>
    </Svg>
  );
}

export function RevealOneDefinitionTwoStores({ t }: StepCtx) {
  return (
    <Svg label="one transformation, compiled once. Offline for training, online for serving." h={240}>
      <DefinitionBox o={easeOut(seg(t, 0, 0.3))} />
      <Pipes t={t} from={0.3} to={0.9} matched />
      <T x={OFFLINE_X} y={215} s={11} f={C.taupe} a="middle">
        lakehouse tables
      </T>
      <T x={ONLINE_X} y={215} s={11} f={C.taupe} a="middle">
        low-latency KV
      </T>
    </Svg>
  );
}

export function RevealCodePathSkew({ t }: StepCtx) {
  const n = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="a second definition, measured: a five-day-earlier window boundary." h={220}>
      <T x={25} y={35} s={14} f={C.latte}>
        one definition, both pipes
      </T>
      <rect x={25} y={50} width={520} height={26} rx={4} fill={C.cocoa} />
      <T x={555} y={70} s={14} f={C.crema} a="end">
        zero mismatches
      </T>
      <T x={25} y={110} s={14} f={C.latte}>
        a second definition sneaks in
      </T>
      <rect x={25} y={125} width={520} height={26} rx={4} fill={C.cocoa} />
      <rect x={25} y={125} width={520 * n} height={26} rx={4} fill={C.cherry} />
      <T x={555} y={145} s={14} f={C.cherryText} a="end">
        measured mismatch
      </T>
    </Svg>
  );
}

export function RevealJoinSkew({ t }: StepCtx) {
  return (
    <Svg label="the serving path asks for current, not as-of. The same leak, at inference time." h={240}>
      <line x1={60} y1={150} x2={540} y2={150} stroke={C.line} strokeWidth={1.5} />
      <T x={300} y={30} s={13} f={C.crema} a="middle" w={600}>
        online pipe, inside
      </T>
      <Reticle x={420} y={150} w={40} h={40} t={t} at={0.6} color={C.cherry} />
      <T x={420} y={180} s={12} f={C.cherryText} a="middle">
        naive: today
      </T>
      <Reticle x={260} y={150} w={40} h={40} t={t} at={0.9} color={C.focus} />
      <T x={260} y={180} s={12} f={C.crema} a="middle">
        as-of: request time
      </T>
      <T x={300} y={225} s={12} f={C.taupe} a="middle" w={600}>
        the store can't fix a join it doesn't control
      </T>
    </Svg>
  );
}

export function PredictFreshnessSla({ t }: StepCtx) {
  return (
    <Svg label="materialized every thirty minutes. A request lands thirty-five minutes later." h={220}>
      <Row y={60} label="materialization interval" value="30 minutes" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="this request's lag" value="35 minutes" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="late, or close enough" value="?" o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealStaleValueSkew({ t }: StepCtx) {
  const pulses = [0, 1, 2, 3, 4, 5];
  return (
    <Svg label="materialization measured as pulses, not a continuous flow." h={220}>
      <line x1={40} y1={110} x2={560} y2={110} stroke={C.line} strokeWidth={1.5} />
      {pulses.map((i) => {
        const x = 70 + i * 90;
        const k = easeOut(seg(t, 0.1 + i * 0.1, 0.1 + i * 0.1 + 0.2));
        return <circle key={i} cx={x} cy={110} r={5} fill={C.focus} opacity={k} />;
      })}
      <rect x={440} y={95} width={30} height={30} fill={C.cherry} opacity={0.25} />
      <Reticle x={455} y={110} w={30} h={30} t={t} at={1.1} color={C.cherry} />
      <T x={455} y={150} s={12} f={C.cherryText} a="middle">
        45 min interval: late
      </T>
      <T x={160} y={150} s={12} f={C.taupe} a="middle">
        15 min interval: on time
      </T>
    </Svg>
  );
}

export function RevealNamedPlatforms({ t }: StepCtx) {
  const cols = [
    { x: 95, name: 'Feast', note: 'open source' },
    { x: 235, name: 'Tecton', note: 'now Databricks' },
    { x: 375, name: 'Hopsworks', note: 'open platform' },
    { x: 515, name: 'cloud-native', note: 'no second system' },
  ];
  return (
    <Svg label="four names, the same two pipes. What differs is who manages them." h={220}>
      {cols.map((col, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.15, 0.1 + i * 0.15 + 0.3));
        const boxW = Math.max(88, col.name.length * 9 + 22);
        return (
          <g key={col.name} opacity={k}>
            <rect x={col.x - boxW / 2} y={30} width={boxW} height={24} rx={4} fill={C.panel} stroke={C.line} />
            <line x1={col.x - 20} y1={70} x2={col.x - 20} y2={110} stroke={C.focus} strokeWidth={1.5} />
            <line x1={col.x + 20} y1={70} x2={col.x + 20} y2={110} stroke={C.focus} strokeWidth={1.5} />
            <T x={col.x} y={46} s={11} f={C.crema} a="middle">
              {col.name}
            </T>
            <T x={col.x} y={135} s={11} f={C.taupe} a="middle">
              {col.note}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one definition, two stores, three ways the guarantee still breaks." h={240}>
      <Row y={50} label="feature store" value="one definition, two stores" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="code path" value="can still diverge outside it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="join or lag" value="can still skew inside it" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0, 0.4));
  const b = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="a dashboard query recomputes the feature by hand. Protected?" h={220}>
      <g opacity={a}>
        <T x={25} y={60} s={14} f={C.latte}>
          a dashboard's own query
        </T>
        <T x={25} y={85} s={16} f={C.crema}>
          recomputes the same feature
        </T>
      </g>
      <g opacity={b}>
        <T x={25} y={140} s={14} f={C.latte}>
          does the store's guarantee
        </T>
        <T x={25} y={165} s={16} f={C.focus}>
          reach that query too
        </T>
      </g>
    </Svg>
  );
}
