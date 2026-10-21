import type { ComponentType, ReactNode } from 'react';

/** What a step's visual receives every frame. */
export type StepCtx = {
  t: number; // seconds since the step started
  p: number; // 0..1 through the step's animation
  portrait: boolean;
  answer: number | null; // the learner's choice on a predict step
};

export type Predict = {
  options: { label: string; correct?: boolean }[];
  explain: ReactNode; // shown once the learner has answered
};

export type Step = {
  title: string;
  body: ReactNode;
  duration: number; // seconds of animation before the step waits
  hold?: boolean; // wait for the learner at the end (default true)
  predict?: Predict;
  /** The figure's name in its frame, e.g. "ratio to n²" (optional; the frame shows the step number either way). */
  fig?: string;
  /** One sentence the learner keeps: shown under the description once the step's animation ends, and on the debrief. */
  takeaway?: string;
  Visual: ComponentType<StepCtx>;
};

export type Reel = { steps: Step[] };
