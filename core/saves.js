(function () {
var G = window.G = window.G || {};
var MAX = 10;
var cache = {};
var busy = {};
function key(slug) {
return 'f.' + slug + '.saves';
}
function uid() {
return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
function delKey(slug) {
return 'f.' + slug + '.saves.del';
}
function readDeleted(slug) {
try {
var raw = localStorage.getItem(delKey(slug));
var arr = raw ? JSON.parse(raw) : [];
return Array.isArray(arr) ? arr : [];
} catch (e) {
return [];
}
}
function markDeleted(slug, id) {
var arr = readDeleted(slug);
if (arr.indexOf(id) === -1) {
arr.push(id);
}
try {
localStorage.setItem(delKey(slug), JSON.stringify(arr.slice(-100)));
} catch (e) {}
}
function sigOf(data) {
function part(map) {
var src = map && typeof map === 'object' ? map : {};
return Object.keys(src).sort().map(function (k) {
return [k, src[k]];
});
}
var out = [part(data && data.fields), part(data && data.photos)];
var multi = data && Array.isArray(data.multi) ? data.multi : [];
if (multi.length) {
out.push(multi.map(function (p) {
return [part(p && p.fields), part(p && p.photos)];
}));
}
return JSON.stringify(out);
}
function valid(item) {
return item && typeof item.id === 'string' && typeof item.t === 'number' && item.fields && typeof item.fields === 'object';
}
function read(slug) {
if (cache[slug]) {
return cache[slug];
}
var list = [];
try {
var raw = localStorage.getItem(key(slug));
var arr = raw ? JSON.parse(raw) : [];
if (Array.isArray(arr)) {
list = arr.filter(valid);
}
} catch (e) {}
cache[slug] = list;
return list;
}
function write(slug, list) {
var sorted = list.slice().sort(function (a, b) {
return b.t - a.t;
}).slice(0, MAX);
try {
localStorage.setItem(key(slug), JSON.stringify(sorted));
} catch (e) {
return false;
}
cache[slug] = sorted;
return true;
}
function notify(slug) {
document.dispatchEvent(new CustomEvent('g:saveschange', { detail: { slug: slug } }));
}
function mark(slug, id) {
var list = read(slug).slice();
for (var i = 0; i < list.length; i++) {
if (list[i].id === id) {
list[i].sync = 1;
}
}
write(slug, list);
}
function cleanMap(src, pattern) {
var out = {};
if (!src || typeof src !== 'object') {
return out;
}
var keys = Object.keys(src);
for (var i = 0; i < keys.length; i++) {
if (typeof src[keys[i]] === 'string' && (!pattern || pattern.test(src[keys[i]]))) {
out[keys[i]] = src[keys[i]];
}
}
return out;
}
function cleanMulti(src) {
var out = [];
var arr = Array.isArray(src) ? src.slice(0, 29) : [];
for (var i = 0; i < arr.length; i++) {
if (arr[i] && typeof arr[i] === 'object') {
out.push({ fields: cleanMap(arr[i].fields), photos: cleanMap(arr[i].photos, /^data:image\/jpeg;base64,/) });
}
}
return out;
}
function tooBig(item) {
return JSON.stringify({ __m: 1, f: item.fields, m: item.multi.map(function (p) {
return p.fields;
}) }).length > 46000;
}
function makeItem(id, data, name) {
var item = { id: id, t: Date.now(), name: String(name || ''), fields: data.fields || {}, photos: data.photos || {}, sync: 0 };
var multi = cleanMulti(data.multi);
if (multi.length) {
item.multi = multi;
if (tooBig(item)) {
item.big = 1;
}
}
return item;
}
function hasPhotos(item) {
if (Object.keys(item.photos).length) {
return true;
}
return (item.multi || []).some(function (p) {
return Object.keys(p.photos).length > 0;
});
}
function dropPhotos(item) {
item.photos = {};
if (item.multi) {
item.multi = item.multi.map(function (p) {
return { fields: p.fields, photos: {} };
});
}
item.noPhoto = true;
}
function persons(item) {
var n = item && Array.isArray(item.multi) ? item.multi.length : 0;
if (item && ((item.fields && Object.keys(item.fields).length) || (item.photos && Object.keys(item.photos).length))) {
n++;
}
return n;
}
function markBig(slug, id) {
var list = read(slug).slice();
for (var i = 0; i < list.length; i++) {
if (list[i].id === id) {
list[i].big = 1;
}
}
write(slug, list);
}
function merge(slug, incoming) {
var list = read(slug).slice();
var known = {};
for (var i = 0; i < list.length; i++) {
known[list[i].id] = true;
}
var gone = readDeleted(slug);
for (var d = 0; d < gone.length; d++) {
known[gone[d]] = true;
}
var added = false;
for (var j = 0; j < incoming.length; j++) {
var s = incoming[j];
if (!s || typeof s.id !== 'string' || !/^[a-z0-9]{6,40}$/.test(s.id) || known[s.id] || typeof s.t !== 'number') {
continue;
}
var rec = {
id: s.id,
t: s.t,
name: typeof s.name === 'string' ? s.name.slice(0, 60) : '',
fields: cleanMap(s.fields),
photos: cleanMap(s.photos, /^data:image\/jpeg;base64,/),
sync: 1
};
var extra = cleanMulti(s.multi);
if (extra.length) {
rec.multi = extra;
}
list.push(rec);
added = true;
}
if (added && write(slug, list)) {
notify(slug);
}
}
function sendMulti(session, slug, item, done) {
var jobs = [];
item.multi.forEach(function (p, i) {
Object.keys(p.photos || {}).forEach(function (k) {
jobs.push([('m' + (i + 1) + '_' + k).slice(0, 40), p.photos[k]]);
});
});
function verdict(res) {
if (res && res.ok) {
return 'ok';
}
return res && res.error === 'bad_request' ? 'bad' : 'wait';
}
function batch() {
if (!jobs.length) {
done('ok');
return;
}
var map = {};
jobs.splice(0, 5).forEach(function (j) {
map[j[0]] = j[1];
});
G.sync.post({ action: 'saveFormPhotos', token: session.token, id: item.id, t: item.t, photos: map }).then(function (res) {
var v = verdict(res);
if (v === 'ok') {
batch();
} else {
done(v);
}
});
}
G.sync.post({
action: 'saveForm',
token: session.token,
slug: slug,
id: item.id,
name: item.name,
t: item.t,
fields: item.fields,
photos: item.photos,
multi: item.multi.map(function (p) {
return p.fields;
})
}).then(function (res) {
var v = verdict(res);
if (v === 'ok') {
batch();
} else {
done(v);
}
});
}
function sync(slug, onDone, noPull) {
function leave() {
if (typeof onDone === 'function') {
onDone();
}
}
if (busy[slug] || !G.sync || !G.sync.enabled() || navigator.onLine === false) {
leave();
return;
}
var session = G.sync.getSession();
if (!session) {
leave();
return;
}
busy[slug] = true;
var queue = read(slug).filter(function (item) {
return !item.sync && !item.big;
});
function finish() {
busy[slug] = false;
leave();
}
function pull() {
var have = read(slug).map(function (item) {
return item.id;
}).slice(0, 30);
G.sync.post({ action: 'listSaves', token: session.token, slug: slug, have: have }).then(function (res) {
if (res && res.ok && Array.isArray(res.saves)) {
merge(slug, res.saves);
}
finish();
});
}
function next() {
if (!queue.length) {
if (noPull) {
finish();
} else {
pull();
}
return;
}
var item = queue.shift();
if (item.multi && item.multi.length) {
sendMulti(session, slug, item, function (state) {
if (state === 'ok') {
mark(slug, item.id);
next();
} else if (state === 'bad') {
markBig(slug, item.id);
next();
} else {
finish();
}
});
return;
}
G.sync.post({
action: 'saveForm',
token: session.token,
slug: slug,
id: item.id,
name: item.name,
t: item.t,
fields: item.fields,
photos: item.photos
}).then(function (res) {
if (res && res.ok) {
mark(slug, item.id);
next();
} else {
finish();
}
});
}
next();
}
var allBusy = false;
function knownSlugs() {
var out = [];
var forms = window.G_FORMS || [];
for (var i = 0; i < forms.length; i++) {
if (forms[i] && /^[a-z0-9-]{1,60}$/.test(forms[i].slug || '') && out.indexOf(forms[i].slug) === -1) {
out.push(forms[i].slug);
}
}
return out;
}
function syncAll(onDone) {
function leave() {
allBusy = false;
if (typeof onDone === 'function') {
onDone();
}
}
if (allBusy || !G.sync || !G.sync.enabled() || !G.sync.getSession() || navigator.onLine === false) {
if (typeof onDone === 'function') {
onDone();
}
return;
}
allBusy = true;
var slugs = knownSlugs();
var index = 0;
var rounds = 0;
function pull() {
var session = G.sync.getSession();
if (!session) {
leave();
return;
}
var have = [];
slugs.forEach(function (slug) {
read(slug).forEach(function (item) {
have.push(item.id);
});
readDeleted(slug).forEach(function (id) {
have.push(id);
});
});
G.sync.post({ action: 'listAllSaves', token: session.token, have: have.slice(-400) }).then(function (res) {
if (!res || !res.ok || !Array.isArray(res.saves)) {
leave();
return;
}
var groups = {};
res.saves.forEach(function (item) {
if (item && typeof item.slug === 'string' && slugs.indexOf(item.slug) !== -1) {
(groups[item.slug] = groups[item.slug] || []).push(item);
}
});
Object.keys(groups).forEach(function (slug) {
merge(slug, groups[slug]);
});
rounds++;
if (res.more && res.saves.length && rounds < 6) {
pull();
} else {
leave();
}
});
}
function push() {
if (index >= slugs.length) {
pull();
return;
}
var slug = slugs[index++];
var waiting = read(slug).some(function (item) {
return !item.sync;
});
if (waiting) {
sync(slug, push, true);
} else {
push();
}
}
push();
}
var LINK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';
var COPY_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
var SEND_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/></svg>';
var STOP_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>';
var shareToastTimer = 0;
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
function toast(message) {
var node = document.getElementById('g-toast');
if (!node) {
node = el('div', 'g-toast');
node.id = 'g-toast';
node.setAttribute('role', 'status');
node.setAttribute('aria-live', 'polite');
document.body.appendChild(node);
}
node.textContent = message;
node.classList.add('g-toast--show');
window.clearTimeout(shareToastTimer);
shareToastTimer = window.setTimeout(function () {
node.classList.remove('g-toast--show');
}, 2800);
}
function bnDigits(text) {
if (G.getLang() !== 'bn') {
return text;
}
return text.replace(/\d/g, function (c) {
return '০১২৩৪৫৬৭৮৯'.charAt(Number(c));
});
}
function iconButton(svg, text, label, ghost) {
var btn = el('button', ghost ? 'g-btn g-btn--ghost' : 'g-btn');
btn.type = 'button';
btn.setAttribute('aria-label', label);
btn.setAttribute('title', label);
btn.innerHTML = svg + '<span></span>';
btn.lastChild.textContent = text;
return btn;
}
function loadBar() {
var bar = el('i', 'g-lnk-bar');
bar.setAttribute('role', 'progressbar');
bar.setAttribute('aria-busy', 'true');
return bar;
}
function shareUrl(slug, code) {
var root = window.location.pathname.replace(/(forms\/[^\/]+\/|saved\/|favorites\/|profile\/)?(index\.html)?$/, '');
return window.location.origin + root + 'forms/' + slug + '/?s=' + code;
}
function copyLink(text, done) {
function legacy() {
try {
var area = document.createElement('textarea');
area.value = text;
area.setAttribute('readonly', '');
area.style.position = 'fixed';
area.style.top = '0';
area.style.opacity = '0';
document.body.appendChild(area);
area.select();
area.setSelectionRange(0, text.length);
var ok = document.execCommand('copy');
document.body.removeChild(area);
return ok;
} catch (e) {
return false;
}
}
if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
navigator.clipboard.writeText(text).then(function () {
done(true);
}, function () {
done(legacy());
});
return;
}
done(legacy());
}
function shareError(code) {
var map = {
wrong_password: 'lnk.err.pass',
too_many: 'lnk.err.many',
limit: 'lnk.err.limit',
not_configured: 'lnk.err.conf',
not_found: 'lnk.err.unsynced',
network: 'lnk.err.net'
};
return G.t(map[code] || 'lnk.err.net');
}
function openShare(item, slug) {
var session = G.sync && G.sync.getSession ? G.sync.getSession() : null;
if (!session) {
toast(G.t('lnk.needLogin'));
return;
}
if (!item.sync) {
toast(G.t('lnk.err.unsynced'));
return;
}
G.modal.open({
title: G.t('lnk.title'),
note: G.t('lnk.note'),
build: function (body, close) {
function clear() {
while (body.firstChild) {
body.removeChild(body.firstChild);
}
}
function showLink(code) {
clear();
var url = shareUrl(slug, code);
var field = el('input', 'g-lnk-input');
field.type = 'text';
field.readOnly = true;
field.value = url;
field.addEventListener('focus', function () {
field.select();
});
body.appendChild(field);
var row = el('div', 'g-lnk-row');
var copy = iconButton(COPY_SVG, G.t('lnk.copyS'), G.t('lnk.copy'), false);
copy.addEventListener('click', function () {
copyLink(url, function (ok) {
toast(G.t(ok ? 'lnk.copied' : 'lnk.err.copy'));
});
});
row.appendChild(copy);
if (navigator.share) {
var send = iconButton(SEND_SVG, G.t('lnk.sendS'), G.t('lnk.send'), true);
send.addEventListener('click', function () {
navigator.share({ title: document.title, url: url }).catch(function () {});
});
row.appendChild(send);
}
var stop = iconButton(STOP_SVG, G.t('lnk.revokeS'), G.t('lnk.revoke'), true);
stop.addEventListener('click', function () {
close();
G.modal.confirm({
title: G.t('lnk.cf.t'),
text: G.t('lnk.cf.x'),
onYes: function () {
toast(G.t('lnk.revoking'));
G.sync.post({ action: 'revokeShare', token: session.token, code: code }).then(function (res) {
toast(res && res.ok ? G.t('lnk.revoked') : shareError(res && res.error));
});
},
onCancel: function () {
openShare(item, slug);
}
});
});
row.appendChild(stop);
body.appendChild(row);
}
function showCreate() {
clear();
var pass = el('input', 'g-lnk-input');
pass.type = 'password';
pass.autocomplete = 'off';
pass.placeholder = G.t('lnk.pass');
body.appendChild(pass);
var msg = el('p', 'g-lnk-err');
body.appendChild(msg);
var row = el('div', 'g-lnk-row g-lnk-row--one');
var make = el('button', 'g-btn', G.t('lnk.create'));
make.type = 'button';
var busy = false;
function setBusy(on) {
busy = on;
pass.disabled = on;
make.disabled = on;
var old = body.querySelector('.g-lnk-bar');
if (old) {
old.parentNode.removeChild(old);
}
if (on) {
body.appendChild(loadBar());
}
}
function submit() {
if (busy) {
return;
}
if (!pass.value.trim() || !(window.G.lock && G.lock.verify(slug, pass.value))) {
msg.textContent = G.t('lnk.err.pass');
return;
}
msg.textContent = G.t('lnk.working');
msg.className = 'g-lnk-err g-lnk-err--info';
setBusy(true);
G.sync.post({ action: 'createShare', token: session.token, id: item.id, password: pass.value.trim() }).then(function (res) {
if (res && res.ok && res.code) {
showLink(res.code);
return;
}
setBusy(false);
msg.className = 'g-lnk-err';
msg.textContent = shareError(res && res.error);
pass.focus();
});
}
make.addEventListener('click', submit);
pass.addEventListener('keydown', function (e) {
if (e.key === 'Enter') {
e.preventDefault();
submit();
}
});
row.appendChild(make);
body.appendChild(row);
pass.focus();
}
var status = el('p', 'g-modal-text', G.t('lnk.loading'));
body.appendChild(status);
body.appendChild(loadBar());
G.sync.post({ action: 'listShares', token: session.token }).then(function (res) {
if (!res || !res.ok || !Array.isArray(res.shares)) {
status.textContent = shareError(res && res.error);
var spin = body.querySelector('.g-lnk-bar');
if (spin) {
spin.parentNode.removeChild(spin);
}
return;
}
var code = '';
for (var i = 0; i < res.shares.length; i++) {
if (res.shares[i].id === item.id) {
code = res.shares[i].code;
}
}
if (code) {
showLink(code);
} else {
showCreate();
}
});
}
});
}
function hint(item, slug) {
var all = read(slug).slice().sort(function (a, b) {
return a.t - b.t;
});
var num = 1;
for (var i = 0; i < all.length; i++) {
if (all[i].id === item.id) {
num = i + 1;
}
}
var parts = [];
var fields = item.fields || {};
var keys = Object.keys(fields);
var own = String(item.name || '').trim();
for (var k = 0; k < keys.length && parts.length < 2; k++) {
var v = String(fields[keys[k]] || '').trim();
if (v && v !== own && v.length <= 20 && v.indexOf('\n') === -1) {
parts.push(v);
}
}
return { num: num, extra: parts.join(' · ') };
}
function badge(num) {
return el('span', 'g-num', '#' + bnDigits(String(num)));
}
var shareApi = { open: openShare, linkSvg: LINK_SVG };
G.saves = {
slugs: knownSlugs,
syncAll: syncAll,
list: function (slug) {
return read(slug).slice().sort(function (a, b) {
return b.t - a.t;
});
},
count: function (slug) {
return read(slug).length;
},
persons: persons,
add: function (slug, data, name) {
var item = makeItem(uid(), data, name);
var list = read(slug).slice();
list.unshift(item);
if (!write(slug, list)) {
if (!hasPhotos(item)) {
return null;
}
dropPhotos(item);
if (!write(slug, list)) {
return null;
}
}
notify(slug);
return item;
},
update: function (slug, id, data, name) {
var list = read(slug).slice();
var index = -1;
for (var i = 0; i < list.length; i++) {
if (list[i].id === id) {
index = i;
}
}
if (index === -1) {
return null;
}
var item = makeItem(id, data, name);
list[index] = item;
if (!write(slug, list)) {
if (!hasPhotos(item)) {
return null;
}
dropPhotos(item);
if (!write(slug, list)) {
return null;
}
}
notify(slug);
return item;
},
remove: function (slug, id) {
var list = read(slug).filter(function (item) {
return item.id !== id;
});
if (list.length === read(slug).length) {
return false;
}
markDeleted(slug, id);
write(slug, list);
cache[slug] = list;
if (G.sync && G.sync.pushDelete) {
G.sync.pushDelete(slug, id);
}
notify(slug);
return true;
},
sig: sigOf,
has: function (slug, data) {
var target = sigOf(data);
var list = read(slug);
for (var i = 0; i < list.length; i++) {
if (sigOf(list[i]) === target) {
return true;
}
}
return false;
},
sync: sync,
share: shareApi,
hint: hint,
badge: badge
};
window.addEventListener('online', function () {
var slug = document.body && document.body.getAttribute('data-form');
if (slug) {
sync(slug);
}
});
})();
