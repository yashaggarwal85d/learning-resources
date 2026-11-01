<section data-section="outcomes">

## Outcomes

Place a company's customer, product and plant data on the four MDM styles and defend the choice
by who must write and how fresh the master must be. Draw a match-merge pipeline with its
stewardship queue. Say what each style gives up in consistency.

</section>

<section data-section="internals">

## Internals: a comparison topic, named and quoted from documentation rather than measured

This topic has no lab of its own, exactly as CHAPTER.md's own "Lab" line states: the 8.3 lab is
not hosted here, because record linkage — the matching and survivorship algorithms a match-merge
pipeline actually runs on — is a set of skipped topics in this syllabus. The four styles
(registry, consolidation, coexistence, centralized) are named from Wikipedia's own list of MDM
implementation models and described, who writes and where the master copy lives, from a vendor's
own documentation (Profisee), since no vendor-neutral primary architecture reference could be
found reachable: CHAPTER.md's own plan already found Microsoft's Azure architecture MDM page
returning HTTP 404, and a direct re-check at build time confirms it is still unreachable. The
match-merge pipeline shape (standardize, match, merge by survivorship, publish) and its
stewardship queue are taught as the pipeline and workflow around record linkage, not as record
linkage itself — the matching and survivorship algorithms are named only, since they are the
three skipped topics this chapter's Deep dive points to.

</section>

<section data-section="production">

## Production failures this topic warns about

**Picking a style by its name instead of by who actually needs to write.** The Hook's own
incident is the production failure directly: a customer with two keys and two credit limits
across a CRM and an ERP gets double-counted in a report, because no style was ever actually
chosen — both systems simply kept writing their own version independently.

**Assuming a style fixes data quality instead of data location.** Choosing where the master
lives says nothing about what a record's own fields mean or whether two systems agree on them —
that is a separate problem this chapter's own last topic addresses.

</section>

<section data-section="frontier">

## Frontier

Record linkage, blocking, clustering, survivorship and golden-record construction — the actual
algorithms a match-merge pipeline runs — are named only here, since they are this syllabus's own
skipped topics. SAP's own master-data extraction paths, data ownership and governance, and the
plant data model are each named only, since they are later chapters' own subject.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Choosing a style decides where the master lives, not what its fields mean. Two systems can
agree a customer exists and still disagree on its country code, its currency and the time zone
of its timestamps. The next topic is how meaning is reconciled and owned.

</section>
