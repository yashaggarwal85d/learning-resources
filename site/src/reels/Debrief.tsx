import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

/** The end-of-topic moment: every step's cell fills in turn, then the brackets close on a check mark. */
export function Debrief({ steps }: { steps: number }) {
  const perRow = Math.min(steps, 12);
  const rows = Math.ceil(steps / perRow);
  const cell = 10, gap = 4;
  const gridW = perRow * cell + (perRow - 1) * gap;
  const W = 200, top = 92;
  const H = top + rows * (cell + gap) + 4;
  const x0 = (W - gridW) / 2;
  const fillAt = (i: number) => 0.1 + i * 0.05;
  const lock = fillAt(steps) + 0.1;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {/* the brackets close on the check */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
        <motion.path
          key={`${sx}${sy}`}
          d={`M${100 + sx * 34} ${42 + sy * 34 - sy * 10}V${42 + sy * 34}H${100 + sx * 34 - sx * 10}`}
          fill="none"
          stroke="var(--color-chalk)"
          strokeWidth={1.5}
          style={{ originX: '100px', originY: '42px' }}
          initial={{ opacity: 0, scale: 2.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: lock, duration: 0.6, ease: EASE }}
        />
      ))}
      <motion.path
        d="M84 43l11 11 22-24"
        fill="none"
        stroke="var(--color-caramel)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: lock + 0.25, duration: 0.5, ease: EASE }}
      />
      {Array.from({ length: steps }, (_, i) => (
        <motion.rect
          key={i}
          x={x0 + (i % perRow) * (cell + gap)}
          y={top + Math.floor(i / perRow) * (cell + gap)}
          width={cell}
          height={cell}
          rx={1.5}
          initial={{ fill: 'rgba(237,237,237,0.12)' }}
          animate={{ fill: 'rgba(237,237,237,0.92)' }}
          transition={{ delay: fillAt(i), duration: 0.25 }}
        />
      ))}
    </svg>
  );
}
