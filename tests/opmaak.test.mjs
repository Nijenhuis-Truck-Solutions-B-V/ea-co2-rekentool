// Opmaaktoets: werkbank-profiel uit de eTruck Academy-canon (§17).
// Draaien: node --test tests/
// Controleert alleen de opmaak en de plek van de onderdelen, niet de rekenkern.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = (f) => readFileSync(new URL(`../css/${f}`, import.meta.url), 'utf8');
const TOOLNAAM = 'CO₂-reductie rekentool';

test('canon-CSS staat erin en wordt geladen', () => {
  assert.ok(existsSync(new URL('../css/etruck.css', import.meta.url)));
  assert.ok(existsSync(new URL('../css/etruck-tokens.css', import.meta.url)));
  assert.match(html, /<link rel="stylesheet" href="css\/etruck-tokens\.css"/);
  assert.match(html, /<link rel="stylesheet" href="css\/etruck\.css"/);
  for (const t of ['--eta-series-diesel: #5a5a5a', '--eta-series-etruck: #f9bc13']) {
    assert.ok(css('etruck.css').includes(t), t);
    assert.ok(css('etruck-tokens.css').includes(t), t);
  }
});

test('fonts: Titillium Web en Montserrat', () => {
  assert.match(html, /family=Titillium\+Web[^"]*family=Montserrat/);
});

test('werkbank-profiel met appbalk en beeldmerk, geen hero', () => {
  assert.match(html, /<body class="werkbank">/);
  assert.match(html, /<header class="appbar">[\s\S]*?<img class="brand-logo" src="etruck-academy-beeldmerk\.svg"/);
  assert.ok(html.includes(`<h1 class="appbar-titel">${TOOLNAAM}</h1>`));
  assert.ok(html.includes(`<title>${TOOLNAAM} — eTruck Academy®</title>`));
  assert.doesNotMatch(html, /class="hero/);
});

test('intro staat als één zin onder de appbalk', () => {
  const m = html.match(/<p class="werkbank-intro">([^<]*)<\/p>/);
  assert.ok(m, 'werkbank-intro ontbreekt');
  assert.equal((m[1].match(/[.!?](\s|$)/g) || []).length, 1);
});

test('break-even is de hoofd-KPI in de resultaatkaart', () => {
  const resultaat = html.slice(html.indexOf('class="card card-dense results-panel"'), html.indexOf('class="card card-dense chart-card'));
  assert.match(resultaat, /<div class="kpi hoofd">[\s\S]*?id="hero-breakeven"/);
});

test('uitwerking is table.data in .tablewrap; elk cijfer heeft .num', () => {
  assert.match(html, /<div class="tablewrap">\s*<table class="data uitwerking"/);
  const ids = ['f-diesel', 'f-stroom', 'kwh-total', 'diesel-per-km', 'kwh-per-km', 'co2-diesel-km',
    'co2-etruck-km', 'co2-diff-km', 'battery-kg', 'total-prod-etruck', 'extra-prod-etruck', 'breakeven-val'];
  for (const id of ids) {
    assert.match(html, new RegExp(`<td class="num[^"]*" id="${id}"`), id);
  }
});

test('celkleur: invoer groen, vaste factoren amber, met uitleg in tekst', () => {
  for (const id of ['dieselL', 'kmPerL', 'regen', 'battKwh']) {
    assert.match(html, new RegExp(`<input id="${id}" class="cell-input"`), id);
  }
  assert.match(html, /<td class="num cell-param" id="f-diesel"/);
  assert.match(html, /Groen: dit vul je zelf in/);
  assert.match(html, /Amber: vaste factor/);
});

test('voetbalk met bron en versie', () => {
  assert.match(html, /<footer class="appfooter">[^<]*Bronnen:[^<]*<span id="footer-versie">/);
});

test('geen eigen hexkleuren; grafiek leest canon-reekskleuren', () => {
  assert.doesNotMatch(html, /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])/);
  assert.match(html, /T\('--eta-series-diesel'\)/);
  assert.match(html, /T\('--eta-series-etruck'\)/);
});

test('geen botsende eigen definitie van canon-classes', () => {
  const eigen = html.slice(html.indexOf('<style>'), html.indexOf('</style>'));
  for (const sel of [/^\s*\.btn\s*\{/m, /^\s*\.panel\s*\{/m, /^\s*\.card\s*\{/m, /^\s*:root\s*\{/m]) {
    assert.doesNotMatch(eigen, sel);
  }
});
