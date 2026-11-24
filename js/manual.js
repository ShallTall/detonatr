import { parseCode, generate, rng } from './engine.js';
import * as C from './content.js';
import { $, store, initTheme, registerSW } from './ui.js';

// All strings below come from our own content tables or parseCode-normalized codes, so innerHTML is safe.
const wc = (c) => C.WIRE_COLORS[c].name;
const swatch = (hex) => `<i class="sw" style="--c:${hex}"></i>`;
const PREFIX = ['Where', 'In the event that', 'Should it be the case that', 'Notwithstanding the foregoing, if', 'Pursuant to Policy 7, if'];
const pat = (p) => [...p].map((x) => (x === 'S' ? '●' : '▬')).join(' ');
const plural = (k, one, many) => `${k} ${k === 1 ? one : many}`;

const WCOND = {
  none: (x) => `there are no ${wc(x.c)} wires`,
  one: (x) => `there is exactly one ${wc(x.c)} wire`,
  many: (x) => `there is more than one ${wc(x.c)} wire`,
  last: (x) => `the last wire is ${wc(x.c)}`,
  odd: () => 'the serial number ends in an odd digit',
  bat: (x) => `the device has ${x.k} or more batteries`,
  donot: () => 'any wire is labeled "DO NOT"',
};
const WACT = {
  pos: (a, fix) => `sever wire ${fix ? `<del>#${fix}</del> <span class="hand ink2">#${a.i}</span>` : `#${a.i}`}`,
  last: () => 'sever the last wire',
  color: (a) => `sever the ${wc(a.c)} wire`,
  colorLast: (a) => `sever the last ${wc(a.c)} wire`,
  donot: () => 'sever the wire labeled "DO NOT" (Legal has signed off)',
};
const BCOND = {
  label: (x) => `the button reads "${x.label}"`,
  color: (x) => `the button is ${x.c}`,
  bat: (x) => `the device has more than ${plural(x.k, 'battery', 'batteries')}`,
  odd: () => 'the serial number ends in an odd digit',
  stickers: (x) => `the casing bears ${x.k} or more stickers`,
};
const BACT = { tap: '<b>TAP</b> it (press and release promptly)', hold: '<b>HOLD</b> it and follow the Release Protocol below' };

// ---------- Margin notes ----------
let ink; // per-handbook rng for cosmetic choices only
const tilt = () => (ink.next() * 6 - 3).toFixed(1);
function noteHTML(n) {
  if (n.kind === 'flavor') {
    const [a, b] = n.lines;
    const who = ink.pick(C.AUTHORS);
    return `<aside class="note" style="--r:${tilt()}deg">${a} <span class="sig">—${who}</span></aside>` +
      (b ? `<aside class="note ink2 reply" style="--r:${tilt()}deg">${b}</aside>` : '');
  }
  const sticky = n.kind === 'help' && ink.chance(0.4);
  const sig = n.author ? ` <span class="sig">—${n.author}</span>` : '';
  return `<aside class="note${sticky ? ' sticky' : ''}" style="--r:${tilt()}deg">${n.text}${n.kind === 'help' ? sig : ''}</aside>`;
}
const notes = (bomb, type) => bomb.notes[type].map(noteHTML).join('');
const coffee = () => (ink.chance(0.45) ? `<span class="coffee" style="top:${ink.int(10, 60)}%;right:${ink.int(-30, 20)}px" aria-hidden="true"></span>` : '');
const DOODLE = `<svg class="doodle" viewBox="0 0 120 60" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M96 30l8-8M100 40l12 2M92 18l2-12M104 30h12"/><circle cx="92" cy="32" r="9"/><circle cx="30" cy="16" r="6"/><path d="M30 22l-6 16M24 38l-10 12M24 38l8 13M28 28l-12-4M28 28l12 2"/><path d="M46 20h8M44 28h10"/></g></svg>`;

