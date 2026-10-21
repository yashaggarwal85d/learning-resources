# Learning Resources

An expert-level learning site where every topic is a short animated, narrated **reel**, backed by pre-notes, post-notes and sources, and checked against primary sources.

**Live:** https://yashaggarwal85d.github.io/learning-resources/ (the Reels tab plays every finished topic in course order).

Three tracks, each with a full syllabus:

| Track | Syllabus | Status |
|---|---|---|
| Data Engineering | [syllabus/data-engineering.md](syllabus/data-engineering.md) | in production (`/make-topic`, run by the owner in Claude Code; narration on the owner's PC) |
| Data Structures & Algorithms | [syllabus/data-structures-and-algorithms.md](syllabus/data-structures-and-algorithms.md) | in production (`/make-topic`, run by the owner in Claude Code; narration on the owner's PC) |
| Rust Systems Engineering | [syllabus/rust-systems-engineering.md](syllabus/rust-systems-engineering.md) | in production (`/make-topic`, run by the owner in Claude Code; narration on the owner's PC) |

## The documents that run the project

| File | What it is |
|---|---|
| [PROJECT_PLAN.md](PROJECT_PLAN.md) | The rules (animate first; one topic at a time; verified, state-of-the-art content; beautiful and memorable; a natural flow; complete coverage, proven), what every topic contains, the Definition of Done, the narration standard and the tech stack. **The plan wins any conflict.** |
| [`.claude/skills/make-topic/SKILL.md`](.claude/skills/make-topic/SKILL.md) | How a topic is made: the step-by-step procedure `/make-topic <domain>` follows in one Claude Code session, from the chapter plan to the live, narrated reel. |
| [DESIGN.md](DESIGN.md) | The house style for reel steps: canvas, text sizes, colour, motion, and what the looks review checks. |
| [LEDGER.md](LEDGER.md) | Two lines per recorded session (and, until 2026-10-20, per routine run and audit finding): time, tokens per model, checks passed, what went wrong. |
| [QUALITY.md](QUALITY.md) | Every problem ever found, its fix and the guard that stops it recurring, plus the automatic checks and the "before shipping" list. |
| `syllabus/` | The course order, topic by topic; `syllabus/review-notes/` records syllabus changes and why. |

## Repository layout

```
PROJECT_PLAN.md  DESIGN.md  QUALITY.md    rules, house style, quality record
.claude/skills/make-topic/                 how a topic is made (/make-topic)
syllabus/                                  the four syllabi (the build reads them)
scripts/check-docs.mjs                     checks links and anchors in the docs
site/src/reels/kit.tsx                     the drawing kit every topic's scenes are built from (colours, canvas, text)
scripts/check-all.mjs                      runs every pre-ship check with a timing summary (make-topic sections 9 and 11)
scripts/check-links.mjs                    checks every topic's outside links (status and title)
scripts/next-topic.mjs                     the next topic of a domain to make, with its id, folder and chapter plan
scripts/affected.mjs                       which reels and links a change can affect (CI and check-all --changed test those)
scripts/sources.mjs                        fetches sources raw and proves every quote in SOURCES.md word for word
scripts/ledger.mjs                         appends entries to LEDGER.md on main (run-metrics.mjs finish uses it)
scripts/run-metrics.mjs                    records a run's tokens (per model), calls and time, per stage
site/                                      the website (Astro + React islands + Tailwind)
  src/topics/registry.ts                   every finished topic: live or held, concept ledger, bridge and handoff
  src/topics/<domain>/m<N>-…/ch<NN>-…/<topic>/
    reel.tsx, scenes.tsx                   the reel: steps and animations (each a pure function of time)
    pre-notes.md                           what to know before watching: the topic's prerequisite vocabulary, in brief (editable in the page)
    post-notes.md                          the Deep dive: after the reel (editable in the page)
    references.md                             the sources actually used, with their last-verified date
    prerequisites.mdx                      links only: where to learn what the topic assumes
    narration.json                         the spoken script (lines and beats)
    coverage.json                          the coverage map (syllabus, sources, blind expert list, gap review)
    examples.py                            every example and number, executed with asserts
    FACT-CHECK.md                          claims checked against primary sources
  src/lib/live.ts, coverage.ts,            build-time checks: flow (Rule #5), coverage (Rule #6),
    topic-checks.ts                        narration alignment, speakable lines, numbers backed by examples.py
  src/reels/                               the reel player, feed, captions, narration hook
  narration/                               voice-over pipeline: voices, setup, generation, checks
  public/audio/<topic id>/                 generated narration clips and their manifest
  tests/                                   reel smoke test (Playwright) and narration check
.github/workflows/                         CI and deploy (GitHub Pages)
```

## Working on it

Requirements: Node 22, Python 3.12+ and, for the smoke test, Chromium (Playwright).

```sh
cd site
npm ci
npm run dev                  # local site at http://localhost:4321/learning-resources/
npm run build                # also runs the flow, coverage, syllabus and topic-file checks
npm run test:examples        # optional: runs every topic's examples.py (not a required check; needs rustc and a Linux shell for some)
npm run test:narration       # narration matches the scripts and the audio standard
npx astro preview --host 127.0.0.1 --port 4321 &
npm run test:reels -- http://127.0.0.1:4321/learning-resources/   # every live reel at desktop and phone size
node ../scripts/check-docs.mjs
npm run check:links          # outside links load and match their titles (also weekly in CI)
```

Every push runs all of these in CI; the deploy to GitHub Pages runs them again and publishes only if they pass.

### Narration

Narration is generated locally with open-source models (no voice vendors, no APIs) and committed as audio; CI only checks it.

```sh
cd site
narration/setup.sh           # once per machine or session: builds every tool outside the repo
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

- **English narrator:** Orpheus 3B, voice "tara"; every take is checked by a local speech-to-text model (faster-whisper large-v3-turbo) and must say its line.

Both are frozen in `site/narration/voice.json`. Details are in [site/narration/README.md](site/narration/README.md).

## Editing notes in the page

Every topic's panel has **Pre-notes** and **Post-notes** tabs. With an edit token set in your browser, each shows an **Edit** button that opens the Markdown file in an editor with a live preview; **Save to GitHub** commits it to `main` through the GitHub API, the Deploy workflow rebuilds the site, and the panel says "live in about 4 minutes" (it shows your text meanwhile). Without a token there is no Edit button.

One-time setup, per browser:

1. On GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access:** only `yashaggarwal85d/learning-resources`. **Permissions → Repository permissions → Contents: Read and write** (nothing else). Pick an expiry you are happy to renew (30 to 90 days).
3. Copy the token, open any topic's panel, click **Editing is off · set an edit token** at the bottom, paste it, **Keep in this browser**. It lives in that browser's localStorage only; it is never in the repository or sent anywhere except `api.github.com`. **Remove** forgets it.

What the editor guards: it applies the same rules as the build (`site/src/lib/notes-rules.ts`: pre-notes are 4–14 bullets, under 400 words, no links; no scripts or event handlers), so a save that would turn `main` red is refused before it is sent. If the file changed on GitHub while you were editing, nothing is overwritten: you see the differences and can take GitHub's version or copy your text. Each save is one commit whose message carries `Unlock: <topic-id>`, which is what lets the locked-reel check accept a change to a live topic.

## How a topic is made

The owner opens Claude Code in this repository and asks for one (owner decision 2026-10-20; the cloud routines, the claims and the daily audit are retired): `/make-topic <domain> [count]` ([the skill](.claude/skills/make-topic/SKILL.md)) makes the next topic of that domain end to end in one session, without subagents:

1. `scripts/next-topic.mjs` names the next topic in syllabus order, its permanent id and folder, and whether its chapter has a plan; a chapter without one is planned first (`CHAPTER.md`: each topic's scope, concepts introduced and used, bridge and handoff), reviewed and pushed to `main`.
2. Research from primary sources, fetched raw and quoted word for word (`scripts/sources.mjs`), and an expert list written before any plan.
3. The content plan and storyboard to the briefing design (every step moves; hook, early prediction, takeaways, recap), an adversarial fact-check against the fetched sources, and the coverage map.
4. Every file: the reel, executed examples, pre-notes, post-notes, sources, prerequisite links and the narration script in the voice of an MIT professor (never the description read aloud).
5. A content review and a looks review of every screenshot, both done as cold self-reviews and recorded in `REVIEW.md`; every check green (`node scripts/check-all.mjs --changed`).
6. Narration on the PC's GPU with the frozen voice, then the topic is pushed to `main` live, and CI and Deploy are watched until green.

A topic goes live only when every topic before it in its domain is live, so topics are made in order. If a check fails, the session fixes the cause and never loosens the check.

## Rules that never bend

- No personal information in any web request, ever.
- No cloning of real people's voices, and no voice vendors or APIs.
- Every claim is verified against a primary source; every example and number is executed.
- Nothing is described before it exists.
