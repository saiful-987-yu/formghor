(function () {
var G = window.G = window.G || {};
var ICONS = {
call: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.1 3.4c.7-.3 1.5 0 1.8.7l1.3 2.7c.3.6.1 1.3-.4 1.7l-1.1 1c-.2.2-.3.5-.1.8 1.1 1.9 2.7 3.5 4.6 4.6.3.2.6.1.8-.1l1-1.1c.4-.5 1.1-.7 1.7-.4l2.7 1.3c.7.3 1 1.1.7 1.8l-.6 1.4a2.1 2.1 0 0 1-2.3 1.3C10.6 18 6 13.4 4.9 6.6a2.1 2.1 0 0 1 1.3-2.3l1.4-.6Z" fill="currentColor" stroke="currentColor" stroke-width="0.6" stroke-linejoin="round"/></svg>',
whatsapp: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.2A8.5 8.5 0 1 0 12 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.8 8.6c.2-.4.4-.5.6-.5.15 0 .3 0 .43.01.14 0 .32-.05.5.38.19.46.63 1.6.69 1.72.06.11.1.25.02.4-.08.16-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.13.25.6 1.03 1.31 1.68.9.83 1.66 1.1 1.9 1.22.25.13.4.11.55-.06.15-.17.62-.7.79-.94.16-.24.33-.2.55-.12.22.08 1.4.67 1.64.79.24.12.4.18.46.28.06.11.06.6-.14 1.18-.2.58-1.15 1.11-1.6 1.18-.4.07-.92.1-1.48-.09-.34-.12-.78-.26-1.34-.5-2.36-1.03-3.9-3.4-4.02-3.56-.12-.16-.96-1.28-.96-2.44 0-1.16.6-1.73.82-1.97Z" fill="currentColor"/></svg>',
facebook: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8.5h2V5.3c-.35-.05-1.5-.15-2.85-.15-2.82 0-4.75 1.72-4.75 4.9V13H6.5v3.6h2.9V22h3.7v-5.4h2.86l.45-3.6h-3.31v-2.5c0-1.04.29-1.75 1.9-1.75Z" fill="currentColor"/></svg>',
tiktok: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 3.5c.4 1.9 1.7 3.2 3.6 3.5v2.6c-1.3 0-2.5-.4-3.6-1.1v6.2a5 5 0 1 1-4.3-4.95v2.7a2.3 2.3 0 1 0 1.7 2.25V3.5H14Z" fill="currentColor"/></svg>',
instagram: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>',
website: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.4 5.3 3.4 8.5s-1 6.1-3.4 8.5C9.6 18.1 8.6 15.2 8.6 12s1-6.1 3.4-8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'
};
G.socialIcons = ICONS;
var ORDER = ['call', 'whatsapp', 'facebook', 'tiktok', 'instagram', 'website'];
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
function linkFor(key, value) {
var v = String(value || '').trim();
if (!v || v === '#') {
return '';
}
if (key === 'call') {
return 'tel:' + v.replace(/[^\d+]/g, '');
}
if (key === 'whatsapp') {
var d = v.replace(/\D/g, '');
if (d.charAt(0) === '0') {
d = '88' + d;
}
return d ? 'https://wa.me/' + d : '';
}
return /^https?:\/\//i.test(v) ? v : '';
}
function build() {
var root = document.getElementById('g-footer');
if (!root || !window.G) {
return;
}
var base = root.getAttribute('data-base') || '';
var social = (G.config && G.config.social) || {};
root.textContent = '';
var inner = el('div', 'g-wrap g-footer-inner');
var top = el('div', 'g-footer-row');
var brand = el('a', 'g-footer-brand');
brand.href = base + 'index.html';
var logo = el('img');
logo.src = base + 'assets/icons/logo.svg';
logo.alt = '';
brand.appendChild(logo);
brand.appendChild(el('span', '', G.t('site.name')));
top.appendChild(brand);
var nav = el('nav', 'g-footer-nav');
var home = el('a', 'g-footer-link', G.t('crumb.home'));
home.href = base + 'index.html';
nav.appendChild(home);
var all = el('a', 'g-footer-link', G.t('form.back'));
all.href = base + 'forms/index.html';
nav.appendChild(all);
var mine = el('a', 'g-footer-link', G.t('pf.open'));
mine.href = base + 'profile/index.html';
nav.appendChild(mine);
top.appendChild(nav);
inner.appendChild(top);
var icons = el('nav', 'g-footer-social');
for (var i = 0; i < ORDER.length; i++) {
var key = ORDER[i];
var href = linkFor(key, social[key]);
if (!href) {
continue;
}
var a = el('a');
a.href = href;
if (key !== 'call') {
a.target = '_blank';
a.rel = 'noopener';
}
a.setAttribute('aria-label', G.t('social.' + key));
a.innerHTML = ICONS[key];
icons.appendChild(a);
}
if (icons.firstChild) {
var socialRow = el('div', 'g-footer-row g-footer-row--social');
socialRow.appendChild(icons);
inner.appendChild(socialRow);
}
var bottom = el('div', 'g-footer-row g-footer-row--bottom');
bottom.appendChild(el('span', '', G.t('footer.copy') + ' · ' + G.t('footer.made')));
inner.appendChild(bottom);
root.appendChild(inner);
}
document.addEventListener('DOMContentLoaded', build);
document.addEventListener('g:langchange', build);
})();
