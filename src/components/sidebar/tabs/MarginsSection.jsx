import { Columns } from 'lucide-react';
import { Section }       from '../../controls/Section.jsx';
import { SliderControl } from '../../controls/SliderControl.jsx';
import { ToggleControl } from '../../controls/ToggleControl.jsx';
import { ColorSwatches } from '../../controls/ColorSwatches.jsx';
import { MARGIN_COLORS } from '../../../constants/colors.js';
import { useStore, useSettings } from '../../../store/index.js';

export function MarginsSection() {
  const s  = useSettings();
  const up = useStore(st => st.updateSetting);

  return (
    <Section id="margins" title="Margins" icon={Columns}>
      <ToggleControl label="Left margin"  value={s.paperMarginLeftEnabled}  onChange={v => up('paperMarginLeftEnabled', v)} />
      {s.paperMarginLeftEnabled && (
        <>
          <SliderControl label="Position"  value={s.paperMarginLeft}          min={20} max={200} step={5} onChange={v => up('paperMarginLeft', v)} />
          <SliderControl label="Thickness" value={s.paperMarginLeftThickness} min={1}  max={8}   step={1} onChange={v => up('paperMarginLeftThickness', v)} />
        </>
      )}

      <ToggleControl label="Right margin" value={s.paperMarginRightEnabled} onChange={v => up('paperMarginRightEnabled', v)} />
      {s.paperMarginRightEnabled && (
        <>
          <SliderControl label="Position"  value={s.paperMarginRight}          min={20} max={200} step={5} onChange={v => up('paperMarginRight', v)} />
          <SliderControl label="Thickness" value={s.paperMarginRightThickness} min={1}  max={8}   step={1} onChange={v => up('paperMarginRightThickness', v)} />
        </>
      )}

      <ToggleControl label="Top margin"   value={s.paperMarginTopEnabled}   onChange={v => up('paperMarginTopEnabled', v)} />
      {s.paperMarginTopEnabled && (
        <>
          <SliderControl label="Position"  value={s.paperMarginTop}          min={20} max={200} step={5} onChange={v => up('paperMarginTop', v)} />
          <SliderControl label="Thickness" value={s.paperMarginTopThickness} min={1}  max={8}   step={1} onChange={v => up('paperMarginTopThickness', v)} />
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Margin line color</span>
        <ColorSwatches colors={MARGIN_COLORS} value={s.paperMarginColor} onChange={v => up('paperMarginColor', v)} />
      </div>
    </Section>
  );
}
