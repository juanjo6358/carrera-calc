import { HR_ZONES, PACE_ZONES, RACES_KM, TERRAIN } from './constants.js';
import { distanceFromKm, distanceToKm, paceFromSecPerKm, paceToSecPerKm, speedFromSecPerKm } from './units.js';

export function adjustedPaceSecPerKm(secPerKm, gradePercent = 0, terrainKey = 'road') {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return NaN;
  const terrain = TERRAIN[terrainKey] ?? TERRAIN.road;
  const gradePenalty = gradePercent >= 0 ? gradePercent * 12 : gradePercent * 8;
  return Math.max(1, secPerKm + gradePenalty + terrain.penaltySecPerKm);
}

export function flatEquivalentPaceSecPerKm(secPerKm, gradePercent = 0, terrainKey = 'road') {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return NaN;
  const terrain = TERRAIN[terrainKey] ?? TERRAIN.road;
  const gradePenalty = gradePercent >= 0 ? gradePercent * 12 : gradePercent * 8;
  return Math.max(1, secPerKm - gradePenalty - terrain.penaltySecPerKm);
}

export function calculate({ mode, distanceInput, paceInputSec, timeInputSec, unit = 'km', gradePercent = 0, terrain = 'road' }) {
  const distanceKm = Number.isFinite(distanceInput) ? distanceToKm(distanceInput, unit) : NaN;
  const paceSecPerKm = Number.isFinite(paceInputSec) ? paceToSecPerKm(paceInputSec, unit) : NaN;
  const adjustedPace = adjustedPaceSecPerKm(paceSecPerKm, gradePercent, terrain);

  if (mode === 'time') {
    if (!Number.isFinite(distanceKm) || !Number.isFinite(paceSecPerKm)) {
      return { ok: false, errors: { distance: !Number.isFinite(distanceKm), pace: !Number.isFinite(paceSecPerKm) }, message: 'Necesitas una distancia y un ritmo válidos.' };
    }
    const baseTimeSec = distanceKm * paceSecPerKm;
    const adjustedTimeSec = distanceKm * adjustedPace;
    return buildResult({ mode, distanceKm, paceSecPerKm, adjustedPaceSecPerKm: adjustedPace, timeSec: adjustedTimeSec, baseTimeSec, unit, gradePercent, terrain });
  }

  if (mode === 'pace') {
    if (!Number.isFinite(distanceKm) || !Number.isFinite(timeInputSec)) {
      return { ok: false, errors: { distance: !Number.isFinite(distanceKm), time: !Number.isFinite(timeInputSec) }, message: 'Necesitas una distancia y un tiempo válidos.' };
    }
    const calculatedPaceSecPerKm = timeInputSec / distanceKm;
    const equivalentFlatPace = flatEquivalentPaceSecPerKm(calculatedPaceSecPerKm, gradePercent, terrain);
    return buildResult({ mode, distanceKm, paceSecPerKm: calculatedPaceSecPerKm, adjustedPaceSecPerKm: adjustedPaceSecPerKm(calculatedPaceSecPerKm, gradePercent, terrain), equivalentFlatPaceSecPerKm: equivalentFlatPace, timeSec: timeInputSec, baseTimeSec: timeInputSec, unit, gradePercent, terrain });
  }

  if (mode === 'distance') {
    if (!Number.isFinite(timeInputSec) || !Number.isFinite(paceSecPerKm)) {
      return { ok: false, errors: { time: !Number.isFinite(timeInputSec), pace: !Number.isFinite(paceSecPerKm) }, message: 'Necesitas un tiempo y un ritmo válidos.' };
    }
    const baseDistanceKm = timeInputSec / paceSecPerKm;
    const adjustedDistanceKm = timeInputSec / adjustedPace;
    return buildResult({ mode, distanceKm: adjustedDistanceKm, baseDistanceKm, paceSecPerKm, adjustedPaceSecPerKm: adjustedPace, timeSec: timeInputSec, baseTimeSec: timeInputSec, unit, gradePercent, terrain });
  }

  return { ok: false, errors: {}, message: 'Modo de cálculo no reconocido.' };
}

function buildResult(payload) {
  const speed = speedFromSecPerKm(payload.paceSecPerKm, payload.unit);
  return {
    ok: true,
    ...payload,
    displayDistance: distanceFromKm(payload.distanceKm, payload.unit),
    displayBaseDistance: Number.isFinite(payload.baseDistanceKm) ? distanceFromKm(payload.baseDistanceKm, payload.unit) : undefined,
    displayPaceSec: paceFromSecPerKm(payload.paceSecPerKm, payload.unit),
    displayAdjustedPaceSec: paceFromSecPerKm(payload.adjustedPaceSecPerKm, payload.unit),
    displayEquivalentFlatPaceSec: Number.isFinite(payload.equivalentFlatPaceSecPerKm) ? paceFromSecPerKm(payload.equivalentFlatPaceSecPerKm, payload.unit) : undefined,
    speed,
  };
}

export function projectRaces(result, model = 'linear') {
  if (!result?.ok || !Number.isFinite(result.distanceKm) || !Number.isFinite(result.timeSec) || result.distanceKm <= 0 || result.timeSec <= 0) {
    return [];
  }

  const baseDistanceKm = result.mode === 'distance' && Number.isFinite(result.baseDistanceKm)
    ? result.baseDistanceKm
    : result.distanceKm;
  const basePace = result.paceSecPerKm;
  const adjustedPace = result.adjustedPaceSecPerKm;

  return RACES_KM.map((race) => {
    let timeSec;
    let adjustedTimeSec;

    if (model === 'riegel') {
      const exponent = 1.06;
      const baseTime = result.mode === 'time' && Number.isFinite(result.baseTimeSec)
        ? result.baseTimeSec
        : baseDistanceKm * basePace;
      const adjustedBaseTime = result.distanceKm * adjustedPace;
      timeSec = baseTime * Math.pow(race.km / baseDistanceKm, exponent);
      adjustedTimeSec = adjustedBaseTime * Math.pow(race.km / Math.max(result.distanceKm, 0.001), exponent);
    } else {
      timeSec = race.km * basePace;
      adjustedTimeSec = race.km * adjustedPace;
    }

    return { ...race, timeSec, adjustedTimeSec };
  });
}

export function calculateHrZones(hrMax, hrRest) {
  if (!Number.isFinite(hrMax) || hrMax <= 0) return [];
  const hasRest = Number.isFinite(hrRest) && hrRest > 0 && hrRest < hrMax;
  const reserve = hasRest ? hrMax - hrRest : null;

  return HR_ZONES.map((zone) => {
    const low = hasRest ? hrRest + reserve * zone.low : hrMax * zone.low;
    const high = hasRest ? hrRest + reserve * zone.high : hrMax * zone.high;
    return {
      ...zone,
      method: hasRest ? 'Karvonen' : '% FCmáx',
      bpmLow: Math.round(low),
      bpmHigh: Math.round(high),
    };
  });
}

export function calculatePaceZones(thresholdSecPerUnit) {
  if (!Number.isFinite(thresholdSecPerUnit) || thresholdSecPerUnit <= 0) return [];

  return PACE_ZONES.map((zone) => ({
    ...zone,
    slowSec: thresholdSecPerUnit * zone.lowFactor,
    fastSec: thresholdSecPerUnit * zone.highFactor,
  }));
}
