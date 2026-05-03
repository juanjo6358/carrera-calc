import { formatDistance, formatDuration, formatNumber, formatPace, parsePace } from '../formatters.js';
import { adjustedPaceSecPerKm } from '../calculator.js';
import { paceFromSecPerKm, paceToSecPerKm, unitPaceLabel, unitSpeedLabel } from '../units.js';
import { renderFieldErrors } from './formUi.js';

export function renderEmpty(els) {
  els.resultLabel.textContent = 'Resultado';
  els.resultBadge.textContent = 'Listo';
  els.resultBadge.classList.remove('badge--error');
  els.mainResult.textContent = '—';
  els.subResult.textContent = 'Introduce los datos para empezar.';
  setMetrics(els);
  renderGradeInsight(els, null);
}

export function renderError(els, result) {
  els.resultLabel.textContent = 'Faltan datos';
  els.resultBadge.textContent = 'Revisar';
  els.resultBadge.classList.add('badge--error');
  els.mainResult.textContent = '—';
  els.subResult.textContent = result.message || 'Revisa los campos marcados.';
  setMetrics(els);
  renderFieldErrors(result.errors);
}

export function renderResult(els, result, unit) {
  const distanceLabel = formatDistance(result.displayDistance, unit, 2);
  const paceLabel = `${formatPace(result.displayPaceSec)} ${unitPaceLabel(unit)}`;
  const adjustedPaceLabel = `${formatPace(result.displayAdjustedPaceSec)} ${unitPaceLabel(unit)}`;
  const timeLabel = formatDuration(result.timeSec);
  const speedLabel = `${formatNumber(result.speed, 2)} ${unitSpeedLabel(unit)}`;
  const adjusted = hasGradeAdjustment(result);

  els.resultBadge.textContent = adjusted ? 'Ajustado' : 'Calculado';
  els.resultBadge.classList.remove('badge--error');

  if (result.mode === 'time') {
    els.resultLabel.textContent = adjusted ? 'Tiempo estimado ajustado' : 'Tiempo estimado';
    els.mainResult.textContent = timeLabel;
    els.subResult.textContent = adjusted
      ? `Base: ${formatDuration(result.baseTimeSec)} · ritmo ajustado: ${adjustedPaceLabel}`
      : `Para ${distanceLabel} a ${paceLabel}.`;
  }

  if (result.mode === 'pace') {
    els.resultLabel.textContent = 'Ritmo medio';
    els.mainResult.textContent = paceLabel;
    els.subResult.textContent = adjusted && Number.isFinite(result.displayEquivalentFlatPaceSec)
      ? `Equivalente llano estimado: ${formatPace(result.displayEquivalentFlatPaceSec)} ${unitPaceLabel(unit)}.`
      : `Para completar ${distanceLabel} en ${timeLabel}.`;
  }

  if (result.mode === 'distance') {
    els.resultLabel.textContent = adjusted ? 'Distancia estimada ajustada' : 'Distancia estimada';
    els.mainResult.textContent = distanceLabel;
    els.subResult.textContent = adjusted && Number.isFinite(result.displayBaseDistance)
      ? `En llano sería aprox. ${formatDistance(result.displayBaseDistance, unit, 2)}.`
      : `Durante ${timeLabel} a ${paceLabel}.`;
  }

  setMetrics(els, { pace: paceLabel, speed: speedLabel, distance: distanceLabel, time: timeLabel });
}

export function setMetrics(els, { pace = '—', speed = '—', distance = '—', time = '—' } = {}) {
  els.metricPace.textContent = pace;
  els.metricSpeed.textContent = speed;
  els.metricDistance.textContent = distance;
  els.metricTime.textContent = time;
}

export function renderGradeInsight(els, result, unit = 'km') {
  if (!result?.ok || !Number.isFinite(result.displayAdjustedPaceSec)) {
    els.gradeInsight.textContent = '—';
    els.gradeExplanation.textContent = 'Calculado al introducir un ritmo.';
    return;
  }

  const inputPaceSec = result.mode === 'pace'
    ? result.paceSecPerKm
    : paceToSecPerKm(parsePace(els.paceInput.value), unit);
  const adjusted = adjustedPaceSecPerKm(inputPaceSec, result.gradePercent, result.terrain);
  els.gradeInsight.textContent = `${formatPace(paceFromSecPerKm(adjusted, unit))} ${unitPaceLabel(unit)}`;
  els.gradeExplanation.textContent = hasGradeAdjustment(result)
    ? `Incluye pendiente ${formatNumber(result.gradePercent, 1)}% y terreno seleccionado.`
    : 'Sin penalización adicional.';
}

export function buildShareText(els, result, unit) {
  const modeLabel = result.mode === 'time' ? 'Tiempo' : result.mode === 'pace' ? 'Ritmo' : 'Distancia';
  const lines = [
    `CarreraCalc · ${modeLabel}`,
    `Resultado: ${els.mainResult.textContent}`,
    `Detalle: ${els.subResult.textContent}`,
    `Distancia: ${formatDistance(result.displayDistance, unit, 2)}`,
    `Ritmo: ${formatPace(result.displayPaceSec)} ${unitPaceLabel(unit)}`,
    `Tiempo: ${formatDuration(result.timeSec)}`,
    `Velocidad: ${formatNumber(result.speed, 2)} ${unitSpeedLabel(unit)}`,
  ];
  if (hasGradeAdjustment(result)) lines.push(`Desnivel/terreno aplicado: ${formatNumber(result.gradePercent, 1)}%`);
  return lines.join('\n');
}

export function hasGradeAdjustment(result) {
  return Math.abs(result.gradePercent || 0) > 0.0001 || result.terrain !== 'road';
}
