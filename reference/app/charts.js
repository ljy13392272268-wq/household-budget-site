// Hearth Ledger — two drawings by hand on <canvas>: grouped bars for income
// against spending, and a donut of the month's spending by category.

const INK = '#22302a';
const MUTED = '#6f6a5e';
const LINE = '#e4ddcc';
const GREEN = '#1e4d3a';
const AMBER = '#c96f22';
const SANS = '11px system-ui, -apple-system, "Segoe UI", sans-serif';

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
export function drawCashFlow(canvas, months) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { top: 14, right: 6, bottom: 24, left: 40 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const peak = Math.max(...months.flatMap((m) => [m.income, m.spent]), 1);
  const step = [500, 1000, 2000, 2500, 5000].find((s) => s * 4 >= peak) ?? 5000;
  const max = step * 4;

  ctx.font = SANS;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = Math.round(pad.top + plotH - (plotH * step * i) / max) + 0.5;
    ctx.strokeStyle = i === 0 ? '#cfc8b4' : LINE;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'right';
    ctx.fillText(step * i === 0 ? '$0' : `$${(step * i) / 1000}k`, pad.left - 7, y);
  }

  const groupW = plotW / months.length;
  const barW = Math.min(28, Math.max(8, (groupW - 34) / 2));
  months.forEach((m, i) => {
    const center = pad.left + groupW * i + groupW / 2;
    const incomeH = Math.max(1, (plotH * m.income) / max);
    const spentH = Math.max(1, (plotH * m.spent) / max);
    ctx.fillStyle = GREEN;
    ctx.fillRect(center - barW - 2, pad.top + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = AMBER;
    ctx.fillRect(center + 2, pad.top + plotH - spentH, barW, spentH);
    ctx.fillStyle = i === months.length - 1 ? INK : MUTED;
    ctx.font = i === months.length - 1 ? `bold ${SANS}` : SANS;
    ctx.textAlign = 'center';
    ctx.fillText(m.month, center, height - 7);
  });
}
export function drawDonut(canvas, slices, centerNote = 'spent in November') {
  const { ctx, width, height } = setupCanvas(canvas);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 8;
  const inner = outer * 0.56;

  ctx.clearRect(0, 0, width, height);
  if (total <= 0) {
    ctx.fillStyle = MUTED;
    ctx.font = SANS;
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
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = INK;
  ctx.font = 'bold 19px "Iowan Old Style", "Bitstream Charter", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`$${Math.round(total).toLocaleString('en-US')}`, cx, cy - 11);
  ctx.fillStyle = MUTED;
  ctx.font = SANS;
  ctx.fillText(centerNote, cx, cy + 11);
}
