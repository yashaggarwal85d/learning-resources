import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: a header struct whose fields borrow straight out of the input buffer; why that
// borrow can never outlive the buffer; Cow deferring its clone until mutation; bytes::Bytes
// escaping scope by owning a refcounted share instead of borrowing; why a self-referencing struct
// needs yoke/ouroboros. Every snippet and claim is executed by examples.py through a small cargo
// crate (rustc, current stable edition, x86_64 Linux; bytes and ouroboros from crates.io).
const reel: Reel = {
  steps: [
    {
      title: 'A parser that copies nothing',
      body: (
        <>
          <code>struct Header&lt;'a&gt;</code> holds two fields, <code>magic</code> and <code>name</code>, both{' '}
          <code>&amp;'a [u8]</code>. Parsing a buffer into a <code>Header</code> never copies a single byte: every
          field is a subslice of the caller's own memory.
        </>
      ),
      duration: 3.4,
      takeaway: "Every field of Header points straight into the caller's own bytes.",
      Visual: S.NoCopy,
    },
    {
      title: 'Does Header outlive the buffer it was parsed from?',
      body: (
        <>
          Suppose a function allocates its own buffer as a local <code>Vec&lt;u8&gt;</code>, parses it, and tries to
          return the <code>Header</code>. Does that compile?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'Yes, the buffer outlives the call' },
          { label: 'No: the borrow cannot outlive the Vec', correct: true },
          { label: 'Yes, but only in release mode' },
          { label: "No, but only because of Header's name" },
        ],
        explain: (
          <>
            A borrow can never outlive what it borrows from. The <code>Vec&lt;u8&gt;</code> is dropped at the end of
            the function, so any <code>Header</code> pointing into it would dangle — the compiler refuses before
            that can happen.
          </>
        ),
      },
      Visual: S.OutlivesQuestion,
    },
    {
      title: 'The attempt, and the error it earns',
      body: (
        <>
          <code>fn make_and_borrow() -&gt; &amp;[u8]</code> builds a local <code>Vec&lt;u8&gt;</code> and returns a
          slice of it. The real compiler message: <code>E0515</code>, cannot return value referencing local
          variable.
        </>
      ),
      duration: 3.2,
      Visual: S.OutlivesFail,
    },
    {
      title: 'Cow: borrowed until something needs to change',
      body: (
        <>
          The standard library's own <code>abs_all</code> example takes a <code>Cow&lt;'_, [i32]&gt;</code> and
          flips any negative value's sign. Run it on data that is already non-negative and it never clones.
        </>
      ),
      duration: 3.4,
      takeaway: 'A Cow clones exactly once, the first time to_mut is actually called.',
      Visual: S.CowBorrowed,
    },
    {
      title: 'Which call actually clones?',
      body: (
        <>
          Call <code>abs_all</code> on <code>[0, 1, 2]</code>, then separately on <code>[-1, 0, 1]</code>. One of
          these two calls clones the slice into an owned <code>Vec</code>; the other leaves the <code>Cow</code>{' '}
          borrowed the whole time.
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'Only the call on [-1, 0, 1]', correct: true },
          { label: 'Only the call on [0, 1, 2]' },
          { label: 'Both calls clone' },
          { label: 'Neither call clones' },
        ],
        explain: (
          <>
            <code>[0, 1, 2]</code> has nothing to flip, so <code>to_mut</code> is never called and the{' '}
            <code>Cow</code> stays <code>Borrowed</code>. <code>[-1, 0, 1]</code> has a negative value, so{' '}
            <code>to_mut</code> clones into an owned <code>Vec</code> the moment it is first called.
          </>
        ),
      },
      Visual: S.CowOwned,
    },
    {
      title: 'bytes::Bytes: owning the share, not borrowing it',
      body: (
        <>
          A function builds an owned <code>Vec&lt;u8&gt;</code>, wraps it in a <code>Bytes</code>, and returns it
          freely. Cloning that <code>Bytes</code> only bumps a reference count; slicing it only narrows the view —
          neither copies a byte.
        </>
      ),
      duration: 3.6,
      takeaway: "Bytes escapes the scope a plain borrow can't, by owning a shared handle instead of borrowing one.",
      Visual: S.BytesShare,
    },
    {
      title: 'A struct that borrows its own field',
      body: (
        <>
          <code>struct Parsed&lt;'a&gt;</code> holds an owned <code>String</code> and a <code>&amp;'a str</code>{' '}
          meant to borrow it. Building both together and returning them: <code>E0515</code> and{' '}
          <code>E0505</code>, two real errors, one attempt.
        </>
      ),
      duration: 3.6,
      takeaway: 'Plain Rust refuses to let a struct hold a reference into one of its own fields.',
      Visual: S.SelfRefFail,
    },
    {
      title: 'ouroboros makes the same shape safe',
      body: (
        <>
          The identical shape — an owned <code>String</code> field, a <code>&amp;'this str</code> field borrowing
          it — annotated <code>#[self_referencing]</code> with <code>#[borrows(owner)]</code> on the view field.
          Does this version compile?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, via a generated builder', correct: true },
          { label: 'No, the same two errors recur' },
          { label: 'Only with #[derive(Clone)]' },
          { label: 'Only inside an unsafe block written by hand' },
        ],
        explain: (
          <>
            It compiles: the macro replaces the struct with one built through a generated{' '}
            <code>ParsedBuilder</code>, whose <code>view_builder</code> closure receives a reference to the stored{' '}
            <code>owner</code> field after it has already settled into its final, stable place.
          </>
        ),
      },
      Visual: S.OuroborosWorks,
    },
    {
      title: 'Why yoke and ouroboros exist at all',
      body: (
        <>
          <code>Yoke&lt;Y, C&gt;</code> attaches a zero-copy value to the "cart" it was built from, producing one
          value that moves around freely — described as erasing a static lifetime into a dynamic one, the way{' '}
          <code>dyn</code> erases a static type into a dynamic one.
        </>
      ),
      duration: 3.4,
      takeaway: 'These crates exist because self-referencing structs are genuinely useful, not because the checker is being unreasonable.',
      Visual: S.WhyYoke,
    },
    {
      title: 'Recap: borrowed, deferred, owned, or built with help',
      body: (
        <>
          A parsed view's fields point at the original buffer; a borrow can never outlive it. <code>Cow</code>{' '}
          defers its clone until mutation. <code>Bytes</code> escapes scope by owning a refcounted share.
          Self-referencing needs <code>yoke</code>, <code>ouroboros</code>, or careful <code>unsafe</code> — never
          plain references. Next: what happens when a borrow has to cross a thread or task boundary.
        </>
      ),
      duration: 2.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
