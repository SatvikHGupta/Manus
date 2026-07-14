export function buildInkFilter(settings) {
  if (!settings.inkBlurEnabled || settings.inkBlurAmount <= 0) return 'none';
  return `blur(${settings.inkBlurAmount}px)`;
}
