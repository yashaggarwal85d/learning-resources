---
title: "Framing strategies and failure modes"
---

## Outcomes

- Measure that a real, minimal length-prefixed frame decoder correctly decodes a frame under its own cap, and that the extraction is genuinely zero-copy.
- Measure that a frame whose length prefix claims a size far over the decoder's own cap is rejected before any buffer anywhere near that claimed size is ever allocated.
- State, from `tokio_util::codec`'s own documentation, what the `Decoder` trait's actual job is, and what `LengthDelimitedCodec`'s own `max_frame_length` setting actually does to an oversized frame.
- Explain why length-prefix, delimiter-based, and fixed-size framing each fail differently, and why a length prefix specifically needs an explicit cap to be safe.

## Internals

The example's cap-rejection test deliberately claims a length of one billion bytes rather than a merely large but plausible one, so the claim ("rejected before any such buffer is allocated") is unambiguous: no implementation accident could allocate that much and still pass. The zero-copy claim is verified by comparing the extracted frame's own raw pointer against the original buffer's own payload address directly, not by citing `BytesMut`'s documentation and trusting it — a reference-count bump that happened to still copy bytes somewhere would technically still be an O(1) operation, so the pointer check is specifically what rules out a hidden copy the complexity claim alone wouldn't catch.

## In production

A length-prefixed frame is the fastest framing strategy to parse (no scanning, no escaping), which is exactly why it is also the one most likely to be used carelessly: without an explicit cap checked before any allocation, a single malicious or malformed length field is a direct path to a server allocating gigabytes for one connection. Delimiter-based framing avoids that specific failure but trades it for two others: the delimiter itself must be escaped wherever it could legitimately appear in the payload, and finding it costs a real scan proportional to how much data arrives before the delimiter does. Fixed-size framing avoids both of those costs but wastes real bandwidth on every message that doesn't happen to fill its slot exactly. None of the three is free; a protocol's real choice is which of these three costs it can afford to pay.

## The frontier

This topic's own executed example is a minimal, self-contained length-prefix decoder over `BytesMut` directly, not the full `tokio_util::codec::Decoder`/`Framed` trait machinery running over a real async runtime — the claims under test (capped decode correctness, zero-copy extraction, pre-allocation rejection) are properties of the length-prefix-plus-cap pattern itself, independent of which trait wraps it, so measuring them directly is both simpler and at least as strong a claim. Delimiter-based and fixed-size framing's own distinct costs are described from first principles rather than measured, since quantifying a scan's own cost or a fixed frame's own wasted bandwidth would need separate executed examples this topic's own scope does not call for. This topic deliberately stops at framing and does not yet address what happens when a connection produces or consumes faster than its peer can keep up — that is specifically the next topic's own scoped claim.

## Where this goes next

A framing strategy gets you discrete messages back out of a byte stream, but it says nothing about what happens when messages arrive, or need to be sent, faster than the other side can keep up.
