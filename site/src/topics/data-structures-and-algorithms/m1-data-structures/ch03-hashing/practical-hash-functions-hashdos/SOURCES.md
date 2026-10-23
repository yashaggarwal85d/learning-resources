# Sources — Practical hash functions and HashDoS

## xxHash README (xxHash3, non-cryptographic speed and quality)

URL: https://raw.githubusercontent.com/Cyan4973/xxHash/dev/README.md
Version: `dev` branch README, fetched 2026-10-22 (describes XXH3, "available since v0.8.0")

> xxHash is an extremely fast non-cryptographic hash algorithm, working at RAM
> speed limits.

> XXH3, available since v0.8.0, generates 64-bit or 128-bit hashes using

> For new applications, `XXH3_64bits()` is the recommended default.

> For non-adversarial inputs, xxHash aims to produce a uniform distribution so
> that any subset of the output bits can spread entries evenly in a table or
> index.

> All variants successfully complete Austin Appleby's

> test suite, providing a
> baseline measure of statistical quality.

The README's own benchmark table (same page, "Benchmarks" section) lists, among others:

> | **XXH3** (AVX2) | 64 | 59.4 GB/s | 133.1 | |

> | SipHash | 64 | 3.0 GB/s | 43.2 | |

> | FNV64 | 64 | 1.2 GB/s | 62.7 | Poor avalanche properties |

Contents:
- XXH32/XXH64 (older, arithmetic-based) and XXH3 (current recommended default, 64- or 128-bit).
- Non-adversarial-input quality claim, explicitly scoped (not a security claim).
- SMHasher pass as the statistical-quality baseline; a dedicated massive collision tester.
- A benchmark table comparing many hash functions' throughput on the same page, including XXH3, SipHash and FNV64 side by side.

## wyhash README (another fast non-cryptographic hash, "dynamic secret")

URL: https://raw.githubusercontent.com/wangyi-fudan/wyhash/master/README.md
Version: `master` README, fetched 2026-10-22 (notes the project "has evolved into rapidhash")

> wyhash and wyrand are the ideal 64-bit hash function and PRNG respectively:

> **solid**: wyhash passed SMHasher, wyrand passed BigCrush, practrand.

> **fastest**: Efficient on 64-bit machines, especially for short keys.

> **salted**: We use dynamic secret to avoid intended attack.

> wyhash is the default hashing algorithm of the great

> Go (since 1.17)

> wyhash has evolved into

> With improved speed, quality and compatibility.

Contents:
- wyhash's own four-word design summary (solid, portable, fastest, simplest) plus "salted" — a per-key dynamic secret, which the README frames as resistance to deliberate (adversarial) construction, distinct from xxHash's explicitly non-adversarial quality claim above.
- Named adoption: Zig, V, Nim, Go (since 1.17).
- The project's own README states it has been superseded by rapidhash; this topic names wyhash only as the syllabus's named example, not as a current recommendation.

## rustc-hash README (FxHash, no HashDoS resistance by design)

URL: https://raw.githubusercontent.com/rust-lang/rustc-hash/main/README.md
Version: `main` README, fetched 2026-10-22

> A speedy, non-cryptographic hashing algorithm used by `rustc`.

> uses SipHash by default, which provides resistance against DOS attacks.
> These attacks aren't a concern in the compiler so we prefer to use a quicker,
> non-cryptographic hash algorithm.

> The original hash algorithm provided by this crate was one taken from Firefox,
> hence the hasher it provides is called FxHasher. This name is kept for backwards
> compatibility, but the underlying hash has since been replaced.

> For `rustc` we have tried many different hashing algorithms. Hashing speed is
> critical, especially for single integers. Spending more CPU cycles on a higher
> quality hash does not reduce hash collisions enough to make the compiler faster
> on real-world benchmarks.

Contents:
- FxHash's origin (Firefox) and its name's persistence despite the underlying hash changing.
- An explicit statement, from the crate that chose it, that FxHash deliberately gives up DoS resistance because the compiler's own inputs are not adversarial — the exact trade-off this topic's claim rests on.

## Rust `std::collections::HashMap` documentation (keyed hash, per-process random seed)

URL: https://doc.rust-lang.org/std/collections/struct.HashMap.html
Version: current stable docs, fetched 2026-10-22

> By default, HashMap uses a hashing algorithm selected to provide
> resistance against HashDoS attacks. The algorithm is randomly seeded, and a
> reasonable best-effort is made to generate this seed from a high quality,
> secure source of randomness provided by the host without blocking the
> program.

> The default hashing algorithm is currently SipHash 1-3, though this is
> subject to change at any point in the future. While its performance is very
> competitive for medium sized keys, other hashing algorithms will outperform
> it for small keys such as integers as well as large keys such as long
> strings, though those algorithms will typically not protect against
> attacks such as HashDoS.

