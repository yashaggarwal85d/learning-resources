# Quality Record — every issue we've hit, and what stops it happening again

Every problem found in this project is recorded here with its fix and the **guard** that prevents it from coming back. A guard is either an automatic check (the build or CI fails) or a rule in [PROJECT_PLAN.md](PROJECT_PLAN.md) that every topic is checked against before it ships (workflow step "Check against the Quality Record").

When a new issue is found: fix it, add a row here, and add or strengthen a guard. Prefer an automatic check over a written rule whenever one is possible.

## Automatic checks (run on every push; a failure blocks the deploy)

| Check | Where | Catches |
|---|---|---|
| Flow check: no live topic has an unreleased topic before it in its domain | `site/src/lib/live.ts` (build) | Reels appearing "out of nowhere" |
| Concept ledger: everything a live topic `uses` was introduced by an earlier live topic or is `declared` | `site/src/lib/live.ts` (build) | Concepts used before they are taught |
| Every live topic has a `bridge` and a `handoff`, and its kind (full / refresher) matches the syllabus | `site/src/lib/live.ts` (build) | Abrupt starts and endings |
| Every topic title, and every on-site reel named in a Prerequisites panel, exists in the syllabus | `site/src/lib/live.ts`, `site/src/components/Resource.astro` (build) | Links to topics that don't exist |
| On-site reels in Prerequisites are labelled from the syllabus order ("Before this", "Goes deeper later", other track) | `site/src/components/Resource.astro` (build) | A panel contradicting the course order |
| Every topic's code examples run and their asserted outputs hold | `npm run test:examples` (`examples.py` per topic) | Wrong or outdated code on screen |
| Reel smoke test at 1440 × 900 and iPhone size: no page or console errors, no sideways scroll, every step renders a non-empty visual, predict steps answerable, pause/replay/restart controls exist and pause freezes the clock, on phone a real touch swipe left/right moves exactly one step on every step and a vertical swipe never changes the step, every panel opens with content on first and second open, outside links open in a new tab | `site/tests/reels.mjs` | Broken reels, empty panels, missing controls, layout overflow |
| Markdown relative links and anchors resolve | `scripts/check-docs.mjs` | Broken links in the plan and syllabi |
| Narration exists for every live reel, matches its current script, both formats present, every line word-perfect, loudness, peak and pace in range | `npm run test:narration` (`site/tests/narration.mjs`) | Missing, stale or badly mastered narration |
| The deploy also runs when only `syllabus/` changes | `.github/workflows/deploy.yml` | Site out of date with the syllabus |

## Issues and their guards

### Course structure and flow

| # | Issue | Fix | Guard |
|---|---|---|---|
| 1 | The first reel (§1.3 I/O cost model) went live with 12 topics before it unbuilt, so it appeared out of nowhere. | Held it back; production restarted from the first topic of the domain. | Flow check (automatic); Rule #5 "Released in order, no gaps". |
| 2 | The syllabus taught the I/O cost model (§1.2) before the memory hierarchy and storage devices (§1.3) it rests on, and before the B+-tree refresher it uses. | Swapped §1.2 and §1.3; moved the B+-tree refresher ahead of the cost model. | Concept ledger (automatic); Rule #5 "Prerequisites come first in the syllabus"; flow review step. |
| 3 | Logarithms were used but not covered anywhere in Data Engineering. | Added the refresher "Asymptotic notation and logarithms" to §1.1. | Concept ledger (automatic). |
| 4 | The Prerequisites panel listed later topics as prerequisites, contradicting the course order. | On-site reels are labelled automatically from the syllabus order. | Automatic labelling in `Resource.astro`. |
| 5 | Refreshers were planned as pages, so the basics couldn't be revised in the same quick way. | Refreshers are short reels in the same player. | Plan (Audience, Rule #5); kind check against the syllabus (automatic). |
| 6 | Reels started and ended abruptly, with no link to the topic before or after. | Every topic has a bridge (shown on its first step) and a handoff (on its end card). | Build requires both (automatic); flow review step. |

### Correctness of content

| # | Issue | Fix | Guard |
|---|---|---|---|
| 7 | The first draft claimed a cost-based planner would pick a full scan at 2% selectivity; PostgreSQL actually picks a bitmap heap scan up to about 50%. | Reframed around page reads; measured the real plans on PostgreSQL 16 and put the results in the lab. | Rule: any claim about how a real system behaves is checked by running that system, not reasoned about. |
| 8 | A PostgreSQL docs quote ("40 times slower… 1.1 for SSDs") came from docs for version 12 and earlier. | Quoted the current docs. | Rule: quote only the current version of official docs, with the version in the citation; fact-check step looks for outdated wording. |
| 9 | Paper attributions were subtly wrong (the PDAM credited to the wrong paper; an author list). | Corrected from the papers themselves. | Every claim goes through the adversarial fact-check against primary sources; results kept in the topic's `FACT-CHECK.md`. |
| 10 | A resource length ("48 min") was written without being verified. | Removed; only verified metadata is shown. | Rule: titles, authors, lengths and links of resources must be verified (YouTube oEmbed, HTTP 200 plus matching title). |
| 11 | The site said reels were "narrated" before any narration existed. | Removed the claim until narration ships. | Rule: never describe a feature on the site before it exists. |
| 12 | A sampled statistic (pages touched) depended on the random seed. | Chose a seed whose sample matches the formula, and showed the formula. | Rule: any random data shown is seeded and checked against the exact value it illustrates. |

