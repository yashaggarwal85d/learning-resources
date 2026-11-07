import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** The REST catalog server: a box on the right, labelled, with the table's current snapshot inside. */
function Server({ x = 400, y, snap, k = 1, h = 60 }: { x?: number; y: number; snap?: string; k?: number; h?: number }) {
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={160} height={h} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.8} />
      <T x={x + 12} y={y + 22} s={12} f={C.latte}>
        REST catalog
      </T>
      {snap && (
        <T x={x + 12} y={y + 46} s={12} f={C.crema}>
          {snap}
        </T>
      )}
    </g>
  );
}

// 1 · Hook. The small catalog from last time on the left; an HTTP line runs from several engines through one shared contract to it.
export function Hook({ t }: StepCtx) {
  const l = easeInOut(seg(t, 1.2, 2.2));
  const engines = ['spark', 'trino', 'flink'];
  return (
    <Svg label="a minimal catalog proved the idea. this topic: the real, vendor-neutral protocol for it." h={200}>
      {engines.map((e, i) => (
        <g key={e}>
          <Cell x={25} y={25 + i * 55} w={100} h={28} label={e} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} />
          <line x1={127} y1={39 + i * 55} x2={lerp(127, 238, l)} y2={lerp(39 + i * 55, 94, l)} stroke={C.mocha} strokeWidth={1.5} />
        </g>
      ))}
      <Cell x={240} y={78} w={120} h={32} label="one protocol" stroke={C.second} o={easeOut(seg(t, 2.0, 2.4))} />
      <Req x1={362} x2={398} y={94} k={easeOut(seg(t, 2.6, 3.0))} f={C.focus} />
      <Server y={64} k={easeOut(seg(t, 2.8, 3.2))} />
      <T x={400} y={160} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        over real HTTP
      </T>
    </Svg>
  );
}

// 2 · Predict. A new client with its own config card; a dashed arrow toward a server it has never met: send at once, or something first?
export function PredictFirstCall({ t, answer }: StepCtx) {
  return (
    <Svg label="a client meets a rest catalog it's never seen. does it just start sending requests?" h={200}>
      <Cell x={25} y={30} w={150} h={30} label="new client" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={84} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        warehouse=client-default
      </T>
      <line x1={180} y1={45} x2={lerp(180, 395, easeInOut(seg(t, 1.0, 1.8)))} y2={45} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 4" />
      <Server y={15} k={easeOut(seg(t, 1.4, 1.8))} />
      <AnswerRow y={140} label="before any request" answer={answer} value="something first" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="its guesses may not match this server" />
    </Svg>
  );
}

// 3 · Config negotiation. GET /v1/config goes out; three layers stack in the merge order (defaults, client, overrides), the last
// one striking the client's warehouse; the merged result reads off at the bottom.
export function RevealConfigNegotiation({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.2, 0.8));
  const layers: [string, string, string][] = [
    ['defaults', 'clients=4', C.mocha],
    ['client', 'warehouse=client-default', C.latte],
    ['overrides', 'warehouse=s3://lakehouse/analytics', C.focus],
  ];
  const strike = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="config negotiation: a real first call, a real response the client must apply over its own config." h={230}>
      <Req x1={25} x2={250} y={24} k={g} label="GET /v1/config" f={C.second} />
      {layers.map(([a, b, f], i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.6, 1.4 + i * 0.6));
        const y = 50 + i * 44;
        return (
          <g key={a} opacity={k} transform={`translate(0 ${((1 - k) * -12).toFixed(2)})`}>
            <rect x={25} y={y} width={525} height={34} rx={4} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
            <T x={38} y={y + 22} s={12} f={C.latte}>
              {a}
            </T>
            <T x={150} y={y + 22} s={12} f={C.crema}>
              {b}
            </T>
          </g>
        );
      })}
      <line x1={148} y1={111} x2={148 + 205 * strike} y2={111} stroke={C.cherryText} strokeWidth={2} />
      <T x={25} y={212} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        merged: overrides win, last
      </T>
    </Svg>
  );
}

