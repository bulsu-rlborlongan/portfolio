// Pen path for the signature intro: where the pen goes, in what order, and which pixels of
// the artwork it uncovers along the way.

type Pt = [number, number];
// A cubic bezier piece of the pen path.
type Segment = [Pt, Pt, Pt, Pt];
export type Sample = { x: number; y: number; len: number };

// Pen-path coordinates are in pixels of the reference image the artwork was cut from;
// ORIGIN is where the cut-out starts, VIEW_W/VIEW_H its size.
const ORIGIN: Pt = [470, 262];
export const VIEW_W = 940;
export const VIEW_H = 345;

// Alpha above this counts as ink when finding the middle of a stroke.
const INK = 128;
// How far a point on the hand-drawn path may be pulled sideways onto the ink.
const SNAP_R = 12;
// Ink runs wider than this are crossings or blobs, where the path is left where it is.
const MAX_RUN = 10;
// Snapping only fine-tunes: a run further than this from the path is a neighbouring stroke.
const MAX_SHIFT = 6;
// Pen radius: ink this close to the path appears as the pen passes over it.
const COVER_R = 4.5;
// Ink further than COVER_R from the whole path goes to the nearest point within this.
const SEARCH_R = 16;

// Rough centerline of the signature, in writing order, drawn by hand. samplePenPath snaps it
// onto the middle of the ink, so it only has to stay within SNAP_R. Each stroke is one pen-down.
const STROKES: Segment[][] = [
  // R stem
  [[[739, 357], [680, 405], [560, 500], [479, 570]]],
  // R loop, crossbar, leg, "a", then up and down the p stem
  [
    [[494, 446], [484, 447], [484, 437], [500, 425]],
    [[500, 425], [600, 360], [760, 285], [880, 272]],
    [[880, 272], [920, 268], [930, 290], [912, 315]],
    [[912, 315], [876, 369], [726, 425], [648, 446]],
    [[648, 446], [620, 448], [595, 447], [588, 451]],
    [[588, 451], [582, 455], [590, 458], [605, 455]],
    [[605, 455], [625, 452], [640, 450], [652, 452]],
    [[652, 452], [680, 456], [708, 470], [740, 469]],
    [[740, 469], [770, 468], [795, 462], [810, 449]],
    // "a": up over the oval, back down and around its base, up into the little stem and down it
    [[810, 449], [822, 438], [840, 428], [852, 424]],
    [[852, 424], [860, 421], [864, 425], [858, 431]],
    [[858, 431], [850, 440], [830, 452], [816, 455]],
    [[816, 455], [810, 457], [812, 462], [822, 460]],
    [[822, 460], [835, 458], [848, 452], [856, 445]],
    [[856, 445], [862, 437], [870, 427], [875, 422]],
    [[875, 422], [874, 430], [866, 440], [863, 446]],
    [[863, 446], [866, 452], [880, 451], [892, 447]],
    // up to the top of the p, then straight down its stem
    [[892, 447], [905, 443], [918, 435], [930, 430]],
    [[930, 430], [950, 423], [970, 412], [978, 406]],
    [[978, 406], [936, 468], [894, 531], [852, 593]],
  ],
  // p bowl, branching off the stem, round and back along its base to the curl, then the long tail
  [
    [[965, 436], [974, 425], [988, 414], [1003, 405]],
    [[1003, 405], [1012, 399], [1024, 397], [1032, 399]],
    [[1032, 399], [1040, 400], [1036, 412], [1028, 419]],
    [[1028, 419], [1020, 428], [1010, 440], [1002, 447]],
    [[1002, 447], [990, 452], [970, 458], [958, 462]],
    [[958, 462], [951, 464], [951, 468], [960, 467]],
    [[960, 467], [1000, 452], [1130, 428], [1250, 409]],
    [[1250, 409], [1320, 396], [1370, 393], [1398, 406]],
  ],
];

function bezier(p: Segment, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0] - ORIGIN[0],
    u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1] - ORIGIN[1],
  ];
}

