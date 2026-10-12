# Audit — the daily check of what shipped

Once a day an automated session audits every topic that was shipped or changed on `main` since the last audit, and every run recorded in [LEDGER.md](LEDGER.md) in that time. It is the pipeline's screener: it checks the reels again with fresh eyes, fixes anything wrong, and writes down which part of the pipeline let each problem through. If the pipeline in [ROUTINE.md](ROUTINE.md) is working, it finds nothing. Its findings are the data for improving the pipeline, so they are recorded precisely, never smoothed over.

## 0. Ground rules

- Everything in [ROUTINE.md](ROUTINE.md) section 0 applies (except models: the audit runs on Sonnet only, every agent included, never Opus, Fable or Haiku; fresh agents for every check; agents in the foreground; never end the turn while anything runs; sources read raw with `scripts/sources.mjs`; privacy; no vendors for the voice; no pull requests; never leave `main` red; don't guess).
- **Scope is fixed by the script, not by judgment:** `node scripts/audit-scope.mjs` lists the topics and ledger runs since the last audit. Audit exactly those; nothing older. If the list is empty, record that (section 5) and stop.
- **Don't collide with routine runs.** Before changing a topic, run `node scripts/claim.mjs status`; if a run holds a claim on that topic (a release, say), don't touch it: record the finding for that run's topic instead and leave the fix to it.
- **Fix the reels, record the pipeline.** Fix every problem found in a topic in this run. Don't change the pipeline itself (ROUTINE.md, AUDIT.md, DESIGN.md, the scripts, the checks): name the gap and the guard that would close it in the ledger, so a person can change the pipeline with a few days of evidence. A new kind of problem also gets a QUALITY.md row, with "guard: proposed" until someone adds it.

## 1. Scope

`node scripts/audit-scope.mjs` prints the window (`since`, `until`), the topics in it (id, slug, status) and the ledger entries of runs in it. Read the ledger entries: a run that stopped, failed or was blocked is a finding about the pipeline even if no reel shows it.

## 2. Mechanical checks

```sh
node scripts/check-all.mjs --topic <slug-part>,<slug-part>,...    # every check, for exactly these topics (held ones included)
```

Every failure is a finding: the pipeline should never have shipped it.

## 3. Fresh-eyes reviews (fresh Sonnet agents, effort high)

For each topic, launch independent agents (in one message, in parallel) that have not seen its `REVIEW.md` until they have written their own findings.:

- **Facts:** pick at least five claims from the reel and Deep dive (the numbers, the definitions, anything that sounds surprising) and re-derive each from its primary source, fetched raw. Any error, outdated statement or unsupported claim is a finding.
- **Looks and learning:** every step's screenshots at desktop and phone (`site/test-results/`), by the checklist in DESIGN.md → "The looks review checks".
- **Flow:** the seam with the topic before and after it (bridge, handoff, concept ledger, Prerequisites).

Then compare with the topic's `REVIEW.md` and `FACT-CHECK.md`: for every finding, say whether the pipeline's own reviews saw it (and why it wasn't fixed) or missed it.

## 4. Fix

Live reels are locked (ROUTINE.md section 0): don't change a live topic or the shared reel code. For a finding in one, write the exact fix you propose in the ledger and in the report under "needs the owner", and leave the reel as it is; the owner unlocks it if they want the change. Held topics are fixed as below.

On a branch `audit/<date>` from a fresh `origin/main`: fix every finding (a fresh Sonnet fix agent per topic; another fresh Sonnet agent re-checks a fix that changes what is taught). A fix that changes a topic's concept ledger or handoff must keep the next topic consistent (its bridge and `uses`); check both. Run `node scripts/check-all.mjs --changed`, then merge into `main` the way ROUTINE.md section 8 does (merge `origin/main` first, full checks green, confirm CI and Deploy). Narration lines that change get new audio (`narration/narrate.sh`).

## 5. Ledger

For each topic audited, append one entry (two lines) with `node scripts/ledger.mjs add "<line 1>" "<line 2>"`:

```
- **<YYYY-MM-DD HH:MM> UTC · AUDIT · <domain> · `<topic-id>`** · checks: <passed / what failed> · issues: <n> (<each: what, fixed or not>)
  pipeline: <for each issue: the step that should have caught it, why it didn't, the guard that would>  (or: pipeline: clean)
```

Then one closing entry, which also marks the start of the next audit's window:

```
- **<YYYY-MM-DD HH:MM> UTC · AUDIT DONE** · window <since> to <until> · <topics> topics, <issues> issues, <fixed> fixed · <runs> runs in the ledger, <stopped/failed> stopped or failed
  top pipeline gaps: <the one or two that matter most, with how often they occurred>
```

The `UTC` time on the AUDIT DONE line is the window's `until` from section 1, so nothing shipped during the audit is skipped.

## 6. Report

A short report for the owner: the window, what was audited, every issue and its fix, the pipeline gaps in order of how much they matter, and anything that needs a human.
