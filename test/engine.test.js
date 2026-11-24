import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { makeCode, parseCode, generate, rng, DIFFS, TIMES } from '../js/engine.js';
import { SYMBOLS } from '../js/content.js';

const codes = Array.from({ length: 1500 }, (_, i) => makeCode(i % 3, i % 5, rng('codes' + i).next));

test('codes round-trip difficulty and time for every setting', () => {
  for (let d = 0; d < DIFFS.length; d++)
    for (let t = 0; t < TIMES.length; t++)
      for (let i = 0; i < 50; i++) {
        const p = parseCode(makeCode(d, t));
        assert.equal(p.diff, d);
        assert.equal(p.time, TIMES[t]);
      }
});

test('parseCode normalizes input and rejects junk', () => {
  assert.equal(parseCode(' turkey 42 ').code, 'TURKEY-042');
  for (const bad of ['', 'NOPE-123', 'TURKEY-995', 'TURKEY', '123', null]) assert.equal(parseCode(bad), null);
});

test('Bomb page and Manual page (separate processes) build identical data', () => {
  const sample = codes.slice(0, 200);
  const script = `import('./js/engine.js').then(m => process.stdout.write(JSON.stringify(${JSON.stringify(sample)}.map(m.generate))))`;
  const other = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { maxBuffer: 1 << 26 }));
  assert.deepEqual(other, JSON.parse(JSON.stringify(sample.map(generate))));
});

test('every generated bomb is solvable from its own rules', () => {
  let bees = 0;
  for (const code of codes) {
    const b = generate(code);
    assert.equal(b.modules.length, DIFFS[b.diff].modules);
    assert.match(b.serial, /^DTNR-[A-Z0-9]{3}\d$/);
    for (const m of b.modules) {
      if (m.type === 'wires') assert.ok(m.answer >= 0 && m.answer < m.wires.length, code);
      if (m.type === 'button') assert.ok(m.answer.action === 'tap' || (m.answer.digit >= 1 && m.answer.digit <= 5));
      if (m.type === 'keypad') {
        assert.equal(m.answer.length, 4);
        assert.equal(m.columns.filter((c) => m.symbols.every((s) => c.includes(s))).length, 1);
        assert.ok(m.symbols.every((s) => SYMBOLS[s]));
      }
      if (m.type === 'light') {
        assert.equal(new Set(m.table.map((x) => x.pattern)).size, m.table.length);
        assert.ok(m.table.some((x) => x.pattern === m.pattern && x.dial === m.answer));
      }
      if (m.type === 'captcha') assert.ok(m.answer.length >= 2 && m.answer.length <= 5);
    }
    assert.ok(b.bee.word.length >= [5, 7, 9][b.diff]);
    if (b.diff === 0) assert.equal(b.bee.word.length, 5);
    bees += b.bee.active;
  }
  const rate = bees / codes.length;
  assert.ok(rate > 0.28 && rate < 0.39, `bee rate ${rate}`);
});

test('Intern manuals never contain trap notes', () => {
  for (const code of codes.filter((c) => parseCode(c).diff === 0))
    assert.ok(!Object.values(generate(code).notes).flat().some((n) => n.kind === 'trap'));
});
