# Outline: de.pseudonymisation-vs-anonymisation

1. **Hook.** The analytics team asks for customer emails "hashed, so it's anonymous." Ten
   million known emails, hashed with the same function, match ninety percent of the table back
   to named people. Was it anonymous?
2. **Reveal: encryption and pseudonymisation protect data; they do not change what the data
   legally is for whoever holds the key.** GDPR's own definition: pseudonymised data can't be
   attributed to a person without additional information, kept separately. [from]
3. **Predict: a candidate list of known emails, hashed with the same plain function as a
   pseudonymised table. Does the attack recover most of the table?** [idx2]
4. **Reveal: it recovers the large majority, measured directly.** A plain hash is deterministic
   and public; anyone with a candidate list computes the same hashes.
5. **Elaborate: a keyed hash needs a secret the attacker never has.** The identical attack
   against the same emails under HMAC recovers nothing, measured directly, because the key is
   the Article 4(5) "additional information" that must be kept separately. [takeaway1]
6. **Predict: a pseudonymised release with no names, only quasi-identifiers, joined against an
   outside list that already has names. Does anyone get re-identified?** [idx5]
7. **Reveal: a real, measurable fraction gets re-identified, even with the key never
   compromised.** Quasi-identifiers alone can be unique enough to link back to a name.
8. **Elaborate: this is why pseudonymised data stays personal data for whoever can
   re-identify, and why identifiability is relative.** The CJEU's EDPS v SRB judgment:
   pseudonymised data is not personal data in all cases and for every person; it's judged by
   the recipient's own actual means. [takeaway2]
9. **Reveal: the law itself is in motion.** The Digital Omnibus proposal would write this
   relative approach into Article 4(1) directly, and let the Commission define by implementing
   act when pseudonymised data stops being personal -- a proposal, not yet law, that the EDPB
   and EDPS have urged against.
10. **Recap.** [takeaway3]
