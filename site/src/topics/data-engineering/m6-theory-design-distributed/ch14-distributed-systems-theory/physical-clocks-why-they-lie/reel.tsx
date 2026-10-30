import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: quartz drift at Spanner's own quoted worst-case figure, computed to seconds a
// day; RFC 5905's offset/delay formulas reproduced on a worked example and shown biased under
// an asymmetric path; a twenty-four-hour linear leap smear shown disagreeing with an abrupt
// step by nearly half a second at the midpoint; last-write-wins under skew losing the later
// write, and a bounded-error clock reading the identical pair and flagging it instead of
// guessing. No literal digits anywhere (duration numbers are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: two synchronised nodes, one register, and a later write that vanishes",
      body: (
        <>
          Two nodes accept writes to the shop's stock register a short moment apart, in the
          correct real-time order. The store keeps the earlier one. Both nodes run NTP and both
          report themselves synchronised. How can a synchronised clock put the later write in
          the past, and whose sale just disappeared?
        </>
      ),
      duration: 4.8,
      fig: "two nodes, both reporting themselves synchronised by NTP, accept a pair of writes a short moment apart in the correct real-time order — the store keeps the earlier one. Whose write just vanished, and how?",
      Visual: S.Hook,
    },
    {
      title: 'Predict: whose sale is actually gone?',
      body: (
        <>
          Pick carefully. Is it the node whose clock happens to run faster, the write that
          actually happened later in real time, or does it depend on something else entirely
          that neither answer captures?
        </>
      ),
      duration: 2.8,
      fig: "is the discarded write always the one from the node with the faster clock, always the write that happened later in real time, or neither?",
      predict: {
        options: [
          { label: 'The node with the faster clock — that node always loses' },
          { label: "The later write — whichever write genuinely happened second in real time, however the clocks are running", correct: true },
        ],
        explain: (
          <>
            The later write, always. A faster clock doesn't lose; it wins, by stamping an
            earlier real event with a larger number than a later real event gets from a slower
            or correct clock. Last-write-wins keeps the larger timestamp, so the genuinely later
            write is the one silently thrown away, regardless of which node happened to make it.
          </>
        ),
      },
      Visual: S.PredictWhichWriteLost,
    },
    {
      title: "Reveal: a crystal drifts continuously, and NTP's own fix has its own error bar",
      body: (
        <>
          A quartz oscillator doesn't hold a fixed rate. It runs a little fast or slow, drifting
          continuously, and that drift adds up to real seconds over a day. NTP estimates and
          corrects it from a round trip, but that estimate is only as good as the path being
          symmetric. An asymmetric path biases the correction itself.
        </>
      ),
      duration: 4.8,
      fig: "a quartz oscillator's continuous drift adds up to real seconds over a day, and NTP's own correction for it is only as accurate as the network path is symmetric",
      Visual: S.RevealDriftAndNtp,
    },
    {
      title: 'Reveal: a leap second, smeared by one clock and stepped by another',
      body: (
        <>
          One way to handle an extra second is to spread it out gradually over a full day. The
          other is to step the clock abruptly the instant it occurs. A clock doing the first and
          a clock doing the second disagree with each other for the entire day, even though both
          are behaving exactly as designed.
        </>
      ),
      duration: 4.8,
      fig: "a clock that smears a leap second gradually over a day and a clock that steps it abruptly disagree with each other for that whole day, even though both are behaving exactly as designed",
      takeaway: "A leap second handled two different, both-correct ways is a full day of disagreement between clocks, not a one-second blip.",
      Visual: S.RevealLeapSmear,
    },
    {
      title: "Reveal: wall clock, monotonic clock, and the pause neither survives",
      body: (
        <>
          A wall clock can jump, forward or back, whenever it's corrected. A monotonic clock
          never jumps, but it means nothing on any other machine. And a process that's paused,
          by garbage collection or by its whole virtual machine being moved, can hold a stale
          reading from either clock for an amount of time nobody bounded in advance.
        </>
      ),
      duration: 4.8,
      fig: "a wall clock can jump when corrected; a monotonic clock never jumps but means nothing on another machine; and a paused process can hold either reading stale for an unbounded stretch",
      Visual: S.RevealWallVsMonotonic,
    },
    {
      title: 'Reveal: an honest interval beats a confident, wrong point',
      body: (
        <>
          A bounded-error clock doesn't claim to know the instant. It hands back a range: no
          earlier than this, no later than that. Two ranges that overlap are a clock saying,
          correctly, that it cannot order those two events. A lease has to last longer than the
          worst skew the two clocks involved could ever disagree by, exactly for this reason.
        </>
      ),
      duration: 4.8,
      fig: "a bounded-error clock hands back a range instead of a single instant, so two overlapping ranges honestly say the clock cannot order those two events, rather than silently guessing one",
      Visual: S.RevealBoundedClock,
    },
    {
      title: 'Reveal: the lab, the same skewed pair, read two different ways',
      body: (
        <>
          Run it directly. Under skew, last-write-wins keeps the wrong write, confidently, with
          no sign anything went wrong. Read through a bounded-error clock instead, the identical
          pair comes back with overlapping ranges: an honest "these cannot be ordered," rather
          than a wrong answer dressed up as a right one.
        </>
      ),
      duration: 4.8,
      fig: "last-write-wins reads the skewed pair and confidently keeps the wrong write with no sign anything went wrong; a bounded-error clock reads the identical pair and honestly flags it as unorderable",
      takeaway: "The same skewed pair is a silent wrong answer under last-write-wins, and an honest \"cannot order\" under a bounded-error clock.",
      Visual: S.RevealLabComparison,
    },
    {
      title: 'Recap',
      body: (
        <>
          A crystal drifts continuously, and NTP's correction for it carries its own error bar.
          One leap second handled two correct ways is a full day of disagreement, not an
          instant. Neither clock type orders events across machines, and a pause defeats even a
          synchronised one. A bounded-error clock turns a silent wrong guess into an honest
          admission of what it doesn't know.
        </>
      ),
      duration: 4.8,
      fig: "a crystal drifts continuously with its own error bar on the correction; a leap second is a full day of disagreement, not an instant; no clock orders events across machines; and a bounded clock admits what it doesn't know instead of guessing",
      takeaway: "A bounded-error clock's real advantage isn't more accuracy — it's honestly admitting how inaccurate it might be.",
      Visual: S.Recap,
    },
    {
      title: "Prove it: is a lease sized to last month's typical clock skew safe?",
      body: (
        <>
          A team measures the typical clock skew between two machines over the last month and
          grants a lease exactly that long. Is that length actually safe for the lease to rely
          on?
        </>
      ),
      duration: 2.8,
      fig: "a lease is sized to last month's typical measured clock skew between two machines — is that length safe to rely on?",
      predict: {
        options: [
          { label: 'Yes — a month of real measurements is a solid basis for the lease length' },
          { label: "No — a lease has to survive the worst skew that can occur, not the typical one; a single bad day breaks it", correct: true },
        ],
        explain: (
          <>
            No. A lease is only safe if it outlasts the maximum skew the two clocks could ever
            disagree by during its own length, not whatever skew happened to be typical over some
            measurement window. A single unusually bad day, a delayed NTP correction, a
            temperature swing, is exactly the case the "typical" number was computed to ignore,
            and exactly the case a lease has to survive.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
