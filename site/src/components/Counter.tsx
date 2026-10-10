import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'motion/react';

/** A number that counts up once it scrolls into view. */
export default function Counter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setV(value);
    const c = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, value]);
  return (
    <div ref={ref}>
      <div className="font-display text-4xl font-bold tabular-nums text-crema sm:text-5xl">{v.toLocaleString('en-US')}</div>
      <div className="eyebrow mt-1 text-latte/80">{label}</div>
    </div>
  );
}
