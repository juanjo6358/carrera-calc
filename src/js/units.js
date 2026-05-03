import { KM_PER_MI } from './constants.js';

export function distanceToKm(value, unit) {
  return unit === 'mi' ? value * KM_PER_MI : value;
}

export function distanceFromKm(km, unit) {
  return unit === 'mi' ? km / KM_PER_MI : km;
}

export function paceToSecPerKm(secPerDisplayUnit, unit) {
  return unit === 'mi' ? secPerDisplayUnit / KM_PER_MI : secPerDisplayUnit;
}

export function paceFromSecPerKm(secPerKm, unit) {
  return unit === 'mi' ? secPerKm * KM_PER_MI : secPerKm;
}

export function speedFromSecPerKm(secPerKm, unit) {
  if (!Number.isFinite(secPerKm) || secPerKm <= 0) return NaN;
  const kmh = 3600 / secPerKm;
  return unit === 'mi' ? kmh / KM_PER_MI : kmh;
}

export function unitDistanceLabel(unit) {
  return unit === 'mi' ? 'mi' : 'km';
}

export function unitPaceLabel(unit) {
  return unit === 'mi' ? '/mi' : '/km';
}

export function unitSpeedLabel(unit) {
  return unit === 'mi' ? 'mph' : 'km/h';
}
