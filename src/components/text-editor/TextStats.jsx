import { AlertTriangle } from 'lucide-react';
import { usePageStats } from '../../hooks/usePageStats.js';
import { VoiceInputButton } from './VoiceInputButton.jsx';

export function TextStats({ speech }) {
  const { words, chars, lines, estimatedLines, pageCapacity, overflowing, unclosedTag } = usePageStats();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-accent/10 dark:border-neutral-800 text-[10px] text-neutral-400 shrink-0">
      <span className="flex items-center gap-2">
        {words}w · {chars}c · {lines}ln
        {speech && <VoiceInputButton speech={speech} />}
        {unclosedTag && (
          <span className="flex items-center gap-1 text-amber-500" title="A color/size/underline/strikethrough tag is still open - everything after it will keep that formatting">
            <AlertTriangle size={10} />
            Unclosed tag
          </span>
        )}
      </span>
      {overflowing && (
        <span className="flex items-center gap-1 text-amber-500">
          <AlertTriangle size={10} />
          ~{estimatedLines} lines · page fits ~{pageCapacity}
        </span>
      )}
    </div>
  );
}
