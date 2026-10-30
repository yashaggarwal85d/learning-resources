import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="&quot;hashed, so it's anonymous.&quot; Nine of ten, matched." h={200}>
      <Row y={70} label="email table" value="hashed, plain" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="known emails" value="nine of ten" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="one change stops it. Anonymous, or pseudonymised?" h={200}>
      <Row y={70} label="HMAC, keyed" value="stops the attack" />
      <Row y={130} label="result" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLegalLine({ t }: StepCtx) {
  return (
    <Svg label="attribution, with the key. Still personal data." h={260}>
      <Row y={50} label="pseudonymised data" value="attributable, with key" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the key holder" value="can still attribute" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="for them" value="still personal data" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealDictionaryAttack({ t }: StepCtx) {
  return (
    <Svg label="same function, every candidate. Matches, recovered." h={260}>
      <Row y={50} label="plain hash" value="deterministic, public" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="candidate list" value="hashed, same way" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="matches" value="recovered emails" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealHmacResists({ t }: StepCtx) {
  return (
    <Svg label="same dictionary, no key. Nothing matches." h={200}>
      <Row y={70} label="HMAC, keyed" value="different, without key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="attacker's guesses" value="zero matches" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRelativeApproach({ t }: StepCtx) {
  return (
    <Svg label="not personal data, for everyone. It depends." h={260}>
      <Row y={50} label="EDPS v SRB" value="the CJEU's ruling" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="means to re-identify" value="personal, for them" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="no such means" value="may not be" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealControllerDuty({ t }: StepCtx) {
  return (
    <Svg label="the controller's own side, at collection." h={260}>
      <Row y={50} label="duty to inform" value="judged at collection" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="whose perspective" value="the controller's own" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="recipient's blind spot" value="no excuse" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealDigitalOmnibus({ t }: StepCtx) {
  return (
    <Svg label="written into the law, by proposal. Not law yet." h={260}>
      <Row y={50} label="Digital Omnibus" value="a pending proposal" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="relative approach" value="written into GDPR" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="EDPB and EDPS" value="object to this" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealLinkageAttacks({ t }: StepCtx) {
  return (
    <Svg label="quasi-identifiers, joined outside. No key needed." h={260}>
      <Row y={50} label="keyed pseudonym" value="resists the dictionary" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="quasi-identifiers" value="joined, outside list" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="two in three" value="matched, no key" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="key holder, relative approach, pending law." h={260}>
      <Row y={50} label="pseudonymised" value="still personal data" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="relative approach" value="depends on recipient" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="dictionary vs linkage" value="HMAC stops one" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="key destroyed, quasi-identifiers intact. Still attackable?" h={200}>
      <Row y={70} label="the key" value="destroyed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="quasi-identifiers" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
