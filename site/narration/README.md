# Narration

The reels' voice-over is generated here, on our own machine, with an open-source model: no vendor, no API. CI never generates audio; it checks it (`npm run test:narration`).

- `voice.json` — the frozen voices: the English narrator (Orpheus "tara": model, sampling, takes, pauses, audio standard). Changing it regenerates every clip.
- `<topic>/narration.json` (next to each reel) — the script, written to be spoken: one line per sentence or phrase; `{"beat": s}` for a deliberate pause; an `answer` clip for predict steps.
- `setup.sh` — one-time setup of everything below for the CPU voice, on any fresh machine or session. The owner's PC (GPU) is set up by `pc/README.md` instead; `gen_takes_qwen.py` is its generator and `audition.py` picks its voice.
- `narrate.sh` — runs the rounds: generate takes (`gen_takes.py`), check and assemble (`assemble.py`), more takes for any line that failed.
- Output: `public/audio/<topic id>/NN.webm` (Opus) and `NN.mp3`, plus `manifest.json` (script hash, line timings for captions, loudness, peak, pace).

## How a clip is made

1. Each line is generated as three takes (`voice.json` → `takes`).
2. Each take is transcribed locally (faster-whisper, the model in `voice.json` → `asr`). A take is rejected unless it says the line (`match.py`): after normalisation (numbers and ordinals spelled out the way num2words does, with the "and" dropped; aliases applied) every difference must be a mishearing a listener would not notice: the same words split or merged ("pipe fail" / "pipefail", "C.I." / "CI"), or words that sound alike (listed homophones, the same metaphone code, a one-letter slip that keeps the first letter), in at most two places of at most two words each. A skipped, added or garbled word fails. Lines of six words or more are also rejected outside `pace.wps` words per second.
3. Of the takes that pass, an exact take beats a tolerated one, then the one with the most pitch movement wins (more natural, less flat). If a clip would still fall outside `pace.clip_wpm`, its lines are swapped to slower (or faster) passing takes, biggest change first; if that is not enough, more takes of its fastest lines are generated.
4. If no take passes, more takes are generated (`extra_takes`); lines that never pass are all listed together at the end (never one at a time), and every one of them is rewritten.
5. Winning lines are joined with designed pauses, then normalised to −16 LUFS and `encode_headroom_db` below −1 dBTP (encoders overshoot), and encoded to Opus and MP3. The manifest records the takes behind each clip, so a rerun re-encodes only clips whose takes or script changed, and lists each clip's tolerated mishearings (`tolerated`) for the listening review.

Before generating anything, `assemble.py plan` refuses a script with a line over `pace.max_words_per_line` words (the voice truncates it) or with letters joined by hyphens ("C-I"); the site build checks the word limit too, so it is caught when the script is written. `python narration/match.py` runs the matcher's own cases.

## Setup (once per machine or session)

```sh
narration/setup.sh            # the narrator and the checker (~3 GB under ~/.cache/learning-narration/tools)
```

It installs what's missing (ffmpeg, a C compiler, OpenBLAS via apt-get; `uv`), creates two Python 3.12 environments (`.venv-orph`: Orpheus via llama.cpp; `.venv-eval`: faster-whisper, librosa, num2words, jellyfish), clones and builds the qwen3-tts engine at the commit pinned in `voice.json`, and downloads Qwen3-TTS 1.7B Base. The Orpheus weights and the speech-to-text model (`voice.json` → `asr.model`, about 1.6 GB) download on first use. Re-running it skips what is already there and refreshes the checker's dependencies; `NARRATION_TOOLS` moves the tools folder.

## Generate

From `site/`:

```sh
narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
```

On a 4-core CPU a take takes about 40–70 seconds, so a ten-step reel takes about two hours the first time. Unchanged lines are cached (`NARRATION_CACHE`, default `~/.cache/learning-narration`; takes, and their scores per checker model). That folder disappears with a fresh session, so `narrate.sh` also keeps the takes on the repo's `narration-cache` branch (`cache_sync.py`): it restores them when it starts, saves them every hour while it runs (`NARRATION_SAVE_EVERY`, seconds) and again when it stops, so a run that dies at a usage limit loses at most an hour of takes. Many runs narrate at once, so a save keeps every take already on the branch and adds its own; it drops only takes no script on main or any `topic/*` or `release/*` branch still uses. Takes are stored as lossless FLAC in a single commit that is replaced on every save. The branch is never merged and CI ignores it; `NARRATION_NO_SYNC=1` turns the sync off.
