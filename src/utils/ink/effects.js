// Pen types and Handwriting confidence are both "meta" controls: rather than
// each being its own noise system, they compute a derived settings object
// that boosts/bundles the EXISTING noise sliders (word rotation, baseline
// drift, ink flow, etc). Nothing here is persisted - it only affects this
// render pass - so switching either feature off always cleanly reverts to
// whatever the user's own manual sliders say, and manually tweaking a
// slider afterwards is an accepted, expected way to drift off the preset.

function applyHandwritingConfidence(settings) {
  if (!settings.handwritingConfidenceEnabled) return settings;
  const t = Math.max(0, Math.min(1, settings.handwritingConfidence / 100));
  if (t <= 0) return settings;

  const boost = (current, reference) => Math.max(current, reference * t);

  const wordRotationMax     = boost(settings.wordRotationMax,     3);
  const wordBaselineMax     = boost(settings.wordBaselineMax,     3);
  const lineSlopeMax        = boost(settings.lineSlopeMax,        1.2);
  const lineSpacingNoiseMax = boost(settings.lineSpacingNoiseMax, 4);
  const baselineDriftMax    = boost(settings.baselineDriftMax,    3);
  const perCharNoiseMax     = boost(settings.perCharNoiseMax,     0.8);
  const letterSpacingNoiseMax = boost(settings.letterSpacingNoiseMax, 1);

  return {
    ...settings,
    wordRotationEnabled: true,       wordRotationMax,
    wordBaselineEnabled: true,       wordBaselineMax,
    lineSlopeEnabled: true,          lineSlopeMax,
    lineSpacingNoiseEnabled: true,   lineSpacingNoiseMax,
    baselineDriftEnabled: true,      baselineDriftMax,
    perCharNoiseEnabled: true,       perCharNoiseMax,
    letterSpacingNoiseEnabled: true, letterSpacingNoiseMax,
    inkFlowEnabled: true,            inkFlowAmount: Math.max(settings.inkFlowAmount, 0.5 * t),
  };
}

function applyPenType(settings) {
  if (!settings.penTypeEnabled) return settings;
  const t = Math.max(0, Math.min(1, settings.penIntensity / 100));

  switch (settings.penType) {
    case 'fountain':
      return {
        ...settings,
        inkFlowEnabled: true,
        inkFlowAmount: Math.max(settings.inkFlowAmount, 0.15 + t * 0.5),
        perCharNoiseEnabled: true,
        perCharNoiseMax: Math.max(settings.perCharNoiseMax, t * 0.6),
      };
    case 'marker':
      return { ...settings, _markerBoldPx: 0.4 + t * 1.2 };
    case 'pencil':
      return { ...settings, _pencilGrain: 0.15 + t * 0.55 };
    default:
      return settings;
  }
}

export function applyDerivedInkEffects(settings) {
  return applyPenType(applyHandwritingConfidence(settings));
}
