#!/usr/bin/env bash
# Generate, check and assemble the narration for one topic.
#   ORPHEUS_PY=... EVAL_PY=... narration/narrate.sh src/topics/<domain>/<milestone>/<chapter>/<topic>
# Rounds: generate takes -> check them -> generate more takes for any line that failed (up to 4 rounds).
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
topic=$1
: "${ORPHEUS_PY:?set ORPHEUS_PY to the Orpheus environment's python}" "${EVAL_PY:?set EVAL_PY to the evaluation environment's python}"
jobs=$(mktemp)
"$EVAL_PY" "$here/assemble.py" plan "$topic" "$jobs"
for round in 1 2 3 4; do
  "$ORPHEUS_PY" "$here/gen_takes.py" "$jobs"
  set +e; "$EVAL_PY" "$here/assemble.py" build "$topic" "$jobs"; rc=$?; set -e
  [ $rc -eq 0 ] && exit 0
  [ $rc -ne 3 ] && exit $rc
  echo "round $round: some lines need more takes"
done
echo "Some lines still fail after 4 rounds; rewrite them." >&2; exit 1
