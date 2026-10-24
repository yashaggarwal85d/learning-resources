---
name: make-topic
description: Make the next topic of a domain end to end in this session, the only way topics are made now (no routines, no claims): plan its chapter if needed, research with verbatim sources, storyboard to the briefing design, fact-check, coverage map, build every file, review content and looks, run every check, narrate on the GPU, ship it live. Use for "/make-topic <domain> [count]", "create the next topic", "make a new topic", "make the next N topics", "plan the next chapter".
---

# /make-topic `<domain>` `[count]`

How a topic is made (owner decision 2026-10-20): the owner opens Claude Code and asks; this session does every stage itself, start to finish, and ships the topic live. It replaces the cloud routines, `ROUTINE.md`, the draft and review skills and the claims system. The rules live in [PROJECT_PLAN.md](../../../PROJECT_PLAN.md) and [QUALITY.md](../../../QUALITY.md), the house style in [DESIGN.md](../../../DESIGN.md); this file is the order of work. If anything here conflicts with the plan, the plan wins.

`<domain>`: `de`, `dsa`, `rust`, or a domain title. `[count]`: how many topics to make in a row (default 1); each is finished and shipped before the next starts.

## 0. Ground rules

- **You do every stage yourself, in this session.** No subagents and no model switching (owner rule; see the memory note "No subagents or Opus"). Independence comes from discipline instead: write a stage, commit it, then review it as a different person would, by re-reading the files cold against the checklist named in that stage, never from memory of having written them. Reviews are recorded in `REVIEW.md` marked "self-review", and the report says plainly that no independent reviewer ran.
- **Quality over time.** A refresher takes a few hours, a full topic most of a day. Never shorten a stage to save time; stop and report instead (section 12) if you must.
- **Never publish anything half-done.** Work on a branch `topic/<topic-id>`; `main` (which deploys the live site) receives the topic only when every check is green (section 10). Commit at the end of every stage with `OUTLINE.md` → "Progress" saying what is done and what is next, so a stopped session can be resumed (section 1).
- **Share the checkout safely.** Other sessions may work in this checkout at the same time (a narration run commits audio to `main`). Before starting, run `git status` and look for running `narrate.sh` or `narr-worker.sh` processes. If anything else is working here, make the topic in its own worktree: `git fetch origin && git worktree add ../lr-<topic-id> -b topic/<topic-id> origin/main`, then `cd ../lr-<topic-id>/site && npm ci`. Otherwise a branch in place: `git switch -c topic/<topic-id> origin/main`. Either way, **stage only files you wrote** (`git add <paths>`, never `git add -A`), and never leave your files staged while you are not committing: another session's commit would take them.
- **Live reels are locked** (`scripts/check-locked.mjs`, in `check-all` and CI). A live topic's folder, audio, registry entry, every file its reel imports (the kit, a chapter's `refreshers.tsx`) and the shared player, layouts, pages and styles are not yours to change. If your topic needs a change there, build around it and ask the owner; only the owner unlocks (a commit line `Unlock: <topic-id>` or `Unlock: shared`, written when they asked for that change).
- **Skipped topics are not made.** A syllabus topic marked *(skipped)* stays in the curriculum and gets no reel; `next-topic.mjs` leaves it out, and the topic after it bridges from the last topic that is not skipped.
- **A failing check is your job.** Find the cause and fix it: missing content gets written, a wrong claim corrected, a broken layout repaired. Never skip, loosen or delete a check, never drop content to get green, and never push to `main` while anything is red. If `main` itself is red, fix that minimal cause too and say so.
- **Don't guess.** Any claim about how a real system behaves is verified by running it or against the current primary source. If it can't be verified, leave it out.
- **Read sources as they are.** WebFetch returns a small model's summary of a page: use it and web search only to *find* sources. Fetch every source you rely on with `node scripts/sources.mjs fetch <url> <topic-folder>/sources/<name>.txt` and read that text; quotes go into `SOURCES.md` exactly as they appear there, and `node scripts/sources.mjs check <topic-folder>` proves every quote word for word.
- **Keep your context small.** Read the parts of files you need (named sections by heading, the previous topic's step titles rather than its whole reel), never a file you just wrote, and only the tail or the failures of long logs. Run long jobs (`check-all`, `narrate.sh`) in the background and do other work of this topic while they run.
- **Ask the owner only for real decisions**: a syllabus bug whose fix would move a live topic, a scope cut, an Unlock. Everything else, decide by the plan and DESIGN.md and carry on.
- **Privacy.** No personal information in any web request. **No vendors for the voice.** Narration only through `site/narration/` with the frozen voice in `voice.json`.

## 1. Pick the topic

```sh
node scripts/next-topic.mjs <domain>
```

It prints the next topic in syllabus order that is not in the registry, as JSON:

- `action: "plan-chapter"`: its chapter has no `CHAPTER.md` yet. Do section 2 first, then come back here.
- `action: "make"`: the chapter is planned; make `topic` (its `topicId` and `folder` are permanent: use them exactly).
- `action: "done"`: every topic of the domain is live. Report it and stop.
- `topic.status: "in progress"`: its folder exists from a stopped session. Find its branch (`git branch -a --list "*topic/<topic-id>*"`), check it out, read `OUTLINE.md` → "Progress" and continue at the first unfinished stage.

Then read, before writing anything: the plan's Core Rules, Learning design, Narration (with The narrator's persona) and Definition of Done; all of `QUALITY.md`; all of `DESIGN.md`; the chapter's `CHAPTER.md` (this topic's entry is the contract: scope, outcomes, concepts it introduces and uses, bridge, handoff, Prerequisites); the previous topic's registry entry, reel step titles, post-notes headings and `REVIEW.md` (pick up exactly where its handoff leaves off, and don't repeat what its reviews found); the next topic's syllabus line; and the drawing kit `site/src/reels/kit.tsx`. Never edit `CHAPTER.md` to suit the topic: if the topic truly can't keep to its entry, stay as close as it can and record why under `OUTLINE.md` → "Changes from the chapter plan".

