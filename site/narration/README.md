# Narration

The reels' voice-over is generated here, on our own machine, with an open-source model: no vendor, no API. CI never generates audio; it checks it (`npm run test:narration`).

- `voice.json` — the frozen voices: the English narrator (Orpheus "tara": model, sampling, takes, pauses, audio standard) and, under `german`, the German voice (engine commit, model, reference clip, takes). Changing either regenerates every clip that uses it.
- `voices/german-reference.wav` — the German voice's reference clip, chosen by the site owner. It was designed from a text description (Qwen3-TTS VoiceDesign), not recorded from a person; every German line clones it.
- `<topic>/narration.json` (next to each reel) — the script, written to be spoken: one line per sentence or phrase; `{"de": "…"}` for a line in German (spoken by the German voice); `{"beat": s}` for a deliberate pause; an `answer` clip for predict steps.
- `setup.sh` — one-time setup of everything below, on any fresh machine or session.
- `narrate.sh` — runs the rounds: generate takes (`gen_takes.py` English, `gen_takes_de.py` German), check and assemble (`assemble.py`), more takes for any line that failed.
- Output: `public/audio/<topic id>/NN.webm` (Opus) and `NN.mp3`, plus `manifest.json` (script hash, line timings for captions, loudness, peak, pace).

## How a clip is made

1. Each line is generated as three takes (`voice.json` → `takes`).
2. Each take is transcribed locally (faster-whisper `small.en`; German lines: `small`, language `de`). A take is rejected unless the transcript matches the line word for word (numbers and aliases normalised) and (for lines of six words or more) its pace is 1.5–3.6 words per second.
3. Of the takes that pass, the one with the most pitch movement wins (more natural, less flat).
4. If no take passes, more takes are generated (`extra_takes`); if none ever passes, rewrite the line.
5. Winning lines are joined with designed pauses, then normalised to −16 LUFS, −1 dBTP true peak, and encoded to Opus and MP3.

## Setup (once per machine or session)

```sh
narration/setup.sh            # English narrator, checker and German voice (~8 GB under ~/.cache/learning-narration/tools)
narration/setup.sh --english  # without the German voice
```

It installs what's missing (ffmpeg, a C compiler, OpenBLAS via apt-get; `uv`), creates two Python 3.12 environments (`.venv-orph`: Orpheus via llama.cpp; `.venv-eval`: faster-whisper, librosa, num2words), clones and builds the qwen3-tts engine at the commit pinned in `voice.json`, and downloads Qwen3-TTS 1.7B Base. The Orpheus weights and the speech-to-text models download on first use. Re-running it skips what is already there; `NARRATION_TOOLS` moves the tools folder.

## Generate

From `site/`:

```sh
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

On a 4-core CPU an English take takes about 40–70 seconds and a German take about 10–25 seconds, so a ten-step reel takes about two hours the first time. Unchanged lines are cached (`NARRATION_CACHE`, default `~/.cache/learning-narration`). German lines are transcribed with the multilingual faster-whisper `small` model (language `de`) and level-matched to the English lines in their clip; their captions are marked `lang: "de"`.
