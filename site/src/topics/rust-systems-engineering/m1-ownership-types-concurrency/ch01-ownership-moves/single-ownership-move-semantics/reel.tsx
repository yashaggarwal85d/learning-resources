import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: one value, one owner, one destruction. Every snippet and every number is executed by examples.py
// (rustc 1.97.0, edition 2024, x86_64 Linux; g++ for the C++ comparison).
const reel: Reel = {
  steps: [
    {
      title: 'It compiled after one .clone()',
      body: (
        <>
          An ingest service ships 1,000,000-byte batches. <code>ship(batch)</code> was rejected with error E0382, and the review accepted the compiler's own
          suggestion: <code>.clone()</code>. It works, and every batch now pays one extra allocation and a 1,000,000-byte copy. By the end you'll know why
          Rust refused, and two fixes that copy nothing. Along the way: what every assignment really copies, signatures as ownership contracts, and how to read
          E0382 and E0505.
        </>
      ),
      duration: 4.6,
      Visual: S.Problem,
    },
    {
      title: 'What does let s2 = s1 copy?',
      body: (
        <>
          A <code>String</code> is a small header on the stack (a pointer, a length and a capacity) pointing at text on the heap. What does{' '}
          <code>let s2 = s1;</code> copy?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'Nothing: s2 is just another name for s1' },
          { label: 'The 24-byte header; the 5 heap bytes stay put', correct: true },
          { label: 'The header and the 5 heap bytes (a deep copy)' },
          { label: 'Only the 8-byte pointer' },
        ],
        explain: (
          <>
            <code>s2</code> gets a bit-for-bit copy of the 24-byte header (pointer, length, capacity on a 64-bit target); the 5 heap bytes are not copied. (The
            optimiser may even skip copying the header; it never copies the heap bytes.) Then Rust treats <code>s1</code> as no longer valid. A shallow copy plus
            an invalidated source is what Rust calls a <b>move</b>.
          </>
        ),
      },
      Visual: S.CopyHeader,
    },
    {
      title: 'Two owners would free twice',
      body: (
        <>
          Why must <code>s1</code> die? If both bindings owned the buffer, both would free it at the closing brace: a double free, the classic memory bug (CWE-415)
          that can corrupt the allocator. So after <code>let s2 = s1;</code> Rust considers <code>s1</code> no longer valid and doesn't free anything for it. One
          owner, one drop, and the rule is checked at compile time.
        </>
      ),
      duration: 5.4,
      Visual: S.DoubleFree,
    },
    {
      title: 'Proof: the buffer never moved',
      body: (
        <>
          Measured, not assumed. Moving a 1,000,000-byte <code>Vec</code> into <code>ship</code> copied its 24-byte header to a new address (the one{' '}
          <code>ship</code> sees for its parameter); the heap pointer, length and capacity are unchanged, and a counting global allocator saw 0 allocations.{' '}
          <code>clone()</code> made 1 allocation of 1,000,000 bytes at a new address. Rust never makes a deep copy unless you write <code>.clone()</code>.
        </>
      ),
      duration: 5.0,
      Visual: S.Proof,
    },
    {
      title: 'Can a moved-out variable come back?',
      body: (
        <>
          Validity belongs to the variable at each point of the program, not to the value. After <code>let t = s;</code> the variable <code>s</code> is
          deinitialized. What happens on line 3?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'E0382: s was moved, it is gone for good' },
          { label: 'Compiles and prints: second first', correct: true },
          { label: 'Compiles and prints: first first' },
          { label: 'Compiles only with s.clone()' },
        ],
        explain: (
          <>
            It compiles and prints <code>second first</code>. A move deinitializes the place <code>s</code>; it can't be read until it is assigned again (which
            needs <code>let mut</code>; without it, E0384), and then it's an ordinary variable. Assigning to a deinitialized place drops nothing, because nothing
            is there. <code>t</code> owns <code>first</code>.
          </>
        ),
      },
      Visual: S.Reinit,
    },
    {
      title: 'C++ std::move leaves a shell',
      body: (
        <>
          In C++, <code>std::move(a)</code> is only a cast to an rvalue reference. The move constructor you write steals the buffer and must null out{' '}
          <code>a</code>'s pointer, because <code>a</code> stays alive: a moved-from <code>std::string</code> is "valid but unspecified", you may still use it,
          and its destructor still runs at the end of the block. Run both: C++ calls the destructor twice, once on an empty shell; Rust drops once. A Rust move
          runs no user code at all: the bytes are copied and the compiler stops letting you use the source.
        </>
      ),
      duration: 5.6,
      Visual: S.CppShell,
    },
    {
      title: 'One line, six meanings',
      body: (
        <>
          Python, Java and Go copy a reference or a slice, so both names stay usable and alias one object. C++ copy-construction gives <code>b</code> its own copy of
          the string; <code>std::move</code> steals it and leaves <code>a</code> valid but unspecified. Rust copies the same few bytes a shallow copy would, and
          ends <code>a</code>, so there is still exactly one owner. The std docs put it exactly: the only difference between a copy and a move is whether you may
          still use the source.
        </>
      ),
      duration: 4.2,
      Visual: S.SixMeanings,
    },
    {
      title: 'Copy: when the bits are the whole value',
      body: (
        <>
          <code>Copy</code> marks types whose bits are the whole value: integers, floats, <code>bool</code>, <code>char</code>, and arrays and tuples of{' '}
          <code>Copy</code> types. Assigning one duplicates it and the source stays valid; the copy is always a plain bitwise copy, never your code. A type can be{' '}
          <code>Copy</code> only if every field is. <code>&amp;T</code> is <code>Copy</code> (copying a shared reference is harmless); <code>&amp;mut T</code>{' '}
          never is, because two copies would be two mutable aliases. Under the hood a copy and a move copy the same bits; the only difference is whether the source
          stays usable.
        </>
      ),
      duration: 5.2,
      Visual: S.CopySieve,
    },
    {
      title: 'A file descriptor that is just an i32',
      body: (
        <>
          A wrapper around an integer handle, with a destructor that closes it. The integer is plain bits, so does this compile?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Yes: it is just an i32' },
          { label: 'No: E0184, Copy is not allowed on a type with a destructor', correct: true },
          { label: 'Yes, and drop runs once per copy' },
          { label: 'Only if Clone is written by hand' },
        ],
        explain: (
          <>
            E0184. A type with <code>Drop</code> manages something beyond its own bytes (here, a descriptor to close), so a bitwise copy would duplicate that
            responsibility: two copies, two closes. <code>Copy</code> and <code>Drop</code> are mutually exclusive, so any type with a destructor, or with a field
            that has one, always moves. You'll build exactly this wrapper properly in the next topic.
          </>
        ),
      },
      Visual: S.FdCopy,
    },
    {
      title: '.clone() is where the cost is',
      body: (
        <>
          Rust never deep-copies behind your back, so the expensive line is the one that says so. A copy and a move allocate nothing; <code>.clone()</code> on a{' '}
          <code>Vec</code> allocates a new buffer and copies every element. <code>Clone</code> is always explicit and may run arbitrary code, which is why the Book
          calls a <code>.clone()</code> call a visual signal that something costly may be happening. Search a hot path for <code>.clone()</code>, and for explicit
          cousins such as <code>to_vec()</code>, <code>to_owned()</code> and <code>to_string()</code>, to find its deep copies. (Not every clone is deep: cloning
          an <code>Rc</code> or <code>Arc</code> only bumps a count; that comes in Chapter 4.)
        </>
      ),
      duration: 4.6,
      Visual: S.CloneCost,
    },
    {
      title: 'Is a move always cheap?',
      body: (
        <>
          "Moves are free" is a slogan. Here a 4,096-byte struct is moved into a function after we took the address of its data. How many bytes does{' '}
          <code>take(b)</code> copy?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: '0: a move just renames, so it prints true' },
          { label: '8: a move passes a pointer' },
          { label: '4,096: the data lands at a new address, it prints false', correct: true },
          { label: '24: just a header' },
        ],
        explain: (
          <>
            A move is a bitwise copy of the whole value, <code>size_of::&lt;Big&gt;()</code> = 4,096 bytes. Here the data really does land at a new address: with
            rustc 1.97 it prints <code>false</code> at every optimisation level, because we took its address first. The optimiser may remove a copy, but nothing
            guarantees it: a function that only passes a <code>Big</code> on does a 4,096-byte <code>memcpy</code> in a debug build, and the optimised build drops
            that copy, but keeps it once the value's address has escaped. A move is always cheap only when the type is small, like <code>Vec</code>'s 24-byte
            header. Because Rust may relocate any value on a move without running code, never keep a raw pointer into a value you then move.
          </>
        ),
      },
      Visual: S.BigMove,
    },
    {
      title: 'Size decides the cost; Box caps it',
      body: (
        <>
          A move copies up to <code>size_of::&lt;T&gt;()</code> bytes, so its cost follows the type's inline size, not what it owns: a <code>Vec</code> with a
          million elements moves 24 bytes; a 65,536-byte array can cost all 65,536. <code>Box&lt;T&gt;</code> puts the <code>T</code> on the heap and owns it; for a
          sized <code>T</code> the box itself is a single pointer, so moving it copies 8 bytes however big <code>T</code> is. (A box of an unsized type, such as{' '}
          <code>Box&lt;[u8]&gt;</code>, is a 16-byte pointer plus length.) That's the Book's reason to box large data you pass around. Tap a type.
        </>
      ),
      duration: 3.6,
      Visual: S.SizeChooser,
    },
    {
      title: 'Signatures are ownership contracts',
      body: (
        <>
          A signature tells you what a call does to your value without opening the body. <code>T</code> takes ownership: the callee drops it, stores it or passes
          it on (if <code>T</code> is <code>Copy</code>, the callee gets a copy and you keep yours). <code>&amp;T</code> borrows for shared, normally read-only
          access (interior mutability, Chapter 4, is the exception), and any number of shared borrows may coexist. <code>&amp;mut T</code> borrows exclusively: while
          it's live, no other reference to the value may exist, which is what rules out data races at compile time. Returning <code>T</code> hands ownership back to
          the caller.
        </>
      ),
      duration: 6.0,
      Visual: S.Contracts,
    },
    {
      title: 'Methods sign the same contract',
      body: (
        <>
          Methods state the same contract in their receiver. <code>String::len</code> takes <code>&amp;self</code>, <code>push_str</code> takes{' '}
          <code>&amp;mut self</code>, and <code>into_bytes</code> takes <code>self</code>: it consumes the <code>String</code> and returns a <code>Vec&lt;u8&gt;</code>{' '}
          built on the same buffer (measured: same pointer, 0 allocations). A by-value <code>self</code> is how an API says "don't use the old value after this":{' '}
          <code>into_*</code> conversions, builders, state transitions. Even <code>+</code> is a contract: <code>String + &amp;str</code> consumes the left side and
          reuses its buffer.
        </>
      ),
      duration: 5.0,
      Visual: S.Methods,
    },
    {
      title: 'Which signature would you ship?',
      body: (
        <>
          Four plausible signatures for one job: <code>checksum</code> reads every byte, and the caller keeps using the batch afterwards. Which contract fits?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'fn checksum(b: Vec<u8>) -> u32' },
          { label: 'fn checksum(b: &[u8]) -> u32', correct: true },
          { label: 'fn checksum(b: &mut Vec<u8>) -> u32' },
          { label: 'fn checksum(b: Vec<u8>) -> (Vec<u8>, u32)' },
        ],
        explain: (
          <>
            Borrow: <code>&amp;[u8]</code>. Taking <code>Vec&lt;u8&gt;</code> consumes the batch, so the caller gets E0382 or pays for a clone. <code>&amp;mut</code>{' '}
            demands exclusive access the function doesn't need and forbids the caller from holding any other reference meanwhile. Returning the vector in a tuple
            works, but it's the clumsy pattern references exist to replace. A shared borrow reads without owning, and the caller keeps the batch.
          </>
        ),
      },
      Visual: S.WhichSignature,
    },
    {
      title: 'Reading E0382, span by span',
      body: (
        <>
          Read E0382 in three spans, in this order: why the value moved (its type isn't <code>Copy</code>), where it moved (the call), and the later use. Each
          span is a place to fix it: borrow at the move site, use the value before the move, or, only for plain data, make the type <code>Copy</code>. The note
          points at the parameter that takes ownership and suggests making it a borrow if owning isn't necessary: the signature may be wrong. The help line, clone,
          is the fix to reach for last.
        </>
      ),
      duration: 6.4,
      Visual: S.ReadE0382,
    },
    {
      title: 'E0505: a move inside a live borrow',
      body: (
        <>
          E0505: you tried to move a value while a borrow of it was still live. A plain reference's borrow lasts until its last use, not to the end of the block
          (that's what non-lexical lifetimes compute), so the cheapest fix is to finish with the reference before the move. The move would hand the buffer to{' '}
          <code>ship</code>, which frees it while <code>header</code> still points into it. rustc's help suggests cloning at the borrow,{' '}
          <code>&amp;batch.clone()[..4]</code>: copying 1,000,000 bytes to keep 4. Copying the 4 bytes into a <code>[u8; 4]</code> is the better copy.
        </>
      ),
      duration: 6.0,
      Visual: S.ReadE0505,
    },
    {
      title: 'A move inside a loop',
      body: (
        <>
          A loop is a path that comes back. <code>ship(batch)</code> takes the batch by value, and the loop runs it three times. What happens?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Ships the same batch 3 times' },
          { label: 'Compiles; later calls get an empty Vec' },
          { label: 'E0382: value moved here, in previous iteration of loop', correct: true },
          { label: 'Panics on the second iteration' },
        ],
        explain: (
          <>
            E0382, at compile time. The check follows every path, and the path round the loop reaches <code>ship(batch)</code> a second time with{' '}
            <code>batch</code> already moved. Borrow (<code>fn ship(b: &amp;[u8])</code>), build a fresh batch inside the loop, or clone per iteration if each send
            truly must own its copy: 3 allocations for 3 laps. The same rule makes <code>for s in v</code> consume <code>v</code>: a <code>for</code> loop calls{' '}
            <code>IntoIterator::into_iter(v)</code>; iterate <code>&amp;v</code> to borrow.
          </>
        ),
      },
      Visual: S.LoopMove,
    },
    {
      title: 'Back to the batch',
      body: (
        <>
          Read the original error by its spans: <code>Vec&lt;u8&gt;</code> isn't <code>Copy</code> (and shouldn't be), it moved at <code>ship(batch)</code>, and it
          was used after. If <code>ship</code> only reads, the signature was wrong: take <code>&amp;[u8]</code>, pass <code>&amp;batch</code>: 0 allocations, 0
          bytes copied. If <code>ship</code> must own the batch, say to hand it to a writer thread, read the length first and move last: also 0. The clone was
          correct code paying 1 allocation and 1,000,000 bytes per batch for nothing.
        </>
      ),
      duration: 5.6,
      Visual: S.BackToBatch,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          Run without arguments, <code>retry</code> is false. What happens?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Compiles; fine whenever retry is false' },
          { label: 'E0382: batch is moved on one path', correct: true },
          { label: 'Compiles; panics when retry is true' },
          { label: 'Compiles; prints 0 when retry is true' },
        ],
        explain: (
          <>
            E0382 at compile time, whatever <code>retry</code> is at run time. Moves are checked on every path: a value moved on any path that reaches the{' '}
            <code>println!</code> counts as moved there. Delete the <code>println!</code> and it compiles: Rust then tracks at run time whether{' '}
            <code>batch</code> still needs freeing at the end of the scope (a hidden drop flag, next topic).
          </>
        ),
      },
      Visual: S.ProveMaybeMoved,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          Line 1 allocates the buffer. How many heap allocations do lines 2 to 4 add?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: '0' },
          { label: '1 allocation, 1,000,000 bytes', correct: true },
          { label: '2 allocations, 2,000,000 bytes' },
          { label: '3 allocations, 3,000,000 bytes' },
        ],
        explain: (
          <>
            One. <code>let b = a</code> and <code>let d = c</code> are moves: at most 24 bytes each, no allocation. Only <code>b.clone()</code> allocates, once,
            1,000,000 bytes. Here, count the <code>.clone()</code> calls and you've counted the deep copies (elsewhere also look for <code>to_vec()</code>,{' '}
            <code>to_owned()</code> and friends).
          </>
        ),
      },
      Visual: S.ProveCost,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          <code>process(cfg: Config)</code> only reads the three numbers, and E0382 fires on the second lap. Which fix fits this type best?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: '#[derive(Clone)] and pass cfg.clone()' },
          { label: '#[derive(Clone, Copy)] on Config', correct: true },
          { label: 'Wrap it in Rc<Config>' },
          { label: 'Change the parameter to &mut Config' },
        ],
        explain: (
          <>
            Derive <code>Copy</code>. <code>Config</code> is 12 bytes of plain numbers and owns nothing, so it can be <code>Copy</code>, and the std docs' advice
            is that a type that can be <code>Copy</code> generally should be: each call gets its own bitwise copy, no move, no clone call. <code>.clone()</code>{' '}
            would do the same work behind a call that suggests a cost; <code>Rc</code> adds a heap allocation and a count; <code>&amp;mut</code> demands exclusivity
            for a read. One caution: <code>Copy</code> is part of a public type's API, so if <code>Config</code> might gain a <code>String</code> later, take{' '}
            <code>&amp;Config</code> instead.
          </>
        ),
      },
      Visual: S.ProveCopyConfig,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Six things to keep. Ownership decides who destroys a value; the next topic is about exactly when: drop order, temporaries, and why leaking memory is still
          safe.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
