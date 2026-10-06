// Geometry helpers shared by the dependency-free SVG charts in components/admin.

// Round `maxValue` up to a "nice" axis maximum split in `ticks` equal steps.
export function niceScale(maxValue, { ticks = 4, integer = false } = {}) {
  const raw = Math.max(maxValue, integer ? 1 : 0.01) / ticks
  const pow = 10 ** Math.floor(Math.log10(raw))
  const f = raw / pow
  let step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pow
  if (integer) step = Math.max(1, Math.ceil(step))
  return { step, max: step * ticks, ticks }
}

// Bar from `base` up to `top`, rounded top corners only (radius r).
export function barPath(x, top, width, base, r = 4) {
  const rad = Math.max(0, Math.min(r, width / 2, base - top))
  if (rad === 0) return `M${x} ${base} V${top} H${x + width} V${base} Z`
  return (
    `M${x} ${base} V${top + rad} Q${x} ${top} ${x + rad} ${top} ` +
    `H${x + width - rad} Q${x + width} ${top} ${x + width} ${top + rad} V${base} Z`
  )
}

export const r1 = (n) => Math.round(n * 10) / 10
