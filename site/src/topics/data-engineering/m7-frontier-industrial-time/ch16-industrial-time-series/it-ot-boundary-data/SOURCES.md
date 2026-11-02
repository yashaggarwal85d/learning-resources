## NIST SP 800-82 Rev. 3: Guide to Operational Technology (OT) Security

URL: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82r3.pdf
Version: September 2023

The major security objective that names unidirectional gateways and a DMZ together.

> Restrict logical access to the OT network, network activity, and systems. This may include using unidirectional gateways, utilizing a demilitarized zone (DMZ) network architecture with firewalls to prevent network traffic from passing directly between the corporate and OT networks, and having separate authentication mechanisms and credentials for users of the corporate and OT networks. The OT system should also use a network topology that has multiple layers, with the most critical communications occurring in the most secure and reliable layer.

The DMZ as an enforcement boundary between segments.

> Additional, organizations may consider incorporating a DMZ as an enforcement boundary between network segments, as depicted in Fig. 16.

Unidirectional gateways as a firewall alternative, and the direction of the protection they give.

> An alternative to firewalls is a unidirectional gateway or data diode that permits authorized communication in only one direction. The use of unidirectional gateways may provide additional protections associated with system compromises at higher levels or tiers within the environment. For example, a unidirectional gateway deployed between Layers 2 and 3 may protect Layer 0, 1, and 2 devices from a cybersecurity event that occurs at Layers 3, 4, or 5.

Named models for OT network segmentation, side by side, including ISA-95's levels by reference.

> Organizations may also consider using an industry-recognized model to organize their OT network segmentation, such as the Purdue model [Williams], ISA-95 levels [IEC62264], the three-tier IIoT system architecture [IIRA19], or a combination of these models.

Firewall rules should prevent higher levels from talking directly to lower ones.

> Firewall rulesets should be established to only permit connections between adjacent levels, tiers, or zones. For example, organizations that utilize a Purdue model architecture should implement firewall rules and connection paths that prevent Level 4 devices from directly communicating with Level 2, 1, or 0 devices. A similar concept would be applied to ISA/IEC 62443 and IIC architectures.

Contents: §5.2.3.1 Network Architecture (segmentation models, DMZ, firewalls, unidirectional gateways) and §5.3.6/Fig. 18 (a worked defense-in-depth example that assigns Purdue levels 0-2 to a "field level" and level 3 to an "operations management level") — used here for the segmentation vocabulary this topic recaps and for the one-step pointer to the ISA/IEC 62443 family's own level model, which NIST cites by reference ([IEC62264]) rather than restating.

## ISA/IEC 62443 series (named, not quoted)

URL: https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards
Version: ISA.org standard series page — fetched only to confirm the AI-ingestion restriction below, then deleted; no content quoted or paraphrased as a sourced claim.

ISA's own standards pages (isa.org/standards-and-publications/...) carry a site-wide notice —
confirmed on three separate pages while researching this chapter (the ISA-95 standard page, the
ISA-88 standard page, and the ISA/IEC 62443 series page) — that reads: "ISA prohibits the entry
of any ISA intellectual property ("ISA IP"), including standards, publications, training or
other materials into any form of Artificial Intelligence (AI) tools, such as ChatGPT." This
topic therefore **names the ISA/IEC 62443 series bibliographically only** (the OT/ICS
cybersecurity standard family this chapter's scope asks it to name) and does not fetch or quote
any isa.org page. Everything substantive this topic states about segmentation, the Purdue model
and ISA-95's levels comes from NIST SP 800-82r3 above, a U.S. government publication with no
such restriction. This same finding affects this chapter's topics 1 and 2, which did quote
ISA.org pages before the restriction was noticed; see the project's own notes on that (flagged
separately, outside this topic's files).

## Chapter 3's data-contract and data-product material (in-course, used)

URL: (in-course; see `site/src/topics/registry.ts` for the originating topic's slug)
Version: n/a — in-course concept reuse, not an external fetch.

This topic reuses `data-contract-specification` and `data-as-a-product`, introduced in Chapter 3
(`site/src/topics/data-engineering/m3-compute-batch-distributed/.../data-contracts-as-modeling/`
and the data-mesh topic next to it), for the ownership-of-a-definition idea; their own
`registry.ts` `introduces` entries are the source for those ids, not re-derived here.
