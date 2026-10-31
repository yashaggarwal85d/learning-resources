import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed clock-offset, UTC/local, shift-calendar and event-time-choice
// computation (examples.py). No numbers are repeated on screen beyond what that
// file computes.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a night shift that ran at more than full speed",
      body: (
        <>
          On the last Sunday of March, the Munich plant's night shift reads above full
          output. The shift calendar assumes a fixed length, and the clocks went forward
          that night. The shift ran short, not fast.
        </>
      ),
      duration: 5.4,
      fig: "a plant's night shift reads above full output on the last Sunday of March; the shift calendar assumes a fixed length and the clocks went forward that night",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: three clocks, three different jobs',
      body: (
        <>
          A reading carries a device timestamp, a gateway timestamp and an ingest
          timestamp. Device is closest to the truth but only as trustworthy as the
          sensor's own clock. Ingest is steady but says when the platform heard, not
          when it happened.
        </>
      ),
      duration: 5.2,
      fig: "a reading's device, gateway and ingest timestamps, each landing later than the last — device closest to the truth, ingest steady but late",
      Visual: S.RevealThreeClocks,
    },
    {
      title: "Predict: can a backwards NTP step still land out of order?",
      body: (
        <>
          A sensor's clock gets corrected backwards between two readings taken seconds
          apart. Does the second reading's own device timestamp still come after the
          first's?
        </>
      ),
      duration: 4.4,
      fig: "a sensor's clock is corrected backwards between two readings taken seconds apart — does the second reading's device timestamp still come after the first's?",
      predict: {
        options: [
          { label: 'Yes — a device timestamp always increases' },
          {
            label: "No — the step can put the later reading's timestamp before the earlier one's",
            correct: true,
          },
        ],
        explain: (
          <>
            No. The device clock is the one of the three that can actually be stepped;
            the gateway and ingest clocks, never corrected mid-stream, stay in order
            regardless.
          </>
        ),
      },
      Visual: S.PredictStep,
    },
    {
      title: 'Reveal: the step, measured',
      body: (
        <>
          Two readings taken a second apart on the wall clock. After the correction
          lands between them, the second reading's own device timestamp comes before
          the first's, even while gateway and ingest both still increase.
        </>
      ),
      duration: 5.0,
      fig: "after an NTP correction lands between two readings taken a second apart, the second's device timestamp comes before the first's, while gateway and ingest still increase",
      Visual: S.RevealStepMeasured,
    },
    {
      title: 'Reveal: UTC stored, local rendered',
      body: (
        <>
          One instant stored once in UTC, with its zone kept as a separate fact.
          Rendered back into the plant's own local time and offset on demand, never
          the other way around.
        </>
      ),
      duration: 4.6,
      fig: "one instant stored once in UTC with its zone kept separately, rendered back into the plant's own local time and offset on demand",
      takeaway: "An instant stored in UTC renders into any local time — stored bare in local time, it never works backwards.",
      Visual: S.RevealUtcLocal,
    },
    {
      title: 'Reveal: a calendar generated, not hard-coded',
      body: (
        <>
          The tz database itself, not a fixed table, produces a shift's boundaries for
          a given zone and date. An ordinary night comes out one length. The two
          clock-change nights come out shorter and longer.
        </>
      ),
      duration: 5.0,
      fig: "a shift calendar generated from the tz database for a given zone and date, giving an ordinary night one length and the two clock-change nights a shorter and a longer one",
      Visual: S.RevealGeneratedCalendar,
    },
    {
      title: 'Reveal: the same bug, in a different chapter',
      body: (
        <>
          Divide the real output by a shift length that was never actually generated
          for that night. On the short night, the result comes out above full output,
          which is the shift-boundary bug again, now caused by a clock change instead
          of a crossing downtime event.
        </>
      ),
      duration: 5.2,
      fig: "dividing the real output by a hard-coded shift length, on the night the shift actually ran short, gives a result above full output — the shift-boundary bug again, caused by a clock change",
      takeaway: "A result above full output isn't a great shift — it's evidence the denominator, not the numerator, is wrong.",
      Visual: S.RevealSameBug,
    },
    {
      title: 'Reveal: choosing event time, and recording the choice',
      body: (
        <>
          A per-signal rule: the device clock when it's disciplined and close enough to
          the gateway's, otherwise the gateway clock. The chosen source is written down
          as its own column, not left for a reader to guess.
        </>
      ),
      duration: 5.0,
      fig: "a per-signal rule chooses device clock when disciplined and close enough, otherwise gateway; the chosen source is written down as its own column",
      takeaway: "Which clock counted as event time was written down as data, not left for a reader to guess.",
      Visual: S.RevealEventTime,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three clocks, each good for something different. A backwards step breaks the
          one a pipeline trusted most. UTC storage with local rendering, never the
          reverse. A generated calendar catches what a fixed one cannot. Event time is a
          stated, recorded decision.
        </>
      ),
      duration: 5.6,
      fig: 'three clocks each good for something different, a backwards step, UTC storage rendered local, a generated calendar, and a recorded event-time decision',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A different plant reports its night shift ran exactly the same length every
          single day of the year, including both clock-change nights. Is that plant's
          shift table trustworthy?
        </>
      ),
      duration: 4.2,
      fig: 'a plant reports its night shift ran exactly the same length every day of the year, including both clock-change nights — is that shift table trustworthy?',
      predict: {
        options: [
          { label: 'Yes — a full year of consistency is strong evidence it works' },
          {
            label: "No — the same length on both clock-change nights is itself the red flag",
            correct: true,
          },
        ],
        explain: (
          <>
            No. A shift that truly spans a clock change cannot run the same length as an
            ordinary night; reporting the same number on those two nights is evidence of
            a fixed table, not evidence it's right.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
