# Narration

The reels' voice-over is generated here, on our own machine, with an open-source model: no vendor, no API. CI never generates audio; it checks it (`npm run test:narration`).

- `voice.json` — the frozen voices: the English narrator (Orpheus "tara": model, sampling, takes, pauses, audio standard). Changing it regenerates every clip.
- `<topic>/narration.json` (next to each reel) — the script, written to be spoken: one line per sentence or phrase; `{"beat": s}` for a deliberate pause; an `answer` clip for predict steps.
- `setup.sh` — one-time setup of everything below, on any fresh machine or session.
- `narrate.sh` — runs the rounds: generate takes (`gen_takes.py`), check and assemble (`assemble.py`), more takes for any line that failed.
- Output: `public/audio/<topic id>/NN.webm` (Opus) and `NN.mp3`, plus `manifest.json` (script hash, line timings for captions, loudness, peak, pace).

## How a clip is made

1. Each line is generated as three takes (`voice.json` → `takes`).
2. Each take is transcribed locally (faster-whisper `small.en`). A take is rejected unless the transcript matches the line word for word (numbers and aliases normalised) and (for lines of six words or more) its pace is 1.5–3.6 words per second.
3. Of the takes that pass, the one with the most pitch movement wins (more natural, less flat).
4. If no take passes, more takes are generated (`extra_takes`); if none ever passes, rewrite the line.
5. Winning lines are joined with designed pauses, then normalised to −16 LUFS, −1 dBTP true peak, and encoded to Opus and MP3.

## Setup (once per machine or session)

```sh
narration/setup.sh            # the narrator and the checker (~3 GB under ~/.cache/learning-narration/tools)
```

It installs what's missing (ffmpeg, a C compiler, OpenBLAS via apt-get; `uv`), creates two Python 3.12 environments (`.venv-orph`: Orpheus via llama.cpp; `.venv-eval`: faster-whisper, librosa, num2words), clones and builds the qwen3-tts engine at the commit pinned in `voice.json`, and downloads Qwen3-TTS 1.7B Base. The Orpheus weights and the speech-to-text models download on first use. Re-running it skips what is already there; `NARRATION_TOOLS` moves the tools folder.

## Generate

From `site/`:

```sh
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

On a 4-core CPU a take takes about 40–70 seconds, so a ten-step reel takes about two hours the first time. Unchanged lines are cached (`NARRATION_CACHE`, default `~/.cache/learning-narration`). That folder disappears with a fresh session, so `narrate.sh` also keeps the takes on the repo's `narration-cache` branch (`cache_sync.py`): it restores them when it starts and saves them when it stops, even if it failed or was interrupted, so a run that hits its usage limit loses no takes. Takes are stored as lossless FLAC in a single commit that is replaced on every save, only for lines today's scripts still use. The branch is never merged and CI ignores it; `NARRATION_NO_SYNC=1` turns the sync off.
