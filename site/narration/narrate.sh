#!/usr/bin/env bash
# Generate, check and assemble the narration for one topic.
#   narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>      (run narration/setup.sh once first)
# Rounds: generate takes -> check them -> generate more takes for any line that failed (up to 4 rounds).
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
topic=$1
tools=${NARRATION_TOOLS:-$HOME/.cache/learning-narration/tools}
ORPHEUS_PY=${ORPHEUS_PY:-$tools/.venv-orph/bin/python}
EVAL_PY=${EVAL_PY:-$tools/.venv-eval/bin/python}
# The generator follows voice.json → model.engine: orpheus (the CPU voice, gen_takes.py) or qwen3-tts (the GPU voice on the
# owner PC, gen_takes_qwen.py, run with TTS_PY; see pc/README.md).
engine=$( (grep -o '"engine": *"[^"]*"' "$here/voice.json" || true) | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
case "${engine:-orpheus}" in
  qwen3-tts) GEN_PY=${TTS_PY:?set TTS_PY to the python of the GPU environment, see pc/README.md}; GEN=gen_takes_qwen.py ;;
  *) GEN_PY=$ORPHEUS_PY; GEN=gen_takes.py ;;
esac
for py in "$GEN_PY" "$EVAL_PY"; do [ -x "$py" ] || { echo "$py not found: run narration/setup.sh (cloud) or follow narration/pc/README.md (PC)" >&2; exit 1; }; done
jobs=$(mktemp)
# Takes are kept across sessions on the `narration-cache` branch: restore them now, save them every hour while we run
# (a run that dies at a usage limit never reaches the exit trap, so it loses at most an hour) and when we stop.
# The cache only saves time, so a problem with it never stops narration.
cache() { [ "${NARRATION_NO_SYNC:-}" = 1 ] || "$EVAL_PY" "$here/cache_sync.py" "$1" || echo "narration cache $1 failed (continuing)" >&2; }
cache pull
( while sleep "${NARRATION_SAVE_EVERY:-3600}"; do cache push; done ) &
saver=$!
trap 'kill $saver 2>/dev/null || true; wait $saver 2>/dev/null || true; cache push' EXIT
"$EVAL_PY" "$here/assemble.py" plan "$topic" "$jobs"
for round in 1 2 3 4; do
  "$GEN_PY" "$here/$GEN" "$jobs"
  set +e; "$EVAL_PY" "$here/assemble.py" build "$topic" "$jobs"; rc=$?; set -e
  [ $rc -eq 0 ] && exit 0
  [ $rc -ne 3 ] && exit $rc
  echo "round $round: some lines need more takes"
done
echo "Some lines still fail after 4 rounds; rewrite them." >&2; exit 1
