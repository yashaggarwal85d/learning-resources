- **Working set.** The set of entries a program is actually using around a given moment —
  distinct from everything it has ever touched, which can be far larger.
- **Sequential scan.** A pass that touches a long run of entries once each, in order, rather than
  revisiting a smaller set over and over.
- **Access frequency.** How many times an entry has been touched, as opposed to how recently.
- **Counter decay.** Periodically shrinking a count (halving it, or ageing it toward zero) so an
  old, no-longer-relevant count doesn't stay privileged forever.
- **Ghost entry.** An identifier kept in memory after the entry it names has already left the
  cache — no value, no data, just "this key was recently here."
- **Reuse distance (one line).** How many *distinct* other entries were touched between two uses
  of the same entry — a different measure from how much *time* passed, which this topic defines
  fully when it comes up.
- **FIFO queue (one line).** A queue where the first thing added is the first thing removed,
  reused here as 2Q's holding area for first-time entries.

**Check yourself:** a cache evicts by exact recency, and one scan touches everything in it exactly
once. How many of the cache's previously-hot entries survive? (Answer in the reel: step 1,
recalling the previous topic's own measured result.)
