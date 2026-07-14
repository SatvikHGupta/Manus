import { useStore, useSettings } from '../../store/index.js';

export function MarginFields() {
  const settings      = useSettings();
  const updateSetting = useStore(s => s.updateSetting);

  return (
    <div className="flex flex-col gap-2 px-4 py-2 border-b border-accent/10 dark:border-neutral-800 shrink-0">
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-neutral-400 w-16 shrink-0">Top margin</label>
        <input
          type="text"
          value={settings.marginTopText ?? ''}
          onChange={e => updateSetting('marginTopText', e.target.value)}
          placeholder="Page header text..."
          className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-accent/15 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-accent/50"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-neutral-400 w-16 shrink-0">Left margin</label>
        <input
          type="text"
          value={settings.marginLeftText ?? ''}
          onChange={e => updateSetting('marginLeftText', e.target.value)}
          placeholder="Margin notes..."
          className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-accent/15 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-accent/50"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] text-neutral-400 w-16 shrink-0">Right margin</label>
        <input
          type="text"
          value={settings.marginRightText ?? ''}
          onChange={e => updateSetting('marginRightText', e.target.value)}
          placeholder="Margin notes..."
          className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-accent/15 dark:border-neutral-700 bg-white dark:bg-neutral-800 outline-none focus:border-accent/50"
        />
      </div>
    </div>
  );
}
