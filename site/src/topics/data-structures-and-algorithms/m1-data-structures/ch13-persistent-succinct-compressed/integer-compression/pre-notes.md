- **Binary representation and bit width.** How many bits a number needs to be written in base
  two; a number up to 255 needs 8 bits, up to 65,535 needs 16.
- **Most and least significant bit.** The highest-value and lowest-value bit of a number's own
  binary form.
- **Sorted list and gap.** A list kept in increasing order; the gap between two consecutive
  entries is their difference.
- **Prefix sum (running total).** The running total of a list, so far; a gap list is turned back
  into the original sorted list by a prefix sum.
- **SIMD (one line).** One instruction operating on several values at once, rather than one.
- **Branch misprediction (one line).** A processor that guesses which way an if-check will go,
  and pays a real cost whenever that guess turns out wrong.
- **Posting list.** The sorted ids of the documents or rows that contain a given term or value.

**Check yourself:** a sorted list of a million distinct ids, each up to four billion, costs four
bytes per id stored plainly. What is the fewest bits per id any encoding could average over all
such lists, and why might a real encoding spend more than that? (Answer in the reel: step 1 — a
counting argument gives thirteen and a half bits per id as the floor; real encodings spend more
because they can't know in advance exactly which list they're about to see.)
