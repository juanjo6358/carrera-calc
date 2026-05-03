import test from 'node:test';
import assert from 'node:assert/strict';

import { calculate, calculateHrZones, projectRaces } from '../src/js/calculator.js';
import { formatDuration, parseDuration, parsePace } from '../src/js/formatters.js';
import { distanceFromKm, distanceToKm, paceFromSecPerKm, paceToSecPerKm } from '../src/js/units.js';

test('parsea ritmos en formatos habituales', () => {
  assert.equal(parsePace('4:40'), 280);
  assert.equal(parsePace("4'40"), 280);
  assert.equal(parsePace('4.5'), 270);
  assert.equal(parsePace('270s'), 270);
  assert.equal(parsePace('4m30s'), 270);
});

test('parsea tiempos en formatos habituales', () => {
  assert.equal(parseDuration('45:16'), 2716);
  assert.equal(parseDuration('1:25:30'), 5130);
  assert.equal(parseDuration('90'), 5400);
  assert.equal(parseDuration('5400s'), 5400);
  assert.equal(parseDuration('1h25m'), 5100);
});

test('convierte km y millas correctamente', () => {
  assert.equal(Number(distanceFromKm(10, 'mi').toFixed(4)), 6.2137);
  assert.equal(Number(distanceToKm(6.2137119, 'mi').toFixed(3)), 10);
  assert.equal(Number(paceFromSecPerKm(300, 'mi').toFixed(3)), 482.803);
  assert.equal(Number(paceToSecPerKm(482.8032, 'mi').toFixed(3)), 300);
});

test('calcula tiempo desde distancia y ritmo', () => {
  const result = calculate({ mode: 'time', distanceInput: 10, paceInputSec: 300, unit: 'km', gradePercent: 0, terrain: 'road' });
  assert.equal(result.ok, true);
  assert.equal(formatDuration(result.timeSec), '50:00');
});

test('calcula ritmo desde distancia y tiempo', () => {
  const result = calculate({ mode: 'pace', distanceInput: 10, timeInputSec: 3000, unit: 'km', gradePercent: 0, terrain: 'road' });
  assert.equal(result.ok, true);
  assert.equal(result.displayPaceSec, 300);
});

test('calcula distancia desde tiempo y ritmo', () => {
  const result = calculate({ mode: 'distance', timeInputSec: 3000, paceInputSec: 300, unit: 'km', gradePercent: 0, terrain: 'road' });
  assert.equal(result.ok, true);
  assert.equal(result.displayDistance, 10);
});

test('proyecta carreras estándar', () => {
  const result = calculate({ mode: 'time', distanceInput: 10, paceInputSec: 300, unit: 'km', gradePercent: 0, terrain: 'road' });
  const projections = projectRaces(result, 'linear');
  assert.equal(projections.length, 4);
  assert.equal(formatDuration(projections[0].timeSec), '25:00');
});

test('calcula zonas de FC con Karvonen si hay reposo', () => {
  const zones = calculateHrZones(190, 60);
  assert.equal(zones[0].method, 'Karvonen');
  assert.equal(zones[0].bpmLow, 125);
});
