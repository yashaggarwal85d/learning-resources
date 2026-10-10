import type { StepCtx } from '../../../../reels/types';
import { clamp, easeOutBack, seg } from '../../../../reels/anim';

// The five refreshers that open Data Engineering §1.1, shown at the start of
// each one so the learner always sees where they are in the sequence.
export const REFRESHERS = ['Python essentials', 'Git branching and history', 'Linux shell and processes', 'Software delivery workflow', 'Asymptotic notation and logarithms'];
const C = { roast: '#2a1d16', mocha: '#5a4032', taupe: '#8b7766', crema: '#e9d9bf', caramel: '#d49a57', espresso: '#17100c' };
const MONO = '"JetBrains Mono", ui-monospace, monospace';

export function RefresherList({ t, current }: StepCtx & { current: number }) {
  return (
    <svg viewBox="0 0 600 420" className="h-full w-full" role="img" aria-label={`Chapter 1 opens with five refreshers; this is number ${current + 1}`}>
      <text x={30} y={40} fontSize={13} fill={C.taupe} fontFamily={MONO} letterSpacing="0.03em">§1.1 · REFRESHERS · SKIM WHAT YOU KNOW</text>
      {REFRESHERS.map((r, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.22, 0.8 + i * 0.22));
        const on = i === current;
        const done = i < current;
        return (
          <g key={r} transform={`translate(${30 + (1 - clamp(a)) * -40} ${70 + i * 66})`} opacity={clamp(a)}>
            <rect width={540} height={52} rx={14} fill={on ? C.caramel : C.roast} stroke={on ? C.caramel : C.mocha} />
            <text x={22} y={33} fontSize={14} fill={on ? C.espresso : C.taupe} fontFamily={MONO} fontWeight={600}>{done ? '✓' : String(i + 1).padStart(2, '0')}</text>
            <text x={64} y={33} fontSize={19} fill={on ? C.espresso : done ? C.taupe : C.crema} fontFamily="Fraunces, Georgia, serif" fontWeight={700}>{r}</text>
            {on && <text x={518} y={33} fontSize={13} fill={C.espresso} textAnchor="end" fontFamily={MONO} fontWeight={600}>NOW ▶</text>}
          </g>
        );
      })}
    </svg>
  );
}