// ---------- Sections ----------
const SECTIONS = {
  wires(m, bomb) {
    const fixAt = ink.int(3, 6); // one subsection gets a crossed-out correction
    const subs = [3, 4, 5, 6].map((k) => {
      const r = m.rules[k];
      const items = r.list.map((x, i) => {
        const fix = k === fixAt && i === 0 && x.act.t === 'pos' ? (x.act.i % k) + 1 : 0;
        return `<li>${PREFIX[i % PREFIX.length]} ${WCOND[x.cond.t](x.cond)}, the Associate shall ${WACT[x.act.t](x.act, fix)}.</li>`;
      });
      items.push(`<li>In all other circumstances, ${WACT[r.otherwise.t](r.otherwise)}.</li>`);
      return `<h4>2.${k - 2} Devices with ${k} wires</h4><ol class="rules">${items.join('')}</ol>`;
    }).join('');
    const legend = Object.values(C.WIRE_COLORS).map((w) => `<span class="pill">${swatch(w.hex)}${w.name}</span>`).join('');
    return `<p>Wires shall be counted from the top (Wire #1) downward. Locate the subsection matching the number of wires present. Apply <b>only the first clause that is true</b>. Severing any other wire constitutes a Reportable Incident.</p>
      <p class="legend">${legend}</p>${notes(bomb, 'wires')}${subs}`;
  },

  button(m, bomb) {
    const items = m.rules.list.map((x, i) => `<li>${PREFIX[i % PREFIX.length]} ${BCOND[x.cond.t](x.cond)}, ${BACT[x.act]}.</li>`);
    items.push(`<li>Otherwise, ${BACT[m.rules.otherwise]}.</li>`);
    const rel = Object.entries(m.rules.release).map(([c, d]) => `<tr><td>${swatch(C.STRIP_COLORS[c])}${c}</td><td><b>${d}</b></td></tr>`).join('');
    return `<p>The Button shall be engaged exactly once. A <b>tap</b> is a press shorter than half a second. A <b>hold</b> is anything longer. Apply the first clause that is true.</p>
      ${notes(bomb, 'button')}<h4>3.1 Engagement</h4><ol class="rules">${items.join('')}</ol>
      <h4>3.2 Release Protocol</h4><p>While held, a status strip illuminates and the Engagement Meter counts 1 to 5 on loop. Release when the meter shows the value for the strip color:</p>
      <table class="tbl"><thead><tr><th>Strip color</th><th>Release at</th></tr></thead><tbody>${rel}</tbody></table>`;
  },

  keypad(m, bomb) {
    const cols = m.columns.map((col, i) => `<div class="orgchart"><h5>Chart ${'ABCDEF'[i]}</h5><ol>${col.map((s) => `<li><span aria-hidden="true">${C.SYMBOLS[s][0]}</span> ${C.SYMBOLS[s][1]}</li>`).join('')}</ol></div>`).join('');
    return `<p>The keypad displays four symbols. Exactly one Approved Org Chart below contains all four. Press the symbols in the order they appear in that chart, <b>top to bottom</b>. Progress is retained after a strike, much like a grudge.</p>
      ${notes(bomb, 'keypad')}<div class="orgcharts">${cols}</div>`;
  },

  light(m, bomb) {
    const rows = [...m.table].sort((a, b) => a.pattern.localeCompare(b.pattern))
      .map((x) => `<tr><td class="pat">${pat(x.pattern)}</td><td>"${x.word}"</td><td><b>${x.dial}</b></td></tr>`).join('');
    return `<p>The light expresses feelings through blinks: <b>●</b> short, <b>▬</b> long. The pattern repeats after a long pause. Identify the message, set the dial to its value, then press Transmit feedback.</p>
      ${notes(bomb, 'light')}<table class="tbl"><thead><tr><th>Pattern</th><th>Message</th><th>Dial</th></tr></thead><tbody>${rows}</tbody></table>`;
  },

  captcha(m, bomb) {
    const key = m.key.map((k) => `<h4>Squares containing ${k.prompt}</h4><ul class="pills">${k.items.map((i) => `<li class="pill">${C.CAPTCHA_ITEMS[i][0]} ${C.CAPTCHA_ITEMS[i][1]}</li>`).join('')}</ul>`).join('');
    return `<p>Determine the prompt displayed. Select <b>exactly</b> the squares listed for that prompt, no more and no fewer, then press Verify. Interpretation of morality is reserved for the Board.</p>
      ${notes(bomb, 'captcha')}${key}`;
  },
};

