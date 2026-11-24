/**
 * One duotone glyph on the 24×24 grid. Layers paint in this order:
 *
 * - `tint`      soft fill in the tint colour (default: currentColor at ~18%)
 * - `accent`    highlight fill in the accent colour (e.g. the water of a bay sector)
 * - `secondary` second highlight fill (e.g. the land of a bay sector)
 * - `detail`    thin 1px lines in currentColor (map shorelines)
 * - `line`      1.75px rounded strokes in currentColor — the drawing itself
 * - `solid`     small solid marks in currentColor (dots, particles)
 */
export interface IconGlyph {
  readonly tint?: readonly string[];
  readonly accent?: readonly string[];
  readonly secondary?: readonly string[];
  readonly detail?: readonly string[];
  readonly line: readonly string[];
  readonly solid?: readonly string[];
}

const n = (value: number) => Number(value.toFixed(2));

/** Circle as a path (two arcs), so every layer is a list of `d` strings. */
export const circle = (cx: number, cy: number, r: number) =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;

/** Rounded rectangle as a path. */
export const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  r === 0
    ? `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`
    : `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(r)}v${n(h - 2 * r)}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(r)}h${n(-(w - 2 * r))}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(-r)}v${n(-(h - 2 * r))}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(-r)}Z`;

/** Water drop with its tip at (cx, top) and the given height. */
export const drop = (cx: number, top: number, height: number) => {
  const r = height * 0.36;
  const cy = top + height - r;
  return `M${n(cx)} ${n(top)}C${n(cx - r * 0.35)} ${n(top + height * 0.3)} ${n(cx - r)} ${n(cy - r * 0.6)} ${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 0 0 ${n(2 * r)} 0C${n(cx + r)} ${n(cy - r * 0.6)} ${n(cx + r * 0.35)} ${n(top + height * 0.3)} ${n(cx)} ${n(top)}Z`;
};

/** Gentle wave line from x0 to x1 at height y (one crest every 4.5 units). */
export const wave = (y: number, x0 = 3, x1 = 21, amplitude = 0.9) => {
  const step = 4.5;
  let d = `M${n(x0)} ${n(y)}`;
  let up = true;
  for (let x = x0; x < x1 - 0.01; x += step / 2) {
    const w = Math.min(step / 2, x1 - x);
    const dy = up ? -amplitude : amplitude;
    d += `q${n(w / 2)} ${n(dy)} ${n(w)} 0`;
    up = !up;
  }
  return d;
};
