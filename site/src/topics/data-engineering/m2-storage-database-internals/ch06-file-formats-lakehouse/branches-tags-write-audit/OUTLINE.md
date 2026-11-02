# OUTLINE — de.branches-tags-write-audit

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook** — snapshots are already addressable by id. This topic gives some of them names, and
   the ability to move independently of `main`.

2. **Predict: a tag and a branch are both created from the same snapshot. What's the real
   difference between them?** Options: no real difference, both are just names / one is fixed
   forever, the other can move.

3. **Reveal: created for real, from the same snapshot** — a real tag (`released-v1`) and a real
   branch (`audit`), both pointing at this table's one snapshot, created through pyiceberg's own
   `manage_snapshots()`.

4. **Reveal: the spec says it directly** — "Tags are labels for individual snapshots. Branches
   are mutable named references..." Takeaway: a tag is fixed for retention and reproducibility; a
   branch moves, which is what makes isolated writes possible.

5. **Predict: new rows are written to the audit branch. What happens to `main`?** Options: `main`
   gets the new rows too / `main` is completely unaffected until something moves it.

6. **Reveal: staged for real, main provably untouched** — three new rows appended to the `audit`
   branch only; `main`'s snapshot id, scanned directly, is unchanged. Takeaway: a branch's writes
   are invisible to every other ref until something explicitly moves that ref.

7. **Reveal: validated, then published for real** — a real check (no duplicate ids) run against
   the staged branch; passing, `main` is fast-forwarded to the branch's snapshot through
   `set_current_snapshot`, and the tag from step 3 still points at the original snapshot,
   unmoved.

8. **Reveal: a second attempt, for real, fails and never reaches `main`** — a second batch
   reintroduces an id already in the table; the same real check catches it; the branch is
   discarded; `main`'s snapshot id, checked directly, never changed.

9. **Reveal: this is one table. More than one at once is a different layer** — Iceberg views are
   a separate kind of catalog object entirely (their own metadata, their own version history, no
   data of their own); branching more than one table together, atomically, belongs to the
   catalog, not to any single table. Takeaway: write-audit-publish here is single-table; true
   multi-table branching is a catalog-level feature, named here as a forward pointer.

10. **Recap** — a tag is a fixed pointer, a branch is a movable one, both built from the same
    snapshot; a full write-audit-publish flow ran twice, once published, once rejected, neither
    touching `main` until the real check passed; views and multi-table branching are named as
    what's next, not built here.
