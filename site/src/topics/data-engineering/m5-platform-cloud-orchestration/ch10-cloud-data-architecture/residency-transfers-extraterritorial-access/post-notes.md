---
id: de.residency-transfers-extraterritorial-access
title: 'Residency, transfers and extraterritorial access'
---

<section data-section="outcomes">

## Outcomes

- Distinguish residency, sovereignty and localisation precisely and place a given legal requirement on the correct one of the three.
- Explain why Schrems II invalidated Privacy Shield and what an SCC transfer-impact assessment now has to evaluate.
- State the current legal status of the EU-US Data Privacy Framework accurately, including that it is under appeal.
- Name at least two architectural mitigations and the real limit of each.

</section>

<section data-section="internals">

## Internals

- **Conflating residency with sovereignty is the single most common architecture mistake this topic exists to prevent.** Pinning storage to a region answers where the bytes sit; it says nothing about who can be legally compelled to produce them, which is exactly why the CLOUD Act's own possession-custody-control test applies regardless of location.
- **A transfer mechanism's legal status is a snapshot, not a guarantee.** Privacy Shield was adopted, trusted, then struck down. The current framework has survived one courtroom test, not every future one — building as if an adequacy decision is permanent repeats the mistake that broke Privacy Shield's predecessors' users.
- **An SCC transfer-impact assessment is itself a real, substantive step, not paperwork.** It requires evaluating the destination country's actual law and practice on public-authority access — not simply attaching the clauses and moving on.
- **Remote access is a transfer independent of where storage sits.** The hook's whole point is that a region-pinning decision can be completely correct and still miss this — the EDPB's own analysis treats a third-country engineer viewing EU data in the clear the same way it treats moving the bytes themselves.
- **Every architectural mitigation has a real, honestly-stated limit.** Region-pinning stops nothing under the CLOUD Act's sovereignty test; customer-held keys stop nothing once the processing itself needs the plaintext. A mitigation without its limit stated is a false sense of security, not a control.

</section>

<section data-section="production">

## Production

A legal team concludes that pinning all storage and compute to the EU resolves every transfer risk for a new product, and ships on that basis. Months later, a routine vendor support ticket reveals the vendor's own support staff, based outside the EU, can view customer data during troubleshooting — a transfer the team never assessed, because the pinning decision was correct about residency and silent about everything else.

</section>

<section data-section="frontier">

## Frontier

The CJEU's resolution of the pending *Latombe* appeal (Case C-703/25 P) could either affirm the current Data Privacy Framework's adequacy decision or invalidate it as it did both predecessors — a decision this topic's own text is explicit it cannot predict. The mechanisms this topic teaches — the residency/sovereignty/localisation distinction, a transfer-impact assessment's real content, and an architectural mitigation's honestly-stated limit — stay the right questions regardless of how that specific appeal resolves.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Everything in Chapters 1-10 so far has mostly assumed modern, cloud-native systems and modern regulation. A huge amount of the world's actual operational data instead lives behind a decades-old enterprise system with its own extraction rules, and a factory floor with its own physics — which the next section is about.

</section>