function render(bomb) {
  ink = rng(`${bomb.code}:ink`);
  const doodleAt = ink.int(0, bomb.modules.length - 1);
  const timeTxt = bomb.time ? `${bomb.time / 60} minutes` : 'Unlimited (a first for this company)';
  const toc = bomb.modules.map((m, i) => `<a class="pill" href="#s-${m.type}">§${i + 2} ${C.MODULE_NAMES[m.type]}</a>`).join('') + '<a class="pill" href="#s-bee">Appendix Z</a>';
  const body = bomb.modules.map((m, i) => `
    <section class="sec" id="s-${m.type}">${coffee()}
      <h3><span class="secno">§${i + 2}</span> ${C.MODULE_NAMES[m.type]}</h3>
      ${SECTIONS[m.type](m, bomb).replace(/<h4>(\d)\./g, `<h4>${i + 2}.`)}
      ${i === doodleAt ? DOODLE : ''}
    </section>`).join('');
  const b = bomb.bee;
  $('#book').innerHTML = `
    <div class="cover card">
      <div class="label">Detonatr, Inc. · Internal use only</div>
      <h1>Official Defusal Compliance Handbook</h1>
      <p class="rev">Revision 47 <span class="muted">(Revisions 1 to 46 were lost in the Incident)</span></p>
      <div class="device-meta">
        <span class="chip serial">${bomb.code}</span>
        <span class="chip">Clearance: ${bomb.diffName}</span>
        <span class="chip">Time: ${timeTxt}</span>
      </div>
      <nav class="toc" aria-label="Sections">${toc}</nav>
      <button class="btn ghost" id="switch" type="button">Switch device</button>
    </div>
    <div class="paper">
      <section class="sec">
        <h3><span class="secno">§1</span> General Provisions</h3>
        <ol class="rules">
          <li>The Associate ("Defuser") shall describe the Device. The Reader ("Expert") shall consult this Handbook and issue instructions. Neither party may view the other's materials, per the Need-To-Know Policy.</li>
          <li>Three (3) strikes result in Involuntary Disassembly of the Device, and of the office.</li>
          <li>Several clauses depend on the Device's <b>serial number</b>, <b>battery count</b>, and <b>stickers</b>. Request these from the Defuser before proceeding.</li>
          <li>This device contains ${bomb.modules.length} modules, listed in the table of contents. Each module has its own section.</li>
          <li>Handwritten annotations are not company policy. They are, however, usually right.</li>
        </ol>
      </section>
      ${body}
      <section class="sec" id="s-bee">${coffee()}
        <h3><span class="secno">App. Z</span> Spelling Bee of Doom Contingency</h3>
        <p>On some devices, after all modules are cleared, a surprise password is requested. If the Defuser reports this, the password is a <b>${b.word.length}-letter word</b>. For security reasons it is not printed here. It is described as follows:</p>
        <dl class="bee">
          <dt>Riddle</dt><dd>${b.riddle}</dd>
          <dt>Definition</dt><dd>${b.def}</dd>
        </dl>
        <aside class="note" style="--r:${tilt()}deg">${b.note} <span class="sig">—${ink.pick(C.AUTHORS)}</span></aside>
        ${notes(bomb, 'bee')}
        <p class="muted"><small>Typos are treated as strikes. Spell it aloud, letter by letter.</small></p>
      </section>
      <p class="fineprint">© Detonatr, Inc. Explosives-as-a-service. This handbook is confidential, legally binding, and slightly singed.</p>
    </div>`;
  $('#switch').onclick = () => { $('#book').classList.add('hidden'); $('#entry').classList.remove('hidden'); history.replaceState(null, '', location.pathname); $('#codeIn').focus(); };
}

function open(raw) {
  const bomb = generate(raw);
  $('#codeErr').textContent = bomb ? '' : 'That code is not in our records. Have you tried turning your colleague off and on again?';
  if (!bomb) return;
  render(bomb);
  store.set('detonatr-last-code', bomb.code);
  history.replaceState(null, '', '#' + bomb.code);
  $('#entry').classList.add('hidden');
  $('#book').classList.remove('hidden');
  scrollTo(0, 0);
}

initTheme($('#theme'));
$('#entry').onsubmit = (e) => { e.preventDefault(); open($('#codeIn').value); };
const fromHash = decodeURIComponent(location.hash.slice(1));
if (parseCode(fromHash)) open(fromHash);
else $('#codeIn').value = store.get('detonatr-last-code') ?? '';
registerSW();
