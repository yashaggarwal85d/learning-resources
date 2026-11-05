import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Max-flow min-cut and Ford-Fulkerson. A full topic: the flow network, a stuck forward-only
// run against the residual graph's own rescue, Ford-Fulkerson stated as a loop, the cut the
// algorithm's own stopping point certifies, the max-flow min-cut theorem, integrality, and why
// the loop can be slow. Every count is exact and asserted in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "A network of six depots, their pipes able to carry nine units in total across the narrowest crossing, and a dispatcher that keeps sending shipments down any route with room left. It stops at seven and reports no more routes. Two more units could still ship, but only by pulling back some of what is already sent. How does an algorithm take back what it did, and how does it know when it is truly finished rather than merely stuck?",
      body: <>A dispatcher stops at seven. Two more units could ship, but only by pulling flow back.</>,
      duration: 5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A flow network is a directed graph with a source and a sink and a capacity on every edge. At every other vertex, whatever flows in must flow back out. The chapter's own six-vertex graph, now read as six pipes running from a source to a sink.",
      body: <>A directed graph, a source and a sink, a capacity on every edge, flow conserved elsewhere.</>,
      duration: 4,
      fig: 'FlowNetwork',
      Visual: S.FlowNetwork,
    },
    {
      title: "Before naming what fixes it: could the dispatcher's own count of seven ever be beaten by trying different routes, without ever undoing anything already sent?",
      body: <>Could trying different forward routes alone ever beat the dispatcher's own stuck count?</>,
      duration: 3,
      fig: 'PredictRescue',
      predict: {
        options: [
          { label: 'Yes, some other forward-only route reaches more than seven' },
          { label: 'No, reaching more than seven needs pulling flow back', correct: true },
          { label: 'Only if the network had more pipes than it does' },
          { label: 'It depends only on which vertex the dispatcher starts from' },
        ],
        explain: (
          <>
            Every forward-only route the dispatcher could ever try is already accounted for by
            the stuck run; none of them reaches past seven. Reaching the true maximum needs a
            route that crosses one pipe backward, undoing flow already sent through it.
          </>
        ),
      },
      Visual: S.PredictRescue,
    },
    {
      title: "The dispatcher's own four routes, taken in order: two units down the first, one unit down the second, one unit down the third, three units down the fourth. Seven units shipped in total, and every remaining route now has at least one pipe already full.",
      body: <>Four routes, in order, ship seven units. Every remaining route now has a full pipe.</>,
      duration: 4.5,
      fig: 'StuckRun',
      Visual: S.StuckRun,
    },
    {
      title: "Every pipe that already carries flow keeps a second, undo-shaped number beside its forward one: how much of that flow could still be pulled back. Drawn beneath the stuck network, three of its pipes each hide a backward number greater than nothing at all.",
      body: <>Each loaded pipe keeps an undo number too: how much of its own flow could be pulled back.</>,
      duration: 4.5,
      fig: 'ResidualGraph',
      Visual: S.ResidualGraph,
    },
    {
      title: "A path through this undo-aware graph crosses one pipe backward, pulling back exactly what was sent through it, then keeps going forward the rest of the way to the sink. Pushing as much as that path allows reaches the true maximum: nine units, two more than the stuck count.",
      body: <>One path crosses a pipe backward, undoing earlier flow, then reaches the sink. Total: nine.</>,
      duration: 4.5,
      fig: 'Rescue',
      Visual: S.Rescue,
    },
    {
      title: "Stated as a loop: find any route through the undo-aware graph with room left in either direction, push as much as that route allows, and repeat until no such route remains. A different order of five routes reaches the identical maximum directly, its own last route crossing that identical pipe backward.",
      body: <>Find any route with room, push its limit, repeat. Five routes reach nine directly.</>,
      duration: 5,
      fig: 'FordFulkersonLoop',
      Visual: S.FordFulkersonLoop,
    },
    {
      title: "When no route remains, the depots still reachable from the source form one side of a split. Every pipe crossing out of that side is completely full; every pipe crossing back carries nothing at all. The flow's own total exactly equals that split's own capacity.",
      body: <>No route left: the reachable depots form a split. Full pipes out, empty pipes back.</>,
      duration: 4.5,
      fig: 'CutCertificate',
      takeaway: "Stopping is itself the proof: the reachable depots form a split whose capacity equals the flow.",
      Visual: S.CutCertificate,
    },
    {
      title: "The value of a maximum flow always equals the capacity of a minimum cut. Checked on the chapter's own network, where both numbers lock onto nine, and independently on a second, differently sourced network, where both numbers lock onto twenty-three instead.",
      body: <>Max flow always equals min cut. Checked here at nine, and elsewhere at twenty-three.</>,
      duration: 4.5,
      fig: 'MaxFlowMinCutTheorem',
      takeaway: "Max flow equals min cut, always, proved by the same stopping argument, checked on two separate networks.",
      Visual: S.MaxFlowMinCutTheorem,
    },
    {
      title: "If every capacity is a whole number, every route's own push is a whole number too, so the algorithm always ends with a flow that is whole-number everywhere. The consequence used next: give every pipe a capacity of one, and the resulting flow turns out to be either nothing or one on every single pipe.",
      body: <>Whole-number capacities give a whole-number flow. Capacity-one pipes give a flow of nothing or one.</>,
      duration: 4.5,
      fig: 'Integrality',
      takeaway: "Whole-number capacities give a whole-number flow; capacity-one pipes give a flow of nothing or one.",
      Visual: S.Integrality,
    },
    {
      title: "Before naming the running-time bound: could a maximum flow ever need to send flow around in a closed loop to reach its own largest value, or can any such loop always be stripped away for free?",
      body: <>Could a maximum flow ever need a closed loop of its own flow, or is that always wasted?</>,
      duration: 3,
      fig: 'PredictAcyclic',
      predict: {
        options: [
          { label: 'Yes, some networks need a closed loop to reach the true maximum' },
          { label: 'No, any closed loop of flow can always be stripped away for free', correct: true },
          { label: 'Only in a network with exactly one pipe of capacity one' },
          { label: 'Only when the source and the sink are the same depot' },
        ],
        explain: (
          <>
            Removing a closed loop of flow changes no depot's own balance of in against out, and
            it never changes the flow's own total value, so a maximum flow with no closed loop
            in it always exists.
          </>
        ),
      },
      Visual: S.PredictAcyclic,
    },
    {
      title: "For whole-number capacities the running time is proportional to the pipe count times the flow's own final value, a bound that can be exponential in the size of the input. One particular four-depot network forces an arbitrary choice of route to take two million one-unit pushes, where a breadth-first choice of route finishes in two. Capacities that are fractions still finish; capacities that are irrational, named only, can loop forever without ever reaching the true maximum.",
      body: <>An arbitrary route choice can take millions of pushes; a breadth-first choice finishes in two.</>,
      duration: 5,
      fig: 'WhySlowAndFixable',
      Visual: S.WhySlowAndFixable,
    },
    {
      title: "Ford-Fulkerson ends with a flow and a cut that prove each other optimal, and integrality guarantees that with whole-number capacities the flow is made of whole units. That is exactly what a pairing problem needs. Give every edge capacity one, put a source in front of one side and a sink behind the other, and a maximum flow is a largest set of pairs. How fast can that be done, and what does the cut look like when the capacities are all one? Bipartite matching and Hopcroft–Karp, next.",
      body: <>A flow and a cut that prove each other. Next: pairing problems, as a flow of capacity one.</>,
      duration: 5,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
