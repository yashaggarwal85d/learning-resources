- **Digit and radix**: the radix is the base a number is split into (10 for decimal digits,
  256 for byte-sized digits); a digit is one slice of a key at that base. *Where you meet
  it:* every pass of radix sort reads exactly one digit of every key.
- **Prefix sum** (running total): turn a list of counts into starting positions by adding
  each count to the running total of everything before it. *Where you meet it:* how
  counting sort turns "how many of each value" into "where each value's slots start."
- **Byte string and lexicographic order**: comparing two byte strings left to right, byte
  by byte, the way a dictionary compares words letter by letter. *Where you meet it:* the
  whole point of DuckDB's encoding — make byte order equal to row order.
- **Big-endian and little-endian** (one line): whether a number's most significant byte is
  stored first (big-endian) or last (little-endian) in memory. *Where you meet it:* why an
  integer needs its bytes reordered before it can be compared like a string.
- **Two's complement** (one line): how negative integers are actually stored, so that a
  negative number's raw bits look numerically larger than a positive one's. *Where you meet
  it:* why making signed integers byte-comparable means flipping the sign bit, not just
  reading the bits as they are.
- **IEEE 754 float layout** (one line): a sign bit, an exponent, and a fraction, in that
  order. *Where you meet it:* the same byte-comparability problem as integers, with its own
  fix.
- **Uniform distribution** (one line): every value in a range is equally likely. *Where you
  meet it:* bucket sort's whole cost argument assumes keys are spread this way — and breaks
  when they are not.
- **Stability** (carried over from topic 48): whether equal keys keep their input order.
  *Where you meet it:* counting sort has it for free; American flag sort trades it away for
  working in place.
