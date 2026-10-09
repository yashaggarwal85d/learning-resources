# Project Plan — The Learning Experience

> A draft. Both this plan and the curriculum ([DATA_ENGINEERING_CURRICULUM.md](DATA_ENGINEERING_CURRICULUM.md)) will be polished further.

## Vision

Turn our curricula into a living, animated web experience. A single, beautiful **master page** is the gateway; from there a learner moves through the full hierarchy — **Domains → Milestones → Chapters → Topics** — and every topic is its own polished page built to _teach_, not just tell. The first domain is **Data Engineering**; more domains can be added later, each with its own curriculum.

## Audience

This is not an introductory site. It teaches the hardest work in each field (the systems, theory and engineering at the frontier) to **working professionals who are already very smart**: senior engineers, architects and researchers who learn fast, have little time and notice imprecision immediately. That shapes everything:

- **Assume fluency.** No re-teaching basics inside an advanced topic; prerequisites are linked, not repeated.
- **Precision over simplification.** Make the hard thing _clear_, never _wrong_. No analogies that break under scrutiny, no hand-waving; correct terminology, real numbers, stated assumptions.
- **Respect their time.** Dense, skimmable, skippable. A reader who already knows a part can prove it and jump past it.
- **Peer tone.** Written engineer to engineer: direct, no cheerleading, no badges, streaks or other gamification.
- **Go to the source.** Papers, design docs, source code, RFCs and post-mortems are part of the lesson, not a reading list at the end.
- **Basics are a refresher, not a course.** Where a curriculum lists true basics (Data Engineering's Chapter 1 covers Python syntax, Git and the shell, marked "patch gaps only"), they get compact refresher pages: what an expert should already know, a self-check, and links to the best external material. Full reels and labs are reserved for topics where we add depth. Foundations that are deep in their own right, such as query execution or storage internals, are taught at full depth.

## The Product

- **Master page (the hub).** One very polished landing page that links to everything and presents every domain and its curriculum map. From it, a learner can pick a domain, then drill from any milestone, into its chapters, down to any individual topic.
- **Navigable hierarchy.** The structure mirrors the curricula exactly — Domains → Milestones → Chapters → Topics — and every level is linked and reachable from the master page.
- **Domains.** A domain is a whole field of study with its own curriculum file and its own milestones. Data Engineering ([DATA_ENGINEERING_CURRICULUM.md](DATA_ENGINEERING_CURRICULUM.md)) is the first.
- **Everything is a webpage.** The master page and every single topic is delivered as a web page.
- **A continuous, automated motion-graphics sequence loops** as part of the experience — part of the visual identity, always alive, and always pausable.
- **Beauty is a requirement, not a nice-to-have.** The master page and every topic page must look exceptional.

## The Production Model

- **One topic at a time.** We do **not** generate the whole book at once. We produce a single topic — fully researched, fully animated, fully polished — and only then move on to the next.
- **Incremental and compounding.** The experience grows topic by topic; per-topic quality is never traded away for speed of coverage.
- **Release as we go.** The Data Engineering curriculum has roughly 820 topics. Order follows the curriculum, and each finished topic goes live straight away, marked "expert review pending" until its milestone's human sign-off, so learners get value long before the whole domain is done.

## The Core Rules (non-negotiable)

### Rule #1 — Animate first

If a topic or concept **can** be explained with a pretty animation, we animate it. Animation is the default teaching medium, not an afterthought. Powerful, automated, looping motion-graphics sequences carry the explanation wherever possible. Every animation must _explain_ something; motion that only decorates distracts from learning and is cut. Animate **processes** (data moving, a protocol's messages, a failure unfolding); make it **interactive** wherever the learner can learn by changing a parameter and watching the system respond; and keep a still summary of anything that moves, so nothing important exists only in motion.

### Rule #2 — One topic at a time, delivered as a scrollable reel

Production is strictly incremental — a single topic produced start to finish before the next one begins — rather than mass-generating everything. Each topic is like a **reel**: a self-contained unit of animations + content. Scrolling down ends the current topic and brings up the next one, in a continuous vertical feed.

### Rule #3 — State-of-the-art, verified content

Every topic must be current and correct. Content is **regressively re-checked** against official sources, multiple internet sources, and books. No incorrect, outdated, missing, or weak content is accepted — only state-of-the-art learning. Each topic shows its sources and a "last verified" date, and published topics are re-verified on a schedule (for example quarterly, and whenever a major version of the tool they cover ships). How this is enforced is set out in [Correctness and currency](#correctness-and-currency--how-we-make-sure).

### Rule #4 — Beautiful and effortless to memorize

Every page must look very good and be easy to remember. Even the hardest content must be made to feel easy and to stick — difficult made simple, simple made memorable. "Simple" means clear, never dumbed down: the explanation stays exactly as precise as the subject requires.

## Correctness and currency — how we make sure

No single check can prove content correct; critic agents in particular can share the same blind spots as the writer. So correctness rests on several independent layers, each catching what the others miss. Nothing can promise zero errors, but together these make errors rare, visible and quickly fixed.

1. **A ranking of sources.**
   - **Primary, and required for every claim:** official documentation for the exact version covered, specifications and RFCs, the source code itself, the original papers, and the engineering write-ups and post-mortems of the teams that run the system.
   - **Secondary, for framing and teaching, never as the only support for a fact:** books, conference talks and reputable courses.
   - **Not sources:** forum answers, unattributed blogs and AI-generated text.
2. **Every claim is traceable.**
   - Each factual statement, number and behaviour in a topic links to its source, with the version and the date it was checked.
   - A topic keeps a claims list in its front matter (claim → source → version → checked on).
   - CI fails if a marked claim has no source or a source link is dead.
3. **Executable truth.**
   - Every code, SQL and configuration example runs in CI against the pinned versions of the real tools (databases, Spark, Kafka and the rest started as containers in GitHub Actions), and its output must match what the page says.
   - Any performance number we state is reproduced by a script in the repo, with the hardware and versions recorded.
   - Where possible, the values an animation shows come from those same executed results, so the picture can't drift from reality.
4. **Independent, adversarial review.** Separate critic agents, ideally on different models, each with one job:
   - a **fact-checker** re-derives every claim from the cited source alone;
   - a **red team** tries to break the explanation with edge cases and counter-examples;
   - a **currency checker** looks for anything deprecated, renamed or superseded;
   - an **expert reader** judges depth and precision as a sceptical senior engineer would.

   Each must cite evidence for every objection. Anything they can't settle goes to a human.
5. **Human expert sign-off.**
   - Each milestone is reviewed by at least one practitioner who works with that technology in production; for frontier topics, ideally someone who builds the system.
   - The reviewer and date appear on the page ("Reviewed by …, on …"). Until then a published topic shows "expert review pending".
6. **State-of-the-art scan.**
   - Before a topic is written, and again at each re-verification, we scan the latest releases and changelogs, design proposals (such as Kafka KIPs and Iceberg spec changes), recent papers from the top venues (VLDB, SIGMOD, OSDI, NSDI and arXiv), and recent talks from the teams building the system.
   - The topic records what was scanned and when.
7. **Staying current automatically.**
   - Release and changelog feeds for every covered tool are watched.
   - Automated dependency updates (Renovate or Dependabot) open a pull request for each new tool version; CI re-runs every example against it, and a failure points at exactly the topics that went stale. The bump is merged only once the affected topics are re-verified for the new version, so a page never claims a version it wasn't checked against.
   - A topic whose last verification is older than its review interval shows a visible "due for re-verification" badge until it's re-checked.
8. **Public corrections.**
   - Every topic has a "report an error or unclear part" link that opens a structured GitHub issue.
   - Corrections are fixed quickly, logged in a per-topic changelog, and credited to the reporter.
   - Each confirmed error triggers a short root-cause note: which layer should have caught it, and how that layer is tightened.

## Learning design — what every topic contains

Built for experts. Research on how experienced learners learn (the "expertise reversal effect") shows that the step-by-step scaffolding that helps beginners slows experts down; they learn best from hard problems first, mechanisms in full, and room to skip what they know. The curriculum asks for "explanation → worked example → lab → failure analysis"; for this audience every topic is built in these layers:

1. **The problem.** Open with a hard, real situation the topic resolves, e.g. "your exactly-once pipeline double-counted after a consumer rebalance; why?". State the 2–4 things the reader will be able to do afterwards and link the prerequisites. By the end of the topic this problem is solved in full: it is the topic's worked example.
2. **Predict first.** Before each reveal, the reader commits to an answer ("what happens to p99 latency when…?"). Being wrong first makes the explanation stick.
3. **The mechanism.** The animated, interactive explanation of how it actually works, in segments the reader controls. Real values on screen, words next to the motion, nothing that only moves.
4. **Trade-offs and numbers.** The design space: the alternatives, what each costs, where each breaks, and the numbers that matter (latencies, throughput, complexity, cost) with back-of-envelope estimates.
5. **Into the internals.** Where the idea lives in real systems: the paper, the design doc, the exact source-code paths, the configuration that changes behaviour. Formal precision where it matters: invariants, proofs sketched, complexity, pseudo-code, or a formal spec for protocols.
6. **Build, break, measure.** A lab with failure injection and measurement, as close to realistic scale as the medium allows. In the browser where possible (SQL via DuckDB-WASM or PGlite, Python via Pyodide, interactive simulations); otherwise a reproducible local setup with scripts and expected results.
7. **In production.** How it fails in the real world: incidents and post-mortems, the misconceptions experienced engineers still hold, and how to diagnose them.
8. **The frontier.** What is still unsolved or actively changing, and where the field is heading.
9. **Prove it.** Expert-level self-assessment, not trivia: predict-the-outcome, debug-this, estimate-the-cost and defend-a-design questions, each with a worked answer. Facts worth keeping (numbers, invariants, failure signatures) go into an optional spaced-repetition review queue (e.g. the FSRS algorithm).
10. **Sources.** Every claim traceable: official docs, papers, books and code, with a "last verified" date.

**Depth on demand.** Layers 1–4 are the core path. Layers 5–8 open for readers who want to go all the way down, so one page serves both "I need the model" and "I need the internals".

## Experience features

- **Skip what you know.** Each layer can start with a short diagnostic; readers who pass it jump straight past that layer.
- **Progress without accounts.** Completed topics, quiz results and the review queue are saved in the browser, with export/import so a learner can move devices. A learner always sees where they are and can resume where they stopped.
- **Find anything.** Full-text search across topics, a glossary of terms linked from wherever they appear, and a prerequisite map showing what each topic builds on.
- **Built for deep work.** Reading-time estimates per layer, keyboard-first navigation, typeset maths and code, citations that open in place, and a print/PDF view of any topic.
- **The feed, with an exit.** Scrolling advances to the next topic, but every topic also has its own address, a table of contents and bookmarks, so studying and revisiting are as easy as browsing.
- **Accessible to everyone (WCAG 2.2 AA).** Every animation has a text equivalent that carries the same information; full keyboard use; visible focus; colour contrast checked against the theme; captions for any narration; no sound until the learner turns it on; still frames when reduced motion is on.
- **Fast and findable.** Every page is pre-rendered to static HTML, so it loads quickly, works with JavaScript slow or off, and is indexed by search engines. Each topic has a share image and appears in a sitemap. Targets: Largest Contentful Paint under 2.5 s, Interaction to Next Paint under 200 ms, Cumulative Layout Shift under 0.1, on a mid-range phone.
- **Works offline.** Topics a learner has opened stay available offline (installable as a web app).
- **Feedback loop.** The "report an error or unclear part" link on every topic (see [Correctness and currency](#correctness-and-currency--how-we-make-sure)), and privacy-friendly, cookie-free analytics on where learners drop off or miss questions, used to improve topics.

## Per-Topic Definition of Done (how the rules apply)

A topic page is complete only when:

1. Anything explainable by animation **is** animated. _(Rule #1)_
2. The content is verified current and correct and complete against official **and** multiple external sources. _(Rule #3)_
3. The page looks excellent and is structured for memorability — the hard made easy. _(Rule #4)_
4. It was produced as one focused, single-topic unit. _(Rule #2)_
5. It meets the [performance rules](#performance-rules) and passes the [visual checks](#verification) on desktop and phone, with a still poster for reduced motion.
6. It has every layer listed in [Learning design](#learning-design--what-every-topic-contains), at expert depth: the problem, prediction prompts, the mechanism, trade-offs and numbers, internals, a build-break-measure lab, production failures, the frontier, expert self-assessment and sources.
7. It meets the accessibility bar in [Experience features](#experience-features): a text equivalent for every animation, keyboard use and checked contrast.
8. It passes every layer of [Correctness and currency](#correctness-and-currency--how-we-make-sure): every claim sourced, every example executed in CI, adversarial review resolved, the state-of-the-art scan recorded, and (at milestone level) a human expert sign-off. _(Rule #3)_

## How to Create a Topic — the workflow

One topic at a time is produced start to finish as a single scrollable reel, following these steps:

1. **Pick the next topic.** Take the next topic in curriculum order (Domain → Milestone → Chapter → Topic) from the master map.
2. **Research & verify.** Run the state-of-the-art scan, then gather from primary sources first (official docs, specs, source code, papers), using books and talks for framing; record every claim with its source and version; cross-check for correctness and currency and regressively re-verify. Nothing incorrect, outdated, or missing passes. _(Rule #3)_
3. **Distill the explanation.** Start from the hard problem and what the reader will be able to do afterwards, then find the clearest framing that stays fully precise. Draft every layer of the [learning design](#learning-design--what-every-topic-contains) alongside: predictions, trade-offs and numbers, internals, the lab, production failures, the frontier and the self-assessment. _(Rule #4)_
4. **Decide what to animate.** For every concept ask "can this be shown with a pretty animation?" — if yes, it becomes an animation; and "can the reader learn more by driving it?" — if yes, it becomes interactive. Storyboard the motion. _(Rule #1)_
5. **Build the reel.** Assemble the animations + content into one self-contained, scrollable reel following the [animation principles](#animation-principles) and the [coffee theme](#theme--coffee): topic visuals designed for this concept, built on the [shared components](#shared-components); add the looping motion-graphics; scrolling advances to the next topic. _(Rule #1, Rule #2)_
6. **Polish for beauty & memorability.** Refine visuals, layout, and pacing until it looks exceptional and sticks in memory. _(Rule #4)_
7. **Review.** Launch the brutal, hardcore critic review agents described in [Correctness and currency](#correctness-and-currency--how-we-make-sure) (fact-checker, red team, currency checker, expert reader), plus reviewers for learning design, accessibility and looks. CI must be green (every example runs, every claim is sourced, every link resolves). Each finished milestone also gets a human practitioner's sign-off. If it's not up to the mark, go back to step 2.
8. **Check against the Definition of Done.** Confirm every criterion above is met before shipping.
9. **Wire it into the experience.** Link the finished topic into the master page and the vertical feed so it is reachable in the hierarchy.
10. **Ship the topic.** One topic at a time — finish and ship it before starting the next. _(Rule #2)_

## Technology, animation and theme

Two kinds of components, with opposite rules:

- **Shared components** are built once, used everywhere, and are what make every page, chapter, milestone and domain feel like one product. A fix or improvement lands everywhere at once. See [Shared components](#shared-components).
- **Topic visuals** are designed fresh for each topic: the animations and interactive models that explain _this_ concept. They're built from the shared building blocks and the theme, but the idea itself is new every time, so each page teaches in its own way.

### Shared components

Grown as topics need them, documented in one place, and themed only through the colour tokens:

- **Page structure:** the hub, domain, milestone and chapter pages; the topic layout with its layers, table of contents, breadcrumbs, depth-on-demand sections and prev/next.
- **Reading:** headings and type scale, callouts (key idea, warning, production note, frontier), definitions and glossary terms, figures with captions, tables, footnotes and citations, typeset maths, code blocks with copy and run.
- **Learning machinery:** the reel player and its controls, prediction prompts, the self-assessment questions with worked answers, the skip-what-you-know diagnostic, the review queue, progress, bookmarks and the "last verified" box.
- **Labs:** the in-browser runner (SQL and Python), result tables and charts, and the "run this locally" panel.
- **Diagram and animation building blocks:** the time and easing utilities, the responsive canvas, and primitives such as nodes, edges, arrows, labels, value readouts, sliders and toggles for interactive models. Topic visuals are composed from these, so they share a visual grammar while the explanation stays original.
- **Site-wide:** navigation, search, the feedback link, share images, and the offline and print views.

A new shared component is added when a second topic would need the same thing; until then it lives with its topic.

### Stack

| Layer | Choice | Notes |
|---|---|---|
| Site | **Astro** (static output) + **TypeScript** (strict) | Every page pre-rendered to HTML; JavaScript loads only where a page needs it. Built on Vite |
| Content | **MDX**, one file per topic | Prose in Markdown with the topic's animations embedded; front matter holds objectives, prerequisites, sources and last-verified date |
| Interactive parts | **React 19** islands | Animations, simulations and the shared learning machinery, hydrated only where they appear |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | Theme colours as CSS variables (see [Theme](#theme--coffee)) |
| UI motion | **motion** (`motion/react`) 12 | Springs, page transitions, in-view reveals |
| Teaching animations | **Hand-built per topic** | Driven by time, see [Animation principles](#animation-principles) |
| 3D | **three.js** 0.170 | Only where a topic genuinely needs depth |
| Icons | **lucide-react**, Simple Icons | Brand marks for tools (Kafka, Spark, Flink, dbt…) |
| Maths and code | **KaTeX**, **Shiki** | Typeset formulas; highlighted code at build time |
| In-browser labs | **DuckDB-WASM**, **PGlite**, **Pyodide** | SQL and Python in the page, no install |
| Search | **Pagefind** | Full-text search over the static site, no server |
| Sound (optional) | **WebAudio**, synthesised live | Original score only; no licensed or copyrighted music |
| Hosting | **GitHub Pages** via GitHub Actions on push to `main` | Exact version pins, so builds are reproducible |
| Verification | **Playwright** + Chromium, CI | Screenshots, overflow scans, frame-time runs and executable snippets, see [Verification](#verification) |

### How the site maps to the curriculum

- **Master page (hub):** the domains, and inside each the curriculum map (Milestones → Chapters → Topics), generated from each domain's curriculum file (`DATA_ENGINEERING_CURRICULUM.md` for Data Engineering) and the topics' front matter, so the hub always matches the syllabus and shows what's published.
- **Domain pages:** one landing page per domain (e.g. `/data-engineering/`) showing its milestones, its progress and its own looping motion-graphics.
- **Topic folders:** one folder per topic, `topics/<domain>/<milestone>/<chapter>/<topic>/` (e.g. `topics/data-engineering/m1-foundations/ch02-advanced-sql/window-functions/`), holding its `index.mdx` (prose, questions and sources) and the animation and lab files it embeds. Search, the glossary, the prerequisite map and the review queue are generated from these files.
- **URLs** follow the same path: `/<domain>/<milestone>/<chapter>/<topic>`.
- **Stable identity.** The curriculum will keep being polished, so every topic gets a permanent ID in its front matter. Progress, the review queue, bookmarks and cross-links key on that ID, and when a topic is renamed or moved its old URL redirects to the new one, so nothing a learner saved ever breaks.
- **The vertical feed:** topics follow one another in a vertical feed. Snapping is gentle and only at topic boundaries, never inside a long topic, so reading is never fought. An `IntersectionObserver` plays the reel in view and pauses the rest; scrolling past the end of a topic brings up the next one.
- **Deep links:** every topic has its own URL, and `?t=12.5` opens a reel paused on an exact moment (useful for sharing and reviewing).

### Animation principles

These are rules for how animations behave. The building blocks are shared; the visual idea is invented per topic.

- **Designed for the concept.** Each topic gets its own visual idea and motion, built from the shared building blocks and chosen for what makes that idea click. If two topics explain things the same way, one of them hasn't found its own idea yet.
- **Driven by time.** Every animation is a function of the reel's clock, with no hidden state, so a reel can pause, scrub, loop and open at an exact moment (`?t=12.5`) at any frame rate.
- **Fits every screen.** Each reel lays out on a fixed virtual canvas scaled to the screen, with its own portrait layout rather than a squeezed landscape one.
- **The learner is in control.** Every reel can be paused, scrubbed (with markers for its sections), sped up or slowed down, replayed and muted, from the mouse, touch or keyboard.
- **Steady rhythm.** Steps land on a regular beat, roughly one new idea every two beats, so the pacing is predictable and easy to remember.
- **Repeatable.** Any randomness is seeded, so a reel plays identically every time.
- **Calm when asked.** With reduced motion turned on, each reel shows a chosen still frame instead of playing.

### Theme — coffee

The one thing every page shares. The hub, every domain, milestone, chapter and topic use exactly this theme, so the product reads as one whole while each topic's visuals are new. It runs from roasted dark to steamed light.

| Token | Hex | Use |
|---|---|---|
| `espresso` | `#17100c` | Reel background, primary text on light pages |
| `roast` | `#2a1d16` | Dark-roast panels |
| `cocoa` | `#3b2a21` | Deep surfaces |
| `mocha` | `#5a4032` | Secondary text on light pages |
| `taupe` | `#8b7766` | Dividers; large text only |
| `taupe-ink` | `#766556` | Subtle small text on light pages (AA) |
| `latte` | `#c8ac8c` | Secondary text on dark |
| `crema` | `#e9d9bf` | Primary text on dark |
| `oat` | `#f3eadb` | Reading-page background |
| `foam` | `#fbf7ef` | Raised surfaces on light pages |
| `caramel` | `#d49a57` | Accent, highlights, progress |
| `cinnamon` | `#b8612f` | Primary accent; text only on dark, or large text on light |
| `cinnamon-ink` | `#9c5227` | Cinnamon for small text, links and button fills on light pages (AA) |
| `cherry` | `#8e2f2a` | End of the signature gradient |
| `void` | `#0d0806` | Deepest shadow |

- **Contrast (WCAG AA).** Normal text needs 4.5:1, large text 3:1. On light pages, small text uses `espresso`, `mocha`, `taupe-ink` or `cinnamon-ink`; `caramel` is never used for text on light backgrounds (2.1:1); buttons on light pages use `cinnamon-ink` with `foam` text (5.4:1). On dark reels, `crema`, `latte` and `caramel` all pass; `cinnamon` is for large text only (4.3:1).
- **Signature gradient** for hero words: crema → caramel (40%) → cinnamon (75%) → cherry, at 100°.
- **Type:**
  - **Fraunces**, italic 800, for kinetic headlines;
  - **Inter** for body;
  - **JetBrains Mono**, uppercase, tracked 0.2–0.35 em, for labels and eyebrows.
- **Surfaces:**
  - **Reels:** dark roast.
  - **Reading:** oat and foam pages.
  - **Inverted sections:** dark-roast panels flip the same colours.
- **Texture:**
  - a faint film grain (≈8% opacity) over reels;
  - generous rounded corners (18–26 px).
- **Voice:** short, confident lines; numbers over adjectives.

### Performance rules

Learned on real phones in earlier animation work:

- Animate only `transform` and `opacity`; use `translate3d` and `will-change` on layers that move.
- No SVG or CSS filters on large moving layers on phones. A blur on a wide sliding layer once made an animation stutter.
- Keep moving layers small: render only what's near the camera.
- On touch devices, cap WebGL at 1.25× device pixels with no MSAA. If frames run slower than ~22 ms, step the resolution down automatically.
- Start a reel only once fonts have loaded and a run of frames is smooth (a "settle gate", capped at 5 s), so the loading time comes first and the reel itself never stutters.
- Never let content widen the page: `overflow-x: clip` on `html` and `body`, and grid columns as `minmax(0, 1fr)`.

### Verification

Every topic is checked in a real browser before it ships:

- **Screenshot sheets** of every reel segment at three points in its timeline, at 1440 × 900, 1280 × 720 and 390 × 844, reviewed for clipping, overlap and empty frames.
- **Layout scan** that fails if anything makes the page wider than the screen.
- **Phone run:** an emulated iPhone with a 4× slower CPU, recording frame times through the reel.
- **Executable content:** every SQL, Python and lab snippet runs in CI against pinned tool versions and must produce its stated output, so a wrong example fails the build (see [Correctness and currency](#correctness-and-currency--how-we-make-sure)).
- **Claims check:** CI fails if a marked claim has no source or a cited link is dead.
- **Build gate:** the typecheck and static build must pass before every push.

### Sources and licensing

Books, papers and docs are sources to learn from and cite, not to copy: explanations, examples and figures are our own, written in our own words, with the source credited. Only original or properly licensed media. Reels carry no copyrighted music; any soundtrack is original, synthesised in the browser with WebAudio.

**Still to decide:** the licence the site itself is published under, for example MIT for the code and Creative Commons (CC BY-NC-SA 4.0 or similar) for the written content. It should be chosen before the first topic goes live, because it governs how others may reuse and share the material.
