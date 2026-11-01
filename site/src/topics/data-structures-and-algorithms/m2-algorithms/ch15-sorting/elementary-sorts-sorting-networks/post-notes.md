<section data-section="outcomes">

## Outcomes

- Trace insertion, selection and bubble sort on the deck, giving exact comparison and move
  counts, and say which is stable and which is in place.
- State insertion sort's cost as n − 1 plus the inversions, and say why that makes it the last
  stage of a hybrid sort.
- Draw a four-input sorting network as five compare-exchanges, check it, and say what makes it
  branch-free.

</section>

<section data-section="internals">

## Internals

Insertion sort's cost splits cleanly into two parts: n − 1 comparisons that find each key
already in place (the floor every input pays), plus exactly one comparison and one move per
inversion. Both halves are checked directly in `examples.py`: the planning example
`[5, 2, 4, 6, 1, 3]` has nine inversions, and insertion sort on it makes twelve comparisons and
nine moves — the moves equal the inversions exactly. On eight already-sorted keys it makes seven
comparisons (n − 1) and zero moves; on eight fully reversed keys, twenty-eight comparisons and
twenty-eight moves, matching the maximum possible inversion count for eight keys exactly.

Selection sort's comparison count is fixed at n(n − 1)/2 regardless of input — checked on the
topic's own sixteen-key deck, where it comes to one hundred twenty, exactly 16·15/2 — because
its inner scan always covers the whole remaining unsorted range, whatever order that range is
already in. That same unconditional scan is also what makes it unstable: its one swap per round
moves the found minimum directly to the front, which can carry one equal key past another.
Checked directly: five tagged records with keys `3a, 1b, 3c, 2d, 1e` come out of selection sort
as `1b, 1e, 2d, 3c, 3a` — the two 3-keys swapped their relative order. The identical records run
through insertion sort come out `1b, 1e, 2d, 3a, 3c` — insertion sort never moves a key across an
equal one, so it is stable by construction, not by luck.

The small-sort cutoff is a real, measured engineering decision in production libraries, not a
rule of thumb repeated without evidence. GCC's libstdc++ declares `enum { _S_threshold = 16 };`
and its `__final_insertion_sort` helper hands off to plain insertion sort below that. Rust's
`smallsort.rs` (tag `1.81.0`) calls a thirteen-element fixed sorting-network helper
(`sort13_optimal`) above a length of thirteen, a nine-element one (`sort9_optimal`) above nine,
and falls through to insertion sort below that — each one chosen, per the file's own comment, so
that "the current design... makes sure to only call this once," keeping code size and inlining
under control. Below those sizes, a loop with no recursion, no function call, and sequential
memory access beats any algorithm whose asymptotic advantage only pays off at a larger size.

A sorting network takes the opposite strategy to its logical extreme: instead of deciding what
to compare based on the data, it fixes every compare-exchange in advance. This topic's own
four-input network, five compare-exchanges wired as `(0,1), (2,3), (0,2), (1,3), (1,2)`, is
checked — not assumed — against every one of the twenty-four permutations of four distinct keys
and all sixteen zero-one patterns in `examples.py`; every single case comes out sorted. Because
no comparison depends on the data, there is no data-dependent branch anywhere in the network, and
its five compare-exchanges meet the information-theoretic bound for four inputs (⌈lg 4!⌉ = 5)
exactly — the one place in this topic where a concrete algorithm meets the previous chapter's
bound with nothing to spare. At eight inputs the gap reopens: the smallest known network needs
nineteen compare-exchanges against a bound of sixteen, so "optimal size for this shape of
algorithm" and "meets the information-theoretic floor" are not the same claim, and this topic is
careful not to conflate them.

</section>

<section data-section="frontier">

## Frontier

Larger sorting networks — Batcher's odd-even merge, bitonic networks — are named only, per
`CHAPTER.md`'s own instruction, with nothing about their construction beyond the name; Dobbelaere's
page gives their sizes for the curious. The zero-one principle itself (that checking all-0/1
inputs on an oblivious network stands in for checking every possible key value) is used here only
operationally, checked computationally rather than quoted from Knuth's own statement of it, which
was not opened this session.

</section>

<section data-section="where-next">

## Where this goes next

Insertion sort is optimal on tiny or nearly sorted input and hopeless on a million random keys:
its cost is the number of inversions, and a random array has about a quarter of n squared of
them. A sort that stays near n log n on every input has to do something quite different: split
the array, sort the halves, and put them back together in one linear pass. The next topic is
that algorithm, and it is the one that comes closest to the information-theoretic bound. Merge
sort, next.

</section>
