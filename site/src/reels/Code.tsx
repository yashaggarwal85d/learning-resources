import type { ReactNode } from 'react';
import { clamp } from './anim';

/**
 * An animated code panel: lines type in over [start, end] seconds of the
 * step, with light syntax colouring and optional highlighted lines.
 */
const KW = /\b(def|return|if|else|elif|for|in|with|as|yield|class|None|True|False|try|except|finally|raise|import|from|lambda|is|not|and|or|async|await|while|pass)\b/;
const TOKEN = /(#.*$)|('[^']*'|"[^"]*")|(@\w+(?:\([^)]*\))?)|(\b\d[\d_]*\b)|(\b[A-Za-z_]\w*\b)|(\s+)|(.)/g;

function colour(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    const [tok, comment, str, deco, num, word] = m;
    const cls = comment ? 'text-taupe italic' : str ? 'text-[#e3b07a]' : deco ? 'text-cinnamon' : num ? 'text-caramel' : word && KW.test(word) ? 'text-caramel font-semibold' : 'text-crema';
    out.push(
      <span key={i++} className={cls}>
        {tok}
      </span>,
    );
  }
  return out;
}

export function Code({
  lines,
  t,
  start = 0,
  end = 1.2,
  highlight = [],
  title,
  dim = false,
}: {
  lines: string[];
  t: number;
  start?: number;
  end?: number;
  highlight?: number[]; // 0-based lines to emphasise
  title?: string;
  dim?: boolean;
}) {
  const total = lines.reduce((n, l) => n + l.length + 1, 0);
  let budget = clamp((t - start) / Math.max(0.01, end - start)) * total;
  return (
    <div className={`rounded-2xl border border-crema/10 bg-espresso/85 font-mono text-[clamp(0.62rem,1.55vw,0.95rem)] leading-[1.7] shadow-[0_20px_60px_rgba(0,0,0,.45)] transition-opacity ${dim ? 'opacity-40' : ''}`}>
      {title && (
        <div className="flex items-center gap-1.5 border-b border-crema/8 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-cherry/80" />
          <span className="h-2 w-2 rounded-full bg-caramel/80" />
          <span className="h-2 w-2 rounded-full bg-mocha" />
          <span className="ml-2 text-[0.68em] uppercase tracking-[0.14em] text-taupe">{title}</span>
        </div>
      )}
      <pre className="overflow-x-auto px-3 py-2.5 sm:px-4">
        {lines.map((l, i) => {
          const shown = Math.max(0, Math.min(l.length, Math.floor(budget)));
          budget -= l.length + 1;
          const hl = highlight.includes(i) && shown === l.length;
          return (
            <div key={i} className={`-mx-2 whitespace-pre rounded px-2 transition-colors duration-300 ${hl ? 'bg-caramel/15' : ''}`}>
              {colour(l.slice(0, shown))}
              {shown < l.length && shown > 0 && <span className="text-caramel">▌</span>}
              {shown === 0 ? '\u00a0' : null}
            </div>
          );
        })}
      </pre>
    </div>
  );
}
