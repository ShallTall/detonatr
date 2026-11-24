import { DIFFS, TIMES, makeCode, parseCode, generate } from './engine.js';
import * as C from './content.js';
import { $, h, pick, store, initTheme, registerSW } from './ui.js';

const TIME_LABELS = ['2 min', '4 min', '6 min', '10 min', '∞'];
const settings = store.get('detonatr-settings') ?? { diff: 1, time: 1 };
let bomb, strikes, solved, over, endAt, timerId, lastSec, wakeLock, actx;
let muted = store.get('detonatr-muted') ?? false;

// ---------- Sound (WebAudio, no files) ----------
function beep(freq, dur, type = 'square', vol = 0.05) {
  if (muted || !actx) return;
  const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur);
}
function boomSound() {
  if (muted || !actx) return;
  const len = actx.sampleRate * 1.6, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.5;
  const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
  f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = 0.9; src.buffer = buf;
  src.connect(f).connect(g).connect(actx.destination); src.start();
}

// ---------- Screens ----------
const show = (id) => ['role', 'setup', 'ready', 'game'].forEach((s) => $('#' + s).classList.toggle('hidden', s !== id));

function seg(el, labels, key) {
  const render = () => [...el.children].forEach((b, i) => b.setAttribute('aria-pressed', i === settings[key]));
  el.append(...labels.map((l, i) => h('button', { type: 'button', onclick: () => { settings[key] = i; store.set('detonatr-settings', settings); render(); } }, l)));
  render();
}

function ready(code) {
  const p = parseCode(code);
  $('#codeOut').textContent = p.code;
  $('#readyInfo').textContent = `${DIFFS[p.diff].name} · ${p.time ? TIME_LABELS[p.timeIdx] : 'Unlimited time'}`;
  $('#arm').onclick = () => tos(p.code);
  show('ready');
}

function overlay(...kids) {
  const layer = $('#layer');
  layer.replaceChildren(kids.length ? h('div', { class: 'overlay' }, h('div', { class: 'card', role: 'dialog', 'aria-modal': 'true' }, kids)) : '');
  layer.querySelector('button, input')?.focus();
}

let toastT;
function toast(msg, color) {
  document.querySelector('.toast')?.remove();
  const t = h('div', { class: 'toast', role: 'status', style: color ? `background:${color};box-shadow:none` : null }, msg);
  document.body.append(t);
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2800);
}

function tos(code) {
  const agree = h('input', { type: 'checkbox', id: 'agree' });
  const accept = h('button', { class: 'btn danger', disabled: '', onclick: () => { overlay(); start(code); } }, 'Accept & arm');
  agree.onchange = () => (accept.disabled = !agree.checked);
  overlay(
    h('h2', {}, 'Detonatr™ End User Explosion Agreement'),
    h('p', { class: 'muted' }, 'Please read the following terms in full. Nobody does.'),
    h('ol', { class: 'tos' }, C.TOS_CLAUSES.map((c) => h('li', {}, c))),
    h('label', { class: 'check', for: 'agree' }, agree, 'I have read and agree to the terms (I have not read them)'),
    accept,
    h('button', { class: 'btn ghost', onclick: () => toast('Declining is a premium feature. Please upgrade to Detonatr Pro.', 'var(--purple)') }, 'Decline'),
  );
}

// ---------- Game ----------
async function keepAwake() { try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* unsupported or denied */ } }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && bomb && !over) keepAwake(); });

function start(code) {
  bomb = generate(code);
  strikes = 0; solved = 0; over = false;
  try { actx ??= new AudioContext(); actx.resume(); } catch { /* no audio */ }
  keepAwake();
  renderStrikes();
  $('#device').replaceChildren(
    h('span', { class: 'chip serial', 'aria-label': `Serial number ${bomb.serial.split('').join(' ')}` }, bomb.serial),
    h('span', { class: 'chip' }, bomb.batteries ? `${'🔋'.repeat(bomb.batteries)} ${bomb.batteries} batter${bomb.batteries === 1 ? 'y' : 'ies'}` : '🪫 No batteries'),
    ...bomb.stickers.map((s) => h('span', { class: 'chip sticker' }, s)),
    h('small', { class: 'muted', style: 'width:100%' }, `Device ${bomb.code} · ${bomb.diffName}`),
  );
  $('#modules').replaceChildren(...bomb.modules.map((m, i) => {
    const el = h('section', { class: 'card mod', 'aria-label': C.MODULE_NAMES[m.type] });
    el.append(
      h('header', {}, h('span', { class: 'led', 'aria-hidden': 'true' }), h('h3', {}, C.MODULE_NAMES[m.type]), h('small', {}, `Module ${'ABCDE'[i]}`)),
      h('div', { class: 'body' }, MODS[m.type](m, el)),
    );
    return el;
  }));
  clearInterval(timerId);
  const timer = $('#timer');
  timer.className = 'timer' + (bomb.time ? '' : ' inf');
  if (bomb.time) {
    endAt = performance.now() + bomb.time * 1000; lastSec = null;
    timerId = setInterval(tick, 200); tick();
  } else timer.textContent = '∞ UNLIMITED';
  show('game');
  scrollTo(0, 0);
}

