# Fact-check — Order-statistic trees

Adversarial pass, re-deriving every claim in `OUTLINE.md`'s claims list from the fetched source
texts in `sources/`, never from memory of writing the outline.

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | size[x] = size[left[x]] + size[right[x]] + 1. | Confirmed | `sources/mit6046-lec11-augmenting.txt`: "size[x] = size[left[x]] + size[right[x]] + 1." |
| 2 | OS-SELECT compares the target rank against the left subtree's size and recurses; runs in O(h) = O(log n) on a balanced tree. | Confirmed | `sources/mit6046-lec11-augmenting.txt`: "k ← size[left[x]] + 1 ⊳ k = rank(x) if i = k then return x if i < k then return OS-SELECT(left[x], i ) else return OS-SELECT(right[x], i – k )" and "Running time = O(h) = O(lg n) for red-black trees." `examples.py` runs this algorithm directly against a real augmented tree. |
| 3 | Recolourings don't affect subtree sizes; rotations fix up subtree sizes in O(1) time, so insert/delete still runs in O(log n). | Confirmed | `sources/mit6046-lec11-augmenting.txt`: "Recolorings: no effect on subtree sizes." and "Rotations: fix up subtree sizes in O(1) time." and "∴RB-INSERT and RB-DELETE still run in O(lg n) time." |
| 4 | A rotation changes the size for only the two nodes incident to the rotated edge. | Confirmed | `sources/csce750-augmenting.txt`: "Each rotation changes the size for only two nodes: The two nodes incident to the edge being rotated." `examples.py` measures this directly on a real rotation: exactly two sizes change. |
| 5 | The four-step augmentation methodology (choose a structure, choose a field, verify the field survives modifying operations, build new operations) is stated independently by two sources, both following CLRS Ch. 14. | Confirmed | `sources/mit6046-lec11-augmenting.txt`: "1. Choose an underlying data structure (redblack trees). 2. Determine additional information to be stored in the data structure (subtree sizes). 3. Verify that this information can be maintained for modifying operations (RBINSERT, RB-DELETE — don't forget rotations). 4. Develop new dynamic-set operations that use the information (OS-SELECT and OS-RANK)." `sources/csce750-augmenting.txt`: "1. Choose an underlying data structure. 2. Determine additional information to maintain in that data structure. 3. Modify the operations of that data structure to maintain that information. 4. Develop new operations using that information," credited to "CLRS 14." |
| 6 | The general rule — an augmented field survives a rotation in O(1) exactly when it's computable from the rotated node's new children alone. | This topic's own generalization, not a verbatim quote | Both sources state the specific case (subtree size, O(1) per rotation, exactly two nodes) but neither states the fully general field-independent rule in those words. The generalization follows directly from the mechanism both describe: a rotation only changes which two nodes are parent/child, so only a field defined purely in terms of a node's own two children (never anything further down the subtree) can be recomputed without a wider re-scan. Stated explicitly as a generalization, not attributed to either source as a direct quote. |
| 7 | A select and a rank query's comparison counts stay tied to the tree's height on a real augmented tree. | Confirmed by construction | `examples.py`: measured directly on topic 24's red-black tree, augmented with sizes. |

## Red team: the two predict questions

**Step 3 (InsertPredict).** Distractors tested against the real mechanism:
- "Only the new leaf itself" — wrong, and tests whether a learner assumes the new node's own size is the only thing that changed, missing that every ancestor gained a descendant too.
- "Every node on the path from the root down to the new leaf" (correct) — the real mechanism: exactly the nodes whose descendant set grew by one.
- "Every node in the entire tree" — wrong, and tests whether a learner over-generalizes "something changed" into "everything changed," missing that nodes off the insert path have an unchanged descendant set.
- "Only the root" — wrong, and tests whether a learner conflates "the whole tree's size grew by one" (true only of the root) with "every size that needs updating."

**Step 6 (RotationPredict).** Distractors tested against the real mechanism:
- "All the sizes in the subtree being rotated" — wrong, and tests whether a learner assumes a rotation disturbs everything beneath it rather than just the two directly relinked nodes.
- "Every size along the path back up to the root" — wrong, and tests whether a learner confuses the insert-path update rule (step 3) with the rotation-fixup rule, assuming the same upward-climbing pattern applies here too.
- "Only the two nodes incident to the rotated edge" (correct) — the real, sourced mechanism.
- "None — the sizes stay correct automatically" — wrong, and tests whether a learner assumes the augmentation is somehow self-maintaining without any explicit fixup step at all.

## Currency notes

- Charles E. Leiserson's MIT 6.046J/18.401J (Fall 2005) Lecture 11 slides are read directly from MIT OpenCourseWare's current listing, as the canonical, original source for the order-statistic-tree augmentation and its four-step methodology (Leiserson co-authored CLRS, whose Chapter 14 covers exactly this material).
- The csce750 (Fall 2020) lecture notes are read directly from the University of South Carolina's current course site, explicitly following CLRS Chapter 14, used here to corroborate the precise two-node rotation-fixup claim independently.

## Claims not made

- No claim about interval trees' max-endpoint augmentation beyond naming it in the frontier section as the same general rule applied to a different field — interval trees are skipped in this chapter's syllabus.
- No claim that rank itself could be stored directly at each node instead of being computed from sizes — the sources explicitly give the reason this doesn't work (ranks are hard to maintain under tree modification), stated as a question-and-answer in the MIT lecture, and this topic poses it as an open question rather than re-deriving the full argument.
- No re-derivation of why a red-black tree's own rotation bound (topic 24) is unaffected by carrying an extra field — this topic takes topic 24's bound as given and shows only that the extra bookkeeping itself costs O(1) per rotation, not a re-proof of the rotation count bound.
- No claim that this topic's own measured numbers (comparison counts, sizes recomputed per rotation) are anything other than this topic's own honest measurement on one real augmented tree.
