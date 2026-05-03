import { RACES_KM } from '../constants.js';
import { projectRaces } from '../calculator.js';
import { formatDistance, formatDuration } from '../formatters.js';
import { distanceFromKm } from '../units.js';

export function renderProjections(els, result, unit) {
  if (!result?.ok) {
    renderProjectionPlaceholder(els, unit);
    return;
  }

  const projections = projectRaces(result, els.projectionModel.value);
  els.projectionBody.innerHTML = projections.map((row) => {
    const displayDistance = distanceFromKm(row.km, unit);
    return `
      <tr>
        <td><strong>${row.label}</strong></td>
        <td>${formatDistance(displayDistance, unit, 2)}</td>
        <td><code>${formatDuration(row.timeSec)}</code></td>
        <td><code>${formatDuration(row.adjustedTimeSec)}</code></td>
      </tr>
    `;
  }).join('');
}

export function renderProjectionPlaceholder(els, unit) {
  els.projectionBody.innerHTML = RACES_KM.map((race) => `
    <tr>
      <td><strong>${race.label}</strong></td>
      <td>${formatDistance(distanceFromKm(race.km, unit), unit, 2)}</td>
      <td><code>—</code></td>
      <td><code>—</code></td>
    </tr>
  `).join('');
}
