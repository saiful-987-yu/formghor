(function () {
var LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
var HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
function el(tag, className, text) {
var node = document.createElement(tag);
if (className) {
node.className = className;
}
if (text) {
node.textContent = text;
}
return node;
}
function pick(obj, lang) {
if (!obj) {
return '';
}
return obj[lang] || obj.bn || obj.en || '';
}
var formTab = 'public';
var query = '';
var termCache = {};
var FILLER = {};
(function () {
var words = ['ডেমো', 'demo', 'ফর্ম', 'ফরম', 'form', 'forms', 'for', 'the', 'a', 'an', 'of', 'to', 'and', 'my', 'i', 'want', 'need', 'make', 'create', 'আমার', 'আমি', 'চাই', 'দরকার', 'লাগবে', 'বানাতে', 'বানানো', 'তৈরি', 'করতে', 'জন্য', 'এর', 'এবং', 'ও'];
for (var i = 0; i < words.length; i++) {
FILLER[words[i]] = 1;
}
})();
function fold(s) {
s = String(s || '').toLowerCase();
if (s.normalize) {
s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
s = s.replace(/ী/g, 'ি').replace(/ূ/g, 'ু').replace(/ঈ/g, 'ই').replace(/ঊ/g, 'উ');
return s.replace(/[\u200b-\u200d\ufeff]/g, '').replace(/[\s,.;:!?\-_\/\\()\[\]{}'"\u2018\u2019\u201c\u201d|+*&^%$#@~`<>=\u0964]+/g, ' ').replace(/^ +| +$/g, '');
}
function loose(s) {
return s.replace(/[\u0981-\u0983\u09bc-\u09cd\u09d7]/g, '').replace(/[শষ]/g, 'স').replace(/ণ/g, 'ন').replace(/য/g, 'জ').replace(/(.)\1+/g, '$1');
}
function wordStart(hay, t) {
return (' ' + hay).indexOf(' ' + t) >= 0;
}
function near(a, b) {
var la = a.length;
var lb = b.length;
if (Math.abs(la - lb) > 1) {
return false;
}
var i = 0;
while (i < la && i < lb && a.charAt(i) === b.charAt(i)) {
i++;
}
if (i === la && i === lb) {
return true;
}
if (la === lb) {
return a.slice(i + 1) === b.slice(i + 1) || (a.charAt(i) === b.charAt(i + 1) && a.charAt(i + 1) === b.charAt(i) && a.slice(i + 2) === b.slice(i + 2));
}
return la > lb ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}
function termsOf(form) {
if (termCache[form.slug]) {
return termCache[form.slug];
}
var raw = [];
var parts = [form.title, form.tags];
for (var p = 0; p < parts.length; p++) {
if (parts[p]) {
raw.push(parts[p].bn, parts[p].en);
}
}
if (form.keys) {
raw = raw.concat(form.keys);
}
var seen = {};
var out = [];
function add(v) {
var s = fold(v);
if (s && !seen[s]) {
seen[s] = 1;
out.push({ s: s, l: loose(s) });
}
}
for (var i = 0; i < raw.length; i++) {
var chunk = raw[i];
if (Object.prototype.toString.call(chunk) === '[object Array]') {
for (var c = 0; c < chunk.length; c++) {
raw.push(chunk[c]);
}
continue;
}
var phrase = fold(chunk);
add(phrase);
if (phrase.indexOf(' ') > 0) {
var w = phrase.split(' ');
for (var k = 0; k < w.length; k++) {
add(w[k]);
}
}
}
termCache[form.slug] = out;
return out;
}
function tokenScore(t, tl, terms) {
var best = 0;
for (var i = 0; i < terms.length; i++) {
var term = terms[i];
var s = 0;
if (term.s === t) {
s = 6;
} else if (wordStart(term.s, t)) {
s = 4;
} else if (t.length >= 3 && term.s.indexOf(t) >= 0) {
s = 3;
} else if (tl.length >= 3 && term.l === tl) {
s = 3;
} else if (tl.length >= 3 && wordStart(term.l, tl)) {
s = 2;
} else if (tl.length >= 4 && term.l.indexOf(tl) >= 0) {
s = 2;
} else if (t.length >= 4 && near(term.s, t)) {
s = 1;
}
if (s > best) {
best = s;
}
}
return best;
}
function searchForms(list, q) {
var words = fold(q).split(' ');
var toks = [];
for (var w = 0; w < words.length; w++) {
if (words[w] && !FILLER[words[w]]) {
toks.push(words[w]);
}
}
var res = [];
var top = 0;
for (var i = 0; i < list.length; i++) {
var f = list[i];
if (!f || !/^[a-z0-9-]+$/.test(f.slug || '')) {
continue;
}
var count = 0;
var total = 0;
if (toks.length) {
var terms = termsOf(f);
for (var t = 0; t < toks.length; t++) {
var sc = tokenScore(toks[t], loose(toks[t]), terms);
if (sc) {
count++;
total += sc;
}
}
if (!count) {
continue;
}
} else {
count = 1;
total = 1;
}
if (count > top) {
top = count;
}
res.push({ f: f, c: count, s: total, i: i });
}
res.sort(function (a, b) {
return b.c - a.c || b.s - a.s || a.i - b.i;
});
var out = [];
for (var r = 0; r < res.length; r++) {
if (res[r].c === top) {
out.push(res[r].f);
}
}
return out;
}
function readStore(key) {
try {
return window.sessionStorage.getItem(key);
} catch (e) {
return null;
}
}
function writeStore(key, value) {
try {
window.sessionStorage.setItem(key, value);
} catch (e) {}
}
function navType() {
try {
var nav = window.performance.getEntriesByType('navigation');
return nav && nav.length ? nav[0].type : '';
} catch (e) {
return '';
}
}
function accessKey(access) {
if (access === 'locked' || access === 'freemium') {
return access;
}
return 'free';
}
function buildCard(form, lang, base, favMode) {
var access = accessKey(form.access);
var pages = form.pages > 1 ? form.pages : 1;
var card = el('a', 'g-card');
card.href = base + form.slug + '/index.html';
var top = el('div', 'g-card-top');
var paper = el('span', 'g-card-paper');
paper.setAttribute('aria-hidden', 'true');
if (pages > 1) {
paper.appendChild(el('span', 'g-card-sheet g-card-sheet--back'));
}
paper.appendChild(el('span', 'g-card-sheet'));
top.appendChild(paper);
var badge = el('span', 'g-badge g-badge--' + access);
if (access === 'locked') {
var icon = el('span', 'g-badge-icon');
icon.innerHTML = LOCK_SVG;
badge.appendChild(icon);
}
badge.appendChild(el('span', '', G.t('access.' + access)));
top.appendChild(badge);
card.appendChild(top);
var title = el('h3', 'g-card-title');
if (!favMode && window.G && G.favs && G.favs.has(form.slug)) {
var heart = el('span', 'g-card-fav');
heart.setAttribute('aria-hidden', 'true');
heart.innerHTML = HEART_SVG;
title.appendChild(heart);
}
title.appendChild(document.createTextNode(pick(form.title, lang)));
card.appendChild(title);
card.appendChild(el('p', 'g-card-desc', pick(form.desc, lang)));
var paperText = form.paper || 'A4';
if (pages > 1) {
paperText += ' · ' + G.t('card.pages').replace('{n}', String(pages));
}
card.appendChild(el('span', 'g-card-meta', paperText));
return card;
}
function favBtn(form) {
var btn = el('button', 'g-iconbtn g-fav g-pcard-remove');
btn.type = 'button';
btn.setAttribute('aria-pressed', 'true');
btn.setAttribute('aria-label', G.t('fav.remove'));
btn.setAttribute('title', G.t('fav.remove'));
btn.innerHTML = HEART_SVG;
btn.addEventListener('click', function () {
if (G.modal && G.modal.confirm) {
G.modal.confirm({
title: G.t('cf.favRemove.t'),
text: G.t('cf.favRemove.x'),
note: pick(form.title, G.getLang()),
onYes: function () {
G.favs.remove(form.slug);
}
});
} else {
G.favs.remove(form.slug);
}
});
return btn;
}
var pvCols = 0;
function pvMeta(slug) {
var m = (window.G_PREVIEWS || {})[slug];
if (m && m.w > 0 && m.h > 0) {
return m;
}
return { w: 210, h: 297, c: '#6b7280', m: 'doc', none: true };
}
function pvColumns(w) {
return w < 560 ? 2 : (w < 900 ? 3 : 4);
}
function pvHeight(meta, colW) {
var pad = meta.m === 'card' ? 0.16 : 0.22;
return colW * (pad + (1 - pad) * meta.h / meta.w) + 56;
}
function buildPreviewCard(form, lang, root, base, favMode) {
var meta = pvMeta(form.slug);
var access = accessKey(form.access);
var card = el('a', 'g-pcard g-pcard--' + (meta.m === 'card' ? 'card' : 'doc'));
card.href = base + form.slug + '/index.html';
var tile = el('span', 'g-pcard-tile');
tile.style.setProperty('--pc', /^#[0-9a-f]{6}$/i.test(meta.c) ? meta.c : '#6b7280');
var frame = el('span', 'g-pcard-frame');
frame.style.aspectRatio = meta.w + ' / ' + meta.h;
frame.appendChild(el('span', 'g-pcard-ph'));
if (!meta.none) {
var img = el('img', 'g-pcard-img');
img.alt = '';
img.width = meta.w;
img.height = meta.h;
img.loading = 'lazy';
img.decoding = 'async';
img.addEventListener('load', function () {
card.classList.add('is-ready');
});
img.addEventListener('error', function () {
img.remove();
});
img.src = root + 'assets/previews/' + form.slug + '.webp';
frame.appendChild(img);
}
tile.appendChild(frame);
var badge = el('span', 'g-badge g-badge--' + access + ' g-pcard-badge');
if (access === 'locked') {
var icon = el('span', 'g-badge-icon');
icon.innerHTML = LOCK_SVG;
badge.appendChild(icon);
}
badge.appendChild(el('span', '', G.t('access.' + access)));
tile.appendChild(badge);
card.appendChild(tile);
var title = el('h3', 'g-pcard-title');
if (!favMode && window.G && G.favs && G.favs.has(form.slug)) {
var heart = el('span', 'g-card-fav');
heart.setAttribute('aria-hidden', 'true');
heart.innerHTML = HEART_SVG;
title.appendChild(heart);
}
title.appendChild(document.createTextNode(pick(form.title, lang)));
card.appendChild(title);
if (favMode) {
var wrap = el('div', 'g-pcard-wrap');
wrap.appendChild(card);
wrap.appendChild(favBtn(form));
return wrap;
}
return card;
}
function pvBlock(items, cols, colW, lang, root, base, favMode) {
var block = el('div', 'g-pgrid');
var colEls = [];
var heights = [];
for (var c = 0; c < cols; c++) {
var col = el('div', 'g-pcol');
block.appendChild(col);
colEls.push(col);
heights.push(0);
}
for (var i = 0; i < items.length; i++) {
var at = 0;
for (var k = 1; k < cols; k++) {
if (heights[k] < heights[at] - 1) {
at = k;
}
}
colEls[at].appendChild(buildPreviewCard(items[i], lang, root, base, favMode));
heights[at] += pvHeight(pvMeta(items[i].slug), colW);
}
return block;
}
function buildMoreRow() {
var mid = el('div', 'g-grid-more');
var midLink = el('a', 'g-btn g-btn--ghost');
midLink.href = 'forms/index.html';
midLink.appendChild(el('span', '', G.t('forms.more')));
var midArrow = el('span', 'g-btn-arrow');
midArrow.setAttribute('aria-hidden', 'true');
midArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
midLink.appendChild(midArrow);
mid.appendChild(midLink);
return mid;
}
function renderPreview(grid, shown, lang, base, limit, favMode) {
var width = grid.clientWidth;
var cols = pvColumns(width);
pvCols = cols;
var gap = width >= 820 ? 20 : 14;
var colW = (width - gap * (cols - 1)) / cols;
var root = base.indexOf('forms/') === 0 ? '' : '../';
if (!shown.length) {
return;
}
if (limit && shown.length > 4) {
grid.appendChild(pvBlock(shown.slice(0, 4), cols, colW, lang, root, base, favMode));
grid.appendChild(buildMoreRow());
grid.appendChild(pvBlock(shown.slice(4), cols, colW, lang, root, base, favMode));
} else {
grid.appendChild(pvBlock(shown, cols, colW, lang, root, base, favMode));
}
}
function render() {
var grid = document.getElementById('g-forms-grid');
if (!grid || !window.G) {
return;
}
var lang = G.getLang();
var list = window.G_FORMS || [];
var base = grid.getAttribute('data-base') || '';
var limit = parseInt(grid.getAttribute('data-limit'), 10) || 0;
var favMode = grid.hasAttribute('data-favs');
var want = document.getElementById('g-form-tabs') ? formTab : 'public';
var searching = !favMode && !!document.getElementById('g-form-search-input') && query.replace(/\s+/g, '') !== '';
var tabsBox = document.getElementById('g-form-tabs');
if (tabsBox) {
tabsBox.hidden = searching;
}
var valid = [];
if (searching) {
valid = searchForms(list, query);
}
for (var i = 0; !searching && i < list.length; i++) {
if (list[i] && /^[a-z0-9-]+$/.test(list[i].slug || '') && (favMode ? (G.favs && G.favs.has(list[i].slug)) : (list[i].group === 'institutional' ? 'institutional' : 'public') === want)) {
valid.push(list[i]);
}
}
if (limit && !searching && !favMode) {
valid = valid.map(function (f, i) {
return { f: f, i: i };
}).sort(function (a, b) {
var ha = a.f.home || 999;
var hb = b.f.home || 999;
return ha !== hb ? ha - hb : a.i - b.i;
}).map(function (x) {
return x.f;
});
}
grid.textContent = '';
var shown = limit && valid.length > limit ? valid.slice(0, limit) : valid;
grid.classList.add('g-forms-grid--p');
renderPreview(grid, shown, lang, base, limit, favMode);
if (!shown.length) {
grid.appendChild(el('div', 'g-empty', G.t(favMode ? 'favp.empty' : (searching ? 'forms.search.none' : 'forms.empty'))));
}
var more = document.getElementById('g-forms-more');
if (more) {
more.hidden = !(limit && valid.length > limit);
}
}
function setTitle() {
var grid = document.getElementById('g-forms-grid');
if (grid && !grid.getAttribute('data-limit') && window.G) {
var favPage = grid.hasAttribute('data-favs');
G.pageTitle = function () {
return G.t(favPage ? 'menu.fav' : 'form.back') + ' - ' + G.t('site.name');
};
}
}
setTitle();
var resizeTimer = 0;
window.addEventListener('resize', function () {
clearTimeout(resizeTimer);
resizeTimer = setTimeout(function () {
var grid = document.getElementById('g-forms-grid');
if (grid && pvColumns(grid.clientWidth) !== pvCols) {
render();
}
}, 150);
});
function waLink(value, text) {
var d = String(value || '').replace(/\D/g, '');
if (!d) {
return '';
}
if (d.charAt(0) === '0') {
d = '88' + d;
}
return 'https://wa.me/' + d + (text ? '?text=' + encodeURIComponent(text) : '');
}
function httpLink(value) {
var v = String(value || '').trim();
return /^https?:\/\//i.test(v) ? v : '';
}
function devButton(href, label, solid, external, icon) {
var a = el('a', 'g-btn g-btn--sm' + (solid ? '' : ' g-btn--ghost'));
var ico = el('span', 'g-dev-ico');
ico.setAttribute('aria-hidden', 'true');
ico.innerHTML = (G.socialIcons && G.socialIcons[icon]) || '';
a.appendChild(ico);
a.appendChild(el('span', '', label));
a.href = href;
if (external) {
a.target = '_blank';
a.rel = 'noopener';
}
return a;
}
function buildExtra() {
if (!window.G || !document.getElementById('g-dev')) {
return;
}
var cfg = G.config || {};
var social = cfg.social || {};
var req = document.getElementById('g-req-btn');
if (req) {
var reqHref = waLink(social.whatsapp, G.t('req.msg'));
req.hidden = !reqHref;
if (reqHref) {
req.href = reqHref;
}
}
var nameBox = document.getElementById('g-dev-name');
if (nameBox) {
nameBox.textContent = G.t('dev.name');
}
var photo = document.getElementById('g-dev-photo');
if (photo) {
var initial = String(cfg.creator || '').charAt(0).toUpperCase();
photo.textContent = initial;
if (cfg.photo) {
var img = new Image();
img.alt = '';
img.onload = function () {
photo.textContent = '';
photo.appendChild(img);
};
img.src = cfg.photo;
}
}
var box = document.getElementById('g-dev-btns');
if (box) {
box.textContent = '';
var callNo = String(social.call || '').trim();
if (callNo && callNo !== '#') {
box.appendChild(devButton('tel:' + callNo.replace(/[^\d+]/g, ''), G.t('dev.call'), true, false, 'call'));
}
var wa = waLink(social.whatsapp, '');
if (wa) {
box.appendChild(devButton(wa, G.t('social.whatsapp'), false, true, 'whatsapp'));
}
var fb = httpLink(social.facebook);
if (fb) {
box.appendChild(devButton(fb, G.t('social.facebook'), false, true, 'facebook'));
}
var web = httpLink(social.website);
if (web) {
box.appendChild(devButton(web, G.t('dev.work'), false, true, 'website'));
}
}
}
function setupStrip() {
var strip = document.getElementById('g-feat-strip');
var prev = document.getElementById('g-feat-prev');
var next = document.getElementById('g-feat-next');
if (!strip || !prev || !next) {
return;
}
function update() {
prev.disabled = strip.scrollLeft < 4;
next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 4;
}
function move(dir) {
var first = strip.firstElementChild;
var w = first ? first.getBoundingClientRect().width + 16 : 280;
strip.scrollBy({ left: dir * w, behavior: 'smooth' });
}
prev.addEventListener('click', function () {
move(-1);
});
next.addEventListener('click', function () {
move(1);
});
strip.addEventListener('scroll', update, { passive: true });
window.addEventListener('resize', update);
update();
}
function setupReveal() {
if (!('IntersectionObserver' in window)) {
return;
}
var nodes = document.querySelectorAll('.g-hm [data-rv]');
if (!nodes.length) {
return;
}
var io = new IntersectionObserver(function (entries) {
for (var i = 0; i < entries.length; i++) {
if (entries[i].isIntersecting) {
entries[i].target.classList.add('g-in');
io.unobserve(entries[i].target);
}
}
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
for (var j = 0; j < nodes.length; j++) {
nodes[j].classList.add('g-rv');
io.observe(nodes[j]);
}
}
function markTabs(btns) {
for (var k = 0; k < btns.length; k++) {
var on = (btns[k].getAttribute('data-group') === 'institutional' ? 'institutional' : 'public') === formTab;
btns[k].classList.toggle('g-form-tab--on', on);
btns[k].setAttribute('aria-pressed', on ? 'true' : 'false');
}
}
function restoreScroll() {
if (navType() !== 'back_forward') {
return;
}
var data = null;
try {
data = JSON.parse(readStore('g.formsScroll') || 'null');
} catch (e) {}
if (data && data.tab === formTab && data.y > 0 && Math.abs(window.pageYOffset - data.y) > 2) {
window.scrollTo(0, data.y);
}
}
function setupSearch() {
var box = document.getElementById('g-form-search-input');
var clear = document.getElementById('g-form-search-clear');
if (!box || !clear) {
return;
}
function sync() {
clear.hidden = box.value === '';
}
function labels() {
box.setAttribute('placeholder', G.t('forms.search.ph'));
box.setAttribute('aria-label', G.t('forms.search.label'));
clear.setAttribute('aria-label', G.t('forms.search.clear'));
clear.setAttribute('title', G.t('forms.search.clear'));
}
query = box.value;
box.addEventListener('input', function () {
query = box.value;
sync();
render();
});
clear.addEventListener('click', function () {
box.value = '';
query = '';
sync();
render();
box.focus();
});
document.addEventListener('g:langchange', labels);
labels();
sync();
}
function setupTabs() {
var box = document.getElementById('g-form-tabs');
if (!box) {
return;
}
var btns = box.querySelectorAll('.g-form-tab');
if (readStore('g.formTab') === 'institutional') {
formTab = 'institutional';
}
markTabs(btns);
for (var i = 0; i < btns.length; i++) {
btns[i].addEventListener('click', function () {
formTab = this.getAttribute('data-group') === 'institutional' ? 'institutional' : 'public';
writeStore('g.formTab', formTab);
markTabs(btns);
render();
});
}
if ('scrollRestoration' in window.history) {
window.history.scrollRestoration = 'manual';
}
function keepScroll() {
writeStore('g.formsScroll', JSON.stringify({ tab: formTab, y: Math.round(window.pageYOffset) }));
}
window.addEventListener('pagehide', keepScroll);
document.addEventListener('visibilitychange', function () {
if (document.visibilityState === 'hidden') {
keepScroll();
}
});
window.addEventListener('load', restoreScroll);
}
document.addEventListener('DOMContentLoaded', function () {
setupTabs();
setupSearch();
render();
restoreScroll();
buildExtra();
setupStrip();
setupReveal();
if (window.location.hash === '#g-dev') {
window.setTimeout(function () {
var dev = document.getElementById('g-dev');
if (dev) {
dev.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
}, 350);
}
});
document.addEventListener('g:langchange', function () {
render();
buildExtra();
});
document.addEventListener('g:favschange', render);
})();
