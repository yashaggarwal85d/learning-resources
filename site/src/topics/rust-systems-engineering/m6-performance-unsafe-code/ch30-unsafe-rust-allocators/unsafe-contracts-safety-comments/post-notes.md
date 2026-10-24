---
title: "Unsafe contracts and safety comments"
---

## Outcomes

- Build a real, documented unsafe function (a real `# Safety` contract) and a real safe guard that checks its own precondition before ever delegating to it, since this topic must never execute a real invalid case to demonstrate undefined behavior.
- Measure that every real call within the documented contract genuinely returns the correct value.
- Measure that the real safe guard genuinely never invokes the unsafe function outside its own contract, which is exactly what soundness ("no safe caller can trigger UB") requires.
- Measure, without ever actually calling the unsafe function out of contract, that an unguarded caller's own logic would genuinely have violated the identical documented contract for the identical invalid input.
- State, from the Rust Reference's own "Behavior considered undefined" page and from the Rust API Guidelines' own documentation page, the real rules this topic's own code measures directly.

## Internals

Unsafe code must genuinely prove six real properties before it can be called sound: validity (every value it constructs is a legal bit pattern of its type), aliasing (it never lets two references violate Rust's own exclusivity rules), initialization (it never reads memory that was never written), lifetime (every reference it holds genuinely outlives its own use), alignment (every pointer it dereferences genuinely satisfies its type's own alignment requirement), and thread-safety (it never lets two threads race on the identical memory without real synchronization). This topic's own guard proves exactly one of the six (initialization and bounds, via the array-length check) directly in code; the other five get their own full, direct treatment in topic 78. Rust 2024 also changed one real default here: `unsafe_op_in_unsafe_fn` now warns unless every individual unsafe operation inside an unsafe function's own body is wrapped in its own explicit `unsafe { }` block, which is exactly why this topic's own `get_unchecked_counted` wraps its one real unsafe operation in its own block, with its own `// SAFETY:` comment, even though the whole function is already marked unsafe.

## In production

"This is faster" is a real, common justification for reaching for `unsafe`, and the syllabus's own rule states directly why it is not a safety argument on its own: speed is a claim about performance, which Chapter 29 measured, while soundness is a claim about whether any safe caller can ever reach undefined behavior, which this chapter measures; a function can be both fast and sound, or fast and unsound, and only a real, documented contract plus a real enforcing guard (or an equivalent, checked invariant) decides which. Clippy's own `undocumented_unsafe_blocks` lint enforces the syntactic half of this discipline automatically: it fails the build on any `unsafe { }` block with no `// SAFETY:` comment above it, though it cannot check whether that comment's own claim is actually true, which is why a real safety review still has to read it.

## The frontier

This topic's own guard enforces one, specific real invariant (a bounds check) directly in ordinary safe code; the much larger question of what Rust's own undefined-behavior rules actually are, and how a validity invariant differs from a provenance rule, is this chapter's own next topic. All of this topic's own measured claims run entirely on plain in-memory Rust values and a plain `Cell<u64>` counter, with no file, network, root access, or actual undefined behavior executed.

## Where this goes next

A safe guard decides whether a caller is even allowed to reach the unsafe code; it says nothing yet about what, exactly, makes a value inside that unsafe code valid or invalid once a caller does reach it.
