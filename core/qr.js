(function () {
var G = window.G = window.G || {};
var ECC = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
var BLK = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];
function rawModules(ver) {
var n = (16 * ver + 128) * ver + 64;
if (ver >= 2) {
var a = Math.floor(ver / 7) + 2;
n -= (25 * a - 10) * a - 55;
if (ver >= 7) {
n -= 36;
}
}
return n;
}
function dataWords(ver) {
return Math.floor(rawModules(ver) / 8) - ECC[ver] * BLK[ver];
}
function utf8(text) {
var s = unescape(encodeURIComponent(text));
var out = [];
for (var i = 0; i < s.length; i++) {
out.push(s.charCodeAt(i));
}
return out;
}
function gfMul(x, y) {
var z = 0;
for (var i = 7; i >= 0; i--) {
z = (z << 1) ^ ((z >>> 7) * 0x11D);
z ^= ((y >>> i) & 1) * x;
}
return z;
}
function rsDivisor(degree) {
var result = [];
for (var i = 0; i < degree; i++) {
result.push(0);
}
result[degree - 1] = 1;
var root = 1;
for (var d = 0; d < degree; d++) {
for (var j = 0; j < result.length; j++) {
result[j] = gfMul(result[j], root);
if (j + 1 < result.length) {
result[j] ^= result[j + 1];
}
}
root = gfMul(root, 2);
}
return result;
}
function rsRemainder(data, divisor) {
var result = [];
for (var i = 0; i < divisor.length; i++) {
result.push(0);
}
for (var k = 0; k < data.length; k++) {
var factor = data[k] ^ result.shift();
result.push(0);
for (var j = 0; j < divisor.length; j++) {
result[j] ^= gfMul(divisor[j], factor);
}
}
return result;
}
function interleave(data, ver) {
var numBlocks = BLK[ver];
var eccLen = ECC[ver];
var raw = Math.floor(rawModules(ver) / 8);
var shortCount = numBlocks - raw % numBlocks;
var shortLen = Math.floor(raw / numBlocks);
var divisor = rsDivisor(eccLen);
var blocks = [];
var k = 0;
for (var i = 0; i < numBlocks; i++) {
var dat = data.slice(k, k + shortLen - eccLen + (i < shortCount ? 0 : 1));
k += dat.length;
var ecc = rsRemainder(dat, divisor);
if (i < shortCount) {
dat.push(0);
}
blocks.push(dat.concat(ecc));
}
var out = [];
for (var c = 0; c < blocks[0].length; c++) {
for (var b = 0; b < blocks.length; b++) {
if (c !== shortLen - eccLen || b >= shortCount) {
out.push(blocks[b][c]);
}
}
}
return out;
}
function alignPositions(ver) {
if (ver === 1) {
return [];
}
var num = Math.floor(ver / 7) + 2;
var size = ver * 4 + 17;
var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (num * 2 - 2)) * 2;
var result = [6];
for (var pos = size - 7; result.length < num; pos -= step) {
result.splice(1, 0, pos);
}
return result;
}
function bit(value, i) {
return ((value >>> i) & 1) !== 0;
}
function build(ver, words) {
var size = ver * 4 + 17;
var mod = [];
var fn = [];
for (var y = 0; y < size; y++) {
var r1 = [];
var r2 = [];
for (var x = 0; x < size; x++) {
r1.push(false);
r2.push(false);
}
mod.push(r1);
fn.push(r2);
}
function setFn(x, y, dark) {
mod[y][x] = dark;
fn[y][x] = true;
}
function finder(cx, cy) {
for (var dy = -4; dy <= 4; dy++) {
for (var dx = -4; dx <= 4; dx++) {
var dist = Math.max(Math.abs(dx), Math.abs(dy));
var xx = cx + dx;
var yy = cy + dy;
if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
setFn(xx, yy, dist !== 2 && dist !== 4);
}
}
}
}
function align(cx, cy) {
for (var dy = -2; dy <= 2; dy++) {
for (var dx = -2; dx <= 2; dx++) {
setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
}
}
}
function formatBits(mask) {
var data = (0 << 3) | mask;
var rem = data;
for (var i = 0; i < 10; i++) {
rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
}
var bits = ((data << 10) | rem) ^ 0x5412;
for (var a = 0; a <= 5; a++) {
setFn(8, a, bit(bits, a));
}
setFn(8, 7, bit(bits, 6));
setFn(8, 8, bit(bits, 7));
setFn(7, 8, bit(bits, 8));
for (var b = 9; b < 15; b++) {
setFn(14 - b, 8, bit(bits, b));
}
for (var c = 0; c < 8; c++) {
setFn(size - 1 - c, 8, bit(bits, c));
}
for (var d = 8; d < 15; d++) {
setFn(8, size - 15 + d, bit(bits, d));
}
setFn(8, size - 8, true);
}
function versionBits() {
if (ver < 7) {
return;
}
var rem = ver;
for (var i = 0; i < 12; i++) {
rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
}
var bits = (ver << 12) | rem;
for (var j = 0; j < 18; j++) {
var on = bit(bits, j);
var a = size - 11 + j % 3;
var b = Math.floor(j / 3);
setFn(a, b, on);
setFn(b, a, on);
}
}
for (var t = 0; t < size; t++) {
setFn(6, t, t % 2 === 0);
setFn(t, 6, t % 2 === 0);
}
finder(3, 3);
finder(size - 4, 3);
finder(3, size - 4);
var pos = alignPositions(ver);
for (var p = 0; p < pos.length; p++) {
for (var q = 0; q < pos.length; q++) {
if (!((p === 0 && q === 0) || (p === 0 && q === pos.length - 1) || (p === pos.length - 1 && q === 0))) {
align(pos[p], pos[q]);
}
}
}
formatBits(0);
versionBits();
var idx = 0;
for (var right = size - 1; right >= 1; right -= 2) {
if (right === 6) {
right = 5;
}
for (var vert = 0; vert < size; vert++) {
for (var j2 = 0; j2 < 2; j2++) {
var xx = right - j2;
var upward = ((right + 1) & 2) === 0;
var yy = upward ? size - 1 - vert : vert;
if (!fn[yy][xx] && idx < words.length * 8) {
mod[yy][xx] = bit(words[idx >>> 3], 7 - (idx & 7));
idx++;
}
}
}
}
function applyMask(mask) {
for (var y2 = 0; y2 < size; y2++) {
for (var x2 = 0; x2 < size; x2++) {
var inv;
switch (mask) {
case 0: inv = (x2 + y2) % 2 === 0; break;
case 1: inv = y2 % 2 === 0; break;
case 2: inv = x2 % 3 === 0; break;
case 3: inv = (x2 + y2) % 3 === 0; break;
case 4: inv = (Math.floor(x2 / 3) + Math.floor(y2 / 2)) % 2 === 0; break;
case 5: inv = x2 * y2 % 2 + x2 * y2 % 3 === 0; break;
case 6: inv = (x2 * y2 % 2 + x2 * y2 % 3) % 2 === 0; break;
default: inv = ((x2 + y2) % 2 + x2 * y2 % 3) % 2 === 0;
}
if (!fn[y2][x2] && inv) {
mod[y2][x2] = !mod[y2][x2];
}
}
}
}
function penalty() {
var result = 0;
var dark = 0;
var line;
var run;
var i;
var j;
for (var dir = 0; dir < 2; dir++) {
for (i = 0; i < size; i++) {
run = 1;
line = [];
for (j = 0; j < size; j++) {
line.push(dir === 0 ? mod[i][j] : mod[j][i]);
}
for (j = 1; j < size; j++) {
if (line[j] === line[j - 1]) {
run++;
} else {
if (run >= 5) {
result += run - 2;
}
run = 1;
}
}
if (run >= 5) {
result += run - 2;
}
for (j = 0; j + 11 <= size; j++) {
var a = true;
var b = true;
var A = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
var B = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
for (var k = 0; k < 11; k++) {
var v = line[j + k] ? 1 : 0;
if (v !== A[k]) {
a = false;
}
if (v !== B[k]) {
b = false;
}
}
if (a) {
result += 40;
}
if (b) {
result += 40;
}
}
}
}
for (i = 0; i < size; i++) {
for (j = 0; j < size; j++) {
if (mod[i][j]) {
dark++;
}
if (i < size - 1 && j < size - 1 && mod[i][j] === mod[i][j + 1] && mod[i][j] === mod[i + 1][j] && mod[i][j] === mod[i + 1][j + 1]) {
result += 3;
}
}
}
var total = size * size;
result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
return result;
}
var best = 0;
var min = Infinity;
for (var m = 0; m < 8; m++) {
applyMask(m);
formatBits(m);
var score = penalty();
if (score < min) {
min = score;
best = m;
}
applyMask(m);
}
applyMask(best);
formatBits(best);
return mod;
}
function matrix(text) {
var bytes;
try {
bytes = utf8(text);
} catch (err) {
return null;
}
var ver;
var cap = 0;
for (ver = 1; ver <= 40; ver++) {
cap = dataWords(ver) * 8;
if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= cap) {
break;
}
}
if (ver > 40) {
return null;
}
var bits = [];
function put(value, len) {
for (var i = len - 1; i >= 0; i--) {
bits.push((value >>> i) & 1);
}
}
put(4, 4);
put(bytes.length, ver < 10 ? 8 : 16);
for (var i = 0; i < bytes.length; i++) {
put(bytes[i], 8);
}
put(0, Math.min(4, cap - bits.length));
put(0, (8 - bits.length % 8) % 8);
for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) {
put(pad, 8);
}
var words = [];
for (var w = 0; w < bits.length; w += 8) {
var v = 0;
for (var k = 0; k < 8; k++) {
v = (v << 1) | bits[w + k];
}
words.push(v);
}
return build(ver, interleave(words, ver));
}
function svg(text) {
var m = matrix(text);
if (!m) {
return '';
}
var border = 2;
var size = m.length;
var d = '';
for (var y = 0; y < size; y++) {
var x = 0;
while (x < size) {
if (m[y][x]) {
var start = x;
while (x < size && m[y][x]) {
x++;
}
d += 'M' + (start + border) + ',' + (y + border) + 'h' + (x - start) + 'v1h-' + (x - start) + 'z';
} else {
x++;
}
}
}
var full = size + border * 2;
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + full + ' ' + full + '" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="' + d + '"/></svg>';
}
function boxOf(node) {
return node && node.closest ? node.closest('[data-qr]') : null;
}
function refresh(box) {
if (!box) {
return;
}
var input = box.querySelector('.g-qr-in');
var view = box.querySelector('.g-qr-view');
var text = input.value.replace(/[\r\n]+/g, ' ').trim();
var markup = text ? svg(text) : '';
box.classList.toggle('g-qr--bad', !!text && !markup);
if (markup) {
if (document.activeElement === input) {
input.blur();
}
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
function edit(box) {
var input = box.querySelector('.g-qr-in');
box.querySelector('.g-qr-view').hidden = true;
input.hidden = false;
box.classList.remove('g-qr--on');
input.focus();
}
function refreshAll() {
var list = document.querySelectorAll('[data-qr]');
for (var i = 0; i < list.length; i++) {
refresh(list[i]);
}
}
document.addEventListener('keydown', function (e) {
var t = e.target;
if (!t || !t.classList) {
return;
}
if (t.classList.contains('g-qr-in') && e.key === 'Enter') {
e.preventDefault();
refresh(boxOf(t));
} else if (t.classList.contains('g-qr-view') && (e.key === 'Enter' || e.key === ' ')) {
e.preventDefault();
edit(boxOf(t));
}
});
document.addEventListener('focusout', function (e) {
if (e.target && e.target.classList && e.target.classList.contains('g-qr-in')) {
refresh(boxOf(e.target));
}
});
document.addEventListener('click', function (e) {
var view = e.target && e.target.closest ? e.target.closest('.g-qr-view') : null;
if (view) {
edit(boxOf(view));
}
});
document.addEventListener('g:filled', function (e) {
if (e.target && e.target.classList && e.target.classList.contains('g-qr-in')) {
refresh(boxOf(e.target));
}
}, true);
window.addEventListener('load', refreshAll);
G.qr = { svg: svg, matrix: matrix, refresh: refreshAll };
})();