> Alternatively, you can construct a HashMap in a const or static initializer using a different
> hasher that does not rely on a random seed. Be aware that a HashMap created this way is not
> resistant to HashDoS attacks!

> A hash map implemented with quadratic probing and SIMD lookup.

Contents:
- Confirms Rust's default `HashMap` hasher: SipHash 1-3, keyed and per-process randomly seeded for HashDoS resistance (verified against the current docs, not an older variant).
- The explicit trade-off statement: faster non-keyed hashes exist for small/large keys, but "will typically not protect against attacks such as HashDoS" — directly supports this topic's three-tier framing.
- The warning that a fixed, non-random hasher loses HashDoS resistance entirely — supports the per-process-seed claim's necessity.
- (Also used in `coverage.json`/forward reference only, not a claim of this topic: the implementation line "quadratic probing and SIMD lookup" previews topics 18 and 19.)

## SipHash: a fast short-input PRF (Aumasson & Bernstein, 2012) — the keyed-hash primary paper

URL: https://www.aumasson.jp/siphash/siphash.pdf
Version: INDOCRYPT 2012 paper (as hosted by the author), fetched 2026-10-22

> SipHash is a family of pseudorandom functions optimized for
> short inputs. Target applications include network traffic authentication
> and hash-table lookups protected against hash-flooding denial-of-service
> attacks.

> Our concrete proposal SipHash-2-4 was designed and evaluated to be a cryptographically strong PRF (pseudorandom function), i.e., indistinguishable from a uniform random function.

> SipHash-2-4 is much faster for short inputs than previous
> strong MACs (and PRFs), and is competitive in speed with popular noncryptographic hash functions.

