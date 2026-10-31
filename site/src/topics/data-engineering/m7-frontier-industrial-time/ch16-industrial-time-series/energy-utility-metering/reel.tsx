import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed register-correction, power-to-energy integration, and allocation-spread
// computation (examples.py). No numbers are repeated on screen beyond what that file computes.
const reel: Reel = {
  steps: [
    {
      title: "Hook: most days a normal total, one day an astronomical one",
      body: (
        <>
          A line's daily energy total reads an ordinary figure most days. On the day a meter was
          swapped, it reads an astronomical one. The fix applied the week before, dropping any
          negative difference, had already silently deleted a real reset without telling anyone.
          What actually broke, and which of it can even be fixed?
        </>
      ),
      duration: 5.4,
      fig: "a line's daily energy total reads a normal figure most days and an astronomical one on a meter-swap day — a prior fix had already silently deleted a real reset",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a register is cumulative, consumption is a difference',
      body: (
        <>
          A meter's own reading only ever goes up. It never reports "twelve kilowatt-hours this
          hour." Interval consumption is always a difference of two readings, and that
          subtraction works perfectly, right up until the register does something other than
          keep counting up.
        </>
      ),
      duration: 4.8,
      fig: "a meter's own reading only ever goes up; consumption is a difference of two readings, which works until the register stops simply counting up",
      Visual: S.RevealCumulative,
    },
    {
      title: 'Predict: does a negative difference always mean the same thing?',
      body: (
        <>
          A register's difference between two readings comes back negative. Does that always
          mean the same thing happened to the meter?
        </>
      ),
      duration: 4.0,
      fig: "a register's difference between two readings comes back negative — does that always mean the same failure happened?",
      predict: {
        options: [
          { label: 'Yes — a negative difference always means the same failure' },
          {
            label: 'No — it can mean three different things, each needing a different fix',
            correct: true,
          },
        ],
        explain: (
          <>
            No. A rollover, a reset and a meter swap can all produce a negative-looking
            difference, but only one of the three can be corrected by arithmetic alone.
          </>
        ),
      },
      Visual: S.PredictNegative,
    },
    {
      title: 'Reveal: a rollover, corrected for real',
      body: (
        <>
          A register near its own fixed width wraps back around. Knowing that width, not
          guessing it, lets the real consumption across the wrap be recovered exactly, with no
          uncertainty left over.
        </>
      ),
      duration: 4.6,
      fig: "a register wraps at its own known, fixed width — knowing that width recovers the exact real consumption, with no uncertainty left",
      takeaway: "A register wrapping at its own fixed width isn't lost data — knowing that width recovers the real consumption exactly.",
      Visual: S.RevealRollover,
    },
    {
      title: 'Reveal: a reset, bounded but never recovered',
      body: (
        <>
          A device restarts and its register falls back near zero. The consumption lost between
          the last good reading and that restart has no formula that recovers it. The honest
          answer is an upper bound, from the elapsed time and the line's own known maximum rate.
        </>
      ),
      duration: 5.0,
      fig: "a device restart drops the register near zero; the lost consumption has no recovering formula, only an upper bound from elapsed time and a known maximum rate",
      Visual: S.RevealReset,
    },
    {
      title: 'Reveal: the old fix was worse than an honest bound',
      body: (
        <>
          The previous handling simply dropped any negative difference, reporting zero
          consumption for that interval. Compared against an honest bound, that old fix didn't
          lose precision. It reported a confident wrong answer instead of an honest uncertain one.
        </>
      ),
      duration: 4.8,
      fig: 'the old fix drops a negative difference and reports zero; the honest bound reports a real, nonzero upper range for the same event',
      takeaway: "The previous fix reported a confident zero instead of an honest, bounded range.",
      Visual: S.RevealOldFix,
    },
    {
      title: 'Reveal: a meter swap, split rather than diffed',
      body: (
        <>
          The same equipment, a new meter installed on it, a new register starting from its own
          recorded baseline. Diffing straight across that swap gives an enormous, nonsensical
          number. Splitting the series at the swap gives the real consumption on each side.
        </>
      ),
      duration: 5.0,
      fig: 'diffing straight across a meter swap gives a nonsensical huge number; splitting the series at the swap gives the real consumption on each side',
      Visual: S.RevealSwap,
    },
    {
      title: 'Reveal: power integrated into energy, against the naive average',
      body: (
        <>
          A power series, sampled at uneven intervals, properly integrated into energy, against
          the classic shortcut: averaging the readings as if they were evenly spaced and
          multiplying by the total elapsed time.
        </>
      ),
      duration: 4.8,
      fig: "an irregularly-sampled power series, properly integrated into energy, against a naive unweighted average of the same readings multiplied by elapsed time",
      takeaway: 'Averaging unevenly-spaced power readings instead of integrating them gave a real, measurably wrong energy total.',
      Visual: S.RevealIntegration,
    },
    {
      title: 'Reveal: one header meter, two allocation rules, a costed spread',
      body: (
        <>
          One shared header meter's total, split to a line by its running hours under one rule,
          and by its production count under another. The gap between the two figures is real,
          and it converts directly into a currency spread anyone can argue about.
        </>
      ),
      duration: 5.0,
      fig: "one header meter's total, allocated to one line by two different rules, with the gap between them converted into an actual currency spread",
      takeaway: 'Two defensible allocation rules gave two different energy figures for the identical header meter.',
      Visual: S.RevealAllocation,
    },
    {
      title: 'Recap',
      body: (
        <>
          A difference breaks in three distinct ways. A reset bounded rather than hidden. A swap
          split rather than diffed. Power integrated rather than averaged. And an allocation
          rule's own uncertainty costed in real currency, not left as an abstract range.
        </>
      ),
      duration: 5.2,
      fig: 'three distinct ways a difference breaks, a bounded reset, a split swap, integration over averaging, and a costed allocation spread',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A sustainability report needs one energy-per-good-unit figure for a line fed by a
          shared header meter. Does the choice of allocation rule change that reported figure?
        </>
      ),
      duration: 3.6,
      fig: 'a sustainability report needs one energy-per-good-unit figure for a shared-header-meter line — does the allocation rule change the reported number?',
      predict: {
        options: [
          { label: 'No — energy per unit is a physical fact once the energy is measured' },
          {
            label: 'Yes — the reported figure depends on which allocation rule produced the energy it was divided from',
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. The energy a shared meter actually used is one number; how much of it belongs to
            one line is a modelling choice, and the KPI divides by whichever choice was made.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
