import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: a dictionary attack on a plain,
// unkeyed hash recovers nine in ten known emails; the same attack against HMAC recovers zero; a
// linkage attack on quasi-identifiers, with the pseudonymisation key never used, re-identifies
// about two in three rows.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The analytics team asks for customer emails "hashed, so it's anonymous." Ten minutes
          later, a list of known email addresses, hashed the same way, matches nine in ten rows
          back to named people.
        </>
      ),
      duration: 5.2,
      fig: '"hashed, so it\'s anonymous." Nine in ten, matched back.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what single change stops this?',
      body: (
        <>
          What single change would have made that attack fail — and would the result then be
          anonymous, or only pseudonymised?
        </>
      ),
      duration: 4.8,
      fig: 'one change stops the attack. Anonymous, or only pseudonymised?',
      predict: {
        options: [
          { label: 'A keyed hash (HMAC) stops the attack, and the data becomes anonymous' },
          { label: 'A keyed hash (HMAC) stops the attack, but the data stays pseudonymised', correct: true },
        ],
        explain: (
          <>
            HMAC under a secret key stops the dictionary attack cold. But the key is exactly the
            "additional information" the legal definition cares about — kept separately, not
            destroyed. The data is still personal data for whoever holds that key.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: pseudonymised data is still personal data for the key holder',
      body: (
        <>
          The legal test is attribution without additional information. Data that can still be
          attributed with that information — the key, the dictionary — stays information on an
          identifiable person for whoever holds it.
        </>
      ),
      duration: 5.6,
      fig: 'attribution, with the key. Still personal data, for the holder.',
      Visual: S.RevealLegalLine,
    },
    {
      title: 'Reveal: the dictionary attack on a plain hash',
      body: (
        <>
          A plain hash is deterministic and public. Hash every candidate email with the same
          function, and the ones that match the table are recovered — no guessing of the function
          itself required.
        </>
      ),
      duration: 5.2,
      fig: 'same function, every candidate. Matches, recovered.',
      Visual: S.RevealDictionaryAttack,
    },
    {
      title: 'Reveal: HMAC resists it',
      body: (
        <>
          A keyed hash under a secret produces a different result entirely without that secret.
          The attacker's dictionary, hashed the same old way, matches nothing in the table.
        </>
      ),
      duration: 5.2,
      fig: 'same dictionary, no key. Nothing matches.',
      Visual: S.RevealHmacResists,
    },
    {
      title: "Reveal: the CJEU's relative approach, EDPS v SRB",
      body: (
        <>
          The Court held that pseudonymised data isn't personal data in every case for every
          person — only for someone with the means to re-identify. For a recipient with no such
          means, it may not be.
        </>
      ),
      duration: 5.6,
      fig: 'not personal data, for everyone, in every case. It depends.',
      Visual: S.RevealRelativeApproach,
    },
    {
      title: "Reveal: the controller's duty is judged from the controller's own side",
      body: (
        <>
          The same judgment held that the duty to inform people is judged from the controller's
          own position, at the moment it collects the data — not from whatever position a later
          recipient happens to be in.
        </>
      ),
      duration: 5.6,
      fig: "the controller's own side, at collection. Not the recipient's.",
      takeaway: "A controller can't point to a recipient's blind spot to escape its own duty to inform.",
      Visual: S.RevealControllerDuty,
    },
    {
      title: 'Reveal: the Digital Omnibus, pending',
      body: (
        <>
          A pending proposal would write that relative approach into the law itself, and let
          regulators decide the line by a later rule. The regulators' own opinion on that proposal
          asks for that specific piece to be removed. Nothing here is law yet.
        </>
      ),
      duration: 5.6,
      fig: 'written into the law, by proposal. Regulators object. Not law yet.',
      takeaway: 'A pending proposal changes nothing today; this topic states its status, not its outcome.',
      Visual: S.RevealDigitalOmnibus,
    },
    {
      title: 'Reveal: linkage attacks',
      body: (
        <>
          Even a perfectly keyed pseudonym gives nothing to a dictionary attack. But join its
          quasi-identifiers — postcode, birth year, what someone buys — against an outside list,
          and about two in three rows come back uniquely matched. No key involved at all.
        </>
      ),
      duration: 5.6,
      fig: 'quasi-identifiers, joined outside. About two in three, matched. No key needed.',
      takeaway: 'A keyed pseudonym resists a dictionary attack but not a linkage attack on what else sits beside it.',
      Visual: S.RevealLinkageAttacks,
    },
    {
      title: 'Recap',
      body: (
        <>
          Pseudonymised stays personal data for the key holder. The relative approach says it may
          not be, for someone without the means to re-identify — judged from the controller's own
          side. A proposal, pending, would write that into law. A keyed hash stops a dictionary
          attack; nothing stops a linkage attack on what sits beside it.
        </>
      ),
      duration: 6.0,
      fig: "key holder, relative approach, pending law, dictionary versus linkage.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A pseudonymised release has its key destroyed, but its quasi-identifiers are still
          sitting right there, intact. Which attack still works, and does the data count as
          anonymous now?
        </>
      ),
      duration: 5.2,
      fig: 'key destroyed, quasi-identifiers intact. Still attackable?',
      predict: {
        options: [
          { label: 'Destroying the key makes it anonymous; no attack applies anymore' },
          { label: 'A linkage attack on the quasi-identifiers still works; it is not anonymous', correct: true },
        ],
        explain: (
          <>
            Destroying the key only closes the dictionary attack on the pseudonym itself. The
            quasi-identifiers left beside it are an entirely separate path back to a person, and
            the linkage reveal just measured how often that path succeeds.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
