(function () {
var G = window.G = window.G || {};
var X_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var current = null;
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
function close(silent) {
if (!current) {
return;
}
var cur = current;
current = null;
document.removeEventListener('keydown', cur.onKey);
document.documentElement.classList.remove('g-modal-open');
if (cur.root.parentNode) {
cur.root.parentNode.removeChild(cur.root);
}
if (silent !== true && !cur.yes && cur.onCancel) {
cur.onCancel();
} else if (cur.opener && cur.opener.focus) {
cur.opener.focus();
}
}
function focusables(card) {
return card.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
}
function open(opts) {
close(true);
var root = el('div', 'g-modal');
var card = el('div', 'g-modal-card' + (opts.list ? ' g-modal-card--list' : ''));
card.setAttribute('role', 'dialog');
card.setAttribute('aria-modal', 'true');
card.setAttribute('aria-label', opts.title || '');
var x = el('button', 'g-modal-x');
x.type = 'button';
x.setAttribute('aria-label', G.t('modal.close'));
x.innerHTML = X_SVG;
x.addEventListener('click', close);
card.appendChild(x);
card.appendChild(el('h2', 'g-modal-title', opts.title || ''));
if (opts.note) {
card.appendChild(el('p', 'g-modal-note', opts.note));
}
if (opts.text) {
card.appendChild(el('p', 'g-modal-text', opts.text));
}
var body = el('div', 'g-modal-body');
card.appendChild(body);
var yesBtn = null;
if (opts.onYes) {
var actions = el('div', 'g-modal-actions');
var no = el('button', 'g-btn g-btn--ghost', opts.onAlt ? opts.altLabel : G.t('modal.no'));
no.type = 'button';
if (opts.onAlt) {
no.addEventListener('click', function () {
if (current) {
current.yes = true;
}
close();
opts.onAlt();
});
} else {
no.addEventListener('click', close);
}
yesBtn = el('button', 'g-btn', opts.yesLabel || G.t('modal.yes'));
yesBtn.type = 'button';
yesBtn.addEventListener('click', function () {
if (current) {
current.yes = true;
}
close();
opts.onYes();
});
actions.appendChild(no);
actions.appendChild(yesBtn);
card.appendChild(actions);
}
if (opts.build) {
opts.build(body, close);
}
root.appendChild(card);
root.addEventListener('click', function (e) {
if (e.target === root) {
close();
}
});
var onKey = function (e) {
if (e.key === 'Escape') {
close();
return;
}
if (e.key !== 'Tab') {
return;
}
var list = focusables(card);
if (!list.length) {
return;
}
var first = list[0];
var last = list[list.length - 1];
if (e.shiftKey && document.activeElement === first) {
e.preventDefault();
last.focus();
} else if (!e.shiftKey && document.activeElement === last) {
e.preventDefault();
first.focus();
}
};
current = { root: root, onKey: onKey, opener: document.activeElement, onCancel: opts.onCancel, yes: false };
document.addEventListener('keydown', onKey);
document.documentElement.classList.add('g-modal-open');
document.body.appendChild(root);
var target = yesBtn || card.querySelector('.g-save-item') || card.querySelector('.g-choice:not(:disabled)') || x;
target.focus();
return { close: close, body: body };
}
G.modal = {
open: open,
close: close,
choose: function (opts) {
return open({
title: opts.title,
text: opts.text,
build: function (body, close) {
body.className += ' g-choice-list';
opts.choices.forEach(function (c) {
var b = el('button', 'g-choice', c.label);
b.type = 'button';
b.disabled = !!c.disabled;
b.addEventListener('click', function () {
close();
c.onPick();
});
body.appendChild(b);
});
}
});
},
confirm: function (opts) {
return open({ title: opts.title, text: opts.text, note: opts.note, onYes: opts.onYes || function () {}, onCancel: opts.onCancel, yesLabel: opts.yesLabel, altLabel: opts.altLabel, onAlt: opts.onAlt });
}
};
})();
