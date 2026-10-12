# REVIEW — Software delivery workflow (refresher)

## Content review (2026-10-12)

What I read, in order: the previous topic `de.linux-shell-process-toolkit` on its branch (reel step titles, registry entry, Deep-dive headings, `REVIEW.md`). Then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, its entry in `site/src/topics/registry.ts`, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md` and `OUTLINE.md`. Then `../CHAPTER.md` entry 4 and the syllabus line of the next topic (Asymptotic notation and logarithms, `syllabus/data-engineering.md:57`). I judged against QUALITY.md, DESIGN.md and PROJECT_PLAN.md "Learning design". To check claims I also read the fetched Fowler text (`sources/martinfowler_com_articles_continuousIntegration_html.txt`), the pip docs in `sources/` and other lines of the syllabus (§4.2, §4.3, §11.4, §12.1).

Paths below are relative to this folder unless given in full. This review changed nothing outside this file.

**Totals: 22 findings, 3 major, 19 minor.** The majors are 9, 16 and 17.

Overall, the topic is carefully sourced and executed. The fact-check's corrections reached the build, with one exception in the narration (finding 3). The lab really links the Git and shell halves into one job. The step 5 trap carries the shell refresher's `pipefail` lesson onto a runner. The weak spots:

- **The parts a senior data engineer would push on are thin or one-sided.** What "breaking" means for a data library (9). The library upper-bound rule, taught as settled when it is contested (16). A "lock with pip alone" section that leaves out `pip lock`, the command pip ships for exactly this (17).
- **The reel's own framing is never explained.** The conveyor and mini-map gates, and the promise of "production" (2).
- **Some coverage pointers send material to sections whose syllabus lines don't contain it** (10, 11).

---

### Flow

**1. Step 4's narration calls a CI job "the shell's pipeline of processes, laid end to end". One step later, the reel teaches that a pipeline hides an early failure. (minor)**
- **Fixed:** narration step 4 now says "a script that stops on error: each step runs only if the one before it succeeded"; `OUTLINE.md` step 4 matches.
- *Where:* `narration.json` step 4, first line ("A C-I job is the shell's pipeline of processes, laid end to end."). The same wording is in `OUTLINE.md` step 4 "The idea".
- *What:* the shell refresher's step 4, "A pipeline exits with its last command", taught that in `a | b | c` all three run together and the status is `c`'s. A CI job behaves the opposite way. Its steps run one after another, and the first non-zero status stops the rest. That is `set -e` or `a && b && c`, not a pipe. This step tells the learner that a job *is* that pipeline. Step 5 then asks them to tell the two apart, and its answer depends on the difference: `-e` without `pipefail`. The metaphor gives the wrong model at exactly the point where the right one is being tested.
- *Evidence:* previous topic `reel.tsx` step 4 (title and explain: "A pipeline's status is its last command's"). This topic's `reel.tsx` lines 47–49 and 66–71.
- *Fix:* "A C-I job is a script with stop-on-error: each step runs only if the one before it succeeded." Change `OUTLINE.md` to match.

**2. The reel's one picture (the conveyor of gates) is never drawn or explained. Its "build" and "publish" gates name stages the reel never teaches, and the "production" in step 1 never arrives. (minor)**
- **Fixed:** took the second and third options together. The gates are renamed to what the reel teaches (`review · tests · CI · release`), step 3 gets the strip, and step 1's caption and narration say what the strip marks and that deploying comes later in the course (caption: "merged and released"). The animated four-arch conveyor was not drawn (it would add a scene); the strip is glossed in words instead.
- *Where:*
  - `scenes.tsx` `MiniMap` (lines 20–40), lit on steps 2 and 4–9.
  - Step 1 caption ("how a change reaches production").
  - The previous topic's registry `handoff` ("how a change gets from your branch to production safely").
- *What:*
  - The full conveyor never appears. `OUTLINE.md` describes it as a card riding a belt through four arches, each emitting an exit-status token. Step 1 is the shared `RefresherList`, and steps 2–9 show only the mini-map strip. So four pills, `review tests build publish`, sit at the top of eight steps, and nothing says what they are or that a change moves through them.
  - "build" is lit for `pip install` (steps 4, 8, 9), and no step builds anything.
  - "publish" is lit for the SemVer dial, and no step says what publishing is (tag, build a wheel, upload to an index) or who does it.
  - Step 3 has no mini-map at all (`UnitTest`, lines 109–146), although `OUTLINE.md` line 27 puts one on steps 2–9.
  - Step 1 and the shell refresher's handoff both promise "production". The reel ends at the merge button and a version number. Deploys are rightly deferred to §11.4, but no on-screen word says so; only the Deep dive's "What's changing" does.
- *Evidence:* `OUTLINE.md` line 27 (the conveyor as specified) against `scenes.tsx`. `reel.tsx` line 12. `../CHAPTER.md` entry 4, "Visual idea" ("A commit passes review → tests → build → publish, and each gate lights by its exit status").
- *Fix:* any one of these.
  - Draw the four-gate conveyor once, with a short belt animation under the step 1 list or as the opening frame of step 2, and give each gate a two-word gloss: "build: install the locked tools", "publish: release a version".
  - Rename the gates to what the reel actually teaches: `review · tests · CI · release`.
  - Add a `MiniMap lit={['tests']}` to step 3.
  - Change step 1 to "how a change gets merged and released (deploys are §11.4)".

**3. The narration still says `tmp_path` gives "a fresh temporary file". The fact-check corrected the caption to "directory" but not the narration. (minor)**
- **Fixed:** narration says "its own fresh temporary folder"; the `OUTLINE.md` lexicon note is corrected.
- *Where:* `narration.json` step 3, line 34 ("A fixture hands each test a fresh temporary file.").
- *What:* `tmp_path` is "a temporary directory unique to each test function". Fact-check correction J fixed the caption (`reel.tsx` line 36: "a fresh directory"). The narration came from `OUTLINE.md`'s narration notes ("tmp path → a fresh temporary file", line 193), which still carry the old wording. A listener now hears something different from what the caption says, and the spoken version is wrong.
- *Evidence:* `FACT-CHECK.md` row J. `reel.tsx` line 36. `OUTLINE.md` line 193.
- *Fix:* "A fixture hands each test its own fresh temporary folder." Correct the lexicon note in `OUTLINE.md` too.

**4. Step 3 shows six test rows, but the code panel and caption only explain four. "email (Git's oracle)" and "main() counts" appear without a word. (minor)**
- **Fixed:** caption says "Six tests run: these four cases, the Git refresher's email oracle and a `main()` test on a fixture file ... Only the padded inputs fail"; the two rows are labelled "padded email (Git's oracle)" and "main() on a padded file"; narration names all six and says the two that pass have no stray spaces.
- *Where:* `scenes.tsx` `TEST_ROWS` (line 107) and the `Code` panel (line 120). `reel.tsx` step 3 body. `narration.json` step 3 ("Only the padded spellings get caught").
- *What:* the code panel shows one parametrized test with four cases. The drawing has six rows, and two of the four failures are tests the learner never sees: the Git refresher's email oracle (whose input is padded) and a `main()` test that uses the `tmp_path` fixture. The caption counts "4 failed, 2 passed" over all six. A learner who counts the four cases in the code panel gets 2 failed, 2 passed. The narration's "only the padded spellings get caught" is true only if you know both hidden tests also use padded input.
- *Evidence:* `index.mdx` line 41, where the Deep dive explains the six tests. Nothing in the reel does.
- *Fix:* add the two rows' meaning to the caption or the drawing, e.g. under the rows: "+ the Git oracle and a `main()` test on a fixture file, both padded". Or change the narration to "Two still pass… the four with padded input fail."

**5. Several terms are used before anything defines them: "locked", `{0}`, `~=`, "public API" and the workflow vocabulary. The plan says YAML is "explained on the spot"; it isn't. (minor)**
- **Fixed:** step 4 caption "A workflow file lists jobs; a job lists steps" and the box "install tools"; step 5 "`{0}` is the step's script"; step 7 defines "public API" in the caption; step 8 glosses `~=` (compatible release: 1.4 or later, below 2). `prerequisites.mdx` gains a section "04 A GitHub Actions workflow" (YAML, `jobs`, `steps`, `uses`, `run`; the quickstart link moved there, quote added to `SOURCES.md`), and the registry declares `pip-install` and `github-actions-basics`.
- *Where:*
  - `scenes.tsx` `CiChain` step box "install (locked)" (line 154, step 4). Lock files arrive in step 9.
  - Step 5's explain, `bash -e {0}`: the `{0}` (the step's temporary script path) is never glossed, and neither is the Deep dive's "two Linux shells".
  - Step 8's explain, `~=1.4`: never glossed in the reel.
  - Step 7's explain, "public API": defined only in the Deep dive.
  - Step 4's caption, "workflow", "job", "step", `run:`, `needs`: no workflow file is shown before step 5's three lines. The picture has one job, so `needs` has nothing to point at.
- *What:* the registry declares nothing. `OUTLINE.md` line 286 says "Installing a package with pip and reading a YAML file are explained on the spot". pip is explained, but only in the Prerequisites panel; YAML and the Actions vocabulary are explained nowhere. These are small, but each one stops a learner who has never opened a workflow file.
- *Evidence:* `reel.tsx` lines 47–49, 68–70, 101, 121–123. `OUTLINE.md` line 286. `prerequisites.mdx` has no Actions section; its quickstart link is attached to "Exit status and pipelines".
- *Fix:*
  - Step 4: show the five-line skeleton of `gate.yml` (`jobs: gate: steps: - run:`) as a small code panel, or say "a workflow file lists jobs; each job lists steps".
  - Step 4's box: "install (pinned)", or leave the qualifier out until step 9.
  - Step 5: "`{0}` is the step's script".
  - Step 8: "`~=1.4`, compatible release: 1.4 or later, below 2".
  - Step 7: "public API: what callers are told they can rely on, here the output columns".
  - Either add a Prerequisites section "05 A GitHub Actions workflow", or declare `github-actions-basics`.

**6. Step 5 repeats the shell refresher's step 4 predict: the same command, the same four numbers, the same answer. The only new part is a GitHub default that can only be recalled, not worked out. (minor)**
- **Fixed:** the default (`bash -e {0}`) is in the question frame and the code panel, the question asks whether `-e` catches the failure, and the answer states the transferable rule (a pipeline's status is its last command's, in any `set -e` script). The command is unchanged because the executed values (0 and 2) are asserted.
- *Where:* `reel.tsx` step 5. The previous topic's `reel.tsx` step 4 ("A pipeline exits with its last command": `jq -r .status missing.jsonl | sort | uniq -c`, options 2 / 0 / 1 / 127, answer 0). `prerequisites.mdx` section 03 asks the same question a third time.
- *What:* Learning design layer 2 wants predictions that make the explanation stick. Here, a learner who remembers last reel's answer either says "0", correctly but for no new reason, or guesses that GitHub adds `pipefail`. Neither involves reasoning about `-e`. The transferable lesson is that `-e` does not see a failure inside a pipeline, and that lesson holds in every `set -e` script, not just on GitHub. The question as framed never asks for it.
- *Fix:* show the default in the question frame ("no `shell:` → GitHub runs `bash -e {0}`") and ask "does `-e` stop this step?". The answer stays "passes, 0", and the learner has to apply `-e` against `pipefail`. Or change the command so it doesn't repeat the previous reel's question word for word, e.g. put a failing `curl … | jq` in the step.

**7. "Hash" means two different things in consecutive steps. Step 6 also relies on set order following string hashes, which is hash-table internals that §1.3 teaches later. (minor)**
- **Fixed:** step 6 says a set's order isn't specified and for strings depends on `hash()`, seeded randomly per process; step 9 says "a SHA-256 checksum of the exact file, the same on every machine" (narration: "checksum").
- *Where:*
  - Step 6 caption and narration: "Python seeds string hashes randomly per process". Python's `hash()` and set iteration order.
  - Step 9: "a hash of the exact file", `--hash=sha256:`. A cryptographic digest.
- *What:* the reel never says that set iteration order is unspecified, or that for `str` it depends on hash values. It expects the learner to make that link, which is the bucket mechanics of topic 15 ("Hash tables inside query engines", §1.3, later in this chapter). Then, three steps later, "hash" means a SHA-256 file digest with the opposite property: deterministic, and the same everywhere. A learner who just learnt that "hashes are random per process" may wonder why the lock's hash is stable.
- *Evidence:* `reel.tsx` lines 80, 133–134. `syllabus/data-engineering.md:73`.
- *Fix:* step 6: "a set's order isn't specified; for strings it depends on `hash()`, which Python seeds randomly per process". Step 9: "a SHA-256 digest of the exact file (the same on every machine)".

**8. The closing handoff drops "logarithms", and nothing in the reel sets up the next topic's bridge. (minor)**
- **Fixed:** step 10 caption and narration say the gate checks the answer, not what it costs as the data grows, and restore "the logarithms the chapter counts with".
- *Where:* `reel.tsx` step 10 caption and `narration.json` step 10 ("the notation for how costs grow"), against the registry `handoff` ("…and the logarithms the rest of the chapter counts with"). The next topic's bridge, from `../CHAPTER.md` entry 5: "Tests check that a change gives the right answer; they don't say how its cost grows with the data."
- *What:* the next topic's bridge leans on something this topic never says: the gate checks correctness, not cost. The reel never mentions performance (a change that makes `clean.py` quadratic passes every oracle). The bridge lands better if this reel plants that question in its last breath.
- *Fix:* step 10 caption and narration: "The gate checks the answer, not what it costs as the data grows. Next, the last of the five refreshers: the notation for that, and the logarithms the chapter counts with."

### Gap hunt

**9. "Semantic versioning as a breakage contract" is taught through one breaking change, a column rename. What breaks a *data* consumer is never listed. (major)**
- **Fixed:** new Deep-dive bullet "What breaks a data consumer" (new enum value, type, nullability, added column, changed meaning, with the bump each needs and a pointer to §4.2's contract tests). `examples.sh` runs five small readers (asserted in `examples.py`: `KeyError`, `TypeError`, `TypeError`, `ValueError`, silent). The new status value is `returned`, because `cancelled` is already one of the shop's four statuses. Step 7's explain and narration answer list the extra breaks; the distractor "1.5.0, rebuilt" was kept (it teaches that a released version never changes).
- *Where:* `reel.tsx` step 7. `index.mdx` "Semantic versioning", "A public API must be declared first" (line 69). `coverage.json` clause "semantic versioning as a breakage contract".
- *What:* the syllabus clause, and `../CHAPTER.md` entry 4's scope ("what counts as breaking for a data library (a renamed column is breaking)"), ask what the contract covers for data. The topic gives only the example the plan named, plus one sentence that "the documented output columns are part of it". A sceptical senior expects the list that actually catches teams out, each of which this example could execute in a line:
  - A changed type (`amount` int → string, or Decimal → float).
  - A changed meaning with the same name and type (cents instead of currency units, UTC instead of local time). No `KeyError` appears, which is the dangerous case.
  - Changed nullability.
  - A **new enum value**, e.g. a fifth `status` such as `cancelled`. This breaks an exhaustive `match`, a `CHECK` constraint or a downstream mapping, and it is the most common real data break in the shop's own `order_events`.
  - An **added** column, which breaks positional readers, `INSERT … SELECT *` and strict schema validation. So for a data library, "compatible addition → MINOR" is not automatically safe.
  
  Without these, outcome 5 ("Decide a version bump from what changed") holds only for the easy case.
- *Evidence:* `index.mdx` lines 66–74 (seven bullets: none covers type, meaning, nullability, enum values or additive schema changes). `coverage.json` expert item 9 ("for data teams: schemas, table contracts, file formats count") is mapped to step 7 and that Deep-dive section, which don't cover it beyond the rename.
- *Fix:* add one Deep-dive bullet, "What breaks a data consumer", listing the five cases above with the bump each needs. Execute two of them in `examples.sh`: a new `status` value making a consumer's exhaustive mapping raise, and a type change. Consider replacing the step 7 distractor "1.5.0, rebuilt" with a card the learner must think about: "add status value `cancelled`" → MAJOR or MINOR? Contract tests are §4.2's ("producer/consumer contract tests", line 200), so link there.

**10. Several expert items are marked "covered later" in sections whose syllabus lines don't contain them. The CHAPTER scope's "stages" is not covered. (minor)**
- **Fixed:** item 18 is placed in "Unit tests with pytest" (test layout bullet: flat against src layout, executed: exit 0 against exit 2, with pytest-guide quotes); item 20 in "CI pipelines" (`concurrency`); item 21 in "CI pipelines" (cheapest step first, with Fowler's staged-build quotes), leaving SQLFluff as `out` to §11.4. `coverage.json` updated.
- *Where:* `coverage.json` expert items 18, 20 and 21 (lines 1267–1305). `../CHAPTER.md` entry 4 scope, "CI pipelines: stages; …".
- *What:*
  - **Item 18** (test layout: tests outside the package, src layout, an editable install so tests run against the installed package) is "later: Python toolchain (§4.3)". The §4.3 line (`syllabus/data-engineering.md:205`) mentions uv, lock files, workspaces, PEP 723 and Ruff/type checkers, not test layout or import modes. It also matters here: the Deep dive says `python -m pytest` "finds the checked-out `clean.py`" because the current directory is on `sys.path` (line 43). That is exactly the "tests pass against the source tree, not what you ship" trap the src layout exists to prevent.
  - **Item 20** (cancel stale in-flight runs) is general GitHub Actions (`concurrency: … cancel-in-progress: true`), not data CI/CD. The per-PR schema half is §11.4; the cancel half belongs in "CI pipelines".
  - **Item 21** (lint before the expensive build: fail cheap and early) is general stage ordering, the "stages" the chapter plan puts in this topic's scope. Only the SQLFluff example is §11.4. The Deep dive never says to order a job's steps cheapest and most likely to fail first: lint and types, then unit tests, then slow integration tests.
- *Fix:*
  - Item 18: either place it here (one bullet under "Unit tests with pytest": the src layout and `--import-mode=importlib`, and why `python -m pytest` on a flat layout tests the working tree) or point it at a section whose line covers it. If none does, raise a syllabus note.
  - Item 20: map it to "CI pipelines" and add `concurrency` there.
  - Item 21: split the general half into a "CI pipelines" bullet on step order (cheap first). Keep only "SQLFluff" as `out` → §11.4.

**11. The topic doesn't point to the later sections that take its subjects deeper. One "Left out" reason is wrong. (minor)**
- **Fixed:** "What's changing" now points to §4.2, §11.4 and §12.1; the `OUTLINE.md` "Left out" reason is corrected; "A test as an oracle" names mutation testing and property-based testing and points to §4.2 (no tool named, so no new source).
- *Where:* `index.mdx` "What's changing" (line 162, which points only to §4.3 and §11.4). `OUTLINE.md` "Left out on purpose", line 293 ("Coverage percentages, mutation testing, property-based testing: no source fetched here; not in the syllabus line").
- *What:*
  - Property-based testing *is* in the syllabus, in §4.2 "Testing data code" (`syllabus/data-engineering.md:200`: "unit tests on minimal fixtures, property-based tests for invariants (Hypothesis), producer/consumer contract tests, …"). That is the natural home for the unit-test depth this refresher skips.
  - §12.1 (line 704) covers "dependency lockfiles, … vulnerability scanning in CI; why 'works on my laptop' breaks scheduled pipelines", which is this topic's step 8 at production depth.
  - §11.4's "Testing pyramid" (line 691) names "the usual sources of flakiness (ordering, time, floating point)".
  
  None of these is linked. The lab's step 7 (the no-break space that one oracle misses) is the ideal moment to say "a property-based test would have generated it; §4.2". Step 3's "does it fail when the code is broken?" is a hand-made mutation test (commit 731 is the mutant), and naming that idea costs one clause.
- *Fix:* add §4.2, §11.4 (testing pyramid) and §12.1 pointers to "What's changing", or to the relevant Deep-dive bullets. Correct the `OUTLINE.md` "Left out" reason to "§4.2 (Testing data code)". Add a clause to "A test as an oracle": "running the tests against a deliberately broken copy is mutation testing, automated by tools such as mutmut".

**12. Libraries are told to declare a range, but nothing says the range has to be tested. There is no CI matrix, although the topic's own lock fails on Python 3.10. (minor)**
- **Fixed:** new "CI pipelines" bullet: a matrix over the supported Pythons (inline, not a code block) plus a lowest-versions job, with the uv docs quote. Executed: a library that declares `shopclean>=1.4` but calls `min_orders=` passes on the newest version and fails with `TypeError` on 1.4.0.
- *Where:* `index.mdx` "Who uses which" (line 80), "Failure controls" (line 50: only `fail-fast` of `strategy` is mentioned), "What a lock guarantees" (line 85: refused on Python 3.10). Step 8's explain.
- *What:* a library that declares `>=1.4` and `requires-python >=3.10` makes a promise about every version in those ranges. The standard CI practice is a `strategy.matrix` over the supported Pythons, plus one job that installs the *lowest* allowed versions (`uv pip install --resolution lowest-direct`, or a constraints file with the lower bounds). Without it, the lower bound is untested and often wrong. The topic teaches the declaration and the matrix's `fail-fast` default, but never the matrix itself. The Python 3.10 refusal it executed is a ready-made example.
- *Fix:* add one "CI pipelines" bullet: "A library's CI runs a matrix: each supported Python, and once with the lowest versions its ranges allow; otherwise `>=1.4` is a guess." Show three lines of `strategy.matrix`. The lowest-resolution tooling can be a §4.3 pointer.

**13. Upstream release hygiene is missing: yanking and automated lock updates. (minor)**
- **Fixed:** "A broken minor release upstream" now covers yanking (PEP 592 and PyPI Docs quotes; executed with a local index page carrying `data-yanked`: a range skips the yanked 2.0.0, an exact pin still installs it with a warning); "A lock that never moves" names Dependabot and `pip-audit` (quotes added), with scanning depth pointed to §12.1. Renovate is not named: no source was fetched for it.
- *Where:* `index.mdx` "In production" bullets "A broken minor release upstream" (line 146) and "A lock that never moves" (line 148).
- *What:*
  - For a broken release, the Python ecosystem's actual mechanism is **yanking** (PEP 592). The maintainer yanks 1.6.0, and pip then ignores it unless a requirement pins it exactly. The Deep dive tells the consumer to add `!=1.6.0` and wait, but never mentions that the maintainer can yank, or that a lock pinned to a yanked version still installs it (with a warning).
  - "Update it in small, reviewed PRs" is right, but leaves out how teams actually do it: Dependabot or Renovate open those PRs, and an auditor (`pip-audit`) fails the gate on known vulnerabilities. Without them, "a lock that never moves" is the default outcome.
- *Fix:* one clause each, with sources fetched (PEP 592; GitHub's Dependabot version-updates page; `pip-audit`'s README). Scanning depth can point to §12.1.

**14. The `gate.yml` the lab ships has no `permissions:` block and runs twice on every same-repository PR. (minor)**
- **Fixed:** `gate.yml` (in the Deep dive and in `examples.sh`, now identical) has `permissions: contents: read`, a `concurrency` group with `cancel-in-progress: true`, and `push` limited to `main`; `examples.sh` checks the three lines. "Pin the actions too" gains the least-privilege sentence with GitHub's secure-use quote. The two oracle run lines are unchanged.
- *Where:* `index.mdx` lab `gate.yml` (lines 106–134). "Pin the actions too" (line 53).
- *What:*
  - The Deep dive pins actions to SHAs "for stability and security", but leaves the job's `GITHUB_TOKEN` with the repository's default permissions. GitHub's own hardening guidance is to grant the least required, and `permissions: contents: read` is all this job needs.
  - `on: push` plus `on: pull_request` runs the gate twice for each push to a PR branch in the same repository.
  - There is no `concurrency` group, so superseded runs keep running (see finding 10).
  
  A reader who copies the kit, which the lab invites, copies these too.
- *Fix:* add `permissions: { contents: read }` and `concurrency: { group: gate-${{ github.ref }}, cancel-in-progress: true }`, and restrict `push` to `branches: [main]`. Re-run the two oracle lines in `examples.sh` (they don't change). Add one sentence on least-privilege tokens under "Pin the actions too", quoting GitHub's security-hardening page.

**15. The gap review in `coverage.json` is the builder's self-check, and it is still marked as having nothing open. (minor)**
- **Fixed:** `coverage.json` `gapReview` replaced (2026-10-12, "content review (Opus) + fix agent", `open: []`), and the expert list gained nine items for the gaps found.
- *Where:* `coverage.json` `gapReview` (lines 1308–1316): `"by": "the builder agent, as a self-check…"`, `"open": []`.
- *What:* `OUTLINE.md` line 312 says the content review should replace the self-check. As it stands, the build's coverage check passes on a gap review that no independent reader did. Findings 9–14 are open gaps.
- *Fix:* when these findings are resolved, rewrite `gapReview` with this review as its `by`. List what was resolved, and keep anything deferred in `open` until it is placed.

### Expert reader

**16. "A library should cap below the next major" is taught as the rule (step 8 explain, recap row 7). It is contested, and the topic's own sources give the argument against it. (major)**
- **Fixed:** step 8's explain and narration answer now say the application should pin exactly, with a lock; the cap advice moved to a Deep-dive trade-off ("To cap or not to cap, in a library") with the PyPA guide and Schreiner quotes; recap row 7 and outcome 6 are reworded ("lower bound always; cap only a known break"). Executed: a library capped at `shopclean<2` blocks an application that needs `>=2` (pip exit 1).
- *Where:*
  - `reel.tsx` step 8 explain ("A library should say what it supports, `>=1.4,<2` or `~=1.4`"). `narration.json` step 8 answer ("A library should say what it supports: below the next major version").
  - `scenes.tsx` `RECAP` row "Ranges and pins — library: <2; application: ==" (line 447).
  - `index.mdx` "Who uses which" (line 80), and outcome 6 (line 15).
- *What:* a sceptical senior engineer will object here first.
  - **The topic's sources don't say it.** PEP 440 and pip's docs, as quoted, say only that a published library should not use `==`. They don't say it should cap the major.
  - **Upper caps in libraries are a known source of trouble in Python packaging.** Two libraries capping the same dependency differently make an environment unresolvable. A cap can't be relaxed in an already-published release, so users can't take 2.0 even when the break doesn't touch them. And many widely used packages don't follow SemVer at all: pip itself uses calendar versioning.
  - **The topic's own Deep dive already has the argument.** It quotes semver's FAQ that "too-tight dependency specifications cause version lock" (line 73), but never applies it to `<2`.
  - **The scenario points at the application, not a library.** The `requirements.txt` with `>=1.4` belongs to the application. Step 8's fix is "the application should pin/lock", and the library advice is a change of subject.
  
  Teaching `<2` as the library rule, and putting it in the eight things to keep, turns a judgment call into a rule.
- *Evidence:* `SOURCES.md` PEP 440 and pip quotes (no upper-bound recommendation). `index.mdx` line 73. `reel.tsx` lines 112–123 (the file in the scenario is the application's).
- *Fix:*
  - Step 8 explain: "`>=1.4` admits every later version and pip takes the newest. The application should pin exactly, with a lock (next step)." Move the library advice to the Deep dive as a trade-off: lower bounds always; an upper cap only when you know the next major breaks you (`~=1.4` or `<2`), because caps cause resolver conflicts and can't be loosened after release.
  - Recap row 7: "application: pin with ==; library: a lower bound, cap only known breaks".
  - Fetch a source for the trade-off (the PyPA guide "install_requires vs requirements files"; Henry Schreiner, "Should You Use Upper Bound Version Constraints?", 2021) and add it to the fact-check.

**17. "Making a lock with pip alone" leaves out `pip lock`, which the pip version this topic cites ships for exactly this. Step 9 teaches a hand-assembled lock instead. (major)**
- **Fixed:** the section is retitled "What a lock is made of", with a new bullet "Who writes the lock" (`pip-compile --generate-hashes`, `pip lock` since pip 25.1, PEP 751); `pip lock` is executed with pip 26.2.1 in a venv and its output checked against the `pip hash` digest. Step 9's caption and narration say a lock tool writes the lines. `uv pip compile --generate-hashes` is not claimed (no source fetched); uv stays a §4.3 pointer. Changelog quote added to `SOURCES.md` and a fact-check row.
- *Where:* `index.mdx` "Making a lock with pip alone" (line 84). `reel.tsx` step 9 caption ("`pip freeze` lists the versions, `pip hash` or a resolver report gives the hashes"). `OUTLINE.md` "Left out on purpose" (line 290, "`pip lock` … §4.3").
- *What:* the pip changelog in `sources/` records "Add a new, experimental, pip lock command, implementing PEP 751" (`sources/pip-news.txt` line 758). `pip install` reads `-r pylock.toml` (`sources/pip-install.txt` line 413). So under the heading "with pip alone", the topic tells the reader to combine `pip freeze`, `pip hash` and `--dry-run --report`, and then quotes pip saying the report "is not meant to be a lock file format as such". Meanwhile pip has a lock command and there is a standard lock format, PEP 751. The deferral of uv and `pylock.toml` to §4.3 is fine for *tooling depth*. But a section that claims to say how pip makes a lock, and a reel step that puts freeze+hash on screen as *the* method, are incomplete for current pip. A practitioner would also expect pip-tools (`pip-compile --generate-hashes`, which `SOURCES.md` line 137 already notes the pip docs mention) or `uv pip compile --generate-hashes`. These are the usual way to produce exactly the hashed `requirements` file the gate uses.
- *Evidence:* `sources/pip-news.txt` lines 389, 758. `sources/pip-install.txt` line 413. `SOURCES.md` line 137. `index.mdx` lines 84 and 162.
- *Fix:*
  - Retitle the section "What a lock is made of", and keep the executed `--report` / `pip hash` equivalence as the demonstration that a lock line is just name, version and digest.
  - Add: "In practice a tool writes it: `pip-compile --generate-hashes` (pip-tools) or `uv pip compile --generate-hashes` for this format; pip's own `pip lock` (experimental since 25.1) writes the standard `pylock.toml` (PEP 751), §4.3."
  - Step 9 caption: "…pinned with `==` and hashed, by a lock tool, not by hand (§4.3)", or keep the caption and drop "`pip hash` or a resolver report gives the hashes".
  - Add the changelog quote to `SOURCES.md` and a fact-check row.

**18. Code review is presented only as blocking pre-merge PR review. The topic's own CI source says that model is in tension with CI and names the alternatives. (minor)**
- **Fixed:** new CI-practices bullet with Fowler's friction quote, the three alternatives and what each costs; a Code-review "Speed" sentence; the narration says "design first, and style last"; the funnel drops its numbers and only the first and last rungs differ in width, since the source ranks only those two.
- *Where:* `index.mdx` "Code review" and "Continuous integration practices" ("Integrate daily … Short-lived branches and a required check are how the Git refresher's trunk-based flow gets this", line 62). `narration.json` step 2 ("A review has an order... and the order is a priority").
- *What:*
  - The fetched Fowler article, under "How do we do pull requests and code reviews?", says: "The pre-integration code review can be problematic for Continuous Integration because it usually adds significant friction … this can easily end up being hours or days - breaking the timing that makes Continuous Integration work". It names pair programming, Ship / Show / Ask and post-integration review as the ways CI teams deal with it.
  - Learning design layer 4 asks for the alternatives and what each costs. The Deep dive quotes Fowler on daily integration and Google on a one-business-day response, but never puts the two side by side: a one-day review limit makes "integrate at least daily" hard to meet.
  - Separately, the narration's "the order is a priority" overstates Google's page. The page ranks design as most important and treats style as optional; it doesn't rank functionality, complexity, tests and naming against each other. The funnel's shrinking widths imply that it does.
- *Evidence:* `sources/martinfowler_com_articles_continuousIntegration_html.txt` lines 1699–1733. `SOURCES.md` lines 1026–1049 (the Fowler quotes chosen leave this out). `sources/eng-practices-looking.txt`.
- *Fix:*
  - Add a bullet to "Continuous integration practices": the friction quote, and the three alternatives in one line.
  - Add a sentence to "Code review" or "Speed": "a blocking review is the slowest step in most pipelines, which is why small PRs and fast replies matter; some teams review after merge (Ship/Show/Ask) or pair instead".
  - Narration: "Design comes first, and style comes last."
  - Add the quote to `SOURCES.md`.

**19. The "re-published file" threat is described in a way PyPI doesn't allow, and the realistic cases go unmentioned. (minor)**
- **Fixed:** with one correction to the finding. PyPI's filename rule and the three realistic cases are described, and step 9 says "a file that changed under a pinned version". But executing the added-wheel case showed that pip refuses the new file only when the links carry no hashes (a plain directory or a bare mirror); with hashes in the links, as PEP 503 says they should be, pip picks the locked file. The Deep dive says both, executed on pip 24.0.
- *Where:* `reel.tsx` step 9 ("a re-published file is refused"). `narration.json` step 9 ("Say someone republishes the same version with different contents"). `index.mdx` line 147 ("A re-published file"), and "Released means frozen" (line 70).
- *What:* PyPI never lets a filename be reused, even after deletion. So on the public index, "the same version with different bytes under the same file" means the index itself has been compromised, which pip's own text says hashes guard against. The realistic ways a pinned version's bytes change are:
  - **A new file added to an existing release.** PyPI allows uploading more files to a released version, for example a wheel for a newly supported platform or Python. pip may then prefer the new file over the one you hashed, and the install fails with a hash mismatch even though nothing malicious happened.
  - A private index or proxy that allows overwrites.
  - A mirror.
  
  The first case is the one a team actually hits, and it's also why "several hashes per package" (line 83) matters. On "Released means frozen": SemVer says contents MUST NOT change, and PyPI enforces this per file, not per version.
- *Fix:* step 9 and narration: "a changed file under a pinned version (a compromised index, a private index that allows overwrites, or a new wheel added to the release) is refused". In the Deep dive, add "PyPI never reuses a filename, but a release can gain files" and a source (PyPI help, "file name reuse").

**20. "In production" lists only generic failure modes, with no real incident. The two most instructive recent ones are about exactly this topic's subject. (minor)**
- **Fixed:** two "In production" bullets with fetched sources (GitHub's advisory record for CVE-2025-30066; PyPI's Ultralytics analysis). Where a detail isn't in the sources it isn't claimed: the PyPI blog names four affected versions (8.3.41, 8.3.42, 8.3.45, 8.3.46), not two, and says the workflows and the Actions cache were compromised, not "workflow injection"; that a SHA pin would have avoided tj-actions is argued from GitHub's "immutable release" sentence, not asserted from the advisory.
- *Where:* `index.mdx` "In production" (lines 142–152).
- *What:* Learning design layer 7 asks for "incidents and post-mortems". Two public incidents bear directly on this topic:
  - **The `tj-actions/changed-files` compromise (March 2025, CVE-2025-30066).** Version tags were moved to a malicious commit that printed CI secrets into logs. Workflows pinned to a tag ran it; workflows pinned to a commit SHA did not. This is the concrete reason behind "Pin the actions too".
  - **The Ultralytics PyPI release (December 2024).** A GitHub Actions workflow injection led to malicious 8.3.41/8.3.42 releases being published from the project's own CI. It shows that CI is part of the supply chain, and why `permissions` matter (see finding 14).
  
  Either would replace a generic bullet with a reason a senior remembers.
- *Fix:* add one bullet each, with primary sources fetched (GitHub advisory / CVE record for tj-actions; Ultralytics' or PyPI's incident write-up), quotes in `SOURCES.md`, and a fact-check row.

**21. "The gate's `timeout-minutes: 10` is that guideline written down" treats Fowler's ten-minute *feedback target* as a *kill limit*. (minor)**
- **Fixed:** the timeout paragraph now says `timeout-minutes: 10` is a hang guard (default 360) and the ten-minute rule is a target to watch; Fowler's "take action as soon as we start going slower than the ten minute rule" is quoted. The gate.yml comment says the same.
- *Where:* `index.mdx` "Fix a broken build immediately, and keep it fast" (line 63).
- *What:* Fowler's ten minutes is how fast feedback should come back, and he says to act "as soon as we start going slower than the ten minute rule". `timeout-minutes` cancels a hung job. With this setting, a build that drifts to 9½ minutes raises no alarm, and a build that sometimes takes 10½ fails as if a test had failed. The default of 360 exists to catch hangs, not to enforce speed. Equating the two is the kind of loose mapping an expert reader marks down.
- *Fix:* "The gate's `timeout-minutes: 10` is a hang guard. The ten-minute guideline is a target to watch, by trending the job's duration, not one to enforce by cancelling."

**22. The Prerequisites panel lists semver.org under "Installing packages with pip", and the registry declares nothing that the panel assumes. (minor)**
- **Fixed:** Prerequisites sections are now 04 workflow, 05 pip, 06 "Version numbers" (the semver link, with the check "1.9.0 or 1.10.0: which is newer?"); the registry entry declares `pip-install` and `github-actions-basics` (added to `uses` too).
- *Where:* `prerequisites.mdx` section 04 (resources: "Repeatable Installs" and "Semantic Versioning 2.0.0"). The panel's opening paragraph ("It assumes you have merged a pull request and installed a package with pip"). The registry entry has no `declared`. The previous topic declared `shell-basics`.
- *What:* the semver link is in the wrong section, so a learner who is rusty on versioning has no section to find it under. And the panel states two assumptions (a merged PR, a pip install) that the concept ledger doesn't record, so the "taught before it is used" check can't see them.
- *Fix:* move the semver link into its own short section, "05 Version numbers", with a one-line self-check ("1.9.0 or 1.10.0: which is newer?"). Add `declared: ['pip-install']`, or whichever id the chapter uses, to the registry entry, or show that an earlier topic introduces it.
