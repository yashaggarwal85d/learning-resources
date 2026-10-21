# Teacher pass: writing a topic's narration as an MIT professor

The brief for the agent that writes or rewrites one topic's `narration.json` (`.claude/skills/make-topic` section 7 for new topics; `/narrate` step 1b for the topics in `site/src/topics/narration-backlog.json`). It is the plan's rule (PROJECT_PLAN.md, Narration → Three texts, one rule; The narrator's persona) made concrete. Work in place; do not commit, do not run `npm run build`, do not edit any file other than the topic's `narration.json`.

## The three texts of a step

- **On-screen text**: the labels and values inside the drawing (`scenes.tsx`).
- **Description**: the paragraph under the animation, the step's `body` in `reel.tsx`. The written anchor: what is on screen, the names, the numbers, the claim, for a viewer with the sound off. It stays as written.
- **Narration** (`narration.json`): the voice, and the captions, since the captions are the narration's words highlighted in time. This is what you write.

The narration never reads the description. Listening with eyes closed, the learner gets the mechanism; watching on mute, they get it from the description; together, the two never feel like the same text twice.

## The persona: an MIT professor at the board

- **Mechanism first, reasons before rules.** Say why the picture looks like that and why the system behaves that way, then name the rule. A rule without its reason is not said.
- **Direct attention.** "Watch the right-hand column." "Count the arrows as they land." Say what to look at as the animation moves, and what the final frame proves. Read `scenes.tsx` to know what actually moves.
- **Anticipate the wrong intuition and correct it.** Name the mistake a smart person makes here, and show what goes wrong if they make it.
- **Ask before you reveal.** A sharp question, a beat (`{"beat": 0.4}`), then the answer with its reason. On a predict step, the step's lines set up the reasoning without giving it away; the `answer` clip says why the right option is right and why each tempting option fails.
- **Connect.** One sentence ties the step to the one before, and, when it matters, to what this will be used for later.
- **Numbers carry arguments.** Say a number only when the number is the point, and then say what it means. Numbers are the reel's numbers (`examples.py` asserts them); never invent one.
- **Precise, plain, calm.** Exact vocabulary, used consistently. Short spoken sentences, second person, no hype, no filler, no "let's dive in", no cheerleading, no jokes for their own sake; dry understatement is fine. The learner is a capable adult.
- **Add, never repeat.** Every step says at least one thing the description does not. A recap step says what to carry away and why it matters next, never the description's list.

## Hard constraints (the build enforces them)

- File shape: `{"topic": "<id>", "steps": [{"lines": [...]}, ...]}`, exactly one entry per reel step, in order. A step with a predict question (`predict:` in `reel.tsx`) must have `"answer": [...]`; a step without one must not. `{"beat": 0.3..0.6}` entries mark a pause; at most one or two per step.
- One line per spoken sentence or short phrase; at most 50 words a line, usually 8 to 24. Per step, usually 1.5 to 2.5 times the description's length; an answer clip 3 to 6 lines.
- Speakable lines only: no digits (write numbers as words: "sixteen thousand, three hundred and eighty four", "two percent", "version one point five"); no symbols or code punctuation (`_ = < > { } [ ] ( ) / \ * # @ | ~ ^ $ % & +` and backticks); no code-style names (no camelCase or snake_case: say "snake case", "the with statement", "fix up", "reference log"); acronyms as plain capitals ("CI", "CPU"), never "C-I".
- Per step: under 50% of the narration's four-word phrases may occur in the description, and no description sentence of eight or more words may be spoken verbatim. Do not paraphrase the description sentence by sentence either: say different things.
- Everything true: every fact and claim agrees with the reel, the post-notes (`post-notes.md`) and `examples.py`.

## Two examples

Description under the step (stays as it is): *"A job lists steps; each `run:` is a new shell, and its exit status is the step's verdict. A step runs only if all before it succeeded, so the first non-zero status fails the job and skips the rest. Make the job a required status check and a red run blocks the merge."*

Reading it (wrong):
> A job on the runner is a script that stops on error. Each step runs only if the one before it succeeded. Each step is a new shell, and its exit status is its verdict. The first non-zero status fails the job, and every step after it is skipped.

The professor (right):
> Here is the one idea the whole of continuous integration rests on: the runner does not understand your tests, it understands exit codes.
> Watch the chain on the left. Each box is a fresh shell, and the only thing it hands back is a number. Zero means go on.
> So the question for every step is not "did it print something green", it is "what did it exit with".
> Now the right-hand chain. The second step exits with one, and look at what happens to the two boxes after it: nothing. They never run.
> People expect the later steps to run anyway, and to report their own results. They don't. A failed step ends the job, which is exactly what you want from a gate.
> Keep that in mind for the next step, where a shell setting decides whether a failure is even seen.

Note what changed: the reasons come first, the viewer is told where to look, the common misreading is named, nothing is read from the description, and the step hands off to the next one.

## Procedure

1. Read the topic folder: `reel.tsx` (steps, descriptions, predict questions and options), `scenes.tsx` (what moves, so you can direct attention), `narration.json` (the step structure to keep; the content to replace), `index.mdx` (the depth and the reasons to draw on), `examples.py` (the numbers), `OUTLINE.md` if present (the storyboard and the claims list).
2. Rewrite `narration.json` in place, every step, in the persona.
3. Validate: `cd <repo root> && node scripts/narration-teaches.mjs <topic folder>`. Every step must show no flag. Also `python3 -c "import json; json.load(open('<folder>/narration.json'))"`.
4. Report in under 150 words: topic id, steps rewritten, the validator's final result, and any line whose fact you were unsure of (quote it).

## The reviewer (second agent, same brief)

Judge every step as the professor's peer: would she say this; are the reasons before the rules; is the wrong intuition named and corrected; is attention directed to what actually moves; is anything the description's sentence restated; is every fact right against the reel and the Deep dive; is the answer clip a real explanation of right and wrong options. List the steps to redo, each with the reason in one line. Pass only when nothing is left.
