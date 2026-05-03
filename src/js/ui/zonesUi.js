import { calculateHrZones, calculatePaceZones } from '../calculator.js';
import { setHidden } from '../dom.js';
import { formatPace, parseInteger, parsePace } from '../formatters.js';
import { unitPaceLabel } from '../units.js';

export function renderZones(els, unit) {
  updateZonesPanel(els);
  renderHrZones(els);
  renderPaceZones(els, unit);
}

export function updateZonesPanel(els) {
  setHidden(els.hrZonesPanel, !els.zonesByHr.checked);
  setHidden(els.paceZonesPanel, !els.zonesByPace.checked);
}

function renderHrZones(els) {
  const hrMax = parseInteger(els.hrMaxInput.value);
  const hrRest = parseInteger(els.hrRestInput.value);
  const zones = calculateHrZones(hrMax, hrRest);

  if (!zones.length) {
    els.hrZonesBody.innerHTML = '<tr><td colspan="3">Introduce tu FC máxima para calcular zonas.</td></tr>';
    return;
  }

  els.hrZonesBody.innerHTML = zones.map((zone) => `
    <tr>
      <td><strong>${zone.name}</strong><br><span>${zone.use}</span></td>
      <td>${Math.round(zone.low * 100)}–${Math.round(zone.high * 100)}% · ${zone.method}</td>
      <td><code>${zone.bpmLow}–${zone.bpmHigh}</code></td>
    </tr>
  `).join('');
}

function renderPaceZones(els, unit) {
  const thresholdSec = parsePace(els.ltPaceInput.value);
  const zones = calculatePaceZones(thresholdSec);

  if (!zones.length) {
    els.paceZonesBody.innerHTML = '<tr><td colspan="3">Introduce tu ritmo umbral para calcular zonas.</td></tr>';
    return;
  }

  els.paceZonesBody.innerHTML = zones.map((zone) => `
    <tr>
      <td><strong>${zone.name}</strong></td>
      <td>${zone.use}</td>
      <td><code>${formatPace(zone.fastSec)}–${formatPace(zone.slowSec)} ${unitPaceLabel(unit)}</code></td>
    </tr>
  `).join('');
}
