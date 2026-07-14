export const DEFAULT_SETTINGS = {
  
  fontFamily:               'Caveat',
  fontSize:                 22,
  fontColor:                '#0a0a0a',
  letterSpacing:            0,

  
  lineSpacing:              32,
  wordVerticalOffset:       0,
  lineSpacingNoiseEnabled:  false,
  lineSpacingNoiseMax:      2,
  lineSlopeEnabled:         false,
  lineSlopeMax:             0.3,
  lineFontNoiseEnabled:     false,
  lineFontNoiseMax:         1,
  baselineDriftEnabled:     false,
  baselineDriftMax:         2,

  
  wordSpacing:              8,
  wordSpacingNoiseEnabled:  false,
  wordSpacingNoiseMax:      3,
  wordBaselineEnabled:      false,
  wordBaselineMax:          2,
  wordRotationEnabled:      false,
  wordRotationMax:          1,

  
  letterSpacingNoiseEnabled: false,
  letterSpacingNoiseMax:     0.5,
  perCharNoiseEnabled:       false,
  perCharNoiseMax:           0.5,

  
  inkBlurEnabled:           false,
  inkBlurAmount:            0.3,
  inkFlowEnabled:           false,
  inkFlowAmount:            0.2,
  inkShadowEnabled:         false,
  inkShadowAmount:          0.3,

  
  penTypeEnabled:           false,
  penType:                  'fountain', // 'fountain' | 'pencil' | 'marker'
  penIntensity:             50,         // 0-100

  
  handwritingConfidenceEnabled: false,
  handwritingConfidence:        50,     // 0 = neat, 100 = rushed

  
  edgeSmudgeEnabled:        false,
  edgeSmudgeAmount:         74,         // px-slider range 4-144, normalized internally
  edgeSmudgeSide:           'both',     // 'both' | 'start' | 'end'


  
  pageWidth:                794,
  pageHeight:               1123,
  paperType:                'blank',
  paperColor:               '#ffffff',
  paperLineColor:           '#1f1f1f',
  paperMarginColor:         '#0a0a0a',
  paperTextureEnabled:      false,
  paperTextureAmount:       0.05,
  paperShadowEnabled:       true,
  paperAgeEnabled:          false,
  paperAgeAmount:           0.2,
  paperCustomBg:            null,

  
  paperMarginLeftEnabled:   false,
  paperMarginLeft:          80,
  paperMarginLeftThickness: 2,
  paperMarginRightEnabled:  false,
  paperMarginRight:         60,
  paperMarginRightThickness: 2,
  paperMarginTopEnabled:    false,
  paperMarginTop:           60,
  paperMarginTopThickness:  2,
  marginTopText:            '',
  marginLeftText:           '',
  marginRightText:          '',

  
  smartQuotesEnabled:       false,

  
  noiseSeed:                42,
};

export const DEFAULT_PAGE = (settingsOverride = null) => ({
  id:        crypto.randomUUID(),
  text:      '',
  label:     '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings:  settingsOverride ? { ...settingsOverride } : { ...DEFAULT_SETTINGS },
});


