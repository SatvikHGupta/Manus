import { AnimatePresence, motion } from 'motion/react';
import { useState, useRef }   from 'react';
import { X, Upload, Trash2 }  from 'lucide-react';
import { useStore, useSettings } from '../../store/index.js';
import { useCustomFonts }     from '../../store/index.js';
import { BUILTIN_FONTS, FONT_CATEGORIES } from '../../constants/fonts.js';
import { LOCAL_FONTS } from '../../utils/fonts.js';
import { ConfirmModal }       from '../shared/ConfirmModal.jsx';
import { useEscapeKey } from '../../hooks/useEscapeKey.js';

export function FontPickerModal() {
  const open              = useStore(s => s.fontPickerOpen);
  const setOpen           = useStore(s => s.setFontPickerOpen);
  useEscapeKey(open, () => setOpen(false));
  const settings          = useSettings();
  const updateSetting     = useStore(s => s.updateSetting);
  const customFonts       = useCustomFonts();
  const uploadFont        = useStore(s => s.uploadFont);
  const removeCustomFont  = useStore(s => s.removeCustomFont);
  const fontUploadError   = useStore(s => s.fontUploadError);
  const clearError        = useStore(s => s.clearFontUploadError);

  const [category, setCategory]     = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const builtinFiltered = BUILTIN_FONTS.filter(f => category === 'all' || f.category === category);
  const localFiltered   = LOCAL_FONTS.filter(f => category === 'all' || f.category === category);

  const allFonts = [
    ...(category === 'all' || category === 'custom' ? customFonts.map(f => ({ ...f, isCustom: true })) : []),
    ...localFiltered,
    ...builtinFiltered,
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFont(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          { }
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85dvh] flex flex-col"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
          >
            { }
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-accent/10 dark:border-neutral-800">
              <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">Choose font</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Upload size={12} />
                  Upload font
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <X size={14} className="text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleFileChange} />

            { }
            <div className="flex gap-1 px-4 py-2.5 overflow-x-auto shrink-0">
              {FONT_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-full text-[11px] capitalize whitespace-nowrap transition-colors ${category === c ? 'bg-accent dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            { }
            {fontUploadError && (
              <div className="mx-4 px-3 py-2 text-xs text-red-500 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-between">
                {fontUploadError}
                <button onClick={clearError} className="ml-2 opacity-60 hover:opacity-100"><X size={12} /></button>
              </div>
            )}

            { }
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {allFonts.map(font => {
                const active = settings.fontFamily === font.family;
                return (
                  <div
                    key={font.family}
                    className={`relative group rounded-xl border-2 p-3 cursor-pointer transition-all ${active ? 'border-neutral-800 dark:border-neutral-200' : 'border-accent/10 dark:border-neutral-800 hover:border-accent/25 dark:hover:border-neutral-600'}`}
                    onClick={() => { updateSetting('fontFamily', font.family); setOpen(false); }}
                  >
                    <span className="text-xl leading-tight block text-neutral-900 dark:text-neutral-100 whitespace-nowrap overflow-x-auto" style={{ fontFamily: font.family }}>
                      My Handwriting is bad.
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1 block truncate">{font.name}</span>

                    { }
                    {font.isCustom && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget(font.name); }}
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-red-50 dark:bg-red-950 hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={10} className="text-red-500" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      { }
      <ConfirmModal
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget}"?`}
        message="This font will be removed from this device."
        confirmLabel="Delete"
        danger
        onConfirm={() => { removeCustomFont(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </AnimatePresence>
  );
}