function tick() {
  const left = Math.max(0, endAt - performance.now()), sec = Math.ceil(left / 1000);
  if (sec !== lastSec) {
    lastSec = sec;
    $('#timer').textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
    $('#timer').classList.toggle('low', sec <= 30);
    beep(sec <= 30 ? 1500 : 1100, 0.03, 'square', 0.025);
  }
  if (left <= 0) end(false, 'The deadline was missed. As is tradition.');
}

function renderStrikes() { [...$('#strikes').children].forEach((s, i) => s.classList.toggle('on', i < strikes)); }

function strike(el, msg) {
  if (over) return;
  strikes++; renderStrikes();
  navigator.vibrate?.(250);
  beep(110, 0.35, 'sawtooth', 0.12);
  if (el) { el.classList.remove('shake', 'flash'); void el.offsetWidth; el.classList.add('shake', 'flash'); }
  if (strikes >= 3) return end(false, 'Three strikes. HR has been notified, posthumously.');
  toast(msg ?? pick(C.STRIKE_LINES));
}

function solve(el) {
  if (over) return;
  el.classList.add('solved');
  beep(880, 0.1, 'sine', 0.08); setTimeout(() => beep(1320, 0.15, 'sine', 0.08), 110);
  if (++solved === bomb.modules.length) bomb.bee.active ? spellingBee() : end(true);
}

function spellingBee() {
  const n = bomb.bee.word.length;
  const input = h('input', { class: 'field', maxlength: n, autocomplete: 'off', autocapitalize: 'characters', autocorrect: 'off', spellcheck: 'false', placeholder: '•'.repeat(n), 'aria-label': `${n}-letter password` });
  const form = h('form', {}, h('div', { class: 'bee-input' }, input), h('button', { class: 'btn primary' }, 'Submit password'));
  form.onsubmit = (e) => {
    e.preventDefault();
    const v = input.value.trim().toUpperCase();
    if (!v) return;
    if (v === bomb.bee.word) return end(true);
    input.value = '';
    strike(form.closest('.card'), pick(C.BEE_ROASTS));
  };
  overlay(
    h('div', { class: 'label', style: 'color:var(--red)' }, '⚠ Surprise compliance check'),
    h('h2', {}, 'The Spelling Bee of Doom'),
    h('p', {}, `All modules cleared. One more thing: the device requires a ${n}-letter password. Your Expert can find it in Appendix Z. Typos count as strikes.`),
    form,
  );
}

function star(r1, r2, n = 14) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? r2 : r1, a = (Math.PI * i) / n;
    return `${(100 + r * Math.sin(a)).toFixed(1)},${(100 - r * Math.cos(a)).toFixed(1)}`;
  }).join(' ');
}

