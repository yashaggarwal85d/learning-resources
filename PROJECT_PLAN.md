# Project Plan — The Learning Experience

> A draft. Both this plan and the curriculum ([DATA_ENGINEERING_CURRICULUM.md](DATA_ENGINEERING_CURRICULUM.md)) will be polished further.

## Vision

Turn our curricula into a living, animated web experience. A single, beautiful **master page** is the gateway; from there a learner moves through the full hierarchy — **Domains → Milestones → Chapters → Topics** — and every topic is its own polished page built to _teach_, not just tell. The first domain is **Data Engineering**; more domains can be added later, each with its own curriculum.

## The Product

- **Master page (the hub).** One very polished landing page that links to everything and presents every domain and its curriculum map. From it, a learner can pick a domain, then drill from any milestone, into its chapters, down to any individual topic.
- **Navigable hierarchy.** The structure mirrors the curricula exactly — Domains → Milestones → Chapters → Topics — and every level is linked and reachable from the master page.
- **Domains.** A domain is a whole field of study with its own curriculum file and its own milestones. Data Engineering ([DATA_ENGINEERING_CURRICULUM.md](DATA_ENGINEERING_CURRICULUM.md)) is the first.
- **Everything is a webpage.** The master page and every single topic is delivered as a web page.
- **A continuous, automated motion-graphics sequence loops** as part of the experience — part of the visual identity, always alive.
- **Beauty is a requirement, not a nice-to-have.** The master page and every topic page must look exceptional.

## The Production Model

- **One topic at a time.** We do **not** generate the whole book at once. We produce a single topic — fully researched, fully animated, fully polished — and only then move on to the next.
- **Incremental and compounding.** The experience grows topic by topic; per-topic quality is never traded away for speed of coverage.
- **Release as we go.** The Data Engineering curriculum has roughly 820 topics. Order follows the curriculum, and each finished topic goes live straight away, so learners get value long before the whole domain is done.

## The Core Rules (non-negotiable)

### Rule #1 — Animate first

If a topic or concept **can** be explained with a pretty animation, we animate it. Animation is the default teaching medium, not an afterthought. Powerful, automated, looping motion-graphics sequences carry the explanation wherever possible. Every animation must _explain_ something; motion that only decorates distracts from learning and is cut.

### Rule #2 — One topic at a time, delivered as a scrollable reel

Production is strictly incremental — a single topic produced start to finish before the next one begins — rather than mass-generating everything. Each topic is like a **reel**: a self-contained unit of animations + content. Scrolling down ends the current topic and brings up the next one, in a continuous vertical feed.

### Rule #3 — State-of-the-art, verified content

Every topic must be current and correct. Content is **regressively re-checked** against official sources, multiple internet sources, and books. No incorrect, outdated, missing, or weak content is accepted — only state-of-the-art learning. Each topic shows its sources and a "last verified" date, and published topics are re-verified on a schedule (for example quarterly, and whenever a major version of the tool they cover ships).

### Rule #4 — Beautiful and effortless to memorize

Every page must look very good and be easy to remember. Even the hardest content must be made to feel easy and to stick — difficult made simple, simple made memorable.

## Learning design — what every topic contains

Beauty and animation make a topic memorable; what makes it _learned_ is well-established learning science: retrieval practice, spaced repetition, worked examples, hands-on practice and immediate feedback. The curriculum asks for the same shape ("explanation → worked example → lab → failure analysis"). Every topic therefore has these parts:

