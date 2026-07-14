export function buildPagePadding(settings) {
  const top    = settings.paperMarginTopEnabled    ? settings.paperMarginTop    : 24;
  const left   = settings.paperMarginLeftEnabled   ? settings.paperMarginLeft   : 24;
  const right  = settings.paperMarginRightEnabled  ? settings.paperMarginRight  : 24;
  return { paddingTop: top, paddingLeft: left, paddingRight: right, paddingBottom: 24 };
}