// 4 · Load, then race. GET the table: snapshot 0. Two engines read it; each commit carries "assert snapshot 0" toward the server.
export function RevealLoadAndRace({ t }: StepCtx) {
  const ld = easeInOut(seg(t, 0.2, 1.0));
  const a = easeInOut(seg(t, 2.2, 3.2));
  const b = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="a real load over real http. two engines read the same table, race to commit with a requirement." h={230}>
      <Req x1={180} x2={395} y={40} k={ld} label="GET …/tables/events" f={C.second} />
      <Server y={20} snap="snapshot 0" k={1} />
      <Cell x={25} y={110} w={130} h={30} label="engine A" o={easeOut(seg(t, 1.4, 1.7))} />
      <Cell x={25} y={170} w={130} h={30} label="engine B" o={easeOut(seg(t, 1.6, 1.9))} />
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        both read snapshot 0
      </T>
      <Req x1={157} x2={395} y={125} k={a} label="assert snapshot 0" f={C.focus} />
      <Req x1={157} x2={395} y={185} k={b} label="assert snapshot 0" f={C.latte} />
    </Svg>
  );
}

// 5 · Predict. The server now holds snapshot 1; B's request still asserts 0. Accept, or refuse?
export function PredictStaleRequirement({ t, answer }: StepCtx) {
  return (
    <Svg label="one engine's requirement no longer matches the server's real state. what does the server do?" h={200}>
      <Cell x={25} y={30} w={130} h={30} label="engine B" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={157} x2={395} y={45} k={easeInOut(seg(t, 0.4, 1.2))} label="assert snapshot 0" f={C.latte} />
      <Server y={15} snap={t > 1.4 ? 'snapshot 1' : 'snapshot 0'} />
      <T x={400} y={100} s={11} f={C.second} o={easeOut(seg(t, 1.4, 1.8))}>
        A already committed
      </T>
      <AnswerRow y={140} label="the server" answer={answer} value="refuses, naming why" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="else two engines stomp on each other" />
    </Svg>
  );
}

// 6 · The 409, for real. B's request bounces with the failed requirement named; B reloads (snapshot 1) and retries to snapshot 2.
export function RevealConflictAndRetry({ t }: StepCtx) {
  const go = easeInOut(seg(t, 0.2, 0.9));
  const bounce = easeOut(seg(t, 0.9, 1.4));
  const rl = easeInOut(seg(t, 2.4, 3.0));
  const rt = easeInOut(seg(t, 3.2, 3.9));
  return (
    <Svg label="a real conflict, naming exactly which requirement failed. the loser reloads and retries, for real." h={250}>
      <Cell x={25} y={30} w={130} h={30} label="engine B" o={1} />
      <Server y={15} snap={rt > 0.95 ? 'snapshot 2' : 'snapshot 1'} />
      {rl === 0 && <Req x1={157} x2={395} y={45} k={go} back={bounce} label="assert snapshot 0" f={C.latte} />}
      <T x={25} y={100} s={13} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.6))}>
        409 Conflict
      </T>
      <T x={25} y={124} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        failed: assert-current-snapshot-id
      </T>
      {rl > 0 && (
        <g>
          <line x1={395} y1={160} x2={lerp(395, 160, rl)} y2={160} stroke={C.second} strokeWidth={1.8} />
          <path d={`M${lerp(395, 160, rl)} 160 l8 -5 v10 z`} fill={C.second} />
          <T x={277} y={151} s={11} f={C.second} a="middle">
            reload: snapshot 1
          </T>
        </g>
      )}
      <Req x1={157} x2={395} y={200} k={rt} label="assert snapshot 1" f={C.focus} />
      <T x={400} y={230} s={12} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        200, committed
      </T>
    </Svg>
  );
}

