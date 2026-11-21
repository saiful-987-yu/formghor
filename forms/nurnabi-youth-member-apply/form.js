(function () {
G.form.init();
var logo = document.querySelector('.f-nurnabi-youth-member-apply .logo');
var img = logo ? logo.querySelector('img') : null;
if (img) {
var list = ['assets/logo.png', 'assets/logo.jpg', 'assets/logo.jpeg', 'assets/logo.webp', 'assets/logo.svg'];
var at = 0;
img.addEventListener('error', function () {
at++;
if (at < list.length) {
img.src = list[at];
} else {
logo.classList.add('empty');
}
});
img.src = list[0];
}
var node = document.querySelector('[name="address"]');
var last = '';
function rawLines() {
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
function fits() {
var n = rawLines();
return n === 0 || n <= 2;
}
function enforce() {
if (fits()) {
last = node.value;
return;
}
var cur = node.value;
var old = last;
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
if (fits()) {
lo = m;
} else {
hi = m - 1;
}
}
node.value = head + mid.slice(0, lo) + tail;
var caret = head.length + lo;
if (!fits()) {
var whole = node.value;
var a = 0;
var b = whole.length;
while (a < b) {
var k = Math.ceil((a + b) / 2);
node.value = whole.slice(0, k);
if (fits()) {
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
last = node.value;
}
if (node) {
node.addEventListener('input', function (e) {
if (e.isComposing) {
return;
}
enforce();
});
node.addEventListener('compositionend', enforce);
node.addEventListener('blur', enforce);
node.addEventListener('g:filled', function () {
last = '';
enforce();
});
window.addEventListener('load', function () {
last = '';
enforce();
});
}
})();
