export function PencilMark({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function Logo({ size = 18, showVersion = false, className = '', onClick }) {
  const content = (
    <>
      <PencilMark size={size} className="text-neutral-800 dark:text-neutral-200" />
      <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 tracking-tight">Manus</span>
      {showVersion && <span className="text-xs text-neutral-400 ml-0.5">v2</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title="Go to dashboard"
        className={`flex items-center gap-1.5 rounded-lg -m-1 p-1 hover:bg-accent/10 dark:hover:bg-neutral-800 transition-colors ${className}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`flex items-center gap-1.5 ${className}`}>{content}</div>;
}
