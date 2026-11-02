import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real SQL run through a live PySpark 4.0.1 session (examples.py): an int
// overflow and a malformed string-to-INT cast each raise a real exception under
// spark.sql.ansi.enabled=true, and silently return a wrapped value or NULL under false;
// try_cast and try_add return NULL on the same inputs regardless of the setting; inserting a
// non-numeric string into an INT column raises under spark.sql.storeAssignmentPolicy=ANSI and
// silently converts under LEGACY, a setting independent of spark.sql.ansi.enabled.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Every example run so far in this chapter ran on Spark 4.x, with ANSI mode already on.
          This topic is the thing that changed to make that true.
        </>
      ),
      duration: 4.5,
      fig: 'every example so far ran with ANSI on. What changed to make that true?',
      Visual: S.Hook,
    },
    {
      title: "Reveal: ANSI mode flips the default answer to a bad value",
      body: (
        <>
          ANSI mode flips the default answer to "what happens on a bad value." Overflow, a bad
          cast, or a division by zero now raise an error instead of silently returning NULL.
        </>
      ),
      duration: 4.8,
      fig: 'a bad value used to return NULL. ANSI mode makes it raise instead.',
      Visual: S.RevealFlipsDefault,
    },
    {
      title: "Predict: an int overflow, ANSI mode on. Raises an error, or wraps to negative?",
      body: (
        <>
          The largest signed integer its type can hold, plus one, with ANSI mode on. Does it raise an error, or
          does it wrap around to a negative number the way it used to?
        </>
      ),
      duration: 2.8,
      fig: 'max int plus one, ANSI on. Error, or wraps to negative?',
      predict: {
        options: [
          { label: 'Wraps — arithmetic just overflows the way integers always have' },
          { label: 'Raises an error — ANSI mode treats overflow as invalid', correct: true },
        ],
        explain: (
          <>
            Raises an error. ANSI mode makes overflow a runtime exception, not a silent
            wraparound — that silent behavior is now something you have to opt back into.
          </>
        ),
      },
      Visual: S.PredictOverflow,
    },
    {
      title: 'Reveal: raises an error -- ANSI off wraps to negative, measured',
      body: (
        <>
          Measured: the same expression raises a real exception with ANSI mode on, and wraps to
          a negative number with ANSI mode off, matching Spark 3.x and earlier.
        </>
      ),
      duration: 4.8,
      fig: 'ANSI on: raises. ANSI off: wraps to negative. Same expression.',
      Visual: S.RevealOverflowErrors,
    },
    {
      title: "Elaborate: store assignment is its own separate knob",
      body: (
        <>
          Casting on table insert follows its own rule, spark.sql.storeAssignmentPolicy, set
          independently of spark.sql.ansi.enabled -- flipping one doesn't flip the other.
        </>
      ),
      duration: 5,
      fig: 'inserting into a table has its own separate ANSI-style setting.',
      takeaway: "ANSI mode and store-assignment rules are two separate settings; one can be on while the other is off.",
      Visual: S.ElaborateStoreAssignment,
    },
    {
      title: "Predict: casting 'a' to INT, ANSI mode on. Raises an error, or returns NULL?",
      body: (
        <>
          Casting the letter "a" to an integer, with ANSI mode on. Does it raise an error, or
          does it quietly return NULL the way a malformed cast used to?
        </>
      ),
      duration: 2.8,
      fig: 'cast the letter "a" to INT, ANSI on. Error, or NULL?',
      predict: {
        options: [
          { label: 'Raises an error — ANSI mode treats a malformed cast as invalid', correct: true },
          { label: "Returns NULL — a cast that can't work just produces nothing" },
        ],
        explain: (
          <>
            Raises an error. A string that can't be parsed as an integer is now a runtime
            exception under ANSI mode, not a silent NULL.
          </>
        ),
      },
      Visual: S.PredictCast,
    },
    {
      title: 'Reveal: raises an error -- ANSI off returns NULL, measured',
      body: (
        <>
          Measured: the same cast raises a real exception with ANSI mode on, and returns NULL
          with ANSI mode off -- the pre-4.0 default behavior.
        </>
      ),
      duration: 4.8,
      fig: 'ANSI on: raises. ANSI off: returns NULL. Same cast.',
      Visual: S.RevealCastErrors,
    },
    {
      title: "Elaborate: try_cast and try_add bring NULL-on-error back on purpose",
      body: (
        <>
          try_cast, try_add, and try_divide return NULL on the same inputs even with ANSI mode
          on -- one expression opting back into the old behavior, without turning ANSI off.
        </>
      ),
      duration: 5,
      fig: 'try_cast, try_add: NULL on purpose, even with ANSI mode on.',
      takeaway: "The try_* functions let one expression opt out of ANSI's error path, without turning the setting off everywhere.",
      Visual: S.ElaborateTryFunctions,
    },
    {
      title: "Reveal: porting an older job means finding every changed expression",
      body: (
        <>
          Migrating an older job is mechanical: run the same suite in both modes, diff the outputs,
          then audit every implicit cast the diff turns up.
        </>
      ),
      duration: 5,
      fig: 'both modes, diffed outputs, then audit every cast the diff finds.',
      Visual: S.RevealMigrationMethod,
    },
    {
      title: 'Recap',
      body: (
        <>
          One setting flipped the default answer to a bad value, from silent NULL to a real
          error -- with a named way back in, one expression at a time.
        </>
      ),
      duration: 5,
      fig: 'one flipped default, and a named way to opt one expression out.',
      takeaway: "ANSI mode changed what a bad value does by default; the try_* functions are how one expression declines that change.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
