# Narration on the owner's PC (Windows 11, Radeon RX 9070 XT)

The cloud routines build topics and park them without audio (ROUTINE.md section 7). This machine narrates them in bulk on the GPU and releases them (`.claude/skills/narrate`). This page is the one-time setup for this card, the audition that picks the voice, and how the pipeline is switched to it.

The site is a personal, non-commercial project (PROJECT_PLAN.md, Narration → Model, owner decision 2026-10-13), so research-licensed weights qualify. That puts **Breeze TTS 2** first: the only open-weight model above ElevenLabs v3 on the Artificial Analysis Speech Arena (1223 Elo in October 2026), English and Mandarin, voice design from a description and cloning from a clip, weights under the BreezeBlue Research and Non-Commercial License. **Qwen3-TTS 1.7B** (Apache 2.0) is the second candidate. The owner picks by listening (section 2).

## 1. One-time setup

Common: the current AMD Adrenalin driver (the RX 9070 XT is `gfx1201`, RDNA 4), **Python 3.12**, **Git for Windows** (Git Bash runs `narrate.sh`), **ffmpeg** (`winget install Gyan.FFmpeg`), `uv` (`pip install uv`). The checker and the assembler need one Python environment with the pipeline's libraries; from `site/` in Git Bash:

```sh
uv venv -p 3.12 "$HOME/.cache/learning-narration/tools/.venv-gpu"
source "$HOME/.cache/learning-narration/tools/.venv-gpu/Scripts/activate"
python -m pip install -U soundfile numpy librosa num2words jellyfish faster-whisper
```

### 1a. Breeze TTS 2 through Breeze-TTS-2.cpp (Vulkan: runs on the Radeon with the driver alone, no ROCm)

1. Download the prebuilt **Windows x64 Vulkan** build of Breeze-TTS-2.cpp from its GitHub releases page (`HoppouAI/Breeze-TTS-2.cpp`; needs only `vulkan-1.dll`, which the GPU driver provides) into `$HOME/.cache/learning-narration/tools/breeze/`. Building from source is `cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j` with the Vulkan SDK installed.
2. Download the **q8_0** GGUF (3.3 GB, the recommended quantisation; the `-dd` variants drift on long audio and are not for narration) from `HoppouAI/Breeze-TTS-2.cpp` on Hugging Face into the same folder.
3. Smoke test: `breeze-cli breeze-tts-2-q8_0.gguf --text "Run it twenty times, and half the runs fail." --instruction "A calm woman, warm, unhurried." --cfg-scale 4 --output test.wav`. It must use the GPU (the log names the Vulkan device); CPU fallback works but is slow.
4. In `~/.bashrc`: `export BREEZE_CLI="$HOME/.cache/learning-narration/tools/breeze/breeze-cli.exe"` and `export BREEZE_GGUF="$HOME/.cache/learning-narration/tools/breeze/breeze-tts-2-q8_0.gguf"`.

### 1b. Qwen3-TTS through PyTorch on ROCm (AMD's official Windows wheels for this card)

```sh
python -m pip install --index-url https://repo.amd.com/rocm/whl-multi-arch/ "torch[device-gfx1201]==2.12.0+rocm7.14.1" "torchaudio==2.12.0+rocm7.14.1"
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"   # True RX 9070 XT
python -m pip install -U qwen-tts
```

ROCm presents the card through the `cuda` device API. If it names an integrated GPU instead, set `HIP_VISIBLE_DEVICES` to the 9070 XT's index in the shell and in every command. Do not set `HSA_OVERRIDE_GFX_VERSION` unless detection fails. No `flash-attn` (CUDA only): the generator uses `attn_implementation="sdpa"`. The pins move; AMD's install page (`rocm.docs.amd.com` → "Install PyTorch for ROCm") lists the current ones for `device-gfx1201`.

### 1c. Tell the pipeline where things are

In `~/.bashrc`:

```sh
export TTS_PY="$HOME/.cache/learning-narration/tools/.venv-gpu/Scripts/python.exe"
export EVAL_PY="$TTS_PY"
```

