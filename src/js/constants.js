export const KM_PER_MI = 1.609344;

export const RACES_KM = [
  { key: '5k', label: '5K', km: 5 },
  { key: '10k', label: '10K', km: 10 },
  { key: 'half', label: 'Media maratón', km: 21.0975 },
  { key: 'marathon', label: 'Maratón', km: 42.195 },
];

export const TERRAIN = {
  road: { label: 'Asfalto / pista lisa', penaltySecPerKm: 0 },
  trail_mod: { label: 'Trail moderado', penaltySecPerKm: 20 },
  trail_tech: { label: 'Trail técnico', penaltySecPerKm: 40 },
};

export const HR_ZONES = [
  { name: 'Z1', use: 'Recuperación', low: 0.50, high: 0.60 },
  { name: 'Z2', use: 'Base aeróbica', low: 0.60, high: 0.70 },
  { name: 'Z3', use: 'Tempo suave', low: 0.70, high: 0.80 },
  { name: 'Z4', use: 'Umbral', low: 0.80, high: 0.90 },
  { name: 'Z5', use: 'VO₂ / alta intensidad', low: 0.90, high: 1.00 },
];

export const PACE_ZONES = [
  { name: 'Z1', use: 'Recuperación', lowFactor: 1.28, highFactor: 1.16 },
  { name: 'Z2', use: 'Rodaje cómodo', lowFactor: 1.16, highFactor: 1.07 },
  { name: 'Z3', use: 'Tempo', lowFactor: 1.07, highFactor: 1.00 },
  { name: 'Z4', use: 'Umbral', lowFactor: 1.00, highFactor: 0.94 },
  { name: 'Z5', use: 'Intervalos', lowFactor: 0.94, highFactor: 0.88 },
];
