import { Copy } from 'lucide-react';
import { useStore } from '../../store/index.js';
import { COLOR_TAG_LABELS, COLOR_TAG_MAP, FONT_SIZE_EXAMPLES } from '../../constants/tags.js';
import { Modal } from '../shared/Modal.jsx';

// Copies a wrapped tag pair to the clipboard and surfaces a toast so the
// popup doubles as a quick-insert reference instead of read-only text.
function useCopyTag() {
  const addToast = useStore(s => s.addToast);
  return async (tag) => {
    try {
      await navigator.clipboard.writeText(`<${tag}></${tag}>`);
      addToast({ type: 'success', message: `Copied <${tag}> tag` });
    } catch {
      addToast({ type: 'error', message: 'Could not copy to clipboard' });
    }
  };
}

function ColorChip({ tag, info, onCopy }) {
  return (
    <button
      onClick={() => onCopy(tag)}
      className="group flex items-center gap-2.5 p-2 rounded-xl border border-accent/10 dark:border-neutral-800 hover:border-accent/30 dark:hover:border-neutral-600 hover:bg-accent/5 dark:hover:bg-neutral-800/60 transition-colors text-left"
    >
      <span
        className="w-6 h-6 rounded-full shrink-0 ring-1 ring-black/10 dark:ring-white/15 shadow-sm"
        style={{ backgroundColor: COLOR_TAG_MAP[tag] }}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <code className="text-[11px] font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">&lt;{tag}&gt;</code>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200 truncate">{info.name}</span>
        </span>
        <span className="block text-[11px] text-neutral-400 truncate">{info.usage}</span>
      </span>
      <Copy size={12} className="shrink-0 text-neutral-300 dark:text-neutral-600 group-hover:text-accent dark:group-hover:text-white transition-colors" />
    </button>
  );
}

function FormatChip({ tag, name, preview, onCopy }) {
  return (
    <button
      onClick={() => onCopy(tag)}
      className="group flex items-center gap-2.5 p-2 rounded-xl border border-accent/10 dark:border-neutral-800 hover:border-accent/30 dark:hover:border-neutral-600 hover:bg-accent/5 dark:hover:bg-neutral-800/60 transition-colors text-left"
    >
      <span className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300" style={preview}>
        Aa
      </span>
      <span className="min-w-0 flex-1">
        <code className="text-[11px] font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">&lt;{tag}&gt;</code>
        <span className="ml-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200">{name}</span>
      </span>
      <Copy size={12} className="shrink-0 text-neutral-300 dark:text-neutral-600 group-hover:text-accent dark:group-hover:text-white transition-colors" />
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 mt-5 first:mt-0">
      {children}
    </h3>
  );
}

export function ColorTagsModal() {
  const open    = useStore(s => s.colorTagsModalOpen);
  const setOpen = useStore(s => s.setColorTagsModalOpen);
  const copyTag = useCopyTag();

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Color tags" maxWidth="max-w-lg">
      <div className="px-6 pb-6 pt-4">
        <p className="text-xs text-neutral-400 mb-1">
          Tap any tag to copy it, then wrap your text with it. Tags are stripped on export.
        </p>

        <SectionLabel>Colors</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {Object.entries(COLOR_TAG_LABELS).map(([tag, info]) => (
            <ColorChip key={tag} tag={tag} info={info} onCopy={copyTag} />
          ))}
        </div>

        <SectionLabel>Formatting</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <FormatChip tag="u" name="Underline" onCopy={copyTag} preview={{ textDecoration: 'underline' }} />
          <FormatChip tag="s" name="Strikethrough" onCopy={copyTag} preview={{ textDecoration: 'line-through' }} />
        </div>

        <SectionLabel>Font size</SectionLabel>
        <p className="text-[11px] text-neutral-400 mb-2 -mt-1">
          Wrap text with a size tag, e.g. &lt;f24&gt;bigger&lt;/f24&gt;.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FONT_SIZE_EXAMPLES.map(size => (
            <button
              key={size}
              onClick={() => copyTag(`f${size}`)}
              title={`Copy <f${size}> tag`}
              className="group flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg border border-accent/10 dark:border-neutral-800 hover:border-accent/30 dark:hover:border-neutral-600 hover:bg-accent/5 dark:hover:bg-neutral-800/60 transition-colors"
            >
              <span
                className="font-semibold text-neutral-600 dark:text-neutral-300 leading-none"
                style={{ fontSize: Math.min(size, 22) }}
              >
                Aa
              </span>
              <code className="text-[10px] font-mono text-neutral-400 group-hover:text-accent dark:group-hover:text-white transition-colors">f{size}</code>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
