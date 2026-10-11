import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: when a value dies, in what order, and why Rust lets you skip it. Every snippet and every number is executed by
// examples.py (rustc 1.97.0, edition 2024 unless a step compares editions, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'One if let, two editions, one deadlock',
      body: (
        <>
          A pipeline stage reads a flag under a reader-writer lock (<code>read()</code> and <code>write()</code> return guards that unlock when dropped) and sets
          it if unset: the Rust Edition Guide's own example. Compiled with <code>--edition 2021</code> it deadlocks when the flag is unset (the <code>RwLock</code> docs allow a panic instead; on this
          toolchain it hangs); with <code>--edition 2024</code> it runs. Nothing but <em>when a temporary dies</em> changed. You've seen that the single owner decides who destroys a
          value. Now: exactly when that happens, in what order, and why Rust still lets you skip it. By the end you'll place every destructor in a program on a
          timeline, build a wrapper that closes a file exactly once, and know why leaking is allowed. First what a destructor is and where it runs (steps 2 to 8); then when a <em>temporary</em> dies, which is
          what changed (9 to 12).
        </>
      ),
      duration: 5.0,
      Visual: S.Problem,
    },
    {
      title: 'A destructor is two parts',
      body: (
        <>
          When a value is no longer needed Rust runs its destructor, which is two parts: a call to <code>Drop::drop</code> if the type implements{' '}
          <code>Drop</code>, then the compiler-generated <em>drop glue</em>, which drops every field in declaration order. The <code>Stage</code> above logs{' '}
          <code>stage</code> first, then <code>name</code>, <code>input</code>, <code>spill</code> (<code>SpillFile</code>, built at step 7, closes a temporary file in <code>Drop</code>). Most types never write a <code>Drop</code>: the glue
          already drops their fields. A <code>Trace</code> is our probe, a value whose <code>Drop</code> appends its name to a log (a <code>thread_local!</code>{' '}
          holds one copy per thread, in a <code>RefCell</code> whose borrow rules are checked at run time; Chapter 4).
        </>
      ),
      duration: 5.4,
      Visual: S.TwoParts,
    },
    {
      title: 'Three locals, which dies first?',
      body: (
        <>
          Three locals are declared in order: <code>a</code>, <code>b</code>, <code>c</code>. At the closing brace, in what order do their destructors run?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'a, b, c' },
          { label: 'c, b, a', correct: true },
          { label: 'All at once' },
          { label: 'Any order' },
        ],
        explain: (
          <>
            <code>c</code>, then <code>b</code>, then <code>a</code>: locals drop in reverse declaration order, the opposite of struct fields. Reverse
            order is the stack discipline, and it is what makes a later value that borrows an earlier one sound: a guard holding <code>&amp;a</code> (its
            destructor may still read <code>a</code>) dies before <code>a</code> does. The Deep dive's drop check is this rule made precise. Shadowing changes
            nothing: a shadowed <code>x</code> is still dropped at the brace, in its own position. Tuples and arrays follow the field rule: first element first.
          </>
        ),
      },
      Visual: S.ThreeLocals,
    },
    {
      title: 'A value dies where its last owner ends',
      body: (
        <>
          A destructor runs when its owner's scope ends, and after a move the owner is the <em>new</em> binding: <code>m</code> dies at{' '}
          <code>consume</code>'s closing brace, and <code>main</code>'s brace drops nothing for it, because the moved-from place is deinitialized (previous topic).{' '}
          <code>std::mem::drop</code> is not magic: it is literally <code>{'pub fn drop<T>(_x: T) {}'}</code>, a function that takes ownership and returns, so the
          value dies at once. On a <code>Copy</code> value it does nothing: a copy is moved in and dropped, the original stays. Assignment also runs the
          destructor: in <code>v = built("v2")</code> the new value is built first, then the old <code>v1</code> is dropped, then the new one is stored (the
          Reference's order), so a new value that needs the resource the old one holds fails or deadlocks. On a reference, <code>drop</code> drops the
          reference, not the value: <code>drop(&amp;g)</code> keeps <code>g</code> locked (the <code>dropping_references</code> lint warns).
        </>
      ),
      duration: 5.0,
      Visual: S.LastOwner,
    },
    {
      title: 'Can you call x.drop() yourself?',
      body: (
        <>
          A type <code>Foo</code> implements <code>Drop</code>. You hold <code>x</code> and write <code>x.drop();</code> to run the destructor early. What does
          the compiler say?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Compiles; prints kaboom once' },
          { label: 'Compiles; prints kaboom twice (yours and the automatic one)' },
          { label: 'Rejected: E0040, explicit destructor calls are not allowed', correct: true },
          { label: 'Compiles only inside an unsafe block' },
        ],
        explain: (
          <>
            E0040: <code>explicit use of destructor method</code>. <code>Drop::drop</code> takes <code>&amp;mut self</code>, so after your call <code>x</code>{' '}
            would still exist and be dropped again at the brace: a double destructor. Because <code>drop</code> gets <code>&amp;mut self</code>, every
            field must still be there when it runs: a <code>Drop</code> type keeps its fields until it dies. rustc's own help says <code>consider using `drop` function</code>:{' '}
            <code>drop(x)</code> moves <code>x</code> in, so nothing is left to drop twice. A destructor should not panic either: a panic while unwinding
            aborts.
          </>
        ),
      },
      Visual: S.ManualDrop,
    },
    {
      title: 'Exactly once: why Copy and Drop never meet',
      body: (
        <>
          A type with <code>Drop</code> manages something besides its own <code>size_of::&lt;T&gt;</code> bytes (the std <code>Copy</code> docs' words), so a
          bitwise copy would duplicate that responsibility: two owners, two closes. That is why <code>Copy</code> and <code>Drop</code> are mutually
          exclusive, E0184 (the error index adds that the combination is disabled for now because the current implementation "is incorrect and can lead to
          memory unsafety"). Put the three rules together and "never twice" is a theorem, not a convention: every value has one owner; a move deinitializes the
          source, so it drops nothing; and a type with a destructor can never be <code>Copy</code>. "Exactly once" follows whenever the destructor runs at
          all, and, as you'll see, Rust does not promise that. The previous topic's <code>Fd(i32)</code> wrapper is <code>File</code> (4 bytes on Linux: the
          descriptor), which std already wraps for you; the raw-fd version, <code>OwnedFd</code>, is Chapter 11. Here we build the wrapper one level up:{' '}
          <code>SpillFile</code>.
        </>
      ),
      duration: 5.0,
      Visual: S.CopyDrop,
    },
    {
      title: 'SpillFile: an OS resource with one owner',
      body: (
        <>
          RAII in Rust is ownership plus <code>Drop</code>. <code>SpillFile</code> owns a temporary spill file: <code>create</code> opens it, <code>Drop</code>{' '}
          unlinks it, and the drop glue then drops <code>file</code>, whose own destructor closes the descriptor (<code>File</code> is 4 bytes on Linux: the
          descriptor, measured). A <em>guard</em> is a value whose only job is to do something in <code>Drop</code>; <code>SpillFile</code> is one, and so is a lock
          guard. The <code>closes</code> counter ticks in the wrapper's own <code>Drop</code>; the count in <code>/proc/self/fd</code> (up by one while open,
          back after) confirms the descriptor was closed. Hand it through two functions and back: one close, one unlink, no <code>defer</code>, no <code>finally</code>, no{' '}
          <code>with</code>, because there is exactly one owner and that owner's scope end is the release. Caveat from the <code>File</code> docs: errors detected
          on close are ignored by <code>Drop</code>; call <code>sync_all</code> first if they matter. Raw descriptors and I/O safety are Chapter 11.
        </>
      ),
      duration: 5.4,
      Visual: S.Spill,
    },
    {
      title: 'Which goes first, the file or its directory?',
      body: (
        <>
          A <code>Spool</code> owns a directory guard and a file guard, in that order. The directory guard's <code>Drop</code> calls <code>remove_dir</code>, the
          file guard's calls <code>remove_file</code>. After the <code>Spool</code> is dropped, what is left on disk?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'Both removed: the glue handles it' },
          { label: 'The directory is left on disk', correct: true },
          { label: 'The file is left on disk' },
          { label: 'Compile error: two Drop impls in one struct' },
        ],
        explain: (
          <>
            Fields drop in declaration order, so <code>dir</code> goes first: <code>remove_dir</code> on a directory that still holds <code>spill.bin</code> fails,
            the error is swallowed, and the directory stays. Then <code>spill</code> drops and unlinks the file. Swap the declarations (<code>spill</code> before{' '}
            <code>dir</code>) and both vanish: a field that must outlive another is declared <em>after</em> it. The <code>ManuallyDrop</code> docs say the same:
            fix the order by reordering, not with <code>unsafe</code>.
          </>
        ),
      },
      Visual: S.FieldOrder,
    },
    {
      title: 'Temporaries die at the semicolon',
      body: (
        <>
          A temporary (a value with no binding) lives until the end of its <em>temporary scope</em>, usually the enclosing statement:{' '}
          <code>m.lock().unwrap().push(1);</code> releases the lock at the semicolon. One exception and one trap. The exception, <em>lifetime extension</em>: in{' '}
          <code>let r = &amp;Trace("ext");</code> the temporary is kept to the end of the block so <code>r</code> has something to point at (a function argument does
          not extend: <code>let r = id(&amp;temp());</code> is E0716 once <code>r</code> is used). The trap: an <code>if</code> condition is a scope of
          its own, a <code>match</code> scrutinee is <strong>not</strong>, so a lock taken in the scrutinee lives to the end of the whole{' '}
          <code>match</code>, through every arm. A <code>for</code> header and a <code>while let</code> scrutinee hold their lock through the loop body in the
          same way (measured with <code>try_lock</code>), while a local declared in a loop body is dropped at the end of every iteration. Shorter scopes exist
          too: <code>&amp;&amp;</code>/<code>||</code> operands and match guards each get their own.
        </>
      ),
      duration: 5.6,
      Visual: S.Temporaries,
    },
    {
      title: 'What does cargo fix --edition do to it?',
      body: (
        <>
          Back to step one's function under 2021. The migration lint <code>if_let_rescope</code> fires. You run <code>cargo fix --edition</code>. What does it
          produce, and does it end the deadlock?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Leaves if let; the deadlock is gone under 2024' },
          { label: 'Rewrites it to a match; the deadlock is gone' },
          { label: 'Rewrites it to a match; the deadlock stays', correct: true },
          { label: 'Refuses: no automatic fix exists' },
        ],
        explain: (
          <>
            <code>cargo fix --edition</code> applies the lint's suggestion: a <code>match</code> with a <code>_</code> arm for the <code>else</code>, which "can
            preserve the drop order up to Edition 2021". A <code>match</code> scrutinee's temporaries live to the end of the statement, so the read guard is still
            held in the <code>_</code> arm and <code>write()</code> waits forever under 2024 too. The Edition Guide says: review every rewrite, and revert to{' '}
            <code>if let</code> where you want the shorter life.
          </>
        ),
      },
      Visual: S.CargoFix,
    },
    {
      title: 'Rust 2024: two shorter temporary scopes',
      body: (
        <>
          Rust 2024 (release 1.85) narrows two temporary scopes. In <code>{'if let $pat = $expr { .. } else { .. }'}</code>, temporaries from <code>$expr</code> are
          now dropped before the program enters <code>else</code>, instead of after the whole expression: that is why step one's read guard is gone when{' '}
          <code>write()</code> runs. And temporaries in a block's tail expression are dropped right after the tail is evaluated, <em>before</em> the block's
          locals, where 2021 extended them to the next temporary-scope boundary. Neither changes <code>match</code>, whose scrutinee still lives to the end of the
          statement, and neither changes locals or fields.
        </>
      ),
      duration: 5.6,
      Visual: S.TwoChanges,
    },
    {
      title: 'c.borrow().len() as a tail expression',
      body: (
        <>
          The Edition Guide's <code>RefCell</code> example (a cell whose borrow rules are checked at run time; <code>borrow()</code> returns a guard that holds a borrow of <code>c</code> and releases it in{' '}
          <code>Drop</code>; Chapter 4):
          the guard is a temporary in the tail expression of <code>f</code>. Which editions compile it?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Compiles under both editions' },
          { label: 'Compiles under 2021 only' },
          { label: 'Compiles under 2024 only', correct: true },
          { label: "Compiles under neither: a borrow can't be a tail" },
        ],
        explain: (
          <>
            2024 only. <code>c.borrow()</code> returns a <code>Ref</code> guard whose destructor touches <code>c</code>. Under 2021 that temporary outlived the
            block's locals, so <code>c</code> was dropped first: E0597, "<code>c</code> does not live long enough". Under 2024 the temporary drops before{' '}
            <code>c</code> and it compiles. The narrowing cuts both ways: <code>{'let x = { &String::from("1234") }.len();'}</code> compiled under 2021 and is E0716
            under 2024; lift the block into a <code>let</code>.
          </>
        ),
      },
      Visual: S.TailRefCell,
    },
    {
      title: 'Drop flags: when only the run knows',
      body: (
        <>
          The previous topic left this open: a value moved on one path compiles, so how does the brace know whether to drop it? When initialization is statically
          known (straight-line code, or branches that agree) the compiler emits an unconditional drop or none. When it is not, Rust keeps a run-time{' '}
          <strong>drop flag</strong> for that variable, toggled as it becomes initialized or moved-from and checked at scope exit; the flag is a hidden boolean local (<code>_5</code> in the MIR; the Nomicon's unoptimised picture keeps it on the stack). You
          can see it in the MIR: <code>const true</code>, <code>const false</code>, <code>switchInt</code>. Partial moves use the same machinery per field: next
          topic.
        </>
      ),
      duration: 4.8,
      Visual: S.DropFlags,
    },
    {
      title: 'Unwinding drops; exit does not',
      body: (
        <>
          Destructors run on the normal path and during <strong>unwinding</strong>: a <code>panic!</code> peels every frame it passes, in the same reverse order,
          before the thread dies (exit code 101 for <code>main</code>). They do <strong>not</strong> run when the process ends without unwinding:{' '}
          <code>std::process::exit</code>, <code>std::process::abort</code>, or a panic under <code>panic = "abort"</code>. So a <code>SpillFile</code> is cleaned
          up after a panic but not after <code>exit(3)</code>. And when <code>main</code> returns, every other thread dies where it stands, its
          destructors unrun (measured). And a destructor that panics while already unwinding aborts the process; keep <code>Drop</code>{' '}
          bodies infallible.
        </>
      ),
      duration: 4.6,
      Visual: S.Unwinding,
    },
    {
      title: 'mem::forget: the destructor you skip',
      body: (
        <>
          <code>std::mem::forget</code> takes ownership and forgets the value without running its destructor: the file stays open and on disk, the{' '}
          <code>PathBuf</code>'s heap buffer is never freed (the counting allocator shows allocations minus deallocations up by one), and it compiles in{' '}
          <strong>safe</strong> code. The std docs explain why: Rust's safety guarantees do not include a guarantee that destructors always run; a program can
          build an <code>Rc</code> cycle (shared ownership by reference count; Chapter 4) or call <code>process::exit</code> without any <code>unsafe</code>, so
          allowing <code>forget</code> changes nothing fundamental. Leaking is usually a bug, but it is a memory-<em>safe</em> bug.
        </>
      ),
      duration: 5.0,
      Visual: S.Forget,
    },
    {
      title: 'Which of these needs unsafe?',
      body: (
        <>
          Four ways to end up with a value that is never dropped are drawn here: <code>mem::forget</code>, <code>Box::leak</code>, an <code>Rc</code>{' '}
          cycle and <code>process::exit</code>. Which of the first three needs <code>unsafe</code>, if any?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'mem::forget' }, { label: 'Box::leak' }, { label: 'An Rc cycle' }, { label: 'None of them', correct: true }],
        explain: (
          <>
            None. Leaking a value is safe, so each is a safe function or safe code: <code>forget</code> consumes it; <code>Box::leak</code> consumes the box and
            returns a <code>&amp;mut T</code> for data meant to live until exit; an <code>Rc</code> cycle is never freed; <code>exit</code> runs no destructors.
            What <em>is</em> <code>unsafe</code> is <code>ManuallyDrop::drop</code>: running a destructor by hand, because nothing stops a second run or a later
            use.
          </>
        ),
      },
      Visual: S.WhichUnsafe,
    },
    {
      title: 'ManuallyDrop and Box::leak, on purpose',
      body: (
        <>
          Two honest ways to skip a destructor. <code>{'ManuallyDrop<T>'}</code> is a zero-cost wrapper with the same layout as <code>T</code> that stops the
          compiler from dropping the inner value; <code>ManuallyDrop::into_inner</code> hands the value back so it can be dropped, and{' '}
          <code>ManuallyDrop::drop</code> is <code>unsafe</code> because a dropped "zombie" must never reach safe code or be dropped twice. <code>Box::leak</code>{' '}
          consumes a box and returns <code>&amp;mut T</code>, for data that should live for the rest of the program; if it should ever be freed, use{' '}
          <code>Box::into_raw</code> instead. Neither fixes drop <em>order</em>: for that, reorder declarations.
        </>
      ),
      duration: 4.4,
      Visual: S.OnPurpose,
    },
    {
      title: 'The leakpocalypse of 2015',
      body: (
        <>
          Just before Rust 1.0, <code>thread::scoped</code> let a child thread borrow its parent's stack: it returned a <code>JoinGuard</code> whose{' '}
          <code>Drop</code> joined the child, so the parent could not pop the frame first. In principle this totally works, as the Rustonomicon puts it, except it
          relies on a destructor being called. An <code>Rc</code> cycle leaked the guard in safe code, the child ran on with a reference into a dead frame, and the
          API was found unsound. The fix was not to forbid leaks but to admit them: RFC 1066 removed <code>unsafe</code> from <code>mem::forget</code> and stated
          that it has never been a guarantee of Rust that destructors run. The community called it the "Leakpocalypse".
        </>
      ),
      duration: 5.6,
      Visual: S.Leakpocalypse,
    },
    {
      title: 'Leak-safe: join in a call, not in a Drop',
      body: (
        <>
          std's later design, <code>std::thread::scope</code> (stable since 1.63), moves the guarantee out of a destructor and into a function: all threads
          spawned within the scope that have not been joined are joined before <code>scope</code> returns, so the borrowed data outlives them whatever the caller
          does with the handles. A return cannot be forgotten. The general rule: safe code may assume leaks don't happen, but <strong>unsafe code cannot rely on
          destructors running</strong>. Proxy types such as <code>Drain</code> put the owner into a consistent state <em>before</em> handing out the proxy, so a
          leak only amplifies into more leaks: std promises nothing is freed twice, not which elements survive. Using <code>thread::scope</code> for real is Chapter 2.
        </>
      ),
      duration: 5.0,
      Visual: S.JoinInCall,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          A function with a parameter <code>a</code>, a tuple-pattern parameter <code>(b, c)</code> and one local <code>d</code>. In what order do the four values
          drop?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'd, c, b, a', correct: true }, { label: 'd, a, b, c' }, { label: 'd, b, c, a' }, { label: 'a, b, c, d' }],
        explain: (
          <>
            <code>d</code>, <code>c</code>, <code>b</code>, <code>a</code>. The body's local goes first. Parameters are in the function's outermost scope, so they
            drop last, in reverse order: the tuple parameter before <code>a</code>; within it the pattern bindings drop in reverse declaration order,{' '}
            <code>c</code> then <code>b</code>. The Reference's own example prints <code>3 2 0 1</code> for the same reasons. Or-patterns use the first
            alternative's order.
          </>
        ),
      },
      Visual: S.ProveParams,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          Does the increment run with the lock held? Here <code>lock</code> is a plain mutex around state it does not hold (<code>RwLock&lt;()&gt;</code>).{' '}
          <code>let _ = lock.write().unwrap();</code> followed by <code>shared += 1;</code>. What happens?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Held: the guard lives to the end of the block' },
          { label: 'Released at the semicolon; the increment runs unlocked' },
          { label: 'rustc refuses to compile it (a deny-by-default lint)', correct: true },
          { label: "E0040: a guard can't be dropped like that" },
        ],
        explain: (
          <>
            rustc stops you: <code>non-binding let on a synchronization lock</code>, the <code>let_underscore_lock</code> lint, deny by default. The reason is
            option two: <code>_</code> binds nothing, so the guard is a temporary dropped at the semicolon and <code>shared += 1</code> runs with the lock
            released. <code>let _g = …</code> binds and holds the guard to the end of the block. <code>let _ = g;</code> where <code>g</code> is already a binding
            moves nothing, so <code>g</code> stays held.
          </>
        ),
      },
      Visual: S.ProveWild,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          A code review. A proposed API hands out a <code>DmaGuard</code> that <em>must</em> be dropped for memory safety: its <code>Drop</code> stops the device
          that is writing into the borrowed buffer. Is the API sound?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Sound: Drop is guaranteed for a value that is not Copy' },
          { label: 'Sound if DmaGuard is !Unpin' },
          { label: 'Unsound: a safe caller can mem::forget the guard while the device still writes into buf', correct: true },
          { label: 'Sound: the guard borrows buf, so buf outlives the device' },
        ],
        explain: (
          <>
            Unsound. A safe caller may <code>mem::forget</code> the guard: the borrow ends, <code>buf</code> is freed or reused, and the device keeps writing into
            it. The Reference's rule: apart from the places it guarantees, types may not rely on a destructor running for soundness. Redesign like{' '}
            <code>thread::scope</code>: <code>with_dma(buf, f)</code> (where <code>f: impl FnOnce(&amp;Dma)</code> is a closure argument that is called once) starts the device, runs <code>f</code>, and stops the device before it returns; a return
            cannot be skipped.
          </>
        ),
      },
      Visual: S.ProveDesign,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Six things to keep. A destructor is <code>Drop::drop</code> and then the fields, in order; locals go in reverse; a temporary dies at its semicolon, and
          Rust 2024 ends <code>if let</code> scrutinee and tail-expression temporaries sooner; a RAII wrapper never releases twice, because there is one owner, and releases once whenever its destructor runs;
          leaking is safe, by <code>forget</code>, <code>ManuallyDrop</code>, <code>Box::leak</code>, a cycle or <code>exit</code>; so soundness may never depend
          on <code>Drop</code> running. A type with <code>Drop</code> keeps its fields until it dies. Next: how do you take one field out early, say to hand a
          buffer (<code>Buf</code>) back to its pool (<code>Pool</code>) from inside a guard? The compiler's first answer is E0509.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
