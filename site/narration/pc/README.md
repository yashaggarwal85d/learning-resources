# Narration on the owner's PC (Windows 11, Radeon RX 9070 XT)

The cloud routines build topics and park them without audio (ROUTINE.md section 7). This machine narrates them in bulk on the GPU and releases them (`.claude/skills/narrate`). This page is the one-time setup for this card, the audition that picks the voice, and how the pipeline is switched to it.

## 1. One-time setup

1. **Driver.** The current AMD Adrenalin driver. The RX 9070 XT is `gfx1201` (RDNA 4); ROCm 7.2 was the first release to support it officially.
2. **Python 3.12** (python.org installer, "add to PATH"), **Git for Windows** (its Git Bash runs `narrate.sh`), **ffmpeg** (`winget install Gyan.FFmpeg`), and `uv` (`pip install uv`).
3. **PyTorch for ROCm on Windows**, AMD's official multi-arch wheels, in a fresh environment. From the repo's `site/` folder, in Git Bash:
   ```sh
   uv venv -p 3.12 "$HOME/.cache/learning-narration/tools/.venv-gpu"
   source "$HOME/.cache/learning-narration/tools/.venv-gpu/Scripts/activate"
   python -m pip install --index-url https://repo.amd.com/rocm/whl-multi-arch/ "torch[device-gfx1201]==2.12.0+rocm7.14.1" "torchaudio==2.12.0+rocm7.14.1"
   python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"
   ```
   The last line must print `True RX 9070 XT` (ROCm presents the card through the `cuda` device API). If it names an integrated GPU instead, set `HIP_VISIBLE_DEVICES=1` (or whichever index is the 9070 XT) in the shell and in every command below. Do not set `HSA_OVERRIDE_GFX_VERSION` unless detection fails. The exact pins move; AMD's install page (`rocm.docs.amd.com` → "Install PyTorch for ROCm") lists the current ones for `device-gfx1201`.
4. **The generator and the checker**, into the same environment:
   ```sh
   python -m pip install -U qwen-tts soundfile numpy librosa num2words jellyfish faster-whisper
   ```
   No `flash-attn` (CUDA only): the generator uses `attn_implementation="sdpa"`. The checker (faster-whisper, `voice.json` → `asr.model`) runs on the CPU, which is fine: it is a few seconds per take against a GPU take of about a second.
5. Tell the pipeline where the environment is. In `~/.bashrc` (Git Bash):
   ```sh
   export TTS_PY="$HOME/.cache/learning-narration/tools/.venv-gpu/Scripts/python.exe"
   export EVAL_PY="$TTS_PY"
   ```
   `narrate.sh` runs the generator with `TTS_PY` and the checker with `EVAL_PY`. (`ORPHEUS_PY` is only for the old CPU voice.)

Step-Audio-EditX, the other candidate within the licence rule, is documented for NVIDIA CUDA only (its lockfile pins CUDA PyTorch and its demo uses vLLM). It may run on this card by installing its code on top of the ROCm PyTorch above, but that is unverified; audition it only if it starts, and never let it block the Qwen path.

## 2. Audition: the owner picks the voice by listening (QUALITY.md #25)

The voice must be female, one narrator for the whole site, consistent across every line, warm and unhurried (PROJECT_PLAN.md, Narration → The voice). No cloning of a real, identifiable person: a reference clip is either a preset the model ships or a voice the model designed from a description.

```sh
cd site
"$TTS_PY" narration/audition.py            # renders the same six script lines with every candidate into narration/pc/audition/
```

It renders, for each candidate, six lines taken from real scripts (a statement, a question, a line with numbers, a dense technical line, a short line, a reveal): the CustomVoice presets `Vivian` and `Serena`, and up to three designed voices (descriptions in `audition.py` → `DESIGNS`), each designed once with the VoiceDesign model and then **cloned from that one designed clip** with the Base model, so the narrator is the same speaker on every line. Listen to all of it. Pick one. Change the descriptions and run again if none fits.

## 3. Freeze the voice

A new voice is a new `voice.json` version; every existing clip becomes stale and is regenerated (one signature voice, never mixed). Edit `site/narration/voice.json`:

- `version`: `"<name>-v2"` (for example `"serena-v2"`); the old `tara-v1` section stays in git history.
- `model`: `{"engine": "qwen3-tts", "repo": "Qwen/Qwen3-TTS-12Hz-1.7B-Base", "mode": "clone", "reference": "narration/pc/reference.wav", "reference_text": "<its exact transcript>", "licence": "Apache-2.0"}` for a designed-then-cloned voice (copy the chosen designed clip to `narration/pc/reference.wav` and commit it with its transcript: it is the frozen narrator), or `{"engine": "qwen3-tts", "repo": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice", "mode": "custom", "speaker": "Serena", "instruct": "<optional delivery note>", "licence": "Apache-2.0"}` for a preset.
- `takes` and `extra_takes`: keep three takes and four extras; each take's `seed` and `temperature` apply (the generator seeds torch and passes `temperature`, `top_p` and `max_new_tokens` from `sampling`).
- `sampling`: `{"top_p": 0.9, "max_new_tokens": 2048}` to start; tune only by listening.
- Everything else (pauses, audio standard, pace limits, the checker, tolerance) stays.

`take_key` in `common.py` hashes the model block and sampling, so old takes never collide with new ones, and the clip hash carries the version, so `npm run test:narration` lists every topic as stale. That list is now the whole site: regenerate all of it, live topics included, in one session (`/narrate` step 2), with an `Unlock: <topic-id>` line per live topic in the commit, which the owner's decision to change the voice authorises.

## 4. Then

`/narrate` (`.claude/skills/narrate/SKILL.md`): work list, bulk generation, listening, commit, release. On this card a take is about a second, so a topic's 160 to 250 takes are a few minutes; the checker on the CPU is the slow part at a few seconds per take.