### Reel player and layout

| # | Issue | Fix | Guard |
|---|---|---|---|
| 13 | No visible way to pause, play, replay a step or restart a reel. | Control row above the progress bar (pause/play, replay step, restart reel) with keys P, R, Shift+R. | Smoke test checks the controls exist and that pause freezes the clock. |
| 14 | The Deep dive sheet was empty on the second open (the content was moved into the sheet and destroyed on close). | The sheet copies the content instead of moving it. | Smoke test opens every panel twice. |
| 15 | Outside links in the Deep dive opened in the same tab, losing the learner's place in the reel. | They open in a new tab. | Smoke test. |
| 16 | On phones, long captions squeezed the animation to almost nothing; extra code panels spilled under the caption. | Captions clamp to three lines with "more"; the visual keeps at least 38% of the height and clips its contents; reveal steps swap panels on phones. | Smoke test screenshots at phone size; rule: check every step at both sizes before shipping. |
| 17 | SVG labels were unreadably small on phones. | Raised the minimum label size in scenes. | Rule: no SVG text below 13 units on the 600-unit canvas. |
| 18 | On desktop, chart labels ran under the side buttons. | The visual keeps clear of the side rail. | Smoke test screenshots; rule: nothing important within the rail's width. |
| 19 | A large pause icon covered the animation. | Removed; the control row shows "Paused". | Rule: overlays never cover the visual during a step. |
| 20 | Header pills were see-through, so text scrolled visibly behind them; a badge wrapped onto two lines on phones. | Opaque background; no-wrap badge. | Screenshot review at both sizes. |
| 21 | Hero sky: topic stars too faint, labels clashing with the scroll cue and running off-screen on phones. | Brighter stars, repositioned galaxies, labels kept inside the canvas and hidden on phones. | Screenshot review at both sizes. |

### Delivery and process

| # | Issue | Fix | Guard |
|---|---|---|---|
| 22 | GitHub Pages wasn't enabled (and the repo was private), so the first deploy failed. | Repo made public; Pages source set to GitHub Actions. | Noted in the plan's deploy notes; the deploy job fails loudly if Pages is off. |
| 23 | A syllabus-only change would not have triggered a redeploy. | `syllabus/*.md` added to the deploy triggers. | `deploy.yml`. |
| 24 | A helper agent once put personal details (an email address) in a web request header. | Every agent brief now forbids personal information in any request, header or query. | Rule in every agent prompt. |
| 25 | The first narrator voices (Kokoro) sounded robotic. | Compared Qwen3-TTS, VoxCPM2, Chatterbox and Orpheus by ear; the owner chose Orpheus "tara". | Rule: the voice is chosen by listening, by the site owner, then frozen in `narration/voice.json`. |
| 26 | Orpheus "tara" lacked natural pauses and pitch movement. | Scripts written for speaking; best of several takes per line by pitch movement; designed pauses and beats. Pitch variation rose from 3.3 to 4.4 semitones. | The method is fixed in the plan and in `narration/`; every clip is made the same way. |
| 27 | The transcript check flagged "2%" against "two percent" (and would flag "mypy" against "my pie"). | Transcripts and scripts are normalised (numbers spelled out, "a million" = "one million", an alias list). | `narration/assemble.py`; real errors (a skipped word, "endpoints" for "engineers") are still caught. |
| 28 | Narration could silently fall out of date when a script line changed. | Every clip stores a hash of its script and voice version. | `npm run test:narration` fails on any stale or missing clip, wrong loudness, peak or pace. |
| 29 | The voice mangled code names and some words ("functools" → "folk cells", "mypy" → "mikai", "retries" → "ratties", "with always cleans up" → "with all means up"). | Those lines rewritten in plain spoken English; the transcript check rejected every bad take, so none shipped. | Rule (plan, Narration): narration scripts avoid code identifiers and say what they mean in plain words; a line no take can pass is rewritten, never the check loosened. |
| 30 | Swiping left or right between steps did nothing on phones (it worked on PC with keys and clicks); on code steps the code panel's own sideways scroll also swallowed the swipe. | Horizontal swipes on the reel stage go to the next / previous step; the stage only lets the browser scroll vertically (`touch-action: pan-y`); code panels shrink their font to fit the screen width, so nothing inside a reel scrolls sideways. | `test:reels` sends real touch swipes (Chrome DevTools touch events) at phone size on every step, from two start points, and checks a vertical swipe still scrolls the feed. Rule: nothing inside a reel scrolls sideways. |

## Before shipping any topic

Go through this list (it summarises the rows above):

1. Every topic before it in its domain is live; its `introduces` / `uses` ledger is filled in; it has a bridge and a handoff.
2. Every claim checked against primary sources; behaviour of real systems verified by running them; current docs quoted.
3. Every code example in `examples.py`, executed.
4. Every resource link and its metadata verified.
5. Screens checked at desktop and phone size: nothing clipped, overlapping, too small or hidden behind controls; swipes work on a real phone.
6. Narration generated with `narration/narrate.sh` and listened to end to end.
7. `npm run build`, `npm run test:examples`, `npm run test:narration` and `npm run test:reels` pass.
8. No feature described before it exists.
