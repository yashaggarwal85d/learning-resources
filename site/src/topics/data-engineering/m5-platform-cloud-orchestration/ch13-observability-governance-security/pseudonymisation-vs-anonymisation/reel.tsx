import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured directly (examples.py, against real local hashing and a real linkage attack on
// synthetic data): a dictionary attack recovers the large majority of a synthetic email list's
// plain SHA-256 hashes; the identical attack against the same emails under a keyed HMAC, without
// the secret key, recovers none of them; a linkage attack joining quasi-identifiers from a
// pseudonymised release against an outside reference list re-identifies a real, measurable
// fraction of individuals who were never named in the release at all.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The analytics team asks for customer emails "hashed, so it's anonymous." Ten minutes
          with a list of known emails, hashed the same way, matches most of the table back to
          named people. Was it ever anonymous?
        </>
      ),
      duration: 5,
      fig: 'hashed emails, called anonymous. A known email list says otherwise.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: pseudonymisation and encryption protect data; they do not change what it legally is for whoever holds the key',
      body: (
        <>
          A pseudonym can't be tied back to a person without extra information, kept separately.
          That extra information is still what it takes, and whoever holds it still holds
          personal data.
        </>
      ),
      duration: 4.8,
      fig: 'protection, not a change of status. The key holder still has personal data.',
      Visual: S.RevealStillPersonalForKeyHolder,
    },
    {
      title: 'Predict: hash a known email list with the same plain function as the pseudonymised table. Recovers most of it?',
      body: (
        <>
          Take a candidate list of known emails, hash each one with the exact same plain
          function used on a pseudonymised table, and look for matches. Does that recover most
          of the table?
        </>
      ),
      duration: 2.8,
      fig: 'same plain hash on known emails. Recovers most of the table?',
      predict: {
        options: [
          { label: "No -- a hash scrambles the input beyond recognition, so a matching candidate shouldn't exist" },
          { label: 'Yes -- a plain hash is deterministic, so the same email always produces the same hash', correct: true },
        ],
        explain: (
          <>
            Yes. A plain hash is public and deterministic: anyone who hashes the same candidate
            list gets the identical output and can match it straight back to the table.
          </>
        ),
      },
      Visual: S.PredictDictionaryAttack,
    },
    {
      title: 'Reveal: the dictionary attack recovers the large majority of the table, measured directly',
      body: (
        <>
          Measured directly: hashing a known candidate list with the same plain function
          recovers the large majority of the pseudonymised table's own entries.
        </>
      ),
      duration: 4.8,
      fig: 'plain hash: deterministic, public. Dictionary attack: recovers most, measured.',
      Visual: S.RevealDictionaryRecovers,
    },
    {
      title: 'Elaborate: a keyed hash needs a secret the attacker never has',
      body: (
        <>
          Under a keyed hash, the same attack recovers nothing, measured directly, because the
          secret key is the "additional information" the law requires to be kept separately --
          without it, the output isn't reproducible by anyone else.
        </>
      ),
      duration: 5,
      fig: 'HMAC needs the key. The same attack, measured, recovers nothing.',
      takeaway: 'A plain hash of an email or phone number is a public, reproducible dictionary waiting to be matched.',
      Visual: S.ElaborateHMACNeedsSecret,
    },
    {
      title: 'Predict: a release with no names, only quasi-identifiers, joined to an outside list that has names. Anyone re-identified?',
      body: (
        <>
          A pseudonymised release holds no names or emails, only quasi-identifiers like postcode
          and birth year. Join it against an outside list that already has names attached to the
          same quasi-identifiers. Does anyone get re-identified?
        </>
      ),
      duration: 2.8,
      fig: 'no names, just quasi-identifiers, joined to an outside list. Anyone re-identified?',
      predict: {
        options: [
          { label: 'No -- removing direct identifiers before release is exactly what makes a dataset anonymous' },
          { label: 'Yes -- quasi-identifiers in combination can be unique enough to link straight back to a name', correct: true },
        ],
        explain: (
          <>
            Yes. A combination of quasi-identifiers can be unique enough on its own to match a
            single named record in an outside list, with no key or dictionary ever needed.
          </>
        ),
      },
      Visual: S.PredictLinkageAttack,
    },
    {
      title: 'Reveal: a real, measurable fraction gets re-identified, with the key never compromised',
      body: (
        <>
          Measured directly: joining quasi-identifiers against an outside reference list
          re-identifies a real, measurable fraction of the pseudonymised release -- without
          touching the key or the dictionary at all.
        </>
      ),
      duration: 4.8,
      fig: 'key: never compromised. Quasi-identifiers: still re-identify, measured.',
      Visual: S.RevealLinkageReidentifies,
    },
    {
      title: "Elaborate: the CJEU's EDPS v SRB judgment -- pseudonymised data isn't personal data in all cases, for every person",
      body: (
        <>
          The Court of Justice confirmed that pseudonymisation can genuinely prevent someone
          other than the controller from identifying the data subject, so for that recipient the
          data may not be personal data at all -- judged by that recipient's own actual means,
          not the controller's.
        </>
      ),
      duration: 5,
      fig: 'not personal data for every person -- judged by the recipient\'s own means.',
      takeaway: "Identifiability is relative: the same dataset can be personal data for one party and not for another.",
      Visual: S.ElaborateRelativeIdentifiability,
    },
    {
      title: 'Reveal: the Digital Omnibus proposal would write this relative approach into the law directly -- not yet adopted',
      body: (
        <>
          A pending proposal would add this relative approach straight into the definition of
          personal data, and let the Commission decide by a later act exactly when pseudonymised
          data stops counting as personal. It is only a proposal, and the EDPB and EDPS have
          urged the lawmakers not to adopt it.
        </>
      ),
      duration: 5,
      fig: 'a pending proposal, not yet law -- the EDPB and EDPS urged against it.',
      Visual: S.RevealDigitalOmnibusPending,
    },
    {
      title: 'Recap',
      body: (
        <>
          A plain hash falls to a dictionary attack. A keyed hash holds. Quasi-identifiers can
          still re-identify, with the key never touched at all.
        </>
      ),
      duration: 5,
      fig: 'plain hash falls; HMAC holds; quasi-identifiers still re-identify.',
      takeaway: 'Whether data is anonymous is never just the transformation; it depends on what a real attacker can actually do.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
