export function buildPaperBackground(settings) {
  const { paperColor, paperCustomBg, paperAgeEnabled, paperAgeAmount } = settings;

  const base = { backgroundColor: paperColor || 'white' };

  if (paperAgeEnabled && paperAgeAmount > 0) {
    
    base._ageFilter = `sepia(${paperAgeAmount * 80}%) brightness(${1 - paperAgeAmount * 0.08})`;
  }

  if (paperCustomBg) {
    base._customBg = {
      backgroundImage: `url(${paperCustomBg})`,
      backgroundSize: 'cover',       
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    };
  }

  return base;
}