// Offset along the normal to the middle of the ink run nearest the point, or NaN if there is
// no clean run (no ink nearby, or a crossing).
function inkOffset(alpha: (x: number, y: number) => number, x: number, y: number, nx: number, ny: number) {
  let best = NaN;
  let start = NaN;
  for (let t = -SNAP_R; t <= SNAP_R + 0.5; t += 0.5) {
    const inked = t <= SNAP_R && alpha(Math.round(x + nx * t), Math.round(y + ny * t)) > INK;
    if (inked && Number.isNaN(start)) start = t;
    if (!inked && !Number.isNaN(start)) {
      const end = t - 0.5;
      const mid = (start + end) / 2;
      if (end - start <= MAX_RUN && (Number.isNaN(best) || Math.abs(mid) < Math.abs(best))) best = mid;
      start = NaN;
    }
  }
  return Math.abs(best) <= MAX_SHIFT ? best : NaN;
}

// Points along the pen path, snapped onto the ink, with the distance the pen has travelled.
export function samplePenPath(data: Uint8ClampedArray): Sample[] {
  const alpha = (x: number, y: number) =>
    x < 0 || y < 0 || x >= VIEW_W || y >= VIEW_H ? 0 : data[(y * VIEW_W + x) * 4 + 3];
  const out: Sample[] = [];
  let len = 0;
  for (const stroke of STROKES) {
    const pts: Pt[] = [];
    for (const seg of stroke) for (let i = pts.length ? 1 : 0; i <= 200; i++) pts.push(bezier(seg, i / 200));

    const normals = pts.map((_, i) => {
      const a = pts[Math.max(0, i - 3)];
      const b = pts[Math.min(pts.length - 1, i + 3)];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [-(b[1] - a[1]) / d, (b[0] - a[0]) / d];
    });
    const raw = pts.map(([x, y], i) => inkOffset(alpha, x, y, normals[i][0], normals[i][1]));

    // Fill the gaps from the nearest clean readings on either side, then smooth.
    const filled = raw.map((v, i) => {
      if (!Number.isNaN(v)) return v;
      let a = i;
      let b = i;
      while (a >= 0 && Number.isNaN(raw[a])) a--;
      while (b < raw.length && Number.isNaN(raw[b])) b++;
      if (a < 0 && b >= raw.length) return 0;
      if (a < 0) return raw[b];
      if (b >= raw.length) return raw[a];
      return raw[a] + ((raw[b] - raw[a]) * (i - a)) / (b - a);
    });
    const smooth = filled.map((_, i) => {
      let sum = 0;
      let n = 0;
      for (let k = Math.max(0, i - 8); k <= Math.min(filled.length - 1, i + 8); k++, n++) sum += filled[k];
      return sum / n;
    });

    let prev: Pt | null = null;
    pts.forEach(([x, y], i) => {
      const p: Pt = [x + normals[i][0] * smooth[i], y + normals[i][1] * smooth[i]];
      if (prev) len += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      prev = p;
      out.push({ x: p[0], y: p[1], len });
    });
  }
  return out;
}

// For every inked pixel, the distance along the pen path at which the pen first covers it.
// Pixels come back sorted by that distance so they can be revealed with a moving pointer.
export function inkOrder(data: Uint8ClampedArray, samples: Sample[]) {
  const cell = SEARCH_R;
  const cols = Math.ceil(VIEW_W / cell);
  const grid = new Map<number, Sample[]>();
  for (const s of samples) {
    const key = Math.floor(s.y / cell) * cols + Math.floor(s.x / cell);
    const bucket = grid.get(key);
    if (bucket) bucket.push(s);
    else grid.set(key, [s]);
  }

  const total = samples[samples.length - 1].len;
  const ink: { i: number; len: number }[] = [];
  for (let y = 0; y < VIEW_H; y++) {
    for (let x = 0; x < VIEW_W; x++) {
      const i = y * VIEW_W + x;
      if (data[i * 4 + 3] === 0) continue;
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      let first = Infinity;
      let nearest = Infinity;
      let nearestLen = total;
      for (let gy = cy - 1; gy <= cy + 1; gy++) {
        for (let gx = cx - 1; gx <= cx + 1; gx++) {
          for (const s of grid.get(gy * cols + gx) ?? []) {
            const d = Math.hypot(s.x - x, s.y - y);
            if (d <= COVER_R && s.len < first) first = s.len;
            if (d < nearest) {
              nearest = d;
              nearestLen = s.len;
            }
          }
        }
      }
      ink.push({ i, len: first < Infinity ? first : nearestLen });
    }
  }
  ink.sort((a, b) => a.len - b.len);
  return ink;
}
