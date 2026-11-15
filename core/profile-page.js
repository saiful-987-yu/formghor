(function () {
var G = window.G = window.G || {};
var form = document.getElementById('g-pp');
var acc = document.getElementById('g-pp-acc');
if (!form || !acc || !G.profile) {
return;
}
var USER_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
var GROUPS = [
{
title: 'pf.sec.personal',
fields: [
{ k: 'name', l: 'pf.name', max: 100, auto: 'name' },
{ k: 'father', l: 'pf.father', max: 100, auto: 'off' },
{ k: 'mother', l: 'pf.mother', max: 100, auto: 'off' },
{ k: 'birth', l: 'pf.birth', max: 10, ph: 'pf.phBirth', auto: 'bday' },
{ k: 'gender', l: 'pf.gender', t: 'select' },
{ k: 'blood', l: 'pf.blood', t: 'select' },
{ k: 'religion', l: 'pf.religion', t: 'select' },
{ k: 'nationality', l: 'pf.nationality', max: 60, auto: 'off' },
{ k: 'marital', l: 'pf.marital', t: 'select' },
{ k: 'occupation', l: 'pf.occupation', max: 100, auto: 'organization-title' }
]
},
{
title: 'pf.sec.id',
fields: [
{ k: 'nid', l: 'pf.nid', max: 30, mode: 'numeric', auto: 'off' },
{ k: 'birthreg', l: 'pf.birthreg', max: 30, mode: 'numeric', auto: 'off' },
{ k: 'passport', l: 'pf.passport', max: 30, auto: 'off' }
]
},
{
title: 'pf.sec.contact',
fields: [
{ k: 'phone', l: 'pf.phone', t: 'tel', max: 20, auto: 'tel' },
{ k: 'email', l: 'pf.email', t: 'email', max: 100, auto: 'email' },
{ k: 'address', l: 'pf.address', t: 'area', max: 300, wide: true, auto: 'street-address' },
{ k: 'address_perm', l: 'pf.addressPerm', t: 'area', max: 300, wide: true, auto: 'off' }
]
}
];
var KEYS = [];
GROUPS.forEach(function (g) {
g.fields.forEach(function (f) {
KEYS.push(f.k);
});
});
var inputs = {};
var vals = {};
var saved = {};
var photoUrl = '';
var msgKey = '';
var ui = {};
function $(id) {
return document.getElementById(id);
}
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
function i18n(node, key) {
node.setAttribute('data-i18n', key);
node.textContent = G.t(key);
return node;
}
function session() {
return G.sync && G.sync.getSession ? G.sync.getSession() : null;
}
function enabled() {
return !!(G.sync && G.sync.enabled());
}
function current() {
var data = G.profile.get() || {};
var out = {};
for (var i = 0; i < G.profile.fields.length; i++) {
var key = G.profile.fields[i];
out[key] = data[key] || '';
}
var s = session();
if (s && !out.phone) {
out.phone = s.phone;
}
return out;
}
function hasData(data) {
for (var i = 0; i < G.profile.fields.length; i++) {
if (data[G.profile.fields[i]]) {
return true;
}
}
return false;
}
function normPhone(value) {
var s = String(value || '').replace(/[০-৯]/g, function (d) {
return '০১২৩৪৫৬৭৮৯'.indexOf(d);
}).replace(/[\s-]/g, '');
if (/^\+?880/.test(s)) {
s = '0' + s.replace(/^\+?880/, '');
}
return s;
}
function validPhone(value) {
return /^01[3-9][0-9]{8}$/.test(value);
}
function normBirth(value) {
var s = String(value || '').trim();
if (!s) {
return '';
}
s = s.replace(/[০-৯]/g, function (d) {
return '০১২৩৪৫৬৭৮৯'.indexOf(d);
}).replace(/[\s.\-]+/g, '/');
var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
if (!m) {
return null;
}
var d = Number(m[1]);
var mo = Number(m[2]);
if (d < 1 || d > 31 || mo < 1 || mo > 12) {
return null;
}
return (d < 10 ? '0' : '') + d + '/' + (mo < 10 ? '0' : '') + mo + '/' + m[3];
}
function autosize(ta) {
ta.style.height = 'auto';
ta.style.height = ta.scrollHeight + 'px';
}
function showMsg(key) {
msgKey = key || '';
ui.msg.textContent = msgKey ? G.t(msgKey) : '';
}
function errKey(code) {
var map = {
phone_exists: 'pf.errExists',
bad_credentials: 'pf.errCred',
too_many: 'pf.errMany',
network: 'pf.errNet',
bad_request: 'pf.errReq'
};
return map[code] || 'pf.errServer';
}
function fillSelect(sel, key) {
var keep = sel.value;
var lang = G.getLang();
sel.textContent = '';
var first = el('option', '', G.t('pf.choose'));
first.value = '';
sel.appendChild(first);
var list = G.profile.options[key] || [];
for (var i = 0; i < list.length; i++) {
var o = el('option', '', list[i][lang === 'en' ? 2 : 1]);
o.value = list[i][0];
sel.appendChild(o);
}
sel.value = keep;
}
function buildField(f) {
var wrap = el('div', 'g-pp-field' + (f.wide ? ' g-pp-field--wide' : ''));
var id = 'g-pp-' + f.k;
var label = el('label', 'g-pp-label');
label.setAttribute('for', id);
i18n(label, f.l);
wrap.appendChild(label);
var val = el('div', 'g-pp-val');
vals[f.k] = val;
wrap.appendChild(val);
var input;
if (f.t === 'select') {
input = el('select', 'g-pp-input');
} else if (f.t === 'area') {
input = el('textarea', 'g-pp-input');
input.rows = 2;
input.addEventListener('input', function () {
autosize(this);
});
} else {
input = el('input', 'g-pp-input');
input.type = f.t === 'tel' || f.t === 'email' ? f.t : 'text';
}
input.id = id;
input.name = f.k;
if (f.max) {
input.maxLength = f.max;
}
if (f.mode) {
input.setAttribute('inputmode', f.mode);
}
if (f.auto) {
input.setAttribute('autocomplete', f.auto);
}
inputs[f.k] = input;
wrap.appendChild(input);
return wrap;
}
function buildHero() {
var hero = el('section', 'g-pp-hero');
ui.photo = el('div', 'g-pp-photo');
hero.appendChild(ui.photo);
var info = el('div', 'g-pp-hero-info');
ui.heroName = el('h2', 'g-pp-hero-name');
ui.heroSub = el('p', 'g-pp-hero-sub');
info.appendChild(ui.heroName);
info.appendChild(ui.heroSub);
var btns = el('div', 'g-pp-photobtns');
var pick = el('label', 'g-pp-photobtn');
ui.file = el('input', 'g-pp-file');
ui.file.type = 'file';
ui.file.accept = 'image/*';
pick.appendChild(ui.file);
pick.appendChild(i18n(el('span'), 'pf.photoPick'));
ui.remove = el('button', 'g-pp-photobtn');
ui.remove.type = 'button';
i18n(ui.remove, 'pf.photoRemove');
btns.appendChild(pick);
btns.appendChild(ui.remove);
info.appendChild(btns);
hero.appendChild(info);
ui.file.addEventListener('change', function () {
var file = ui.file.files && ui.file.files[0];
G.photoToDataUrl(file, function (url) {
if (url) {
photoUrl = url;
renderHero();
}
ui.file.value = '';
});
});
ui.remove.addEventListener('click', function () {
photoUrl = '';
renderHero();
});
return hero;
}
function buildGroup(g) {
var card = el('section', 'g-pp-card');
card.appendChild(i18n(el('h2', 'g-pp-card-title'), g.title));
var grid = el('div', 'g-pp-grid');
g.fields.forEach(function (f) {
grid.appendChild(buildField(f));
});
card.appendChild(grid);
return card;
}
function button(cls, key, type) {
var b = el('button', cls);
b.type = type || 'button';
return i18n(b, key);
}
function buildActions() {
var box = el('div', 'g-pp-actions-wrap');
ui.msg = el('p', 'g-pp-msg');
ui.msg.setAttribute('role', 'status');
box.appendChild(ui.msg);
var row = el('div', 'g-pp-actions');
ui.edit = button('g-btn', 'pf.edit');
ui.save = button('g-btn', 'pf.save', 'submit');
ui.cancel = button('g-btn g-btn--ghost', 'pf.cancel');
ui.clear = button('g-btn g-btn--ghost', 'pf.clear');
row.appendChild(ui.edit);
row.appendChild(ui.save);
row.appendChild(ui.cancel);
row.appendChild(ui.clear);
box.appendChild(row);
ui.edit.addEventListener('click', onEdit);
ui.cancel.addEventListener('click', onCancel);
ui.clear.addEventListener('click', onClear);
return box;
}
function buildAccount() {
acc.appendChild(i18n(el('h2', 'g-pp-card-title'), 'pf.account'));
ui.accNote = el('p', 'g-pp-note');
acc.appendChild(ui.accNote);
ui.accGrid = el('div', 'g-pp-grid');
var f1 = el('div', 'g-pp-field');
var l1 = el('label', 'g-pp-label');
l1.setAttribute('for', 'g-pp-acc-phone');
i18n(l1, 'pf.phone');
ui.accPhone = el('input', 'g-pp-input');
ui.accPhone.id = 'g-pp-acc-phone';
ui.accPhone.type = 'tel';
ui.accPhone.maxLength = 20;
ui.accPhone.setAttribute('autocomplete', 'tel');
f1.appendChild(l1);
f1.appendChild(ui.accPhone);
ui.accPassBox = el('div', 'g-pp-field');
var l2 = el('label', 'g-pp-label');
l2.setAttribute('for', 'g-pp-acc-pass');
i18n(l2, 'pf.password');
ui.accPass = el('input', 'g-pp-input');
ui.accPass.id = 'g-pp-acc-pass';
ui.accPass.type = 'password';
ui.accPass.maxLength = 64;
ui.accPass.setAttribute('autocomplete', 'current-password');
ui.accPassBox.appendChild(l2);
ui.accPassBox.appendChild(ui.accPass);
ui.accGrid.appendChild(f1);
ui.accGrid.appendChild(ui.accPassBox);
acc.appendChild(ui.accGrid);
ui.accMsg = el('p', 'g-pp-msg');
ui.accMsg.setAttribute('role', 'status');
acc.appendChild(ui.accMsg);
var row = el('div', 'g-pp-actions');
ui.login = button('g-btn', 'pf.login');
ui.register = button('g-btn g-btn--ghost', 'pf.register');
ui.logout = button('g-btn g-btn--ghost', 'pf.logout');
row.appendChild(ui.login);
row.appendChild(ui.register);
row.appendChild(ui.logout);
acc.appendChild(row);
ui.login.addEventListener('click', onLogin);
ui.register.addEventListener('click', onRegister);
ui.logout.addEventListener('click', onLogout);
}
function renderHero() {
ui.photo.textContent = '';
if (/^data:image\//.test(photoUrl)) {
var img = el('img');
img.alt = '';
img.src = photoUrl;
ui.photo.appendChild(img);
} else {
ui.photo.innerHTML = USER_SVG;
}
ui.remove.hidden = !photoUrl;
var name = saved.name || '';
ui.heroName.textContent = name || G.t('pf.noName');
ui.heroName.className = 'g-pp-hero-name' + (name ? '' : ' g-pp-hero-name--empty');
ui.heroSub.textContent = saved.phone || '';
ui.heroSub.hidden = !saved.phone;
}
function renderView() {
var lang = G.getLang();
for (var i = 0; i < KEYS.length; i++) {
var k = KEYS[i];
var raw = saved[k] || '';
var text = G.profile.isChoice(k) ? G.profile.label(k, raw, lang) : raw;
vals[k].textContent = text || '—';
vals[k].className = 'g-pp-val' + (text ? '' : ' g-pp-val--empty');
}
}
function fillInputs(data) {
for (var i = 0; i < KEYS.length; i++) {
var k = KEYS[i];
inputs[k].value = data[k] || '';
if (inputs[k].tagName === 'TEXTAREA') {
autosize(inputs[k]);
}
}
photoUrl = data.photo || '';
inputs.phone.readOnly = !!session();
}
function renderAccount() {
var on = enabled();
acc.hidden = !on;
if (!on) {
return;
}
var s = session();
ui.accNote.textContent = s ? G.t('pf.loggedIn').replace('{phone}', s.phone) : G.t('pf.loggedOut');
ui.accGrid.hidden = !!s;
ui.login.hidden = !!s;
ui.register.hidden = !!s;
ui.logout.hidden = !s;
if (!s && !ui.accPhone.value) {
ui.accPhone.value = saved.phone || '';
}
}
function setMode(mode) {
var edit = mode === 'edit';
var has = hasData(saved);
form.setAttribute('data-mode', mode);
ui.edit.hidden = edit;
ui.save.hidden = !edit;
ui.cancel.hidden = !edit || !has;
ui.clear.hidden = !edit || !has;
}
function refreshAll(msg) {
saved = current();
fillInputs(saved);
renderView();
renderHero();
renderAccount();
setMode(hasData(saved) ? 'view' : 'edit');
showMsg(msg || '');
}
function readForm() {
var data = {};
for (var i = 0; i < KEYS.length; i++) {
data[KEYS[i]] = String(inputs[KEYS[i]].value || '').trim();
}
data.photo = photoUrl;
var s = session();
if (s) {
data.phone = s.phone;
}
return data;
}
function remoteProfile(data) {
var out = {};
for (var i = 0; i < G.profile.fields.length; i++) {
var k = G.profile.fields[i];
if (k !== 'phone') {
out[k] = data[k] || '';
}
}
return out;
}
function onEdit() {
fillInputs(saved);
setMode('edit');
showMsg('');
var first = inputs.name;
if (first) {
first.focus();
}
}
function onCancel() {
fillInputs(saved);
renderHero();
setMode('view');
showMsg('');
}
function onSubmit(e) {
e.preventDefault();
if (form.getAttribute('data-mode') !== 'edit') {
return;
}
var data = readForm();
var birth = normBirth(data.birth);
if (birth === null) {
showMsg('pf.badBirth');
inputs.birth.focus();
return;
}
data.birth = birth;
if (!hasData(data)) {
G.profile.clear();
refreshAll('pf.cleared');
return;
}
if (!G.profile.save(data)) {
showMsg('pf.fail');
return;
}
if (session()) {
G.sync.pushProfile(remoteProfile(data));
}
refreshAll('pf.saved');
}
function onClear() {
if (!window.confirm(G.t('pf.confirmClear'))) {
return;
}
G.profile.clear();
refreshAll('pf.cleared');
}
function setBusy(busy) {
ui.login.disabled = busy;
ui.register.disabled = busy;
ui.logout.disabled = busy;
}
function accMessage(key) {
ui.accMsg.textContent = key ? G.t(key) : '';
ui.accMsg.setAttribute('data-key', key || '');
}
function onLogin() {
var phone = normPhone(ui.accPhone.value);
var pass = ui.accPass.value;
if (!validPhone(phone) || !pass) {
accMessage('pf.errCred');
return;
}
setBusy(true);
accMessage('pf.wait');
G.sync.login(phone, pass).then(function (res) {
setBusy(false);
if (res.ok) {
G.profile.save(res.profile);
ui.accPass.value = '';
refreshAll();
accMessage('pf.loginDone');
} else {
accMessage(errKey(res.error));
}
});
}
function onRegister() {
var phone = normPhone(ui.accPhone.value);
var pass = ui.accPass.value;
if (!validPhone(phone)) {
accMessage('pf.badPhone');
return;
}
if (pass.length < 6) {
accMessage('pf.badPass');
return;
}
var data = current();
data.phone = phone;
setBusy(true);
accMessage('pf.wait');
G.sync.register(phone, pass, remoteProfile(data)).then(function (res) {
setBusy(false);
if (res.ok) {
G.profile.save(data);
ui.accPass.value = '';
refreshAll();
accMessage('pf.registered');
} else {
accMessage(errKey(res.error));
}
});
}
function onLogout() {
if (!window.confirm(G.t('pf.confirmLogout'))) {
return;
}
G.sync.logout();
G.profile.clear();
ui.accPhone.value = '';
refreshAll();
accMessage('pf.loggedOutDone');
}
function applyTexts() {
GROUPS.forEach(function (g) {
g.fields.forEach(function (f) {
if (f.ph) {
inputs[f.k].setAttribute('placeholder', G.t(f.ph));
}
if (f.t === 'select') {
fillSelect(inputs[f.k], f.k);
}
});
});
ui.accPass.setAttribute('placeholder', G.t('pf.password'));
}
function onLang() {
applyTexts();
renderView();
renderHero();
renderAccount();
showMsg(msgKey);
var k = ui.accMsg.getAttribute('data-key');
if (k) {
accMessage(k);
}
}
G.pageTitle = function () {
return G.t('pf.title') + ' - ' + G.t('site.name');
};
form.appendChild(buildHero());
GROUPS.forEach(function (g) {
form.appendChild(buildGroup(g));
});
form.appendChild(buildActions());
buildAccount();
applyTexts();
form.addEventListener('submit', onSubmit);
document.addEventListener('g:langchange', onLang);
refreshAll();
})();
