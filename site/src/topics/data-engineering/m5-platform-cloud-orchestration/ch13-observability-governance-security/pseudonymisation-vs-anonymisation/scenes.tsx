import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="hashed, so it's anonymous? ten minutes and a known email list says otherwise" h={200}>
      <Row y={70} label="hashed emails" value="called anonymous" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="known email list" value="matches most back" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealStillPersonalForKeyHolder({ t }: StepCtx) {
  return (
    <Svg label="pseudonymised data is still personal data for whoever holds the key or the dictionary" h={200}>
      <Row y={70} label="encryption, hashing" value="protect, not change" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="key holder" value="still personal data" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDictionaryAttack({ t }: StepCtx) {
  return (
    <Svg label="hash a candidate email list with the same plain function used on a pseudonymised table. Recovers most of it?" h={200}>
      <Row y={70} label="same plain hash" value="on known emails" />
      <Row y={130} label="recovers most?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDictionaryRecovers({ t }: StepCtx) {
  return (
    <Svg label="measured: the dictionary attack recovers the large majority of the table" h={200}>
      <Row y={70} label="plain hash" value="deterministic, public" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="dictionary attack" value="recovers most, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateHMACNeedsSecret({ t }: StepCtx) {
  return (
    <Svg label="a keyed hash needs a secret the attacker never has; the same attack recovers nothing" h={200}>
      <Row y={70} label="HMAC" value="needs the key" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same attack" value="recovers nothing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLinkageAttack({ t }: StepCtx) {
  return (
    <Svg label="no names, just quasi-identifiers, joined to an outside list that has names. Anyone re-identified?" h={200}>
      <Row y={70} label="no names" value="just quasi-ids" />
      <Row y={130} label="re-identified?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLinkageReidentifies({ t }: StepCtx) {
  return (
    <Svg label="measured: a real, measurable fraction gets re-identified, key never compromised" h={200}>
      <Row y={70} label="key" value="never compromised" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="quasi-identifiers" value="still re-identify" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateRelativeIdentifiability({ t }: StepCtx) {
  return (
    <Svg label="EDPS v SRB: pseudonymised data isn't personal data in all cases, for every person" h={200}>
      <Row y={70} label="not personal data" value="for every person" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="judged by" value="recipient's own means" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDigitalOmnibusPending({ t }: StepCtx) {
  return (
    <Svg label="the Digital Omnibus would write this relative approach into law -- not yet adopted" h={200}>
      <Row y={70} label="relative approach" value="proposed, not law" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="EDPB, EDPS" value="urged against it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="plain hash falls to dictionaries, HMAC holds, quasi-identifiers still re-identify" h={280}>
      <Row y={50} label="plain hash" value="falls, measured" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="HMAC" value="holds, measured" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="quasi-identifiers" value="still re-identify" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
