import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real FK-constrained natural-key pair vs. a surrogate-key pair (SOURCES.md),
// and real PostgreSQL generation-cost / index-locality numbers for sequence vs. UUIDv7 vs. UUIDv4
// (examples.py). The hash-collision numbers are computed by the birthday-bound formula, not asserted.
const reel: Reel = {
  steps: [
    {
      title: 'Same email change, two schemas',
      body: (
        <>
          A customer changes her email address — an ordinary business event. One schema blocks the update
          outright. The other absorbs it in a single row, and every order still resolves.
        </>
      ),
      duration: 4.8,
      fig: 'natural key: update blocked. surrogate key: one row changes.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what happens when the email changes?',
      body: (
        <>
          If a customer's email address is the primary key everywhere it is referenced, what happens the moment
          that customer changes it?
        </>
      ),
      duration: 2.8,
      fig: 'email is the key everywhere it is referenced — then it changes',
      predict: {
        options: [
          { label: 'Nothing — the database updates every reference automatically' },
          { label: 'The update is blocked, or every reference must cascade', correct: true },
        ],
        explain: (
          <>
            Blocked, unless the foreign key is explicitly set to cascade — and even then, every row that ever
            referenced the old value has to be touched.
          </>
        ),
      },
      Visual: S.PredictEmailChanges,
    },
    {
      title: 'Reveal: the natural key breaks, measured',
      body: (
        <>
          A real foreign-key-constrained table pair, the actual update attempted: PostgreSQL refuses it, because
          orders still reference the email about to change.
        </>
      ),
      duration: 4.8,
      fig: 'UPDATE customer_email → ERROR: still referenced from orders',
      Visual: S.RevealNaturalKeyBreaks,
    },
    {
      title: 'Reveal: the surrogate key absorbs it',
      body: (
        <>
          Same event, a surrogate <code>customer_id</code> in place of the email: the update succeeds, one row
          changes, and every order still resolves by the id that never moved.
        </>
      ),
      duration: 4.8,
      fig: 'UPDATE succeeds. one row changed. orders still resolve.',
      takeaway: 'A surrogate key is chosen specifically so it never has a reason to change.',
      Visual: S.RevealSurrogateKeyAbsorbs,
    },
    {
      title: 'Reveal: natural vs. surrogate, defined',
      body: (
        <>
          A natural key is a business attribute, reused as identity. A surrogate key is a system-generated
          identifier with no business meaning at all — that absence of meaning is the whole point.
        </>
      ),
      duration: 4.8,
      fig: 'natural: a business attribute. surrogate: meaningless on purpose.',
      Visual: S.RevealNaturalVsSurrogate,
    },
    {
      title: 'Predict: is a sequence safe in a distributed pipeline?',
      body: (
        <>
          Several writers generate rows independently, with no single coordinator between them. Is an
          auto-increment sequence still a safe choice for the key?
        </>
      ),
      duration: 2.8,
      fig: 'several independent writers — one shared sequence?',
      predict: {
        options: [
          { label: 'Yes — a sequence always returns the next number' },
          { label: 'No — a sequence assumes one coordinator issuing values', correct: true },
        ],
        explain: (
          <>
            A sequence lives on one database; every writer needs a round trip to it. That is exactly the
            coordination a distributed pipeline is usually built to avoid.
          </>
        ),
      },
      Visual: S.PredictSequenceDistributed,
    },
    {
      title: "Reveal: a sequence's own docs admit the gaps",
      body: (
        <>
          PostgreSQL's own sequence docs: <code>nextval</code> is never rolled back, so gapless assignment is not
          available from a sequence, and caching breaks strict cross-session order — the single-writer assumption
          a distributed pipeline doesn't have.
        </>
      ),
      duration: 4.8,
      fig: 'nextval never rolls back — cache breaks cross-session order',
      Visual: S.RevealSequenceGaps,
    },
    {
      title: 'Reveal: generation cost, measured',
      body: (
        <>
          One hundred thousand inserts each, same pre-built index: a sequence fastest, UUIDv7 next, UUIDv4
          slowest — in that order, every time.
        </>
      ),
      duration: 4.8,
      fig: 'sequence fastest, then uuidv7, then uuidv4 — same order, every run',
      Visual: S.RevealGenerationCost,
    },
    {
      title: "Reveal: UUIDv4's own index locality cost, measured",
      body: (
        <>
          Same inserts, <code>pgstatindex()</code> on each index after: sequence and UUIDv7 both land near ninety
          percent leaf density. UUIDv4's random insert order leaves its index past a third empty.
        </>
      ),
      duration: 4.8,
      fig: 'sequence and uuidv7: dense, few pages. uuidv4: emptier, more pages.',
      takeaway: "The UUID RFC's own claim about UUIDv4's poor index locality, reproduced directly on this sandbox.",
      Visual: S.RevealIndexLocality,
    },
    {
      title: 'Reveal: why UUIDv7 keeps that locality',
      body: (
        <>
          A forty-eight-bit millisecond timestamp occupies the leading bits. Two UUIDv7 values generated back to
          back share that whole prefix — measured directly, here, a moment apart.
        </>
      ),
      duration: 4.8,
      fig: 'uuidv7: leading prefix shared. uuidv4: no shared prefix at all.',
      Visual: S.RevealUUIDv7BitLayout,
    },
    {
      title: 'Reveal: durable key, previewed',
      body: (
        <>
          A dimension row that gets a new version (this chapter's own SCD2, ahead) needs a key that stays constant
          across every version, separate from the surrogate key that changes with each one.
        </>
      ),
      duration: 4.8,
      fig: 'durable key: constant across versions. surrogate: changes per version.',
      Visual: S.RevealDurableKey,
    },
    {
      title: 'Predict: can a hash key collide?',
      body: (
        <>
          Data Vault's own pattern hashes a business key to get a surrogate. Is a collision there a real,
          quantifiable risk, or just a caveat to mention and move past?
        </>
      ),
      duration: 2.8,
      fig: 'hash a business key — a real risk, or just a caveat?',
      predict: {
        options: [
          { label: 'Negligible always — hashes are effectively unique' },
          { label: "It depends entirely on the hash's own bit width", correct: true },
        ],
        explain: (
          <>
            It depends on width. A full, wide hash is safe by an enormous margin; a narrow one, truncated to save
            storage, is not.
          </>
        ),
      },
      Visual: S.PredictHashCollision,
    },
    {
      title: 'Reveal: the birthday bound, computed',
      body: (
        <>
          A thirty-two-bit hash reaches even odds of a collision under one hundred thousand rows. A sixty-four-bit
          hash still carries a few percent of collision risk at a billion rows. A full one-hundred-twenty-eight-bit
          hash does not, by many orders of magnitude.
        </>
      ),
      duration: 4.8,
      fig: 'thirty-two-bit: even odds early. sixty-four-bit: a real risk. full-width: negligible.',
      takeaway: 'Hash-key collision risk is a computed number, set by bit width, not a caveat to wave at.',
      Visual: S.RevealBirthdayBound,
    },
    {
      title: 'Recap',
      body: (
        <>
          Natural keys break on real change; surrogates absorb it. Sequences are fastest but need one
          coordinator; UUIDv7 keeps most of that locality without one; UUIDv4 trades locality for no coordination
          at all. Durable and surrogate keys solve different problems. Hash width sets a real, computed collision
          risk.
        </>
      ),
      duration: 4.8,
      fig: 'natural breaks, surrogate absorbs. sequence < uuidv7 < uuidv4 cost. hash width = risk.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A pipeline needs a key generated by several independent writers, with no shared coordinator, that still
          sorts close to insertion order in a B-tree index. Which of this topic's options actually fits?
        </>
      ),
      duration: 2.8,
      fig: 'no coordinator, still sorts near insertion order — which key?',
      predict: {
        options: [
          { label: 'A plain auto-increment sequence' },
          { label: 'UUIDv7', correct: true },
        ],
        explain: (
          <>
            UUIDv7: no shared coordinator needed, and its leading timestamp bits keep new values close together
            in the index — the one option that was measured to do both.
          </>
        ),
      },
      Visual: S.ProveUUIDv7Choice,
    },
  ],
};

export default reel;
