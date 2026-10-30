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
    <Svg label="a data key, leaked. Yearly rotation, they say." h={200}>
      <Row y={70} label="data key" value="leaked" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rotation policy" value="once a year" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="one leak, one erasure request." h={200}>
      <Row y={70} label="fixes the leak" value="not yet revealed" />
      <Row y={130} label="handles erasure" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealHierarchy({ t }: StepCtx) {
  return (
    <Svg label="the KMS wraps a key. Never the data." h={260}>
      <Row y={50} label="DEK" value="encrypts the data" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="KMS-held KEK" value="wraps it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the data itself" value="never reaches KMS" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealRotationVsCompromise({ t }: StepCtx) {
  return (
    <Svg label="rotation: zero blocks. A leak: every block." h={260}>
      <Row y={50} label="rotate the KEK" value="zero blocks touched" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="fifty data blocks" value="under one DEK" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="DEK leaks" value="all fifty, re-encrypted" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealControlScale({ t }: StepCtx) {
  return (
    <Svg label="more control, more availability risk." h={260}>
      <Row y={40} label="provider-managed" value="least control" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={80} label="customer-managed" value="more control" o={easeOut(seg(t, 0.1, 0.35))} />
      <Row y={120} label="BYOK" value="imported key" o={easeOut(seg(t, 0.2, 0.45))} />
      <Row y={160} label="external" value="most risk too" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealTlsMtls({ t }: StepCtx) {
  return (
    <Svg label="a secure channel. Nothing about the disk." h={200}>
      <Row y={70} label="TLS, mTLS" value="peer to peer" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="data at rest" value="not their job" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealClientServerSide({ t }: StepCtx) {
  return (
    <Svg label="the same wrap-a-key shape, at the file." h={260}>
      <Row y={50} label="Iceberg" value="data, delete, manifest" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Parquet" value="key wraps key" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="shape" value="the same envelope" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealCryptoShredding({ t }: StepCtx) {
  return (
    <Svg label="one key, destroyed. Everything under it, gone." h={260}>
      <Row y={50} label="ten customers" value="one key each" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="delete one key" value="their blocks, unreadable" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="everyone else" value="fully intact" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="wrap, rotate, control, wire vs. disk, delete." h={260}>
      <Row y={50} label="KEK wraps DEK" value="all KMS sees" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="rotation" value="not a fix" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="key deletion" value="erases just that" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="rotated twice since the leak. Still exposed?" h={200}>
      <Row y={70} label="KEK rotated" value="twice, since" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the leaked DEK" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
