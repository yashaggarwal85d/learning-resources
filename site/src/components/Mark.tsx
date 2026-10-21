/** The site's mark: three lines of a wireframe surface and its saddle point (the one red dot). */
export default function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden="true">
      <path d="M2.5 8.5C6 5 9 12 12 8.5s6 3.5 9.5 0" opacity=".4" />
      <path d="M2.5 12.5C6 9 9 16 12 12.5s6 3.5 9.5 0" opacity=".7" />
      <path d="M2.5 16.5C6 13 9 20 12 16.5s6 3.5 9.5 0" />
      <circle cx="12" cy="12.5" r="1.7" fill="#ff6b5e" stroke="none" />
    </svg>
  );
}
