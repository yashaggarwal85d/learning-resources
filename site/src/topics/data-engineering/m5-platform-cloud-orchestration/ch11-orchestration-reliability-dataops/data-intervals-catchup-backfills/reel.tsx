import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Three real experiments: Airflow's own CronDataIntervalTimetable read directly (logical date vs
// data interval, catchup on vs off), and a real scheduler-managed backfill — `airflow backfill
// create --max-active-runs 2` against a live scheduler, dag-processor, API server and Postgres
// metadata database, killed mid-way and restarted (examples.py, FACT-CHECK.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Someone kicks off a five-year backfill on a Friday "just to be safe." By evening the
          production source is timing out — it's running Monday's extract, five years of times over.
        </>
      ),
      duration: 4.8,
      fig: "a five year backfill. the same source, five years of times over.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: logical date vs data interval, measured',
      body: (
        <>
          A daily run "for" January first owns the interval up to January second — and only
          executes after that interval closes. Read straight from Airflow's own timetable.
        </>
      ),
      duration: 4.8,
      fig: 'logical date is the interval start, not the run time.',
      Visual: S.RevealLogicalDate,
    },
    {
      title: 'Reveal: catchup, off by default, measured',
      body: (
        <>
          Same timetable, same start date. With catchup on, the scheduler starts from the very
          first missed day. With catchup off — the default — it jumps straight to the latest one.
        </>
      ),
      duration: 4.8,
      fig: 'catchup on: the first missed day. catchup off: the latest one.',
      takeaway: 'Catchup decides whether history gets scheduled at all, not how fast it runs once it is.',
      Visual: S.RevealCatchup,
    },
    {
      title: 'Predict: does a backfill get its own budget?',
      body: (
        <>
          A backfill re-issues the same per-partition requests a normal day's run makes. Does
          Airflow give it a separate request budget, or does it spend the production source's one?
        </>
      ),
      duration: 2.8,
      fig: 'same requests, five years of them. whose budget?',
      predict: {
        options: [
          { label: 'A separate backfill budget, throttled on its own' },
          { label: "The source's own budget — the same one today's load competes for", correct: true },
        ],
        explain: (
          <>
            Airflow bounds how many Dag runs a backfill runs at once — not how hard each one hits
            the source it reads from. Every request still comes out of the same rate-limited budget
            production traffic depends on.
          </>
        ),
      },
      Visual: S.PredictBudget,
    },
    {
      title: 'Reveal: bounded concurrency, run for real',
      body: (
        <>
          A real scheduler-managed backfill over ten days, capped at two active runs. Never more
          than two running at once — read back from the real metadata database, not simulated.
        </>
      ),
      duration: 4.8,
      fig: 'ten days backfilled. never more than two running. measured.',
      takeaway: "Bounded concurrency protects the scheduler's own state. It says nothing about the source.",
      Visual: S.RevealBoundedConcurrency,
    },
    {
      title: 'Reveal: kill it, restart it, measured',
      body: (
        <>
          Six days already done. The scheduler is killed mid-run. On restart, those six stay done —
          only the four unfinished days actually run.
        </>
      ),
      duration: 4.8,
      fig: 'six done, killed, restarted. the six stay done. four more run.',
      takeaway: "A resumed backfill isn't a restarted one. Finished work stays finished.",
      Visual: S.RevealKillAndResume,
    },
    {
      title: "Reveal: Dagster's other shape",
      body: (
        <>
          Dagster's default backfill launches one run per partition. Opt into a single run across
          the whole range instead, and one query covers years — no per-partition overhead at all.
        </>
      ),
      duration: 4.8,
      fig: 'one run per partition, or one run for the whole range.',
      Visual: S.RevealDagsterShape,
    },
    {
      title: 'Recap',
      body: (
        <>
          Logical date is the interval's start. Catchup decides what gets scheduled. A backfill is
          bounded and resumable — but it still spends the source's own history-sized budget.
        </>
      ),
      duration: 4.8,
      fig: 'interval start, not run time. bounded. resumable. same budget.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A day already shows success. You re-run a backfill over a range that includes it, with
          the default reprocess setting.
        </>
      ),
      duration: 2.8,
      fig: 'already succeeded. backfilled again. redone?',
      predict: {
        options: [
          { label: 'Yes — a backfill always redoes the whole range' },
          { label: 'No — the default leaves any existing run alone, no matter its state', correct: true },
        ],
        explain: (
          <>
            Airflow's own default reprocess behaviour is "none": if a run already exists for that
            logical date, it creates no new one, regardless of whether that run succeeded or failed.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
