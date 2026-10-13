---
name: voice-showcase
description: On the owner's PC: render every candidate narrator voice on real script lines, open a listening page, and wait for the owner to pick one; then freeze it. Use for "/voice-showcase", "show me the voices", "audition the voices", "pick the voice", and always before the first production narration on the GPU.
---

# /voice-showcase

The owner chooses the site's one narrator by ear (QUALITY.md #25). This skill makes that choice possible and records it. It runs on the owner's PC (`site/narration/pc/README.md` section 1 done). It never generates production audio.

## 1. Check the setup, quietly

From `site/` in Git Bash: `$BREEZE_CLI`, `$BREEZE_GGUF`, `$TTS_PY` set; `"$TTS_PY" -c "import soundfile, numpy"` works. For the Qwen candidates also `"$TTS_PY" -c "import qwen_tts, torch; print(torch.cuda.is_available())"`. A missing piece is reported in one line with the README step that fixes it; the showcase still runs with whatever engine is available.

## 2. Render the showcase

```sh
cd site
"$TTS_PY" narration/audition.py            # or: audition.py breeze | audition.py qwen
```

It renders six real script lines (a statement, a question, numbers, a dense technical line, a short line, a reveal) for every candidate: three designed Breeze TTS 2 voices and, when the ROCm environment exists, the Qwen3-TTS presets Vivian and Serena plus the same three designs. Each designed voice is designed once on a reference line, saved, and then used for all six lines, so a candidate is one consistent speaker. The descriptions are `audition.py` → `DESIGNS`; the owner can ask for different ones ("warmer", "lower", "slower") and the skill edits the descriptions and renders again.

Output: `site/narration/pc/audition/<candidate>/0..6.wav` plus `reference.wav`, and `site/narration/pc/audition/index.html`, a page with a player per line per candidate. Open it in the browser (`start narration/pc/audition/index.html`) and tell the owner it is open.

## 3. Wait for the pick

Stop and ask: which candidate, or what to change. Do not pick for the owner, do not start narration. When the owner names a candidate:

## 4. Freeze it

Follow `site/narration/pc/README.md` section 3 exactly: copy the candidate's `reference.wav` to `site/narration/pc/reference.wav`, write its transcript (the reference line in `audition.py`), save the Breeze voice as `narrator` (`--save-voice`), set `voice.json` → `version` to `"<candidate>-v2"` and the `model` block for the engine, leave everything else. Commit `Voice: <candidate> frozen (v2)` with `voice.json` and the reference clip, push to `main`.

Then say what this means: every existing clip is now stale, so the first `/narrate` regenerates the whole site (18 topics at the time of writing), live ones included, with `Unlock:` lines, and the parked topics after that.

## Never

- Start production narration before the owner has picked and `voice.json` → `version` has changed from `tara-v1`.
- Clone a real person's voice. Candidates are designed voices or the models' own presets.
- Mix candidates across topics, or keep two voices in `voice.json`.
