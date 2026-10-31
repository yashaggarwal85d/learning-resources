import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every legal claim here traces to the US DOJ's own CLOUD Act white paper, the European
// Commission's own pages, or the EDPB's own Recommendations 01/2020 (SOURCES.md). The Latombe
// ruling/appeal dates come from two independent secondary sources since CURIA itself could not
// be fetched in this sandbox (disclosed in FACT-CHECK.md). Time-cycled arrays use an explicit
// Number.isFinite guard (see project memory on this bug class).

// 1 · Hook: region-pinned storage, reached anyway by remote support.
export function PinnedButReachable({ t }: StepCtx) {
  const reached = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Storage pinned to the EU, reached anyway by a remote support session" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>Storage pinned to an EU region: residency, closed</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second} serif>the bytes themselves never leave the region</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={reached > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={reached > 0.5 ? C.caramel : C.latte} serif>{reached > 0.5 ? 'a support engineer outside the EU views it anyway' : 'support access: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which question is which.
export function PredictThreeQuestions({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Three words, one commonly blurred — which question does compelled access ask?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Where it sits, versus who can compel it</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>residency: the physical location of the bytes</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>sovereignty: who can compel access, regardless</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the CLOUD Act is the canonical sovereignty example' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Three strips, deliberately separate.
export function ThreeStrips({ t }: StepCtx) {
  const items = ['residency: where the bytes physically rest', 'sovereignty: who can be compelled to produce them', 'localisation: a law requiring residency as a precondition'];
  return (
    <Stack>
      <Svg label="Three separate strips, each answering one question, never merged into one box" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Three questions, never one blurred box</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.12 * i, 0.12 * i + 0.3));
          return (
            <g key={label}>
              <rect x={80} y={56 + i * 70} width={440} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} opacity={show} />
              <T x={300} y={86 + i * 70} s={13} a="middle" f={C.latte} o={show} w={400} serif>{label}</T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 4 · CLOUD Act test: possession, not location.
export function CloudActTest({ t }: StepCtx) {
  const both = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A US provider compelled to disclose, whether the data sits in the EU or the US" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Provider subject to US jurisdiction, EU-hosted data</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.caramel} serif>must disclose if lawfully ordered — location irrelevant</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={both > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={both > 0.5 ? C.caramel : C.latte} serif>{both > 0.5 ? 'same test, same result, if US-hosted instead' : 'comparison: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Schrems II struck Privacy Shield, SCCs now need a transfer-impact assessment.
export function SchremsAndScc({ t }: StepCtx) {
  const assessed = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A struck-down framework, replaced by SCCs, now carrying their own required assessment" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Privacy Shield, struck down by Schrems II</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>SCCs became the fallback transfer mechanism</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={assessed > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={assessed > 0.5 ? C.second : C.latte} w={400}>{assessed > 0.5 ? 'valid only with an assessed transfer-impact check' : 'assessment: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · Latombe timeline: upheld once, already on appeal.
export function LatombeTimeline({ t }: StepCtx) {
  const items = ['Schrems II strikes down Privacy Shield', 'the current Framework is adopted', 'the General Court upholds it in Latombe', 'an appeal is already pending at the CJEU'];
  return (
    <Stack>
      <Svg label="A timeline from Schrems II through the current framework's pending appeal" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Upheld once — and still being litigated</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.12 * i, 0.12 * i + 0.3));
          return (
            <T key={label} x={300} y={76 + i * 44} s={13} a="middle" f={i === 3 ? C.caramel : C.latte} o={show} w={420} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 7 · Customer-held keys, and the real limit (cleartext processing).
export function KeysRealLimit({ t }: StepCtx) {
  const needsClear = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A key held outside the importer's custody works, until the processing itself needs the data in the clear" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Key outside the importer's custody: effective</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second} serif>an effective supplementary measure, as documented</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={needsClear > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={needsClear > 0.5 ? C.caramel : C.latte} w={400}>{needsClear > 0.5 ? 'processing needs cleartext: no technical measure helps' : 'cloud support case: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['residency, sovereignty, localisation: three questions', 'the CLOUD Act compels by possession, not location', 'a customer-held key stops nothing once cleartext is needed'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Three questions, kept separate</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.15 * i, 0.15 * i + 0.25));
          return (
            <T key={label} x={300} y={86 + i * 36} s={13} a="middle" f={C.latte} o={show} w={460} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 9 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="Storage never leaves the EU, but a non-EU engineer views it remotely — what's the real question?" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>EU storage, untouched; remote viewing, outside it</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>residency and localisation both look satisfied here</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'is the viewing session itself a transfer?' : 'which question?'}</T>
      </Svg>
    </Stack>
  );
}