1. **Hook and goal.** One question the topic answers and 2–4 concrete learning objectives ("after this you can…"), plus links to its prerequisites.
2. **Explanation.** The animated reel, in short segments the learner moves through at their own pace. Narration lives in on-screen text next to the motion, not in a separate wall of text (words and pictures together, only what's needed).
3. **Worked example.** One realistic problem solved step by step, with the reasoning shown.
4. **Hands-on lab.** Something to do in the browser, no install: run SQL in an in-browser database (e.g. DuckDB-WASM or PGlite), run Python (e.g. Pyodide), or manipulate an interactive model. Where the curriculum asks for a bigger lab, the page links a guided version to run locally.
5. **Failure analysis.** What breaks, why, and how it shows up in production: common mistakes and misconceptions, named explicitly.
6. **Check yourself.** 3–6 retrieval questions with immediate, explained feedback. Questions mix in earlier topics (interleaving), not just this one.
7. **Remember it.** A one-screen summary (the "cheat sheet") and its questions added to the learner's review queue, scheduled with spaced repetition (e.g. the FSRS algorithm) and surfaced on the hub as "due for review".
8. **Sources.** The official docs, papers and books the topic was verified against, with a "last verified" date.

## Experience features

- **Progress without accounts.** Completed topics, quiz results and the review queue are saved in the browser, with export/import so a learner can move devices. A learner always sees where they are and can resume where they stopped.
- **Find anything.** Full-text search across topics, a glossary of terms linked from wherever they appear, and a prerequisite map showing what each topic builds on.
- **The feed, with an exit.** Scrolling advances to the next topic, but every topic also has its own address, a table of contents and bookmarks, so studying and revisiting are as easy as browsing.
- **Accessible to everyone (WCAG 2.2 AA).** Every animation has a text equivalent that carries the same information; full keyboard use; visible focus; colour contrast checked against the theme; captions for any narration; no sound until the learner turns it on; still frames when reduced motion is on.
- **Fast and findable.** Every page is pre-rendered to static HTML, so it loads quickly, works with JavaScript slow or off, and is indexed by search engines. Each topic has a share image and appears in a sitemap. Targets: Largest Contentful Paint under 2.5 s, Interaction to Next Paint under 200 ms, Cumulative Layout Shift under 0.1, on a mid-range phone.
- **Works offline.** Topics a learner has opened stay available offline (installable as a web app).
- **Feedback loop.** A "something's wrong or unclear" link on every topic, and privacy-friendly, cookie-free analytics on where learners drop off or miss questions, used to improve topics.

## Per-Topic Definition of Done (how the rules apply)

A topic page is complete only when:

1. Anything explainable by animation **is** animated. _(Rule #1)_
2. The content is verified current and correct and complete against official **and** multiple external sources. _(Rule #3)_
3. The page looks excellent and is structured for memorability — the hard made easy. _(Rule #4)_
4. It was produced as one focused, single-topic unit. _(Rule #2)_
5. It meets the [performance rules](#performance-rules) and passes the [visual checks](#verification) on desktop and phone, with a still poster for reduced motion.
6. It has every part listed in [Learning design](#learning-design--what-every-topic-contains): objectives, worked example, lab, failure analysis, retrieval questions, summary and sources.
7. It meets the accessibility bar in [Experience features](#experience-features): a text equivalent for every animation, keyboard use and checked contrast.

## How to Create a Topic — the workflow

One topic at a time is produced start to finish as a single scrollable reel, following these steps:

1. **Pick the next topic.** Take the next topic in curriculum order (Domain → Milestone → Chapter → Topic) from the master map.
2. **Research & verify.** Gather from official sources, multiple reputable internet sources, and books; cross-check for correctness and currency and regressively re-verify. Nothing incorrect, outdated, or missing passes. _(Rule #3)_
3. **Distill the explanation.** Write the learning objectives first, then reduce to the clearest, most memorable framing; find the hard parts and make them feel easy. Draft the worked example, the lab, the failure analysis and the retrieval questions alongside. _(Rule #4)_
4. **Decide what to animate.** For every concept ask "can this be shown with a pretty animation?" — if yes, it becomes an animation. Storyboard the motion. _(Rule #1)_
5. **Build the reel.** Assemble the animations + content into one self-contained, scrollable reel following the [animation principles](#animation-principles) and the [coffee theme](#theme--coffee), with components designed for this topic; add the looping motion-graphics; scrolling advances to the next topic. _(Rule #1, Rule #2)_
6. **Polish for beauty & memorability.** Refine visuals, layout, and pacing until it looks exceptional and sticks in memory. _(Rule #4)_
7. **Check against the Definition of Done.** Confirm every criterion above is met before shipping.
8. **Review.** Launch brutal, hardcore critic review agents to re-check the work done on the topic: correctness, clarity, learning design, accessibility and looks. If it's not up to the mark, go back to step 2.
9. **Wire it into the experience.** Link the finished topic into the master page and the vertical feed so it is reachable in the hierarchy.
10. **Ship the topic.** One topic at a time — finish and ship it before starting the next. _(Rule #2)_

## Technology, animation and theme

What is fixed across the whole experience: the stack, the colour theme, and the rules below. What is **not** fixed: components. There is no shared library of visuals. Every topic designs its own components and animations from scratch, shaped by what that concept needs, so each page feels new while every page, chapter, milestone and domain still looks like part of one product.

### Stack

| Layer | Choice | Notes |
|---|---|---|
| Build | **Vite 6** + **TypeScript 5.8** (strict) | `tsc -b && vite build`, target ES2022, relative `base: './'` so it runs under any Pages path |
| UI | **React 19** | Function components; each topic is a lazily loaded module so the hub stays light |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) | Theme colours as CSS variables (see [Theme](#theme--coffee)) |
| UI motion | **motion** (`motion/react`) 12 | Springs, page transitions, in-view reveals |
| Teaching animations | **Hand-built per topic** | Driven by time, see [Animation principles](#animation-principles) |
| 3D | **three.js** 0.170 | Only where a topic genuinely needs depth |
| Icons | **lucide-react**, Simple Icons | Brand marks for tools (Kafka, Spark, Flink, dbt…) |
| Sound (optional) | **WebAudio**, synthesised live | Original score only; no licensed or copyrighted music |
| Hosting | **GitHub Pages** via GitHub Actions on push to `main` | Exact version pins (a floating Rollup once broke the build) |
| Verification | **Playwright** + Chromium | Screenshots, overflow scans and frame-time runs, see [Verification](#verification) |

### How the site maps to the curriculum

- **Master page (hub):** the domains, and inside each the curriculum map (Milestones → Chapters → Topics), rendered from a registry generated from each domain's curriculum file (`DATA_ENGINEERING_CURRICULUM.md` for Data Engineering), so the hub always matches the syllabus.
- **Domain pages:** one landing page per domain (e.g. `/data-engineering/`) showing its milestones, its progress and its own looping motion-graphics.
- **Topic modules:** one folder per topic, `topics/<domain>/<milestone>/<chapter>/<topic>/` (e.g. `topics/data-engineering/m1-foundations/ch02-advanced-sql/window-functions/`), exporting its metadata, its scenes and its written content. Topics are loaded with dynamic `import()` only when reached.
- **URLs** follow the same path: `/<domain>/<milestone>/<chapter>/<topic>`.
- **The vertical feed:** full-height sections with CSS scroll-snap. An `IntersectionObserver` plays the reel in view and pauses the rest; scrolling past the end of a topic brings up the next one.
- **Deep links:** every topic has its own URL, and `?t=12.5` opens a reel paused on an exact moment (useful for sharing and reviewing).

### Animation principles

These are rules for how animations behave, not things to reuse. The visuals themselves are invented per topic.

- **Designed for the concept.** Each topic gets its own components and motion, chosen for what makes that idea click. Nothing is copied from another topic; if two topics look alike, one of them hasn't found its own idea yet.
- **Driven by time.** Every animation is a function of the reel's clock, with no hidden state, so a reel can pause, scrub, loop and open at an exact moment (`?t=12.5`) at any frame rate.
- **Fits every screen.** Each reel lays out on a fixed virtual canvas scaled to the screen, with its own portrait layout rather than a squeezed landscape one.
- **The learner is in control.** Every reel can be paused, scrubbed (with markers for its sections), replayed and muted, from the mouse, touch or keyboard.
- **Steady rhythm.** Steps land on a regular beat, roughly one new idea every two beats, so the pacing is predictable and easy to remember.
- **Repeatable.** Any randomness is seeded, so a reel plays identically every time.
- **Calm when asked.** With reduced motion turned on, each reel shows a chosen still frame instead of playing.

### Theme — coffee

The one thing every page shares. The hub, every domain, milestone, chapter and topic use exactly this theme, so the product reads as one whole while the components inside each page are new. It runs from roasted dark to steamed light.

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

Learned on real phones while building the intro:

- Animate only `transform` and `opacity`; use `translate3d` and `will-change` on layers that move.
- No SVG or CSS filters on large moving layers on phones. A blur on a wide sliding layer made one scene stutter.
- Keep moving layers small: render only what's near the camera.
- On touch devices, cap WebGL at 1.25× device pixels with no MSAA. If frames run slower than ~22 ms, step the resolution down automatically.
- Start a reel only once fonts have loaded and a run of frames is smooth (a "settle gate", capped at 5 s), so the loading time comes first and the reel itself never stutters.
- Never let content widen the page: `overflow-x: clip` on `html` and `body`, and grid columns as `minmax(0, 1fr)`.

### Verification

Every topic is checked in a real browser before it ships:

- **Screenshot sheets** of every scene at three points in its timeline, at 1440 × 900, 1280 × 720 and 390 × 844, reviewed for clipping, overlap and empty frames.
- **Layout scan** that fails if anything makes the page wider than the screen.
- **Phone run:** an emulated iPhone with a 4× slower CPU, recording frame times through the reel.
- **Build gate:** `tsc -b && vite build` must pass before every push.

### Sources and licensing

Books, papers and docs are sources to learn from and cite, not to copy: explanations, examples and figures are our own, written in our own words, with the source credited. Only original or properly licensed media. Reels carry no copyrighted music: YouTube embeds bring ads and a mandatory visible 200 × 200 player, and self-hosting a commercial track isn't allowed. Any soundtrack is synthesised in the browser with WebAudio.
