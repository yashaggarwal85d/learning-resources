---
name: draft-chapter
description: Draft run on the cloud (role draft). Plans the next chapter of one domain when it needs a plan, then writes every topic's first draft in turn (research, content plan, fact-check, coverage map, reel, pre-notes, post-notes, sources, prerequisite links, the narration script in the professor's voice, executed examples), pushing each as a topic branch and handing it to the review runs. Use for "/draft-chapter <domain>", "draft the next chapter", "write the first drafts", or as the body of a draft routine.
---

# /draft-chapter <domain>

The first stage of making topics (ROUTINE.md, "Three stages, decoupled"). This run never reviews, never ships, never narrates: it produces drafts, as many as it can, and hands them over. Review runs (`/review-topic`) do the rest; the PC narrates and releases.

## Loop

1. `node scripts/claim.mjs next "<domain>" --role draft` first, before reading anything.
   - `wait` → stop with the reason (section 9 report, one line if nothing was drafted).
   - `plan` → ROUTINE.md section 1A exactly (Opus plan, Opus review, publish to `main`, `claim.mjs done`). Then back to step 1.
   - `draft` → step 2. With `resumed: true`, check out `topic.branch` and continue from `OUTLINE.md` → "Progress", dealing with the stop reason first.
2. **Draft the topic**: ROUTINE.md sections 1 (claim, branch from `origin/main`, heartbeat), 2 (sources with verbatim quotes, the Opus content plan and storyboard, the Opus fact-check, the coverage map with the blind expert list) and 3 (the builder agent writes every file; `npm run build` and `npm run test:examples` pass). The narration script is written to `.claude/skills/narrate/teacher-pass.md`: the MIT professor explaining the picture, never the description read aloud; `node scripts/narration-teaches.mjs <folder>` must show no flag. The Prerequisites open with the Basics section. The registry entry has `status: 'held'`.
3. **Hand over**: ROUTINE.md section 3H (`OUTLINE.md` → "Progress: drafted", commit `Draft: <topic-id>`, `claim.mjs mine`, push, `claim.mjs drafted`).
4. Back to step 1. Keep going while jobs come; one topic at a time, each pushed before the next starts, so a run that dies loses at most the topic in progress (and its branch holds the checkpoints of sections 2 and 3).

## Models

As ROUTINE.md section 0: Opus (effort high) for the chapter plan, its review, the content plan and storyboard, and the fact-check; Sonnet for source reading, the blind expert list, the builder and everything else. Never Fable or Haiku.

## Never

- Review, run the looks review, set a topic live, or merge anything but a chapter plan into `main`.
- Narrate.
- Touch a topic another run holds (`claim.mjs status`), a chapter plan on `main`, or a live reel.
- Draft a topic the syllabus marks `*(skipped)*` (the claim script never hands one out).
- Skip the fact-check or the coverage map to go faster: the review run depends on them being there.

## Report (section 9, at the end of the run)

Per topic drafted: id, branch, what the fact-check corrected, the coverage map's open items (none expected), and the narration validator's result. Then the chapter's state: topics drafted, in review, content-final, held, live; and what the next run will get.
