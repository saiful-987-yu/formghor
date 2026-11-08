(function () {
var G = window.G = window.G || {};
var X_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var toastTimer = 0;
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
function pick(obj) {
if (!obj) {
return '';
}
return obj[G.getLang()] || obj.bn || obj.en || '';
}
function digits(text) {
if (G.getLang() !== 'bn') {
return text;
}
return text.replace(/\d/g, function (c) {
return '০১২৩৪৫৬৭৮৯'.charAt(Number(c));
});
}
function formatTime(t) {
var d = new Date(t);
function p(n) {
return n < 10 ? '0' + n : String(n);
}
return digits(p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()));
}
function toast(message) {
var node = document.getElementById('g-toast');
if (!node) {
node = el('div', 'g-toast');
node.id = 'g-toast';
node.setAttribute('role', 'status');
node.setAttribute('aria-live', 'polite');
document.body.appendChild(node);
}
node.textContent = message;
node.classList.add('g-toast--show');
window.clearTimeout(toastTimer);
toastTimer = window.setTimeout(function () {
node.classList.remove('g-toast--show');
}, 2800);
}
function groups() {
var forms = window.G_FORMS || [];
var out = [];
for (var i = 0; i < forms.length; i++) {
var form = forms[i];
if (!form || !/^[a-z0-9-]{1,60}$/.test(form.slug || '')) {
continue;
}
var list = G.saves ? G.saves.list(form.slug) : [];
if (list.length) {
out.push({ form: form, list: list });
}
}
out.sort(function (a, b) {
return b.list[0].t - a.list[0].t;
});
return out;
}
function removeSave(slug, item, label) {
var go = function () {
G.saves.remove(slug, item.id);
toast(G.t('saves.deleted'));
};
if (G.modal && G.modal.confirm) {
G.modal.confirm({ title: G.t('cf.delSave.t'), text: G.t('cf.delSave.x'), note: label, onYes: go });
} else {
go();
}
}
function buildGroup(group) {
var slug = group.form.slug;
var box = el('section', 'g-sv-group');
var head = el('div', 'g-sv-head');
head.appendChild(el('h2', 'g-sv-title', pick(group.form.title)));
head.appendChild(el('span', 'g-sv-count', G.t('svp.count').replace('{n}', digits(String(group.list.length)))));
box.appendChild(head);
var grid = el('div', 'g-sv-list');
group.list.forEach(function (item) {
var label = item.name || G.t('saves.unnamed');
var when = formatTime(item.t);
var row = el('div', 'g-sv-row');
var card = el('a', 'g-sv-card');
card.href = '../forms/' + slug + '/index.html?save=' + encodeURIComponent(item.id);
card.appendChild(el('span', 'g-sv-name', label));
card.appendChild(el('span', 'g-sv-time', when));
var del = el('button', 'g-sv-del');
del.type = 'button';
del.setAttribute('aria-label', G.t('saves.del'));
del.setAttribute('title', G.t('saves.del'));
del.innerHTML = X_SVG;
del.addEventListener('click', function () {
removeSave(slug, item, label + ' · ' + when);
});
row.appendChild(card);
row.appendChild(del);
grid.appendChild(row);
});
box.appendChild(grid);
return box;
}
function render() {
var root = document.getElementById('g-saved-list');
if (!root) {
return;
}
root.textContent = '';
var all = groups();
if (!all.length) {
root.appendChild(el('div', 'g-empty', G.t('svp.empty')));
return;
}
all.forEach(function (group) {
root.appendChild(buildGroup(group));
});
}
G.pageTitle = function () {
return G.t('menu.saved') + ' - ' + G.t('site.name');
};
function pull() {
if (G.saves && G.saves.syncAll) {
G.saves.syncAll();
}
}
document.addEventListener('DOMContentLoaded', function () {
render();
window.setTimeout(pull, 300);
});
document.addEventListener('g:langchange', render);
document.addEventListener('g:saveschange', render);
window.addEventListener('online', pull);
})();
