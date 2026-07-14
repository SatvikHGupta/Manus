// Shared range for pixel-based sliders introduced across the feature set
// (edge smudge, and any future px-based control). The raw slider value the
// user sees/drags always sits in this range; each feature then maps the
// normalized 0-1 position onto whatever physical unit actually makes sense
// for that effect (a few px of blur, a fraction of opacity, etc).
export const PX_SLIDER_MIN = 4;
export const PX_SLIDER_MAX = 144;

export function pxSliderToUnit(value) {
  return Math.max(0, Math.min(1, (value - PX_SLIDER_MIN) / (PX_SLIDER_MAX - PX_SLIDER_MIN)));
}
