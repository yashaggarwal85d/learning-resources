# Run metrics

`runs.jsonl` gets one line per routine run (written by `scripts/run-metrics.mjs`, see ROUTINE.md section 0): tokens (input, cache write, cache read, output), model calls, tool calls, subagents launched and elapsed seconds, in total and per ROUTINE.md section. `secs` is wall-clock between the transcript's timestamps, so time the session sat idle counts. Tokens are real counts from the session transcript; prices are not stored because they depend on the plan: multiply by your rates when reading.
