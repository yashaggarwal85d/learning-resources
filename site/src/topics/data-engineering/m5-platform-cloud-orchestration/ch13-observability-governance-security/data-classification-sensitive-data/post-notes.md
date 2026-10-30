<section data-section="outcomes">

## Outcomes

Assign a tier and a category to each column of the shop's `customers`, `orders` and
`support_notes` and justify each; run a pattern-and-checksum scanner on synthetic data and report
its precision, recall and what it misses; describe how a tag should propagate through a hash, a
join and an aggregate; explain why a policy that protects only tagged columns fails open when
discovery misses a column.

</section>

<section data-section="internals">

## Internals

A sensitivity tier and a category answer two different questions, and `examples.py`'s own tag
propagation example (`tag_propagation_through_hash_and_aggregate`) shows why keeping them separate
matters: hashing `customers.email` changes nothing about its *category* — it is still personal
data, since a hash of a known value set can be reversed by lookup, which is exactly the
"identifiable indirectly" clause in GDPR Article 4's own definition — but it does make the column
unreadable at a glance, which is a *tier* concern, not a category one. An aggregate, by contrast,
changes the category itself: `daily_revenue.customer_count` genuinely contains no per-subject
information, so the tag is correctly dropped, not just hidden. Confusing the two — treating a
hash as if it declassified data, or an aggregate as if it still needed a tag — is the exact
mistake this topic's reveal step is built to prevent.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a scanner's clean structured-column report as "classification is done."** This
topic's own measurement shows a pattern-plus-checksum scanner at effectively full recall on
structured columns and only half that on free text — the same technique, two very different
outcomes, depending only on where it's pointed. A sign-off based on the structured-column number
alone silently ignores the free-text gap.

**A masking or access policy that only reads tags, with no accounting for discovery's own miss
rate.** The "Prove it" step's arithmetic — half the miss rate times the sensitive fraction — is
not a worst case. It is what a tag-only policy actually leaves exposed, every time discovery runs
short of perfect recall, which every vendor source here says it will.

</section>

<section data-section="frontier">

## Frontier

Tokenization and format-preserving encryption (the skipped syllabus topic) and the global
regulatory map that says which law attaches to which category (the other skipped syllabus topic)
are both named here only: they belong to a fuller treatment of what happens *after* a column is
classified, which this topic deliberately leaves to the policies downstream of it. Chapter 10's
EU regulatory architecture (§10.5) and cloud discovery products (§10.2), which `CHAPTER.md` cites
as background for this topic, are not yet built as of this writing (confirmed: only a
`CHAPTER.md` plan exists under `ch10-cloud-data-architecture`) — named here as the gap, not
guessed at.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Once a column is classified restricted, the first protection is that it cannot be read by anyone
who steals the disk. How a key hierarchy delivers that, and what rotating or deleting a key
really does to the data, is the next topic: envelope encryption.

</section>
