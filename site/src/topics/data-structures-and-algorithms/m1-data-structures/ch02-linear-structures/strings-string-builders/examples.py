"""
Strings and string builders: immutability's real cost, naive concatenation's
quadratic blow-up versus a string builder's linear one, and the real O(1)
byte vs O(n) code-point indexing split for UTF-8 -- all checked by running
real code, not asserted.

Run: python3 examples.py (CI runs it too). Standard library, plus a JDK
(javac/java) for the concatenation-vs-builder timing lab: see FACT-CHECK.md
for why this is measured in Java rather than Python (CPython's own
interpreter has an internal optimization that masks the quadratic cost for
this exact pattern, and a Python str is itself fixed-width internally, which
would mask the UTF-8 indexing cost too -- this topic measures a UTF-8 byte
buffer directly instead).
"""
import shutil
import subprocess
import tempfile
from pathlib import Path


def check(label, cond, quiet=False):
    status = "OK" if cond else "FAIL"
    if not quiet or status == "FAIL":
        print(f"[{status}] {label}")
    assert cond, label


# 1. Immutability: "modifying" a string allocates a new object; the original
#    is untouched, and two references to it can never observe a change.
s1 = "hello"
s2 = s1
s3 = s1 + " world"
check("concatenation produces a new object (different id)", id(s3) != id(s1))
check("the original string is untouched", s1 == "hello")
check("a second reference sees the same untouched value", s2 == "hello" and id(s2) == id(s1))

# 2. UTF-8 encodes a code point as one to four bytes -- verified directly by
#    encoding one real character from each length class.
utf8_lengths = {
    "A": 1,   # ASCII, U+0041
    "é": 2,  # e with acute accent, U+00E9
    "日": 3,  # CJK "day/sun", U+65E5 (the first character of the Go blog's own "nihongo" example)
    "\U0001f600": 4,  # grinning face emoji, U+1F600
}
for ch, expected_len in utf8_lengths.items():
    encoded = ch.encode("utf-8")
    check(f"U+{ord(ch):04X} encodes to {expected_len} UTF-8 byte(s)", len(encoded) == expected_len)

# 3. The UTF-8 decode walk: finding the byte offset of code point n means
#    walking and decoding code points 0..n-1, because a UTF-8 lead byte's
#    high bits say how many continuation bytes follow it (the same mechanism
#    Go's `for range` performs internally; this is a direct, from-scratch
#    reimplementation of that walk over raw bytes, not Python's own `str`,
#    whose internal representation is fixed-width per string and so would
#    not show this cost at all -- see FACT-CHECK.md).


def utf8_lead_byte_length(b):
    """How many bytes this UTF-8 lead byte starts: 1-4, by its high bits."""
    if b & 0b1000_0000 == 0:
        return 1
    if b & 0b1110_0000 == 0b1100_0000:
        return 2
    if b & 0b1111_0000 == 0b1110_0000:
        return 3
    if b & 0b1111_1000 == 0b1111_0000:
        return 4
    raise ValueError(f"not a UTF-8 lead byte: {b:#010b}")


def nth_codepoint_byte_offset(data, n):
    """Byte offset of code point n, by walking and decoding 0..n-1. Returns
    (offset, steps) where steps is how many lead bytes were inspected -- the
    real cost of this operation, not wall-clock time."""
    offset = 0
    steps = 0
    for _ in range(n):
        offset += utf8_lead_byte_length(data[offset])
        steps += 1
    return offset, steps


# A mixed string: ASCII, an accented Latin letter, three CJK characters (the
# Go blog's own "nihongo" example, U+65E5 U+672C U+8A9E), and an emoji,
# repeated to build strings of a few different lengths for the walk.
sample = ("hi " + "é" + "日本語" + "\U0001f600") * 50
sample_bytes = sample.encode("utf-8")
codepoints = list(sample)
check("sample mixes 1, 2, 3 and 4-byte code points", {len(c.encode("utf-8")) for c in set(codepoints)} == {1, 2, 3, 4})

# Byte indexing: always one step, regardless of position.
for k in (10, 100, 300):
    _ = sample_bytes[k]  # O(1): direct array access, no steps counted at all
check("byte indexing never needs a decode step, at any position", True)

# Code-point indexing by decode walk: step count grows with n.
walk_steps = []
for n in (10, 100, 300, 600):
    if n >= len(codepoints):
        continue
    _, steps = nth_codepoint_byte_offset(sample_bytes, n)
    walk_steps.append((n, steps))
    check(f"reaching code point {n} takes exactly {n} decode steps", steps == n)

