import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A checkpoint taken after the real commit returns restarts without
// losing or repeating a single real record; one taken before it can
// look identical, until a crash lands in between the two.
const reel: Reel = {
  steps: [
    {
      title: 'A real pipeline checkpoints only once a batch own real commit has genuinely returned, never before. It crashes mid-stream, right as its fifteenth real batch begins committing. Does a restart from that real checkpoint reprocess anything already committed, or lose anything that was not?',
      body: (
        <>
          A real checkpoint, taken only after the commit returns.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It reprocesses whatever was already committed, to be safe' },
          { label: 'It reprocesses nothing already committed and loses nothing', correct: true },
          { label: 'It depends on how long the crash takes to notice' },
        ],
        explain: (
          <>
            It picks up exactly where it genuinely left off.
          </>
        ),
      },
      Visual: S.CorrectPredict,
    },
    {
      title: 'Measured: the real, correct pipeline own checkpoint lands on exactly the fourteenth batch, the identical real batch its own commit genuinely finished last, so a restart from that checkpoint reprocesses zero batches and loses zero records',
      body: (
        <>
          Fourteen real commits, a checkpoint that matches exactly.
        </>
      ),
      duration: 3.0,
      Visual: S.CorrectReveal,
    },
    {
      title: 'The identical real crash, at the identical real point, this time against a second pipeline that checkpoints the moment a batch is merely handed to the sink, before its own real commit has run at all. Does its own real checkpoint still match what was genuinely committed, or does it run ahead?',
      body: (
        <>
          A second pipeline, a checkpoint taken too early.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It still matches, since handoff happens right before the commit' },
          { label: 'It runs one real batch ahead of what was genuinely committed', correct: true },
          { label: 'It depends on how slow the commit itself is' },
        ],
        explain: (
          <>
            It runs one batch ahead of what genuinely happened.
          </>
        ),
      },
      Visual: S.WrongPredict,
    },
    {
      title: 'Measured: the real, wrong pipeline own checkpoint lands on the fifteenth batch, one real batch ahead of the fourteen its own commits genuinely finished, because the crash landed exactly while that fifteenth commit was still in flight',
      body: (
        <>
          One real batch, claimed done before it ever was.
        </>
      ),
      duration: 3.0,
      takeaway: 'A checkpoint taken before the real commit records a promise the pipeline never actually kept.',
      Visual: S.WrongReveal,
    },
    {
      title: 'The real, wrong pipeline own restart resumes from the batch after its own real checkpoint, the sixteenth, skipping the fifteenth entirely. Does that fifteenth batch own real records get reprocessed later, or are they gone?',
      body: (
        <>
          A restart that skips right past the fifteenth batch.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Reprocessed later, once the pipeline catches up' },
          { label: 'Gone, permanently, since restart never looks at that batch again', correct: true },
          { label: 'It depends on whether the source still has them' },
        ],
        explain: (
          <>
            Gone, permanently, with nothing left to retry it.
          </>
        ),
      },
      Visual: S.RestartPredict,
    },
    {
      title: 'Measured: the real, wrong pipeline own restart genuinely loses the fifteenth batch own full set of records, permanently, since its checkpoint told it that batch was already done',
      body: (
        <>
          Ten real records, lost the moment restart resumed.
        </>
      ),
      duration: 3.0,
      takeaway: 'An advanced checkpoint does not reprocess too much; it loses whatever was never actually, durably committed.',
      Visual: S.RestartReveal,
    },
    {
      title: 'The Rust standard library own documentation on a real, durable file sync states this directly: a real commit own job is to make sure in-memory data genuinely reaches the filesystem before it returns; a checkpoint taken before that return has happened is a checkpoint for a commit that has not, in fact, happened yet',
      body: (
        <>
          A real sync, in the standard library own words.
        </>
      ),
      duration: 2.8,
      takeaway: 'A real checkpoint is only as true as the real commit it follows, never the one it merely anticipates.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a checkpoint only as true as its commit',
      body: (
        <>
          A real checkpoint taken after a real commit genuinely returns lets a restart pick up exactly where it left off, reprocessing nothing and losing nothing; a real checkpoint taken before that same commit returns can look identical right up until a real crash lands in between, at which point it silently erases whatever was never actually, durably committed.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
