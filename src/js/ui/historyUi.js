import { $$ } from '../dom.js';
import { readHistory } from '../storage.js';

export function makeHistoryItem(els, result, unit) {
  return {
    mode: result.mode,
    unit,
    main: els.mainResult.textContent,
    sub: els.subResult.textContent,
    distance: els.distanceInput.value,
    pace: els.paceInput.value,
    time: els.timeInput.value,
    grade: els.gradeInput.value,
    terrain: els.terrainSelect.value,
  };
}

export function renderHistory(els, onRestore) {
  const history = readHistory();
  if (!history.length) {
    els.historyList.innerHTML = '<p class="empty-state">Todavía no hay cálculos guardados.</p>';
    return;
  }

  els.historyList.innerHTML = history.map((item) => `
    <button class="history-item" type="button" data-history-id="${item.id}">
      <strong>${escapeHtml(item.main)}</strong>
      <span>${escapeHtml(item.sub)}</span>
    </button>
  `).join('');

  $$('[data-history-id]', els.historyList).forEach((button) => {
    button.addEventListener('click', () => {
      const item = history.find((entry) => entry.id === button.dataset.historyId);
      if (item) onRestore(item);
    });
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
