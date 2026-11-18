(function () {
var G = window.G = window.G || {};
var root = document.getElementById('g-pp-root');
if (!root || !G.profile) {
return;
}
var ICONS = {
user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
phone: '<path d="M7 3h3l1.5 4.5-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2L21 14v3a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 2-2z"/>',
lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.8 9.8 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
x: '<path d="M6 6l12 12M18 6L6 18"/>',
check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
chevron: '<path d="M9 6l6 6-6 6"/>',
heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
bookmark: '<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/>',
grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
logout: '<path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M15 8l4 4-4 4M19 12H9"/>',
login: '<path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M9 8l-4 4 4 4M5 12h10"/>',
key: '<circle cx="8" cy="14" r="4"/><path d="M11 11l8-8M16 6l3 3M14 8l2 2"/>',
trash: '<path d="M5 7h14M10 4h4M7 7l1 13h8l1-13"/>',
headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20a4 4 0 0 1-4 2h-2"/>',
code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>'
};
var GOOGLE_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
var FACEBOOK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>';
var CARDS = [
{
id: 'personal',
title: 'pf.sec.personal',
size: 'wide',
fields: [
{ k: 'name', l: 'pf.name', max: 100, auto: 'name' },
{ k: 'birth', l: 'pf.birth', max: 10, ph: 'pf.phBirth', auto: 'bday' },
{ k: 'gender', l: 'pf.gender', t: 'select' },
{ k: 'blood', l: 'pf.blood', t: 'select' },
{ k: 'religion', l: 'pf.religion', t: 'select' },
{ k: 'marital', l: 'pf.marital', t: 'select' },
{ k: 'nationality', l: 'pf.nationality', max: 60, auto: 'off' },
{ k: 'occupation', l: 'pf.occupation', max: 100, auto: 'organization-title' },
{ k: 'education', l: 'pf.education', max: 100, auto: 'off' }
]
},
{
id: 'family',
title: 'pf.sec.family',
size: 'half',
fields: [
{ k: 'father', l: 'pf.father', max: 100, auto: 'off' },
{ k: 'mother', l: 'pf.mother', max: 100, auto: 'off' }
]
},
{
id: 'ident',
title: 'pf.sec.id',
size: 'half',
fields: [
{ k: 'nid', l: 'pf.nid', max: 30, mode: 'numeric', auto: 'off' },
{ k: 'birthreg', l: 'pf.birthreg', max: 30, mode: 'numeric', auto: 'off' },
{ k: 'passport', l: 'pf.passport', max: 30, auto: 'off' }
]
},
{
id: 'contact',
title: 'pf.sec.contact',
size: 'half',
fields: [
{ k: 'phone', l: 'pf.phone', t: 'tel', max: 20, auto: 'tel', wide: true },
{ k: 'phone_alt', l: 'pf.phoneAlt', t: 'tel', max: 20, auto: 'off', wide: true },
{ k: 'email', l: 'pf.email', t: 'email', max: 100, auto: 'email', wide: true }
]
},
{
id: 'address',
title: 'pf.sec.address',
size: 'half',
fields: [
{ k: 'address', l: 'pf.address', t: 'area', max: 300, wide: true, auto: 'street-address' },
{ k: 'present_village', l: 'pf.village', max: 100, auto: 'off' },
{ k: 'present_post', l: 'pf.post', max: 100, auto: 'off' },
{ k: 'present_upazila', l: 'pf.upazila', max: 100, auto: 'off' },
{ k: 'present_district', l: 'pf.district', max: 100, auto: 'off' },
{ k: 'address_perm', l: 'pf.addressPerm', t: 'area', max: 300, wide: true, auto: 'off' }
]
}
];
var COMPLETE_KEYS = ['photo', 'name', 'phone', 'father', 'mother', 'birth', 'gender', 'blood', 'religion', 'nationality', 'marital', 'occupation', 'education', 'nid', 'address', 'present_village', 'present_post', 'present_upazila', 'present_district', 'address_perm'];
var saved = {};
var ui = {};
var cardUi = {};
var localMode = false;
var phoneSet = null;
var phoneAt = 0;
var phoneLoad = null;
var phoneSeq = 0;
var phoneState = '';
var toastTimer = 0;
var dlg = null;
var lastView = '';
try {
localMode = window.sessionStorage.getItem('g.pp.local') === '1';
} catch (e) {}
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
function icon(name, cls) {
var s = el('span', 'g-pp-ico' + (cls ? ' ' + cls : ''));
s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';
return s;
}
function i18n(node, key) {
node.setAttribute('data-i18n', key);
node.textContent = G.t(key);
return node;
}
function label(node, key) {
node.setAttribute('data-i18n-label', key);
node.setAttribute('aria-label', G.t(key));
node.setAttribute('title', G.t(key));
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
function toast(text) {
var node = document.getElementById('g-pp-toast');
if (!node) {
node = el('div', 'g-pp-toast');
node.id = 'g-pp-toast';
node.setAttribute('role', 'status');
document.body.appendChild(node);
}
node.textContent = text;
node.classList.add('g-pp-toast--show');
window.clearTimeout(toastTimer);
toastTimer = window.setTimeout(function () {
node.classList.remove('g-pp-toast--show');
}, 3400);
}
function setMsg(node, key) {
node.textContent = key ? G.t(key) : '';
node.setAttribute('data-key', key || '');
}
function setBusy(btn, busy) {
btn.disabled = busy;
btn.classList.toggle('g-au-btn--busy', busy);
}
function closeDialog() {
if (!dlg) {
return;
}
var d = dlg;
dlg = null;
document.removeEventListener('keydown', d.onKey);
document.documentElement.classList.remove('g-pp-lock');
if (d.root.parentNode) {
d.root.parentNode.removeChild(d.root);
}
if (d.opener && d.opener.focus) {
d.opener.focus();
}
}
function dialog(opts) {
closeDialog();
var shown = document.getElementById('g-pp-toast');
if (shown) {
shown.classList.remove('g-pp-toast--show');
}
var back = el('div', 'g-pp-dlg');
var card = el('div', 'g-pp-dlg-card');
card.setAttribute('role', 'dialog');
card.setAttribute('aria-modal', 'true');
card.appendChild(el('h2', 'g-pp-dlg-title', opts.title || ''));
if (opts.text) {
card.appendChild(el('p', 'g-pp-dlg-text', opts.text));
}
var body = el('div', 'g-pp-dlg-body');
card.appendChild(body);
if (opts.build) {
opts.build(body, closeDialog);
}
if (opts.onYes) {
var row = el('div', 'g-pp-actions');
var no = el('button', 'g-btn g-btn--ghost', G.t('modal.no'));
no.type = 'button';
no.addEventListener('click', closeDialog);
var yes = el('button', 'g-btn', opts.yesLabel || G.t('modal.yes'));
yes.type = 'button';
yes.addEventListener('click', function () {
closeDialog();
opts.onYes();
});
row.appendChild(no);
row.appendChild(yes);
card.appendChild(row);
}
back.appendChild(card);
back.addEventListener('click', function (e) {
if (e.target === back) {
closeDialog();
}
});
var onKey = function (e) {
if (e.key === 'Escape') {
closeDialog();
}
};
dlg = { root: back, onKey: onKey, opener: document.activeElement };
document.addEventListener('keydown', onKey);
document.documentElement.classList.add('g-pp-lock');
document.body.appendChild(back);
var first = card.querySelector('input, button');
if (first) {
first.focus();
}
return card;
}
function tagOf(phone) {
if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
return Promise.resolve('');
}
return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode('fg:' + phone)).then(function (buf) {
var a = new Uint8Array(buf);
var s = '';
for (var i = 0; i < 5; i++) {
s += ('0' + a[i].toString(16)).slice(-2);
}
return s;
}).catch(function () {
return '';
});
}
function loadPhones() {
if (phoneLoad && Date.now() - phoneAt < 300000) {
return phoneLoad;
}
phoneAt = Date.now();
phoneLoad = G.sync.phones().then(function (res) {
if (res && res.ok && typeof res.list === 'string') {
var set = {};
res.list.split(',').forEach(function (t) {
if (t) {
set[t] = 1;
}
});
phoneSet = set;
return true;
}
phoneLoad = null;
return false;
});
return phoneLoad;
}
function setPhoneState(state) {
phoneState = state;
if (!ui.upState) {
return;
}
ui.upState.textContent = '';
ui.upField.setAttribute('data-state', state);
if (state === 'busy') {
ui.upState.appendChild(el('span', 'g-au-spin'));
} else if (state === 'ok') {
var ok = el('span', 'g-au-badge g-au-badge--ok');
ok.appendChild(icon('check'));
ui.upState.appendChild(ok);
} else if (state === 'taken') {
var bad = el('span', 'g-au-badge g-au-badge--bad');
bad.appendChild(icon('x'));
ui.upState.appendChild(bad);
}
}
function onPhoneInput() {
var phone = normPhone(ui.upPhone.value);
var seq = ++phoneSeq;
setPhoneState('');
if (!validPhone(phone)) {
return;
}
setPhoneState('busy');
Promise.all([loadPhones(), tagOf(phone)]).then(function (r) {
if (seq !== phoneSeq) {
return;
}
if (!r[0] || !r[1] || !phoneSet) {
setPhoneState('');
return;
}
if (phoneSet[r[1]]) {
setPhoneState('taken');
toast(G.t('pf.phoneTaken'));
} else {
setPhoneState('ok');
}
});
}
function textField(iconName, ph, type, autoc, mode, max, name) {
var box = el('div', 'g-au-field');
box.appendChild(icon(iconName, 'g-au-lead'));
var input = el('input', 'g-au-input');
input.type = type;
input.name = name;
input.maxLength = max;
input.setAttribute('autocomplete', autoc);
if (mode) {
input.setAttribute('inputmode', mode);
}
input.setAttribute('data-ph', ph);
box.appendChild(input);
return { box: box, input: input };
}
function passField(ph, autoc, name) {
var f = textField('lock', ph, 'password', autoc, '', 64, name);
var eye = el('button', 'g-au-eye');
eye.type = 'button';
label(eye, 'pf.showPass');
eye.appendChild(icon('eye'));
eye.addEventListener('click', function () {
var show = f.input.type === 'password';
f.input.type = show ? 'text' : 'password';
eye.textContent = '';
eye.appendChild(icon(show ? 'eyeoff' : 'eye'));
});
f.box.appendChild(eye);
return f;
}
function soon() {
toast(G.t('pf.soon'));
}
function contactLink(key, value) {
var v = String(value || '').trim();
if (!v || v === '#') {
return '';
}
if (key === 'call') {
return 'tel:' + v.replace(/[^\d+]/g, '');
}
if (key === 'whatsapp') {
var d = v.replace(/\D/g, '');
if (d.charAt(0) === '0') {
d = '88' + d;
}
return d ? 'https://wa.me/' + d : '';
}
return /^https?:\/\//i.test(v) ? v : '';
}
function chip(key, value, text) {
var href = contactLink(key, value);
if (!href) {
return null;
}
var a = el('a', 'g-pp-chip');
a.href = href;
if (key !== 'call') {
a.target = '_blank';
a.rel = 'noopener';
}
var ico = el('span', 'g-pp-chip-ico');
ico.innerHTML = (G.socialIcons && G.socialIcons[key]) || '';
a.appendChild(ico);
var t = el('span');
if (text) {
i18n(t, text);
} else {
t.textContent = { whatsapp: 'WhatsApp', facebook: 'Facebook', tiktok: 'TikTok', instagram: 'Instagram', website: 'Website' }[key] || key;
}
a.appendChild(t);
return a;
}
function openForgot() {
dialog({
title: G.t('pf.forgotTitle'),
text: G.t('pf.forgotText'),
build: function (body) {
var admin = G.config.admin || G.config.social || {};
var row = el('div', 'g-pp-chips');
var c1 = chip('call', admin.call, 'pf.callBtn');
var c2 = chip('whatsapp', admin.whatsapp);
if (c1) {
row.appendChild(c1);
}
if (c2) {
row.appendChild(c2);
}
body.appendChild(row);
}
});
}
function setTab(tab) {
i18n(ui.auTitle, tab === 'in' ? 'pf.signin' : 'pf.createAcc');
i18n(ui.auAsk, tab === 'in' ? 'pf.newUser' : 'pf.haveAcc');
i18n(ui.auSwitch, tab === 'in' ? 'pf.createAcc' : 'pf.signinLink');
ui.auSwitch.setAttribute('data-tab', tab === 'in' ? 'up' : 'in');
ui.formIn.hidden = tab !== 'in';
ui.formUp.hidden = tab !== 'up';
setMsg(ui.inMsg, '');
setMsg(ui.upMsg, '');
if (tab === 'up') {
loadPhones();
}
}
function showDash() {
localMode = true;
try {
window.sessionStorage.setItem('g.pp.local', '1');
} catch (e) {}
render();
}
function showAuth() {
localMode = false;
try {
window.sessionStorage.removeItem('g.pp.local');
} catch (e) {}
render();
}
function doLogin() {
var phone = normPhone(ui.inPhone.value);
var pass = ui.inPass.value;
if (!validPhone(phone) || !pass) {
setMsg(ui.inMsg, 'pf.errCred');
return;
}
setBusy(ui.inBtn, true);
setMsg(ui.inMsg, 'pf.wait');
G.sync.login(phone, pass).then(function (res) {
setBusy(ui.inBtn, false);
if (res.ok) {
G.profile.save(res.profile);
localMode = false;
render();
toast(G.t('pf.loginDone'));
} else {
setMsg(ui.inMsg, errKey(res.error));
}
});
}
function doRegister() {
var name = ui.upName.value.trim();
var phone = normPhone(ui.upPhone.value);
var pass = ui.upPass.value;
if (!name) {
setMsg(ui.upMsg, 'pf.needName');
ui.upName.focus();
return;
}
if (!validPhone(phone)) {
setMsg(ui.upMsg, 'pf.badPhone');
ui.upPhone.focus();
return;
}
if (phoneState === 'taken') {
setMsg(ui.upMsg, '');
toast(G.t('pf.phoneTaken'));
return;
}
if (pass.length < 6) {
setMsg(ui.upMsg, 'pf.badPass');
return;
}
if (pass !== ui.upPass2.value) {
setMsg(ui.upMsg, 'pf.passMismatch');
return;
}
var data = current();
data.name = name;
data.phone = phone;
setBusy(ui.upBtn, true);
setMsg(ui.upMsg, 'pf.wait');
G.sync.register(phone, pass, remoteProfile(data)).then(function (res) {
setBusy(ui.upBtn, false);
if (res.ok) {
G.profile.save(data);
localMode = false;
render();
toast(G.t('pf.registered'));
} else if (res.error === 'phone_exists') {
setPhoneState('taken');
setMsg(ui.upMsg, '');
toast(G.t('pf.phoneTaken'));
} else {
setMsg(ui.upMsg, errKey(res.error));
}
});
}
function buildSocial() {
var box = el('div', 'g-au-socialbox');
var or = el('div', 'g-au-or');
or.appendChild(i18n(el('span'), 'pf.or'));
box.appendChild(or);
box.appendChild(i18n(el('p', 'g-au-socialtxt'), 'pf.social'));
var row = el('div', 'g-au-social');
[['Google', GOOGLE_SVG], ['Facebook', FACEBOOK_SVG]].forEach(function (s) {
var b = el('button', 'g-au-sbtn');
b.type = 'button';
var ico = el('span', 'g-au-sico');
ico.innerHTML = s[1];
b.appendChild(ico);
b.appendChild(el('span', '', s[0]));
b.addEventListener('click', soon);
row.appendChild(b);
});
box.appendChild(row);
return box;
}
function buildAuth() {
var wrap = el('div', 'g-au');
var card = el('div', 'g-au-card');
var logo = el('img', 'g-au-logo');
logo.src = '../assets/icons/logo.svg';
logo.alt = '';
card.appendChild(logo);
ui.auTitle = el('h1', 'g-au-title');
card.appendChild(ui.auTitle);
var sub = el('p', 'g-au-sub');
ui.auAsk = el('span');
ui.auSwitch = el('button', 'g-au-link');
ui.auSwitch.type = 'button';
sub.appendChild(ui.auAsk);
sub.appendChild(document.createTextNode(' '));
sub.appendChild(ui.auSwitch);
card.appendChild(sub);
ui.auSwitch.addEventListener('click', function () {
setTab(ui.auSwitch.getAttribute('data-tab'));
});
ui.formIn = el('form', 'g-au-form');
ui.formIn.noValidate = true;
var f1 = textField('phone', 'pf.phonePh', 'tel', 'tel', 'tel', 20, 'phone');
var f2 = passField('pf.passPh', 'current-password', 'password');
ui.inPhone = f1.input;
ui.inPass = f2.input;
ui.formIn.appendChild(f1.box);
ui.formIn.appendChild(f2.box);
ui.forgot = el('button', 'g-au-forgot');
ui.forgot.type = 'button';
i18n(ui.forgot, 'pf.forgot');
ui.forgot.addEventListener('click', openForgot);
ui.formIn.appendChild(ui.forgot);
ui.inMsg = el('p', 'g-au-msg');
ui.inMsg.setAttribute('role', 'status');
ui.formIn.appendChild(ui.inMsg);
ui.inBtn = el('button', 'g-au-btn');
ui.inBtn.type = 'submit';
i18n(ui.inBtn, 'pf.login');
ui.formIn.appendChild(ui.inBtn);
ui.formIn.addEventListener('submit', function (e) {
e.preventDefault();
doLogin();
});
card.appendChild(ui.formIn);
ui.formUp = el('form', 'g-au-form');
ui.formUp.noValidate = true;
var u1 = textField('user', 'pf.namePh', 'text', 'name', '', 100, 'name');
var u2 = textField('phone', 'pf.phonePh', 'tel', 'tel', 'tel', 20, 'phone');
var u3 = passField('pf.passPh', 'new-password', 'password');
var u4 = passField('pf.pass2Ph', 'new-password', 'password2');
ui.upName = u1.input;
ui.upPhone = u2.input;
ui.upPass = u3.input;
ui.upPass2 = u4.input;
ui.upField = u2.box;
ui.upState = el('span', 'g-au-state');
u2.box.appendChild(ui.upState);
ui.upPhone.addEventListener('input', onPhoneInput);
ui.formUp.appendChild(u1.box);
ui.formUp.appendChild(u2.box);
ui.formUp.appendChild(u3.box);
ui.formUp.appendChild(u4.box);
ui.upMsg = el('p', 'g-au-msg');
ui.upMsg.setAttribute('role', 'status');
ui.formUp.appendChild(ui.upMsg);
ui.upBtn = el('button', 'g-au-btn');
ui.upBtn.type = 'submit';
i18n(ui.upBtn, 'pf.register');
ui.formUp.appendChild(ui.upBtn);
ui.formUp.addEventListener('submit', function (e) {
e.preventDefault();
doRegister();
});
card.appendChild(ui.formUp);
card.appendChild(buildSocial());
var skip = el('button', 'g-au-skip');
skip.type = 'button';
i18n(skip, 'pf.skip');
skip.addEventListener('click', showDash);
card.appendChild(skip);
wrap.appendChild(card);
setTab('in');
setPhoneState('');
loadPhones();
return wrap;
}
function percent() {
var n = 0;
for (var i = 0; i < COMPLETE_KEYS.length; i++) {
var k = COMPLETE_KEYS[i];
var v = saved[k] || '';
if (k === 'photo' ? /^data:image\//.test(v) : v) {
n++;
}
}
return Math.round(n * 100 / COMPLETE_KEYS.length);
}
function savePhoto(url) {
var data = current();
data.photo = url;
if (!G.profile.save(data)) {
toast(G.t('pf.fail'));
return;
}
if (session()) {
G.sync.pushProfile(remoteProfile(data));
}
saved = current();
renderHero();
toast(G.t('pf.saved'));
}
function buildHero() {
var hero = el('section', 'g-pp-hero');
var av = el('div', 'g-pp-avatar');
av.innerHTML = '<svg class="g-pp-ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="g-pp-ring-bg" cx="60" cy="60" r="54"/><circle class="g-pp-ring-fg" cx="60" cy="60" r="54"/></svg>';
ui.ringFg = av.querySelector('.g-pp-ring-fg');
ui.photo = el('div', 'g-pp-photo');
av.appendChild(ui.photo);
var pick = el('label', 'g-pp-avbtn g-pp-avbtn--cam');
label(pick, 'pf.photoPick');
ui.file = el('input', 'g-pp-file');
ui.file.type = 'file';
ui.file.accept = 'image/*';
pick.appendChild(ui.file);
pick.appendChild(icon('camera'));
av.appendChild(pick);
ui.photoDel = el('button', 'g-pp-avbtn g-pp-avbtn--del');
ui.photoDel.type = 'button';
label(ui.photoDel, 'pf.photoRemove');
ui.photoDel.appendChild(icon('x'));
av.appendChild(ui.photoDel);
hero.appendChild(av);
var info = el('div', 'g-pp-hero-info');
ui.heroName = el('h2', 'g-pp-hero-name');
ui.heroPhone = el('p', 'g-pp-hero-sub');
ui.heroPct = el('p', 'g-pp-pct');
info.appendChild(ui.heroName);
info.appendChild(ui.heroPhone);
info.appendChild(ui.heroPct);
info.appendChild(i18n(el('p', 'g-pp-hint'), 'pf.completeHint'));
hero.appendChild(info);
ui.file.addEventListener('change', function () {
var file = ui.file.files && ui.file.files[0];
G.photoToDataUrl(file, function (url) {
ui.file.value = '';
if (url) {
savePhoto(url);
}
});
});
ui.photoDel.addEventListener('click', function () {
savePhoto('');
});
return hero;
}
function renderHero() {
ui.photo.textContent = '';
var has = /^data:image\//.test(saved.photo || '');
if (has) {
var img = el('img');
img.alt = '';
img.src = saved.photo;
ui.photo.appendChild(img);
} else {
ui.photo.appendChild(icon('user'));
}
ui.photoDel.hidden = !has;
var name = saved.name || '';
ui.heroName.textContent = name || G.t('pf.noName');
ui.heroName.className = 'g-pp-hero-name' + (name ? '' : ' g-pp-hero-name--empty');
ui.heroPhone.textContent = saved.phone || '';
ui.heroPhone.hidden = !saved.phone;
var p = percent();
ui.heroPct.textContent = G.t('pf.complete').replace('{n}', String(p));
ui.ringFg.style.strokeDashoffset = String(339.3 * (1 - p / 100));
}
function buildTiles() {
var row = el('nav', 'g-pp-tiles');
[['bookmark', 'menu.saved', '../saved/index.html'], ['heart', 'menu.fav', '../favorites/index.html'], ['grid', 'pf.allForms', '../index.html']].forEach(function (t) {
var a = el('a', 'g-pp-tile');
a.href = t[2];
var ic = icon(t[0], 'g-pp-tile-ico');
a.appendChild(ic);
a.appendChild(i18n(el('span'), t[1]));
row.appendChild(a);
});
return row;
}
function buildBanner() {
var box = el('div', 'g-pp-banner');
box.appendChild(i18n(el('p', 'g-pp-banner-text'), 'pf.localBanner'));
var b = el('button', 'g-btn g-btn--sm');
b.type = 'button';
i18n(b, 'pf.goAuth');
b.addEventListener('click', showAuth);
box.appendChild(b);
return box;
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
function buildField(c, f) {
var wrap = el('div', 'g-pp-field' + (f.wide ? ' g-pp-field--wide' : ''));
var id = 'g-pp-' + f.k;
var lab = el('label', 'g-pp-label');
lab.setAttribute('for', id);
i18n(lab, f.l);
wrap.appendChild(lab);
var val = el('div', 'g-pp-val');
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
wrap.appendChild(input);
cardUi[c.id].inputs[f.k] = input;
cardUi[c.id].vals[f.k] = val;
return wrap;
}
function buildCard(c) {
cardUi[c.id] = { inputs: {}, vals: {} };
var u = cardUi[c.id];
var root2 = el('section', 'g-pp-card g-pp-card--' + c.size);
root2.setAttribute('data-mode', 'view');
u.root = root2;
var head = el('div', 'g-pp-card-head');
head.appendChild(i18n(el('h2', 'g-pp-card-title'), c.title));
u.pen = el('button', 'g-pp-iconbtn');
u.pen.type = 'button';
label(u.pen, 'pf.editCard');
u.pen.appendChild(icon('pencil'));
head.appendChild(u.pen);
root2.appendChild(head);
var form = el('form', 'g-pp-cardform');
form.noValidate = true;
var grid = el('div', 'g-pp-grid');
c.fields.forEach(function (f) {
grid.appendChild(buildField(c, f));
});
form.appendChild(grid);
u.msg = el('p', 'g-pp-msg');
u.msg.setAttribute('role', 'status');
form.appendChild(u.msg);
u.actions = el('div', 'g-pp-actions');
u.actions.hidden = true;
var save = el('button', 'g-btn');
save.type = 'submit';
i18n(save, 'pf.save');
u.cancel = el('button', 'g-btn g-btn--ghost');
u.cancel.type = 'button';
i18n(u.cancel, 'pf.cancel');
u.actions.appendChild(save);
u.actions.appendChild(u.cancel);
form.appendChild(u.actions);
root2.appendChild(form);
u.pen.addEventListener('click', function () {
openCard(c);
});
u.cancel.addEventListener('click', function () {
closeCard(c);
});
form.addEventListener('submit', function (e) {
e.preventDefault();
saveCard(c);
});
return root2;
}
function fillCard(c) {
var u = cardUi[c.id];
c.fields.forEach(function (f) {
var raw = saved[f.k] || '';
var text = G.profile.isChoice(f.k) ? G.profile.label(f.k, raw, G.getLang()) : raw;
u.vals[f.k].textContent = text || '—';
u.vals[f.k].className = 'g-pp-val' + (text ? '' : ' g-pp-val--empty');
u.inputs[f.k].value = raw;
if (u.inputs[f.k].tagName === 'TEXTAREA') {
autosize(u.inputs[f.k]);
}
});
if (u.inputs.phone) {
u.inputs.phone.readOnly = !!session();
}
}
function openCard(c) {
var u = cardUi[c.id];
fillCard(c);
u.root.setAttribute('data-mode', 'edit');
u.pen.hidden = true;
u.actions.hidden = false;
setMsg(u.msg, '');
c.fields.forEach(function (f) {
if (f.t === 'area') {
autosize(u.inputs[f.k]);
}
});
var first = c.fields.filter(function (f) {
return !(f.k === 'phone' && session());
})[0];
if (first) {
u.inputs[first.k].focus();
}
}
function closeCard(c) {
var u = cardUi[c.id];
fillCard(c);
u.root.setAttribute('data-mode', 'view');
u.pen.hidden = false;
u.actions.hidden = true;
setMsg(u.msg, '');
}
function saveCard(c) {
var u = cardUi[c.id];
var data = current();
var vals = {};
c.fields.forEach(function (f) {
if (f.k === 'phone' && session()) {
return;
}
vals[f.k] = String(u.inputs[f.k].value || '').trim();
});
if (vals.birth !== undefined) {
var b = normBirth(vals.birth);
if (b === null) {
setMsg(u.msg, 'pf.badBirth');
u.inputs.birth.focus();
return;
}
vals.birth = b;
}
var keys = ['phone', 'phone_alt'];
for (var i = 0; i < keys.length; i++) {
var k = keys[i];
if (vals[k]) {
var p = normPhone(vals[k]);
if (!validPhone(p)) {
setMsg(u.msg, 'pf.badPhone');
u.inputs[k].focus();
return;
}
vals[k] = p;
}
}
Object.keys(vals).forEach(function (k2) {
data[k2] = vals[k2];
});
if (!G.profile.save(data)) {
setMsg(u.msg, 'pf.fail');
return;
}
if (session()) {
G.sync.pushProfile(remoteProfile(data));
}
saved = current();
CARDS.forEach(function (cc) {
if (cardUi[cc.id] && cardUi[cc.id].root.getAttribute('data-mode') === 'view') {
fillCard(cc);
}
});
closeCard(c);
renderHero();
toast(G.t('pf.saved'));
}
function buildHelp() {
var card = el('section', 'g-pp-card g-pp-help');
var head = el('div', 'g-pp-card-head');
head.appendChild(i18n(el('h2', 'g-pp-card-title'), 'pf.help'));
card.appendChild(head);
var grid = el('div', 'g-pp-help-grid');
var social = G.config.social || {};
var admin = G.config.admin || social;
var a = el('div', 'g-pp-contact');
var aIco = el('div', 'g-pp-contact-ico');
aIco.appendChild(icon('headset'));
a.appendChild(aIco);
var aBody = el('div', 'g-pp-contact-body');
aBody.appendChild(i18n(el('h3', 'g-pp-contact-title'), 'pf.admin'));
aBody.appendChild(i18n(el('p', 'g-pp-contact-sub'), 'pf.adminSub'));
var aChips = el('div', 'g-pp-chips');
[chip('call', admin.call, 'pf.callBtn'), chip('whatsapp', admin.whatsapp)].forEach(function (x) {
if (x) {
aChips.appendChild(x);
}
});
aBody.appendChild(aChips);
a.appendChild(aBody);
grid.appendChild(a);
var d = el('div', 'g-pp-contact');
var dIco = el('div', 'g-pp-contact-ico');
if (G.config.photo) {
var img = el('img');
img.alt = '';
img.src = '../' + G.config.photo;
img.addEventListener('error', function () {
dIco.textContent = '';
dIco.appendChild(icon('code'));
});
dIco.appendChild(img);
} else {
dIco.appendChild(icon('code'));
}
d.appendChild(dIco);
var dBody = el('div', 'g-pp-contact-body');
dBody.appendChild(i18n(el('h3', 'g-pp-contact-title'), 'pf.dev'));
dBody.appendChild(el('p', 'g-pp-contact-sub', G.config.creator || ''));
var dChips = el('div', 'g-pp-chips');
['whatsapp', 'facebook', 'tiktok', 'instagram', 'website'].forEach(function (k) {
var x = chip(k, social[k]);
if (x) {
dChips.appendChild(x);
}
});
dBody.appendChild(dChips);
d.appendChild(dBody);
grid.appendChild(d);
card.appendChild(grid);
return card;
}
function row(iconName, titleKey, subKey, onClick, danger) {
var b = el('button', 'g-pp-row' + (danger ? ' g-pp-row--danger' : ''));
b.type = 'button';
var ic = el('span', 'g-pp-row-ico');
ic.appendChild(icon(iconName));
b.appendChild(ic);
var txt = el('span', 'g-pp-row-txt');
txt.appendChild(i18n(el('span', 'g-pp-row-title'), titleKey));
if (subKey) {
txt.appendChild(i18n(el('span', 'g-pp-row-sub'), subKey));
}
b.appendChild(txt);
b.appendChild(icon('chevron', 'g-pp-row-go'));
b.addEventListener('click', onClick);
return b;
}
function openPassword() {
dialog({
title: G.t('pf.pwTitle'),
build: function (body, close) {
var form = el('form', 'g-au-form g-pp-pwform');
form.noValidate = true;
var o = passField('pf.pwOld', 'current-password', 'old');
var n = passField('pf.pwNew', 'new-password', 'new');
var n2 = passField('pf.pwNew2', 'new-password', 'new2');
var msg = el('p', 'g-au-msg');
msg.setAttribute('role', 'status');
var rowEl = el('div', 'g-pp-actions');
var no = el('button', 'g-btn g-btn--ghost');
no.type = 'button';
i18n(no, 'pf.cancel');
no.addEventListener('click', close);
var go = el('button', 'g-btn');
go.type = 'submit';
i18n(go, 'pf.pwChange');
rowEl.appendChild(no);
rowEl.appendChild(go);
[o, n, n2].forEach(function (f) {
f.input.setAttribute('placeholder', G.t(f.input.getAttribute('data-ph')));
form.appendChild(f.box);
});
form.appendChild(msg);
form.appendChild(rowEl);
form.addEventListener('submit', function (e) {
e.preventDefault();
if (!o.input.value) {
setMsg(msg, 'pf.errOldPass');
return;
}
if (n.input.value.length < 6) {
setMsg(msg, 'pf.badPass');
return;
}
if (n.input.value !== n2.input.value) {
setMsg(msg, 'pf.passMismatch');
return;
}
go.disabled = true;
setMsg(msg, 'pf.wait');
G.sync.changePassword(o.input.value, n.input.value).then(function (res) {
go.disabled = false;
if (res.ok) {
close();
toast(G.t('pf.pwDone'));
} else if (res.error === 'unauthorized') {
close();
render();
toast(G.t('pf.sessionOver'));
} else {
setMsg(msg, res.error === 'bad_credentials' ? 'pf.errOldPass' : errKey(res.error));
}
});
});
body.appendChild(form);
}
});
}
function doLogout() {
G.sync.logout();
G.profile.clear();
showAuth();
toast(G.t('pf.loggedOutDone'));
}
function buildAccount() {
var card = el('section', 'g-pp-card g-pp-account');
var head = el('div', 'g-pp-card-head');
head.appendChild(i18n(el('h2', 'g-pp-card-title'), 'pf.sec.account'));
card.appendChild(head);
var list = el('div', 'g-pp-rows');
var s = session();
if (s) {
list.appendChild(row('key', 'pf.pwOpen', 'pf.pwOpenSub', openPassword));
}
list.appendChild(row('trash', 'pf.clear', 'pf.clearSub', function () {
dialog({
title: G.t('pf.clear'),
text: G.t('pf.confirmClear'),
yesLabel: G.t('pf.clear'),
onYes: function () {
G.profile.clear();
render();
toast(G.t('pf.cleared'));
}
});
}));
if (s) {
list.appendChild(row('logout', 'pf.logout', 'pf.logoutSub', function () {
dialog({
title: G.t('pf.logoutTitle'),
text: G.t('pf.confirmLogout'),
yesLabel: G.t('pf.logout'),
onYes: doLogout
});
}, true));
} else if (enabled()) {
list.appendChild(row('login', 'pf.goAuth', '', showAuth));
}
card.appendChild(list);
return card;
}
function buildDash() {
var page = el('div', 'g-pp-dash');
page.appendChild(buildHero());
if (enabled() && !session()) {
page.appendChild(buildBanner());
}
page.appendChild(buildTiles());
var grid = el('div', 'g-pp-cards');
cardUi = {};
CARDS.forEach(function (c) {
grid.appendChild(buildCard(c));
});
page.appendChild(grid);
page.appendChild(buildHelp());
page.appendChild(buildAccount());
return page;
}
function applyTexts() {
var phs = root.querySelectorAll('[data-ph]');
for (var i = 0; i < phs.length; i++) {
phs[i].setAttribute('placeholder', G.t(phs[i].getAttribute('data-ph')));
}
CARDS.forEach(function (c) {
var u = cardUi[c.id];
if (!u) {
return;
}
c.fields.forEach(function (f) {
if (f.ph) {
u.inputs[f.k].setAttribute('placeholder', G.t(f.ph));
}
if (f.t === 'select') {
fillSelect(u.inputs[f.k], f.k);
}
});
fillCard(c);
});
}
function render() {
closeDialog();
saved = current();
var s = session();
var auth = enabled() && !s && !localMode;
var viewName = auth ? 'auth' : 'dash';
if (lastView && lastView !== viewName) {
window.scrollTo(0, 0);
}
lastView = viewName;
document.body.setAttribute('data-view', viewName);
document.body.setAttribute('data-login', s ? '1' : '');
root.textContent = '';
ui = {};
if (auth) {
root.appendChild(buildAuth());
} else {
root.appendChild(buildDash());
renderHero();
}
applyTexts();
G.applyLang();
}
function onLang() {
applyTexts();
if (ui.heroPct) {
renderHero();
}
var msgs = root.querySelectorAll('[data-key]');
for (var i = 0; i < msgs.length; i++) {
var k = msgs[i].getAttribute('data-key');
if (k) {
msgs[i].textContent = G.t(k);
}
}
}
G.pageTitle = function () {
return G.t('pf.title') + ' - ' + G.t('site.name');
};
document.addEventListener('g:langchange', onLang);
render();
})();
