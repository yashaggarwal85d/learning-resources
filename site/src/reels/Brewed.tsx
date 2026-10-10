import { motion } from 'motion/react';

/** The end-of-topic moment: a cup fills with coffee, crema settles, steam rises. */
export function Brewed() {
  return (
    <svg width="148" height="140" viewBox="0 0 148 140" aria-hidden="true">
      <defs>
        <clipPath id="brew-cup">
          <path d="M24 44h82l-8 66a14 14 0 0 1-14 12H46a14 14 0 0 1-14-12Z" />
        </clipPath>
        <linearGradient id="brew-coffee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b8612f" />
          <stop offset="0.12" stopColor="#5a4032" />
          <stop offset="1" stopColor="#2a1d16" />
        </linearGradient>
      </defs>
      {/* the pour */}
      <motion.rect
        x="62"
        width="6"
        rx="3"
        fill="#5a4032"
        initial={{ y: 0, height: 0, opacity: 1 }}
        animate={{ y: [0, 0, 120], height: [0, 120, 0], opacity: [1, 1, 0] }}
        transition={{ duration: 1.1, times: [0, 0.35, 1], ease: 'easeInOut' }}
      />
      <g clipPath="url(#brew-cup)">
        <motion.rect
          x="20"
          width="92"
          height="90"
          fill="url(#brew-coffee)"
          initial={{ y: 124 }}
          animate={{ y: 50 }}
          transition={{ delay: 0.25, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.ellipse
          cx="65"
          rx="40"
          ry="4"
          fill="#d49a57"
          initial={{ cy: 124, opacity: 0 }}
          animate={{ cy: 51, opacity: 0.9 }}
          transition={{ delay: 0.3, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
        />
      </g>
      <path d="M24 44h82l-8 66a14 14 0 0 1-14 12H46a14 14 0 0 1-14-12Z" fill="none" stroke="#e9d9bf" strokeWidth="3" strokeLinejoin="round" />
      <path d="M104 58h8a12 12 0 0 1 0 24h-10" fill="none" stroke="#e9d9bf" strokeWidth="3" strokeLinecap="round" />
      <motion.path d="M18 128h96" stroke="#e9d9bf" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
      {[46, 65, 84].map((x, i) => (
        <motion.path
          key={x}
          d={`M${x} 34c-6-7 6-11 0-18s6-10 0-14`}
          fill="none"
          stroke="#c8ac8c"
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={{ opacity: 0, y: 8, pathLength: 0 }}
          animate={{ opacity: [0, 0.8, 0], y: [8, -2, -10], pathLength: 1 }}
          transition={{ delay: 1 + i * 0.25, duration: 2.4, repeat: Infinity, repeatDelay: 0.4 }}
        />
      ))}
    </svg>
  );
}
