- **Thread.** An independent flow of execution that shares memory with other threads in the
  same program.
- **Data race.** Two threads touch the same memory location, at least one of them writes, and
  nothing orders the two accesses relative to each other.
- **Mutual-exclusion lock.** While one thread holds it, every other thread that wants it waits.
- **Preemption.** The scheduler stopping a thread in the middle of what it was doing, to run
  something else.
- **Atomic operation.** Indivisible: no other thread can ever observe it half done.
- **Sequential specification.** What a structure like a counter or a queue does when only one
  thread ever touches it — the rulebook a concurrent version is checked against.
- **Real-time order.** The order two operations actually happened in, by the clock on the wall,
  as opposed to the order a program's code happens to be written in.

**Check yourself:** two threads each read a shared counter, add one to what they read, and write
the result back, with nothing coordinating them. Is there an interleaving of their six individual
steps where the counter ends up too low? (Answer in the reel: step 2 — eighteen of the twenty
possible interleavings end that way.)
