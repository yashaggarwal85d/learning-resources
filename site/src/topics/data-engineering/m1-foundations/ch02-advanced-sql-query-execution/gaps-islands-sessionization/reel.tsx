import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// From events to episodes. Running example: one customer's 8 clicks at minutes 0, 12, 25, 80, 95, 200, 202 and 230; with a
// 30-minute inactivity threshold they form 3 sessions. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Events are points; questions are about episodes',
      body: (
        <>
          A clickstream is a pile of single events. The questions people ask are about visits: how long did it last, how many did this customer make.
          Eight clicks on a timeline hide <b>3</b> visits, separated by gaps of inactivity.
        </>
      ),
      duration: 3.4,
      Visual: S.Timeline,
    },
    {
      title: 'LAG looks at the row before',
      body: (
        <>
          <code>LAG(event_time)</code> reads the previous row in the same partition, so subtracting it gives the gap since the last event. The first event
          of each customer has no previous row, so its gap is NULL.
        </>
      ),
      duration: 3.8,
      Visual: S.Lag,
    },
    {
      title: 'Predict: the gap of the first event',
      body: <>What does LAG return for the first event of a customer&rsquo;s history?</>,
      duration: 1.4,
      predict: {
        options: [{ label: 'Zero' }, { label: 'NULL', correct: true }, { label: 'The next row’s time' }, { label: 'An error' }],
        explain: <>NULL. There is no earlier row, so LAG returns its default, which is NULL unless you give one. That NULL is the signal that a visit starts here.</>,
      },
      Visual: S.FirstPredict,
    },
    {
      title: 'Flag the rows that start a session',
      body: (
        <>
          A row starts a new session if its gap is NULL or longer than the threshold. With 30 minutes, three rows are flagged: the very first, the one after
          the 55-minute pause, and the one after the 105-minute pause.
        </>
      ),
      duration: 4,
      Visual: S.Flags,
    },
    {
      title: 'A running sum of flags is the session id',
      body: (
        <>
          Add up the flags down the ordered rows. The sum only rises at a row that starts a visit, so it stays flat inside one and steps by exactly 1 at
          the next: <b>1, 1, 1, 2, 2, 3, 3, 3</b>. That is a session id.
        </>
      ),
      duration: 4.4,
      Visual: S.RunningSum,
    },
    {
      title: 'Predict: the id of the fourth event',
      body: <>The flags are 1, 0, 0, 1, 0, 1, 0, 0. What session id does the fourth event get?</>,
      duration: 1.6,
      predict: {
        options: [{ label: '1' }, { label: '2', correct: true }, { label: '3' }, { label: '4' }],
        explain: <>Two. The running sum through the fourth row is 1 + 0 + 0 + 1 = 2: the fourth event is the first of the second visit.</>,
      },
      Visual: S.FourthPredict,
    },
    {
      title: 'Runs of a fixed condition: subtract two row numbers',
      body: (
        <>
          With no time threshold, only a condition like &ldquo;active that day&rdquo;, number all rows and number the matching rows separately. Their
          difference is constant inside one unbroken run and jumps when the run breaks.
        </>
      ),
      duration: 4.4,
      Visual: S.Difference,
    },
    {
      title: 'Predict: which technique for a 30-minute timeout?',
      body: <>A visit ends after 30 minutes of inactivity. Which island technique fits?</>,
      duration: 1.6,
      predict: {
        options: [{ label: 'Row-number difference' }, { label: 'Running sum of a flag', correct: true }, { label: 'Either, they are the same' }],
        explain: <>The running sum of a flag. The difference trick finds runs of consecutive rows meeting a fixed condition; a time threshold needs the gap itself to decide where a run breaks.</>,
      },
      Visual: S.TechniquePredict,
    },
    {
      title: 'Ties do not change the ids',
      body: (
        <>
          Two events with the same timestamp have a gap of 0, which never starts a session. Whichever one <code>LAG</code> sees first, both end up in the
          same visit. Ties matter only when you pick a particular event inside a visit.
        </>
      ),
      duration: 4,
      Visual: S.Ties,
    },
    {
      title: 'Compress the stream into state intervals',
      body: (
        <>
          Group by customer and session id and take the earliest and latest time. The 8 events collapse to <b>3</b> rows, each a visit with a start, an
          end and a size, which is what most reports actually want.
        </>
      ),
      duration: 4,
      Visual: S.Compress,
    },
    {
      title: 'Back to the clickstream',
      body: (
        <>
          LAG finds the gap, a threshold flags the starts, a running sum numbers the visits, a group by shrinks them to intervals. Treat the threshold as a
          business parameter and materialise the sessions table.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 2',
      body: <>Which window function reads the previous row of the partition?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'LEAD' }, { label: 'LAG', correct: true }, { label: 'FIRST_VALUE' }],
        explain: <>LAG. LEAD reads the next row.</>,
      },
      Visual: S.ProveLag,
    },
    {
      title: 'Prove it · 2 of 2',
      body: <>With a 30-minute threshold, gaps of 5, 45 and 10 minutes follow a first event. How many sessions are there?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '1' }, { label: '2', correct: true }, { label: '3' }],
        explain: <>Two. Only the 45-minute gap exceeds the threshold, so there is the first event's session and one more after the gap.</>,
      },
      Visual: S.ProveSessions,
    },
  ],
};

export default reel;
