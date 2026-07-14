export function buildInkShadow(settings, color) {
  if (!settings.inkShadowEnabled || settings.inkShadowAmount <= 0) return 'none';
  const a = settings.inkShadowAmount * 0.6;
  return `0.5px 0.8px ${a * 3}px ${color || 'black'}`;
}
