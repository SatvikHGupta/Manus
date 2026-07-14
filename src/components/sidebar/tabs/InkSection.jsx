import { Droplets } from 'lucide-react';
import { Section }       from '../../controls/Section.jsx';
import { SliderControl } from '../../controls/SliderControl.jsx';
import { ToggleControl } from '../../controls/ToggleControl.jsx';
import { PX_SLIDER_MIN, PX_SLIDER_MAX } from '../../../constants/sliders.js';
import { NOISE_PRESETS } from '../../../constants/noise-presets.js';
import { useStore, useSettings } from '../../../store/index.js';

const PEN_TYPES = ['fountain', 'pencil', 'marker'];
const SMUDGE_SIDES = ['both', 'start', 'end'];

export function InkSection() {
  const s  = useSettings();
  const up = useStore(st => st.updateSetting);
  const upMany = useStore(st => st.updateSettings);

  return (
    <Section id="ink" title="Ink" icon={Droplets}>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">Quick styles</span>
        <div className="flex flex-wrap gap-1">
          {NOISE_PRESETS.map(p => (
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

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

      <ToggleControl label="Blur"   value={s.inkBlurEnabled}   onChange={v => up('inkBlurEnabled', v)} />
      {s.inkBlurEnabled && <SliderControl label="Amount" value={s.inkBlurAmount} min={0} max={2} step={0.1} onChange={v => up('inkBlurAmount', v)} />}

      <ToggleControl label="Flow / opacity variation" value={s.inkFlowEnabled} onChange={v => up('inkFlowEnabled', v)} />
      {s.inkFlowEnabled && <SliderControl label="Amount" value={s.inkFlowAmount} min={0} max={1} step={0.05} onChange={v => up('inkFlowAmount', v)} />}

      <ToggleControl label="Drop shadow" value={s.inkShadowEnabled} onChange={v => up('inkShadowEnabled', v)} />
      {s.inkShadowEnabled && <SliderControl label="Amount" value={s.inkShadowAmount} min={0} max={1} step={0.05} onChange={v => up('inkShadowAmount', v)} />}

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

      <ToggleControl label="Pen type" value={s.penTypeEnabled} onChange={v => up('penTypeEnabled', v)} />
      {s.penTypeEnabled && (
        <>
          <div className="grid grid-cols-3 gap-1">
            {PEN_TYPES.map(t => (
              <button
                key={t}
                onClick={() => up('penType', t)}
                className={`px-2 py-1 rounded text-[11px] capitalize transition-colors ${s.penType === t ? 'bg-accent dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <SliderControl label="Intensity" value={s.penIntensity} min={0} max={100} step={1} unit="%" onChange={v => up('penIntensity', v)} />
        </>
      )}

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

      <ToggleControl label="Handwriting confidence" value={s.handwritingConfidenceEnabled} onChange={v => up('handwritingConfidenceEnabled', v)} />
      {s.handwritingConfidenceEnabled && (
        <SliderControl label="Neat \u2192 Rushed" value={s.handwritingConfidence} min={0} max={100} step={1} unit="%" onChange={v => up('handwritingConfidence', v)} />
      )}

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

      <ToggleControl label="Start/end smudge" value={s.edgeSmudgeEnabled} onChange={v => up('edgeSmudgeEnabled', v)} />
      {s.edgeSmudgeEnabled && (
        <>
          <div className="grid grid-cols-3 gap-1">
            {SMUDGE_SIDES.map(side => (
              <button
                key={side}
                onClick={() => up('edgeSmudgeSide', side)}
                className={`px-2 py-1 rounded text-[11px] capitalize transition-colors ${s.edgeSmudgeSide === side ? 'bg-accent dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                {side}
              </button>
            ))}
          </div>
          <SliderControl label="Amount" value={s.edgeSmudgeAmount} min={PX_SLIDER_MIN} max={PX_SLIDER_MAX} step={1} onChange={v => up('edgeSmudgeAmount', v)} />
        </>
      )}
    </Section>
  );
}
