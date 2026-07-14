export function buildPaperLines(settings) {
  const { paperType, paperLineColor, lineSpacing, pageWidth, pageHeight } = settings;
  if (paperType === 'blank') return null;

  const color  = paperLineColor || 'lightsteelblue';
  const gap    = lineSpacing    || 32;
  const w      = pageWidth      || 794;
  const h      = pageHeight     || 1123;

  if (paperType === 'lined') {
    return buildLinedSVG(color, gap, w, h);
  } else if (paperType === 'grid') {
    return buildGridSVG(color, gap, w, h);       
  } else if (paperType === 'dot') {
    return buildDotSVG(color, gap, w, h);
  } else if (paperType === 'cornell') {
    return buildCornellSVG(color, gap, w, h);
  } else if (paperType === 'indian') {
    return buildIndianRuledSVG(color, gap, w, h);
  }
  return null;
}

function buildLinedSVG(color, gap, w, h) {
  let lines = '';
  for (let y = gap; y < h; y += gap) {
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="0.8"/>`;
  }
  return svgWrap(lines, w, h);
}

function buildGridSVG(color, gap, w, h) {
  let lines = '';
  for (let y = gap; y < h; y += gap) {
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="0.5"/>`;
  }
  for (let x = gap; x < w; x += gap) {
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${color}" stroke-width="0.5"/>`;
  }
  return svgWrap(lines, w, h);
}

function buildDotSVG(color, gap, w, h) {
  let dots = '';
  for (let y = gap; y < h; y += gap) {
    for (let x = gap; x < w; x += gap) {
      dots += `<circle cx="${x}" cy="${y}" r="1.2" fill="${color}"/>`;
    }
  }
  return svgWrap(dots, w, h);
}

function buildCornellSVG(color, gap, w, h) {
  
  const vx = Math.round(w * 0.25);
  const hy = Math.round(h * 0.80);
  let lines = `<line x1="${vx}" y1="0" x2="${vx}" y2="${hy}" stroke="${color}" stroke-width="1.2"/>`;
  lines += `<line x1="0" y1="${hy}" x2="${w}" y2="${hy}" stroke="${color}" stroke-width="1.2"/>`;
  for (let y = gap; y < hy; y += gap) {
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="0.5"/>`;
  }
  return svgWrap(lines, w, h);
}

function buildIndianRuledSVG(color, gap, w, h) {
  
  let lines = '';
  for (let y = gap; y < h; y += gap) {
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="0.8"/>`;
  }
  lines += `<line x1="60" y1="0" x2="60" y2="${h}" stroke="${color}" stroke-width="1.2"/>`;
  lines += `<line x1="65" y1="0" x2="65" y2="${h}" stroke="${color}" stroke-width="0.7"/>`;
  return svgWrap(lines, w, h);
}

function svgWrap(content, w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${content}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
