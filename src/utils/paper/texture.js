export function buildTextureDataUrl(amount = 0.04) {
  const freq = 0.65 + amount * 0.3;
  const opacity = 0.03 + amount * 0.08;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
    <filter id="t"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/></filter>
    <rect width="300" height="300" filter="url(#t)" opacity="${opacity}"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
