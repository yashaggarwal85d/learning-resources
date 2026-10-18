---
name: review-topic
description: Review run on the cloud (role review): take one drafted topic of a domain, review it (content, looks), fix it, run every check, mark it content-final and ship it held without audio for the PC to narrate and release. Use for "/review-topic <domain>", "review the drafts", "ready the next topic", or as the body of a domain's routine.
---

# /review-topic <domain>

The second stage of making topics (ROUTINE.md, "Three stages, decoupled"). Draft runs (`/draft-chapter`) wrote the topic; this run makes it ready. Narration is parked for the owner's PC (`/narrate`).

## Steps

1. `node scripts/claim.mjs next "<domain>" --role review` first, before reading anything. `wait` → stop with the reason. `review` → check out `topic.branch` (`git fetch origin && git checkout -B <branch> origin/<branch>`), start the heartbeat, read `OUTLINE.md` → "Progress": a first review starts at ROUTINE.md section 4; a stopped review continues at its first unfinished step; `contentFinal: true` means only section 8 is left.
2. `npm run build` once, to confirm the draft builds as handed over; a draft that does not build is fixed first (a fix agent), and the cause goes into the report.
3. ROUTINE.md section 4: the Opus content review (flow, pre-notes, gap hunt, expert reader, **narration teaches in the professor's voice**), every finding fixed.
4. Section 5: every check except narration (`node scripts/check-all.mjs --skip narration --changed`), then the looks and learning review on the screenshots, every finding fixed.
5. Section 6: content final (`claim.mjs final`, "Changes after final" from here on).
6. Section 8: ship **held**, without audio, every check green on the merged branch, CI and Deploy green; `claim.mjs done`.
7. Section 9: report; say the topic shipped **held, parked for narration on the PC**.

## Never

- Run `site/narration/setup.sh` or `narrate.sh`, generate or commit audio, or set a topic live (`test:narration` fails a live reel without audio; the PC releases).
- Take a second topic in the same run.
- Redo the draft's research, plan or fact-check unless a review finds them wrong; the draft run's `SOURCES.md`, `OUTLINE.md`, `FACT-CHECK.md` and `coverage.json` are the record.
- Touch a topic another run holds, a chapter plan, or a live reel.

## Models

As ROUTINE.md section 0: Opus (effort high) for the content review; Sonnet for the looks review, the fix agents and the run itself.
