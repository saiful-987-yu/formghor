(function () {
G.form.init();
var table = document.querySelector('.f-union-member-apply .tb');
var nodes = [document.querySelector('[name="address_permanent"]'), document.querySelector('[name="address_present"]')];
var items = [];
function isSmall() {
return table.classList.contains('addr-small');
}
function setSmall(on) {
if (on) {
table.classList.add('addr-small');
} else {
table.classList.remove('addr-small');
}
}
function rawLines(node) {
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
function linesAt(node, small) {
var was = isSmall();
setSmall(small);
var n = rawLines(node);
setSmall(was);
return n;
}
function resizeAll() {
for (var i = 0; i < items.length; i++) {
items[i].node.style.height = 'auto';
items[i].node.style.height = items[i].node.scrollHeight + 'px';
}
}
function applyMode() {
var small = false;
for (var i = 0; i < items.length; i++) {
if (linesAt(items[i].node, false) > 2) {
small = true;
}
}
setSmall(small);
resizeAll();
}
function fits(item) {
var n = linesAt(item.node, true);
return n === 0 || n <= 4;
}
function enforce(item) {
var node = item.node;
if (fits(item)) {
item.last = node.value;
applyMode();
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
applyMode();
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
if (table) {
for (var i = 0; i < nodes.length; i++) {
if (nodes[i]) {
var item = { node: nodes[i], last: nodes[i].value };
items.push(item);
bindItem(item);
}
}
window.addEventListener('load', function () {
for (var j = 0; j < items.length; j++) {
items[j].last = '';
enforce(items[j]);
}
});
}
})();