function end(won, reason) {
  if (over) return;
  over = true;
  clearInterval(timerId);
  wakeLock?.release?.().catch(() => {});
  document.querySelector('.toast')?.remove();
  const left = bomb.time ? Math.max(0, Math.ceil((endAt - performance.now()) / 1000)) : null;
  const again = h('button', { class: 'btn ghost', onclick: () => { overlay(); ready(bomb.code); } }, won ? 'Replay this device' : 'Retry this device');
  const fresh = h('button', { class: 'btn primary', onclick: () => { overlay(); show('setup'); } }, 'New device');
  const stats = h('div', { class: 'stats' },
    h('span', { class: 'chip' }, bomb.code),
    h('span', { class: 'chip' }, `${solved}/${bomb.modules.length} modules`),
    h('span', { class: 'chip' }, `${strikes} strike${strikes === 1 ? '' : 's'}`),
    left != null && won ? h('span', { class: 'chip' }, `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left`) : null);
  if (won) {
    beep(660, 0.15, 'sine', 0.1); setTimeout(() => beep(880, 0.15, 'sine', 0.1), 150); setTimeout(() => beep(1320, 0.3, 'sine', 0.1), 300);
    navigator.vibrate?.([60, 60, 60]);
    overlay(h('div', { class: 'end' },
      h('div', { class: 'badge', 'aria-hidden': 'true' }, '🏅'),
      h('div', { class: 'big', style: 'color:var(--teal)' }, 'DEFUSED'),
      h('p', {}, pick(C.WIN_LINES)), stats, fresh, again));
  } else {
    boomSound();
    navigator.vibrate?.([400, 100, 400, 100, 800]);
    const svg = h('div');
    svg.innerHTML = `<svg class="boom" viewBox="0 0 200 200" aria-hidden="true"><polygon points="${star(98, 62)}" fill="var(--red)"/><polygon points="${star(74, 46, 11)}" fill="var(--yellow)"/><text x="100" y="113" text-anchor="middle" font-family="Outfit, sans-serif" font-weight="900" font-size="36" fill="#111">BOOM</text></svg>`;
    overlay(h('div', { class: 'end' }, svg,
      h('div', { class: 'big', style: 'color:var(--red)' }, 'KA-BOOM'),
      h('p', {}, h('b', {}, pick(C.LOSS_LINES))),
      h('p', { class: 'muted' }, reason), stats, again, fresh));
  }
}