> Hash flooding is a denial-of-service attack against
> hash tables. The attacker provides n strings m that have the same hash value
> H(m), or at least the same H(m) mod `. The hash-table performance then deteriorates to the performance of one linked list.

> Crosby and Wallach reintroduced the same attack in 2003 under the name
> “algorithmic complexity attack” [13] and explored its applicability to the Squid
> web cache, the Perl programming language, etc. Hash flooding made headlines
> again in December 2011, when Klink and Wälde [24] demonstrated its continued
> applicability to several commonly used web applications. For example, Klink and
> Wälde reported 500 KB of carefully chosen POST data occupying a PHP5 server
> for a full minute of CPU time.

> Crosby and Wallach recommended replacing public
> functions H with secret functions, specifically universal hash functions, specifically the hash function H(m0 , m1 , . . .) = m0 · k0 + m1 · k1 + · · · using a secret
> key (k0 , k1 , . . .). The idea is that an attacker has no way to guess which strings
> will collide.

> We question the security of this approach. Consider, for example, a hash
> table containing one string m, where m is known to the attacker. Looking up
> another string m0 will, with standard implementations, take longer if H(m0 ) ≡
> H(m) (mod `) than if H(m0 ) 6≡ H(m) (mod `). This timing information will
> often be visible to an attacker, and can be amplified beyond any level of noise
> if the application allows the attacker to repeatedly query m0 .

> We comment that many of the hash-flooding defenses proposed since December 2011 are vulnerable to the same attack. The most common public hash
> functions are of the form m0 · k0 + m1 · k1 + · · · where k0 , k1 , . . . are public,
> and many of the proposed defenses simply add some entropy to k0 , k1 , . . .; but
> the attack works no matter how k0 , k1 , . . . are chosen.

> We propose choosing H to be a cryptographically strong PRF. If H is a strong
> PRF then the truncation H mod ` is also a strong PRF (recall that ` is a power
> of 2), and therefore a strong MAC: even after seeing H(m) mod ` for selected
> strings m, the attacker cannot predict H(m) mod ` for any other string m.

Contents:
- The formal definition of a keyed PRF and why SipHash is one; the speed goal relative to both strong MACs and popular non-cryptographic hashes.
- A direct, primary-source history of hash flooding: the 1999 `dnscache` comment, Crosby & Wallach's 2003 "algorithmic complexity attacks" paper, and Klink & Wälde's December 2011 disclosure with a concrete figure (500 KB of POST data, one PHP5 server, a full minute of CPU time).
- **The crucial correction this topic's fact-check makes** (see FACT-CHECK.md): the paper explicitly argues that merely adding a random seed to a *linear* public hash (the naive "per-process random seed" defense) is still breakable by an attacker who can observe timing and issue adaptive queries, via Gaussian elimination against the linear structure — not just insufficiently random, but a different, deeper weakness that only a cryptographically strong PRF (not just "keyed and randomly seeded") closes.

## Hash-flooding DoS reloaded: attacks and defenses (Aumasson, Bernstein, Boßlet, AppSec 2012 slides)

URL: https://www.aumasson.jp/siphash/siphashdos_appsec12_slides.pdf
Version: AppSec 2012 slide deck (as hosted by the author), fetched 2026-10-22

> Hash tables used in many applications to maintain an association between objects

> If the table is about as large as the
> number of elements to be stored (=n),
> insertion or lookup of n elements takes
> O(n) operations on average

> insertion or lookup of n elements takes
> O(n2) operations in the worst case

> Hash flooding:
> Send to a server many inputs with a
> same hash (a multicollision) so as to
> enforce worst-case insert time

> send 2MB of POST data consisting of
> 200.000 colliding 10B strings
> ≈ 40.000.000.000 string comparisons
> (at least 10s on a 2GHz machine…)

> Crosby, Wallach. Denial of Service via Algorithmic Complexity Attacks, USENIX Security 2003
> -> attack formalized and applied to Perl, Squid, etc.

> Klink, Wälde. Efficient Denial of Service Attacks on Web Application Platforms. CCC 28c3
> -> application to PHP, Java, Python, Ruby, etc.

> Patches released consisting of a stronger hash with randomization (to make colliding values impossible to find)

Contents:
- A second, independent, directly fetchable primary record of the same two foundational disclosures (Crosby & Wallach 2003; Klink & Wälde CCC 28c3, December 2011) this topic cites, with the languages Klink & Wälde's talk covered (PHP, Java, Python, Ruby) named explicitly.
- A concrete worked HashDoS cost example (200,000 colliding 10-byte strings in 2 MB of POST data, ≈40 billion string comparisons, ≥10 s on a 2 GHz machine) usable as `examples.py`'s own order-of-magnitude sanity check.
- Confirms "randomization" (a random seed) was the industry's actual 2011–2012 patch response, which this talk and the SipHash paper both go on to show is insufficient against an adaptive attacker without full PRF strength — the same correction as above, from an independent source.

## PEP 456 — Secure and interchangeable hash algorithm (CPython's own `hash()`)

URL: https://peps.python.org/pep-0456/
Version: PEP 456, fetched 2026-10-22

> This PEP proposes SipHash as default string and bytes hash algorithm to properly
> fix hash randomization once and for all.

> SipHash [sip] is introduced as default hash algorithm. It is fast and small
> despite its cryptographic properties.

> The randomization was not part of the initial hash code, but was added as
> counter measure against hash collision attacks as explained in oCERT-2011-003

> Because FNV is not a cryptographic hash algorithm and the dict
> implementation is not fortified against side channel analysis, the
> randomization secrets can be calculated by a remote attacker.

Contents:
- Confirms CPython's own built-in `hash()` of `str`/`bytes` objects has used SipHash as its default algorithm since this PEP, chosen specifically to fix hash-collision/HashDoS attacks — the primary source justifying `examples.py`'s use of Python's real `hash()` as the keyed/PRF tier's benchmark, not a from-scratch reimplementation.
- An independent primary-source citation of the same `oCERT-2011-003` disclosure already named in the SipHash paper and the AppSec slides, this time from CPython's own side of the fix.
- The explicit reason the prior scheme (a randomized FNV) was still broken: FNV is linear/non-cryptographic, so "the randomization secrets can be calculated by a remote attacker" — the same shape of correction (seed alone is not enough on a non-cryptographic hash) as claim 9, from a third independent source.

## Python command line and environment documentation (`PYTHONHASHSEED`)

URL: https://docs.python.org/3/using/cmdline.html
Version: current docs, fetched 2026-10-22

> If this variable is not set or set to random, a random value is used
> to seed the hashes of str and bytes objects.

> If PYTHONHASHSEED is set to an integer value, it is used as a fixed
> seed for generating the hash() of the types covered by the hash
> randomization.

Contents:
- Confirms `PYTHONHASHSEED` is the real, documented per-process control for CPython's `hash()` randomization — the production mechanism `examples.py`'s keyed-tier benchmark actually runs under by default (random, unset).

## BLAKE3 README (cryptographic-hash tier, relative cost)

URL: https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/master/README.md
Version: `master` README, fetched 2026-10-22

> BLAKE3 is a cryptographic hash function that is:
> - **Much faster** than MD5, SHA-1, SHA-2, SHA-3, and BLAKE2.
> - **Secure**, unlike MD5 and SHA-1. And secure against length extension, unlike SHA-2.

> provides a command line interface. It uses multithreading by default,
> making it an order of magnitude faster than e.g. `sha256sum` on
> typical desktop hardware.

Contents:
- BLAKE3's own relative-speed claim against SHA-2 (which includes SHA-256), the syllabus's named cryptographic hashes, and the multithreading-driven order-of-magnitude figure for `b3sum` vs `sha256sum`.
- Used only to establish that the cryptographic tier has its own internal speed range (BLAKE3 faster than SHA-256), not to claim a cross-tier number against xxHash3/SipHash (those come from xxHash's own benchmark table above, on one page, one methodology).
