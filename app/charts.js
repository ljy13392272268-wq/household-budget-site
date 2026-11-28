// Hearth Ledger — the donut of the month's spending by category, drawn by
// hand on <canvas>. The bar charts are inline SVG in the views, so this
// file only loads on the reports page.

import { money } from './store.js';

const INK = '#22302a';
const MUTED = '#6f6a5e';
const SANS = '11px system-ui, "Segoe UI", sans-serif';

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
  ctx.fillText(money(total), cx, cy - 11);
  ctx.fillStyle = MUTED;
  ctx.font = SANS;
  ctx.fillText(centerNote, cx, cy + 11);
}