`narrate.sh` picks the generator from `voice.json` → `model.engine` (`breeze-tts-2` → `gen_takes_breeze.py`, `qwen3-tts` → `gen_takes_qwen.py`) and runs it with `TTS_PY`; the checker and assembler run with `EVAL_PY`. (`ORPHEUS_PY` is only for the old CPU voice.) The checker (faster-whisper) runs on the CPU: a few seconds per take against a GPU take of about a second.

## 2. Audition: the owner picks the voice by listening (QUALITY.md #25)

The skill for this is `/voice-showcase` (`.claude/skills/voice-showcase/SKILL.md`); it runs the commands below, opens the listening page `narration/pc/audition/index.html`, waits for the pick, and freezes it (section 3). `/narrate` refuses to start until that has happened.

The voice must be female, one narrator for the whole site, consistent across every line, warm and unhurried (PROJECT_PLAN.md, Narration → The voice). No cloning of a real, identifiable person: every candidate is a voice the model designed from a description, rendered once on a reference line and then cloned from that one clip, so the narrator is the same speaker on every line.

```sh
cd site
"$TTS_PY" narration/audition.py breeze     # three designed Breeze voices → narration/pc/audition/breeze-*/
"$TTS_PY" narration/audition.py qwen       # Qwen presets Vivian and Serena, and the same three designs
```

Each candidate renders six real script lines (a statement, a question, a line with numbers, a dense technical line, a short line, a reveal). Listen to all of it, in order, at normal volume. Pick one. Change the descriptions in `audition.py` → `DESIGNS` and run again if none fits; Breeze's `--cfg-scale` (4 for design, 1 to 2 for plain speech) and `--instruction` steer delivery.

## 3. Freeze the voice

A new voice is a new `voice.json` version; every existing clip becomes stale and is regenerated (one signature voice, never mixed). Edit `site/narration/voice.json`:

- `version`: `"<name>-v2"` (for example `"breeze-warm-v2"`); the `tara-v1` block stays in git history.
- `model`, Breeze: `{"engine": "breeze-tts-2", "name": "Breeze TTS 2 (q8_0, Breeze-TTS-2.cpp)", "cli": "<BREEZE_CLI>", "gguf": "<BREEZE_GGUF>", "voice": "narrator", "reference": "narration/pc/reference.wav", "reference_text": "<its exact transcript>", "cfg_scale": 1.0, "licence": "BreezeBlue Research and Non-Commercial License (weights); Apache-2.0 (runtime)"}`. Copy the chosen candidate's `reference.wav` to `narration/pc/reference.wav` and commit it with its transcript (it is the frozen narrator), then save it once as the named voice: `breeze-cli <gguf> --text "<transcript>" --ref-audio narration/pc/reference.wav --ref-text "<transcript>" --save-voice narrator --output /tmp/x.wav` (saved voices load instantly; the generator falls back to the reference clip if the name is missing).
- `model`, Qwen: `{"engine": "qwen3-tts", "repo": "Qwen/Qwen3-TTS-12Hz-1.7B-Base", "mode": "clone", "reference": "narration/pc/reference.wav", "reference_text": "<transcript>", "licence": "Apache-2.0"}`, or `{"engine": "qwen3-tts", "repo": "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice", "mode": "custom", "speaker": "Serena", "licence": "Apache-2.0"}` for a preset; `sampling`: `{"top_p": 0.9, "max_new_tokens": 2048}`.
- `takes` and `extra_takes`: keep three takes and four extras; each take's `seed` and `temperature` are passed where the engine accepts them (Breeze: `--seed` and `--temp` when its CLI has them; otherwise takes differ by sampling alone, which is enough for the checker to choose from).
- Everything else (pauses, audio standard, pace limits, the checker, tolerance) stays.

`take_key` in `common.py` hashes the model block and sampling, so old takes never collide with new ones, and the clip hash carries the version, so `npm run test:narration` lists every topic as stale. That list is now the whole site: regenerate all of it, live topics included, in one session (`/narrate` step 2), with an `Unlock: <topic-id>` line per live topic in the commit, which the owner's decision to change the voice authorises.

## 4. Then

`/narrate` (`.claude/skills/narrate/SKILL.md`): work list, bulk generation, listening, commit, release. On this card a Breeze take is about a second (plus the model load per call, a few seconds, since the CLI is run per take), so a topic's 160 to 250 takes are ten to twenty minutes; the CPU checker is the other slow part.
