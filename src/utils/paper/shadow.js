export function buildShadowStyle(enabled) {
  if (!enabled) return {};
  return {
    boxShadow: '4px 4px 18px rgba(0,0,0,0.22), 1px 1px 6px rgba(0,0,0,0.12)',
  };
}
