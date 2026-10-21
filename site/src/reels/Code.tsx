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
    const cls = comment ? 'text-taupe italic' : str ? 'text-cinnamon' : deco ? 'text-latte' : num ? 'text-caramel' : word && KW.test(word) ? 'text-caramel font-semibold' : 'text-crema';
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
  // Size the text so the longest line fits: code never scrolls sideways (which would also swallow swipes on phones).
  const longest = Math.max(20, ...lines.map((l) => l.length));
  const fontSize = `min(0.95rem, calc((100cqw - 2.2rem) / ${(longest * 0.61).toFixed(2)}))`;
  let budget = clamp((t - start) / Math.max(0.01, end - start)) * total;
  return (
    <div style={{ containerType: 'inline-size' }} className={`rounded-md border border-line bg-panel/90 font-mono leading-[1.7] portrait:leading-[1.4] shadow-[0_24px_60px_rgba(0,0,0,.5)] transition-opacity ${dim ? 'opacity-40' : ''}`}>
      {title && (
        <div className="flex items-center gap-2 border-b border-line px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-crema/70" />
          <span className="text-[0.62rem] uppercase tracking-[0.16em] text-taupe">{title}</span>
        </div>
      )}
      <pre className="overflow-hidden px-3 py-2.5 sm:px-4" style={{ fontSize, touchAction: 'pan-y' }}>
        {lines.map((l, i) => {
          const shown = Math.max(0, Math.min(l.length, Math.floor(budget)));
          budget -= l.length + 1;
          const hl = highlight.includes(i) && shown === l.length;
          return (
            <div key={i} className={`-mx-2 whitespace-pre rounded px-2 transition-colors duration-300 ${hl ? 'bg-caramel/10 shadow-[inset_2px_0_0_var(--color-caramel)]' : ''}`}>
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
