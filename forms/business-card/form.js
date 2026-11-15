(function () {
G.form.init();
var GROUPS = {};
var LIMITS = [
{ name: 'address', max: 2 }
];
var items = [];
var byGroup = {};
function resize(node) {
node.style.height = 'auto';
node.style.height = node.scrollHeight + 'px';
}
function lineCount(node) {
if (node.value === '') {
return 1;
}
var cs = window.getComputedStyle(node);
var lh = parseFloat(cs.lineHeight);
if (!(lh > 0)) {
lh = parseFloat(cs.fontSize) * 1.2;
}
var pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
var prev = node.style.height;
node.style.height = 'auto';
var h = node.scrollHeight - pad;
node.style.height = prev;
if (!(lh > 0) || !(h > 0)) {
return 0;
}
return Math.max(1, Math.round(h / lh));
}
function allowed(item) {
var cap = item.max;
if (item.group) {
var list = byGroup[item.group];
var rest = 0;
for (var i = 0; i < list.length; i++) {
if (list[i] !== item) {
rest += Math.max(1, lineCount(list[i].node));
}
}
cap = Math.min(cap, GROUPS[item.group] - rest);
}
return Math.max(1, cap);
}
function fits(item) {
var n = lineCount(item.node);
return n === 0 || n <= allowed(item);
}
function enforce(item) {
var node = item.node;
if (fits(item)) {
item.last = node.value;
resize(node);
return;
}
var cur = node.value;
var old = item.last;
var lim = Math.min(cur.length, old.length);
var p = 0;
while (p < lim && cur.charAt(p) === old.charAt(p)) {
p++;
}
var s = 0;
while (s < lim - p && cur.charAt(cur.length - 1 - s) === old.charAt(old.length - 1 - s)) {
s++;
}
var head = cur.slice(0, p);
var mid = cur.slice(p, cur.length - s);
var tail = cur.slice(cur.length - s);
var lo = 0;
var hi = mid.length;
while (lo < hi) {
var m = Math.ceil((lo + hi) / 2);
node.value = head + mid.slice(0, m) + tail;
if (fits(item)) {
lo = m;
} else {
hi = m - 1;
}
}
node.value = head + mid.slice(0, lo) + tail;
var caret = head.length + lo;
if (!fits(item)) {
var whole = node.value;
var a = 0;
var b = whole.length;
while (a < b) {
var k = Math.ceil((a + b) / 2);
node.value = whole.slice(0, k);
if (fits(item)) {
a = k;
} else {
b = k - 1;
}
}
node.value = whole.slice(0, a);
caret = a;
}
try {
node.setSelectionRange(caret, caret);
} catch (e) {}
item.last = node.value;
resize(node);
}
function bindItem(item) {
var node = item.node;
node.addEventListener('input', function (e) {
if (e.isComposing) {
return;
}
enforce(item);
});
node.addEventListener('compositionend', function () {
enforce(item);
});
node.addEventListener('blur', function () {
enforce(item);
});
node.addEventListener('g:filled', function () {
item.last = '';
enforce(item);
});
}
for (var i = 0; i < LIMITS.length; i++) {
var node = document.querySelector('[name="' + LIMITS[i].name + '"]');
if (!node) {
continue;
}
var item = { node: node, max: LIMITS[i].max, group: LIMITS[i].group || '', last: node.value };
items.push(item);
if (item.group) {
byGroup[item.group] = byGroup[item.group] || [];
byGroup[item.group].push(item);
}
bindItem(item);
}
window.addEventListener('load', function () {
for (var j = 0; j < items.length; j++) {
items[j].last = '';
enforce(items[j]);
}
});
var LOGO_NAMES = ['logo.svg', 'logo.png', 'logo.jpg', 'logo.jpeg', 'logo.webp'];
var defaultLogo = 'assets/logo.svg';
var logoBox = document.querySelector('.f-business-card .lgo');
var logoWrap = document.querySelector('.f-business-card .lgw');
function field(name) {
return document.querySelector('[name="' + name + '"]');
}
function syncLogo() {
var up = logoBox ? logoBox.querySelector('img') : null;
var uploaded = up && up.getAttribute('src') ? up.getAttribute('src') : '';
var src = uploaded || defaultLogo;
var list = document.querySelectorAll('.f-business-card img.bc-logo');
for (var i = 0; i < list.length; i++) {
var target = list[i].classList.contains('lgd') ? defaultLogo : src;
if (list[i].getAttribute('src') !== target) {
list[i].setAttribute('src', target);
}
}
if (logoWrap) {
logoWrap.classList.toggle('has-up', !!uploaded);
}
}
function probeLogo(i) {
if (i >= LOGO_NAMES.length) {
return;
}
var im = new Image();
im.onload = function () {
defaultLogo = 'assets/' + LOGO_NAMES[i];
syncLogo();
};
im.onerror = function () {
probeLogo(i + 1);
};
im.src = 'assets/' + LOGO_NAMES[i];
}
if (logoBox && window.MutationObserver) {
new MutationObserver(syncLogo).observe(logoBox, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'class'] });
}
probeLogo(0);
var measure = document.createElement('canvas').getContext('2d');
function fitInput(el) {
var cs = window.getComputedStyle(el);
measure.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
var text = el.value || el.placeholder || '';
if (cs.textTransform === 'uppercase') {
text = text.toUpperCase();
}
var spacing = parseFloat(cs.letterSpacing) || 0;
el.style.width = Math.ceil(measure.measureText(text).width + spacing * text.length + 2) + 'px';
}
function mirrorBrand() {
var spans = document.querySelectorAll('[data-mirror]');
for (var i = 0; i < spans.length; i++) {
var src = field(spans[i].getAttribute('data-mirror'));
spans[i].textContent = src ? src.value : '';
}
var ins = document.querySelectorAll('.f-business-card .fl .bn .g-in');
for (var j = 0; j < ins.length; j++) {
fitInput(ins[j]);
}
}
function digitsOf(value) {
return String(value || '').replace(/[\u09e6-\u09ef]/g, function (d) {
return String('\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef'.indexOf(d));
}).replace(/[^\d+]/g, '');
}
function phoneE164(value) {
var d = digitsOf(value);
if (!d) {
return '';
}
if (d.charAt(0) === '+') {
return d;
}
if (d.indexOf('00') === 0) {
return '+' + d.slice(2);
}
if (d.indexOf('880') === 0) {
return '+' + d;
}
if (d.charAt(0) === '0') {
return '+88' + d;
}
return d;
}
function vEsc(text) {
return String(text).replace(/\\/g, '\\\\').replace(/[,;]/g, function (c) {
return '\\' + c;
}).replace(/[\r\n]+/g, ' ');
}
function updateContactQr() {
var view = document.querySelector('.f-business-card .qfv');
if (!view) {
return;
}
var wrap = view.parentNode;
var phone = field('phone');
var name = field('name');
var tel = phoneE164(phone ? phone.value : '');
var markup = '';
if (tel && G.qr && G.qr.svg) {
var fn = (name && name.value.trim()) || tel;
markup = G.qr.svg('BEGIN:VCARD\nVERSION:3.0\nFN:' + vEsc(fn) + '\nTEL;TYPE=CELL:' + tel + '\nEND:VCARD');
}
view.innerHTML = markup;
view.hidden = !markup;
wrap.classList.toggle('on', !!markup);
}
function refreshAll() {
mirrorBrand();
updateContactQr();
}
document.addEventListener('input', function (e) {
var n = e.target && e.target.getAttribute ? e.target.getAttribute('name') : '';
if (n === 'brand_a' || n === 'brand_b') {
mirrorBrand();
} else if (n === 'name' || n === 'phone') {
updateContactQr();
}
});
document.addEventListener('g:filled', refreshAll, true);
window.addEventListener('load', function () {
refreshAll();
syncLogo();
if (document.fonts && document.fonts.ready) {
document.fonts.ready.then(mirrorBrand);
}
});
})();
