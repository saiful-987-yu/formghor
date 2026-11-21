(function () {
var G = window.G = window.G || {};
var D = G.suggestData;
if (!D) {
return;
}
var BN_DIGITS = '০১২৩৪৫৬৭৮৯';
var BELOW100 = ['শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'ঊনিশ', 'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ', 'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'অষ্টাশি', 'ঊননব্বই', 'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'];
var cur = null;
var undoList = [];
var undoTimer = 0;
var hideTimer = 0;
var target = null;
var ui = {};
var langPick = {};
function below1000(n) {
var h = Math.floor(n / 100);
var r = n % 100;
var s = '';
if (h) {
s = BELOW100[h] + 'শত';
}
if (r) {
s += (s ? ' ' : '') + BELOW100[r];
}
return s;
}
function words(n) {
if (n === 0) {
return BELOW100[0];
}
var parts = [];
var crore = Math.floor(n / 10000000);
n = n % 10000000;
var lakh = Math.floor(n / 100000);
n = n % 100000;
var thousand = Math.floor(n / 1000);
n = n % 1000;
if (crore) {
parts.push(words(crore) + ' কোটি');
}
if (lakh) {
parts.push(BELOW100[lakh] + ' লক্ষ');
}
if (thousand) {
parts.push(BELOW100[thousand] + ' হাজার');
}
if (n) {
parts.push(below1000(n));
}
return parts.join(' ');
}
function parseMoney(value) {
var s = String(value || '').replace(/[০-৯]/g, function (d) {
return String(BN_DIGITS.indexOf(d));
}).replace(/[^0-9.]/g, '');
if (!s) {
return null;
}
var parts = s.split('.');
if (parts.length > 2) {
return null;
}
var whole = parseInt(parts[0] || '0', 10);
var paisa = parts[1] ? parseInt((parts[1] + '0').slice(0, 2), 10) : 0;
if (!isFinite(whole) || whole > 999999999999) {
return null;
}
return { whole: whole, paisa: paisa };
}
function toWords(value) {
var m = parseMoney(value);
if (!m || (m.whole === 0 && m.paisa === 0)) {
return '';
}
var s = '';
if (m.whole) {
s = words(m.whole) + ' টাকা';
}
if (m.paisa) {
s += (s ? ' ' : '') + words(m.paisa) + ' পয়সা';
}
return s + ' মাত্র';
}
function esc(s) {
return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
var kwCache = {};
function matches(text, kw) {
if (/[^\x00-\x7f]/.test(kw)) {
return text.indexOf(kw) >= 0;
}
var whole = kw.charAt(kw.length - 1) === '|';
var k = whole ? kw.slice(0, -1) : kw;
var re = kwCache[kw] || (kwCache[kw] = new RegExp('\\b' + esc(k) + (whole ? '\\b' : ''), 'i'));
return re.test(text);
}
function detect(text) {
var t = String(text || '').toLowerCase().trim();
if (!t) {
return '';
}
for (var i = 0; i < D.order.length; i++) {
var list = D.cats[D.order[i]].kw;
for (var k = 0; k < list.length; k++) {
if (matches(t, list[k])) {
return D.order[i];
}
}
}
return '';
}
function byName(name) {
return document.querySelector('[name="' + name + '"]');
}
function valOf(name) {
var e = byName(name);
return e ? String(e.value || '').trim() : '';
}
function profileOccupation() {
try {
var p = G.profile && G.profile.get && G.profile.get();
return p && p.occupation ? String(p.occupation) : '';
} catch (e) {
return '';
}
}
function context(el, type) {
var text = '';
var m = /^exp(\d+)_/.exec(el.name || '');
if (type === 'duty' && m) {
text = valOf('exp' + m[1] + '_title');
}
if (!text) {
text = valOf('job_title');
}
var cat = detect(text);
var shown = cat ? text : '';
if (!cat) {
var occ = profileOccupation();
cat = detect(occ);
if (cat) {
shown = occ;
}
}
return { cat: cat || 'general', text: shown, known: !!cat };
}
function join(list, lang) {
if (list.length < 2) {
return list.join('');
}
var last = list[list.length - 1];
return list.slice(0, -1).join(', ') + (lang === 'bn' ? ' ও ' : ' and ') + last;
}
function groupFields(type) {
return Array.prototype.slice.call(document.querySelectorAll('[data-suggest="' + type + '"]'));
}
function typedSkills() {
var out = [];
groupFields('skills').forEach(function (f) {
var v = String(f.value || '').trim();
if (v) {
out.push(v);
}
});
return out;
}
function objectiveItems(el, lang) {
var ci = context(el, 'objective');
var cat = D.cats[ci.cat];
var role = ci.text || cat.role[lang];
var skills = typedSkills();
var focus = skills.length >= 2 ? join(skills.slice(0, 3), lang) + (lang === 'bn' ? ' সংক্রান্ত' : '') : cat.focus[lang];
var set = cat.fresher ? D.objective.fresh[lang] : D.objective.exp[lang];
return set.map(function (t) {
return t.replace(/\{role\}/g, role).replace(/\{focus\}/g, focus);
});
}
function dutyItems(el, lang) {
return D.cats[context(el, 'duty').cat].duties[lang];
}
function skillItems(el, lang) {
return D.cats[context(el, 'skills').cat].skills[lang];
}
function techItems(el, lang) {
var extra = D.cats[context(el, 'tech').cat].techExtra;
var list = (extra ? extra[lang] : []).concat(D.tech[lang]);
return list.filter(function (x, i) {
return list.indexOf(x) === i;
});
}
function titleItems(el, lang) {
var ci = context(el, 'title');
var base = ['office', 'sales', 'driver', 'teacher', 'tech', 'accounts', 'it', 'design', 'health', 'student'];
var first = ci.known ? [ci.cat] : [];
var cats = first.concat(base.filter(function (c) {
return c !== ci.cat;
})).concat(['general']);
var out = [];
cats.forEach(function (c) {
D.cats[c].titles[lang].forEach(function (t) {
if (out.indexOf(t) < 0) {
out.push(t);
}
});
});
return out;
}
function todayItems() {
var d = new Date();
var two = function (n) {
return n < 10 ? '0' + n : String(n);
};
var text = two(d.getDate()) + '/' + two(d.getMonth() + 1) + '/' + d.getFullYear();
return [text.replace(/[0-9]/g, function (c) {
return '০১২৩৪৫৬৭৮৯'.charAt(Number(c));
})];
}
function wordsItems(el) {
var src = byName(el.getAttribute('data-words-from') || '');
var w = src ? toWords(src.value) : '';
return w ? [w] : [];
}
var TYPES = {
title: { key: 'sg.t.title', mode: 'chips', both: true, search: true, items: titleItems },
objective: { key: 'sg.t.objective', mode: 'pick', both: true, ctx: true, items: objectiveItems },
duty: { key: 'sg.t.duty', mode: 'pick', both: true, ctx: true, items: dutyItems },
skills: { key: 'sg.t.skills', mode: 'chips', both: true, ctx: true, group: true, items: skillItems },
tech: { key: 'sg.t.tech', mode: 'chips', both: true, ctx: true, group: true, items: techItems },
strength: { key: 'sg.t.strength', mode: 'chips', both: true, group: true, items: function (el, lang) {
return D.strengths[lang];
} },
hobby: { key: 'sg.t.hobby', mode: 'chips', both: true, group: true, items: function (el, lang) {
return D.hobbies[lang];
} },
payment: { key: 'sg.t.payment', mode: 'pick', fixed: 'bn', legal: true, items: function () {
return D.payment;
} },
terms: { key: 'sg.t.terms', mode: 'pick', fixed: 'bn', legal: true, items: function () {
return D.terms;
} },
words: { key: 'sg.t.words', mode: 'pick', fixed: 'bn', legal: true, items: wordsItems },
class: { key: 'sg.t.class', mode: 'chips', fixed: 'bn', items: function () {
return D.classes;
} },
designation: { key: 'sg.t.designation', mode: 'chips', fixed: 'bn', items: function () {
return D.designations;
} },
workplace: { key: 'sg.t.workplace', mode: 'chips', fixed: 'bn', items: function () {
return D.workplaces;
} },
today: { key: 'sg.t.today', mode: 'chips', fixed: 'bn', items: todayItems },
samaj: { key: 'sg.t.samaj', mode: 'chips', fixed: 'bn', items: function () {
return D.samaj;
} }
};
function fieldLang(el) {
var page = el.closest ? el.closest('.g-page') : null;
var l = page ? page.getAttribute('lang') : '';
return /^bn/i.test(l || '') ? 'bn' : 'en';
}
function setValue(el, value) {
el.value = value;
el.dispatchEvent(new Event('input', { bubbles: true }));
el.dispatchEvent(new Event('change', { bubbles: true }));
}
function el2(tag, cls, text) {
var n = document.createElement(tag);
if (cls) {
n.className = cls;
}
if (text) {
n.textContent = text;
}
return n;
}
function t(key) {
return G.t ? G.t(key) : key;
}
var CSS = '.g-sg-chip{position:fixed;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:0;border-radius:999px;background:#111;color:#fff;font:600 13px/1 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.28);cursor:pointer;-webkit-tap-highlight-color:transparent}'
+ '.g-sg-chip[hidden],.g-sg-back[hidden],.g-sg-undo[hidden]{display:none}'
+ '.g-sg-chip svg{width:15px;height:15px;fill:currentColor}'
+ '.g-sg-back{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.5)}'
+ '.g-sg-sheet{display:flex;flex-direction:column;width:100%;max-width:560px;max-height:78vh;border-radius:24px 24px 0 0;background:var(--g-surface,#fff);color:var(--g-text,#111);box-shadow:0 -10px 40px rgba(0,0,0,.25);font-family:system-ui,sans-serif}'
+ '.g-sg-head{display:flex;align-items:center;gap:10px;padding:16px 18px 6px}'
+ '.g-sg-title{flex:1;margin:0;font-size:1.05rem;font-weight:700}'
+ '.g-sg-lang{display:inline-flex;padding:2px;border:1px solid var(--g-line,#ddd);border-radius:999px}'
+ '.g-sg-lang button{min-width:52px;height:28px;border:0;border-radius:999px;background:none;color:inherit;font:600 12px/1 system-ui,sans-serif;cursor:pointer}'
+ '.g-sg-lang button[aria-pressed="true"]{background:var(--g-ink,#111);color:var(--g-ink-text,#fff)}'
+ '.g-sg-x{width:34px;height:34px;border:0;border-radius:50%;background:var(--g-bg,#f2f2f2);color:inherit;font-size:20px;line-height:1;cursor:pointer}'
+ '.g-sg-ctx{margin:0;padding:0 18px 8px;color:var(--g-muted,#666);font-size:.85rem}'
+ '.g-sg-search{margin:0 18px 8px;height:42px;padding:0 14px;border:1.5px solid var(--g-line,#ddd);border-radius:12px;background:var(--g-bg,#f6f6f6);color:inherit;font:inherit}'
+ '.g-sg-body{flex:1;min-height:60px;overflow:auto;padding:4px 18px 10px}'
+ '.g-sg-card{display:block;width:100%;margin:0 0 10px;padding:12px 14px;border:1.5px solid var(--g-line,#ddd);border-radius:14px;background:var(--g-bg,#f8f8f8);color:inherit;font:inherit;line-height:1.55;text-align:left;cursor:pointer}'
+ '.g-sg-card:hover,.g-sg-opt:hover{border-color:var(--g-text,#111)}'
+ '.g-sg-chips{display:flex;flex-wrap:wrap;gap:8px}'
+ '.g-sg-opt{padding:8px 14px;border:1.5px solid var(--g-line,#ddd);border-radius:999px;background:var(--g-bg,#f8f8f8);color:inherit;font:inherit;font-size:.92rem;cursor:pointer}'
+ '.g-sg-opt.is-used{opacity:.4;text-decoration:line-through;cursor:default}'
+ '.g-sg-empty{margin:8px 0;color:var(--g-muted,#666)}'
+ '.g-sg-foot{display:flex;flex-direction:column;gap:6px;padding:8px 18px 18px}'
+ '.g-sg-fill{align-self:flex-start;height:38px;padding:0 18px;border:0;border-radius:999px;background:var(--g-ink,#111);color:var(--g-ink-text,#fff);font:600 .9rem/1 system-ui,sans-serif;cursor:pointer}'
+ '.g-sg-fill[hidden]{display:none}'
+ '.g-sg-note{margin:0;color:var(--g-muted,#666);font-size:.78rem}'
+ '.g-sg-legal{color:#b3261e;font-weight:600}'
+ '.g-sg-undo{position:fixed;left:50%;bottom:20px;z-index:2147483200;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 24px);padding:8px 8px 8px 18px;border-radius:999px;background:#111;color:#fff;font:600 .88rem/1.2 system-ui,sans-serif;transform:translateX(-50%)}'
+ '.g-sg-undo button{height:32px;padding:0 14px;border:0;border-radius:999px;background:#fff;color:#111;font:700 .85rem/1 system-ui,sans-serif;cursor:pointer}'
+ '.g-sg-lock{overflow:hidden}'
+ '@media (min-width:640px){.g-sg-back{align-items:center}.g-sg-sheet{border-radius:24px}}'
+ '@media print{.g-sg-chip,.g-sg-back,.g-sg-undo{display:none!important}}';
function build() {
if (ui.chip) {
return;
}
var style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);
ui.chip = el2('button', 'g-sg-chip');
ui.chip.type = 'button';
ui.chip.hidden = true;
ui.chip.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg><span></span>';
ui.chipText = ui.chip.querySelector('span');
ui.chip.addEventListener('mousedown', function (e) {
e.preventDefault();
});
ui.chip.addEventListener('click', function () {
if (target) {
openSheet(target);
}
});
document.body.appendChild(ui.chip);
ui.back = el2('div', 'g-sg-back');
ui.back.hidden = true;
var sheet = el2('div', 'g-sg-sheet');
sheet.setAttribute('role', 'dialog');
sheet.setAttribute('aria-modal', 'true');
var head = el2('div', 'g-sg-head');
ui.title = el2('h2', 'g-sg-title');
ui.lang = el2('div', 'g-sg-lang');
ui.lang.setAttribute('role', 'group');
['en', 'bn'].forEach(function (l) {
var b = el2('button', '', l === 'en' ? 'English' : 'বাংলা');
b.type = 'button';
b.setAttribute('data-l', l);
b.addEventListener('click', function () {
if (cur) {
cur.lang = l;
langPick[cur.type] = l;
render();
}
});
ui.lang.appendChild(b);
});
ui.x = el2('button', 'g-sg-x', '×');
ui.x.type = 'button';
ui.x.addEventListener('click', closeSheet);
head.appendChild(ui.title);
head.appendChild(ui.lang);
head.appendChild(ui.x);
ui.ctx = el2('p', 'g-sg-ctx');
ui.search = el2('input', 'g-sg-search');
ui.search.type = 'search';
ui.search.addEventListener('input', function () {
if (cur) {
cur.query = ui.search.value;
renderBody();
}
});
ui.body = el2('div', 'g-sg-body');
var foot = el2('div', 'g-sg-foot');
ui.fill = el2('button', 'g-sg-fill');
ui.fill.type = 'button';
ui.fill.addEventListener('click', fillAll);
ui.note = el2('p', 'g-sg-note');
foot.appendChild(ui.fill);
foot.appendChild(ui.note);
sheet.appendChild(head);
sheet.appendChild(ui.ctx);
sheet.appendChild(ui.search);
sheet.appendChild(ui.body);
sheet.appendChild(foot);
ui.back.appendChild(sheet);
ui.back.addEventListener('click', function (e) {
if (e.target === ui.back) {
closeSheet();
}
});
document.body.appendChild(ui.back);
ui.undo = el2('div', 'g-sg-undo');
ui.undo.hidden = true;
ui.undoText = el2('span');
ui.undoBtn = el2('button');
ui.undoBtn.type = 'button';
ui.undoBtn.addEventListener('click', doUndo);
ui.undo.appendChild(ui.undoText);
ui.undo.appendChild(ui.undoBtn);
document.body.appendChild(ui.undo);
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && cur) {
closeSheet();
}
});
}
function place() {
if (!target || ui.chip.hidden) {
return;
}
var r = target.getBoundingClientRect();
if (r.bottom < 0 || r.top > window.innerHeight) {
ui.chip.style.visibility = 'hidden';
return;
}
ui.chip.style.visibility = 'visible';
var w = ui.chip.offsetWidth || 96;
var h = ui.chip.offsetHeight || 32;
var top = r.top - h - 4;
if (top < 60) {
top = r.bottom + 4;
}
top = Math.max(4, Math.min(top, window.innerHeight - h - 4));
var left = Math.max(6, Math.min(r.right - w, window.innerWidth - w - 6));
ui.chip.style.top = top + 'px';
ui.chip.style.left = left + 'px';
}
function showChip(el) {
window.clearTimeout(hideTimer);
build();
target = el;
ui.chipText.textContent = t('sg.btn');
ui.chip.hidden = false;
place();
}
function hideChipSoon() {
window.clearTimeout(hideTimer);
hideTimer = window.setTimeout(function () {
var a = document.activeElement;
if (cur || (a && a.getAttribute && a.getAttribute('data-suggest'))) {
return;
}
if (ui.chip) {
ui.chip.hidden = true;
}
}, 220);
}
function used(type) {
var map = {};
groupFields(type).forEach(function (f) {
var v = String(f.value || '').trim().toLowerCase();
if (v) {
map[v] = true;
}
});
return map;
}
function listFor() {
var cfg = cur.cfg;
var items = cfg.items(cur.el, cur.lang) || [];
var q = String(cur.query || '').trim().toLowerCase();
if (q) {
items = items.filter(function (x) {
return x.toLowerCase().indexOf(q) >= 0;
});
}
return items;
}
function renderBody() {
var cfg = cur.cfg;
var items = listFor();
ui.body.textContent = '';
if (!items.length) {
var msg = cur.type === 'words' ? t('sg.words.empty') : t('sg.none');
ui.body.appendChild(el2('p', 'g-sg-empty', msg));
} else if (cfg.mode === 'pick') {
items.forEach(function (text) {
var b = el2('button', 'g-sg-card', text);
b.type = 'button';
b.addEventListener('click', function () {
apply(cur.el, text);
closeSheet();
});
ui.body.appendChild(b);
});
} else {
var map = cfg.group ? used(cur.type) : {};
var box = el2('div', 'g-sg-chips');
items.forEach(function (text) {
var b = el2('button', 'g-sg-opt', text);
b.type = 'button';
var isUsed = !!map[text.toLowerCase()];
if (isUsed) {
b.className += ' is-used';
}
b.addEventListener('click', function () {
if (!isUsed) {
pickChip(text);
}
});
box.appendChild(b);
});
ui.body.appendChild(box);
}
ui.fill.hidden = !(cfg.group && items.length);
}
function render() {
var cfg = cur.cfg;
ui.title.textContent = t(cfg.key);
var btns = ui.lang.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-l') === cur.lang ? 'true' : 'false');
}
ui.lang.hidden = !cfg.both;
ui.search.hidden = !cfg.search;
ui.search.placeholder = t('sg.search');
ui.fill.textContent = t('sg.fillAll');
if (cfg.ctx) {
var ci = context(cur.el, cur.type);
ui.ctx.textContent = ci.known ? t('sg.ctx').replace('{ctx}', ci.text) : t('sg.general');
ui.ctx.hidden = false;
} else {
ui.ctx.hidden = true;
}
ui.note.className = 'g-sg-note' + (cfg.legal ? ' g-sg-legal' : '');
ui.note.textContent = cfg.legal ? t('sg.legal') : t('sg.note');
renderBody();
}
function openSheet(el) {
var type = el.getAttribute('data-suggest');
var cfg = TYPES[type];
if (!cfg) {
return;
}
build();
var lang = cfg.fixed || langPick[type] || fieldLang(el);
cur = { el: el, type: type, cfg: cfg, lang: lang, query: '', changes: [] };
ui.search.value = '';
ui.chip.hidden = true;
ui.undo.hidden = true;
window.clearTimeout(undoTimer);
undoList = [];
ui.back.hidden = false;
document.documentElement.classList.add('g-sg-lock');
if (document.activeElement && document.activeElement.blur) {
document.activeElement.blur();
}
render();
}
function closeSheet() {
if (!cur) {
return;
}
var changes = cur.changes;
cur = null;
ui.back.hidden = true;
document.documentElement.classList.remove('g-sg-lock');
if (changes.length) {
showUndo(changes);
}
}
function apply(el, text) {
var prev = el.value;
setValue(el, text);
cur.changes.push({ el: el, prev: prev });
}
function firstEmpty(list) {
for (var i = 0; i < list.length; i++) {
if (String(list[i].value || '').trim() === '') {
return list[i];
}
}
return null;
}
function pickChip(text) {
var cfg = cur.cfg;
if (!cfg.group) {
apply(cur.el, text);
closeSheet();
return;
}
var group = groupFields(cur.type);
var dest = cur.el;
if (String(dest.value || '').trim() !== '') {
dest = firstEmpty(group) || dest;
}
apply(dest, text);
renderBody();
}
function fillAll() {
var group = groupFields(cur.type);
var map = used(cur.type);
var items = listFor().filter(function (x) {
return !map[x.toLowerCase()];
});
var i = 0;
group.forEach(function (f) {
if (String(f.value || '').trim() === '' && i < items.length) {
apply(f, items[i]);
i++;
}
});
renderBody();
}
function showUndo(changes) {
undoList = changes;
ui.undoText.textContent = t('sg.applied');
ui.undoBtn.textContent = t('sg.undo');
ui.undo.hidden = false;
window.clearTimeout(undoTimer);
undoTimer = window.setTimeout(function () {
ui.undo.hidden = true;
undoList = [];
}, 7000);
}
function doUndo() {
for (var i = undoList.length - 1; i >= 0; i--) {
setValue(undoList[i].el, undoList[i].prev);
}
undoList = [];
ui.undo.hidden = true;
window.clearTimeout(undoTimer);
}
function autoWords(src) {
var list = document.querySelectorAll('[data-words-from="' + src.name + '"]');
for (var i = 0; i < list.length; i++) {
var w = list[i];
var prevWords = toWords(src.getAttribute('data-sg-prev') || '');
var next = toWords(src.value);
if (w.value === '' || w.value === prevWords || w.value === (w.getAttribute('data-sg-last') || '\u0000')) {
setValue(w, next);
w.setAttribute('data-sg-last', next);
}
}
src.setAttribute('data-sg-prev', src.value);
}
document.addEventListener('focusin', function (e) {
var el = e.target;
if (!el || !el.getAttribute) {
return;
}
if (el.name && document.querySelector('[data-words-from="' + el.name + '"]')) {
el.setAttribute('data-sg-prev', el.value);
}
if (el.getAttribute('data-suggest') && TYPES[el.getAttribute('data-suggest')]) {
showChip(el);
} else if (!cur) {
hideChipSoon();
}
});
document.addEventListener('focusout', function () {
hideChipSoon();
});
document.addEventListener('input', function (e) {
var el = e.target;
if (el && el.name && el.getAttribute && !el.getAttribute('data-suggest') && document.querySelector('[data-words-from="' + el.name + '"]')) {
autoWords(el);
}
if (el === target) {
place();
}
});
window.addEventListener('scroll', place, true);
window.addEventListener('resize', place);
if (window.visualViewport) {
window.visualViewport.addEventListener('resize', place);
window.visualViewport.addEventListener('scroll', place);
}
document.addEventListener('g:langchange', function () {
if (cur) {
render();
}
});
G.suggest = { toWords: toWords, detect: detect, words: words };
})();
