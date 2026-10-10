import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Domain } from '../lib/syllabus';

type Live = Record<string, Record<string, string>>; // domain → topic title → reel address

/** The first chapter of a domain that has a live reel, so the map opens on it. */
const firstLive = (d: Domain, live: Live) => {
  for (const [mi, m] of d.milestones.entries())
    for (const c of m.chapters) if (c.topics.some((t) => live[d.id]?.[t.title])) return { mi, key: `${m.number}-${c.number}` };
  return { mi: 0, key: null };
};

/**
 * The whole curriculum, generated from the syllabus files: pick a domain, open
 * a milestone, open a chapter, see its topics. Live topics link to their reel.
 */
export default function CurriculumMap({ domains, live }: { domains: Domain[]; live: Live }) {
  const [active, setActive] = useState(0);
  const [openM, setOpenM] = useState<number | null>(() => firstLive(domains[0], live).mi);
  const [openC, setOpenC] = useState<string | null>(() => firstLive(domains[0], live).key);
  const d = domains[active];
  const isLive = (title: string) => live[d.id]?.[title];
  const liveIn = (titles: string[]) => titles.filter((t) => isLive(t)).length;

  return (
    <div>
      <div role="tablist" aria-label="Domains" className="flex flex-wrap gap-2">
        {domains.map((dom, i) => (
          <button
            key={dom.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => {
              setActive(i);
              const f = firstLive(dom, live);
              setOpenM(f.mi);
              setOpenC(f.key);
            }}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              i === active ? 'text-espresso' : 'text-latte hover:text-crema'
            }`}
          >
            {i === active && (
              <motion.span layoutId="tab-pill" className="absolute inset-0 -z-0 rounded-full bg-crema" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">
              {dom.title}
              {Object.keys(live[dom.id] ?? {}).length > 0 && (
                <span className={`ml-2 font-mono text-[0.62rem] uppercase tracking-wider ${i === active ? 'text-cinnamon-ink' : 'text-caramel'}`}>
                  ▶ {Object.keys(live[dom.id]).length} live
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-latte">
        <span className="inline-flex items-center gap-1.5">
          <span className="rounded-full bg-caramel px-2 py-0.5 font-mono text-[0.62rem] font-semibold uppercase tracking-wider text-espresso">▶ Live</span>
          watch it now
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-mocha" />
          in production, live as soon as it is verified
        </span>
      </p>

      <AnimatePresence mode="wait">
        <motion.ol
          key={d.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 space-y-3"
        >
          {d.milestones.map((m, mi) => {
            const open = openM === mi;
            const topics = m.chapters.reduce((n, c) => n + c.topics.length, 0);
            const mLive = liveIn(m.chapters.flatMap((c) => c.topics.map((t) => t.title)));
            return (
              <li key={m.number} className="overflow-hidden rounded-[22px] border border-crema/10 bg-roast/60 backdrop-blur">
                <button
                  onClick={() => setOpenM(open ? null : mi)}
                  aria-expanded={open}
                  className="group flex w-full items-center gap-5 px-5 py-5 text-left sm:px-7"
                >
                  <span className="font-display text-4xl font-bold italic text-caramel/80 tabular-nums sm:text-5xl">
                    {String(m.number).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl font-semibold leading-tight text-crema sm:text-2xl">{m.title}</span>
                    <span className="eyebrow mt-1 block text-latte/80">
                      {m.chapters.length} chapters · {topics} topics{m.cases ? ` · ${m.cases} case studies` : ''}
                      {mLive > 0 && <span className="text-caramel"> · ▶ {mLive} live</span>}
                    </span>
                  </span>
                  <motion.span animate={{ rotate: open ? 45 : 0 }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-crema/20 text-xl text-crema">
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ul className="grid gap-2 px-4 pb-5 sm:grid-cols-2 sm:px-6">
                        {m.chapters.map((c, ci) => {
                          const key = `${m.number}-${c.number}`;
                          const cOpen = openC === key;
                          const cLive = liveIn(c.topics.map((t) => t.title));
                          return (
                            <motion.li
                              key={key}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: ci * 0.035 }}
                              className={`rounded-2xl border border-crema/8 bg-espresso/60 ${cOpen ? 'sm:col-span-2' : ''}`}
                            >
                              <button
                                onClick={() => setOpenC(cOpen ? null : key)}
                                aria-expanded={cOpen}
                                className="flex w-full items-baseline gap-3 px-4 py-3 text-left"
                              >
                                <span className="font-mono text-xs text-caramel">Ch.{c.number}</span>
                                <span className="flex-1 text-sm font-medium text-crema">{c.title}</span>
                                {cLive > 0 && (
                                  <span className="rounded-full bg-caramel px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-espresso">
                                    ▶ {cLive} live
                                  </span>
                                )}
                                <span className="font-mono text-xs text-latte/80">{c.topics.length}</span>
                              </button>
                              <AnimatePresence initial={false}>
                                {cOpen && (
                                  <motion.ol
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="grid gap-x-6 gap-y-1.5 px-4 pb-4 sm:grid-cols-2"
                                  >
                                    {c.topics.map((tp, ti) => {
                                      const href = isLive(tp.title);
                                      return href ? (
                                        <li key={ti} className="sm:col-span-2">
                                          <a
                                            href={href}
                                            className="group -mx-2 flex items-center gap-2.5 rounded-xl border border-caramel/40 bg-caramel/10 px-2 py-2 text-[0.88rem] font-medium text-crema transition hover:bg-caramel/20"
                                          >
                                            <span className="rounded-full bg-caramel px-2 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-espresso">▶ Live</span>
                                            <span className="truncate">{tp.title}</span>
                                            <span className="ml-auto text-caramel transition group-hover:translate-x-1">Watch →</span>
                                          </a>
                                        </li>
                                      ) : (
                                        <li key={ti} className="flex items-center gap-2 text-[0.82rem] text-latte/60">
                                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mocha" />
                                          <span className="truncate" title={tp.title}>{tp.title}</span>
                                          {tp.refresher && <span className="font-mono text-[0.62rem] uppercase tracking-wider text-taupe">refresher</span>}
                                        </li>
                                      );
                                    })}
                                    {c.labs > 0 && (
                                      <li className="flex items-center gap-2 text-[0.82rem] text-crema/80 sm:col-span-2">
                                        <span className="font-mono text-[0.62rem] uppercase tracking-wider text-caramel">lab</span>
                                        {c.labs === 1 ? 'Build, break, measure' : `${c.labs} build-break-measure labs`}
                                      </li>
                                    )}
                                  </motion.ol>
                                )}
                              </AnimatePresence>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </motion.ol>
      </AnimatePresence>
    </div>
  );
}
