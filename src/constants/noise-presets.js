export const NOISE_PRESETS = [
  {
    label: 'Clean Print',
    settings: {
      lineSpacingNoiseEnabled: false, lineSlopeEnabled: false, lineFontNoiseEnabled: false,
      wordSpacingNoiseEnabled: false, wordBaselineEnabled: false, wordRotationEnabled: false,
      letterSpacingNoiseEnabled: false, inkBlurEnabled: false, inkFlowEnabled: false,
    },
  },
  {
    label: 'Messy Notes',
    settings: {
      lineSpacingNoiseEnabled: true, lineSpacingNoiseMax: 4,
      lineSlopeEnabled: true, lineSlopeMax: 0.6,
      wordBaselineEnabled: true, wordBaselineMax: 3,
      wordRotationEnabled: true, wordRotationMax: 1.5,
      wordSpacingNoiseEnabled: true, wordSpacingNoiseMax: 4,
      inkFlowEnabled: true, inkFlowAmount: 0.25,
    },
  },
  {
    label: 'Careful Study',
    settings: {
      lineSpacingNoiseEnabled: true, lineSpacingNoiseMax: 1,
      lineSlopeEnabled: true, lineSlopeMax: 0.2,
      wordBaselineEnabled: true, wordBaselineMax: 1,
      wordRotationEnabled: false,
      letterSpacingNoiseEnabled: true, letterSpacingNoiseMax: 0.3,
    },
  },
  {
    label: 'Shaky',
    settings: {
      lineSpacingNoiseEnabled: true, lineSpacingNoiseMax: 6,
      lineSlopeEnabled: true, lineSlopeMax: 1.2,
      wordBaselineEnabled: true, wordBaselineMax: 5,
      wordRotationEnabled: true, wordRotationMax: 2.5,
      wordSpacingNoiseEnabled: true, wordSpacingNoiseMax: 6,
      inkBlurEnabled: true, inkBlurAmount: 0.4,
      inkFlowEnabled: true, inkFlowAmount: 0.4,
    },
  },
];
