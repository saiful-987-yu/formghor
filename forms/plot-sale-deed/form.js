(function () {
G.form.init();
var GROUPS = {};
var page2 = document.querySelectorAll('.f-plot-sale-deed .g-page')[1];
var inner2 = page2 ? page2.querySelector('.g-page-inner') : null;
var witBoxes = page2 ? page2.querySelectorAll('.wit .sbox') : [];
var extraNode = document.querySelector('[name="extra_terms"]');
function extraLine() {
var lh = extraNode ? parseFloat(window.getComputedStyle(extraNode).lineHeight) : 0;
return lh > 0 ? lh : 28;
}
function clearCut() {
for (var c = 0; c < witBoxes.length; c++) {
witBoxes[c].style.height = '';
}
}
function overflow() {
if (!inner2) {
return 0;
}
return inner2.scrollHeight - inner2.clientHeight;
}
function fitExtra() {
extraNode.style.height = 'auto';
extraNode.style.height = extraNode.scrollHeight + 'px';
clearCut();
return overflow() <= extraLine() * 2 + 1;
}
function applyCut() {
if (!extraNode) {
return;
}
clearCut();
var over = overflow();
if (over > 0) {
var cut = Math.ceil(Math.min(over, extraLine() * 2));
for (var c = 0; c < witBoxes.length; c++) {
witBoxes[c].style.height = 'calc(30mm - ' + cut + 'px)';
}
}
}
var LIMITS = [
{ name: 'seller_address', max: 2 },
{ name: 'buyer_address', max: 2 },
{ name: 'wit1_address', max: 2 },
{ name: 'wit2_address', max: 2 },
{ name: 'price_words', max: 2 },
{ name: 'pay_mode', max: 2 },
{ name: 'extra_terms', max: 0 }
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
if (item.fit) {
return item.fit(item);
}
var n = lineCount(item.node);
return n === 0 || n <= allowed(item);
}
function enforce(item) {
var node = item.node;
if (fits(item)) {
item.last = node.value;
resize(node);
if (item.after) {
item.after();
}
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
if (item.after) {
item.after();
}
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
if (LIMITS[i].name === 'extra_terms') {
item.fit = fitExtra;
item.after = applyCut;
}
items.push(item);
if (item.group) {
byGroup[item.group] = byGroup[item.group] || [];
byGroup[item.group].push(item);
}
bindItem(item);
}
window.addEventListener('load', function () {
applyCut();
for (var j = 0; j < items.length; j++) {
items[j].last = '';
enforce(items[j]);
}
});
})();
