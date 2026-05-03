import { calculate } from './calculator.js';
import { showToast } from './dom.js';
import { formatPace, parseDistance, parseDuration, parseGrade, parsePace } from './formatters.js';
import { clearHistory, pushHistory, readPreference, writePreference } from './storage.js';
import { distanceFromKm, distanceToKm, paceFromSecPerKm, paceToSecPerKm } from './units.js';
import { registerServiceWorker, setupInstallPrompt } from './pwa.js';
import { getElements } from './ui/elements.js';
import { clearFieldErrors, getMode, setMode, updateThemeButtons, updateUnitButtons, updateUnitLabels, updateVisibleFields } from './ui/formUi.js';
import { buildShareText, renderEmpty, renderError, renderGradeInsight, renderResult } from './ui/resultUi.js';
import { renderProjectionPlaceholder, renderProjections } from './ui/projectionUi.js';
import { renderZones } from './ui/zonesUi.js';
import { makeHistoryItem, renderHistory } from './ui/historyUi.js';

const els = getElements();

const state = {
  unit: readPreference('unit', 'km'),
  theme: readPreference('theme', 'auto'),
  lastResult: null,
  lastResultText: '',
  debounceTimer: null,
};

init();

function init() {
  applyTheme(state.theme);
  updateUnitButtons(els.unitButtons, state.unit);
  updateUnitLabels(state.unit);
  syncModeFromUrl();
  updateVisibleFields();
  renderEmpty(els);
  renderProjectionPlaceholder(els, state.unit);
  renderHistory(els, restoreHistoryItem);
  renderZones(els, state.unit);
  bindEvents();
  setupInstallPrompt();
  registerServiceWorker();
}

function bindEvents() {
  els.modes.forEach((mode) => {
    mode.addEventListener('change', () => {
      updateVisibleFields();
      scheduleCompute();
    });
  });

  els.unitButtons.forEach((button) => {
    button.addEventListener('click', () => setUnit(button.dataset.unitButton));
  });

  els.themeButtons.forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.themeButton));
  });

  document.querySelectorAll('.preset').forEach((button) => {
    button.addEventListener('click', () => {
      const km = Number.parseFloat(button.dataset.presetKm);
      els.distanceInput.value = formatInputDistance(distanceFromKm(km, state.unit));
      focusNextEmptyField();
      computeAndRender({ save: false, silentEmpty: true });
    });
  });

  [els.distanceInput, els.paceInput, els.timeInput, els.gradeInput, els.terrainSelect, els.projectionModel].forEach((el) => {
    el?.addEventListener('input', scheduleCompute);
    el?.addEventListener('change', scheduleCompute);
  });

  [els.hrMaxInput, els.hrRestInput, els.ltPaceInput].forEach((el) => {
    el?.addEventListener('input', () => renderZones(els, state.unit));
  });

  els.zonesByHr?.addEventListener('change', () => renderZones(els, state.unit));
  els.zonesByPace?.addEventListener('change', () => renderZones(els, state.unit));

  els.calculateButton.addEventListener('click', () => computeAndRender({ save: true }));
  els.resetButton.addEventListener('click', resetAll);
  els.copyButton.addEventListener('click', copyResult);
  els.shareButton.addEventListener('click', shareResult);
  els.clearHistoryButton.addEventListener('click', () => {
    clearHistory();
    renderHistory(els, restoreHistoryItem);
    showToast('Historial vaciado.');
  });

  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    const isTextControl = tag === 'TEXTAREA';
    if (event.key === 'Enter' && !event.shiftKey && !isTextControl) {
      event.preventDefault();
      computeAndRender({ save: true });
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      resetAll();
    }
    if (event.altKey && ['1', '2', '3'].includes(event.key)) {
      event.preventDefault();
      const mode = event.key === '1' ? 'time' : event.key === '2' ? 'pace' : 'distance';
      setMode(mode);
      scheduleCompute();
    }
  });
}

function syncModeFromUrl() {
  const mode = new URLSearchParams(window.location.search).get('mode');
  if (['time', 'pace', 'distance'].includes(mode)) setMode(mode);
}

function focusNextEmptyField() {
  const mode = getMode();
  if (mode !== 'pace' && !els.paceInput.value) els.paceInput.focus();
  else if (mode !== 'time' && !els.timeInput.value) els.timeInput.focus();
}

