import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a minimal catalog proved the idea. this topic: the real, vendor-neutral protocol for it." h={200}>
      <TallRow y={40} label="a minimal catalog" value="proved the idea works" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic" value="the real protocol, speaking real http" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictFirstCall({ t }: StepCtx) {
  return (
    <Svg label="a client meets a rest catalog it's never seen. does it just start sending requests?" h={200}>
      <TallRow y={40} label="a client, a new catalog" value="never talked to it before" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does it just start sending requests" value="or does something happen first?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealConfigNegotiation({ t }: StepCtx) {
  return (
    <Svg label="config negotiation: a real first call, a real response the client must apply over its own config." h={230}>
      <TallRow y={40} label="a real first call" value="get config, before anything else" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the server's response" value="overrides win, for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealLoadAndRace({ t }: StepCtx) {
  return (
    <Svg label="a real load over real http. two engines read the same table, race to commit with a requirement." h={230}>
      <TallRow y={40} label="a real load" value="real http, real response" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="two engines race" value="each commits with its own requirement" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictStaleRequirement({ t }: StepCtx) {
  return (
    <Svg label="one engine's requirement no longer matches the server's real state. what does the server do?" h={200}>
      <TallRow y={40} label="the table already moved on" value="one requirement is now stale" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="what does the server do" value="accept it anyway, or refuse it?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealConflictAndRetry({ t }: StepCtx) {
  return (
    <Svg label="a real conflict, naming exactly which requirement failed. the loser reloads and retries, for real." h={230}>
      <TallRow y={40} label="real conflict" value="names the exact requirement" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the loser" value="reloads, retries, succeeds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealNamedNotBuilt({ t }: StepCtx) {
  return (
    <Svg label="named, sourced, not built: multi-table transactions, the views and register endpoints." h={230}>
      <TallRow y={40} label="multi-table transactions" value="one atomic commit, several tables" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="views, register" value="real endpoints, out of scope here" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCredentialVending({ t }: StepCtx) {
  return (
    <Svg label="credential vending and remote signing, named precisely: sourced-only, since this sandbox issues no real cloud credentials." h={230}>
      <TallRow y={40} label="the access-delegation header" value="a real, named protocol signal" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="vended credentials" value="sourced-only, not issued here" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCurrentFeatures({ t }: StepCtx) {
  return (
    <Svg label="server-side scan planning, new in iceberg's latest release line, and sql udfs: current protocol features. oauth two is deprecated." h={260}>
      <TallRow y={35} label="server-side scan planning" value="the server plans the scan now" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="sql udfs" value="a portable metadata format" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="the built-in oauth endpoint" value="deprecated, for external identity" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real rest catalog, speaking a real subset of the real protocol. next: which format and catalog do you pick?" h={300}>
      <TallRow y={35} label="a real rest catalog" value="speaking the real protocol, for real" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="config, load, commit" value="all three, over real http" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="every mechanism this section needed" value="now exists, built or sourced" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          the practical question these topics served --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          which format and catalog do you pick?
        </T>
      </g>
    </Svg>
  );
}
