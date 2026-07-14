import { Type } from 'lucide-react';
import { Section }       from '../../controls/Section.jsx';
import { SliderControl } from '../../controls/SliderControl.jsx';
import { ColorSwatches } from '../../controls/ColorSwatches.jsx';
import { INK_COLORS }    from '../../../constants/colors.js';
import { useStore, useSettings } from '../../../store/index.js';

export function FontSection() {
  const settings      = useSettings();
  const updateSetting = useStore(s => s.updateSetting);
  const setFontPickerOpen = useStore(s => s.setFontPickerOpen);

  return (
    <Section id="font" title="Font" icon={Type}>
      <button
        onClick={() => setFontPickerOpen(true)}
        data-tour="font-picker"
        className="w-full text-left px-3 py-2 rounded-lg border border-accent/15 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors truncate"
        style={{ fontFamily: settings.fontFamily }}
      >
        {settings.fontFamily.startsWith('HND_')
          ? settings.fontFamily.replace(/^HND_/, '').replace(/_/g, ' ')
          : settings.fontFamily}
      </button>

      <SliderControl label="Size"           value={settings.fontSize}      min={8}  max={64}  step={1}   onChange={v => updateSetting('fontSize', v)} />
      <SliderControl label="Letter spacing" value={settings.letterSpacing} min={-5} max={15}  step={0.5} onChange={v => updateSetting('letterSpacing', v)} />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Ink color</span>
        <ColorSwatches colors={INK_COLORS} value={settings.fontColor} onChange={v => updateSetting('fontColor', v)} />
      </div>
    </Section>
  );
}
