# Pre-notes — Sorting inside spilling operators

- **Sorted run:** a sorted sequence of rows, the unit this topic spills and merges.
- **Memory budget:** the amount of memory the operator is allowed before it must write a run to
  disk and start a new one.
- **Temporary file (tape):** where a sorted run lives once it is written to disk; a logical
  sequential file, not necessarily one physical file.
- **Fan-in / merge order:** how many runs (or tapes) one merge pass combines at once.
- **Group (in a GROUP BY):** the set of rows sharing one key; an aggregate keeps one running
  state per group.
- **Aggregate state:** the partial result an aggregate keeps while scanning (a running sum, a
  running count), updated row by row.
- **Shuffle:** the step that moves rows between machines so rows with the same key land
  together, upstream of a sort-merge join or a grouped aggregation.
