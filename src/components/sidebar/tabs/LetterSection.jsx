import { CaseSensitive } from 'lucide-react';
import { Section }       from '../../controls/Section.jsx';
import { SliderControl } from '../../controls/SliderControl.jsx';
import { ToggleControl } from '../../controls/ToggleControl.jsx';
import { useStore, useSettings } from '../../../store/index.js';

export function LetterSection() {
  const s  = useSettings();
  const up = useStore(st => st.updateSetting);

  return (
    <Section id="letter" title="Letters" icon={CaseSensitive}>
      <ToggleControl label="Spacing noise" value={s.letterSpacingNoiseEnabled} onChange={v => up('letterSpacingNoiseEnabled', v)} />
      {s.letterSpacingNoiseEnabled && <SliderControl label="Max" value={s.letterSpacingNoiseMax} min={0} max={3} step={0.1} onChange={v => up('letterSpacingNoiseMax', v)} />}

      <ToggleControl label="Per-character noise" value={s.perCharNoiseEnabled} onChange={v => up('perCharNoiseEnabled', v)} />
      {s.perCharNoiseEnabled && <SliderControl label="Amount" value={s.perCharNoiseMax} min={0} max={2} step={0.1} onChange={v => up('perCharNoiseMax', v)} />}
    </Section>
  );
}
