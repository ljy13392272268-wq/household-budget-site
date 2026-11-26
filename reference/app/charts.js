// Hearth Ledger — charts, drawn by hand on <canvas>.
//
// No chart library: two small drawings cover everything the site shows —
// grouped bars for income against spending, and a donut for the month's
// spending by category. Colours come from the categories in data.js, so a
// category keeps its colour on every page.

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

// Grouped bars: one pair per month, income in green, spending in amber.
export function drawCashFlow(canvas, months) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { top: 12, right: 8, bottom: 26, left: 46 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...months.flatMap((m) => [m.income, m.spent]), 1) * 1.08;

  ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  // Gridlines and the dollar scale.
  ctx.strokeStyle = '#e3dccb';
  ctx.fillStyle = '#6f6a5e';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const value = (max / 4) * i;
    const y = pad.top + plotH - (plotH * value) / max;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(`$${Math.round(value / 1000)}k`, pad.left - 6, y);
  }

  const groupW = plotW / months.length;
  const barW = Math.min(26, (groupW - 24) / 2);
  months.forEach((m, i) => {
    const groupX = pad.left + groupW * i;
    const incomeH = (plotH * m.income) / max;
    const spentH = (plotH * m.spent) / max;
    const center = groupX + groupW / 2;
    ctx.fillStyle = '#1e4d3a';
    ctx.fillRect(center - barW - 3, pad.top + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = '#d97b29';
    ctx.fillRect(center + 3, pad.top + plotH - spentH, barW, spentH);
    ctx.fillStyle = '#3d3a33';
    ctx.textAlign = 'center';
    ctx.fillText(m.month, center, height - 8);
  });
}

// A donut of the month's spending, one slice per category, with a legend
// drawn beside it as HTML by the caller (the canvas carries the slices).
// `centerNote` is the small line under the total in the hole.
export function drawDonut(canvas, slices, centerNote = 'spent in November') {
  const { ctx, width, height } = setupCanvas(canvas);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 6;
  const inner = outer * 0.58;

  ctx.clearRect(0, 0, width, height);
  if (total <= 0) {
    ctx.fillStyle = '#6f6a5e';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nothing spent yet', cx, cy);
    return;
  }

  let start = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, start, start + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    start += sweep;
  }

  // Punch the hole, then write the total in it.
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#22302a';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`$${Math.round(total).toLocaleString('en-US')}`, cx, cy - 12);
  ctx.fillStyle = '#6f6a5e';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText(centerNote, cx, cy + 12);
}
