import { Mic } from 'lucide-react';
import { Tooltip } from '../shared/Tooltip.jsx';

export function VoiceInputButton({ speech }) {
  const { supported, listening, toggle, error } = speech;

  if (!supported) return null;

  return (
    <Tooltip
      label={error || (listening ? 'Stop dictation' : "Dictate (uses your browser's speech service)")}
      side="top"
    >
      <button
        onClick={toggle}
        aria-pressed={listening}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors ${
          listening
            ? 'bg-red-500 text-white'
            : error
              ? 'text-red-500'
              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
      >
        {listening ? (
          <span className="relative flex w-3 h-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75 animate-ping" />
            <Mic size={10} className="relative" />
          </span>
        ) : (
          <Mic size={10} />
        )}
      </button>
    </Tooltip>
  );
}
