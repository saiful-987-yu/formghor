(function () {
var G = window.G = window.G || {};
var MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var DIGITS_BN = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
var BANGLA_MONTHS = ['বৈশা', 'জ্যৈ', 'আষা', 'শ্রাব', 'ভাদ্র', 'আশ্ব', 'কার্তি', 'অগ্র', 'পৌষ', 'মাঘ', 'ফাল্গু', 'চৈত্র'];
var BANGLA_STARTS = [[0, 15, 9], [1, 14, 10], [2, 15, 11], [3, 14, 0], [4, 15, 1], [5, 15, 2], [6, 16, 3], [7, 16, 4], [8, 16, 5], [9, 17, 6], [10, 16, 7], [11, 16, 8]];
var HIJRI_MONTHS = ['মুহাররম', 'সফর', 'রবি-আউ', 'রবি-সানি', 'জমা-আউ', 'জমা-সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'];
var WEEK_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
var WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var GREG_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
var GREG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var BANGLA_FULL_BN = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
var BANGLA_FULL_EN = ['Boishakh', 'Joishtho', 'Ashar', 'Srabon', 'Bhadro', 'Ashwin', 'Kartik', 'Ogrohayon', 'Poush', 'Magh', 'Falgun', 'Choitro'];
var HIJRI_FULL_BN = ['মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'];
var HIJRI_FULL_EN = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'];
var toastTimer = null;
function pad(n) {
return n < 10 ? '0' + n : String(n);
}
function toBn(text) {
return String(text).replace(/\d/g, function (d) {
return DIGITS_BN[Number(d)];
});
}
function isBn() {
return G.getLang() === 'bn';
}
function ordinalEn(n) {
var v = n % 100;
if (v >= 11 && v <= 13) {
return n + 'th';
}
return n + (['th', 'st', 'nd', 'rd'][n % 10] || 'th');
}
function sayDate(now, day, monthIndex, year, kind) {
var wd = now.getDay();
if (isBn()) {
var monthsBn = kind === 'bangla' ? BANGLA_FULL_BN : kind === 'hijri' ? HIJRI_FULL_BN : GREG_BN;
var era = kind === 'bangla' ? 'বঙ্গাব্দ' : kind === 'hijri' ? 'হিজরি' : 'খ্রিস্টাব্দ';
return 'আজ ' + WEEK_BN[wd] + ', ' + monthsBn[monthIndex] + ' মাসের ' + toBn(day) + ' তারিখ, ' + toBn(year) + ' ' + era;
}
var monthsEn = kind === 'bangla' ? BANGLA_FULL_EN : kind === 'hijri' ? HIJRI_FULL_EN : GREG_EN;
var tail = kind === 'bangla' ? ' in the Bengali calendar' : kind === 'hijri' ? ' in the Hijri calendar' : '';
return 'Today is ' + WEEK_EN[wd] + ', the ' + ordinalEn(day) + ' of ' + monthsEn[monthIndex] + ', ' + year + tail + '.';
}
function sayTime(now) {
var h24 = now.getHours();
var m = now.getMinutes();
var t = h24 * 60 + m;
var h12 = h24 % 12 || 12;
if (isBn()) {
var period = 'রাত';
if (t >= 240 && t < 360) {
period = 'ভোর';
} else if (t >= 360 && t < 720) {
period = 'সকাল';
} else if (t >= 720 && t < 900) {
period = 'দুপুর';
} else if (t >= 900 && t < 1050) {
period = 'বিকেল';
} else if (t >= 1050 && t < 1140) {
period = 'সন্ধ্যা';
}
return 'এখন সময় ' + period + ' ' + toBn(h12) + 'টা' + (m ? ' ' + toBn(m) + ' মিনিট' : '');
}
var periodEn = 'at night';
if (t >= 300 && t < 720) {
periodEn = 'in the morning';
} else if (t >= 720 && t < 1020) {
periodEn = 'in the afternoon';
} else if (t >= 1020 && t < 1260) {
periodEn = 'in the evening';
}
return 'The time is now ' + (m ? h12 + ':' + pad(m) : h12 + " o'clock") + ' ' + periodEn + '.';
}
function speak(text) {
if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
return;
}
try {
window.speechSynthesis.cancel();
var utter = new SpeechSynthesisUtterance(text);
utter.lang = isBn() ? 'bn-BD' : 'en-US';
window.speechSynthesis.speak(utter);
} catch (e) {}
}
function toast(text) {
var node = document.getElementById('g-toast');
if (!node) {
node = document.createElement('div');
node.id = 'g-toast';
node.className = 'g-toast';
node.setAttribute('role', 'status');
node.setAttribute('aria-live', 'polite');
document.body.appendChild(node);
}
node.textContent = text;
node.classList.add('g-toast--show');
window.clearTimeout(toastTimer);
toastTimer = window.setTimeout(function () {
node.classList.remove('g-toast--show');
}, 4000);
}
function announce(text) {
if (!text) {
return;
}
speak(text);
toast(text);
}
function span(className, text) {
var node = document.createElement('span');
node.className = className;
if (text) {
node.textContent = text;
}
return node;
}
function paintSide(node, day, month, year) {
node.textContent = '';
node.appendChild(span('g-clock-num', toBn(pad(day))));
node.appendChild(span('g-clock-month', month));
node.appendChild(span('g-clock-num', toBn(year)));
}
function banglaDate(now) {
var y = now.getFullYear();
var m = now.getMonth();
var d = now.getDate();
var start = null;
for (var i = BANGLA_STARTS.length - 1; i >= 0; i--) {
var s = BANGLA_STARTS[i];
if (m > s[0] || (m === s[0] && d >= s[1])) {
start = s;
break;
}
}
var startDate;
if (start) {
startDate = Date.UTC(y, start[0], start[1]);
} else {
start = BANGLA_STARTS[BANGLA_STARTS.length - 1];
startDate = Date.UTC(y - 1, start[0], start[1]);
}
var day = Math.round((Date.UTC(y, m, d) - startDate) / 86400000) + 1;
var year = (m > 3 || (m === 3 && d >= 14)) ? y - 593 : y - 594;
return { day: day, month: start[2], year: year };
}
function hijriDate(now) {
try {
var shifted = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12);
var fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
var out = {};
fmt.formatToParts(shifted).forEach(function (p) {
out[p.type] = p.value;
});
var day = parseInt(out.day, 10);
var month = parseInt(out.month, 10);
var year = parseInt(out.year, 10);
if (!day || !month || !year) {
return null;
}
return { day: day, month: month - 1, year: year };
} catch (e) {
return null;
}
}
var LONG_PRESS_MS = 600;
function num(n) {
return isBn() ? toBn(n) : String(n);
}
function grouped(n) {
return num(Number(n).toLocaleString('en-US'));
}
function daysIn(y, m) {
return new Date(y, m + 1, 0).getDate();
}
function dayDiff(a, b) {
return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);
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
function makeSelect(label) {
var sel = el('select', 'g-age-sel');
sel.setAttribute('aria-label', label);
var first = el('option', '', label);
first.value = '';
sel.appendChild(first);
return sel;
}
function addOption(sel, value, text) {
var opt = el('option', '', text);
opt.value = String(value);
sel.appendChild(opt);
}
function statBox(label, value) {
var box = el('div', 'g-age-stat');
box.appendChild(el('span', '', label));
box.appendChild(el('b', '', value));
return box;
}
function infoRow(label, value) {
var row = el('div', 'g-age-line');
row.appendChild(el('span', '', label));
row.appendChild(el('b', '', value));
return row;
}
function ageParts(now, y, m, d, hh, mi) {
var yy = now.getFullYear() - y;
var mm = now.getMonth() - m;
var dd = now.getDate() - d;
var h = now.getHours() - hh;
var n = now.getMinutes() - mi;
if (n < 0) {
n += 60;
h--;
}
if (h < 0) {
h += 24;
dd--;
}
var pm = now.getMonth();
var py = now.getFullYear();
while (dd < 0) {
pm--;
if (pm < 0) {
pm = 11;
py--;
}
dd += daysIn(py, pm);
mm--;
}
if (mm < 0) {
mm += 12;
yy--;
}
return { y: yy, m: mm, d: dd, h: h, i: n };
}
function renderAge(out, dSel, mSel, ySel, timeIn) {
out.textContent = '';
if (!dSel.value || mSel.value === '' || !ySel.value) {
out.appendChild(el('p', 'g-age-msg', G.t('age.hint')));
return;
}
var d = parseInt(dSel.value, 10);
var m = parseInt(mSel.value, 10);
var y = parseInt(ySel.value, 10);
var bd = new Date(y, m, d);
if (bd.getFullYear() !== y || bd.getMonth() !== m || bd.getDate() !== d) {
out.appendChild(el('p', 'g-age-msg', G.t('age.invalid')));
return;
}
var hasTime = /^\d\d:\d\d/.test(timeIn.value);
var bh = hasTime ? parseInt(timeIn.value.slice(0, 2), 10) : 0;
var bi = hasTime ? parseInt(timeIn.value.slice(3, 5), 10) : 0;
var birth = new Date(y, m, d, bh, bi);
var now = new Date();
if (birth.getTime() > now.getTime()) {
out.appendChild(el('p', 'g-age-msg', G.t('age.future')));
return;
}
var p = ageParts(now, y, m, d, bh, bi);
var hero = el('div', 'g-age-hero');
hero.appendChild(el('small', '', G.t('age.youAre')));
hero.appendChild(el('div', 'g-age-big', num(p.y) + ' ' + G.t('age.y') + ' ' + num(p.m) + ' ' + G.t('age.mo') + ' ' + num(p.d) + ' ' + G.t('age.d')));
if (hasTime) {
hero.appendChild(el('div', 'g-age-sub', num(p.h) + ' ' + G.t('age.h') + ' ' + num(p.i) + ' ' + G.t('age.mi')));
}
out.appendChild(hero);
var totalDays = hasTime ? Math.floor((now.getTime() - birth.getTime()) / 86400000) : dayDiff(bd, now);
var grid = el('div', 'g-age-grid');
grid.appendChild(statBox(G.t('age.totalMonths'), grouped(p.y * 12 + p.m)));
grid.appendChild(statBox(G.t('age.totalWeeks'), grouped(Math.floor(totalDays / 7))));
grid.appendChild(statBox(G.t('age.totalDays'), grouped(totalDays)));
if (hasTime) {
var ms = now.getTime() - birth.getTime();
grid.appendChild(statBox(G.t('age.totalHours'), grouped(Math.floor(ms / 3600000))));
grid.appendChild(statBox(G.t('age.totalMins'), grouped(Math.floor(ms / 60000))));
}
out.appendChild(grid);
var ny = now.getFullYear();
function bdayOn(year) {
return new Date(year, m, (m === 1 && d === 29 && daysIn(year, 1) < 29) ? 28 : d);
}
var today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
var nb = bdayOn(ny);
if (nb.getTime() < today0.getTime()) {
ny++;
nb = bdayOn(ny);
}
var left = dayDiff(today0, nb);
var weekNames = isBn() ? WEEK_BN : WEEK_EN;
var monthNames = isBn() ? GREG_BN : GREG_EN;
var box = el('div', 'g-age-box');
box.appendChild(el('div', 'g-age-boxtitle', G.t('age.next')));
if (left === 0) {
box.appendChild(el('div', 'g-age-today', G.t('age.today')));
} else {
box.appendChild(el('div', 'g-age-left', G.t('age.daysLeft').replace('{n}', num(left))));
}
box.appendChild(el('div', 'g-age-small', weekNames[nb.getDay()] + ', ' + num(nb.getDate()) + ' ' + monthNames[nb.getMonth()] + ' ' + num(nb.getFullYear()) + ' \u00b7 ' + G.t('age.turns').replace('{n}', num(ny - y))));
out.appendChild(box);
var info = el('div', 'g-age-info');
info.appendChild(infoRow(G.t('age.bornOn'), weekNames[bd.getDay()]));
var b = banglaDate(bd);
info.appendChild(infoRow(G.t('age.bangla'), num(b.day) + ' ' + (isBn() ? BANGLA_FULL_BN : BANGLA_FULL_EN)[b.month] + ' ' + num(b.year)));
var h = hijriDate(bd);
if (h && h.year > 1300) {
info.appendChild(infoRow(G.t('age.hijri'), num(h.day) + ' ' + (isBn() ? HIJRI_FULL_BN : HIJRI_FULL_EN)[h.month] + ' ' + num(h.year)));
}
out.appendChild(info);
}
function openAge() {
if (!G.modal || !G.modal.open) {
return;
}
G.modal.open({
title: G.t('age.title'),
list: true,
build: function (body) {
var wrap = el('div', 'g-age');
wrap.appendChild(el('div', 'g-age-label', G.t('age.dob')));
var row = el('div', 'g-age-row');
var dSel = makeSelect(G.t('age.day'));
var mSel = makeSelect(G.t('age.month'));
var ySel = makeSelect(G.t('age.year'));
var i;
for (i = 1; i <= 31; i++) {
addOption(dSel, i, num(i));
}
var months = isBn() ? GREG_BN : GREG_EN;
for (i = 0; i < 12; i++) {
addOption(mSel, i, months[i]);
}
var thisYear = new Date().getFullYear();
for (i = thisYear; i >= thisYear - 120; i--) {
addOption(ySel, i, num(i));
}
row.appendChild(dSel);
row.appendChild(mSel);
row.appendChild(ySel);
wrap.appendChild(row);
wrap.appendChild(el('div', 'g-age-label', G.t('age.time')));
var timeRow = el('div', 'g-age-timerow');
var timeIn = el('input', 'g-age-time');
timeIn.type = 'time';
timeIn.setAttribute('aria-label', G.t('age.time'));
var clear = el('button', 'g-age-clear', G.t('age.clear'));
clear.type = 'button';
timeRow.appendChild(timeIn);
timeRow.appendChild(clear);
wrap.appendChild(timeRow);
wrap.appendChild(el('p', 'g-age-note', G.t('age.timeHint')));
var out = el('div', 'g-age-out');
out.setAttribute('aria-live', 'polite');
wrap.appendChild(out);
function refresh() {
clear.hidden = !timeIn.value;
renderAge(out, dSel, mSel, ySel, timeIn);
}
dSel.addEventListener('change', refresh);
mSel.addEventListener('change', refresh);
ySel.addEventListener('change', refresh);
timeIn.addEventListener('input', refresh);
timeIn.addEventListener('change', refresh);
clear.addEventListener('click', function () {
timeIn.value = '';
refresh();
});
refresh();
body.appendChild(wrap);
}
});
}
function build() {
var host = document.getElementById('g-clock');
if (!host || !window.G) {
return;
}
var bnEl = span('g-clock-side g-clock-side--start');
var dateEl = span('g-clock-date');
var hmEl = span('g-clock-hm');
var secEl = span('g-clock-sec');
var timeEl = span('g-clock-time');
timeEl.appendChild(hmEl);
timeEl.appendChild(secEl);
var center = span('g-clock-center');
center.appendChild(dateEl);
center.appendChild(timeEl);
var hjEl = span('g-clock-side g-clock-side--end');
host.setAttribute('role', 'timer');
host.setAttribute('aria-live', 'off');
host.appendChild(bnEl);
host.appendChild(center);
host.appendChild(hjEl);
bnEl.addEventListener('click', function () {
var now = new Date();
var b = banglaDate(now);
announce(sayDate(now, b.day, b.month, b.year, 'bangla'));
});
var holdTimer = null;
var held = false;
var holdX = 0;
var holdY = 0;
function cancelHold() {
if (holdTimer) {
window.clearTimeout(holdTimer);
holdTimer = null;
}
}
dateEl.addEventListener('pointerdown', function (e) {
if (e.pointerType === 'mouse' && e.button !== 0) {
return;
}
held = false;
holdX = e.clientX;
holdY = e.clientY;
cancelHold();
holdTimer = window.setTimeout(function () {
holdTimer = null;
held = true;
openAge();
}, LONG_PRESS_MS);
});
dateEl.addEventListener('pointermove', function (e) {
if (holdTimer && (Math.abs(e.clientX - holdX) > 10 || Math.abs(e.clientY - holdY) > 10)) {
cancelHold();
}
});
dateEl.addEventListener('pointerup', cancelHold);
dateEl.addEventListener('pointercancel', cancelHold);
dateEl.addEventListener('pointerleave', cancelHold);
dateEl.addEventListener('contextmenu', function (e) {
e.preventDefault();
});
dateEl.addEventListener('click', function () {
if (held) {
held = false;
return;
}
var now = new Date();
announce(sayDate(now, now.getDate(), now.getMonth(), now.getFullYear(), 'english'));
});
hjEl.addEventListener('click', function () {
var now = new Date();
var h = hijriDate(now);
if (h) {
announce(sayDate(now, h.day, h.month, h.year, 'hijri'));
}
});
timeEl.addEventListener('click', function () {
announce(sayTime(new Date()));
});
var lastDay = '';
function paintDates(now) {
dateEl.textContent = pad(now.getDate()) + '-' + MONTHS_EN[now.getMonth()] + '-' + pad(now.getFullYear() % 100);
var b = banglaDate(now);
paintSide(bnEl, b.day, BANGLA_MONTHS[b.month], b.year);
var h = hijriDate(now);
if (h) {
paintSide(hjEl, h.day, HIJRI_MONTHS[h.month], h.year);
} else {
hjEl.textContent = '';
}
}
function paint() {
var now = new Date();
var dayKey = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
if (dayKey !== lastDay) {
lastDay = dayKey;
paintDates(now);
}
hmEl.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());
secEl.textContent = ':' + pad(now.getSeconds());
}
function loop() {
if (!host.isConnected) {
return;
}
paint();
window.setTimeout(loop, 1000 - (Date.now() % 1000));
}
loop();
}
document.addEventListener('DOMContentLoaded', build);
})();
