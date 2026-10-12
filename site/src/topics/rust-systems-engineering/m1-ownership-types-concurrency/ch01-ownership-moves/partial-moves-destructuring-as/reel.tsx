import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: moving fields out of a struct, why a type with Drop forbids it, the idioms that put something back, and
// patterns as transfer points. Every snippet and every number is executed by examples.py (rustc 1.97.0, edition 2024
// unless a step compares editions, x86_64 Linux). The running example is the chapter's buffer pipeline.
const reel: Reel = {
  steps: [
    {
      title: 'The guard that will not give the buffer back',
      body: (
        <>
          The chapter's pipeline takes a 64 KiB buffer (<code>Buf</code>) from a pool (<code>Pool</code>) for every message, and a guard should hand it back when dropped. Inside <code>drop</code>,{' '}
          <code>self</code> is only a <code>&amp;mut</code>, so moving <code>self.buf</code> out is E0507, <code>cannot move out of `self.buf` which is behind a mutable reference</code> (E0509, moving
          out of a <code>Drop</code> type, is step 7). rustc's help: <code>consider cloning the value if the performance cost is acceptable</code>. It compiles, and 1,000 full-size messages now cost 1,001
          allocations instead of one.
        </>
      ),
      duration: 5.6,
      Visual: S.Problem,
    },
    {
      title: 'One pool, one allocation',
      body: (
        <>
          The rest of this reel uses the chapter's pipeline. <code>Pool::get</code> is the only place a 64 KiB buffer is allocated; <code>fill</code> borrows it exclusively, <code>inspect</code>{' '}
          borrows it shared and returns a <code>Header</code> (kind and length, a small <code>Copy</code> value), <code>consume</code> takes it and hands it back, and <code>put</code> takes it
          back into the pool. A thousand 261-byte messages: one allocation. Every handover moves the 32-byte <code>Buf</code> (an id and the vector's 24-byte handle), never the payload. Owning the buffer through this chain is this topic's job.
        </>
      ),
      duration: 5.2,
      Visual: S.Pipeline,
    },
    {
      title: 'Move one field out',
      body: (
        <>
          A struct without <code>Drop</code> can give up one field: <code>let payload = frame.payload;</code> moves the buffer to a new owner and leaves a hole. The heap bytes don't move; only the
          <code>Buf</code> does. The rest of <code>frame</code> is still owned: <code>frame.header</code> is <code>Copy</code>, so reading it copies. What you can't do is use{' '}
          <code>frame</code> as a whole: E0382, <code>use of partially moved value</code>, pointing at <code>value partially moved here</code>.
        </>
      ),
      duration: 5.0,
      Visual: S.MoveOne,
    },
    {
      title: 'What does the closing brace drop?',
      body: (
        <>
          <code>p</code> is a <code>Parts</code> of three trace probes (<code>Trace</code> logs its name when it is dropped). One field is moved out into a local. At the closing brace, which
          destructors run, and in what order?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'head, body, tail' },
          { label: 'body, head, tail', correct: true },
          { label: 'head, tail (body never drops)' },
          { label: 'E0382 at the brace' },
        ],
        explain: (
          <>
            <code>body</code>, then <code>head</code>, <code>tail</code>. The moved field didn't vanish: its new owner, the local <code>body</code>, was declared after <code>p</code>, so it drops
            first (locals in reverse). Then <code>p</code> drops only what it still holds, in declaration order. The Reference: "After a partial move, only the remaining fields are dropped." Dropping a
            partly moved struct is not a use, so there is no error.
          </>
        ),
      },
      Visual: S.BraceDrops,
    },
    {
      title: 'Refill the hole, or move it only sometimes',
      body: (
        <>
          A hole can be filled again: <code>p.body = Trace("body2");</code> re-initializes the field, and <code>p</code> is whole and movable as a unit (<code>p</code> must be <code>let mut</code>).
          A field moved on only one path gets its own drop flag, the run-time boolean from the previous topic, here for one field. The compiled MIR has one flag for <code>p.body</code>, checked before
          dropping it, while <code>p.head</code> is dropped unconditionally.
        </>
      ),
      duration: 5.4,
      Visual: S.RefillFlag,
    },
    {
      title: 'Which of these moves compiles?',
      body: (
        <>
          Four ways to take a <code>Buf</code> out of something that owns it (<code>Rc</code> is shared ownership by reference count, Chapter 4). Which line compiles?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'let a = v[0];' },
          { label: 'let b = *shared;' },
          { label: 'let c = *boxed;', correct: true },
          { label: 'let d = r.payload;' },
        ],
        explain: (
          <>
            Only the box. The Reference lists every place you may move out of: an unborrowed variable, a temporary, a field of a movable place that is not itself a <code>Drop</code> type, and{' '}
            <code>*b</code> for a <code>Box&lt;T&gt;</code>, which the language special-cases. A <code>Vec</code> index and an <code>Rc</code> deref reach the value through a reference (E0507), and so does{' '}
            <code>r.payload</code>. The box's own 32-byte allocation is freed at scope end, not at the move.
          </>
        ),
      },
      Visual: S.WhichMoves,
    },
    {
      title: 'A type with Drop is sealed',
      body: (
        <>
          Now the struct has a destructor. <code>PooledBuf</code>, the chapter's guard (why its field is an <code>Option</code>: step 12), holds <code>buf: Option&lt;Buf&gt;</code> and <code>pool: &amp;mut Pool</code> and implements <code>Drop</code> to return the buffer.
          Destructuring it is E0509, <code>cannot move out of type `PooledBuf&lt;'_&gt;`, which implements the `Drop` trait</code>, and so is <code>guard.buf</code>. <code>Drop::drop</code> gets{' '}
          <code>&amp;mut self</code> and may read every field, so a field moved out early would hand it a hole. Reading a <code>Copy</code> field is still fine.
        </>
      ),
      duration: 5.6,
      Visual: S.Sealed,
    },
    {
      title: 'Does the ref fix rescue into_inner?',
      body: (
        <>
          <code>into_inner</code> won't compile (E0509), and rustc's help says to bind <code>ref buf</code> instead. Does that fix <code>into_inner</code>?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Yes, ref fixes it' },
          { label: 'No: ref only borrows, E0507', correct: true },
          { label: 'Yes, but drop returns it twice' },
          { label: 'No: ref is banned in Rust 2024' },
        ],
        explain: (
          <>
            No. <code>ref</code> binds a reference, so <code>buf</code> is <code>&amp;Option&lt;Buf&gt;</code>, and <code>expect</code> takes its receiver by value: E0507, <code>cannot move out of `*buf` which is behind a shared reference</code>.
            Borrowing the field is the right fix when you only need to look at it. To take it out of a sealed type, the field has to be able to say it's empty: step 12.
          </>
        ),
      },
      Visual: S.RefFix,
    },
    {
      title: 'Behind a reference, no holes',
      body: (
        <>
          A borrower may not leave a hole, because the owner gets the value back when the loan ends and will read or drop it. Moving <code>frame.payload</code> out through <code>&amp;mut Frame</code> is E0507,{' '}
          <code>cannot move out of `frame.payload` which is behind a mutable reference</code>, even though the next line refills it: if anything panicked in between, the owner would get back a hole. So the value has to be replaced in one step. The same
          error covers <code>&amp;T</code>, a <code>match</code> on a field, a <code>Vec</code> index and an <code>Rc</code>.
        </>
      ),
      duration: 5.0,
      Visual: S.BehindRef,
    },
    {
      title: 'take, replace, swap: never leave a hole',
      body: (
        <>
          Each idiom moves a value out through a <code>&amp;mut</code> by putting a valid value back in the same step, so the owner never sees a hole. <code>Option::take</code> leaves <code>None</code>.{' '}
          <code>mem::take</code> leaves <code>T::default()</code> and so needs <code>Default</code>; an empty <code>Vec</code> allocates nothing. <code>mem::replace</code> leaves the value you pass.{' '}
          <code>mem::swap</code> exchanges two places. None of them allocates or drops anything (measured). For collections, owning removals avoid the hole another way, by shrinking the collection: <code>pop</code>, <code>swap_remove</code>, <code>drain</code>.
        </>
      ),
      duration: 5.6,
      Visual: S.Idioms,
    },
    {
      title: 'What does mem::take leave in the pool?',
      body: (
        <>
          A stage hands each message's bytes to a writer with <code>mem::take</code> and returns the <code>Buf</code> to the pool. How many allocations for 1,000 messages of 261 bytes?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: '1: take moves no bytes' },
          { label: '1,000', correct: true },
          { label: '1,001' },
          { label: '2,000' },
        ],
        explain: (
          <>
            1,000. <code>mem::take</code> leaves <code>Vec::default()</code>, which has no capacity, so the 64 KiB allocation leaves with the taken bytes and is freed. The pool gets back a <code>Buf</code> with
            an empty <code>Vec</code>, and every later <code>fill</code> allocates 261 bytes: 1 + 999 allocations, 326,275 bytes. The call copied no bytes and allocated nothing; it moved the capacity out of the pool.
            Take the whole <code>Buf</code>, or hand the bytes back.
          </>
        ),
      },
      Visual: S.TakeTrap,
    },
    {
      title: 'PooledBuf: an Option makes the hole legal',
      body: (
        <>
          The fix for step 1: make "already handed back" a state the field can be in. <code>PooledBuf</code> stores <code>buf: Option&lt;Buf&gt;</code>, and its <code>drop</code> calls <code>self.buf.take()</code>:
          the buffer moves out, <code>None</code> moves in, no field is ever missing, and the glue then drops a <code>None</code>, which does nothing. A thousand full-size messages: 1 allocation, against 1,001 with
          the clone. The <code>Option</code> costs no space here (<code>Option&lt;Buf&gt;</code> measured 32 bytes, like <code>Buf</code>).
        </>
      ),
      duration: 5.6,
      Visual: S.OptionHole,
    },
    {
      title: 'After into_inner, what does drop find?',
      body: (
        <>
          <code>into_inner</code> takes the buffer out and returns it. Then <code>self</code> drops at the closing brace and <code>PooledBuf</code>'s <code>drop</code> runs. What does it do?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'It puts the buffer back too' },
          { label: 'Nothing: it finds None', correct: true },
          { label: 'It panics in expect' },
          { label: 'E0509 in into_inner' },
        ],
        explain: (
          <>
            Nothing. <code>take</code> moved the buffer into the return value and left <code>None</code>; when <code>self</code> drops at the brace, <code>drop</code> runs and its <code>if let Some(b)</code> finds{' '}
            <code>None</code>. <code>take</code> borrows the field (<code>&amp;mut self.buf</code>), so this is not a move out of a <code>Drop</code> type: no E0509. The caller owns the buffer now and returns it with{' '}
            <code>pool.put</code> when done: 1 allocation for 1,000 messages.
          </>
        ),
      },
      Visual: S.IntoInner,
    },
    {
      title: 'The error path, with and without the guard',
      body: (
        <>
          By hand, <code>pool.put</code> sits after the <code>?</code>, so each malformed message drops its buffer: 1,000 messages with 100 bad ones cost 100 allocations (6,553,600 bytes), the first plus 99
          replacements. <code>check</code> is <code>inspect</code> that rejects a bad kind with <code>Err</code>. With the guard <code>g</code>, the early return drops <code>g</code>, which puts the buffer back:
          1 allocation. A panic that unwinds runs the same <code>drop</code>. Only a guard whose destructor never runs (leaked, or a process ending without unwinding) loses its buffer, and that is safe.
        </>
      ),
      duration: 5.6,
      Visual: S.ErrorPath,
    },
    {
      title: 'A pattern is a transfer point',
      body: (
        <>
          Every <code>let</code>, <code>match</code> arm and <code>if let</code> pattern decides, binding by binding, what happens to each part: a plain name copies a <code>Copy</code> type and moves anything else,{' '}
          <code>ref</code> borrows, and <code>_</code> touches nothing. So <code>let Frame {'{ header, payload }'} = frame;</code> copies <code>header</code>, moves <code>payload</code> and leaves <code>frame</code>{' '}
          partially moved; with <code>ref payload</code> nothing moves. The guard's <code>if let Some(b) = self.buf.take()</code> (step 12) is one: <code>b</code> binds by value, so the buffer changes owner there.
          Struct update syntax, an expression, moves too: <code>..frame</code> takes <code>frame.payload</code>.
        </>
      ),
      duration: 5.6,
      Visual: S.PatternTransfer,
    },
    {
      title: 'Some(_) or Some(_b)?',
      body: (
        <>
          <code>slot</code> holds a 64 KiB buffer. One <code>if let</code> uses <code>_</code>, the other <code>_b</code>. Which one leaves <code>slot</code> usable afterwards?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Both' },
          { label: 'Only Some(_)', correct: true },
          { label: 'Only Some(_b)' },
          { label: 'Neither' },
        ],
        explain: (
          <>
            Only <code>Some(_)</code>. <code>_</code> is not a binding: it does not copy, move or borrow (Reference). <code>_b</code> is an ordinary name that only silences the unused-variable warning, so it
            moves the <code>Buf</code> out and <code>slot</code> is partially moved: <code>borrow of partially moved value: `slot`</code>. The Book shows the same with <code>Some(_s)</code> on an{' '}
            <code>Option&lt;String&gt;</code>.
          </>
        ),
      },
      Visual: S.UnderscoreBind,
    },
    {
      title: 'Matching on a reference borrows instead',
      body: (
        <>
          Match a reference with a non-reference pattern and Rust dereferences it for you and switches the <em>default binding mode</em>. It starts at <code>move</code>; a <code>&amp;</code> makes it <code>ref</code>; a{' '}
          <code>&amp;mut</code> makes it <code>ref mut</code>, unless it is already <code>ref</code> (there is no way back). So <code>match &amp;frame</code> binds <code>&amp;Header</code> and <code>&amp;Buf</code> and
          moves nothing. This is match ergonomics (RFC 2005). For an <code>Option&lt;Buf&gt;</code>, <code>&amp;slot</code>, <code>as_ref()</code> and <code>as_mut()</code> borrow the payload.
        </>
      ),
      duration: 5.6,
      Visual: S.DefaultMode,
    },
    {
      title: 'One mut, two editions',
      body: (
        <>
          <code>Header</code> is <code>Copy</code>. This pattern borrows <code>frame</code> and asks for a mutable <code>header</code>. What happens to <code>frame.header.len</code>?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Set to 99 in frame' },
          { label: '2021 edits a copy; 2024 rejects it', correct: true },
          { label: 'E0507 in both editions' },
          { label: 'A copy, in both editions' },
        ],
        explain: (
          <>
            Before 2024, <code>mut</code> on a binding reset the default mode to <code>move</code>, so <code>header</code> became a mutable <em>copy</em> and the original stayed 0 (measured:{' '}
            <code>copy edited: 99 original: 0</code>). For a non-<code>Copy</code> field the same <code>mut</code> was E0507. Rust 2024 rejects the pattern:{' '}
            <code>cannot mutably bind by value within an implicitly-borrowing pattern</code>. Write <code>&amp;mut frame</code> to edit in place.
          </>
        ),
      },
      Visual: S.MutTwoEditions,
    },
    {
      title: 'Rust 2024 reserves three spellings',
      body: (
        <>
          Rust 2024 (since 1.85) reserves three spellings where a pattern is already borrowing implicitly, that is, where the default mode is not <code>move</code>: <code>mut</code> on a binding, an explicit{' '}
          <code>ref</code>/<code>ref mut</code>, and a <code>&amp;</code>/<code>&amp;mut</code> pattern. Each is an error now. <code>cargo fix --edition</code> applies the <code>rust_2024_incompatible_pat</code> lint,
          which rewrites each pattern to a fully explicit one that keeps its 2021 meaning: review it, because that meaning may be the silent copy of the last step.
        </>
      ),
      duration: 5.0,
      Visual: S.ThreeReservations,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          <code>p</code> holds three trace probes. A pattern takes <code>tail</code>, then <code>head</code> is passed to <code>drop</code>. In what order do the three destructors run?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'head, tail, body', correct: true },
          { label: 'head, body, tail' },
          { label: 'tail, body, head' },
          { label: 'E0382 at drop(p.head)' },
        ],
        explain: (
          <>
            <code>head</code>, <code>tail</code>, <code>body</code>. <code>drop(p.head)</code> moves the field into <code>drop</code>, which ends it at once; using a still-initialized field of a partially moved
            struct is fine. At the brace, locals go in reverse: <code>tail</code> (the pattern's binding, declared after <code>p</code>), then <code>p</code>, which holds only <code>body</code>.
          </>
        ),
      },
      Visual: S.Prove1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          <code>finish</code> won't compile: E0507. Which fix hands the buffer out with no allocation?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'self.buf.clone()' },
          { label: 'mem::take(&mut self.buf)' },
          { label: 'mem::replace with an empty Buf', correct: true },
          { label: 'let Sink { buf, .. } = *self' },
        ],
        explain: (
          <>
            <code>mem::replace</code> with an empty <code>Buf</code> (<code>Buf {'{ id: 0, bytes: Vec::new() }'}</code>): out goes the buffer, in goes a valid one, 0 allocations. Fine here, because <code>Sink</code> has
            no <code>Drop</code> and <code>finish</code> runs once; if a <code>Drop</code> or a second <code>finish</code> later read <code>buf</code>, the empty <code>Buf</code> would be a lie, so use{' '}
            <code>Option&lt;Buf&gt;</code> (next question). <code>clone</code> allocates (1 allocation, 261 bytes). <code>mem::take</code> needs <code>Buf: Default</code> (E0277). Destructuring <code>*self</code> is E0507.
          </>
        ),
      },
      Visual: S.Prove2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          Three reviewers build the guard's buffer field three ways. All three pass the happy-path test with one allocation. Which design do you ship?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Placeholder Buf' },
          { label: 'ManuallyDrop<Buf>' },
          { label: 'Option<Buf> + take', correct: true },
          { label: 'Any: all allocate once' },
        ],
        explain: (
          <>
            <code>Option&lt;Buf&gt;</code>. A placeholder's type can't say that <code>into_inner</code> already handed the buffer out, so this <code>drop</code> returns the empty <code>Buf</code> to the pool: after 1,000
            messages the free list holds 1,000 placeholders (measured). <code>ManuallyDrop::take</code> is <code>unsafe</code>: nothing stops a second take (Chapter 30). <code>None</code> is the honest state, and costs 0
            bytes here (all three measured 40); its price is an <code>expect</code> in each accessor, a check the type can't remove.
          </>
        ),
      },
      Visual: S.Prove3,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Six things to keep. Moving a field out leaves a hole; the struct drops the rest. A <code>Drop</code> type is sealed (E0509). Behind <code>&amp;</code> or <code>&amp;mut</code> you never leave a hole (E0507), so{' '}
          <code>take</code>, <code>replace</code> and <code>swap</code> put a value back in one step. A guard that hands its contents out keeps them in an <code>Option</code>, emptied with <code>take</code>. Every
          pattern binding moves, copies or borrows. Next: <code>PooledBuf</code> borrows the <code>Pool</code> exclusively; when three stages need buffers, do you reach for <code>Arc&lt;Mutex&lt;Pool&gt;&gt;</code>, or
          change who owns what?
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
