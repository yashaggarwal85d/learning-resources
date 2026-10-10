#!/usr/bin/env bash
# Generate, check and assemble the narration for one topic.
#   narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>      (run narration/setup.sh once first)
# Rounds: generate takes -> check them -> generate more takes for any line that failed (up to 4 rounds).
# English lines use the Orpheus environment, German lines ({"de": ...}) the qwen3-tts engine (gen_takes_de.py).
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
topic=$1
tools=${NARRATION_TOOLS:-$HOME/.cache/learning-narration/tools}
ORPHEUS_PY=${ORPHEUS_PY:-$tools/.venv-orph/bin/python}
EVAL_PY=${EVAL_PY:-$tools/.venv-eval/bin/python}
for py in "$ORPHEUS_PY" "$EVAL_PY"; do [ -x "$py" ] || { echo "$py not found: run narration/setup.sh first" >&2; exit 1; }; done
jobs=$(mktemp)
"$EVAL_PY" "$here/assemble.py" plan "$topic" "$jobs"
for round in 1 2 3 4; do
  "$ORPHEUS_PY" "$here/gen_takes.py" "$jobs"
  "$EVAL_PY" "$here/gen_takes_de.py" "$jobs"
  set +e; "$EVAL_PY" "$here/assemble.py" build "$topic" "$jobs"; rc=$?; set -e
  [ $rc -eq 0 ] && exit 0
  [ $rc -ne 3 ] && exit $rc
  echo "round $round: some lines need more takes"
done
echo "Some lines still fail after 4 rounds; rewrite them." >&2; exit 1