// ---------- Modules ----------
const MODS = {
  wires(m, el) {
    return m.wires.map((c, i) => {
      const w = C.WIRE_COLORS[c];
      const label = `Wire ${i + 1}, ${w.name}${i === m.doNot ? ', labeled DO NOT' : ''}`;
      const b = h('button', { class: 'wire' + (c === 'black' || c === 'blue' ? ' dark-wire' : ''), style: `--c:${w.hex}`, 'aria-label': label },
        h('span', { class: 'num' }, i + 1),
        h('span', { class: 'bar' }, h('em', {}, w.name), i === m.doNot ? h('span', { class: 'tag' }, 'DO NOT') : null));
      b.onclick = () => {
        if (b.classList.contains('cut')) return;
        b.classList.add('cut'); b.setAttribute('aria-label', label + ', cut');
        beep(300, 0.05, 'triangle', 0.08);
        i === m.answer ? solve(el) : strike(el);
      };
      return b;
    });
  },

  button(m, el) {
    const strip = h('div', { class: 'strip', style: `--s:${C.STRIP_COLORS[m.strip]}`, 'aria-label': 'Status strip' });
    const val = h('b', {}, '–');
    const btn = h('button', { class: 'bigbtn', style: `--c:${C.BUTTON_COLORS[m.color]}`, 'aria-label': `Big ${m.color} button labeled ${m.label}` }, m.label);
    let t0 = 0, n = 0, holdT, meterT;
    const reset = () => { t0 = 0; n = 0; clearTimeout(holdT); clearInterval(meterT); btn.classList.remove('down'); strip.classList.remove('on'); val.textContent = '–'; strip.removeAttribute('title'); };
    const down = (e) => {
      if (t0) return;
      e.preventDefault();
      try { btn.setPointerCapture(e.pointerId); } catch { /* keyboard or synthetic event */ }
      t0 = performance.now(); btn.classList.add('down');
      holdT = setTimeout(() => {
        strip.classList.add('on'); strip.setAttribute('aria-label', `Status strip: ${m.strip}`);
        n = 1; val.textContent = n;
        meterT = setInterval(() => { n = (n % 5) + 1; val.textContent = n; beep(500 + n * 80, 0.04, 'sine', 0.04); }, 900);
      }, 450);
    };
    const up = () => {
      if (!t0) return;
      const held = performance.now() - t0 >= 450, at = n;
      reset();
      const ok = m.answer.action === 'tap' ? !held : held && at === m.answer.digit;
      ok ? solve(el) : strike(el);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', reset);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
    btn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
    btn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') up(); });
    return h('div', { class: 'bigbtn-wrap' }, btn, strip, h('div', { class: 'meter', 'aria-live': 'polite' }, 'Engagement Meter: ', val));
  },

  keypad(m, el) {
    let step = 0;
    return h('div', { class: 'keys' }, m.symbols.map((s) => {
      const [emoji, name] = C.SYMBOLS[s];
      const k = h('button', { class: 'key', 'aria-label': name }, h('span', { 'aria-hidden': 'true' }, emoji), h('small', {}, name));
      k.onclick = () => {
        if (k.classList.contains('done')) return;
        if (s !== m.answer[step]) return strike(el);
        k.classList.add('done'); beep(660, 0.08, 'sine', 0.06);
        if (++step === 4) solve(el);
      };
      return k;
    }));
  },

  light(m, el) {
    const bulb = h('div', { class: 'bulb', role: 'img', 'aria-label': `Blinking light. Pattern: ${m.pattern.replace(/S/g, 'short ').replace(/L/g, 'long ')}` });
    const seq = [...m.pattern];
    let i = 0;
    const run = () => {
      if (!bulb.isConnected || over || el.classList.contains('solved')) return;
      if (i === seq.length) { i = 0; return setTimeout(run, 2200); }
      bulb.classList.add('on');
      setTimeout(() => { bulb.classList.remove('on'); setTimeout(run, 450); }, seq[i++] === 'S' ? 280 : 950);
    };
    setTimeout(run, 900);
    let v = 5;
    const num = h('span', {}, v), knob = h('div', { class: 'knob', role: 'img', 'aria-label': 'Dial' }, h('i'), num);
    const set = (d) => { v = ((v - 1 + d + 9) % 9) + 1; num.textContent = v; knob.style.setProperty('--a', `${(v - 5) * 30}deg`); knob.setAttribute('aria-label', `Dial at ${v}`); };
    set(0);
    return [
      h('div', { class: 'bulb-wrap' }, bulb, h('small', { class: 'muted' }, 'Pattern repeats after a long pause')),
      h('div', { class: 'dial' }, h('button', { onclick: () => set(-1), 'aria-label': 'Dial down' }, '−'), knob, h('button', { onclick: () => set(1), 'aria-label': 'Dial up' }, '+')),
      h('button', { class: 'btn ghost', onclick: () => (v === m.answer ? solve(el) : strike(el)) }, 'Transmit feedback'),
    ];
  },

  captcha(m, el) {
    const tiles = m.tiles.map((t) => {
      const [emoji, cap] = C.CAPTCHA_ITEMS[t];
      const b = h('button', { class: 'tile', 'aria-pressed': 'false' }, h('span', { 'aria-hidden': 'true' }, emoji), cap);
      b.onclick = () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      return b;
    });
    const verify = () => {
      const sel = tiles.flatMap((b, i) => (b.getAttribute('aria-pressed') === 'true' ? [i] : []));
      if (sel.join() === m.answer.join()) return solve(el);
      strike(el, 'CAPTCHA failed. Are you sure you\'re a human resource?');
      tiles.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    };
    return [
      h('div', { class: 'captcha-head' }, 'Select all squares containing', h('b', {}, m.prompt), h('small', {}, 'Click verify once there are none left.')),
      h('div', { class: 'tiles' }, tiles),
      h('button', { class: 'btn primary', onclick: verify }, 'Verify'),
    ];
  },
};

// ---------- Boot ----------
initTheme($('#theme'));
const soundBtn = $('#sound');
const renderSound = () => { soundBtn.textContent = muted ? '🔇' : '🔊'; soundBtn.setAttribute('aria-label', muted ? 'Sound off' : 'Sound on'); };
soundBtn.onclick = () => { muted = !muted; store.set('detonatr-muted', muted); renderSound(); };
renderSound();
seg($('#diff'), DIFFS.map((d) => d.name), 'diff');
seg($('#time'), TIME_LABELS, 'time');
$('#request').onclick = () => ready(makeCode(settings.diff, settings.time));
$('#back').onclick = () => show('setup');
$('#pickDefuser').onclick = () => show('setup');
$('#switchRole').onclick = (e) => { e.preventDefault(); show('role'); };
$('#codeForm').onsubmit = (e) => {
  e.preventDefault();
  const p = parseCode($('#codeIn').value);
  $('#codeErr').textContent = p ? '' : 'That code is not in our records. Please check with your Expert.';
  if (p) ready(p.code);
};
registerSW();
