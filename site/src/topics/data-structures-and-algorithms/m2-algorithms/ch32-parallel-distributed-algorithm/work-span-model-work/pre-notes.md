- **Thread and core**: a core is a worker that runs one instruction stream; many cores share
  one memory on the machine this topic assumes.
- **Fork and join**: start two computations that may run at the same time, then wait until both
  have finished before continuing.
- **Data dependency**: a step that needs another step's result before it can run.
- **Directed acyclic graph**: a graph of steps and the dependencies between them, with no cycle
  — already covered, one line's reminder here.
- **Speed-up**: how many times faster a computation finishes on many workers compared to one.
- **Deque**: a double-ended queue; a worker's own list of ready tasks, with one end for the
  owner and the other for a thief.
- **An expected value**: the average outcome over many repetitions of something random, used
  here for a running time that depends on random choices.
