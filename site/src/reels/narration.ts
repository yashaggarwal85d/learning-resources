import { useCallback, useEffect, useRef, useState } from 'react';

// Narration for a reel: clips generated in-house (site/narration/), one per
// step plus one per predict answer, with line timings for captions.
export type Clip = { hash: string; duration: number; lines: { text: string; start: number; end: number }[] };
type Manifest = { topic: string; voice: string; clips: Record<string, Clip> };

const SOUND = 'le.sound.v1';
const readSound = () => {
  try {
    return localStorage.getItem(SOUND) === 'on';
  } catch {
    return false;
  }
};
const base = (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`) as string;
const opus = () => typeof Audio !== 'undefined' && new Audio().canPlayType('audio/webm; codecs="opus"') !== '';

export function useNarration(topicId: string) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [on, setOn] = useState(false);
  const [clipId, setClipId] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setOn(readSound());
    let gone = false;
    fetch(`${base}audio/${topicId}/manifest.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => !gone && setManifest(m))
      .catch(() => {});
    const a = new Audio();
    a.preload = 'auto';
    a.onplay = () => setPlaying(true);
    a.onpause = a.onended = () => setPlaying(false);
    audio.current = a;
    return () => {
      gone = true;
      a.pause();
      a.src = '';
    };
  }, [topicId]);

  // Caption clock: follows the audio while it plays.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      setTime(audio.current?.currentTime ?? 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const has = useCallback((id: string) => !!manifest?.clips[id], [manifest]);

  /** Play a clip from the start, or resume it if it is already loaded (unless `restart`). */
  const play = useCallback(
    (id: string, restart = false) => {
      const a = audio.current;
      if (!a || !manifest?.clips[id]) return;
      if (clipId !== id) {
        a.src = `${base}audio/${topicId}/${id}.${opus() ? 'webm' : 'mp3'}`;
        setClipId(id);
        setTime(0);
      } else if (restart) {
        a.currentTime = 0;
        setTime(0);
      } else if (a.ended) {
        return;
      }
      a.play().catch(() => {});
    },
    [manifest, clipId, topicId],
  );
  const pause = useCallback(() => audio.current?.pause(), []);
  const stop = useCallback(() => {
    audio.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    setOn((v) => {
      const next = !v;
      try {
        localStorage.setItem(SOUND, next ? 'on' : 'off');
      } catch {
        /* preference is a convenience */
      }
      if (!next) audio.current?.pause();
      return next;
    });
  }, []);

  const clip = clipId ? manifest?.clips[clipId] ?? null : null;
  return { available: !!manifest, on, toggle, has, play, pause, stop, clipId, clip, time, playing };
}