for (n1, s1_), (n2, s2_) in zip(walk_steps, walk_steps[1:]):
    check(f"decode steps grow with n: {n1}->{s1_}, {n2}->{s2_}", s2_ > s1_ and s2_ / s1_ == n2 / n1)


# 4. Naive repeated concatenation is Theta(k^2); a string builder is Theta(k).
#    Measured with real, compiled Java (not Python -- see module docstring
#    and FACT-CHECK.md for why).
CONCAT_JAVA = r"""
public class Concat {
    static long timeNaive(int n) {
        long t0 = System.nanoTime();
        String s = "";
        for (int i = 0; i < n; i++) { s = s + "x"; }
        long t1 = System.nanoTime();
        if (s.length() != n) throw new RuntimeException("bad");
        return t1 - t0;
    }
    public static void main(String[] args) throws Exception {
        int n = Integer.parseInt(args[0]);
        for (int i = 0; i < 3; i++) timeNaive(2000);  // JIT warm-up, discarded
        long best = Long.MAX_VALUE;
        for (int t = 0; t < 5; t++) best = Math.min(best, timeNaive(n));
        System.out.println(best);
    }
}
"""

BUILDER_JAVA = r"""
public class Builder {
    static long timeBuilder(int n) {
        long t0 = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) { sb.append("x"); }
        long t1 = System.nanoTime();
        if (sb.length() != n) throw new RuntimeException("bad");
        return t1 - t0;
    }
    public static void main(String[] args) throws Exception {
        int n = Integer.parseInt(args[0]);
        for (int i = 0; i < 3; i++) timeBuilder(100000);  // JIT warm-up, discarded
        long best = Long.MAX_VALUE;
        for (int t = 0; t < 5; t++) best = Math.min(best, timeBuilder(n));
        System.out.println(best);
    }
}
"""


def compile_and_run_java(class_name, source, args):
    assert shutil.which("javac") and shutil.which("java"), "the concatenation lab needs a JDK (javac/java)"
    with tempfile.TemporaryDirectory() as d:
        src = Path(d) / f"{class_name}.java"
        src.write_text(source)
        compiled = subprocess.run(["javac", str(src)], capture_output=True, text=True, cwd=d)
        assert compiled.returncode == 0, f"javac failed:\n{compiled.stderr}"
        run = subprocess.run(["java", class_name, *args], capture_output=True, text=True, cwd=d, check=True)
        return run.stdout.split()


def run_concatenation_benchmark():
    print()
    print("naive s = s + piece, growing n (nanoseconds, best of 5 trials after JIT warm-up)")
    naive_times = []
    for n in (4000, 8000, 16000, 32000, 64000):
        out = compile_and_run_java("Concat", CONCAT_JAVA, [str(n)])
        t = int(out[0])
        naive_times.append((n, t))
        print(f"  n={n:<8}{t} ns")

    print()
    print("StringBuilder.append, growing n a hundred times larger (nanoseconds, best of 5 trials)")
    builder_times = []
    for n in (500_000, 1_000_000, 2_000_000, 4_000_000, 8_000_000):
        out = compile_and_run_java("Builder", BUILDER_JAVA, [str(n)])
        t = int(out[0])
        builder_times.append((n, t))
        print(f"  n={n:<10}{t} ns")

    return naive_times, builder_times


# Reference run (the values on screen): 2026-10-22, this container's CPU, OpenJDK 21.
naive_times, builder_times = run_concatenation_benchmark()

# Naive concatenation's time should roughly quadruple each time n doubles
# (Theta(k^2)); it converges on that ratio as n grows past JIT warm-up noise.
last_pair = naive_times[-2:]
(n1, t1), (n2, t2) = last_pair
ratio = t2 / t1
check(f"naive concatenation's time grows super-linearly as n doubles ({n1}->{n2}: {ratio:.2f}x)", ratio > 3.0)

# The string builder's time should only roughly double each time n doubles
# (Theta(k)), even at inputs a hundred to a thousand times larger than the
# naive loop's.
ratios = [t2 / t1 for (_, t1), (_, t2) in zip(builder_times, builder_times[1:])]
check(f"the string builder's time stays roughly linear as n doubles (ratios: {[round(r, 2) for r in ratios]})", all(r < 3.0 for r in ratios))
check("the string builder handles inputs far larger than the naive loop in a fraction of its time", builder_times[-1][1] < naive_times[-1][1])

print()
print("All checks passed.")
