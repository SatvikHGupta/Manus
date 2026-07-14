import { Space } from 'lucide-react';
import { Section }       from '../../controls/Section.jsx';
import { SliderControl } from '../../controls/SliderControl.jsx';
import { ToggleControl } from '../../controls/ToggleControl.jsx';
import { useStore, useSettings } from '../../../store/index.js';

export function WordSection() {
  const s  = useSettings();
  const up = useStore(st => st.updateSetting);

  return (
    <Section id="word" title="Words" icon={Space}>
      <SliderControl label="Word spacing" value={s.wordSpacing} min={0} max={30} step={1} onChange={v => up('wordSpacing', v)} />

      <ToggleControl label="Spacing noise"  value={s.wordSpacingNoiseEnabled} onChange={v => up('wordSpacingNoiseEnabled', v)} />
      {s.wordSpacingNoiseEnabled && <SliderControl label="Max" value={s.wordSpacingNoiseMax} min={0} max={12} step={0.5} onChange={v => up('wordSpacingNoiseMax', v)} />}

      <ToggleControl label="Baseline bounce" value={s.wordBaselineEnabled} onChange={v => up('wordBaselineEnabled', v)} />
      {s.wordBaselineEnabled && <SliderControl label="Max" value={s.wordBaselineMax} min={0} max={10} step={0.5} onChange={v => up('wordBaselineMax', v)} />}

      <ToggleControl label="Word rotation" value={s.wordRotationEnabled} onChange={v => up('wordRotationEnabled', v)} />
      {s.wordRotationEnabled && <SliderControl label="Max degrees" value={s.wordRotationMax} min={0} max={5} step={0.1} onChange={v => up('wordRotationMax', v)} />}
    </Section>
  );
}
