(function () {
var G = window.G = window.G || {};
var KEY = 'g.profile';
var FIELDS = ['name', 'phone', 'email', 'address', 'photo', 'father', 'mother', 'birth', 'gender', 'blood', 'religion', 'nationality', 'marital', 'occupation', 'nid', 'birthreg', 'passport', 'address_perm'];
var USER_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
var OPTIONS = {
gender: [['male', 'পুরুষ', 'Male'], ['female', 'নারী', 'Female'], ['other', 'অন্যান্য', 'Other']],
blood: [['A+', 'A+', 'A+'], ['A-', 'A-', 'A-'], ['B+', 'B+', 'B+'], ['B-', 'B-', 'B-'], ['AB+', 'AB+', 'AB+'], ['AB-', 'AB-', 'AB-'], ['O+', 'O+', 'O+'], ['O-', 'O-', 'O-']],
religion: [['islam', 'ইসলাম', 'Islam'], ['hindu', 'হিন্দু', 'Hinduism'], ['buddhist', 'বৌদ্ধ', 'Buddhism'], ['christian', 'খ্রিস্টান', 'Christianity'], ['other', 'অন্যান্য', 'Other']],
marital: [['single', 'অবিবাহিত', 'Single'], ['married', 'বিবাহিত', 'Married'], ['divorced', 'তালাকপ্রাপ্ত', 'Divorced'], ['widowed', 'বিধবা / বিপত্নীক', 'Widowed']]
};
function read() {
try {
var raw = localStorage.getItem(KEY);
if (!raw) {
return null;
}
var obj = JSON.parse(raw);
return obj && typeof obj === 'object' ? obj : null;
} catch (e) {
return null;
}
}
function notify() {
document.dispatchEvent(new CustomEvent('g:profilechange'));
}
G.profile = {
fields: FIELDS,
options: OPTIONS,
isChoice: function (key) {
return !!OPTIONS[key];
},
label: function (key, value, lang) {
var list = OPTIONS[key];
if (!list || !value) {
return value || '';
}
for (var i = 0; i < list.length; i++) {
if (list[i][0] === value) {
return list[i][lang === 'en' ? 2 : 1];
}
}
return value;
},
get: function () {
var obj = read();
if (!obj) {
return null;
}
var out = {};
var any = false;
for (var i = 0; i < FIELDS.length; i++) {
var key = FIELDS[i];
out[key] = typeof obj[key] === 'string' ? obj[key] : '';
if (out[key]) {
any = true;
}
}
return any ? out : null;
},
save: function (data) {
var out = {};
for (var i = 0; i < FIELDS.length; i++) {
out[FIELDS[i]] = data && typeof data[FIELDS[i]] === 'string' ? data[FIELDS[i]] : '';
}
try {
localStorage.setItem(KEY, JSON.stringify(out));
} catch (e) {
return false;
}
notify();
return true;
},
clear: function () {
try {
localStorage.removeItem(KEY);
} catch (e) {}
notify();
}
};
G.photoToDataUrl = function (file, done) {
if (!file || !/^image\//.test(file.type)) {
done(null);
return;
}
var reader = new FileReader();
reader.onerror = function () {
done(null);
};
reader.onload = function () {
var img = new Image();
img.onerror = function () {
done(null);
};
img.onload = function () {
var max = 600;
var ratio = Math.min(1, max / Math.max(img.width, img.height));
var canvas = document.createElement('canvas');
canvas.width = Math.round(img.width * ratio);
canvas.height = Math.round(img.height * ratio);
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
done(canvas.toDataURL('image/jpeg', 0.88));
};
img.src = reader.result;
};
reader.readAsDataURL(file);
};
var MENU_ICONS = {
home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
forms: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
fav: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-8-4.9-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.1 12 20 12 20z"/></svg>',
saved: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
help: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7"/><path d="M12 17h.01"/></svg>'
};
var BARS_SVG = '<svg class="g-menu-ic-bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
var CLOSE_SVG = '<svg class="g-menu-ic-x" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var menuToastTimer = 0;
function menuToast(message) {
var node = document.getElementById('g-toast');
if (!node) {
node = document.createElement('div');
node.id = 'g-toast';
node.className = 'g-toast';
node.setAttribute('role', 'status');
node.setAttribute('aria-live', 'polite');
document.body.appendChild(node);
}
node.textContent = message;
node.classList.add('g-toast--show');
window.clearTimeout(menuToastTimer);
menuToastTimer = window.setTimeout(function () {
node.classList.remove('g-toast--show');
}, 2800);
}
function menuItem(tag, icon, key) {
var item = document.createElement(tag);
item.className = 'g-menu-item';
if (tag === 'button') {
item.type = 'button';
}
item.innerHTML = MENU_ICONS[icon];
var label = document.createElement('span');
label.setAttribute('data-i18n', key);
item.appendChild(label);
return item;
}
function setup() {
var tools = document.querySelector('.g-tools');
if (tools) {
var foot = document.getElementById('g-footer');
var base = foot ? (foot.getAttribute('data-base') || '') : '';
var btn = document.createElement('button');
btn.type = 'button';
btn.id = 'g-menu-btn';
btn.className = 'g-iconbtn g-menu-btn';
btn.setAttribute('aria-expanded', 'false');
btn.setAttribute('aria-controls', 'g-menu');
btn.setAttribute('data-i18n-label', 'menu.open');
btn.innerHTML = BARS_SVG + CLOSE_SVG;
var menu = document.createElement('div');
menu.id = 'g-menu';
menu.className = 'g-menu';
menu.hidden = true;
var grid = document.createElement('div');
grid.className = 'g-menu-grid';
var home = menuItem('a', 'home', 'crumb.home');
home.href = base + 'index.html';
grid.appendChild(home);
var all = menuItem('a', 'forms', 'form.back');
all.href = base + 'forms/index.html';
grid.appendChild(all);
var favLink = menuItem('a', 'fav', 'menu.fav');
favLink.href = base + 'favorites/index.html';
grid.appendChild(favLink);
var savedLink = menuItem('a', 'saved', 'menu.saved');
savedLink.href = base + 'saved/index.html';
grid.appendChild(savedLink);
var help = menuItem('button', 'help', 'menu.help');
help.addEventListener('click', function () {
closeMenu();
var dev = document.getElementById('g-dev');
if (dev) {
dev.scrollIntoView({ behavior: 'smooth', block: 'center' });
} else {
window.location.href = base + 'index.html#g-dev';
}
});
grid.appendChild(help);
menu.appendChild(grid);
var link = document.createElement('a');
link.className = 'g-menu-profile';
link.href = base + 'profile/index.html';
if (document.body.classList.contains('g-profile-page')) {
link.setAttribute('aria-current', 'page');
}
var avatar = document.createElement('span');
avatar.className = 'g-menu-avatar';
avatar.innerHTML = USER_SVG;
var nameBox = document.createElement('span');
nameBox.className = 'g-menu-name';
link.appendChild(avatar);
link.appendChild(nameBox);
menu.appendChild(link);
var showName = function () {
var data = G.profile.get();
var text = data && data.name ? data.name.trim() : '';
nameBox.textContent = text || G.t('pf.open');
};
function closeMenu() {
menu.hidden = true;
btn.setAttribute('aria-expanded', 'false');
btn.classList.remove('g-menu-btn--open');
btn.setAttribute('data-i18n-label', 'menu.open');
btn.setAttribute('aria-label', G.t('menu.open'));
btn.setAttribute('title', G.t('menu.open'));
}
function openMenu() {
menu.hidden = false;
btn.setAttribute('aria-expanded', 'true');
btn.classList.add('g-menu-btn--open');
btn.setAttribute('data-i18n-label', 'menu.close');
btn.setAttribute('aria-label', G.t('menu.close'));
btn.setAttribute('title', G.t('menu.close'));
}
btn.addEventListener('click', function () {
if (menu.hidden) {
openMenu();
} else {
closeMenu();
}
});
document.addEventListener('click', function (e) {
if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) {
closeMenu();
}
});
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && !menu.hidden) {
closeMenu();
btn.focus();
}
});
showName();
document.addEventListener('g:profilechange', showName);
document.addEventListener('g:langchange', showName);
tools.appendChild(btn);
tools.appendChild(menu);
}
G.applyLang();
}
document.addEventListener('DOMContentLoaded', setup);
})();
