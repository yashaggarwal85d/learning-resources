#!/usr/bin/env bash
# One-time setup for narration on a fresh machine or session (safe to re-run: finished parts are skipped).
#   narration/setup.sh            the narrator and the checker
# Everything goes under $NARRATION_TOOLS (default ~/.cache/learning-narration/tools), outside the repo.
# Needs: uv, ffmpeg, a C compiler and OpenBLAS (installed with apt-get if missing). Disk: about 3 GB.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
tools=${NARRATION_TOOLS:-$HOME/.cache/learning-narration/tools}
mkdir -p "$tools"
cd "$tools"

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
echo "Narration ready (Orpheus weights download on first use)."
