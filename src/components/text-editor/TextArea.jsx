import { forwardRef } from 'react';

export const TextArea = forwardRef(function TextArea({ value, onChange, placeholder }, ref) {
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      data-tour="text-input"
      placeholder={placeholder ?? 'Start typing your notes here...\n\nUse <r>red</r> or <u>underline</u> tags for formatting.'}
      className="flex-1 w-full h-full resize-none outline-none bg-transparent text-base text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 leading-relaxed p-4"
      style={{ fontFamily: 'var(--font-ui)' }}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
    />
  );
});