function setUnit(nextUnit) {
  if (!['km', 'mi'].includes(nextUnit) || nextUnit === state.unit) return;

  const previousUnit = state.unit;
  const distanceValue = parseDistance(els.distanceInput.value);
  const paceValue = parsePace(els.paceInput.value);
  const ltPaceValue = parsePace(els.ltPaceInput.value);

  if (Number.isFinite(distanceValue)) {
    const km = distanceToKm(distanceValue, previousUnit);
    els.distanceInput.value = formatInputDistance(distanceFromKm(km, nextUnit));
  }
  if (Number.isFinite(paceValue)) {
    const secPerKm = paceToSecPerKm(paceValue, previousUnit);
    els.paceInput.value = formatPace(paceFromSecPerKm(secPerKm, nextUnit));
  }
  if (Number.isFinite(ltPaceValue)) {
    const secPerKm = paceToSecPerKm(ltPaceValue, previousUnit);
    els.ltPaceInput.value = formatPace(paceFromSecPerKm(secPerKm, nextUnit));
  }

  state.unit = nextUnit;
  writePreference('unit', nextUnit);
  updateUnitButtons(els.unitButtons, state.unit);
  updateUnitLabels(state.unit);
  renderZones(els, state.unit);
  computeAndRender({ save: false, silentEmpty: true });
}

function applyTheme(theme) {
  state.theme = theme;
  writePreference('theme', theme);
  const resolvedTheme = theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.dataset.theme = resolvedTheme;
  updateThemeButtons(els.themeButtons, theme);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
  if (state.theme === 'auto') applyTheme('auto');
});

function scheduleCompute() {
  clearTimeout(state.debounceTimer);
  state.debounceTimer = window.setTimeout(() => {
    computeAndRender({ save: false, silentEmpty: true });
  }, 120);
}

function readInputs() {
  return {
    mode: getMode(),
    distanceInput: parseDistance(els.distanceInput.value),
    paceInputSec: parsePace(els.paceInput.value),
    timeInputSec: parseDuration(els.timeInput.value),
    unit: state.unit,
    gradePercent: parseGrade(els.gradeInput.value),
    terrain: els.terrainSelect.value,
  };
}

function computeAndRender({ save = false, silentEmpty = false } = {}) {
  clearFieldErrors(els);
  const raw = readInputs();
  const result = calculate(raw);

  if (!result.ok) {
    state.lastResult = null;
    state.lastResultText = '';
    if (silentEmpty && isEmptyForMode(raw)) {
      renderEmpty(els);
      renderProjectionPlaceholder(els, state.unit);
      return null;
    }
    renderError(els, result);
    return null;
  }

  state.lastResult = result;
  renderResult(els, result, state.unit);
  renderGradeInsight(els, result, state.unit);
  renderProjections(els, result, state.unit);
  state.lastResultText = buildShareText(els, result, state.unit);

  if (save) {
    pushHistory(makeHistoryItem(els, result, state.unit));
    renderHistory(els, restoreHistoryItem);
    showToast('Cálculo guardado en historial.');
  }
  return result;
}

function isEmptyForMode(raw) {
  if (raw.mode === 'time') return !Number.isFinite(raw.distanceInput) && !Number.isFinite(raw.paceInputSec);
  if (raw.mode === 'pace') return !Number.isFinite(raw.distanceInput) && !Number.isFinite(raw.timeInputSec);
  return !Number.isFinite(raw.timeInputSec) && !Number.isFinite(raw.paceInputSec);
}

function restoreHistoryItem(item) {
  state.unit = item.unit || state.unit;
  writePreference('unit', state.unit);
  updateUnitButtons(els.unitButtons, state.unit);
  updateUnitLabels(state.unit);
  setMode(item.mode || 'time');
  els.distanceInput.value = item.distance || '';
  els.paceInput.value = item.pace || '';
  els.timeInput.value = item.time || '';
  els.gradeInput.value = item.grade || '0';
  els.terrainSelect.value = item.terrain || 'road';
  renderZones(els, state.unit);
  computeAndRender({ save: false, silentEmpty: true });
  showToast('Cálculo restaurado.');
}

function resetAll() {
  els.distanceInput.value = '';
  els.paceInput.value = '';
  els.timeInput.value = '';
  els.gradeInput.value = '0';
  els.terrainSelect.value = 'road';
  clearFieldErrors(els);
  state.lastResult = null;
  state.lastResultText = '';
  renderEmpty(els);
  renderProjectionPlaceholder(els, state.unit);
  els.distanceInput.focus();
}

async function copyResult() {
  if (!state.lastResultText) {
    showToast('No hay resultado para copiar.');
    return;
  }
  try {
    await navigator.clipboard.writeText(state.lastResultText);
    showToast('Resultado copiado.');
  } catch {
    showToast('No se ha podido copiar automáticamente.');
  }
}

async function shareResult() {
  if (!state.lastResultText) {
    showToast('No hay resultado para compartir.');
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({ title: 'CarreraCalc', text: state.lastResultText });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }
  await copyResult();
}

function formatInputDistance(value) {
  if (!Number.isFinite(value)) return '';
  const fixed = value >= 100 ? 1 : 3;
  return String(Number(value.toFixed(fixed))).replace('.', ',');
}
