import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Domain } from '../lib/syllabus';

/**
 * The whole curriculum, generated from the syllabus files: pick a domain, open
 * a milestone, open a chapter, see its topics. Nothing is published yet, so
 * every topic shows its status.
 */
export default function CurriculumMap({ domains }: { domains: Domain[] }) {
  const [active, setActive] = useState(0);
  const [openM, setOpenM] = useState<number | null>(0);
  const [openC, setOpenC] = useState<string | null>(null);
  const d = domains[active];

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
              setOpenM(0);
              setOpenC(null);
            }}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              i === active ? 'text-espresso' : 'text-latte hover:text-crema'
            }`}
          >
            {i === active && (
              <motion.span layoutId="tab-pill" className="absolute inset-0 -z-0 rounded-full bg-crema" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{dom.title}</span>
          </button>
        ))}
      </div>

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
                                    {c.topics.map((tp, ti) => (
                                      <li key={ti} className="flex items-center gap-2 text-[0.82rem] text-latte">
                                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tp.refresher ? 'bg-mocha' : 'bg-caramel/70'}`} />
                                        <span className="truncate" title={tp.title}>{tp.title}</span>
                                        {tp.refresher && <span className="font-mono text-[0.62rem] uppercase tracking-wider text-taupe">refresher</span>}
                                      </li>
                                    ))}
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