// 7 · Named, not built. Three dashed cards: two tables bracketed as one commit, register-a-table, list views.
export function RevealNamedNotBuilt({ t }: StepCtx) {
  const k1 = easeOut(seg(t, 0.4, 0.9));
  const k2 = easeOut(seg(t, 2.6, 3.0));
  const k3 = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="named, sourced, not built: multi-table transactions, the views and register endpoints." h={230}>
      <g opacity={k1}>
        <rect x={25} y={20} width={525} height={80} rx={5} fill="none" stroke={C.mocha} strokeDasharray="5 4" />
        <T x={40} y={46} s={13} f={C.crema}>
          multi-table commit
        </T>
        <Cell x={260} y={52} w={110} h={28} label="orders" />
        <Cell x={390} y={52} w={110} h={28} label="payments" />
        <path d={`M255 ${90} v6 h${250 * easeInOut(seg(t, 1.2, 2.0))}`} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={40} y={76} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
          one atomic step
        </T>
      </g>
      <g opacity={k2}>
        <rect x={25} y={130} width={250} height={60} rx={5} fill="none" stroke={C.mocha} strokeDasharray="5 4" />
        <T x={40} y={166} s={13} f={C.crema}>
          register a table
        </T>
      </g>
      <g opacity={k3}>
        <rect x={300} y={130} width={250} height={60} rx={5} fill="none" stroke={C.mocha} strokeDasharray="5 4" />
        <T x={315} y={166} s={13} f={C.crema}>
          list views
        </T>
      </g>
      <T x={25} y={218} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        sourced, not built here
      </T>
    </Svg>
  );
}

// 8 · Credential vending, sourced. The client's header lists what it can handle; the server may send any or none back (dashed).
export function RevealCredentialVending({ t }: StepCtx) {
  const h = easeInOut(seg(t, 0.4, 1.3));
  const back = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="credential vending and remote signing, named precisely: sourced-only, since this sandbox issues no real cloud credentials." h={230}>
      <Cell x={25} y={30} w={120} h={30} label="client" o={easeOut(seg(t, 0.1, 0.4))} />
      <Server y={15} />
      <Req x1={147} x2={395} y={45} k={h} f={C.second} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        X-Iceberg-Access-Delegation:
      </T>
      <T x={25} y={126} s={12} f={C.second} o={easeOut(seg(t, 1.3, 1.7))}>
        vended-credentials, remote-signing
      </T>
      <line x1={395} y1={160} x2={lerp(395, 150, back)} y2={160} stroke={C.mocha} strokeWidth={1.6} strokeDasharray="5 4" opacity={back > 0 ? 1 : 0} />
      <T x={400} y={164} s={12} f={C.crema} o={easeOut(seg(t, 2.4, 2.8))}>
        any, or none
      </T>
      <T x={25} y={210} s={11} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.7))}>
        no real cloud credentials in this sandbox
      </T>
    </Svg>
  );
}

// 9 · Current features. Scan planning moves onto the server (an arrow flips sides), SQL UDFs appear, and OAuth2 is struck through
// in favour of an external identity provider.
export function RevealCurrentFeatures({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.6, 1.4));
  const st = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="server-side scan planning, new in iceberg's latest release line, and sql udfs: current protocol features. oauth two is deprecated." h={250}>
      <T x={25} y={30} s={13} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        scan planning
      </T>
      <circle cx={lerp(220, 520, sp)} cy={25} r={8} fill={C.focus} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={220} y={58} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        engine
      </T>
      <T x={520} y={58} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
        server · 1.11
      </T>
      <T x={25} y={110} s={13} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        shared functions
      </T>
      <T x={575} y={110} s={13} f={C.second} a="end" o={easeOut(seg(t, 2.0, 2.4))}>
        SQL UDFs
      </T>
      <T x={25} y={170} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        login tokens
      </T>
      <T x={575} y={170} s={13} f={C.crema} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        built-in OAuth2
      </T>
      <line x1={575 - 125 * st} y1={165} x2={575} y2={165} stroke={C.cherryText} strokeWidth={2} />
      <T x={575} y={210} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        an external identity provider
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real rest catalog, speaking a real subset of the real protocol. next: which format and catalog do you pick?" h={250}>
      <Row y={40} label="config" value="negotiated first" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a load" value="over real HTTP" k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="a commit" value="its condition checked" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
