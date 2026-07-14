import { useState } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { useStore, useCurrentPage } from '../../store/index.js';
import { TEMPLATES } from '../../constants/templates.js';
import { ConfirmModal } from '../shared/ConfirmModal.jsx';

export function TextTemplates() {
  const [open, setOpen]             = useState(false);
  const [pendingTpl, setPendingTpl] = useState(null);
  const updatePageText      = useStore(s => s.updatePageText);
  const updateSetting       = useStore(s => s.updateSetting);
  const page                = useCurrentPage();

  const applyNow = (tpl) => {
    if (tpl.text !== null && tpl.text !== undefined) {
      updatePageText(tpl.text);
    }
    if (tpl.settings) {
      Object.entries(tpl.settings).forEach(([k, v]) => updateSetting(k, v));
    }
    setOpen(false);
  };

  const apply = (tpl) => {
    const hasContent = (page?.text ?? '').trim().length > 0;
    if (hasContent && tpl.text) {
      setPendingTpl(tpl);
      return;
    }
    applyNow(tpl);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <FileText size={12} />
        Templates
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-neutral-900 border border-accent/15 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden min-w-[200px]">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => apply(tpl)}
                className="flex flex-col w-full px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left border-b border-accent/10 dark:border-neutral-800 last:border-0"
              >
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-100">{tpl.name}</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">{tpl.description}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        open={pendingTpl !== null}
        title={`Apply "${pendingTpl?.name}" template?`}
        message="This will replace the current page text."
        confirmLabel="Apply"
        onConfirm={() => { const tpl = pendingTpl; setPendingTpl(null); applyNow(tpl); }}
        onCancel={() => setPendingTpl(null)}
      />
    </div>
  );
}
