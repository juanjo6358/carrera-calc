export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

export function setText(selector, text, root = document) {
  const el = $(selector, root);
  if (el) el.textContent = text;
}

export function setHidden(el, hidden) {
  if (!el) return;
  el.hidden = hidden;
  el.classList.toggle('is-hidden', hidden);
}

export function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2200);
}
