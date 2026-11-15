(function () {
G.form.init();
var id = document.querySelector('[name="member_id"]');
id.addEventListener('input', function () {
this.value = this.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
});
var BN = '০১২৩৪৫৬৭৮৯';
var ONES = ['শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আঠাশ', 'ঊনত্রিশ',
'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
'পঞ্চাশ', 'একান্ন', 'বাহান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'অষ্টাশি', 'ঊননব্বই',
'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'];
function digits(v) {
var out = '';
v = String(v || '');
for (var i = 0; i < v.length; i++) {
var c = v.charAt(i);
var k = BN.indexOf(c);
if (k > -1) {
out += String(k);
} else if (c >= '0' && c <= '9') {
out += c;
}
}
return out;
}
function bn(s) {
return s.replace(/[0-9]/g, function (d) {
return BN.charAt(Number(d));
});
}
function group(s) {
if (s.length <= 3) {
return s;
}
return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3);
}
function below1000(n) {
var h = Math.floor(n / 100);
var r = n % 100;
var out = [];
if (h) {
out.push(ONES[h] + 'শত');
}
if (r) {
out.push(ONES[r]);
}
return out.join(' ');
}
function words(n) {
if (n === 0) {
return ONES[0];
}
var out = [];
var crore = Math.floor(n / 10000000);
n = n % 10000000;
var lakh = Math.floor(n / 100000);
n = n % 100000;
var th = Math.floor(n / 1000);
n = n % 1000;
if (crore) {
out.push(words(crore) + ' কোটি');
}
if (lakh) {
out.push(ONES[lakh] + ' লক্ষ');
}
if (th) {
out.push(ONES[th] + ' হাজার');
}
if (n) {
out.push(below1000(n));
}
return out.join(' ');
}
var amt = document.querySelector('[name="amount"]');
var wd = document.querySelector('[name="amount_words"]');
function setWords() {
var s = digits(amt.value);
var v = s ? words(Number(s)) + ' টাকা মাত্র।' : '';
wd.style.fontSize = v.length > 38 ? '7pt' : (v.length > 30 ? '8pt' : '');
if (wd.value !== v) {
wd.value = v;
wd.dispatchEvent(new Event('g:filled'));
}
}
function clean() {
var raw = amt.value;
var pos = amt.selectionStart;
var keep = digits(raw.slice(0, pos === null ? raw.length : pos)).length;
var v = bn(digits(raw).slice(0, 10));
if (v !== raw) {
amt.value = v;
try {
amt.setSelectionRange(Math.min(keep, v.length), Math.min(keep, v.length));
} catch (e) {}
}
}
function format() {
var s = digits(amt.value).slice(0, 10).replace(/^0+(?=\d)/, '');
var v = s ? bn(group(s)) + '/-' : '';
if (amt.value !== v) {
amt.value = v;
return true;
}
return false;
}
amt.addEventListener('input', function () {
clean();
setWords();
});
amt.addEventListener('blur', function () {
var changed = format();
setWords();
if (changed) {
amt.dispatchEvent(new Event('g:filled'));
}
});
amt.addEventListener('g:filled', function () {
format();
setWords();
});
format();
setWords();
var list = document.querySelectorAll('[data-mirror]');
Array.prototype.forEach.call(list, function (to) {
var from = document.querySelector('[name="' + to.getAttribute('data-mirror') + '"]');
function copy() {
to.value = from.value;
}
from.addEventListener('input', copy);
from.addEventListener('g:filled', copy);
copy();
});
G.form.multi = {
fix: function (name, value, final) {
if (name === 'member_id') {
return value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
}
if (name === 'amount') {
var s = digits(value).slice(0, 10);
if (!final) {
return bn(s);
}
s = s.replace(/^0+(?=\d)/, '');
return s ? bn(group(s)) + '/-' : '';
}
return value;
},
derive: function (unit) {
var a = unit.querySelector('[name="amount"]');
var w = unit.querySelector('[name="amount_words"]');
if (a) {
a.value = G.form.multi.fix('amount', a.value, true);
}
if (w) {
var s = digits(a ? a.value : '');
var v = s ? words(Number(s)) + ' টাকা মাত্র।' : '';
w.style.fontSize = v.length > 38 ? '7pt' : (v.length > 30 ? '8pt' : '');
w.value = v;
}
var mirrors = unit.querySelectorAll('[data-mirror]');
Array.prototype.forEach.call(mirrors, function (to) {
var from = unit.querySelector('[name="' + to.getAttribute('data-mirror') + '"]');
to.value = from ? from.value : '';
});
}
};
function align() {
Array.prototype.forEach.call(document.querySelectorAll('#g-pages .card'), function (card) {
var rows = [];
var max = 0;
Array.prototype.forEach.call(card.querySelectorAll('.rw'), function (rw) {
var ln = rw.querySelector('.ln');
var lab = ln && ln.querySelector('b');
var inp = ln && ln.querySelector('.g-in');
if (lab && inp) {
rows.push([lab, inp]);
max = Math.max(max, lab.offsetWidth);
}
});
rows.forEach(function (r) {
r[1].style.setProperty('--al', (max - r[0].offsetWidth + 2) + 'px');
});
});
}
align();
window.addEventListener('load', align);
if (document.fonts && document.fonts.ready) {
document.fonts.ready.then(align);
}
})();
