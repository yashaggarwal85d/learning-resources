// Progress lives in this browser only (no accounts). Storage can be missing or
// throw (private windows, blocked site data), so every access is guarded.
export type TopicProgress = { step: number; steps: number; done: boolean };
const KEY = 'le.progress.v1';
const LAST = 'le.last.v1';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* progress is a convenience; ignore */
  }
};

export const allProgress = () => read<Record<string, TopicProgress>>(KEY, {});
export const getProgress = (id: string): TopicProgress | undefined => allProgress()[id];
export function saveProgress(id: string, p: TopicProgress) {
  const all = allProgress();
  const prev = all[id];
  all[id] = { ...p, done: p.done || !!prev?.done };
  write(KEY, all);
}
export const lastTopic = (domain: string) => read<Record<string, string>>(LAST, {})[domain];
export function setLastTopic(domain: string, id: string) {
  const all = read<Record<string, string>>(LAST, {});
  all[domain] = id;
  write(LAST, all);
}
