<section data-section="outcomes">

## Outcomes

Types 0, 1 and 3 each decide whether an old attribute value survives at all, and if so, where: nowhere (0), nowhere because it's overwritten (1), or beside the new value in a second column (3). Type 4 splits a rapidly changing, shared attribute group into its own mini-dimension, bounded by the combinations the attributes actually take rather than by how many rows reference it. Types 5, 6 and 7 are named combinations of the first four — 5 is 4 plus a Type 1 pointer, 6 is 2 plus 3 plus 1, 7 delivers Type 6's functionality through a second key instead of an overwrite — chosen by whether the cost of rewriting history is worth avoiding a second join.

</section>

<section data-section="internals">

## Internals: why type *numbers*

Kimball Group assigned formal type numbers to the hybrid techniques only with the third edition of *The Data Warehouse Toolkit* (2013, Design Tip #152) — Types 5, 6 and 7 had been described informally for years before that, without a settled name. The numbers were chosen as arithmetic on the simpler types they combine: Type 5 is Type 4 plus a Type 1 reference (4 + 1 = 5). Type 6 is a Type 2 row carrying a Type 3-style column that gets overwritten Type 1 style — both 2 + 3 + 1 and 2 × 3 × 1 equal 6, which is presumably why the name stuck instead of being arbitrary. Type 7 isn't named by arithmetic; it is defined by what it delivers (Type 6's functionality) and how it differs mechanically (dual keys, no overwrite).

This matters for communication, not just trivia: when a teammate says "Type 6," the number itself tells you it is Type 2's history plus an overwritten current column, without needing a diagram.

</section>

<section data-section="lab">

## Lab

This topic has no lab of its own (`CHAPTER.md`). Its numbers — the mini-dimension's nine possible combinations against the five actually observed, the hundred-and-sixty wide rows against forty-five if a mini-dimension is used instead, and the six rows Type 6 rewrites against Type 7's zero — are a disclosed, self-consistent worked scenario computed in `examples.py`, not a claim about a real running system (`SOURCES.md`). The previous topic's `MERGE`-based load is the real lab for Type 2's own mechanics; building an actual Type 4/5/6/7 load in SQL is left to the reader as an exercise once the mechanism is clear here.

</section>

<section data-section="production">

## Production failures this topic warns about

**Defaulting to Type 2 for everything.** A team that always reaches for "add a row" without checking an attribute's churn rate ends up with a dimension that grows without bound, because Type 2 on a rapidly changing, shared attribute group duplicates the entire wide row on every change — the failure mode step seven's predict walks through directly.

**Defaulting to Type 1 and later needing history.** The opposite failure: overwriting an attribute a future report needs historical values for, with no way to recover what was overwritten. Type 1's own quote is explicit that this destroys history; there is no retroactive fix once it has happened, which is why the choice has to be made per attribute, with the business, before the first change arrives (Design Tip #152).

</section>

<section data-section="frontier">

## Frontier

Modern transformation tools implement these patterns directly rather than leaving teams to hand-roll them: dbt's snapshot feature is a Type 2 implementation out of the box, and some warehouses' built-in "time travel" is sometimes mistaken for a substitute — it isn't, because time travel windows expire and aren't modeled as queryable dimension rows with a current flag the way Type 2 is.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Every type in this reel assumed a dimension row's own data was itself correct and arrived on time. The next topic drops that assumption: facts that arrive before their own dimension row exists, and facts that arrive late enough that they need to be mapped onto whichever historical SCD2 version was actually in effect on their own event date, not the version that is current today.

</section>
