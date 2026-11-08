(function () {
var theme = null;
var lang = null;
try {
theme = localStorage.getItem('g.theme');
lang = localStorage.getItem('g.lang');
} catch (e) {}
if (theme !== 'dark' && theme !== 'light') {
theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
if (lang !== 'bn' && lang !== 'en') {
lang = 'bn';
}
document.documentElement.setAttribute('data-theme', theme);
document.documentElement.setAttribute('lang', lang);
})();
