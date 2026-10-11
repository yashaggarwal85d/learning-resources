# Ledger

Every routine run and every audit finding, newest at the bottom: two lines each, written by `scripts/run-metrics.mjs finish` and `scripts/ledger.mjs`. Tokens are per model (input, cache and output together; output in brackets), from the session transcripts; hours are wall-clock. The daily audit (AUDIT.md) adds what it found in the reels shipped that day and which part of the pipeline let it through. Read it to see what the pipeline costs and where it fails.

- **2026-10-11 03:03 UTC · DSA · `dsa.asymptotic-notation` · stalled** · 2.6 h · Sonnet 5.5 9.1M (89k out) · Haiku 5.5 364k (11k out) · 3 agents (recorded by hand from the session; it ran before the ledger)
  checks: build, examples, links passed; reels failed (layout: overlapping and clipped labels; narration never committed) · issues: ended its turn to wait for narration, the idle session was shut down and the audio lost (QUALITY.md #40, #41)
- **2026-10-11 06:50 UTC · Rust · first topic · failed at start** · 0.0 h · Sonnet 5.5 242k (1k out) · 0 agents (by hand)
  checks: none · issues: routine had no repo attached; cloning it by hand made the claim script "code from outside" and it was refused (fixed: repo attached to every routine)
- **2026-10-11 07:05 UTC · DSA · `dsa.asymptotic-notation` · failed at start** · 0.0 h · Sonnet 5.5 (by hand)
  checks: none · issues: routine had no repo attached; push refused with 403 (fixed: repo attached)
- **2026-10-11 07:12 UTC · German · `ger.sound-system` · stopped after research** · 0.1 h · Haiku 5.5 4.5M (169k out) · Sonnet 5.5 1.4M (8k out) · Opus 5.5 70k (10k out) · 4 agents (by hand)
  checks: none yet · issues: WebFetch gave summaries, so no quote was verbatim (fixed: scripts/sources.mjs); branched from a stale local main; stopped because ROUTINE.md changed mid-run (fixed: one procedure per run); used Haiku (fixed: Sonnet minimum)
- **2026-10-11 09:59 UTC · Data Engineering · `chapter-01` · planned** · 0.4 h · Sonnet 5.5 966k (6k out) · Opus 5.5 5.8M (60k out) · 2 agents, 68 calls
  checks: check-docs passed (plan reviewer); no other checks apply to a plan · issues: fire_trigger tool unavailable, so topic runs were not started; hourly schedule will start them
- **2026-10-11 10:19 UTC · Rust Systems Engineering · `chapter-01` · planned** · 0.5 h · Sonnet 5.5 1.1M (5k out) · Opus 5.5 10.3M (117k out) · 2 agents, 105 calls
  checks: check-docs passed (planner); plan review by fresh Opus agent, 20 fixes applied; no build run (plan only) · issues: fire_trigger tool unavailable, so topic runs not fired; hourly schedule will start them. Claim status showed topic 1 already claimed as make before plan was on main.
