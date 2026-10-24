import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real burst of requests past a real queue's own capacity is shed
// as a real suffix of arrival order, genuinely and reproducibly; an
// explicit, stated failure budget is what lets that exact rate be
// read as a saturated resource behaving correctly, not a bug.
const reel: Reel = {
  steps: [
    {
      title: 'Six real requests arrive in a real, rapid burst against a service whose queue and worker together can only admit so many before the burst finishes. Once it settles, does every real request end up accounted for as admitted or shed?',
      body: (
        <>
          A real burst, six requests, one small queue.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, some requests just vanish under real load' },
          { label: 'Yes, genuinely; every one is admitted or shed, nothing left over', correct: true },
          { label: 'Only if the burst is slow enough' },
        ],
        explain: (
          <>
            Yes. Every request is accounted for.
          </>
        ),
      },
      Visual: S.BurstPredict,
    },
    {
      title: 'Measured: of six real requests, exactly three are genuinely admitted and exactly three are genuinely shed, and every one of the six is accounted for as one or the other, with no real request left over',
      body: (
        <>
          The real split, counted both ways.
        </>
      ),
      duration: 3.0,
      Visual: S.BurstReveal,
    },
    {
      title: 'Among the three real requests that get shed, could any of them have arrived earlier in the real submission order than one of the three that got admitted?',
      body: (
        <>
          The shed requests, checked against order.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, shedding could land on an arbitrary one of the six' },
          { label: 'No, genuinely; every shed request comes after every admitted one', correct: true },
          { label: 'Only if two requests happen to tie exactly' },
        ],
        explain: (
          <>
            No. Shedding follows arrival order.
          </>
        ),
      },
      Visual: S.SuffixPredict,
    },
    {
      title: 'Measured: every one of the three real shed requests genuinely falls, in submission order, after every one of the three admitted requests; the real shedding is a real suffix of arrival order, never an arbitrary subset',
      body: (
        <>
          Order, checked against admitted and shed.
        </>
      ),
      duration: 3.0,
      takeaway: 'A real, saturated queue sheds whatever arrives once it is already full, not an arbitrary pick from everything that arrived.',
      Visual: S.SuffixReveal,
    },
    {
      title: 'The identical real burst is run again, from a fresh instance of the identical service. Does it genuinely reproduce the identical three-admitted, three-shed split, or does real timing noise change the outcome?',
      body: (
        <>
          A fresh instance, the identical burst.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It changes, since real timing always varies at least a little' },
          { label: 'It reproduces exactly, genuinely; the real margins here are wide', correct: true },
          { label: 'Only if the second run happens to be run more slowly' },
        ],
        explain: (
          <>
            It reproduces exactly.
          </>
        ),
      },
      Visual: S.ReproduciblePredict,
    },
    {
      title: 'Measured: the identical real burst, run again from a fresh instance, genuinely reproduces the identical split, exactly three admitted and exactly three shed, confirming real, deterministic saturation rather than a flaky, one-off accident',
      body: (
        <>
          The identical split, reproduced exactly.
        </>
      ),
      duration: 3.0,
      takeaway: 'A failure budget is only meaningful against behaviour that reproduces; a rate that cannot be reproduced cannot be budgeted for.',
      Visual: S.ReproducibleReveal,
    },
    {
      title: "The tower::load_shed documentation and the Google SRE book's own chapter on error budgets each state this directly: load_shed is middleware for shedding load when an inner service isn't ready; an error budget is a clear, objective metric for how unreliable a service is allowed to be. Does this topic's own two measured bursts model exactly the distinction both sources draw?",
      body: (
        <>
          load_shed and the SRE book's own words.
        </>
      ),
      duration: 2.8,
      takeaway: 'An explicit failure budget turns a measured rejection rate from an unexplained rise in errors into a judged, expected cost.',
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a budget that tells overload from a bug',
      body: (
        <>
          A real burst of requests past a real queue's own capacity is shed, genuinely and reproducibly, as a real suffix of arrival order, never arbitrarily; an explicit, stated failure budget is what lets that exact, reproducible rate be read as a real, saturated resource behaving correctly, rather than an unexplained rise in errors.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
