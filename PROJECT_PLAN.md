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

- **One topic per day.** We do **not** generate the whole book at once. Each day we produce a single topic — fully researched, fully animated, fully polished — before moving on.
- **Incremental and compounding.** The experience grows topic by topic; per-topic quality is never traded away for speed of coverage.

## The Core Rules (non-negotiable)

### Rule #1 — Animate first

If a topic or concept **can** be explained with a pretty animation, we animate it. Animation is the default teaching medium, not an afterthought. Powerful, automated, looping motion-graphics sequences carry the explanation wherever possible.

### Rule #2 — One topic a day, delivered as a scrollable reel

Production is strictly incremental — a single topic produced daily, start to finish — rather than mass-generating everything. Each topic is like a **reel**: a self-contained unit of animations + content. Scrolling down ends the current topic and brings up the next one, in a continuous vertical feed.

### Rule #3 — State-of-the-art, verified content

Every topic must be current and correct. Content is **regressively re-checked** against official sources, multiple internet sources, and books. No incorrect, outdated, missing, or weak content is accepted — only state-of-the-art learning.

### Rule #4 — Beautiful and effortless to memorize

Every page must look very good and be easy to remember. Even the hardest content must be made to feel easy and to stick — difficult made simple, simple made memorable.

## Per-Topic Definition of Done (how the rules apply)

A topic page is complete only when:

1. Anything explainable by animation **is** animated. _(Rule #1)_
2. The content is verified current and correct and complete against official **and** multiple external sources. _(Rule #3)_
3. The page looks excellent and is structured for memorability — the hard made easy. _(Rule #4)_
4. It was produced as one focused, single-topic unit. _(Rule #2)_
5. It meets the [performance rules](#performance-rules) and passes the [visual checks](#verification) on desktop and phone, with a still poster for reduced motion.

## How to Create a Topic — the daily workflow

Each day, one topic is produced start to finish as a single scrollable reel, following these steps:

1. **Pick the next topic.** Take the next topic in curriculum order (Domain → Milestone → Chapter → Topic) from the master map.
2. **Research & verify.** Gather from official sources, multiple reputable internet sources, and books; cross-check for correctness and currency and regressively re-verify. Nothing incorrect, outdated, or missing passes. _(Rule #3)_
3. **Distill the explanation.** Reduce to the clearest, most memorable framing; find the hard parts and make them feel easy. _(Rule #4)_
4. **Decide what to animate.** For every concept ask "can this be shown with a pretty animation?" — if yes, it becomes an animation. Storyboard the motion. _(Rule #1)_
5. **Build the reel.** Assemble the animations + content into one self-contained, scrollable reel following the [animation principles](#animation-principles) and the [coffee theme](#theme--coffee), with components designed for this topic; add the looping motion-graphics; scrolling advances to the next topic. _(Rule #1, Rule #2)_
6. **Polish for beauty & memorability.** Refine visuals, layout, and pacing until it looks exceptional and sticks in memory. _(Rule #4)_
7. **Check against the Definition of Done.** Confirm all four criteria above are met before shipping.
8. **Review** Launch brutal hardcore critic review agents to re-check the work done on the topic. If its not upto the mark, go to step 2 again.
9. **Wire it into the experience.** Link the finished topic into the master page and the vertical feed so it is reachable in the hierarchy.
10. **Ship the day's topic.** One topic per day — then stop. _(Rule #2)_

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
| `taupe` | `#8b7766` | Subtle text, dividers |
| `latte` | `#c8ac8c` | Secondary text on dark |
| `crema` | `#e9d9bf` | Primary text on dark |
| `oat` | `#f3eadb` | Reading-page background |
| `foam` | `#fbf7ef` | Raised surfaces on light pages |
| `caramel` | `#d49a57` | Accent, highlights, progress |
| `cinnamon` | `#b8612f` | Primary accent, buttons, labels |
| `cherry` | `#8e2f2a` | End of the signature gradient |
| `void` | `#0d0806` | Deepest shadow |

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

### Media and licensing

Only original or properly licensed media. Reels carry no copyrighted music: YouTube embeds bring ads and a mandatory visible 200 × 200 player, and self-hosting a commercial track isn't allowed. Any soundtrack is synthesised in the browser with WebAudio.
