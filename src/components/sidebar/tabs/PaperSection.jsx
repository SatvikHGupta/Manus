import { FileText } from 'lucide-react';
import { Section }       from '../../controls/Section.jsx';
import { SliderControl } from '../../controls/SliderControl.jsx';
import { ToggleControl } from '../../controls/ToggleControl.jsx';
import { ColorSwatches } from '../../controls/ColorSwatches.jsx';
import { PAPER_COLORS, LINE_COLORS } from '../../../constants/colors.js';
import { PAGE_SIZE_PRESETS }         from '../../../constants/paper.js';
import { PAPER_STYLE_PRESETS }       from '../../../constants/paper-presets.js';
import { useStore, useSettings } from '../../../store/index.js';

export function PaperSection() {
  const s  = useSettings();
  const up = useStore(st => st.updateSetting);
  const upMany = useStore(st => st.updateSettings);

  return (
    <Section id="paper" title="Paper" icon={FileText}>
      { }
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Quick styles</span>
        <div className="flex flex-wrap gap-1">
          {PAPER_STYLE_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => upMany(p.settings)}
              className="px-2 py-1 rounded text-[11px] transition-colors bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      { }
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Type</span>
        <div className="grid grid-cols-3 gap-1">
          {['lined', 'grid', 'dot', 'blank', 'cornell', 'indian'].map(t => (
            <button
              key={t}
              onClick={() => up('paperType', t)}
              className={`px-2 py-1 rounded text-[11px] capitalize transition-colors ${s.paperType === t ? 'bg-accent dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      { }
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Page size</span>
        <div className="flex flex-wrap gap-1">
          {PAGE_SIZE_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => upMany({ pageWidth: p.width, pageHeight: p.height })}
              className={`px-2 py-1 rounded text-[11px] transition-colors ${s.pageWidth === p.width && s.pageHeight === p.height ? 'bg-accent dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 hover:opacity-80'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      { }
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Paper color</span>
        <ColorSwatches colors={PAPER_COLORS} value={s.paperColor} onChange={v => up('paperColor', v)} />
      </div>

      { }
      {s.paperType !== 'blank' && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Line color</span>
          <ColorSwatches colors={LINE_COLORS} value={s.paperLineColor} onChange={v => up('paperLineColor', v)} />
        </div>
      )}

      <ToggleControl label="Paper texture" value={s.paperTextureEnabled} onChange={v => up('paperTextureEnabled', v)} />
      {s.paperTextureEnabled && <SliderControl label="Texture amount" value={s.paperTextureAmount} min={0} max={0.3} step={0.01} onChange={v => up('paperTextureAmount', v)} />}

      <ToggleControl label="Page shadow"   value={s.paperShadowEnabled}  onChange={v => up('paperShadowEnabled', v)} />

      <ToggleControl label="Aged paper"    value={s.paperAgeEnabled}     onChange={v => up('paperAgeEnabled', v)} />
      {s.paperAgeEnabled && <SliderControl label="Age amount" value={s.paperAgeAmount} min={0} max={1} step={0.05} onChange={v => up('paperAgeAmount', v)} />}
    </Section>
  );
}
