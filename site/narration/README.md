# Narration

The reels' voice-over is generated here, on our own machine, with an open-source model: no vendor, no API. CI never generates audio; it checks it (`npm run test:narration`).

- `voice.json` — the frozen voice: model, preset voice ("tara"), sampling settings, takes, pauses, audio standard. Changing it regenerates everything.
- `<topic>/narration.json` (next to each reel) — the script, written to be spoken: one line per sentence or phrase, `{"beat": s}` for a deliberate pause, an `answer` clip for predict steps.
- `narrate.sh` — runs the rounds: generate takes (`gen_takes.py`), check and assemble (`assemble.py`), more takes for any line that failed.
- Output: `public/audio/<topic id>/NN.webm` (Opus) and `NN.mp3`, plus `manifest.json` (script hash, line timings for captions, loudness, peak, pace).

## How a clip is made

1. Each line is generated as three takes (`voice.json` → `takes`).
2. Each take is transcribed locally (faster-whisper `small.en`). A take is rejected unless the transcript matches the line word for word (numbers and aliases normalised) and its pace is 1.9–3.4 words per second.
3. Of the takes that pass, the one with the most pitch movement wins (more natural, less flat).
4. If no take passes, more takes are generated (`extra_takes`); if none ever passes, rewrite the line.
5. Winning lines are joined with designed pauses, then normalised to −16 LUFS, −1 dBTP true peak, and encoded to Opus and MP3.

## Setup (once)

Two Python 3.12 environments (Orpheus needs llama.cpp; the checker needs faster-whisper and librosa):

```sh
uv venv -p 3.12 .venv-orph && uv pip install --python .venv-orph/bin/python orpheus-cpp llama-cpp-python soundfile numpy
uv venv -p 3.12 .venv-eval && uv pip install --python .venv-eval/bin/python faster-whisper librosa soundfile numpy num2words
```

The Orpheus weights (`isaiahbjork/orpheus-3b-0.1-ft-Q4_K_M-GGUF`) download on first use. Then, from `site/`:

```sh
ORPHEUS_PY=.venv-orph/bin/python EVAL_PY=.venv-eval/bin/python narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

On a 4-core CPU a take takes about 40–70 seconds, so a ten-step reel takes about two hours the first time; unchanged lines are cached (`NARRATION_CACHE`, default `~/.cache/learning-narration`).
