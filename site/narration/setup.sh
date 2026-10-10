#!/usr/bin/env bash
# One-time setup for narration on a fresh machine or session (safe to re-run: finished parts are skipped).
#   narration/setup.sh            English narrator + checker + German voice
#   narration/setup.sh --english  English narrator + checker only
# Everything goes under $NARRATION_TOOLS (default ~/.cache/learning-narration/tools), outside the repo.
# Needs: uv, ffmpeg, a C compiler and OpenBLAS (installed with apt-get if missing). Disk: ~3 GB English, +~5 GB German.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
tools=${NARRATION_TOOLS:-$HOME/.cache/learning-narration/tools}
mkdir -p "$tools"
cd "$tools"
voice() { python3 -c "import json,sys; v=json.load(open('$here/voice.json')); print(eval(sys.argv[1]))" "$1"; }

need_apt=()
command -v ffmpeg >/dev/null || need_apt+=(ffmpeg)
command -v cc >/dev/null || need_apt+=(build-essential)
if [ "${1:-}" != "--english" ] && ! ldconfig -p 2>/dev/null | grep -q libopenblas; then need_apt+=(libopenblas-dev); fi
if [ ${#need_apt[@]} -gt 0 ]; then
  sudo=$([ "$(id -u)" = 0 ] && echo "" || echo sudo)
  $sudo apt-get update -qq && $sudo apt-get install -y -qq "${need_apt[@]}"
fi
command -v uv >/dev/null || python3 -m pip install --user -q uv
export PATH="$HOME/.local/bin:$PATH"

# English narrator (Orpheus via llama.cpp) and the checker (faster-whisper, librosa).
if [ ! -x .venv-orph/bin/python ]; then
  uv venv -q -p 3.12 .venv-orph
  uv pip install -q --python .venv-orph/bin/python orpheus-cpp llama-cpp-python soundfile numpy
fi
if [ ! -x .venv-eval/bin/python ]; then
  uv venv -q -p 3.12 .venv-eval
  uv pip install -q --python .venv-eval/bin/python faster-whisper librosa soundfile numpy num2words
fi
echo "English narration ready (Orpheus weights download on first use)."
[ "${1:-}" = "--english" ] && exit 0

# German voice: the qwen3-tts C engine at the pinned commit, and the Qwen3-TTS 1.7B Base model.
repo=$(voice 'v["german"]["engine"]["repo"]'); commit=$(voice 'v["german"]["engine"]["commit"]')
if [ ! -x qwen3-tts/qwen_tts ] || [ "$(git -C qwen3-tts rev-parse HEAD 2>/dev/null)" != "$commit" ]; then
  rm -rf qwen3-tts
  git clone -q "$repo" qwen3-tts
  git -C qwen3-tts checkout -q "$commit"
  make -C qwen3-tts blas >/dev/null
fi
if [ ! -f qwen3-tts-1.7b-base/model.safetensors ]; then
  bash qwen3-tts/download_model.sh --model base-large --dir "$tools/qwen3-tts-1.7b-base"
fi
qwen3-tts/qwen_tts --caps >/dev/null
echo "German voice ready: $tools/qwen3-tts (engine $commit), $tools/qwen3-tts-1.7b-base."
