# Outline: Framing strategies and failure modes (`rust.framing-strategies-failure-modes`)

Chapter 16, topic 43 (second of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Measure that a real, minimal length-prefixed frame decoder correctly decodes a frame under its own cap, and that the extraction is genuinely zero-copy — `BytesMut::split_to`'s returned frame lands at the original payload's own address, not a fresh allocation.
2. Measure that a frame whose length prefix claims a size far over the decoder's own cap is rejected before any buffer anywhere near that claimed size is ever allocated — the real denial-of-service vector an uncapped length prefix creates, and the real fix for it.
3. State, from `tokio_util::codec`'s own documentation, what the `Decoder` trait's actual job is, and from `LengthDelimitedCodec`'s own documentation, what its own `max_frame_length` setting actually does to an oversized frame.
4. Explain, from the syllabus's own framing (length-prefix, delimiter-based, fixed-size), why each strategy fails differently, and why a length prefix specifically needs an explicit cap to be safe.

## Changes from the chapter plan

This topic's own executed example builds a minimal, self-contained length-prefixed decoder directly over `bytes::BytesMut`, rather than wiring up the full `tokio_util::codec::Decoder`/`Framed` trait machinery over a real async runtime — the claims being measured (a capped length decodes correctly with zero-copy extraction; an uncapped claim is rejected before allocation) are properties of the length-prefix-plus-cap pattern itself, which the minimal decoder demonstrates directly and verifiably, and `tokio_util::codec`'s own documentation is quoted directly for the `Decoder` trait's documented contract and `LengthDelimitedCodec`'s own documented cap behavior. Delimiter-based and fixed-size framing's own distinct failure modes (escaping cost, scan cost, wasted bandwidth) are described from first principles in the lesson step rather than measured, since this topic's own scope (per the chapter plan) is specifically the length-prefix strategy's own cap requirement, not a comparative benchmark of all three strategies.

## Reel steps (storyboard)

1. **"Build a real length-prefixed frame decoder with an explicit 1024-byte cap. Send it a frame whose length prefix honestly claims 1500 bytes. What happens?"** (predict, hook) — `fig`: a real decoder, a frame over the cap. Options: it decodes anyway, since 1500 isn't an unreasonable size / it's rejected immediately, before any large buffer is ever allocated (correct) / it silently truncates the frame to 1024 bytes.
2. **"Measured: a frame claiming a length over the cap was rejected immediately — no buffer anywhere near that claimed size was ever allocated to hold it"** — `fig`: the real, executed rejection. NO takeaway (the reel's swipe-test "from" step; a takeaway here reliably fails the phone caption-swipe check per QUALITY.md #64).
3. **"Now send a frame under the cap, and extract it with BytesMut::split_to. Does that extraction copy the payload's bytes into a new buffer, or not?"** (predict) — `fig`: a real decode, a real `split_to` call, the returned frame's own address checked against the original payload's address. Options: it copies, since the returned value is a separate, owned buffer / it doesn't copy — the same underlying bytes, just split (correct) / it depends on how large the frame is.
4. **"Measured: the extracted frame's own data pointer landed exactly where the payload started in the original buffer — not a fresh allocation. split_to's own O(1) claim, confirmed directly, not assumed"** — `fig`: the real, measured pointer comparison. Takeaway: "split_to splits the buffer in place; it was never going to copy the bytes just to hand them back to you."
5. **"tokio_util::codec's own documentation describes the Decoder trait's actual job. What does it say that job actually is?"** (predict) — `fig`: the documentation's own description. Options: to read bytes directly off the network socket itself / to turn a sequence of bytes into a sequence of frames, and find the boundaries between them (correct) / to encrypt and decrypt each frame's own contents.
6. **"The documentation's own words: the Decoder trait's job is to specify how sequences of bytes are turned into a sequence of frames, and to determine where the boundaries between frames are — exactly the problem a byte stream creates in the first place"** — `fig`: the `tokio_util::codec` quote, shown directly. NO takeaway (a connecting step restating the documented finding directly, not a new measured claim).
7. **"A length prefix needs a cap to be safe. What do delimiter-based framing and fixed-size framing each need instead, to avoid their own distinct failure modes?"** (predict) — `fig`: the three strategies, side by side. Options: delimiter-based needs the same cap a length prefix does / delimiter-based needs escaping for the delimiter itself inside the data, and a scan to find it; fixed-size wastes bandwidth on anything that doesn't fit exactly (correct) / fixed-size framing has no real failure mode at all.
8. **"Each framing strategy fails differently: a length prefix without a cap is a denial-of-service vector; a delimiter needs escaping wherever it could appear in the data, and costs a real scan to find; a fixed size wastes real bandwidth on anything smaller than it"** — `fig`: the three strategies and their three distinct costs, shown together. Takeaway: "There's no framing strategy without a cost — the only choice is which cost you're willing to pay."
9. **"A capped length prefix, extracted without copying: that's the shape every framing strategy in this chapter's lab is actually built around"** — `fig`: the capped decoder and its zero-copy extraction, shown together as the chapter's own chosen pattern. Takeaway: "Cap the claim, then split the buffer in place — that's a length prefix done safely and cheaply, both at once."
10. **Recap** — a length-prefixed frame under its own cap decodes correctly, and `split_to` extracts it without copying a single byte; a frame claiming a length over the cap is rejected before any buffer that large is ever allocated, which is the real denial-of-service vector an uncapped length prefix creates; and each of the three framing strategies the syllabus names fails in its own distinct way, so the real choice is which cost a given protocol can afford to pay. Handoff: a framing strategy gets you discrete messages back out of a byte stream, but it says nothing about what happens when messages arrive, or need to be sent, faster than the other side can keep up.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7.
- Surprising fact: step 2 (an oversized frame is rejected before any large buffer is ever allocated — the cap check runs before allocation, not after).
- Takeaways: steps 4, 8, 9 (three — step 2 deliberately has none, being the swipe test's "from" step; step 6 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| the job of the Decoder trait is to specify how sequences of bytes are turned into a sequence of frames, and to determine where the boundaries between frames are | `tokio_util::codec` module docs (quoted) |
| max_frame_length is the largest size a LengthDelimitedCodec will accept from the wire; larger frames will be rejected | `tokio_util::codec::length_delimited::LengthDelimitedCodec` docs (quoted) |
| BytesMut::split_to splits the buffer into two at the given index; this is an O(1) operation that just increases the reference count and sets a few indices | `bytes::BytesMut` docs (quoted) |
| a frame under a decoder's own cap decodes to exactly its original payload, and the extracted frame's own data pointer lands at the original payload's own address, not a fresh allocation | `examples/runtime-demo/src/capped_length_prefix_framing.rs` (executed, measured) |
| a frame whose length prefix claims a size far over a decoder's own cap is rejected before any buffer anywhere near that claimed size is ever allocated | `examples/runtime-demo/src/capped_length_prefix_framing.rs` (executed, measured) |

## Concept ledger

- `introduces`: `length-prefix-framing-dos-cap`, `zero-copy-frame-extraction` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `tcp-byte-stream-partial-io`, `nagle-delayed-ack-half-close`
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "TCP delivers bytes, not messages — turning that stream back into discrete messages again is an explicit choice, and each way of making that choice fails differently if you're not careful."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "A framing strategy gets you discrete messages back out of a byte stream, but it says nothing about what happens when messages arrive, or need to be sent, faster than the other side can keep up."
