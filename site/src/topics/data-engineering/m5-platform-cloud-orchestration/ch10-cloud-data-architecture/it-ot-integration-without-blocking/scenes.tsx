import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every claim traces to Process Control Guide's own Purdue-level definitions, Software
// Toolbox's own iDMZ and Sparkplug B pages, Network Critical's own data-diode guide, the OPC
// Foundation's and Eclipse Foundation's own specifications, and HiveMQ's own unified-namespace
// article (SOURCES.md). No real PLC, SCADA system or MQTT broker runs in this sandbox;
// examples.py reproduces Purdue-level classification and the backpressure-isolation proof
// (disclosed there and in FACT-CHECK.md). Time-cycled arrays use clamp/seg two-state toggles,
// no multi-item cycling.

// 1 · Hook: a dashboard wired straight into SCADA.
export function DirectDashboardHook({ t }: StepCtx) {
  const delayed = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A dashboard reading SCADA directly, until its own query slows SCADA down" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>A new dashboard, wired straight into SCADA</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second} serif>simple: query the live system directly</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={delayed > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={delayed > 0.5 ? C.caramel : C.latte} serif>{delayed > 0.5 ? 'an overnight query delays an alarm acknowledgement' : 'overnight query: running'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what actually has to change.
export function PredictWhatChanges({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A faster query only lowers the odds — what removes the failure entirely?" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Faster query, or a different architecture?</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>a faster query: same failure, lower odds</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={revealed ? C.caramel : C.latte} w={revealed ? 700 : 400}>{revealed ? 'a buffer between source and consumer: failure removed' : 'which change?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Five Purdue levels.
export function PurdueLevels({ t }: StepCtx) {
  const items = [
    'Level 5: enterprise / corporate',
    'Level 4: site business (ERP)',
    'Level 3: manufacturing operations (MES, historians)',
    'Level 2: supervisory control and HMI (SCADA)',
    'Level 1: field devices and controllers (PLCs)',
    'Level 0: the physical process',
  ];
  return (
    <Stack>
      <Svg label="The five Purdue levels, stacked from the physical process up to the enterprise" h={300} fill>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>One ladder, every other clause assumes it</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.1 * i, 0.1 * i + 0.3));
          return (
            <T key={label} x={300} y={64 + i * 38} s={12} a="middle" f={C.latte} o={show} w={440} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 4 · iDMZ zone, and the diode's physical guarantee.
export function DmzAndDiode({ t }: StepCtx) {
  const diode = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A zone of its own between OT and IT, and a diode whose one-way rule is physical" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>The iDMZ: a third zone, not OT, not IT</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>every exchange brokered, nothing direct</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={diode > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={diode > 0.5 ? C.caramel : C.latte} w={400}>{diode > 0.5 ? 'a diode: reverse traffic is a missing wire, not a rule' : 'one-way device: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Three extraction mechanisms.
export function ThreeMechanisms({ t }: StepCtx) {
  const items = ['OPC UA: direct read, its own security model', 'MQTT + Sparkplug B: publishes, birth/death certificates', 'historian API: stored process history, after the fact'];
  return (
    <Stack>
      <Svg label="Three different ways to read the plant floor, each for something different" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Three mechanisms, three different jobs</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.14 * i, 0.14 * i + 0.3));
          return (
            <T key={label} x={300} y={76 + i * 56} s={13} a="middle" f={C.latte} o={show} w={440} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 6 · Buffer isolation proof.
export function BufferIsolationProof({ t }: StepCtx) {
  const buffered = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A stalled consumer blocks the source with no buffer, and doesn't with one" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>No buffer: the stall reaches the OT source</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.caramel} w={400}>consumer stalls, the next publish blocks</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={buffered > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={buffered > 0.5 ? C.second : C.latte} w={400}>{buffered > 0.5 ? 'with a buffer: same stall, source never notices' : 'buffered run: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · Unified namespace.
export function UnifiedNamespace({ t }: StepCtx) {
  const complement = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="One shared namespace instead of wiring every pair of systems by hand" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>One namespace, not a tangle of point-to-point links</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>every system publishes, every consumer subscribes</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={complement > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={complement > 0.5 ? C.second : C.latte} w={400}>{complement > 0.5 ? 'ISA-95 models the data; this names how it moves' : 'ISA-95 relationship: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['five Purdue levels give everything its vocabulary', "an iDMZ is its own zone; a diode's guarantee is physical", 'OPC UA, Sparkplug B and historian APIs read differently', 'a buffer is what actually stops backpressure reaching OT'];
  return (
    <Stack>
      <Svg label="The four-part recap of this topic's point" h={280} fill>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Four points, kept separate</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.1 * i, 0.1 * i + 0.25));
          return (
            <T key={label} x={300} y={70 + i * 46} s={12} a="middle" f={C.latte} o={show} w={460} serif>{label}</T>
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
      <Svg label="MES polls a PLC directly, with nothing buffering the connection between them" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>MES reading a PLC directly, no buffer at all</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>a long MES maintenance window begins</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? "the PLC's own control-loop timing starts drifting" : 'which lesson does this match?'}</T>
      </Svg>
    </Stack>
  );
}
