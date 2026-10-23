import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A hash function turns any key into a number. This topic is the fork every real system has to
// make at that moment: fast and unkeyed, fast and keyed (a real PRF), or cryptographic. Every
// number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Finding a slot without scanning every record',
      body: (
        <>
          A table needs to turn a key &mdash; a request ID, a string &mdash; into a slot, fast. Scanning every record to find a match is
          O(n). The mechanism that skips the scan entirely is a hash function: one number in, one slot out, no comparisons.
        </>
      ),
      duration: 3.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'The simplest tier: fast, and no promises about who chose the keys',
      body: (
        <>
          xxHash3, wyhash, FxHash: built for raw speed on ordinary keys, nothing more. xxHash&rsquo;s own README scopes its quality claim
          to non-adversarial input &mdash; nobody asked what happens if the keys are chosen against you.
        </>
      ),
      duration: 3.5,
      fig: 'NonCryptoSpeed',
      Visual: S.NonCryptoSpeed,
    },
    {
      title: 'An attacker chooses every key your server hashes. What happens?',
      body: <>The same fast hash from the last step, now fed a stream of keys an attacker controls. What happens to the table?</>,
      duration: 2,
      fig: 'FloodPredict',
      predict: {
        options: [
          { label: "Nothing changes — a hash function's speed doesn't depend on its input" },
          { label: 'The table gets a little slower, proportional to how many keys collide' },
          { label: "The table's performance can collapse to one giant list — every lookup becomes O(n)", correct: true },
          { label: "It only matters if the attacker also knows the table's exact size" },
        ],
        explain: (
          <>
            A fast public hash has one published formula. An attacker who can compute it offline can find thousands of keys that all land
            in the same slot, on purpose. The table doesn&rsquo;t get &ldquo;a little slower&rdquo; &mdash; every one of those keys now
            lives in the same bucket, so a lookup there costs as much as scanning the whole flood.
          </>
        ),
      },
      Visual: S.FloodPredictViz,
    },
    {
      title: 'The attack this fast hash never promised to survive',
      body: (
        <>
          Not hypothetical &mdash; found independently twice: 1999&rsquo;s <code>dnscache</code>, Crosby &amp; Wallach&rsquo;s 2003 paper,
          and a 2011 disclosure that occupied a PHP5 server for a full minute of CPU time with a few hundred kilobytes of crafted form data.
        </>
      ),
      duration: 4.2,
      fig: 'HashDoSReveal',
      takeaway: "A fast public hash assumes the input won't fight back — a chosen-key attacker can make every key collide.",
      Visual: S.HashDoSReveal,
    },
    {
      title: "Does giving that hash a random per-process secret fix it?",
      body: <>The same weak hash, now with a random seed chosen once per process, unknown to the attacker. Does that fix it?</>,
      duration: 2.2,
      fig: 'SeedPredict',
      predict: {
        options: [
          { label: "Yes — the attacker can no longer predict which keys collide, so the flood fails" },
          { label: 'Not by itself — if the hash is still a simple linear formula, timing your server can still reveal the seed', correct: true },
          { label: "No, random seeds don't help at all against this attack" },
          { label: 'Yes, as long as the seed is at least 128 bits' },
        ],
        explain: (
          <>
            A random seed really does stop an attacker who must precompute colliding keys offline, with no access to your server. It does
            not stop an attacker who can send one key at a time and time each lookup: if the hash is a simple linear formula, that timing
            signal leaks enough to solve for the seed itself &mdash; the fix needs the hash to be unpredictable in a much stronger sense
            than &ldquo;has a secret.&rdquo;
          </>
        ),
      },
      Visual: S.SeedPredictViz,
    },
    {
      title: 'What a random seed actually buys you',
      body: (
        <>
          4,000 crafted keys, all in one bucket, land in up to 256 of 256 buckets once a per-process coefficient they can&rsquo;t guess is
          folded into the same formula. That defeats a precomputed attacker. It doesn&rsquo;t defeat one who can time adaptive queries and
          solve the linear system one guess at a time &mdash; linear is still solvable by elimination.
        </>
      ),
      duration: 4.4,
      fig: 'SeedReveal',
      takeaway: 'A random seed defeats an attacker guessing keys in advance, not one who can time your server.',
      Visual: S.SeedReveal,
    },
    {
      title: 'A real pseudorandom function, not just a secret',
      body: (
        <>
          SipHash was built to be a real PRF &mdash; indistinguishable from a function that just picks a random output for every input
          &mdash; while staying fast enough to compete with the non-cryptographic hashes from step 2. It&rsquo;s not a museum piece:
          CPython&rsquo;s own <code>hash()</code> of a string has been exactly this since PEP&nbsp;456.
        </>
      ),
      duration: 3.8,
      fig: 'SipHashPRF',
      Visual: S.SipHashPRF,
    },
    {
      title: "A real standard library's own choice",
      body: (
        <>
          Rust&rsquo;s <code>std::HashMap</code> defaults to SipHash&nbsp;1-3, randomly seeded, &ldquo;resistance against HashDoS
          attacks.&rdquo; <code>rustc</code>&rsquo;s own <code>FxHashMap</code> opts out on purpose: the compiler&rsquo;s inputs
          aren&rsquo;t adversarial. A fixed, non-random hasher in a <code>const</code> loses that resistance entirely &mdash; the
          docs say so themselves.
        </>
      ),
      duration: 4,
      fig: 'RustDefault',
      takeaway: "Rust's standard library ships a slower default hash on purpose, so an attacker can't choose your map's worst case.",
      Visual: S.RustDefault,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Three tiers, one machine, one run: a fast checksum, Python&rsquo;s own keyed <code>hash()</code>, and SHA-256. The fast and keyed
          tiers land close together &mdash; exactly SipHash&rsquo;s own &ldquo;competitive in speed&rdquo; claim. The cryptographic tier
          is the real surprise: clearly, consistently slower.
        </>
      ),
      duration: 4.4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
