(function () {
var KEY_THEME = 'g.theme';
var KEY_LANG = 'g.lang';
var G = window.G = window.G || {};
G.config = {
creator: 'আপনার নাম'
};
function write(key, value) {
try {
localStorage.setItem(key, value);
} catch (e) {}
}
G.getTheme = function () {
return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};
G.getLang = function () {
return document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'bn';
};
G.t = function (key) {
var table = window.G_STRINGS || {};
var lang = G.getLang();
var text = (table[lang] && table[lang][key]) || (table.bn && table.bn[key]) || key;
return text
.replace('{name}', (table[lang] && table[lang]['dev.name']) || G.config.creator)
.replace('{year}', String(new Date().getFullYear()));
};
G.applyLang = function () {
var lang = G.getLang();
var nodes = document.querySelectorAll('[data-i18n]');
for (var i = 0; i < nodes.length; i++) {
nodes[i].textContent = G.t(nodes[i].getAttribute('data-i18n'));
}
var labels = document.querySelectorAll('[data-i18n-label]');
for (var j = 0; j < labels.length; j++) {
var text = G.t(labels[j].getAttribute('data-i18n-label'));
labels[j].setAttribute('aria-label', text);
labels[j].setAttribute('title', text);
}
var langBtnText = document.getElementById('g-lang-text');
if (langBtnText) {
langBtnText.textContent = lang === 'bn' ? 'EN' : 'বাং';
}
document.title = G.pageTitle ? G.pageTitle() : G.t('site.title');
};
G.setLang = function (lang) {
if (lang !== 'bn' && lang !== 'en') {
return;
}
document.documentElement.setAttribute('lang', lang);
write(KEY_LANG, lang);
G.applyLang();
document.dispatchEvent(new CustomEvent('g:langchange'));
};
G.setTheme = function (theme) {
if (theme !== 'dark' && theme !== 'light') {
return;
}
document.documentElement.setAttribute('data-theme', theme);
write(KEY_THEME, theme);
document.dispatchEvent(new CustomEvent('g:themechange'));
};
function makeSeg(kind, items, onPick) {
var box = document.createElement('div');
box.className = 'g-seg g-seg--' + kind;
box.setAttribute('role', 'group');
items.forEach(function (it) {
var b = document.createElement('button');
b.type = 'button';
b.className = 'g-seg-btn';
b.setAttribute('data-val', it.v);
if (it.key) {
b.setAttribute('data-i18n', it.key);
b.textContent = G.t(it.key);
} else {
b.textContent = it.text;
}
b.addEventListener('click', function () {
onPick(it.v);
});
box.appendChild(b);
});
return box;
}
function syncSeg() {
var lang = G.getLang();
var theme = G.getTheme();
var list = document.querySelectorAll('.g-seg-btn');
for (var i = 0; i < list.length; i++) {
var isLang = list[i].parentNode.classList.contains('g-seg--lang');
var on = list[i].getAttribute('data-val') === (isLang ? lang : theme);
list[i].setAttribute('aria-pressed', on ? 'true' : 'false');
list[i].classList.toggle('g-seg-btn--on', on);
}
}
function buildHeader() {
var row = document.querySelector('.g-header-row');
var tools = row && row.querySelector('.g-tools');
var langBtn = document.getElementById('g-lang-btn');
var themeBtn = document.getElementById('g-theme-btn');
if (!row || !tools || !langBtn || !themeBtn) {
return;
}
var mid = document.createElement('div');
mid.className = 'g-lang';
mid.appendChild(langBtn);
mid.appendChild(makeSeg('lang', [{ v: 'bn', text: 'বাংলা' }, { v: 'en', text: 'English' }], G.setLang));
row.insertBefore(mid, tools);
tools.appendChild(makeSeg('theme', [{ v: 'light', key: 'ui.light' }, { v: 'dark', key: 'ui.dark' }], G.setTheme));
document.addEventListener('g:langchange', syncSeg);
document.addEventListener('g:themechange', syncSeg);
syncSeg();
}
document.addEventListener('DOMContentLoaded', function () {
buildHeader();
G.applyLang();
var langBtn = document.getElementById('g-lang-btn');
var themeBtn = document.getElementById('g-theme-btn');
if (langBtn) {
langBtn.addEventListener('click', function () {
G.setLang(G.getLang() === 'bn' ? 'en' : 'bn');
});
}
if (themeBtn) {
themeBtn.addEventListener('click', function () {
G.setTheme(G.getTheme() === 'dark' ? 'light' : 'dark');
});
}
});
})();
