const DECIMAL_COMMA = /,/g;

function normalizeInput(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(DECIMAL_COMMA, '.');
}

function readNumber(value) {
  const n = Number.parseFloat(normalizeInput(value));
  return Number.isFinite(n) ? n : NaN;
}

export function parseDistance(value) {
  const n = readNumber(value);
  return n > 0 ? n : NaN;
}

export function parseGrade(value) {
  const n = readNumber(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(-30, Math.min(30, n));
}

export function parseInteger(value) {
  const n = Number.parseInt(normalizeInput(value), 10);
  return Number.isFinite(n) ? n : NaN;
}

function parseColonParts(raw) {
  const parts = raw
    .replace(/[’']/g, ':')
    .replace(/\s+/g, '')
    .split(':')
    .filter(Boolean);

  if (parts.length < 2 || parts.length > 3) return NaN;

  const nums = parts.map((part) => Number.parseFloat(part));
  if (nums.some((part) => !Number.isFinite(part))) return NaN;

  if (parts.length === 2) {
    const [minutes, seconds] = nums;
    if (minutes < 0 || seconds < 0 || seconds >= 60) return NaN;
    return Math.round(minutes * 60 + seconds);
  }

  const [hours, minutes, seconds] = nums;
  if (hours < 0 || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) return NaN;
  return Math.round(hours * 3600 + minutes * 60 + seconds);
}

export function parseDuration(value) {
  const raw = normalizeInput(value);
  if (!raw) return NaN;

  if (raw.includes(':') || raw.includes("'") || raw.includes('’')) {
    return parseColonParts(raw);
  }

  const longMatch = raw.match(/^(?:(\d+(?:\.\d+)?)h)?\s*(?:(\d+(?:\.\d+)?)m(?:in)?)?\s*(?:(\d+(?:\.\d+)?)s)?$/);
  if (longMatch && (longMatch[1] || longMatch[2] || longMatch[3])) {
    const hours = Number.parseFloat(longMatch[1] || '0');
    const minutes = Number.parseFloat(longMatch[2] || '0');
    const seconds = Number.parseFloat(longMatch[3] || '0');
    return Math.round(hours * 3600 + minutes * 60 + seconds);
  }

  if (/^\d+(?:\.\d+)?s$/.test(raw)) {
    return Math.round(Number.parseFloat(raw) || 0);
  }

  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return NaN;

  // En tiempos, un número suelto se interpreta como minutos: 45 -> 45:00.
  return Math.round(n * 60);
}

export function parsePace(value) {
  const raw = normalizeInput(value);
  if (!raw) return NaN;

  if (raw.includes(':') || raw.includes("'") || raw.includes('’')) {
    return parseColonParts(raw);
  }

  const paceMatch = raw.match(/^(?:(\d+(?:\.\d+)?)m(?:in)?)?\s*(?:(\d+(?:\.\d+)?)s)?$/);
  if (paceMatch && (paceMatch[1] || paceMatch[2])) {
    const minutes = Number.parseFloat(paceMatch[1] || '0');
    const seconds = Number.parseFloat(paceMatch[2] || '0');
    const total = Math.round(minutes * 60 + seconds);
    return total > 0 ? total : NaN;
  }

  if (/^\d+(?:\.\d+)?s$/.test(raw)) {
    const total = Math.round(Number.parseFloat(raw));
    return total > 0 ? total : NaN;
  }

  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return NaN;

  // En ritmos, un número suelto se interpreta como minutos por unidad: 4.5 -> 4:30.
  return Math.round(n * 60);
}

export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return '—';
  const sign = totalSeconds < 0 ? '-' : '';
  let secondsLeft = Math.round(Math.abs(totalSeconds));
  const hours = Math.floor(secondsLeft / 3600);
  secondsLeft %= 3600;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return hours > 0
    ? `${sign}${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${sign}${minutes}:${pad(seconds)}`;
}

export function formatPace(secPerUnit) {
  return formatDuration(secPerUnit);
}

export function formatDistance(value, unit, decimals = 2) {
  if (!Number.isFinite(value)) return '—';
  const rounded = Number(value.toFixed(decimals));
  return `${formatNumber(rounded, decimals)} ${unit}`;
}

export function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: value % 1 === 0 ? 0 : Math.min(decimals, 2),
  }).format(value);
}