## 2. Plan the chapter (when it has no plan)

A chapter plan decides everything the chapter's topics share and nothing a topic can decide alone. Inputs: the chapter's topics from the JSON (titles, syllabus lines, ids, folders), the first topic of the next chapter (`nextChapterFirst`), the previous chapter as it really is (registry entries, reel step titles, post-notes headings, `REVIEW.md`), the plan's Core Rules, Learning design and Narration, `DESIGN.md` and `QUALITY.md`.

1. Write `CHAPTER.md` in `chapter.folder`:
   - **The chapter:** the problem it solves for the learner, the order of ideas and why, the notation, terms and running example every topic shares, and the chapter's visual language in the briefing style (which kit moves carry its recurring ideas).
   - **Each topic, in syllabus order:** title, id, folder, kind (full or refresher); **scope**, clause by clause from its syllabus line, and what it leaves to which other topic (no overlap, no gap); learning outcomes; concepts it `introduces` and `uses` (registry ids; a concept is used only after the topic that introduces it); its `bridge` from the topic before and `handoff` to the topic after (the last hands off to the next chapter's first topic); its Prerequisites and pre-notes terms; its hook (the hard problem it opens on) and visual idea in a line; the primary sources it should start from.
2. Commit it, then review it cold, as the plan's reviewer: a syllabus clause assigned to no topic or to two; a concept used before it is introduced (within the chapter and against the chapters before); a bridge that doesn't answer the handoff before it; overlapping scopes; inconsistent notation; anything an expert would find thin or wrong. Fix every problem.
3. Publish it on its own: commit `Plan <domain> chapter <N>: <title>` and push it to `main` (`git push origin HEAD:main`; if rejected, `git pull --rebase origin main` and push again). Then run `next-topic.mjs` again and make the chapter's first topic.

## 3. Research

1. **State of the art.** Scan for the current versions, recent changes and the best primary sources: official documentation for the exact version covered, specifications and RFCs, the source code, the original papers, the engineering write-ups and post-mortems of the teams that run the system.
2. **Fetch and quote.** For each source: `node scripts/sources.mjs fetch …`, then write its section of `SOURCES.md` in the format at the top of `scripts/sources.mjs`: URL, version, every passage the topic could rely on as **verbatim quotes**, and the source's contents item by item (for the coverage map). A source that can't be fetched is replaced by one that can, or its claims are dropped. Then `node scripts/sources.mjs check <topic-folder>`: every quote passes before planning starts.
3. **The expert list, before any plan.** From the syllabus line and the sources only, before you plan a single step, write "what an expert must know" about this topic: each item with a primary source you have opened (never one cited from memory) and a placement (here, a named later syllabus topic, or out of scope). Commit it as `coverage.json` → `expert` now, so the plan can't bend it.

Commit: `WIP <topic-id>: research done`.

## 4. Content plan and storyboard

Write `OUTLINE.md` in the topic folder, the plan everything else follows:

- the learning outcomes (2–4 things the learner can do afterwards);
- the reel's steps in order, each with a **storyboard** to `DESIGN.md` in the briefing style: title; `fig` name; the visual idea for this concept and why it makes it click; what is on screen and where, portrait first, then landscape; **what moves on which beat**, naming the kit moves (draw, plot, count, decode, lock-on, surface), since every step moves; the real values shown; the final frame, which must teach the step on its own; the caption's point; the `takeaway` on key steps (one sentence, at most 20 words, nothing the step doesn't show);
- the **engagement arc** (`DESIGN.md` → What makes a reel engaging): the hook on step 1, a predict step within the first four steps (at least one in a refresher, two in a full topic), the surprising number, at least three takeaways, the recap; every predict question with its answer, its wrong options and why each is tempting;
- for each step, **the narrator's line of thought**: what she explains beyond the description (the why, what to watch, the wrong intuition she corrects, the question she asks before the reveal), in the MIT-professor persona of the plan, since the narration teaches and never reads the description (`.claude/skills/narrate/teacher-pass.md`);
- the post-notes headings with what each covers (the plan's layers 5–8: internals, lab, production failures, frontier, and "Where this goes next");
- the examples to execute and what each must assert;
- the bridge and handoff; the concept ledger (`introduces` / `uses` / `declared`);
- **the claims list**: every factual claim the topic will make, with its source.

Writing follows `OUTLINE.md`; a change of plan later is made in `OUTLINE.md` first, with the reason. Commit: `WIP <topic-id>: content plan`.

## 5. Fact-check, currency and red team

Switch roles: you are now the adversarial fact-checker, and the plan is someone else's. Re-derive every claim in the claims list from the fetched source texts in `<topic>/sources/` (fetch more the same way where needed; a source you could not open doesn't count). Check that each quote really supports the claim it is cited for. Flag anything outdated, renamed or superseded (quote the current version). As red team, try to break every explanation and every predict question with edge cases and counter-examples. Write the result as `FACT-CHECK.md` (one row per claim: confirmed, corrected, or dropped, with the evidence; the format of the existing topics' files), apply every correction to `OUTLINE.md`, and commit.

## 6. Coverage map

Complete `coverage.json` (the format is at the top of `site/src/lib/coverage.ts`; follow the existing topics' maps):

- `syllabus`: the syllabus line split into clauses, word for word, together covering the whole line;
- `sources`: the contents of at least two primary sources, item by item;
- `expert`: the list from section 3, unchanged;
- every item mapped to a planned reel step title, a post-notes heading, or another syllabus topic, quoting the part of its line that covers it. Source and expert items may be `out` only with a reason; a syllabus clause never. Anything that belongs here and isn't planned yet goes into `OUTLINE.md` now.

## 7. Build every file

In the topic folder (ids are permanent and prefixed by domain: `de.`, `dsa.`, `rust.`). Take the previous topic's folder as the pattern for format, and `DESIGN.md` for the look.

- `examples.py` (or `examples.sh` called from it): everything about real software behaviour, with asserts for every number and output the reel shows. Run it where the machine can (`python examples.py`); the build checks that every number on screen appears in it.
- `reel.tsx` + `scenes.tsx`: the steps and their animations, every animation a pure function of time, built from the kit to `DESIGN.md`: black and white with colour only for failure or a second series, every step moving with the kit's moves (`Draw`, `Plot`, `Reticle`, `Decode`, `Surface`, `Eq`, counts), `fig` and `takeaway` where the storyboard names them, each written on one line. Refreshers: about 5 minutes, a fast recap. Full topics: the plan's learning-design layers 1–4 and "Prove it" in the reel. The build checks the predictions, the takeaways, and that colours and fonts come from the kit (`topic-checks.ts` check 6).
- `post-notes.md`: the Deep dive for after the reel, plain Markdown with `<section data-section="…">` wrappers (outcomes, internals, lab, production, frontier, "Where this goes next").
- `references.md`: the sources actually used, with "Last verified: <date>" and "Expert sign-off: pending".
- `pre-notes.md`: **only what must be known before watching**, never a term the reel teaches: 4–14 bullets `- **Term**: definition in our own words. *Where you meet it:* scenario.`, under 400 words, no links (`site/src/lib/notes-rules.ts`).
- `prerequisites.mdx`: links only, a heading per thing to know first and its resources; on-site reels as `<Resource kind="reel" host={props.host} …>`. Verify every outside link and its title, author and length (YouTube via oEmbed, pages for a 200 and a matching title); leave out what you can't verify.
- `narration.json`: `{"topic": "<the topic's id>", "steps": [...]}` — the top-level `topic` field is required (`narration/common.py`'s `clips()` reads it; a file without it crashes every narrate.sh run for that topic with `KeyError: 'topic'`). The spoken script itself is one line per sentence or phrase, written to be heard, an `answer` entry for every predict step, numbers and names written the way they are said, at most 50 words a line. It **teaches in the professor's voice and never reads the description** (`.claude/skills/narrate/teacher-pass.md`); `node scripts/narration-teaches.mjs <folder>` must show no flag.
- The registry entry in `site/src/topics/registry.ts`: `kind`, `introduces` / `uses` / `declared`, the real `bridge` and `handoff`, `minutes`, `verified`, `status: 'live'` (the topic before it is live: topics are made in order).

`npm run build` (from `site/`) until it passes. Commit: `WIP <topic-id>: built`.

## 8. Content review

Switch roles again: a sceptical senior engineer and teacher who has never seen this topic. Read the previous topic's reel and Deep dive, then this topic's files in order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), and the next topic's syllabus line. Append to `REVIEW.md` ("Content review, self-review, <date>"), numbered findings with where, what, evidence, fix and severity:

- **Flow:** anything abrupt, used before it is taught, or a prerequisite that sits later in the syllabus.
- **Pre-notes:** only vocabulary the reel assumes, each definition correct and in our own words, a primer, no links.
- **Gap hunt:** everything missing, thin, or wrongly marked as covered elsewhere, against the syllabus line, the sources and the expert list.
- **Expert reader:** anything imprecise, hand-wavy, or below the depth the plan's Learning design asks for.
- **Engagement:** does step 1 hook with a real problem, is there an early prediction, does a number surprise, are the takeaways worth keeping, does the recap pull it together?
- **Narration teaches:** step by step, would an MIT professor say this about the picture, or is it the description read or paraphrased?

Fix every finding. A prerequisite later in the syllabus is a syllabus bug: log it in `syllabus/review-notes/` and, unless the fix would move a live topic (then ask the owner), reorder; meanwhile teach the missing piece here (`introduces`). Record the review in `coverage.json` → `gapReview` (date, "self-review", `open: []`). Commit.

## 9. Checks and the looks review

From the repo root (or the worktree):

```sh
node scripts/check-all.mjs --skip narration --changed      # docs, sources, build, this topic's reel test, links
node scripts/check-all.mjs --only reels --topic <topic-slug>    # while fixing: just this reel
```

The reel test fails text in a drawing that is clipped, overlapping, running into other text or under 9 px, at desktop and phone size. A coverage failure means content is missing: write it, never weaken the map. Change shared code only if this topic truly needs it, keep every existing topic working, and expect the full reel test (and an Unlock from the owner).

Then **the looks and learning review**, yourself: open every screenshot of this topic in `site/test-results/` (each step, desktop and phone, and each question frame) and judge it by `DESIGN.md` → "The looks review checks" as a demanding designer and teacher would: the point visible at a glance and shown by more than brightness, every step moving and landing on a final frame that teaches, nothing crowded, clipped or small, colour only where it means something, the caption matching the picture. Append findings to `REVIEW.md` ("Looks review, self-review"), fix every one, re-run the reel test for this topic, and look at the changed steps again. Everything here is green before going on. Commit.

## 10. Narrate

Narrate before shipping, so the topic goes live with its voice. Preconditions: `site/narration/voice.json` → `version` is the frozen voice (not `tara-v1`), the PC toolchain is set up (`site/narration/pc/README.md`), and the GPU is free enough: at most three GPU narration processes at once on this machine (count running `gen_takes` / `narrate.sh` processes; another session's workers count).

```sh
cd site && narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

As in `.claude/skills/narrate/SKILL.md` section 2: a line no take can pass is rewritten (plainer words, names and numbers as said; a short rushed question split or shortened), never forced through by loosening a limit; listen to the clips with tolerated mishearings first. Commit the audio (`site/public/audio/<topic-id>/`) with any script change.

If narration can't run now (no GPU time, the toolchain missing, or the owner says ship without it), ship without audio: add the topic's id to `site/src/topics/renarration.json` → `pending` (live topics may go live before they are narrated, owner decision 2026-10-17); `/narrate` generates it later.

## 11. Ship

1. Go through `QUALITY.md` → "Before shipping any topic". A new kind of problem met along the way gets a row there with its fix and a guard (an automatic check where possible).
2. `git fetch origin && git merge origin/main` into the topic branch; resolve conflicts (in `registry.ts` and `renarration.json` keep both sides' entries).
3. **Continuity:** the topic still matches its `CHAPTER.md` entry and the previous topic's real handoff and concepts; bring the bridge, Prerequisites and `uses` in line.
4. `node scripts/check-all.mjs --changed`: every check green on the merged branch, narration included (a topic queued in `renarration.json` passes with a warning).
5. Push to `main` (`git push origin HEAD:main`; if rejected, merge `origin/main` again and repeat from step 4), then watch CI and Deploy for your push (`gh run list --branch main --limit 4`, `gh run watch <id>`) until both are green. If CI fails, fix it and push again; never leave `main` red.
6. Clean up: delete the topic branch (and the worktree: `git worktree remove ../lr-<topic-id>`).
7. Optional: `node scripts/run-metrics.mjs finish <domain> <topic-id> shipped --checks "…" --issues "…"` puts the session on record in `LEDGER.md`.

With a `[count]` above 1, go back to section 1 for the next topic.

## 12. Report

A short report for the owner: the topic shipped live (its link: `https://yashaggarwal85d.github.io/learning-resources/<slug>/`), narrated or queued; what was verified and how (fact-check corrections, executed examples, measured results); the main review findings and what changed because of them; that the reviews were self-reviews, with no independent reviewer; what remains for a human (expert sign-off, narration if queued, any syllabus note); and, if the session stopped early, the branch, the stage reached and what is left.

## Never

- Use a routine, a scheduled run or a subagent to make a topic.
- Push a topic to `main` with anything red, or before the content and looks reviews are done.
- Change a live topic or shared code without the owner's Unlock.
- Loosen a check, a limit or the coverage map to get green.
