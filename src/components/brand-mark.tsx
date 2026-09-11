export function ScalesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 5v34" />
      <path d="M10 12h28" />
      <path d="M24 5l-4 4h8l-4-4z" fill="currentColor" stroke="none" />
      <path d="M10 12l-6 12a6 6 0 0 0 12 0l-6-12z" />
      <path d="M38 12l-6 12a6 6 0 0 0 12 0l-6-12z" />
      <path d="M16 43h16" />
      <path d="M24 39v4" />
    </svg>
  );
}

export function BrandMark({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <ScalesIcon className={iconClassName ?? "h-6 w-6"} />
      <span className={`font-serif tracking-tight ${textClassName ?? "text-lg"}`}>
        Lawadvisory
      </span>
    </span>
  );
}
