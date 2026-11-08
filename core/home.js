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
function favItem(form, lang, base) {
var wrap = el('div', 'g-fav-item');
wrap.appendChild(buildCard(form, lang, base, true));
var btn = el('button', 'g-iconbtn g-fav g-fav-item-btn');
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
wrap.appendChild(btn);
return wrap;
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
var valid = [];
for (var i = 0; i < list.length; i++) {
if (list[i] && /^[a-z0-9-]+$/.test(list[i].slug || '') && (favMode ? (G.favs && G.favs.has(list[i].slug)) : (list[i].group === 'institutional' ? 'institutional' : 'public') === want)) {
valid.push(list[i]);
}
}
grid.textContent = '';
var shown = limit && valid.length > limit ? valid.slice(0, limit) : valid;
for (var j = 0; j < shown.length; j++) {
grid.appendChild(favMode ? favItem(shown[j], lang, base) : buildCard(shown[j], lang, base));
}
if (!shown.length) {
grid.appendChild(el('div', 'g-empty', G.t(favMode ? 'favp.empty' : 'forms.empty')));
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
