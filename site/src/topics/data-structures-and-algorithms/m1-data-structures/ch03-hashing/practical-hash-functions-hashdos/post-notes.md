---
id: dsa.practical-hash-functions-hashdos
title: Practical hash functions and HashDoS
---

<section data-section="outcomes">

## After this topic you can

- Name the cost/safety trade-off across non-cryptographic, keyed and cryptographic hashes, with one real example of each, and say which tier a real system (Rust's `std::HashMap`, `rustc`'s own compiler) actually chose and why.
- Explain the HashDoS mechanism: why a fast public hash over attacker-controlled keys degrades a hash table's expected O(1) lookup to worst-case O(n), measured, not just asserted.
- Explain why a per-process random seed defeats an attacker who must guess keys in advance, and why that alone is not the same guarantee as a cryptographically strong keyed hash (PRF) against an attacker who can query and time the server adaptively.

</section>

<section data-section="internals">

## Into the internals

### What a PRF actually promises, beyond "has a secret"

A pseudorandom function is formally defined, in the SipHash paper's own words, as a keyed function "indistinguishable from a uniform random function" — not merely one an outsider can't guess the key to, but one whose output, even after seeing many input/output pairs, teaches an attacker nothing usable about any other input. "Keyed" alone is a weaker property: the Crosby–Wallach proposal Aumasson and Bernstein's paper critiques, `H(m0, m1, ...) = m0·k0 + m1·k1 + ...`, is keyed — it has a secret — and still fails, because the function itself is linear. A linear function leaks its own structure: once an attacker has observed enough `(message, timing)` pairs through a side channel, the key coefficients become a solvable system of linear equations, "no matter how k0, k1, ... are chosen." SipHash's PRF strength is a claim about the function's *shape*, not just its key's secrecy — truncating a strong PRF's output (`H mod ℓ`) stays a strong PRF, and therefore a strong MAC, which is the actual property hash-flooding resistance needs.

### The timing side-channel, in plain prose

The attack this topic cites but doesn't build works like this: an attacker who knows one string already in the table can send a second string and measure how long the lookup takes. If the two strings collide under the weak hash (`mod ℓ`), the lookup walks a longer chain and takes measurably longer — a signal that, repeated and amplified by choosing which strings to send next, eventually reveals enough about the hash's internal coefficients to predict new collisions without ever seeing the key directly. This is a precise, citable claim from a primary source (the SipHash paper, §7), not a system this topic's `examples.py` implements — building a working timing-attack demonstration is a different, much larger undertaking than this topic's scope.

### Why the benchmark changed shape partway through building this topic

An early draft of `examples.py` timed a from-scratch pure-Python SipHash implementation against C-accelerated `hashlib.sha256` and got SHA-256 "faster" — the wrong direction. That measured interpreter overhead, not the algorithms: a pure-Python loop pays per-byte Python bytecode dispatch cost that a C library call doesn't. The fix, discovered by checking CPython's own documentation (PEP 456), is that Python's built-in `hash()` of a `str` or `bytes` object is itself a real, C-accelerated, randomly-seeded SipHash implementation, adopted specifically to fix hash-flooding attacks. Benchmarking three C-accelerated primitives against each other — `zlib.crc32`, `hash()`, `hashlib.sha256` — produces an honest, apples-to-apples comparison, and an honest surprise: the fast and keyed tiers measure close together on ordinary hardware, which is exactly SipHash's own "competitive in speed with popular non-cryptographic hash functions" design claim, not an accident of this one benchmark.

</section>

<section data-section="lab">

## In the lab

No separate *Lab* bullet is named for this topic in the syllabus; every number in this topic's reel is produced directly by `examples.py`'s own benchmark and HashDoS-mechanism runs, described above.

</section>

<section data-section="production">

## In production

Before picking a hash function for a table, ask one question first: can anyone outside my own process choose the keys? A compiler hashing its own identifiers, or a cache keyed by data the service itself generated, can reasonably answer "no" and take the faster, unkeyed tier — exactly `rustc`'s own documented reasoning for `FxHashMap`. A web service hashing request IDs, form fields, or any value supplied over the network must answer "yes," and the faster tier is not a style choice it can make — it's the HashDoS hole this topic's step 4 demonstrates. Treat "yes" and "no" as a real fork with a real consequence, not a performance tuning knob.

</section>

<section data-section="frontier">

## The frontier

Universal and k-independent hashing is the deeper theoretical tool that would turn "why keying helps" into a provable bound on collision probability, for any fixed input distribution, independent of what an adversary chooses — rather than this topic's empirical, measured framing. This syllabus's own Chapter 3 plan marks it *(skipped)* for this run of the curriculum; it is named here with no mechanism taught.

</section>

<section data-section="questions">

## More questions

- If an attacker can't time your server at all — a fixed, published latency budget absorbs the difference between a short and a long lookup — does the step 6 timing attack still work?
- `rustc`'s `FxHashMap` is explicit that its inputs aren't adversarial. Name one real situation where that assumption would be wrong for a compiler.

</section>

<section data-section="next">

## Where this goes next

A hash function turns any key into a number. It says nothing yet about what happens when two different keys turn into the same one. Next: the oldest answer, and the one every language's standard library still ships.

</section>
