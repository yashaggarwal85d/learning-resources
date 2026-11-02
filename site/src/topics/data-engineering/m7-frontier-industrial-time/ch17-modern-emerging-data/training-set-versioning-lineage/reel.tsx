import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows (the snapshot surviving a mutation, the content-hash dedup, the
// tracker search, the label-flip rate) is measured for real in examples.py against this sandbox's
// own Postgres cluster and local file hashing.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A model's offline AUC was reported six months ago from a dataset no one can rebuild
          today. The source tables have since been compacted, and the query that built it was
          never saved.
        </>
      ),
      duration: 2.6,
      fig: 'same SQL, a different answer. The tables underneath kept moving.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which tool fits which',
      body: (
        <>
          Two tools exist for this: one built for a whole derived lake dataset, one built for a
          file next to a training script. Which fits a dataset this size?
        </>
      ),
      duration: 2.4,
      fig: 'a lake-scale dataset, or a single file next to a script?',
      predict: {
        options: [
          { label: "Doesn't matter — any versioning tool works the same at any scale" },
          { label: 'It depends on scale — a lake-scale derived set needs a different tool than a single tracked file', correct: true },
        ],
        explain: (
          <>
            A tool built to branch a whole data lake and a tool built to pin a single file solve
            different problems. Picking by scale, not by habit, is the actual decision this topic
            teaches.
          </>
        ),
      },
      Visual: S.PredictWhichToolFits,
    },
    {
      title: 'Reveal: a moving target vs. a pinned one',
      body: (
        <>
          "The current table" keeps moving under a query. A snapshot or a tag is a named,
          immutable reference to one exact state of the data.
        </>
      ),
      duration: 4.2,
      fig: 'a pinned snapshot stays exactly where it was named.',
      Visual: S.RevealMovingVsPinned,
    },
    {
      title: 'Reveal: lakeFS branches, the mechanism',
      body: (
        <>
          A branch is a pointer to a commit plus any uncommitted changes — creating one copies no
          data. A tag gives one commit a name you can reuse.
        </>
      ),
      duration: 4.2,
      fig: 'a branch is a pointer to a commit, not a copy.',
      takeaway: "A lakeFS branch isn't a copy of the data. It's a pointer to a commit, duplicating nothing.",
      Visual: S.RevealLakefsBranches,
    },
    {
      title: 'Reveal: DVC pins, the mechanism',
      body: (
        <>
          DVC identifies a file by the hash of its contents, not its name or path. Two files with
          identical bytes share one cache entry.
        </>
      ),
      duration: 4.2,
      fig: 'identity is the hash of the contents, not the name.',
      takeaway: "DVC doesn't pin a filename. It pins the exact bytes, so a renamed, identical file costs nothing extra.",
      Visual: S.RevealDvcPins,
    },
    {
      title: 'Reveal: the decision, by scale',
      body: (
        <>
          A whole derived lake dataset gets a lakeFS branch: an isolated view, merged once
          validated. A file next to a training script gets a DVC pin: a content hash that travels
          with the Git commit.
        </>
      ),
      duration: 4.2,
      fig: 'the lake dataset gets a branch. The file gets a pin.',
      takeaway: 'The choice between lakeFS and DVC follows the scale of what you version, never a preference.',
      Visual: S.RevealDecisionByScale,
    },
    {
      title: "Reveal: linking it in an experiment tracker",
      body: (
        <>
          MLflow 3's LoggedModel ties a model run to its dataset digest and its code version in
          one record, and makes models searchable by which dataset trained them.
        </>
      ),
      duration: 4.2,
      fig: 'dataset digest, code commit and model run, linked.',
      takeaway: "A dataset snapshot and a code pin prove nothing alone unless something links them to the model they trained.",
      Visual: S.RevealExperimentTracker,
    },
    {
      title: 'Reveal: label-version drift',
      body: (
        <>
          A label can change its own definition — a new churn window, a corrected policy. The same
          features under a changed label are not the same training set.
        </>
      ),
      duration: 4.2,
      fig: 'same features, two label definitions, different labels.',
      takeaway: 'Pinning the features was never enough. If the label definition moved, "the same training set" quietly became a different one.',
      Visual: S.RevealLabelVersionDrift,
    },
    {
      title: 'Recap',
      body: (
        <>
          Query a snapshot, not the current table. Pick the pin by scale. Link dataset, code and
          model in one record. Watch the label's own version, not only the data's.
        </>
      ),
      duration: 4.5,
      fig: 'snapshot, scale, lineage, label version.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team re-trains "on the same dataset" every quarter by re-running the same SQL query
          against the live tables — no snapshot, no tag.
        </>
      ),
      duration: 2.6,
      fig: 'the same query, every quarter. The same dataset?',
      predict: {
        options: [
          { label: 'Yes — the query itself never changed, so the result is reproducible' },
          { label: 'No — a stable query over unstable tables is not a stable dataset', correct: true },
        ],
        explain: (
          <>
            A query is only as reproducible as what it reads. Without a snapshot or a tag pinning
            the source, "the same query" silently returns a different dataset every time the live
            tables move.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
