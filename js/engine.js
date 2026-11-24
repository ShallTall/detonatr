// Shared, deterministic bomb generator. Both pages call generate(code) and get identical data.
import * as C from './content.js';

export const DIFFS = [
  { id: 'intern', name: 'Intern', modules: 3, rules: 2, cols: 4, lightWords: 6, patLen: 4, prompts: 3, trap: 0 },
  { id: 'manager', name: 'Middle Manager', modules: 4, rules: 3, cols: 5, lightWords: 8, patLen: 4, prompts: 4, trap: 0.35 },
  { id: 'csuite', name: 'C-Suite', modules: 5, rules: 4, cols: 6, lightWords: 10, patLen: 5, prompts: 5, trap: 1 },
];
export const TIMES = [120, 240, 360, 600, 0]; // seconds; 0 = unlimited
export const MODULE_TYPES = ['wires', 'button', 'keypad', 'light', 'captcha'];
const SPAN = DIFFS.length * TIMES.length; // 15 settings combos packed into the number
const MAXN = Math.floor(1000 / SPAN) * SPAN; // 990

// Code = WORD-NNN. NNN % 15 encodes difficulty and time; WORD + NNN seeds the bomb.
export function makeCode(diff, timeIdx, rand = Math.random) {
  const word = C.CODE_WORDS[Math.floor(rand() * C.CODE_WORDS.length)];
  const n = Math.floor(rand() * (MAXN / SPAN)) * SPAN + diff * TIMES.length + timeIdx;
  return `${word}-${String(n).padStart(3, '0')}`;
}

export function parseCode(s) {
  const m = String(s ?? '').toUpperCase().replace(/[\s_]+/g, '').match(/^([A-Z]+)-?(\d{1,3})$/);
  if (!m || !C.CODE_WORDS.includes(m[1]) || +m[2] >= MAXN) return null;
  const n = +m[2];
  return {
    code: `${m[1]}-${String(n).padStart(3, '0')}`,
    diff: Math.floor((n % SPAN) / TIMES.length),
    timeIdx: n % TIMES.length,
    time: TIMES[n % TIMES.length],
  };
}

// cyrb-style string hash -> mulberry32
export function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  let a = (h ^ (h >>> 16)) >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = (arr) => arr[Math.floor(next() * arr.length)];
  const shuffle = (arr) => {
    const a2 = [...arr];
    for (let i = a2.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [a2[i], a2[j]] = [a2[j], a2[i]];
    }
    return a2;
  };
  return { next, int, pick, shuffle, chance: (p) => next() < p };
}

// ---------- Wires ----------
const WIRE_KEYS = Object.keys(C.WIRE_COLORS);
const posAct = (r, k) => (r.chance(0.25) ? { t: 'last' } : { t: 'pos', i: r.int(1, k) });

function wireRules(r, k, count) {
  const types = r.shuffle(['none', 'one', 'many', 'last', 'odd', 'bat', 'donot']).slice(0, count);
  const list = types.map((t) => {
    const cond = { t, c: r.pick(WIRE_KEYS), k: r.int(1, 3) };
    // Color actions only pair with conditions that guarantee that color exists.
    const act = t === 'many' ? { t: 'colorLast', c: cond.c }
      : t === 'one' && r.chance(0.5) ? { t: 'color', c: cond.c }
      : t === 'donot' ? { t: 'donot' }
      : posAct(r, k);
    return { cond, act };
  });
  return { list, otherwise: posAct(r, k) };
}

function wireMatch(cond, s, ctx) {
  const count = s.wires.filter((w) => w === cond.c).length;
  switch (cond.t) {
    case 'none': return count === 0;
    case 'one': return count === 1;
    case 'many': return count > 1;
    case 'last': return s.wires.at(-1) === cond.c;
    case 'odd': return +ctx.serial.at(-1) % 2 === 1;
    case 'bat': return ctx.batteries >= cond.k;
    case 'donot': return s.doNot >= 0;
  }
}

export function solveWires(s, rules, ctx) {
  const act = (rules.list.find((x) => wireMatch(x.cond, s, ctx)) ?? { act: rules.otherwise }).act;
  switch (act.t) {
    case 'pos': return act.i - 1;
    case 'last': return s.wires.length - 1;
    case 'color': return s.wires.indexOf(act.c);
    case 'colorLast': return s.wires.lastIndexOf(act.c);
    case 'donot': return s.doNot;
  }
}

function genWires(r, ctx) {
  const n = r.int(3, 6);
  const wires = Array.from({ length: n }, () => r.pick(WIRE_KEYS));
  const doNot = r.chance(0.35) ? r.int(0, n - 1) : -1;
  const rules = {};
  for (let k = 3; k <= 6; k++) rules[k] = wireRules(r, k, ctx.diff.rules);
  const s = { wires, doNot, rules };
  return { ...s, answer: solveWires(s, rules[n], ctx) };
}

// ---------- Button ----------
const BTN_KEYS = Object.keys(C.BUTTON_COLORS);
const STRIP_KEYS = Object.keys(C.STRIP_COLORS);

function buttonMatch(cond, s, ctx) {
  switch (cond.t) {
    case 'label': return s.label === cond.label;
    case 'color': return s.color === cond.c;
    case 'bat': return ctx.batteries > cond.k;
    case 'odd': return +ctx.serial.at(-1) % 2 === 1;
    case 'stickers': return ctx.stickers.length >= cond.k;
  }
}

