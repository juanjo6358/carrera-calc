const PREFIX = 'carrera-calc:';
const HISTORY_LIMIT = 8;

function key(name) {
  return `${PREFIX}${name}`;
}

export function readPreference(name, fallback) {
  try {
    return localStorage.getItem(key(name)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePreference(name, value) {
  try {
    localStorage.setItem(key(name), value);
  } catch {
    // noop
  }
}

export function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(key('history')) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushHistory(item) {
  const history = readHistory();
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const next = [{ id, createdAt: new Date().toISOString(), ...item }, ...history].slice(0, HISTORY_LIMIT);
  try {
    localStorage.setItem(key('history'), JSON.stringify(next));
  } catch {
    // noop
  }
  return next;
}

export function clearHistory() {
  try {
    localStorage.removeItem(key('history'));
  } catch {
    // noop
  }
}
