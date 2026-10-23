import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Four places, and only four, change which thread owns a value: thread::spawn, thread::scope,
// tokio::spawn, and a channel send. Every measured number (27, 60, 29, 2) and the one real
// compiler error are executed by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux; the
// tokio example is built via cargo).
const reel: Reel = {
  steps: [
    {
      title: "Four places, and only four, change which thread owns a value",
      body: (
        <>
          Spawning a plain thread, spawning a scoped one, spawning a task, or sending through a channel. That's the whole list.
        </>
      ),
      duration: 2.8,
      Visual: S.FourPlacesHook,
    },
    {
      title: 'Move a String into a new thread — does the caller still have it after?',
      body: (
        <>
          The closure captures the String with `move` and is handed to a brand new thread.
        </>
      ),
      duration: 2.2,
      predict: {
        options: [
          { label: 'Yes — Rust clones it automatically for the new thread' },
          { label: "No — ownership moved for good; the caller can't touch it again", correct: true },
          { label: 'Only if `.clone()` was forgotten in the closure' },
        ],
        explain: (
          <>
            No. `move` means exactly that — the String's ownership crosses to the new thread, and the caller has nothing left to touch.
          </>
        ),
      },
      Visual: S.MoveStringPredict,
    },
    {
      title: "Moved for good: the new thread owns it, the caller can't",
      body: (
        <>
          The new thread computes the moved String's own length and hands that back through the join handle.
        </>
      ),
      duration: 2.8,
      Visual: S.MovedForGoodReveal,
    },
    {
      title: 'Try to only borrow, not move, into a plain spawn',
      body: (
        <>
          The identical shape, but the closure borrows the data instead of taking it.
        </>
      ),
      duration: 3.0,
      takeaway: "A plain thread::spawn needs Send + 'static — the new thread may outlive the function that spawned it.",
      Visual: S.BorrowFailsReveal,
    },
    {
      title: "thread::scope makes the identical borrow sound",
      body: (
        <>
          The same borrow, now inside a scope that promises every spawned thread joins before it returns.
        </>
      ),
      duration: 3.0,
      takeaway: "thread::scope can relax 'static because it guarantees every spawned thread joins before the scope itself returns.",
      Visual: S.ScopeBorrowsReveal,
    },
    {
      title: "tokio::spawn asks for the identical Send + 'static contract",
      body: (
        <>
          The same two bounds, now written on a Future instead of a closure.
        </>
      ),
      duration: 2.2,
      predict: {
        options: [
          { label: "Yes — a task stays on the thread that spawned it by default" },
          { label: "No — the identical bound applies, on the Future this time", correct: true },
          { label: 'Only on a multi-thread runtime, never a single-threaded one' },
        ],
        explain: (
          <>
            No. The bound is identical, and for the identical reason — the runtime, not the caller, decides which thread the task actually runs on.
          </>
        ),
      },
      Visual: S.TokioSpawnPredict,
    },
    {
      title: 'Same contract, same reason: the runtime may move the task',
      body: (
        <>
          A spawned task may run on the thread that spawned it, or on an entirely different one — the runtime's call, not the caller's.
        </>
      ),
      duration: 3.2,
      takeaway: "tokio::spawn's Send + 'static bound exists for the same reason thread::spawn's does: the runtime decides which thread runs the task.",
      Visual: S.TokioSpawnReveal,
    },
    {
      title: 'A channel send is the fourth crossing point',
      body: (
        <>
          Two producer threads, cloned senders, one receiver — std::sync::mpsc's own shape.
        </>
      ),
      duration: 3.0,
      takeaway: "Sending a value through a channel moves its ownership from the sender's thread to whichever thread eventually calls recv.",
      Visual: S.ChannelSendReveal,
    },
    {
      title: "That channel's own implementation is borrowed, not built from scratch",
      body: (
        <>
          The standard library's own source comment, naming exactly where this channel's real algorithm comes from.
        </>
      ),
      duration: 3.0,
      takeaway: "std::sync::mpsc is a real port of the crossbeam-channel crate's algorithm — reusing a proven design, not reinventing one.",
      Visual: S.CrossbeamSourceReveal,
    },
    {
      title: 'Recap: where ownership crosses a thread boundary',
      body: (
        <>
          Spawn, scope, spawn a task, or send. Two need Send and 'static; one trades that for a join guarantee; the channel itself is a borrowed design.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
