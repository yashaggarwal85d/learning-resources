# Review — de.access-control-models-rbac

## Content review, self-review, 2026-10-30

1. **Two cross-chapter `uses` ids `CHAPTER.md` cites don't resolve.** Chapter 10 §10.1 (workload
   identity) and §10.2 (catalog-enforced access, credential vending) are unresolvable: Chapter 10
   has only two topics built so far (`de.failure-domains-regions-zones`,
   `de.object-storage-semantics-data`), both §10.1 cloud-foundations topics that introduce no
   identity or catalog-credential id (confirmed by checking their `registry.ts` entries). **Fixed**
   by declaring both rather than guessing, logged in `OUTLINE.md` → "Changes from the chapter
   plan" and again in `post-notes.md`'s "Frontier."
2. **Gap hunt against the syllabus line:** all six clauses (role explosion, attribute/tag-based
   policies, decision vs enforcement points, policy engines, IdP federation, periodic access
   reviews) mapped in `coverage.json`; no clause left unmapped. One mismatch caught during the
   build: a `coverage.json` reference used an earlier working title for the provisioning reveal
   step ("Reveal: SCIM keeps accounts and groups in sync") that didn't match the final `reel.tsx`
   step title ("Reveal: provisioning keeps accounts and groups in sync"); fixed by syncing the
   title across both files.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage and topic-file
   checks both pass.
4. **Expert reader pass:** the role-count reveal (step 3) and the "Prove it" step both exercise
   the same underlying claim — RBAC's multiplicative cost versus ABAC's flat cost — from two
   different angles: the first states it in the abstract, the second applies it to a concrete
   new-dataset scenario with its own numbers, rather than repeating the same framing twice.
5. **Engagement:** hook and predict both on steps 1-2 (within the first four); a second predict
   at step 12 ("Prove it") requires applying the RBAC-vs-ABAC edit-count distinction to a new
   scenario (one dataset landing in every team's hands at once) rather than recalling the step 3
   claim directly; three takeaways at steps 8, 9, 10 (all after the reel's own midpoint of step
   6), checked via a Python word-count pass before the build ran; recap at step 11.
6. **Narration teaches, not reads:** clean on the first `narration-teaches.mjs` run. Specific
   numbers (fourteen teams, sixty datasets, three environments, the exact role counts) were
   deliberately left unspoken in narration and only shown on screen — the narration asks the
   listener to work them out, consistent with the chapter's hook-as-prediction pattern.
7. **Numbers checked against `examples.py`:** two thousand five hundred twenty roles for the
   hook's own team/dataset/environment counts; forty-two role edits versus one tag edit for a new
   restricted dataset landing in every team's hands; one stale grant caught out of three in the
   access-review example — every number in `reel.tsx` prose is spelled out as a word and traces
   to an asserted value.

### Checks run

- `node scripts/sources.mjs check access-control-models-rbac`: 11 quotes found word for word, 0
  problems on the first run.
- `python3 examples.py`: all asserts pass (four functions, one `main`), clean on first run.
- `node scripts/narration-teaches.mjs`: clean on first run, no fixes needed.
- `node scripts/check-all.mjs` (via `npm run build`): 1 fix during the build — the coverage
  step-title mismatch above; clean on the rebuild, 238 pages built.
- `node scripts/check-all.mjs --only reels --topic access-control-models-rbac`: "Reel smoke
  test passed: 1 live reel(s) at desktop and phone sizes" — passed. `test:editor` failed with
  "a save did not open a new GitHub issue (opened: nothing)" — the known, pre-existing sandbox
  limitation (Playwright popup-page event never fires in this cloud container), unrelated to
  this topic; not a blocker.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-access-control-models-rbac-02.png` (Predict, step 2 of 12): both option cards render
  fully alongside the body text and the start of the "NOT QUITE" explain block; nothing clipped.
- `phone-access-control-models-rbac-03.png` (role-count reveal, step 3 of 12): three rows
  ("fourteen teams" / "times sixty datasets", "times three" / "environments", "total roles" /
  "unreviewable") render with no overlap; "unreviewable" shows in the focus/red color; body text
  and the "MORE" / "TAP TO CONTINUE" controls are all visible and uncluttered.
- `phone-access-control-models-rbac-12.png` (Prove it, step 12 of 12): both predict option
  cards for the second predict question render fully, alongside the top-of-screen summary rows
  ("role grid" / "fourteen times three", "tag rule" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every
reveal states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
