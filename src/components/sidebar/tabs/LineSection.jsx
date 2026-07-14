import { AlignLeft } from 'lucide-react';
import { Section }       from '../../controls/Section.jsx';
import { SliderControl } from '../../controls/SliderControl.jsx';
import { ToggleControl } from '../../controls/ToggleControl.jsx';
import { useStore, useSettings } from '../../../store/index.js';

export function LineSection() {
  const s  = useSettings();
  const up = useStore(st => st.updateSetting);

  return (
    <Section id="line" title="Lines" icon={AlignLeft}>
      <SliderControl label="Line spacing" value={s.lineSpacing} min={16} max={80} step={1} onChange={v => up('lineSpacing', v)} />
      <SliderControl label="Word position" value={s.wordVerticalOffset} min={-10} max={10} step={0.5} onChange={v => up('wordVerticalOffset', v)} />

      <ToggleControl label="Spacing noise"  value={s.lineSpacingNoiseEnabled} onChange={v => up('lineSpacingNoiseEnabled', v)} />
      {s.lineSpacingNoiseEnabled && <SliderControl label="Amount" value={s.lineSpacingNoiseMax} min={0} max={10} step={0.5} onChange={v => up('lineSpacingNoiseMax', v)} />}

      <ToggleControl label="Line slope"     value={s.lineSlopeEnabled} onChange={v => up('lineSlopeEnabled', v)} />
      {s.lineSlopeEnabled && <SliderControl label="Max slope" value={s.lineSlopeMax} min={0} max={3} step={0.1} onChange={v => up('lineSlopeMax', v)} />}

      <ToggleControl label="Font size noise" value={s.lineFontNoiseEnabled} onChange={v => up('lineFontNoiseEnabled', v)} />
      {s.lineFontNoiseEnabled && <SliderControl label="Max variation" value={s.lineFontNoiseMax} min={0} max={8} step={0.5} onChange={v => up('lineFontNoiseMax', v)} />}

      <ToggleControl label="Baseline drift" value={s.baselineDriftEnabled} onChange={v => up('baselineDriftEnabled', v)} />
      {s.baselineDriftEnabled && <SliderControl label="Max drift" value={s.baselineDriftMax} min={0} max={10} step={0.5} onChange={v => up('baselineDriftMax', v)} />}
    </Section>
  );
}