export function solveButton(s, ctx) {
  const action = (s.rules.list.find((x) => buttonMatch(x.cond, s, ctx)) ?? { act: s.rules.otherwise }).act;
  return { action, digit: action === 'hold' ? s.rules.release[s.strip] : null };
}

function genButton(r, ctx) {
  const label = r.pick(C.BUTTON_LABELS);
  const color = r.pick(BTN_KEYS);
  const strip = r.pick(STRIP_KEYS);
  const list = Array.from({ length: ctx.diff.rules + 1 }, () => {
    const t = r.pick(['label', 'color', 'bat', 'odd', 'stickers']);
    return {
      // Bias label/color conditions toward this bomb so they actually come up.
      cond: { t, label: r.chance(0.4) ? label : r.pick(C.BUTTON_LABELS), c: r.chance(0.4) ? color : r.pick(BTN_KEYS), k: r.int(1, 3) },
      act: r.chance(0.5) ? 'tap' : 'hold',
    };
  });
  const digits = r.shuffle([1, 2, 3, 4, 5]);
  const release = Object.fromEntries(STRIP_KEYS.map((k, i) => [k, digits[i]]));
  const s = { label, color, strip, rules: { list, otherwise: r.chance(0.5) ? 'tap' : 'hold', release } };
  return { ...s, answer: solveButton(s, ctx) };
}

// ---------- Keypad ----------
const SYM_KEYS = Object.keys(C.SYMBOLS);

function genKeypad(r, ctx) {
  for (;;) {
    const columns = Array.from({ length: ctx.diff.cols }, () => r.shuffle(SYM_KEYS).slice(0, 6));
    const ci = r.int(0, columns.length - 1);
    const symbols = r.shuffle(columns[ci]).slice(0, 4);
    if (columns.filter((col) => symbols.every((x) => col.includes(x))).length !== 1) continue;
    return { symbols, columns, answer: columns[ci].filter((x) => symbols.includes(x)) };
  }
}

// ---------- Passive-Aggressive Light ----------
function genLight(r, ctx) {
  const words = r.shuffle(C.LIGHT_WORDS).slice(0, ctx.diff.lightWords);
  const pats = r.shuffle(Array.from({ length: 2 ** ctx.diff.patLen }, (_, i) =>
    i.toString(2).padStart(ctx.diff.patLen, '0').replace(/0/g, 'S').replace(/1/g, 'L')));
  const table = words.map((word, i) => ({ word, pattern: pats[i], dial: r.int(1, 9) }));
  const pick = r.pick(table);
  return { pattern: pick.pattern, table, answer: pick.dial };
}

// ---------- CAPTCHA ----------
function genCaptcha(r, ctx) {
  const idx = C.CAPTCHA_ITEMS.map((_, i) => i);
  const key = r.shuffle(C.CAPTCHA_PROMPTS).slice(0, ctx.diff.prompts)
    .map((prompt) => ({ prompt, items: r.shuffle(idx).slice(0, r.int(6, 9)).sort((a, b) => a - b) }));
  const k = r.pick(key);
  for (;;) {
    const tiles = r.shuffle(idx).slice(0, 9);
    const answer = tiles.map((t, pos) => (k.items.includes(t) ? pos : -1)).filter((p) => p >= 0);
    if (answer.length >= 2 && answer.length <= 5) return { prompt: k.prompt, tiles, key, answer };
  }
}

const GEN = { wires: genWires, button: genButton, keypad: genKeypad, light: genLight, captcha: genCaptcha };

// ---------- Notes (manual flavor; traps only on harder levels) ----------
function genNotes(r, types, diff) {
  const trapType = r.chance(diff.trap) ? r.pick(types) : null;
  const notes = {};
  for (const t of [...types, 'bee']) {
    const list = [{ kind: 'help', text: r.pick(C.HELP_NOTES[t]), author: r.pick(C.AUTHORS) }];
    if (r.chance(0.5)) list.push({ kind: 'flavor', lines: r.pick(C.FLAVOR_NOTES) });
    if (t === trapType) list.push({ kind: 'trap', text: C.TRAP_NOTES[t] });
    notes[t] = list;
  }
  return notes;
}

export function generate(input) {
  const p = parseCode(input);
  if (!p) return null;
  const r = rng(p.code);
  const diff = DIFFS[p.diff];
  const ALNUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const serial = 'DTNR-' + Array.from({ length: 3 }, () => r.pick(ALNUM)).join('') + r.int(0, 9);
  const ctx = { serial, batteries: r.int(0, 4), stickers: r.shuffle(C.STICKERS).slice(0, r.int(0, 3)), diff };
  const types = r.shuffle(MODULE_TYPES).slice(0, diff.modules);
  // Each module gets its own stream so one module's content never shifts another's.
  const modules = types.map((type) => ({ type, ...GEN[type](rng(`${p.code}:${type}`), ctx) }));
  const br = rng(`${p.code}:bee`);
  const beeEntry = br.pick(C.BEE_WORDS[diff.id]);
  const bee = { active: br.chance(1 / 3), ...beeEntry };
  const notes = genNotes(rng(`${p.code}:notes`), types, diff);
  return { ...p, diffName: diff.name, serial: ctx.serial, batteries: ctx.batteries, stickers: ctx.stickers, ctx, modules, bee, notes };
}
