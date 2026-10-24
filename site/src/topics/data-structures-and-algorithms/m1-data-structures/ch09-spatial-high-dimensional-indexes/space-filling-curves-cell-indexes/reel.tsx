import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every structure through the previous chapter ordered one array, by position or by key.
// This topic asks the same ordering question about points scattered across two dimensions
// instead. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Fenwick trees and segment trees both answer aggregate questions over a changing array in O(log n), whichever one fits the operator and the update pattern. The next chapter asks a different question about dimension instead: not where a value sits along one array, but how to order points scattered across two or three dimensions so that nearby points end up nearby in a single linear ordering. Space-filling curves, next.',
      body: (
        <>
          Two points that are neighbours on a map — how far apart do they land once
          they're squeezed into one line?
        </>
      ),
      duration: 4.5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'The obvious ordering is row-major: number the cells left to right, row by row. It works as an ordering — every cell gets a distinct number — but two cells that are neighbours on the grid can land arbitrarily far apart in it, the moment they sit in different rows.',
      body: <>Row-major has no special relationship to the grid's own two dimensions. One step down can be a huge jump in the ordering.</>,
      duration: 3.5,
      fig: 'NaiveReveal',
      Visual: S.NaiveReveal,
    },
    {
      title: 'Z-order fixes this by interleaving each coordinate’s own bits into a single ordering. Does that actually keep every pair of grid neighbours close together, or only some of them?',
      body: <>Does bit-interleaving fix row-major's locality problem everywhere, or only in places?</>,
      duration: 2,
      fig: 'ZOrderPredict',
      predict: {
        options: [
          { label: 'Yes — bit-interleaving keeps every neighbour pair close, with no exceptions' },
          { label: 'It keeps most neighbour pairs close, but still breaks down at some boundaries', correct: true },
          { label: 'No — bit-interleaving is no better than row-major' },
          { label: 'It only works for horizontal neighbours, never vertical ones' },
        ],
        explain: (
          <>
            Interleaving ties a point's ordering to both coordinates together — but it still
            has nothing special to say about cells on opposite sides of a boundary.
          </>
        ),
      },
      Visual: S.ZOrderPredict,
    },
    {
      title: 'Z-order interleaves each coordinate’s own bits, one bit from each axis in turn, into a single z-value. Connecting the z-values in order traces a recursively Z-shaped path, and the whole construction visits every one of the grid’s cells exactly once.',
      body: <>A point's own ordering now depends on both coordinates together, not one row at a time.</>,
      duration: 4.5,
      fig: 'ZOrderReveal',
      takeaway: "Z-order interleaves each coordinate's own bits, one bit per axis, visiting every cell exactly once.",
      Visual: S.ZOrderReveal,
    },
    {
      title: 'Near the grid’s own origin corner, Z-order’s ordering is already about as tight as row-major’s. But a step across a boundary — crossing from one quadrant into the next — can jump the ordering by far more than a single step.',
      body: <>The same interleaving that keeps nearby bits together inside one quadrant has nothing to say about two cells on opposite sides of a boundary.</>,
      duration: 4,
      fig: 'BoundaryReveal',
      Visual: S.BoundaryReveal,
    },
    {
      title: 'A Hilbert curve is built recursively instead of by simple bit-interleaving. Can a curve built this way avoid Z-order’s own boundary jump?',
      body: <>Can a differently built curve specifically avoid the case that just broke?</>,
      duration: 2,
      fig: 'HilbertPredict',
      predict: {
        options: [
          { label: 'No — any space-filling curve must jump at some boundary' },
          { label: 'Yes — a Hilbert curve can keep exactly this pair adjacent', correct: true },
          { label: 'Yes, but only by giving up the one-cell-per-visit guarantee' },
          { label: 'No — Hilbert curves are only defined for one dimension at a time' },
        ],
        explain: (
          <>
            A Hilbert curve's own recursive construction chooses each quadrant's order and
            orientation specifically so the path never has to jump across a boundary it is
            about to re-enter.
          </>
        ),
      },
      Visual: S.HilbertPredict,
    },
    {
      title: 'A Hilbert curve’s own recursive construction — each quadrant visited in an order and orientation chosen so the path never has to jump across a boundary it’s about to re-enter — keeps the identical boundary pair adjacent in its ordering, where Z-order’s jump was large.',
      body: <>More involved to construct than interleaving bits — but the construction itself is what buys the tighter locality.</>,
      duration: 4.5,
      fig: 'HilbertReveal',
      takeaway: 'A Hilbert curve keeps the boundary pair Z-order jumped on close together, at the cost of a more involved construction.',
      Visual: S.HilbertReveal,
    },
    {
      title: 'Three production systems fix one specific curve and cell shape over this same idea: geohash interleaves latitude and longitude Z-order-style into a base-thirty-two string; S2 projects the sphere onto a cube and runs a Hilbert curve on each of its six faces; H3 tiles the sphere in hexagons instead of squares, because a hexagon’s neighbours are all the same distance from its centre, where a square’s corner neighbours sit farther away than its edge neighbours.',
      body: <>Three different answers to the identical question this topic just built by hand: which curve, and which cell shape.</>,
      duration: 5,
      fig: 'CellIndexReveal',
      Visual: S.CellIndexReveal,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: three real near-neighbour pairs, each one's real distance
          apart in row-major order, Z-order, and Hilbert order, computed directly in this
          topic's own code.
        </>
      ),
      duration: 4.5,
      fig: 'ProveIt',
      takeaway: "Z-order's worst measured jump is far larger than Hilbert's — but near the grid's origin, Hilbert isn't the smallest.",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
