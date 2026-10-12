import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: when shared mutable state is the wrong shape, and the shapes of ownership that replace it. Every snippet and every
// number is executed by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux). No timing is claimed anywhere: every number is a count.
const reel: Reel = {
  steps: [
    {
      title: 'Three stages, one guard at a time',
      body: (
        <>
          Three stages each want a buffer at once. The guard <code>PooledBuf</code> borrows the pool exclusively, so a second guard is E0499. The pull request wraps the pool in{' '}
          <code>{'Arc<Mutex<Pool>>'}</code>, and it compiles. Was that the fix the compiler was asking for?
        </>
      ),
      duration: 8.6,
      Visual: S.Problem,
    },
    {
      title: 'Four errors, four patches',
      body: (
        <>
          How the reflex happens, with the real errors. Two exclusive loans of one pool: E0499. Give each stage a thread, and the closure borrows a pool it may outlive: E0373, whose help says{' '}
          <em>add move</em> (step 13). The pool then moves into the first thread: E0382, whose note offers to clone it (three separate pools!). An <code>Arc</code> shares ownership but gives no{' '}
          <code>&amp;mut</code>: E0596. A <code>Mutex</code> makes it exclusive again, at run time (step 5). Every patch was local; none asked who should own the pool.
        </>
      ),
      duration: 10.2,
      Visual: S.Ladder,
    },
    {
      title: 'How many locks per message?',
      body: (
        <>
          The reviewed design, one message: <code>fill</code> takes a buffer and counts it, <code>inspect</code> counts it, <code>consume</code> counts it and gives the buffer back. How many times does
          one message acquire a lock? (<code>lock</code> is our counting wrapper around <code>Mutex::lock</code>.)
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: '1: the pool, once' },
          { label: '2: get and put' },
          { label: '5: pool twice, counters thrice', correct: true },
          { label: '0: channels carry the buffers' },
        ],
        explain: (
          <>
            Five: <code>get</code> and <code>put</code> lock the pool, and each stage locks the shared counters once. Over 1,000 messages that is 5,000 acquisitions, counted in code. Each is a point where
            the stages must take turns (Chapter 4 measures what that costs). And how many owners does the pool have now? Next step.
          </>
        ),
      },
      Visual: S.LockCount,
    },
    {
      title: 'Everyone owns it, so no one does',
      body: (
        <>
          Count the owners: the pool has three (<code>main</code>, <code>fill</code>, <code>consume</code>), the counters four. Shared ownership is real ownership: every holder can call any method at
          any time and none is in charge. An invariant like <em>every buffer is either in the pool or in exactly one stage</em> lives in no single place; each lock holder must keep it. Locks taken in
          different orders can deadlock. How many buffers exist? Nothing here decides; step 15 shows the cost.
        </>
      ),
      duration: 4.0,
      Visual: S.Owners,
    },
    {
      title: 'A lock is exclusivity checked at run time',
      body: (
        <>
          <code>{'Mutex<T>'}</code> owns its data and hands out <code>&amp;mut</code> through a guard that unlocks when it is dropped: the exclusive loan you already know, enforced at run time (a second
          caller waits) instead of at compile time. The std docs say it outright: <code>Mutex::get_mut</code> needs no locking, because holding <code>&amp;mut</code> to the mutex statically guarantees no
          one else can lock it. So the lock is only needed when you can't name one owner. <code>Arc::clone</code> copies an 8-byte pointer and bumps a count: 0 allocations, measured.
        </>
      ),
      duration: 5.0,
      Visual: S.RuntimeLock,
    },
    {
      title: 'Name the owner: a tree',
      body: (
        <>
          If the stages run one after another, name one owner and the problem is gone. The driver owns the pool and each stage's counters; it lends the buffer down (<code>&amp;mut</code> to{' '}
          <code>fill</code>, <code>&amp;</code> to <code>inspect</code>), hands it to <code>consume</code> and gets it back, and results come up as values (<code>Header</code> is <code>Copy</code>). The same
          signatures as before, now as the whole design: 1,000 messages, 1 allocation, 0 locks. If the stages must run <em>at the same time</em>, a tree isn't enough: step 14.
        </>
      ),
      duration: 5.4,
      Visual: S.Tree,
    },
    {
      title: 'Which of these really has many owners?',
      body: (
        <>
          Four pieces of "shared" state from the pipeline. Which one really has many owners?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'A: the pool' },
          { label: 'B: the counters' },
          { label: 'C: the config', correct: true },
          { label: 'D: the buffer' },
        ],
        explain: (
          <>
            Only C. Eight spawned threads read the config for the whole run, and a spawned thread may outlive whoever would lend it, so ownership really is shared: <code>{'Arc<Config>'}</code>,
            with no <code>Mutex</code> since nobody writes. (With scoped threads, Chapter 2, <code>main</code> could own it and lend it.) The others have one owner at a time: the driver owns the pool,
            each stage its own counters, and a buffer passed along is moved, not shared.
          </>
        ),
      },
      Visual: S.ManyOwners,
    },
    {
      title: 'A cycle has no owner at the top',
      body: (
        <>
          Pipelines are graphs, and this one has a cycle: the pool feeds <code>fill</code>, and <code>consume</code> feeds the pool. Single ownership is a tree, so a cycle can't own itself. Try it with{' '}
          <code>Rc</code> (the single-threaded <code>Arc</code>) and <code>RefCell</code> (borrow rules checked at run time): when the program drops its handles, each count falls to 1, never to 0: the
          counting allocator shows 4 allocations live. Leaks are memory-safe, so the compiler won't catch it. Chapter 4 fixes it with <code>Weak</code>; here, change who owns.
        </>
      ),
      duration: 5.0,
      Visual: S.RcCycle,
    },
    {
      title: 'One owner for every node: an arena',
      body: (
        <>
          Give every node one owner: an arena, here a <code>Vec</code> of slots. Edges become <code>Handle</code>s, an index plus a <em>generation</em> (8 bytes, <code>Copy</code>), so the cycle is just
          data: no node owns another, and dropping the arena frees them all at once (0 live allocations after, against 4 for the <code>Rc</code> ring). This is the idea behind the{' '}
          <code>slotmap</code> crate. (This <code>Handle</code> is the arena's key, unrelated to a <code>Vec</code>'s pointer-capacity-length handle.) What the generation is for, next.
        </>
      ),
      duration: 5.4,
      Visual: S.Arena,
    },
    {
      title: 'Remove a node, reuse its slot',
      body: (
        <>
          The stage <code>inspect</code>, at index 2, is hot-swapped: removed, and a new stage <code>audit</code> is inserted into the freed slot. <code>fill</code> still holds the old handle{' '}
          <code>2·0</code> (index 2, generation 0). What does looking it up return?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Some(audit): the slot is reused' },
          { label: 'None: the handle is stale', correct: true },
          { label: 'Some(inspect): it is still there' },
          { label: 'A panic: index out of range' },
        ],
        explain: (
          <>
            <code>None</code>. Removing <code>inspect</code> bumped slot 2's generation to 1; <code>audit</code> got handle <code>2·1</code>. The old handle still says generation 0, the slot says 1, so{' '}
            <code>get</code> refuses. With plain <code>Vec</code> indices the same lookup quietly returns <code>audit</code>, the wrong node: the <code>slotmap</code> docs call this the ABA problem.
            Removing the stale handle again is also <code>None</code>.
          </>
        ),
      },
      Visual: S.Reuse,
    },
    {
      title: 'The generation catches the stale handle',
      body: (
        <>
          Removal is three steps. <code>take()</code> moves the value out and leaves <code>None</code> (the previous topic's idiom). The generation goes up by one, so every handle made before is now
          stale. The index goes on the free list, and the next insert reuses the slot under the new generation. A lookup checks both numbers, so a stale handle gets <code>None</code>, never someone else's
          node, for one compare per access. Generations do wrap (ours after 2^32 removals of one slot, slotmap's after 2^31): still safe, just no longer caught.
        </>
      ),
      duration: 6.0,
      Visual: S.GenCheck,
    },
    {
      title: 'Sending is moving',
      body: (
        <>
          <code>tx</code> is the sending half of a channel (<code>mpsc</code>: a first-in, first-out queue between threads). <code>tx.send(buf)</code> takes the buffer by value, a move like any other
          call: the 32-byte <code>Buf</code> (id, then the vector's pointer, capacity, length) crosses to the other thread while the 64 KiB heap buffer stays where it is. <code>buf</code> is moved-from,
          so using it after the send is E0382. The compiler offers <em>clone it</em>: a second buffer, every message. Copy the{' '}
          <code>u32</code> id out first instead.
        </>
      ),
      duration: 4.2,
      Visual: S.SendMove,
    },
    {
      title: 'move hands a thread what it owns',
      body: (
        <>
          A closure captures what it uses as lightly as its body allows. <code>pool.get()</code> needs only <code>&amp;mut pool</code>, so without <code>move</code> this closure borrows{' '}
          <code>pool</code>, and <code>thread::spawn</code> refuses: the thread may outlive this function (<code>'static</code>, Chapter 2), E0373. <code>move</code> makes the closure own what it uses:
          the thread owns the pool until it ends, and <code>join()</code> hands it back. It never bends the rules: using <code>pool</code> after the spawn is E0382.
        </>
      ),
      duration: 4.8,
      Visual: S.MoveClosure,
    },
    {
      title: 'One owner, fed by messages',
      body: (
        <>
          Now the stages run at once. One thread owns the pool and alone calls <code>Pool::get</code>: three times, one buffer per stage. Each stage thread receives a buffer, works, sends it on;{' '}
          <code>consume</code> sends it home as <code>Msg::Data</code>. At any instant every buffer has exactly one owner: a stage, the owner, or the channel it is in. 1,000 messages: 3 buffers, 0 locks in
          our code, ids in order (1, 2, 3, 1, …) because channels are first-in, first-out. The message enum is the owner's API.
        </>
      ),
      duration: 6.0,
      Visual: S.RingRun,
    },
    {
      title: 'Stage 3 stalls. How many buffers?',
      body: (
        <>
          Stage 3, <code>consume</code>, stalls, in the pull request and in the ring alike, while stage 1 has 1,000 messages to push. How many buffers exist in each design by the time stage 3
          wakes?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: '1,000 in the PR, 3 in the ring', correct: true },
          { label: '3 in both' },
          { label: '1,000 in both' },
          { label: 'The ring deadlocks' },
        ],
        explain: (
          <>
            In the PR, <code>fill</code> calls <code>pool.get()</code> itself and the channel to <code>inspect</code> never blocks, so while <code>consume</code> sleeps it makes a new buffer for every
            message: 1,000 buffers, 62.5 MiB requested. In the ring only the owner makes buffers, three of them; <code>fill</code> simply waits in <code>for msg in rx</code> for one to come back.
            Backpressure came from the topology, not from a setting.
          </>
        ),
      },
      Visual: S.StallCompare,
    },
    {
      title: 'The owner can count every buffer',
      body: (
        <>
          One owner, one set of books. Every channel is first-in, first-out and every buffer takes the same path, so the owner knows which buffer must come home next and checks it: a cloned or lost buffer
          fails at once (we tried both). With that check passing the books balance: in the pool plus out in the ring equals every buffer made, at each of 1,000 returns.
        </>
      ),
      duration: 6.5,
      Visual: S.Ledger,
    },
    {
      title: 'Pick the shape by the data',
      body: (
        <>
          Choose by the shape of the data, not by the error message. A natural parent (a request, a pipeline run): a tree, with no synchronisation at all. A graph with cycles or removal: an arena, paying
          one generation check per lookup. Many concurrent users of one piece of state: an owner thread, paying a channel hop per request. Small, simple data touched briefly by many threads: a{' '}
          <code>Mutex</code> is fine, paying a lock per access. First ask: who should own this?
        </>
      ),
      duration: 5.0,
      Visual: S.Choose,
    },
    {
      title: 'When Arc<Mutex<T>> is the right shape',
      body: (
        <>
          <code>{'Arc<Mutex<T>>'}</code> isn't wrong; reaching for it to silence the compiler is. Tokio's own guide puts a <code>HashMap</code> of simple data behind a mutex, keeps the critical sections
          short, and moves state into a task that owns it once the work needs I/O. Read-only data shared for the whole run needs <code>Arc</code> alone. If a lock becomes contended, the fixes are an owner
          task, sharding, or restructuring to avoid the mutex; measuring that is Chapter 4. Thread-safety rules (<code>Send</code>, <code>Sync</code>, poisoning) are Chapter 6.
        </>
      ),
      duration: 5.0,
      Visual: S.RightShape,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          A stage keeps a borrowed view of the first 5 bytes (the header) of its buffer, sends the buffer on to the next stage, and then prints the view. What does the compiler say?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Compiles: view is just 5 bytes' },
          { label: 'E0382: use after move' },
          { label: 'E0505: move while borrowed', correct: true },
          { label: 'Compiles, races at run time' },
        ],
        explain: (
          <>
            E0505: <code>buf</code> can't move into the channel while <code>view</code> still borrows it, because the other thread could change or drop those bytes while you print them. rustc suggests
            cloning the bytes; the fix that clones nothing is to take what you need as a value first: <code>let h = inspect(&amp;buf);</code> returns a <code>Copy</code> <code>Header</code>, and then the
            send is free.
          </>
        ),
      },
      Visual: S.ProveView,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          In the ring, stage 3 stalls. Point to the exact line of <code>fill_stage</code> where stage 1 blocks.
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'for msg in rx: waits for a buffer', correct: true },
          { label: 'tx.send(...): the channel is full' },
          { label: 'fill(...): the buffer is locked' },
          { label: 'Nowhere: it makes new buffers' },
        ],
        explain: (
          <>
            At <code>for msg in rx</code>: <code>fill</code> can only work on a buffer someone sends it, and only the owner sends buffers, three in all. With stage 3 stalled, none come home, so the owner
            has none to send and <code>fill</code> blocks on its receive. Its sends never block: the channel is unbounded, and that is safe here only because the ring holds three buffers, no more.
          </>
        ),
      },
      Visual: S.ProveBlock,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          A job scheduler on one thread: jobs depend on other jobs (a job can have two dependents), and a finished job is removed while others still list it as a dependency. Which ownership shape?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Rc<RefCell<Job>> per job' },
          { label: 'Arc<Mutex<Job>> per job' },
          { label: 'Arena<Job> + Handle', correct: true },
          { label: 'Box<Job> tree, parents own deps' },
        ],
        explain: (
          <>
            An arena. Jobs form a graph (a job can have two dependents) and finished jobs are removed while others still refer to them: one owner for all jobs, <code>Handle</code>s as edges, and asking
            for a finished job gives <code>None</code>, not a reused slot. With <code>{'Rc<RefCell>'}</code>, dependents keep a finished job alive (<code>Weak</code>, Chapter 4, is the other fix);{' '}
            <code>{'Arc<Mutex>'}</code> locks on one thread; a <code>Box</code> tree can't share a dependency.
          </>
        ),
      },
      Visual: S.ProveArena,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Four shapes for one pipeline. <code>{'Arc<Mutex<T>>'}</code>: many owners and a lock, which by reflex hides who should own the data. A tree: one owner lends down, results come back. An arena: one
          owner for every node, edges as handles whose generation catches stale ones. An owner thread: one owner, sent owned values, one owner per buffer at every instant. Every topology still lends:{' '}
          <code>fill</code> borrows <code>&amp;mut Buf</code>, <code>inspect</code> borrows <code>&amp;Buf</code>. Next: the rule behind those loans, many shared borrows or one exclusive borrow, never both.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
