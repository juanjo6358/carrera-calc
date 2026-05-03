import { $, $$ } from '../dom.js';
import { unitDistanceLabel, unitPaceLabel } from '../units.js';

export function getMode() {
  return $('input[name="mode"]:checked')?.value ?? 'time';
}

export function setMode(mode) {
  const input = $(`input[name="mode"][value="${mode}"]`);
  if (!input) return false;
  input.checked = true;
  updateVisibleFields();
  return true;
}

export function updateVisibleFields() {
  const mode = getMode();
  $$('[data-field-block]').forEach((block) => {
    const hidden = block.dataset.fieldBlock === mode;
    block.hidden = hidden;
    block.classList.toggle('is-hidden', hidden);
  });
}

export function updateUnitButtons(buttons, unit) {
  buttons.forEach((button) => {
    const active = button.dataset.unitButton === unit;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function updateThemeButtons(buttons, theme) {
  buttons.forEach((button) => {
    const active = button.dataset.themeButton === theme;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

export function updateUnitLabels(unit) {
  $$('[data-distance-unit]').forEach((el) => { el.textContent = unitDistanceLabel(unit); });
  $$('[data-pace-unit]').forEach((el) => { el.textContent = unitPaceLabel(unit); });
  $$('[data-current-unit]').forEach((el) => { el.textContent = unit; });
}

export function clearFieldErrors(els) {
  $$('.input-card').forEach((group) => group.classList.remove('has-error'));
  $$('[data-error-for]').forEach((el) => { el.textContent = ''; });
  els.resultBadge?.classList.remove('badge--error');
}

export function renderFieldErrors(errors = {}) {
  Object.entries(errors).forEach(([field, enabled]) => {
    if (!enabled) return;
    const group = $(`[data-field-block="${field}"]`);
    const error = $(`[data-error-for="${field}"]`);
    group?.classList.add('has-error');
    if (error) {
      error.textContent = field === 'distance'
        ? 'Introduce una distancia mayor que 0.'
        : field === 'pace'
          ? 'Introduce un ritmo válido, por ejemplo 4:40.'
          : 'Introduce un tiempo válido, por ejemplo 45:16.';
    }
  });
}
