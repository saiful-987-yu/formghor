(function () {
var G = window.G = window.G || {};
var SLUG = '';
var META = null;
var toastTimer = null;
var unlocked = false;
var demoSig = '';
var previewBox = null;
var previewDemo = false;
var X_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
var RING_SVG = '<svg viewBox="0 0 36 36" aria-hidden="true"><circle class="g-ring-bg" cx="18" cy="18" r="15.5"/><circle class="g-ring-fg" cx="18" cy="18" r="15.5" pathLength="100" transform="rotate(-90 18 18)"/></svg>';
var HEART_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
var SHARE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
var EYE_SVG = '<svg class="g-eye-on" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><svg class="g-eye-off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.5 10.5 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
var TOP_HTML =
'<a class="g-skip" href="#g-main" data-i18n="ui.skip">মূল অংশে যান</a>' +
'<header class="g-header"><div class="g-wrap g-header-row">' +
'<a class="g-brand" href="../../index.html"><img src="../../assets/icons/logo.svg" alt=""><span data-i18n="site.name">ফর্মঘর</span></a>' +
'<div class="g-tools">' +
'<button class="g-iconbtn" id="g-lang-btn" type="button" data-i18n-label="ui.switchLang"><span id="g-lang-text">EN</span></button>' +
'<button class="g-iconbtn" id="g-theme-btn" type="button" data-i18n-label="ui.switchTheme">' +
'<svg class="g-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
'<svg class="g-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' +
'</button></div></div></header>' +
'<main class="g-main" id="g-main">' +
'<div class="g-wrap g-form-head">' +
'<nav class="g-crumbs" aria-label="Breadcrumb"><ol>' +
'<li><a href="../../index.html" data-i18n="crumb.home">হোম</a></li>' +
'<li><a href="../index.html" data-i18n="form.back">সব ফর্ম</a></li>' +
'<li aria-current="page" id="g-crumb-current"></li>' +
'</ol></nav>' +
'<div class="g-form-titlebar"><button class="g-iconbtn g-fav" id="g-fav-btn" type="button" aria-pressed="false">' + HEART_SVG + '</button><h1 class="g-form-title" id="g-form-title"></h1><span class="g-ring" id="g-fillring" role="img">' + RING_SVG + '<span class="g-ring-n"></span></span></div>' +
'<p class="g-form-desc" id="g-form-desc"></p>' +
'<div class="g-form-meta"><div class="g-form-chips" id="g-form-chips"></div><button class="g-iconbtn g-share" type="button" data-i18n-label="share.label">' + SHARE_SVG + '</button></div>' +
'</div>' +
'<div class="g-wrap g-form-actions"><button class="g-btn g-btn--ghost" id="g-fill-btn" type="button" data-i18n="fill.apply">অটো-ফিল</button><button class="g-btn g-btn--ghost" id="g-saves-btn" type="button" hidden data-i18n="act.saves">আপনার সেভ</button><button class="g-btn" id="g-demo-btn" type="button" data-i18n="act.printDemo">প্রিন্ট ডেমো</button></div>' +
'<div class="g-stage" id="g-stage"><div class="g-pages-wrap" id="g-pages-wrap"><div class="g-pages" id="g-pages"></div></div></div>' +
'<div class="g-wrap g-form-actions g-form-actions--bottom"><button class="g-btn g-btn--ghost" id="g-clear-btn" type="button" data-i18n="act.clear">ক্লিয়ার</button><button class="g-btn g-btn--ghost" id="g-save-btn" type="button" data-i18n="act.save">সেভ</button><button class="g-btn g-print-btn" type="button" data-i18n="form.print">প্রিন্ট</button></div>' +
'<div class="g-wrap g-form-actions g-form-actions--multi g-multi-off" id="g-multi-act"><button class="g-btn g-multi-btn" id="g-multi-btn" type="button" aria-expanded="false" aria-controls="g-multi"></button></div>' +
'<section class="g-wrap g-multi" id="g-multi" hidden><div class="g-multi-head"><h2 class="g-multi-title" id="g-multi-title"></h2><p class="g-multi-note" id="g-multi-note"></p><p class="g-multi-count" id="g-multi-count"></p></div><div class="g-multi-rows" id="g-multi-rows"></div><div class="g-multi-tail" id="g-multi-tail" hidden><button class="g-btn g-btn--ghost" type="button" data-go="clear"></button><button class="g-btn g-btn--ghost" type="button" data-go="save"></button><button class="g-btn" type="button" data-go="print"></button></div></section>' +
'<form class="g-lock" id="g-lock" hidden>' +
'<h2 class="g-lock-title" data-i18n="lock.title">এই ফর্মটি লক করা</h2>' +
'<p class="g-lock-text" data-i18n="lock.text">খুলতে পাসওয়ার্ড দিন।</p>' +
'<div class="g-lock-field">' +
'<input class="g-lock-input" id="g-lock-input" type="password" autocomplete="off" data-i18n-ph="lock.placeholder">' +
'<button class="g-lock-eye" id="g-lock-eye" type="button" aria-pressed="false">' + EYE_SVG + '</button>' +
'</div>' +
'<button class="g-btn" type="submit" data-i18n="lock.btn">খুলুন</button>' +
'<p class="g-lock-error" id="g-lock-error" role="alert" hidden data-i18n="lock.wrong">পাসওয়ার্ড মিলছে না।</p>' +
'<div class="g-lock-ask" id="g-lock-ask" hidden><span class="g-lock-ask-text" data-i18n="lock.noPass">পাসওয়ার্ড নেই?</span><a class="g-lock-ask-link" id="g-lock-ask-link" target="_blank" rel="noopener" data-i18n="lock.ask">পাসওয়ার্ড সংগ্রহ করুন</a></div>' +
'</form>' +
'</main>' +
'<footer class="g-footer" id="g-footer" data-base="../../"></footer>' +
'<div class="g-toast" id="g-toast" role="status" aria-live="polite"></div>';
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
function pick(obj) {
if (!obj) {
return '';
}
var lang = G.getLang();
return obj[lang] || obj.bn || obj.en || '';
}
function findMeta(slug) {
var list = window.G_FORMS || [];
for (var i = 0; i < list.length; i++) {
if (list[i] && list[i].slug === slug) {
return list[i];
}
}
return null;
}
function isUnlocked() {
return unlocked;
}
function saveUnlocked() {
unlocked = true;
}
function isLocked() {
return !!(META && META.access === 'locked' && !isUnlocked());
}
function renderMeta() {
var title = document.getElementById('g-form-title');
var desc = document.getElementById('g-form-desc');
var chips = document.getElementById('g-form-chips');
if (!title || !chips) {
return;
}
title.textContent = pick(META && META.title);
var crumb = document.getElementById('g-crumb-current');
if (crumb) {
crumb.textContent = pick(META && META.title);
}
desc.textContent = pick(META && (META.sub || META.desc));
chips.textContent = '';
if (!META) {
return;
}
var access = META.access === 'locked' || META.access === 'freemium' ? META.access : 'free';
var badge = el('span', 'g-badge g-badge--' + access);
if (access === 'locked') {
var icon = el('span', 'g-badge-icon');
icon.innerHTML = LOCK_SVG;
badge.appendChild(icon);
}
badge.appendChild(el('span', '', G.t('access.' + access)));
chips.appendChild(badge);
var paper = META.paper || 'A4';
if (META.pages > 1) {
paper += ' · ' + G.t('card.pages').replace('{n}', String(META.pages));
}
chips.appendChild(el('span', 'g-badge', paper));
var tags = META.tags && (META.tags[G.getLang()] || META.tags.bn) || [];
for (var t = 0; t < tags.length; t++) {
chips.appendChild(el('span', 'g-badge', tags[t]));
}
if (META.id) {
chips.appendChild(el('span', 'g-badge g-badge--id', META.id));
}
}
function refreshFav() {
var btn = document.getElementById('g-fav-btn');
if (!btn || !G.favs) {
return;
}
var on = G.favs.has(SLUG);
var text = G.t(on ? 'fav.remove' : 'fav.add');
btn.setAttribute('aria-pressed', on ? 'true' : 'false');
btn.setAttribute('aria-label', text);
btn.setAttribute('title', text);
}
function bindFav() {
var btn = document.getElementById('g-fav-btn');
if (!btn) {
return;
}
if (!G.favs || !META) {
btn.hidden = true;
return;
}
btn.addEventListener('click', function () {
if (G.favs.has(SLUG)) {
ask('favRemove', function () {
G.favs.remove(SLUG);
});
} else {
G.favs.add(SLUG);
}
});
document.addEventListener('g:favschange', refreshFav);
refreshFav();
}
function applyPlaceholders() {
var nodes = document.querySelectorAll('[data-i18n-ph]');
for (var i = 0; i < nodes.length; i++) {
nodes[i].setAttribute('placeholder', G.t(nodes[i].getAttribute('data-i18n-ph')));
}
}
function fit() {
var stage = document.getElementById('g-stage');
var wrap = document.getElementById('g-pages-wrap');
var pages = document.getElementById('g-pages');
if (!stage || !wrap || !pages || stage.hidden) {
return;
}
var cs = window.getComputedStyle(stage);
var avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
var w = pages.offsetWidth;
var h = pages.offsetHeight;
if (!w || avail <= 0) {
return;
}
var s = Math.min(1, avail / w);
pages.style.transform = 'scale(' + s + ')';
wrap.style.width = (w * s) + 'px';
wrap.style.height = (h * s) + 'px';
}
function applyLockState() {
var locked = isLocked();
document.getElementById('g-stage').hidden = locked;
document.getElementById('g-lock').hidden = !locked;
var actions = document.querySelectorAll('.g-form-actions');
for (var i = 0; i < actions.length; i++) {
actions[i].hidden = locked;
}
if (!locked) {
fit();
}
refreshMulti();
}
function waLink() {
var v = String((G.config && G.config.social && G.config.social.whatsapp) || '').trim();
var d = v.replace(/\D/g, '');
if (!d || v === '#') {
return '';
}
if (d.charAt(0) === '0') {
d = '88' + d;
}
return 'https://wa.me/' + d;
}
function updateAsk() {
var box = document.getElementById('g-lock-ask');
var link = document.getElementById('g-lock-ask-link');
if (!box || !link) {
return;
}
var base = waLink();
if (!base || !META) {
box.hidden = true;
return;
}
var msg = G.t('lock.msg').replace('{form}', pick(META.title)).replace('{id}', META.id || '');
link.setAttribute('href', base + '?text=' + encodeURIComponent(msg));
box.hidden = false;
}
function needsPrintPass() {
return !!(META && META.access === 'freemium' && !isUnlocked());
}
function openPrintLock(onDone, kind) {
var base = waLink();
var handle = G.modal.open({
title: G.t(kind === 'multi' ? 'lock.multiTitle' : 'lock.printTitle'),
build: function (body, close) {
var form = el('form', 'g-pass');
var row = el('div', 'g-pass-row');
var input = el('input', 'g-pass-input');
input.type = 'password';
input.autocomplete = 'off';
input.placeholder = G.t('lock.placeholder');
var btn = el('button', 'g-btn', G.t('lock.btn'));
btn.type = 'submit';
var error = el('p', 'g-lock-error', G.t('lock.wrong'));
error.setAttribute('role', 'alert');
error.hidden = true;
row.appendChild(input);
row.appendChild(btn);
form.appendChild(row);
form.appendChild(error);
if (base && META) {
var msg = G.t(kind === 'multi' ? 'lock.multiMsg' : 'lock.printMsg').replace('{form}', pick(META.title)).replace('{id}', META.id || '');
var ask = el('div', 'g-pass-ask');
ask.appendChild(el('span', 'g-lock-ask-text', G.t('lock.noPass')));
var link = el('a', 'g-lock-ask-link', G.t('lock.ask'));
link.setAttribute('href', base + '?text=' + encodeURIComponent(msg));
link.target = '_blank';
link.rel = 'noopener';
ask.appendChild(link);
form.appendChild(ask);
}
form.addEventListener('submit', function (e) {
e.preventDefault();
if (window.G.lock && G.lock.verify(SLUG, input.value)) {
if (kind === 'multi') {
multiPassOk = true;
} else {
saveUnlocked();
}
close(true);
onDone();
} else {
error.hidden = false;
input.select();
}
});
body.appendChild(form);
}
});
if (handle && handle.body) {
var field = handle.body.querySelector('.g-pass-input');
if (field) {
field.focus();
}
}
}
function updateEye() {
var eye = document.getElementById('g-lock-eye');
var input = document.getElementById('g-lock-input');
if (!eye || !input) {
return;
}
var shown = input.type === 'text';
var text = G.t(shown ? 'lock.hide' : 'lock.show');
eye.setAttribute('aria-pressed', shown ? 'true' : 'false');
eye.setAttribute('aria-label', text);
eye.setAttribute('title', text);
eye.classList.toggle('g-lock-eye--on', shown);
}
function bindLock() {
var form = document.getElementById('g-lock');
var input = document.getElementById('g-lock-input');
var error = document.getElementById('g-lock-error');
var eye = document.getElementById('g-lock-eye');
eye.addEventListener('click', function () {
input.type = input.type === 'password' ? 'text' : 'password';
updateEye();
input.focus();
});
form.addEventListener('submit', function (e) {
e.preventDefault();
if (window.G.lock && G.lock.verify(SLUG, input.value)) {
saveUnlocked();
input.value = '';
input.type = 'password';
updateEye();
error.hidden = true;
applyLockState();
} else {
error.hidden = false;
input.select();
}
});
updateEye();
updateAsk();
}
function autosize(ta) {
ta.style.height = 'auto';
ta.style.height = ta.scrollHeight + 'px';
}
function bindTextareas() {
var list = document.querySelectorAll('.g-ta');
for (var i = 0; i < list.length; i++) {
list[i].addEventListener('input', function () {
autosize(this);
});
autosize(list[i]);
}
}
function showPhoto(box, url) {
var shown = box.querySelector('img');
if (!shown) {
shown = document.createElement('img');
shown.alt = '';
box.appendChild(shown);
}
shown.src = url;
box.classList.add('g-photo--filled');
refreshFill();
}
function clearPhoto(box) {
var shown = box.querySelector('img');
if (shown) {
box.removeChild(shown);
}
box.classList.remove('g-photo--filled');
var input = box.querySelector('input[type="file"]');
if (input) {
input.value = '';
}
refreshFill();
}
function handlePhoto(input) {
var file = input.files && input.files[0];
if (!file) {
return;
}
G.photoToDataUrl(file, function (url) {
if (!url) {
return;
}
showPhoto(input.closest('.g-photo'), url);
delete input.dataset.autofilled;
refreshMulti();
});
}
function bindPhotos() {
var list = document.querySelectorAll('.g-photo input[type="file"]');
for (var i = 0; i < list.length; i++) {
list[i].addEventListener('change', function () {
handlePhoto(this);
});
}
}
var BN_DIGITS = '০১২৩৪৫৬৭৮৯';
var KINDS = {
date: { re: /[0-9\/.\-]/, max: 10 },
phone: { re: /[0-9+\-\s]/, max: 16 },
num: { re: /[0-9]/, max: 20, mode: 'numeric' },
span: { re: /[0-9\/\-]/, max: 9 },
money: { re: /[0-9,\/\-]/, max: 16 },
mon: { re: /[0-9A-Za-z\s\/.,\-–]/, max: 30, en: true },
age: { re: /[0-9]/, max: 3, mode: 'numeric' }
};
KINDS.phone.mode = 'tel';
function digitsToAscii(text) {
return String(text).replace(/[০-৯]/g, function (d) {
return String(BN_DIGITS.indexOf(d));
});
}
function digitsToBn(text) {
return text.replace(/[0-9]/g, function (d) {
return BN_DIGITS.charAt(Number(d));
});
}
function kindLang(node) {
var force = node.getAttribute('data-digits');
if (force === 'en' || force === 'bn') {
return force;
}
var kind = KINDS[node.getAttribute('data-kind')];
if (kind && kind.en) {
return 'en';
}
var host = node.closest('[lang]');
return host && host.getAttribute('lang') === 'en' ? 'en' : 'bn';
}
function cleanKind(node, value) {
var kind = KINDS[node.getAttribute('data-kind')];
if (!kind) {
return value;
}
var src = digitsToAscii(value);
var out = '';
for (var i = 0; i < src.length; i++) {
if (kind.re.test(src.charAt(i))) {
out += src.charAt(i);
}
}
out = out.slice(0, kind.max);
return kindLang(node) === 'bn' ? digitsToBn(out) : out;
}
function sanitizeKind(node, final) {
var v = cleanKind(node, node.value);
var suffix = node.getAttribute('data-suffix');
if (final) {
v = v.trim();
}
if (final && suffix && v) {
v += suffix;
}
if (v !== node.value) {
node.value = v;
return true;
}
return false;
}
function setCaret(node, pos) {
try {
node.setSelectionRange(pos, pos);
} catch (e) {}
}
function bindKindNode(node) {
var kind = KINDS[node.getAttribute('data-kind')];
if (!kind) {
return;
}
if (kind.mode && !node.getAttribute('inputmode')) {
node.setAttribute('inputmode', kind.mode);
}
node.addEventListener('input', function () {
var raw = node.value;
var pos = null;
try {
pos = node.selectionStart;
} catch (e) {}
var v = cleanKind(node, raw);
if (v !== raw) {
var keep = pos === null ? v.length : Math.min(cleanKind(node, raw.slice(0, pos)).length, v.length);
node.value = v;
setCaret(node, keep);
}
});
node.addEventListener('focus', function () {
if (node.getAttribute('data-suffix')) {
var v = cleanKind(node, node.value);
if (v !== node.value) {
node.value = v;
setCaret(node, v.length);
}
}
});
node.addEventListener('blur', function () {
if (sanitizeKind(node, true)) {
node.dispatchEvent(new Event('g:filled'));
}
});
node.addEventListener('g:filled', function () {
sanitizeKind(node, true);
});
sanitizeKind(node, true);
}
function bindKinds() {
var nodes = document.querySelectorAll('#g-pages [data-kind]');
for (var i = 0; i < nodes.length; i++) {
bindKindNode(nodes[i]);
}
}
var fillOn = false;
function setFillValue(node, value) {
if (node.type === 'file') {
var box = node.closest('.g-photo');
if (value) {
showPhoto(box, value);
} else {
clearPhoto(box);
}
return;
}
node.value = value;
if (node.classList.contains('g-ta')) {
autosize(node);
}
node.dispatchEvent(new Event('g:filled'));
}
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function birthDdMonYyyy(value) {
var raw = String(value || '').trim();
var s = raw.replace(/[০-৯]/g, function (d) {
return '০১২৩৪৫৬৭৮৯'.indexOf(d);
}).replace(/[\s.\-]+/g, '/');
var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
if (!m) {
return raw;
}
var d = Number(m[1]);
var mo = Number(m[2]);
if (d < 1 || d > 31 || mo < 1 || mo > 12) {
return raw;
}
return (d < 10 ? '0' : '') + d + ' ' + MONTHS[mo - 1] + ' ' + m[3];
}
function fillValue(profile, key, node) {
if (key === 'name-first' || key === 'name-last') {
var parts = (profile.name || '').trim().split(/\s+/).filter(Boolean);
if (!parts.length) {
return '';
}
if (key === 'name-last') {
return parts.length > 1 ? parts[parts.length - 1] : '';
}
return parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
}
if (G.profile && G.profile.isChoice(key)) {
return G.profile.label(key, profile[key], node && node.getAttribute('data-fill-lang') === 'en' ? 'en' : 'bn');
}
if (key === 'birth' && node && node.getAttribute('data-fill-format') === 'dd-mon-yyyy') {
return birthDdMonYyyy(profile.birth);
}
return profile[key] || '';
}
function isEmptyField(node) {
if (node.type === 'file') {
return !node.closest('.g-photo').classList.contains('g-photo--filled');
}
return !node.value;
}
function applyFill(force) {
var profile = G.profile ? G.profile.get() : null;
var list = document.querySelectorAll('[data-fill]');
for (var i = 0; i < list.length; i++) {
var node = list[i];
var key = node.getAttribute('data-fill');
var value = profile ? fillValue(profile, key, node) : '';
if (key === 'photo' && value && !/^data:image\//.test(value)) {
value = '';
}
var marked = node.dataset.autofilled === '1';
if (!value) {
if (marked) {
setFillValue(node, '');
delete node.dataset.autofilled;
}
continue;
}
if (force || marked || isEmptyField(node)) {
setFillValue(node, value);
node.dataset.autofilled = '1';
}
}
refreshMulti();
}
function clearFill() {
var list = document.querySelectorAll('[data-fill]');
for (var i = 0; i < list.length; i++) {
if (list[i].dataset.autofilled === '1') {
setFillValue(list[i], '');
delete list[i].dataset.autofilled;
}
}
refreshMulti();
}
function applyDemo(n) {
var demo = G.demo ? G.demo.get(SLUG, n) : null;
if (demo) {
applyData(demo);
demoSig = G.saves ? G.saves.sig(collectData()) : '';
refreshMulti();
}
}
function openFill() {
var hasProfile = !!(G.profile && G.profile.get());
var demos = [1, 2, 3].map(function (n) {
return {
label: G.t('fill.demo' + n),
disabled: !(G.demo && G.demo.has(SLUG, n)),
onPick: function () {
applyDemo(n);
}
};
});
G.modal.choose({
title: G.t('fill.title'),
choices: [
{
label: G.t('fill.mine'),
disabled: !hasProfile,
onPick: function () {
applyFill(true);
fillOn = true;
}
},
{ group: demos }
]
});
}
function bindFill() {
var btn = document.getElementById('g-fill-btn');
var fields = document.querySelectorAll('[data-fill]:not([type="file"])');
for (var i = 0; i < fields.length; i++) {
fields[i].addEventListener('input', function () {
delete this.dataset.autofilled;
});
}
btn.addEventListener('click', openFill);
document.addEventListener('g:profilechange', function () {
if (fillOn) {
applyFill();
}
});
}
var guideFields = [];
var guideCur = -1;
function isBlank(node) {
return !String(node.value || '').trim();
}
function refreshGuide() {
var reach = guideCur;
for (var k = guideFields.length - 1; k > reach; k--) {
if (guideFields[k].dataset.typed === '1' && !isBlank(guideFields[k])) {
reach = k;
break;
}
}
var nextIdx = -1;
if (guideCur >= 0) {
for (var j = guideCur + 1; j < guideFields.length; j++) {
if (isBlank(guideFields[j])) {
nextIdx = j;
break;
}
}
}
for (var i = 0; i < guideFields.length; i++) {
var cl = guideFields[i].classList;
var miss = i < reach && i !== guideCur && isBlank(guideFields[i]);
cl.toggle('g-cur', i === guideCur);
cl.toggle('g-miss', miss);
cl.toggle('g-next', i === nextIdx && !miss);
}
refreshFill();
}
function ringPct(filled, total) {
if (!total) {
return 0;
}
var pct = Math.round(filled * 100 / total);
if (filled > 0 && pct < 1) {
pct = 1;
}
if (filled < total && pct > 99) {
pct = 99;
}
return pct;
}
function paintRing(ring, pct) {
var fg = ring.querySelector('.g-ring-fg');
var n = ring.querySelector('.g-ring-n');
if (fg) {
fg.style.strokeDashoffset = String(100 - pct);
}
if (n) {
n.innerHTML = numLocal(pct) + '<small>%</small>';
}
var label = G.t('fill.pct').replace('{n}', numLocal(pct));
ring.setAttribute('title', label);
ring.setAttribute('aria-label', label);
var was = ring.getAttribute('data-pct');
ring.setAttribute('data-pct', String(pct));
var full = pct === 100;
ring.classList.toggle('g-ring--full', full);
if (full && was !== null && was !== '100') {
ring.classList.remove('g-ring--pop');
void ring.offsetWidth;
ring.classList.add('g-ring--pop');
}
}
function refreshFill() {
var ring = document.getElementById('g-fillring');
if (!ring) {
return;
}
var nodes = document.querySelectorAll('.g-page [name]');
var total = 0;
var filled = 0;
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
if (node.readOnly || node.hasAttribute('data-mirror')) {
continue;
}
total++;
if (node.type === 'file') {
var box = node.closest('.g-photo');
if (box && box.classList.contains('g-photo--filled')) {
filled++;
}
} else if (String(node.value || '').trim()) {
filled++;
}
}
paintRing(ring, ringPct(filled, total));
}
function bindGuide() {
guideFields = Array.prototype.slice.call(document.querySelectorAll('.g-page input:not([type="file"]), .g-page textarea'));
guideFields.forEach(function (node, index) {
node.addEventListener('focus', function () {
guideCur = index;
refreshGuide();
});
node.addEventListener('blur', function () {
guideCur = -1;
refreshGuide();
});
node.addEventListener('input', function () {
this.dataset.typed = '1';
refreshGuide();
});
node.addEventListener('g:filled', refreshGuide);
});
}
function toast(message) {
var node = document.getElementById('g-toast');
if (!node) {
return;
}
node.textContent = message;
node.classList.add('g-toast--show');
window.clearTimeout(toastTimer);
toastTimer = window.setTimeout(function () {
node.classList.remove('g-toast--show');
}, 2800);
}
function collectData() {
var fields = {};
var photos = {};
var nodes = document.querySelectorAll('.g-page [name]');
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
if (node.type === 'file') {
var box = node.closest('.g-photo');
var shown = box && box.querySelector('img');
if (shown && /^data:image\/jpeg;base64,/.test(shown.src)) {
photos[node.name] = shown.src;
}
} else if (node.value) {
fields[node.name] = node.value;
}
}
return { slug: SLUG, fields: fields, photos: photos };
}
function print() {
if (G.sync && G.sync.enabled()) {
var data = collectData();
if (Object.keys(data.fields).length || Object.keys(data.photos).length) {
G.sync.queueHistory(data);
}
}
printSheets();
}
function printSheets() {
var page = previewBox ? previewBox.querySelector('.g-page') : null;
if (!page) {
return;
}
var cs = window.getComputedStyle(page);
var w = Math.round(parseFloat(cs.width) * 25.4 / 96 * 10) / 10;
var h = Math.round(parseFloat(cs.height) * 25.4 / 96 * 10) / 10;
var tag = document.getElementById('g-print-size');
if (!tag) {
tag = document.createElement('style');
tag.id = 'g-print-size';
document.head.appendChild(tag);
}
tag.textContent = '@page { size: ' + w + 'mm ' + h + 'mm; margin: 0; }';
window.print();
}
function ask(name, onYes, note, onCancel) {
G.modal.confirm({ title: G.t('cf.' + name + '.t'), text: G.t('cf.' + name + '.x'), note: note, onYes: onYes, onCancel: onCancel });
}
var SIDE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="7" height="12" rx="1.5"/><rect x="14" y="6" width="7" height="12" rx="1.5"/></svg>';
var STACK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="7" rx="1.5"/><rect x="6" y="14" width="12" height="7" rx="1.5"/></svg>';
var POS_ICONS = {
a: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="1.5"/><rect x="7" y="4" width="7" height="4" rx=".8" fill="currentColor" stroke="none"/></svg>',
b: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="1.5"/><rect x="8.5" y="4" width="7" height="4" rx=".8" fill="currentColor" stroke="none"/></svg>',
c: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="1.5"/><rect x="8.5" y="10" width="7" height="4" rx=".8" fill="currentColor" stroke="none"/></svg>',
d: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="1.5"/><rect x="7" y="4.5" width="4.5" height="3.5" rx=".6" fill="currentColor" stroke="none"/><rect x="12.5" y="4.5" width="4.5" height="3.5" rx=".6" fill="currentColor" stroke="none"/><rect x="7" y="10" width="4.5" height="3.5" rx=".6" fill="currentColor" stroke="none"/><rect x="12.5" y="10" width="4.5" height="3.5" rx=".6" fill="currentColor" stroke="none"/><rect x="7" y="15.5" width="4.5" height="3.5" rx=".6" fill="currentColor" stroke="none"/><rect x="12.5" y="15.5" width="4.5" height="3.5" rx=".6" fill="currentColor" stroke="none"/></svg>'
};
var TILE_GAP_MM = 2;
function mmToPx(mm) {
return mm * 96 / 25.4;
}
function copyFieldValues(from, to) {
var a = from.querySelectorAll('input, textarea');
var b = to.querySelectorAll('input, textarea');
for (var i = 0; i < a.length && i < b.length; i++) {
if (a[i].type !== 'file') {
b[i].value = a[i].value;
}
}
}
function clearTiles(box) {
var tiles = box.querySelectorAll('.g-page-inner > .cards[data-tile]');
for (var i = 0; i < tiles.length; i++) {
tiles[i].parentNode.removeChild(tiles[i]);
}
var inners = box.querySelectorAll('.g-page-inner');
for (var j = 0; j < inners.length; j++) {
inners[j].style.gridTemplateColumns = '';
}
}
function layoutTiles(box) {
var inners = box.querySelectorAll('.g-page-inner');
for (var i = 0; i < inners.length; i++) {
var inner = inners[i];
var first = inner.querySelector(':scope > .cards');
if (!first) {
continue;
}
var cs = window.getComputedStyle(inner);
var availW = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
var availH = inner.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
var unitW = first.offsetWidth;
var unitH = first.offsetHeight;
if (!unitW || !unitH) {
continue;
}
var gap = mmToPx(TILE_GAP_MM);
var cols = Math.max(1, Math.floor((availW + gap + 0.5) / (unitW + gap)));
var rows = Math.max(1, Math.floor((availH + gap + 0.5) / (unitH + gap)));
inner.style.gridTemplateColumns = 'repeat(' + cols + ', max-content)';
for (var n = 1; n < cols * rows; n++) {
var copy = first.cloneNode(true);
copy.setAttribute('data-tile', '1');
copyFieldValues(first, copy);
inner.appendChild(copy);
}
}
}
function applyPreviewFill(box) {
if (box.hasAttribute('data-multi')) {
buildMultiPages(box);
return;
}
clearTiles(box);
if (box.hasAttribute('data-fill')) {
layoutTiles(box);
}
}
function setPreviewPos(box, pos) {
box.setAttribute('data-pos', pos);
var list = box.querySelectorAll('.g-pv-pos');
for (var i = 0; i < list.length; i++) {
var on = list[i].getAttribute('data-pos') === pos;
list[i].setAttribute('aria-pressed', on ? 'true' : 'false');
list[i].classList.toggle('g-btn--ghost', !on);
}
}
function setPreviewFill(box, on) {
if (on) {
box.setAttribute('data-fill', '1');
} else {
box.removeAttribute('data-fill');
}
var btn = box.querySelector('.g-pv-fill');
if (btn) {
btn.setAttribute('aria-pressed', on ? 'true' : 'false');
btn.classList.toggle('g-btn--ghost', !on);
}
applyPreviewFill(box);
}
function detectPreviewMode(box) {
var cards = box.querySelectorAll('.g-page-inner .card');
if (cards.length < 2) {
return 'side';
}
var a = cards[0].getBoundingClientRect();
var b = cards[1].getBoundingClientRect();
return b.top >= a.bottom - 1 ? 'stack' : 'side';
}
function detectPreviewPos(box) {
var inner = box.querySelector('.g-page-inner');
var cards = box.querySelectorAll('.g-page-inner .card');
if (!inner || !cards.length) {
return 'a';
}
var ir = inner.getBoundingClientRect();
var left = Infinity;
var right = -Infinity;
var top = Infinity;
var bottom = -Infinity;
for (var i = 0; i < cards.length; i++) {
var r = cards[i].getBoundingClientRect();
left = Math.min(left, r.left);
right = Math.max(right, r.right);
top = Math.min(top, r.top);
bottom = Math.max(bottom, r.bottom);
}
var tolX = ir.width * 0.01;
var tolY = ir.height * 0.01;
var midX = Math.abs((left - ir.left) - (ir.right - right)) < tolX;
var midY = Math.abs((top - ir.top) - (ir.bottom - bottom)) < tolY;
if (midX && midY) {
return 'c';
}
if (midX) {
return 'b';
}
return 'a';
}
function setPreviewMode(box, mode) {
box.classList.toggle('g-pv--stack', mode === 'stack');
var list = box.querySelectorAll('.g-pv-mode[data-mode]');
for (var i = 0; i < list.length; i++) {
var on = list[i].getAttribute('data-mode') === mode;
list[i].setAttribute('aria-pressed', on ? 'true' : 'false');
list[i].classList.toggle('g-btn--ghost', !on);
}
if (box.hasAttribute('data-fill')) {
applyPreviewFill(box);
}
}
function previewSep() {
var sep = el('span', 'g-pv-sep');
sep.setAttribute('aria-hidden', 'true');
return sep;
}
function buildPreviewTools(box) {
var tools = el('div', 'g-pv-tools');
var modes = [['side', SIDE_SVG], ['stack', STACK_SVG]];
for (var i = 0; i < modes.length; i++) {
var big = el('button', 'g-btn g-pv-mode');
big.type = 'button';
big.setAttribute('data-mode', modes[i][0]);
big.innerHTML = modes[i][1] + '<span></span>';
big.addEventListener('click', function () {
setPreviewMode(box, this.getAttribute('data-mode'));
});
tools.appendChild(big);
}
tools.appendChild(previewSep());
var poses = ['a', 'b', 'c'];
for (var j = 0; j < poses.length; j++) {
var pb = el('button', 'g-btn g-pv-mode g-pv-pos');
pb.type = 'button';
pb.setAttribute('data-pos', poses[j]);
pb.innerHTML = POS_ICONS[poses[j]] + '<span></span>';
pb.addEventListener('click', function () {
setPreviewPos(box, this.getAttribute('data-pos'));
});
tools.appendChild(pb);
}
tools.appendChild(previewSep());
var fill = el('button', 'g-btn g-btn--ghost g-pv-mode g-pv-fill');
fill.type = 'button';
fill.setAttribute('aria-pressed', 'false');
fill.innerHTML = POS_ICONS.d + '<span></span>';
fill.addEventListener('click', function () {
if (box.hasAttribute('data-multi')) {
return;
}
setPreviewFill(box, !box.hasAttribute('data-fill'));
});
tools.appendChild(fill);
setPreviewMode(box, 'side');
return tools;
}
function previewFit() {
if (!previewBox) {
return;
}
var stage = previewBox.querySelector('.g-pv-stage');
var wrap = previewBox.querySelector('.g-pages-wrap');
var pages = previewBox.querySelector('.g-pages');
var cs = window.getComputedStyle(stage);
var avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
var w = pages.offsetWidth;
var h = pages.offsetHeight;
if (!w || avail <= 0) {
return;
}
var s = Math.min(1, avail / w);
pages.style.transform = 'scale(' + s + ')';
wrap.style.width = (w * s) + 'px';
wrap.style.height = (h * s) + 'px';
}
function previewLabels() {
if (!previewBox) {
return;
}
previewBox.setAttribute('aria-label', G.t('pv.title'));
previewBox.querySelector('.g-pv-back').textContent = G.t('pv.back');
previewBox.querySelector('.g-pv-print').textContent = G.t('pv.print');
var modes = previewBox.querySelectorAll('.g-pv-mode');
for (var i = 0; i < modes.length; i++) {
var key = modes[i].getAttribute('data-pos') ? 'pv.p' + modes[i].getAttribute('data-pos') : (modes[i].getAttribute('data-mode') ? (modes[i].getAttribute('data-mode') === 'stack' ? 'pv.stack' : 'pv.side') : 'pv.pd');
var txt = G.t(key);
modes[i].querySelector('span').textContent = txt;
modes[i].setAttribute('aria-label', txt);
modes[i].setAttribute('title', txt);
}
}
function fillPreview(root, demo) {
var source = document.querySelectorAll('#g-pages [name]');
var copy = root.querySelectorAll('[name]');
var fields = demo && demo.fields && typeof demo.fields === 'object' ? demo.fields : {};
var photos = demo && demo.photos && typeof demo.photos === 'object' ? demo.photos : {};
for (var i = 0; i < copy.length; i++) {
var node = copy[i];
if (node.type === 'file') {
if (demo) {
var url = photos[node.name];
var box = node.closest('.g-photo');
if (typeof url === 'string' && /^data:image\/jpeg;base64,/.test(url)) {
showPhoto(box, url);
} else {
clearPhoto(box);
}
}
continue;
}
if (demo) {
node.value = typeof fields[node.name] === 'string' ? fields[node.name] : '';
if (node.getAttribute('data-kind')) {
sanitizeKind(node, true);
}
} else if (source[i]) {
node.value = source[i].value;
}
node.dispatchEvent(new Event('g:filled'));
if (node.classList.contains('g-ta')) {
autosize(node);
}
}
}
function cleanPreview(root) {
var all = root.querySelectorAll('*');
for (var i = 0; i < all.length; i++) {
var node = all[i];
node.removeAttribute('id');
node.removeAttribute('name');
node.removeAttribute('data-fill');
node.classList.remove('g-cur', 'g-next', 'g-miss');
if (node.tagName === 'INPUT' && node.type === 'file') {
node.parentNode.removeChild(node);
} else if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
node.readOnly = true;
node.tabIndex = -1;
}
}
}
function closePreview() {
if (!previewBox) {
return;
}
previewBox.parentNode.removeChild(previewBox);
previewBox = null;
document.documentElement.classList.remove('g-pv-open');
}
function openPreview(mode, n) {
if (previewBox) {
return;
}
var demo = !!mode;
previewDemo = demo;
var box = el('div', 'g-pv');
box.setAttribute('role', 'dialog');
box.setAttribute('aria-modal', 'true');
box.tabIndex = -1;
var stage = el('div', 'g-pv-stage');
var wrap = el('div', 'g-pages-wrap');
var pages = el('div', 'g-pages');
pages.setAttribute('inert', '');
var sheets = document.querySelectorAll('#g-pages > .g-page');
for (var i = 0; i < sheets.length; i++) {
pages.appendChild(sheets[i].cloneNode(true));
}
wrap.appendChild(pages);
stage.appendChild(wrap);
var actions = el('div', 'g-pv-actions');
var back = el('button', 'g-btn g-btn--ghost g-pv-back');
back.type = 'button';
var go = el('button', 'g-btn g-pv-print');
go.type = 'button';
actions.appendChild(back);
actions.appendChild(go);
if (pages.querySelectorAll('.cards .card').length > 1) {
box.appendChild(buildPreviewTools(box));
}
box.appendChild(stage);
box.appendChild(actions);
previewBox = box;
previewLabels();
document.body.appendChild(box);
document.documentElement.classList.add('g-pv-open');
var people = demo ? null : multiPeople();
fillPreview(pages, mode === 'blank' ? {} : (demo ? (G.demo && G.demo.get(SLUG, n)) || {} : null));
var tpl = null;
var liveUnit = pages.querySelector('.cards');
if (people && liveUnit) {
tpl = liveUnit.cloneNode(true);
copyFieldValues(liveUnit, tpl);
}
cleanPreview(pages);
previewFit();
if (box.querySelector('.g-pv-pos')) {
setPreviewMode(box, detectPreviewMode(box));
setPreviewPos(box, detectPreviewPos(box));
if (tpl) {
startMulti(box, tpl, people);
}
}
history.pushState({ gpv: 1 }, '');
back.addEventListener('click', function () {
if (history.state && history.state.gpv) {
history.back();
} else {
closePreview();
}
});
go.addEventListener('click', function () {
if (previewDemo) {
printSheets();
} else {
print();
}
});
box.focus();
}
function bindPrint() {
document.getElementById('g-demo-btn').addEventListener('click', function () {
var demos = [1, 2, 3].map(function (n) {
return {
label: G.t('fill.demo' + n),
disabled: !(G.demo && G.demo.has(SLUG, n)),
onPick: function () {
openPreview('demo', n);
}
};
});
G.modal.choose({
title: G.t('cf.printDemo.t'),
choices: [
{
label: G.t('cf.printDemo.alt'),
onPick: function () {
if (needsPrintPass()) {
openPrintLock(function () {
openPreview('blank');
});
return;
}
openPreview('blank');
}
},
{ group: demos }
]
});
});
var list = document.querySelectorAll('.g-print-btn');
for (var i = 0; i < list.length; i++) {
list[i].addEventListener('click', function () {
if (needsPrintPass()) {
openPrintLock(function () {
ask('print', function () {
openPreview(false);
});
});
return;
}
ask('print', function () {
openPreview(false);
});
});
}
}
var activeSave = null;
function applyData(data, mode) {
demoSig = '';
activeSave = null;
var fields = data && data.fields && typeof data.fields === 'object' ? data.fields : {};
var photos = data && data.photos && typeof data.photos === 'object' ? data.photos : {};
var nodes = document.querySelectorAll('.g-page [name]');
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
delete node.dataset.autofilled;
if (node.type === 'file') {
var url = photos[node.name];
if (typeof url === 'string' && /^data:image\/jpeg;base64,/.test(url)) {
showPhoto(node.closest('.g-photo'), url);
} else {
clearPhoto(node.closest('.g-photo'));
}
} else {
node.value = typeof fields[node.name] === 'string' ? fields[node.name] : '';
if (node.classList.contains('g-ta')) {
autosize(node);
}
node.dispatchEvent(new Event('g:filled'));
}
}
fillOn = false;
for (var g = 0; g < guideFields.length; g++) {
delete guideFields[g].dataset.typed;
}
refreshGuide();
refreshFill();
fit();
if (mode === 'save') {
applyMultiData(data && data.multi);
} else if (mode === 'clear') {
resetMulti();
}
refreshMulti();
}
function clearAll() {
applyData(null, 'clear');
toast(G.t('saves.cleared'));
}
function saveName(data) {
var src = Object.keys(data.fields).length || !(data.multi && data.multi.length) ? data.fields : data.multi[0].fields;
var keys = Object.keys(src);
var nameKey = keys.filter(function (k) {
return !/date/.test(k);
})[0] || keys[0];
return nameKey ? String(src[nameKey]).trim().slice(0, 30) : '';
}
function collectSaveData() {
var data = collectData();
var people = multiPeople();
if (people) {
data.multi = people.map(function (p) {
var photos = {};
Object.keys(p.photos).forEach(function (k) {
if (/^data:image\/jpeg;base64,/.test(p.photos[k])) {
photos[k] = p.photos[k];
}
});
return { fields: p.fields, photos: photos };
});
}
return data;
}
function hasSaveData(data) {
return !!(Object.keys(data.fields).length || Object.keys(data.photos).length || (data.multi && data.multi.length));
}
function saveToast(item, key) {
if (item.noPhoto) {
return G.t('saves.noPhoto');
}
if (item.big) {
return G.t('saves.big');
}
return G.t(key).replace('{n}', numLocal(G.saves.persons(item)));
}
function updateSave(old) {
var data = collectSaveData();
if (!hasSaveData(data)) {
toast(G.t('saves.empty'));
return;
}
var item = G.saves ? G.saves.update(SLUG, old.id, data, saveName(data)) : null;
if (!item) {
toast(G.t('saves.fail'));
return;
}
activeSave = item.id;
toast(saveToast(item, 'saves.updated'));
refreshSavesBtn();
G.saves.sync(SLUG);
}
function askSave() {
var old = null;
if (activeSave && G.saves) {
var list = G.saves.list(SLUG);
for (var i = 0; i < list.length; i++) {
if (list[i].id === activeSave) {
old = list[i];
}
}
}
var data = collectSaveData();
var filled = hasSaveData(data);
if (old && filled && G.saves.sig(data) !== G.saves.sig(old)) {
G.modal.confirm({
title: G.t('cf.saveMode.t'),
text: G.t('cf.saveMode.x'),
note: (old.name || G.t('saves.unnamed')) + ' · ' + formatTime(old.t),
yesLabel: G.t('cf.saveMode.new'),
altLabel: G.t('cf.saveMode.upd'),
onYes: saveCurrent,
onAlt: function () {
updateSave(old);
}
});
return;
}
ask(data.multi ? 'saveMulti' : 'save', saveCurrent);
}
function saveCurrent() {
var data = collectSaveData();
if (!hasSaveData(data)) {
toast(G.t('saves.empty'));
return;
}
if (G.saves && ((demoSig && G.saves.sig(data) === demoSig) || G.saves.has(SLUG, data))) {
toast(G.t('saves.saved'));
return;
}
var item = G.saves ? G.saves.add(SLUG, data, saveName(data)) : null;
if (!item) {
toast(G.t('saves.fail'));
return;
}
activeSave = item.id;
toast(saveToast(item, item.multi ? 'saves.multiSaved' : 'saves.saved'));
refreshSavesBtn();
G.saves.sync(SLUG);
}
function refreshSavesBtn() {
var btn = document.getElementById('g-saves-btn');
if (btn) {
btn.hidden = !(G.saves && G.saves.count(SLUG));
}
}
function formatTime(t) {
var d = new Date(t);
function p(n) {
return n < 10 ? '0' + n : String(n);
}
var s = p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
if (G.getLang() !== 'bn') {
return s;
}
return s.replace(/\d/g, function (c) {
return '০১২৩৪৫৬৭৮৯'.charAt(Number(c));
});
}
var STACKS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="13" height="13" rx="2"/><path d="M8 4h11a2 2 0 0 1 2 2v11"/></svg>';
function multiTag(item) {
var tag = el('span', 'g-save-tag');
tag.innerHTML = STACKS_SVG;
tag.appendChild(el('span', '', G.t('saves.multiTag') + ' · ' + G.t('saves.people').replace('{n}', numLocal(G.saves.persons(item)))));
return tag;
}
function openSaves() {
var list = G.saves ? G.saves.list(SLUG) : [];
if (!list.length) {
return;
}
G.modal.open({
title: G.t('act.saves'),
list: true,
build: function (body, close) {
list.forEach(function (item) {
var label = item.name || G.t('saves.unnamed');
var row = el('div', 'g-save-row');
var b = el('button', 'g-save-item');
b.type = 'button';
if (item.multi && item.multi.length) {
b.className = 'g-save-item g-save-item--multi';
b.appendChild(multiTag(item));
}
b.appendChild(el('span', 'g-save-name', label));
b.appendChild(el('span', 'g-save-time', formatTime(item.t)));
b.addEventListener('click', function () {
close();
ask(multiPeople() ? 'applyAll' : 'apply', function () {
applyData(item, 'save');
activeSave = item.id;
toast(G.t('saves.applied'));
}, label + ' · ' + formatTime(item.t));
});
var del = el('button', 'g-save-del');
del.type = 'button';
del.setAttribute('aria-label', G.t('saves.del'));
del.setAttribute('title', G.t('saves.del'));
del.innerHTML = X_SVG;
del.addEventListener('click', function () {
close();
ask('delSave', function () {
G.saves.remove(SLUG, item.id);
toast(G.t('saves.deleted'));
refreshSavesBtn();
if (G.saves.count(SLUG)) {
openSaves();
}
}, label + ' · ' + formatTime(item.t), openSaves);
});
row.appendChild(b);
row.appendChild(del);
body.appendChild(row);
});
}
});
}
function applyLinkedSave() {
var id = '';
try {
id = new URLSearchParams(window.location.search).get('save') || '';
} catch (e) {}
if (!id) {
return;
}
try {
window.history.replaceState(null, '', window.location.pathname + window.location.hash);
} catch (e) {}
var item = null;
var list = G.saves && /^[a-z0-9]{6,40}$/.test(id) ? G.saves.list(SLUG) : [];
for (var i = 0; i < list.length; i++) {
if (list[i].id === id) {
item = list[i];
}
}
if (!item) {
toast(G.t('svp.missing'));
return;
}
applyData(item, 'save');
activeSave = item.id;
toast(G.t('saves.applied'));
}
function askClear() {
ask(multiPeople() ? 'clearAll' : 'clear', clearAll);
}
function bindTools() {
document.getElementById('g-clear-btn').addEventListener('click', askClear);
document.getElementById('g-save-btn').addEventListener('click', askSave);
document.getElementById('g-saves-btn').addEventListener('click', openSaves);
document.addEventListener('g:saveschange', function (e) {
if (!e.detail || e.detail.slug === SLUG) {
refreshSavesBtn();
}
});
refreshSavesBtn();
window.setTimeout(function () {
if (G.saves) {
G.saves.sync(SLUG);
}
}, 1500);
}
var MULTI_MAX = 30;
var multiOn = false;
var multiOpen = false;
var multiPassOk = false;
var multiSpec = null;
var multiChip = null;
var multiChipTarget = null;
var multiPulse = 0;
var multiLimitShown = false;
var ARROW_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6"/></svg>';
function numLocal(n) {
var s = String(n);
return G.getLang() === 'bn' ? digitsToBn(s) : s;
}
function mainHasData() {
var nodes = document.querySelectorAll('.g-page [name]');
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
if (node.type === 'file') {
var box = node.closest('.g-photo');
if (box && box.classList.contains('g-photo--filled')) {
return true;
}
} else if (String(node.value || '').trim()) {
return true;
}
}
return false;
}
function multiEligible() {
if (!mainHasData()) {
return false;
}
if (demoSig && G.saves && G.saves.sig(collectData()) === demoSig) {
return false;
}
return true;
}
function labelOf(node) {
var ln = node.closest('.ln');
var lab = ln ? ln.querySelector('b, span:not(.hint):not(.sl)') : null;
return lab ? lab.textContent.replace(/[:：]\s*$/, '').trim() : '';
}
function buildMultiSpec() {
var nodes = document.querySelectorAll('#g-pages .g-page [name]');
var spec = [];
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
if (node.readOnly || node.hasAttribute('data-mirror')) {
continue;
}
var item = { name: node.name };
if (node.type === 'file') {
var box = node.closest('.g-photo');
var hint = box ? box.querySelector('.g-photo-hint') : null;
item.file = true;
item.label = hint ? hint.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
} else {
var host = node.closest('[lang]');
item.area = node.tagName === 'TEXTAREA';
item.qr = !!node.closest('[data-qr]');
item.type = node.getAttribute('type') || 'text';
item.ph = item.qr ? '' : (node.getAttribute('placeholder') || labelOf(node) || node.name);
item.kind = node.getAttribute('data-kind') || '';
item.digits = node.getAttribute('data-digits') || '';
item.suffix = node.getAttribute('data-suffix') || '';
item.max = node.getAttribute('maxlength') || '';
item.mode = node.getAttribute('inputmode') || '';
item.lang = host ? host.getAttribute('lang') : '';
}
spec.push(item);
}
return spec;
}
function photoText(label) {
return label && label.length <= 9 ? label : G.t('multi.photo');
}
function setRowPhoto(box, url) {
var img = box.querySelector('img');
if (!img) {
img = document.createElement('img');
img.alt = '';
box.appendChild(img);
}
img.src = url;
box.classList.add('g-mph--filled');
}
function rowPhoto(input) {
var file = input.files && input.files[0];
if (!file) {
return;
}
var row = input.closest('.g-mrow');
G.photoToDataUrl(file, function (url) {
if (!url) {
return;
}
setRowPhoto(input.closest('.g-mph'), url);
onRowChange(row);
});
}
function mainPhotoSrc(name) {
var nodes = document.querySelectorAll('#g-pages .g-page input[type="file"]');
for (var i = 0; i < nodes.length; i++) {
if (nodes[i].name === name) {
var shown = nodes[i].closest('.g-photo').querySelector('img');
return shown ? shown.src : '';
}
}
return '';
}
function mainValue(name) {
var nodes = document.querySelectorAll('#g-pages .g-page [name]');
for (var i = 0; i < nodes.length; i++) {
if (nodes[i].name === name && nodes[i].type !== 'file') {
return String(nodes[i].value || '').replace(/[\r\n]+/g, ' ').trim();
}
}
return '';
}
function multiFix(name, value, final) {
var hook = G.form && G.form.multi && G.form.multi.fix;
return hook ? hook(name, value, final) : value;
}
function hideChip() {
if (multiChip) {
multiChip.hidden = true;
}
multiChipTarget = null;
}
function placeChip(input) {
var chip = multiChip;
var r = input.getBoundingClientRect();
if (r.bottom < 0 || r.top > window.innerHeight) {
hideChip();
return;
}
var vv = window.visualViewport;
var vh = vv ? vv.height : window.innerHeight;
var h = chip.offsetHeight || 32;
var top = r.bottom + 4;
if (top + h > vh - 4) {
top = Math.max(4, r.top - h - 4);
}
var left = Math.max(6, Math.min(r.left, window.innerWidth - (chip.offsetWidth || 160) - 6));
chip.style.top = top + 'px';
chip.style.left = left + 'px';
}
function moveChip() {
if (!multiChip || multiChip.hidden || !multiChipTarget) {
return;
}
if (!document.body.contains(multiChipTarget)) {
hideChip();
return;
}
placeChip(multiChipTarget);
}
function fillRowInput(input) {
var v = mainValue(input.getAttribute('data-n'));
if (!v) {
return;
}
input.value = v;
input.dispatchEvent(new Event('g:filled'));
var fixed = multiFix(input.getAttribute('data-n'), input.value, true);
if (fixed !== input.value) {
input.value = fixed;
}
input.dispatchEvent(new Event('input', { bubbles: true }));
}
function ensureChip() {
if (multiChip) {
return multiChip;
}
multiChip = el('button', 'g-mchip');
multiChip.type = 'button';
multiChip.hidden = true;
multiChip.addEventListener('mousedown', function (e) {
e.preventDefault();
});
multiChip.addEventListener('click', function () {
var target = multiChipTarget;
hideChip();
if (target) {
fillRowInput(target);
}
});
document.body.appendChild(multiChip);
return multiChip;
}
function showChip(input) {
var v = mainValue(input.getAttribute('data-n'));
if (!v || v === input.value.trim()) {
hideChip();
return;
}
var chip = ensureChip();
chip.textContent = '↑ ' + G.t('multi.fillMain');
chip.setAttribute('title', v);
chip.hidden = false;
multiChipTarget = input;
placeChip(input);
}
function readRow(row) {
var fields = {};
var photos = {};
var has = false;
var ins = row.querySelectorAll('.g-mi');
for (var i = 0; i < ins.length; i++) {
var v = ins[i].value.trim();
if (v) {
fields[ins[i].getAttribute('data-n')] = v;
has = true;
}
}
var imgs = row.querySelectorAll('.g-mph img');
for (var j = 0; j < imgs.length; j++) {
photos[imgs[j].closest('.g-mph').getAttribute('data-n')] = imgs[j].src;
has = true;
}
return { fields: fields, photos: photos, has: has };
}
function refreshRowRing(row) {
var ring = row.querySelector('.g-mrow-ring');
if (!ring) {
return;
}
var ins = row.querySelectorAll('.g-mi');
var boxes = row.querySelectorAll('.g-mph');
var filled = 0;
for (var i = 0; i < ins.length; i++) {
if (ins[i].value.trim()) {
filled++;
}
}
for (var j = 0; j < boxes.length; j++) {
if (boxes[j].querySelector('img')) {
filled++;
}
}
paintRing(ring, ringPct(filled, ins.length + boxes.length));
}
function rowHasData(row) {
return readRow(row).has;
}
function onRowChange() {
ensureRows();
refreshMulti();
}
function renumber() {
var box = document.getElementById('g-multi-rows');
if (!box) {
return;
}
var rows = box.children;
for (var i = 0; i < rows.length; i++) {
var no = rows[i].querySelector('.g-mrow-no');
if (no) {
no.textContent = numLocal(i + 2);
no.setAttribute('title', G.t('multi.person') + ' ' + numLocal(i + 2));
}
var del = rows[i].querySelector('.g-mrow-del');
if (del) {
var text = G.t('multi.remove');
del.setAttribute('aria-label', text);
del.setAttribute('title', text);
del.hidden = i === rows.length - 1 && !rowHasData(rows[i]);
}
}
}
function removeRow(row) {
if (row.parentNode) {
row.parentNode.removeChild(row);
}
hideChip();
ensureRows();
refreshMulti();
}
function makeRow() {
if (!multiSpec) {
multiSpec = buildMultiSpec();
}
var row = el('div', 'g-mrow');
row.appendChild(el('span', 'g-mrow-no'));
var rowRing = el('span', 'g-ring g-ring--s g-mrow-ring');
rowRing.setAttribute('role', 'img');
rowRing.innerHTML = RING_SVG + '<span class="g-ring-n"></span>';
row.appendChild(rowRing);
paintRing(rowRing, 0);
var cells = el('div', 'g-mrow-cells');
multiSpec.forEach(function (s) {
var cell = el('div', 'g-mcell');
if (s.file) {
cell.className = 'g-mcell g-mcell--p';
var lab = el('label', 'g-mph');
lab.setAttribute('data-n', s.name);
lab.setAttribute('title', s.label || G.t('multi.photo'));
var file = el('input');
file.type = 'file';
file.accept = 'image/*';
file.addEventListener('change', function () {
rowPhoto(this);
});
var hint = el('span', '', photoText(s.label));
hint.setAttribute('data-lbl', s.label || '');
lab.appendChild(file);
lab.appendChild(hint);
var up = el('button', 'g-mph-main');
up.type = 'button';
up.hidden = true;
up.setAttribute('data-n', s.name);
up.setAttribute('title', G.t('multi.mainPhoto'));
up.setAttribute('aria-label', G.t('multi.mainPhoto'));
up.innerHTML = ARROW_SVG;
up.addEventListener('click', function () {
var src = mainPhotoSrc(this.getAttribute('data-n'));
if (src) {
setRowPhoto(this.parentNode.querySelector('.g-mph'), src);
onRowChange(row);
}
});
cell.appendChild(lab);
cell.appendChild(up);
} else {
if (s.area || s.kind === 'num' || s.kind === 'age' || s.kind === 'span' || (s.max && Number(s.max) <= 4)) {
cell.className = s.area ? 'g-mcell g-mcell--w' : 'g-mcell g-mcell--s';
}
var inp = el('input', 'g-mi');
inp.type = s.type === 'tel' || s.type === 'email' ? s.type : 'text';
inp.autocomplete = 'off';
inp.setAttribute('data-n', s.name);
var ph = s.qr ? G.t('multi.qr') : s.ph;
inp.setAttribute('placeholder', ph);
inp.setAttribute('title', ph);
inp.setAttribute('aria-label', ph);
if (s.kind) {
inp.setAttribute('data-kind', s.kind);
}
if (s.digits) {
inp.setAttribute('data-digits', s.digits);
}
if (s.suffix) {
inp.setAttribute('data-suffix', s.suffix);
}
if (s.max) {
inp.setAttribute('maxlength', s.max);
}
if (s.mode) {
inp.setAttribute('inputmode', s.mode);
}
if (s.lang) {
inp.setAttribute('lang', s.lang);
}
if (s.qr) {
inp.setAttribute('data-q', '1');
}
bindKindNode(inp);
inp.addEventListener('input', function () {
var fixed = multiFix(this.getAttribute('data-n'), this.value, false);
if (fixed !== this.value) {
this.value = fixed;
}
onRowChange(row);
if (document.activeElement === this) {
showChip(this);
}
});
inp.addEventListener('focus', function () {
showChip(this);
});
inp.addEventListener('blur', function () {
var self = this;
var fixed = multiFix(self.getAttribute('data-n'), self.value, true);
if (fixed !== self.value) {
self.value = fixed;
}
window.setTimeout(function () {
if (multiChipTarget === self && document.activeElement !== self) {
hideChip();
}
}, 180);
});
cell.appendChild(inp);
}
cells.appendChild(cell);
});
row.appendChild(cells);
var del = el('button', 'g-mrow-del');
del.type = 'button';
del.innerHTML = X_SVG;
del.addEventListener('click', function () {
if (rowHasData(row)) {
ask('multiDel', function () {
removeRow(row);
});
} else {
removeRow(row);
}
});
row.appendChild(del);
return row;
}
function ensureRows() {
var box = document.getElementById('g-multi-rows');
if (!box) {
return;
}
var rows = box.children;
while (rows.length > 1 && !rowHasData(rows[rows.length - 1]) && !rowHasData(rows[rows.length - 2]) && !rows[rows.length - 1].contains(document.activeElement)) {
box.removeChild(rows[rows.length - 1]);
}
var last = rows[rows.length - 1];
if (!last || rowHasData(last)) {
if (rows.length < MULTI_MAX - 1) {
box.appendChild(makeRow());
multiLimitShown = false;
} else if (!multiLimitShown) {
multiLimitShown = true;
toast(G.t('multi.limit').replace('{n}', numLocal(MULTI_MAX)));
}
}
renumber();
}
function refreshMultiPanel() {
var box = document.getElementById('g-multi-rows');
var panel = document.getElementById('g-multi');
if (!box || !panel) {
return;
}
var rows = box.children;
var n = mainHasData() ? 1 : 0;
for (var i = 0; i < rows.length; i++) {
refreshRowRing(rows[i]);
if (rowHasData(rows[i])) {
n++;
}
}
var count = document.getElementById('g-multi-count');
if (count) {
count.textContent = G.t('multi.count').replace('{n}', numLocal(n));
}
var ups = panel.querySelectorAll('.g-mph-main');
for (var j = 0; j < ups.length; j++) {
var src = mainPhotoSrc(ups[j].getAttribute('data-n'));
var shown = ups[j].parentNode.querySelector('.g-mph img');
ups[j].hidden = !src || !!(shown && shown.src === src);
}
var tail = document.getElementById('g-multi-tail');
if (tail) {
tail.hidden = !(box.offsetHeight > window.innerHeight * 0.8);
}
}
function refreshMulti() {
if (!multiOn) {
return;
}
var act = document.getElementById('g-multi-act');
var btn = document.getElementById('g-multi-btn');
if (!act || !btn) {
return;
}
var show = !isLocked() && (multiOpen || multiEligible());
act.classList.toggle('g-multi-off', !show);
btn.textContent = G.t(multiOpen ? 'multi.btnClose' : 'multi.btn');
btn.setAttribute('aria-expanded', multiOpen ? 'true' : 'false');
btn.classList.toggle('g-btn--ghost', multiOpen);
if (multiOpen) {
refreshMultiPanel();
}
}
function labelMulti() {
if (!multiOn) {
return;
}
var panel = document.getElementById('g-multi');
var title = document.getElementById('g-multi-title');
var note = document.getElementById('g-multi-note');
if (title) {
title.textContent = G.t('multi.title');
}
if (note) {
note.textContent = G.t('multi.note').replace('{n}', numLocal(MULTI_MAX));
}
var goes = document.querySelectorAll('#g-multi-tail [data-go]');
var keys = ['act.clear', 'act.save', 'form.print'];
for (var i = 0; i < goes.length; i++) {
goes[i].textContent = G.t(keys[i]);
}
var spans = panel ? panel.querySelectorAll('.g-mph span') : [];
for (var j = 0; j < spans.length; j++) {
spans[j].textContent = photoText(spans[j].getAttribute('data-lbl'));
}
var qrs = panel ? panel.querySelectorAll('.g-mi[data-q]') : [];
for (var k = 0; k < qrs.length; k++) {
qrs[k].setAttribute('placeholder', G.t('multi.qr'));
qrs[k].setAttribute('title', G.t('multi.qr'));
}
renumber();
refreshMulti();
}
function openMulti() {
var panel = document.getElementById('g-multi');
multiOpen = true;
panel.hidden = false;
labelMulti();
ensureRows();
refreshMulti();
var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
panel.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
}
function resetMulti() {
if (multiOn && multiOpen) {
doCloseMulti();
}
}
function fillRowData(row, person) {
var ins = row.querySelectorAll('.g-mi');
for (var i = 0; i < ins.length; i++) {
ins[i].value = person.fields[ins[i].getAttribute('data-n')] || '';
ins[i].dispatchEvent(new Event('g:filled'));
}
var boxes = row.querySelectorAll('.g-mph');
for (var j = 0; j < boxes.length; j++) {
var url = person.photos[boxes[j].getAttribute('data-n')];
if (url) {
setRowPhoto(boxes[j], url);
}
}
}
function applyMultiData(list) {
if (!multiOn) {
return;
}
resetMulti();
if (!Array.isArray(list) || !list.length) {
return;
}
var box = document.getElementById('g-multi-rows');
multiOpen = true;
document.getElementById('g-multi').hidden = false;
labelMulti();
list.slice(0, MULTI_MAX - 1).forEach(function (person) {
var row = makeRow();
fillRowData(row, person);
box.appendChild(row);
});
ensureRows();
refreshMulti();
}
function doCloseMulti() {
var box = document.getElementById('g-multi-rows');
box.textContent = '';
multiOpen = false;
multiLimitShown = false;
document.getElementById('g-multi').hidden = true;
hideChip();
refreshMulti();
}
function closeMulti() {
var rows = document.getElementById('g-multi-rows').children;
for (var i = 0; i < rows.length; i++) {
if (rowHasData(rows[i])) {
ask('multiClose', doCloseMulti);
return;
}
}
doCloseMulti();
}
function jumpTo(go) {
var target = go === 'clear' ? document.getElementById('g-clear-btn') : (go === 'save' ? document.getElementById('g-save-btn') : document.querySelector('.g-print-btn'));
if (!target) {
return;
}
var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var olds = document.querySelectorAll('.g-pulse');
for (var i = 0; i < olds.length; i++) {
olds[i].classList.remove('g-pulse');
}
target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
target.classList.add('g-pulse');
window.clearTimeout(multiPulse);
multiPulse = window.setTimeout(function () {
target.classList.remove('g-pulse');
}, 1600);
}
function bindMulti() {
var act = document.getElementById('g-multi-act');
var panel = document.getElementById('g-multi');
if (!META || !META.multi) {
if (act && act.parentNode) {
act.parentNode.removeChild(act);
}
if (panel && panel.parentNode) {
panel.parentNode.removeChild(panel);
}
return;
}
multiOn = true;
document.getElementById('g-multi-btn').addEventListener('click', function () {
if (multiOpen) {
closeMulti();
} else if (multiPassOk) {
openMulti();
} else {
openPrintLock(openMulti, 'multi');
}
});
document.getElementById('g-multi-tail').addEventListener('click', function (e) {
var b = e.target && e.target.closest ? e.target.closest('[data-go]') : null;
if (b) {
jumpTo(b.getAttribute('data-go'));
}
});
var pages = document.getElementById('g-pages');
pages.addEventListener('input', refreshMulti);
pages.addEventListener('change', refreshMulti);
window.addEventListener('resize', function () {
if (multiOpen) {
refreshMultiPanel();
}
moveChip();
});
window.addEventListener('scroll', moveChip, true);
labelMulti();
}
function multiPeople() {
if (!multiOn || !multiOpen) {
return null;
}
var rows = document.getElementById('g-multi-rows').children;
var list = [];
for (var i = 0; i < rows.length; i++) {
var p = readRow(rows[i]);
if (p.has) {
list.push(p);
}
}
return list.length ? list : null;
}
function renderUnitQr(box) {
var input = box.querySelector('.g-qr-in');
var view = box.querySelector('.g-qr-view');
if (!input || !view) {
return;
}
var text = input.value.replace(/[\r\n]+/g, ' ').trim();
var markup = text && G.qr && G.qr.svg ? G.qr.svg(text) : '';
if (markup) {
view.innerHTML = markup;
view.hidden = false;
input.hidden = true;
box.classList.add('g-qr--on');
} else {
view.innerHTML = '';
view.hidden = true;
input.hidden = false;
box.classList.remove('g-qr--on');
}
}
function fillUnit(unit, person) {
var nodes = unit.querySelectorAll('[name]');
for (var i = 0; i < nodes.length; i++) {
var node = nodes[i];
if (node.type === 'file') {
var box = node.closest('.g-photo');
var url = person.photos[node.name];
if (url) {
showPhoto(box, url);
} else {
clearPhoto(box);
}
} else {
node.value = person.fields[node.name] || '';
}
}
if (G.form && G.form.multi && G.form.multi.derive) {
G.form.multi.derive(unit);
}
var qrs = unit.querySelectorAll('[data-qr]');
for (var j = 0; j < qrs.length; j++) {
renderUnitQr(qrs[j]);
}
}
function buildMultiPages(box) {
var units = box._units || [];
var pages = box.querySelector('.g-pages');
var sheets = pages.querySelectorAll(':scope > .g-page');
var first = sheets[0];
for (var s = 1; s < sheets.length; s++) {
pages.removeChild(sheets[s]);
}
var inner = first.querySelector('.g-page-inner');
var old = inner.querySelectorAll(':scope > .cards');
for (var o = 0; o < old.length; o++) {
inner.removeChild(old[o]);
}
inner.style.gridTemplateColumns = '';
if (!units.length) {
return;
}
inner.appendChild(units[0]);
var cs = window.getComputedStyle(inner);
var availW = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
var availH = inner.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
var unitW = units[0].offsetWidth;
var unitH = units[0].offsetHeight;
var gap = mmToPx(TILE_GAP_MM);
var cols = 1;
var rows = 1;
if (unitW && unitH) {
cols = Math.max(1, Math.floor((availW + gap + 0.5) / (unitW + gap)));
rows = Math.max(1, Math.floor((availH + gap + 0.5) / (unitH + gap)));
}
var per = cols * rows;
inner.style.gridTemplateColumns = 'repeat(' + cols + ', max-content)';
inner.removeChild(units[0]);
var blank = first.cloneNode(true);
var total = Math.ceil(units.length / per);
for (var p = 0; p < total; p++) {
var sheet = p === 0 ? first : blank.cloneNode(true);
if (p > 0) {
pages.appendChild(sheet);
}
var target = sheet.querySelector('.g-page-inner');
for (var u = p * per; u < Math.min(units.length, (p + 1) * per); u++) {
target.appendChild(units[u]);
}
}
var areas = pages.querySelectorAll('.g-ta');
for (var a = 0; a < areas.length; a++) {
autosize(areas[a]);
}
previewFit();
}
function startMulti(box, tpl, people) {
var units = [];
var u;
if (mainHasData()) {
u = tpl.cloneNode(true);
cleanPreview(u);
units.push(u);
}
for (var i = 0; i < people.length; i++) {
u = tpl.cloneNode(true);
fillUnit(u, people[i]);
cleanPreview(u);
units.push(u);
}
box._units = units;
box.setAttribute('data-multi', '1');
var fb = box.querySelector('.g-pv-fill');
if (fb) {
fb.setAttribute('aria-disabled', 'true');
}
setPreviewFill(box, true);
previewFit();
}
function draftKey() {
return 'f.' + SLUG + '.draft';
}
function isReload() {
try {
var nav = window.performance.getEntriesByType('navigation');
if (nav && nav.length) {
return nav[0].type === 'reload';
}
return !!(window.performance.navigation && window.performance.navigation.type === 1);
} catch (e) {
return false;
}
}
function saveDraft() {
if (!SLUG) {
return;
}
var data = collectData();
try {
if (!Object.keys(data.fields).length && !Object.keys(data.photos).length) {
window.sessionStorage.removeItem(draftKey());
return;
}
var body = { fields: data.fields, photos: data.photos, sig: demoSig, active: activeSave || '' };
try {
window.sessionStorage.setItem(draftKey(), JSON.stringify(body));
} catch (e) {
body.photos = {};
window.sessionStorage.setItem(draftKey(), JSON.stringify(body));
}
} catch (e) {}
}
var draftTimer = 0;
function queueDraft() {
window.clearTimeout(draftTimer);
draftTimer = window.setTimeout(saveDraft, 400);
}
function restoreDraft() {
var raw = null;
try {
if (isReload()) {
window.sessionStorage.removeItem(draftKey());
return;
}
if (new URLSearchParams(window.location.search).get('save')) {
return;
}
raw = window.sessionStorage.getItem(draftKey());
} catch (e) {
return;
}
if (!raw) {
return;
}
var draft = null;
try {
draft = JSON.parse(raw);
} catch (e) {
return;
}
if (!draft || typeof draft !== 'object') {
return;
}
applyData(draft);
demoSig = typeof draft.sig === 'string' ? draft.sig : '';
if (typeof draft.active === 'string' && /^[a-z0-9]{6,40}$/.test(draft.active)) {
activeSave = draft.active;
}
}
function bindDraft() {
var box = document.getElementById('g-pages');
if (box) {
box.addEventListener('input', queueDraft);
box.addEventListener('change', queueDraft);
}
window.addEventListener('pagehide', saveDraft);
document.addEventListener('visibilitychange', function () {
if (document.visibilityState === 'hidden') {
saveDraft();
}
});
}
function init() {
SLUG = document.body.getAttribute('data-form') || '';
META = findMeta(SLUG);
if (META) {
try {
window.sessionStorage.setItem('g.formTab', META.group === 'institutional' ? 'institutional' : 'public');
} catch (e) {}
}
document.body.insertAdjacentHTML('afterbegin', TOP_HTML);
var source = document.getElementById('g-form-pages');
var target = document.getElementById('g-pages');
while (source && source.firstChild) {
target.appendChild(source.firstChild);
}
if (source) {
source.parentNode.removeChild(source);
}
G.pageTitle = function () {
return (META ? pick(META.title) + ' - ' : '') + G.t('site.name');
};
G.shareTitle = function () {
return META ? pick(META.title) : document.title;
};
renderMeta();
applyPlaceholders();
bindLock();
bindTextareas();
bindPhotos();
bindKinds();
bindGuide();
bindFill();
bindPrint();
bindTools();
bindMulti();
bindFav();
restoreDraft();
bindDraft();
applyLockState();
applyLinkedSave();
refreshFill();
document.addEventListener('g:langchange', function () {
refreshFill();
labelMulti();
previewLabels();
renderMeta();
refreshFav();
applyPlaceholders();
updateEye();
updateAsk();
});
window.addEventListener('pageshow', function (e) {
if (e.persisted) {
unlocked = false;
applyLockState();
}
});
window.addEventListener('resize', fit);
window.addEventListener('resize', previewFit);
window.addEventListener('popstate', closePreview);
window.addEventListener('load', fit);
}
G.form = {
init: init,
fit: fit,
toast: toast,
print: print
};
})();
