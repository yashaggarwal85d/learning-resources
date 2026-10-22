import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: a shop schema (order_id, customer_id, customer_email, amount), fresh-built for this topic
// since no customers table exists on this sandbox. The closure computation and candidate-key search run as a
// real algorithm in examples.py; the update-anomaly counts are measured directly (SOURCES.md).
const reel: Reel = {
  steps: [
    {
      title: 'Same six rows, two very different schemas',
      body: (
        <>
          One schema needs a single update for a fact that should only ever be one thing. The other needs several
          — and is one missed row away from lying about which email a customer actually has.
        </>
      ),
      duration: 4.8,
      fig: 'denormalized: several updates. normalized: one update.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does normalizing always cost a join later?',
      body: (
        <>
          Splitting data apart to avoid redundancy sounds like it must cost something at read time. Does
          normalizing a schema always mean paying for a join later?
        </>
      ),
      duration: 2.8,
      fig: 'split to avoid redundancy — always a join later?',
      predict: {
        options: [
          { label: 'Yes — every split means a join somewhere downstream' },
          { label: "It depends — on how the data is actually queried", correct: true },
        ],
        explain: (
          <>
            It depends. A point-read workload barely notices a join across small, normalized tables; a scan-heavy
            one pays for it on every row, which is exactly why some schemas deliberately stay denormalized.
          </>
        ),
      },
      Visual: S.PredictNormalizingCostsJoin,
    },
    {
      title: 'Reveal: what a functional dependency actually is',
      body: (
        <>
          <code>X → Y</code> means every <code>X</code> value is associated with precisely one <code>Y</code>{' '}
          value. Here: an order id determines its customer id and amount; a customer id determines its email.
        </>
      ),
      duration: 4.8,
      fig: 'order_id → customer_id, amount. customer_id → customer_email.',
      Visual: S.RevealFunctionalDependency,
    },
    {
      title: 'Reveal: attribute closure, computed',
      body: (
        <>
          Starting from <code>order_id</code> alone, fire every dependency whose left side is already covered.
          Each firing lights up new attributes, until nothing new lights up at all.
        </>
      ),
      duration: 4.4,
      fig: 'order_id → +customer_id, +amount → +customer_email. done.',
      Visual: S.RevealClosureComputation,
    },
    {
      title: 'Reveal: candidate keys, from the closure',
      body: (
        <>
          A candidate key is a minimal attribute set whose closure reaches every attribute. Here, that is{' '}
          <code>order_id</code> alone — and nothing smaller works.
        </>
      ),
      duration: 4.4,
      fig: 'order_id’s closure = every attribute — the candidate key',
      takeaway: 'A candidate key is the smallest attribute set whose closure reaches the whole relation.',
      Visual: S.RevealCandidateKey,
    },
    {
      title: 'Predict: is customer_id a candidate key too?',
      body: (
        <>
          <code>customer_id</code> determines <code>customer_email</code> on its own. Does that make it a
          candidate key as well?
        </>
      ),
      duration: 2.8,
      fig: 'customer_id determines customer_email — a candidate key too?',
      predict: {
        options: [
          { label: 'Yes — it determines another attribute, so it qualifies' },
          { label: "No — its closure stops short of the whole relation", correct: true },
        ],
        explain: (
          <>
            No. <code>customer_id</code>'s closure only ever reaches <code>customer_email</code>; it never
            determines <code>order_id</code> or <code>amount</code>, so it fails the one requirement that
            actually defines a candidate key.
          </>
        ),
      },
      Visual: S.PredictCustomerIdKey,
    },
    {
      title: 'Reveal: why customer_id is not a candidate key',
      body: (
        <>
          Its closure reaches only itself and <code>customer_email</code> — never <code>order_id</code> or{' '}
          <code>amount</code>. Determining one other attribute is not the same as determining all of them.
        </>
      ),
      duration: 4.4,
      fig: "customer_id's closure: {customer_id, customer_email} — stops short",
      Visual: S.RevealWhyNotCandidateKey,
    },
    {
      title: 'Reveal: first through third normal form',
      body: (
        <>
          First normal form: every value atomic, no repeating groups. Second: no attribute depends on only part
          of a composite key. Third: no attribute depends on another non-key attribute instead of the key itself.
        </>
      ),
      duration: 4.8,
      fig: 'atomic values → full-key dependence → no transitive dependence',
      Visual: S.RevealFirstToThird,
    },
    {
      title: 'Reveal: Boyce-Codd normal form, the stricter cut',
      body: (
        <>
          For every dependency <code>X → Y</code>, <code>X</code> itself must be a full candidate key — not just
          determine the dependent side, but qualify as a key in its own right.
        </>
      ),
      duration: 4.4,
      fig: 'every determinant must itself be a candidate key',
      takeaway: 'Boyce-Codd normal form catches a case third normal form still lets through: a determinant that is not a full key.',
      Visual: S.RevealBCNF,
    },
    {
      title: 'Reveal: fourth normal form, for multivalued dependencies',
      body: (
        <>
          A functional dependency ties one value to exactly one other. A multivalued dependency ties one value
          to a set of others — a different shape of redundancy that functional dependencies alone cannot name.
        </>
      ),
      duration: 4.4,
      fig: 'one value, many facts — not one determined value',
      Visual: S.RevealFourthNormalForm,
    },
    {
      title: "Reveal: lossless decomposition, and Heath's theorem",
      body: (
        <>
          Split a relation on a functional dependency's own attributes, and joining the pieces back always
          recovers every row exactly — no decomposition is acceptable without this guarantee.
        </>
      ),
      duration: 4.8,
      fig: 'split on a real FD → join back loses nothing',
      Visual: S.RevealLosslessDecomposition,
    },
    {
      title: 'Reveal: dependency preservation is a separate guarantee',
      body: (
        <>
          A decomposition can be lossless and still lose the ability to check an original rule without a join
          first. Pushing a schema all the way to Boyce-Codd form can cost exactly this.
        </>
      ),
      duration: 4.8,
      fig: 'lossless: mandatory. dependency-preserving: sometimes sacrificed.',
      takeaway: 'Lossless decomposition is never optional; dependency preservation can be the price of going further.',
      Visual: S.RevealDependencyPreservation,
    },
    {
      title: "Reveal: this topic's own measured anomaly",
      body: (
        <>
          Changing one customer's email took several row updates in the denormalized table and a single update
          in the normalized one. Updating only some of those rows left two different emails on file at once.
        </>
      ),
      duration: 4.8,
      fig: 'several rows updated vs. one row — then two emails on file at once',
      Visual: S.RevealMeasuredAnomaly,
    },
    {
      title: 'Reveal: denormalization is still a deliberate trade',
      body: (
        <>
          A scan-heavy workload pays for a join on every row it touches, which is exactly the OLAP shape from
          earlier in this chapter. Accepting the anomaly risk on purpose, to avoid that cost, is a trade — not a
          mistake.
        </>
      ),
      duration: 4.8,
      fig: 'OLAP shape → fewer joins at read time, on purpose',
      takeaway: 'Denormalizing on purpose trades anomaly risk for read speed; it is a choice, not an oversight.',
      Visual: S.RevealDenormalizationTrade,
    },
    {
      title: 'Recap',
      body: (
        <>
          A dependency, a closure, a candidate key. Four rungs, each adding one more guarantee. Lossless is
          mandatory; dependency preservation can be sacrificed. Denormalizing on purpose trades anomaly risk for
          read speed.
        </>
      ),
      duration: 4.8,
      fig: 'FD → closure → key → four rungs → lossless always, preservation sometimes',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new relation has one functional dependency: the order id determines every other attribute directly,
          and nothing else determines anything. What is its only candidate key?
        </>
      ),
      duration: 2.8,
      fig: 'order_id determines everything else — the candidate key is?',
      predict: {
        options: [
          { label: 'Every attribute together' },
          { label: 'order_id alone', correct: true },
        ],
        explain: (
          <>
            <code>order_id</code> alone: its closure already reaches every attribute directly, so no larger set
            is needed, and no smaller set exists to try.
          </>
        ),
      },
      Visual: S.ProveCandidateKey,
    },
  ],
};

export default reel;
