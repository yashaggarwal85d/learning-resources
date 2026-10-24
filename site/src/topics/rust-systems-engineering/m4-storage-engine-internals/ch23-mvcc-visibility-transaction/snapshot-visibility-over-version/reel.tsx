import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Visibility is a function of a version's own metadata and a reader's
// fixed snapshot, never the newest row written; a writer appends a
// new version instead of overwriting one a reader may still need,
// which is exactly what lets PostgreSQL's own documentation guarantee
// that reading never blocks writing and writing never blocks reading.
const reel: Reel = {
  steps: [
    {
      title: "A row's version chain has an old, committed version and a newer version just written by a transaction that hasn't committed yet. Which one does an existing reader's own snapshot see?",
      body: (
        <>
          One chain, one old committed version, one newer uncommitted version.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Whichever version is physically last in the chain' },
          { label: 'The old, committed version, until the new one actually commits', correct: true },
          { label: 'It depends on which one is smaller' },
        ],
        explain: (
          <>
            The old, committed version. The new one is invisible until it commits.
          </>
        ),
      },
      Visual: S.OldVersionPredict,
    },
    {
      title: "Measured: the old version, not the chain's own newest row",
      body: (
        <>
          Visibility is a function of version metadata and the snapshot, never simply the newest row written.
        </>
      ),
      duration: 3.0,
      Visual: S.OldVersionReveal,
    },
    {
      title: "That same newer version's writer now commits. Does the original reader's own snapshot change what it sees?",
      body: (
        <>
          The writer committing, the original reader still holding its own snapshot.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, it now sees the newly committed version' },
          { label: 'No, it keeps seeing exactly what it saw before', correct: true },
          { label: 'Only if the reader re-reads from the very start of the chain' },
        ],
        explain: (
          <>
            No change. A snapshot, once taken, stays fixed.
          </>
        ),
      },
      Visual: S.AfterCommitPredict,
    },
    {
      title: "Measured: the reader's snapshot kept seeing exactly what it saw before, even after that writer committed",
      body: (
        <>
          The real, measured result, unchanged.
        </>
      ),
      duration: 3.0,
      takeaway: 'A snapshot taken once stays fixed for its own reader, however many other transactions commit around it.',
      Visual: S.AfterCommitReveal,
    },
    {
      title: "A transaction updates a row it can see. Does that update ever overwrite the existing version's own stored fields in place?",
      body: (
        <>
          An update event, the existing version sitting right there.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Yes, the existing version's own fields are rewritten directly" },
          { label: 'No, never; a brand-new version is appended and only the old xmax is stamped', correct: true },
          { label: 'Only when no other reader could possibly still hold a snapshot of it' },
        ],
        explain: (
          <>
            Never. A brand-new version is appended instead.
          </>
        ),
      },
      Visual: S.NoOverwritePredict,
    },
    {
      title: "Measured: the superseded version's own fields were never touched; a brand-new version was appended instead",
      body: (
        <>
          The real, measured chain growth, one version added, the old one's own fields bit-for-bit unchanged.
        </>
      ),
      duration: 3.0,
      takeaway: 'A writer appends a new version instead of overwriting one a reader needs; that lets neither block the other.',
      Visual: S.NoOverwriteReveal,
    },
    {
      title: "PostgreSQL's own documentation states this guarantee directly. Does MVCC let a long write ever force a concurrent read to wait, or the reverse?",
      body: (
        <>
          PostgreSQL's own words on reading and writing, shown directly.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'A long write forces concurrent reads to wait' },
          { label: 'A long read forces concurrent writes to wait' },
          { label: 'Neither; reading never blocks writing and writing never blocks reading', correct: true },
        ],
        explain: (
          <>
            Neither. Readers and writers never block each other.
          </>
        ),
      },
      Visual: S.NeverBlockPredict,
    },
    {
      title: "PostgreSQL's own words, directly: reading never blocks writing, and writing never blocks reading",
      body: (
        <>
          The real quoted guarantee, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'MVCC buys that guarantee by giving every reader its own fixed snapshot instead of a lock on the row.',
      Visual: S.NeverBlockReveal,
    },
    {
      title: "PostgreSQL's own system columns name exactly what this prototype's own version metadata stands in for: what does its xmin column actually record?",
      body: (
        <>
          PostgreSQL's own xmin/xmax definitions, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.SystemColumnsReveal,
    },
    {
      title: 'Recap: what a version chain guarantees, and what a snapshot fixes',
      body: (
        <>
          Visibility is a function of a version's own metadata and a reader's fixed snapshot, never the newest row written; a writer appends a new version instead of overwriting one a reader may still need, which is exactly what lets PostgreSQL's own documentation guarantee that reading never blocks writing and writing never blocks reading.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
