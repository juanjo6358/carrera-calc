"use client";

import { useState, useEffect } from "react";
import { unitDistanceLabel, unitPaceLabel, unitSpeedLabel } from "../lib/units";
import { formatPace, parseDistance, parseDuration, parsePace, formatDistance, formatDuration, formatNumber } from "../lib/formatters";
import { calculate } from "../lib/calculator";
import { pushHistory, readPreference, writePreference } from "../lib/storage";

import Projections from "../components/Projections";
import Zones from "../components/Zones";
import History from "../components/History";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState("time");
  const [unit, setUnit] = useState("km");
  
  const [distanceInput, setDistanceInput] = useState("");
  const [paceInput, setPaceInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [gradeInput, setGradeInput] = useState("0");
  const [terrain, setTerrain] = useState("road");
  
  const [result, setResult] = useState(null);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setUnit(readPreference("unit", "km"));
  }, []);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    writePreference("unit", newUnit);
  };

  const handleCalculate = () => {
    const raw = {
      mode,
      distanceInput: parseDistance(distanceInput),
      paceInputSec: parsePace(paceInput),
      timeInputSec: parseDuration(timeInput),
      unit,
      gradePercent: parseFloat(gradeInput?.replace(",", ".") || "0") || 0,
      terrain,
    };
    
    const res = calculate(raw);
    if (res.ok) {
      setResult(res);
      pushHistory({
        mode,
        unit,
        main: mode === 'time' ? res.timeFmt : mode === 'pace' ? res.paceFmt : res.distanceFmt,
        sub: `Ajustado: ${res.gradePercent !== 0 || res.terrain !== 'road' ? 'Sí' : 'No'}`,
        distance: distanceInput,
        pace: paceInput,
        time: timeInput,
        grade: gradeInput,
        terrain: terrain
      });
      setHistoryTrigger(prev => prev + 1);
    } else {
      setResult(null);
      alert("Error: Por favor, revisa los datos introducidos.");
    }
  };

  const restoreHistory = (item) => {
    setMode(item.mode);
    setUnit(item.unit || "km");
    setDistanceInput(item.distance || "");
    setPaceInput(item.pace || "");
    setTimeInput(item.time || "");
    setGradeInput(item.grade || "0");
    setTerrain(item.terrain || "road");
  };

  const applyPreset = (km) => {
    setDistanceInput(km.toString().replace(".", ","));
    // Optionally focus the next field
  };

  const isModeTime = mode === "time";
  const isModePace = mode === "pace";
  const isModeDistance = mode === "distance";

  if (!isClient) return null; // Avoid hydration mismatch for localStorage data

  return (
    <div className="app-shell" data-theme="auto">
      <header className="app-header">
        <div className="brand-block">
          <div className="app-mark" aria-hidden="true"><span></span></div>
          <div className="brand-copy">
            <p className="eyebrow">Running calculator</p>
            <h1>CarreraCalc</h1>
            <p>Calcula ritmos, tiempos y objetivos sin perderte entre opciones.</p>
          </div>
        </div>
        
        <details className="settings-panel">
          <summary aria-label="Abrir preferencias">
            <span>Preferencias</span>
            <strong data-current-unit>{unit}</strong>
          </summary>
          <div className="settings-panel__body">
            <div className="control-group">
              <span className="control-group__label">Unidades</span>
              <button className={`chip ${unit === 'km' ? 'is-active' : ''}`} onClick={() => handleUnitChange('km')}>km</button>
              <button className={`chip ${unit === 'mi' ? 'is-active' : ''}`} onClick={() => handleUnitChange('mi')}>mi</button>
            </div>
          </div>
        </details>
      </header>

      <main className="main-grid">
        <section className="card calculator-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Cálculo principal</p>
              <h2>¿Qué quieres saber?</h2>
            </div>
            <p className="section-hint">Elige el dato que quieres calcular. Ocultaremos ese campo.</p>
          </div>

          <fieldset className="mode-group">
            <legend className="sr-only">Modo de cálculo</legend>
            <input id="mode-time" name="mode" type="radio" value="time" checked={isModeTime} onChange={(e) => setMode(e.target.value)} />
            <label htmlFor="mode-time">
              <span>Tiempo</span>
              <small>distancia + ritmo</small>
            </label>
            
            <input id="mode-pace" name="mode" type="radio" value="pace" checked={isModePace} onChange={(e) => setMode(e.target.value)} />
            <label htmlFor="mode-pace">
              <span>Ritmo</span>
              <small>distancia + tiempo</small>
            </label>
            
            <input id="mode-distance" name="mode" type="radio" value="distance" checked={isModeDistance} onChange={(e) => setMode(e.target.value)} />
            <label htmlFor="mode-distance">
              <span>Distancia</span>
              <small>tiempo + ritmo</small>
            </label>
          </fieldset>

          <div className="quick-block">
            <div className="quick-block__label">Distancias rápidas</div>
            <div className="presets">
              <button type="button" className="preset" onClick={() => applyPreset(5)}><strong>5K</strong><span>popular</span></button>
              <button type="button" className="preset" onClick={() => applyPreset(10)}><strong>10K</strong><span>control</span></button>
              <button type="button" className="preset" onClick={() => applyPreset(21.0975)}><strong>Media</strong><span>21,1 km</span></button>
              <button type="button" className="preset" onClick={() => applyPreset(42.195)}><strong>Maratón</strong><span>42,2 km</span></button>
            </div>
          </div>

          <form className="input-grid" onSubmit={(e) => e.preventDefault()}>
            {!isModeDistance && (
              <div className="input-card">
                <div className="label-row">
                  <label htmlFor="distanceInput">Distancia</label>
                  <span className="field-unit">{unitDistanceLabel(unit)}</span>
                </div>
                <input id="distanceInput" type="text" inputMode="decimal" value={distanceInput} onChange={(e) => setDistanceInput(e.target.value)} placeholder="9,70" />
                <p className="help-text">Ej.: 5, 9.7 o 21,097.</p>
              </div>
            )}

            {!isModePace && (
              <div className="input-card">
                <div className="label-row">
                  <label htmlFor="paceInput">Ritmo</label>
                  <span className="field-unit">{unitPaceLabel(unit)}</span>
                </div>
                <input id="paceInput" type="text" inputMode="decimal" value={paceInput} onChange={(e) => setPaceInput(e.target.value)} placeholder="4:40" />
                <p className="help-text">Ej.: 4:40, 4'40 o 4.5.</p>
              </div>
            )}

            {!isModeTime && (
              <div className="input-card">
                <div className="label-row">
                  <label htmlFor="timeInput">Tiempo</label>
                  <span className="field-unit">hh:mm:ss</span>
                </div>
                <input id="timeInput" type="text" inputMode="decimal" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} placeholder="45:16" />
                <p className="help-text">Ej.: 45:16, 1:25:30 o 90.</p>
              </div>
            )}
          </form>

          <details className="soft-disclosure route-disclosure">
            <summary>
              <span>Ajustes de ruta</span>
              <small>desnivel y terreno</small>
            </summary>
            <div className="disclosure-content compact-grid">
              <div className="input-card input-card--subtle">
                <label htmlFor="gradeInput">Pendiente media (%)</label>
                <input id="gradeInput" type="text" inputMode="decimal" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)} />
                <p className="help-text">Subida positiva, bajada negativa.</p>
              </div>
              <div className="input-card input-card--subtle">
                <label htmlFor="terrainSelect">Terreno</label>
                <select id="terrainSelect" value={terrain} onChange={(e) => setTerrain(e.target.value)}>
                  <option value="road">Asfalto / pista lisa</option>
                  <option value="trail_mod">Trail moderado</option>
                  <option value="trail_tech">Trail técnico</option>
                </select>
                <p className="help-text">Estimación orientativa.</p>
              </div>
            </div>
          </details>

          <div className="form-actions">
            <button className="button button--secondary" onClick={() => { setDistanceInput(""); setPaceInput(""); setTimeInput(""); setGradeInput("0"); setTerrain("road"); setResult(null); }}>Limpiar</button>
            <button className="button button--primary" onClick={handleCalculate}>Calcular</button>
          </div>
        </section>

        <aside className="results-column">
          <section className="result-card">
            <div className="result-topline">
              <div>
                <p className="eyebrow">Resultado</p>
                <output className="main-result">
                  {result ? (
                    mode === 'time' ? result.timeFmt :
                    mode === 'pace' ? result.paceFmt :
                    result.distanceFmt
                  ) : "—"}
                </output>
              </div>
              <span className={`badge ${result?.ok ? '' : 'badge--error'}`}>{result ? "Calculado" : "Listo"}</span>
            </div>
            
            <div className="metrics-grid">
              <div className="metric"><span>Ritmo</span><strong>{result ? formatPace(result.displayPaceSec) + " " + unitPaceLabel(unit) : "—"}</strong></div>
              <div className="metric"><span>Velocidad</span><strong>{result ? formatNumber(result.speed, 2) + " " + unitSpeedLabel(unit) : "—"}</strong></div>
              <div className="metric"><span>Distancia</span><strong>{result ? formatDistance(result.displayDistance, unit, 2) : "—"}</strong></div>
              <div className="metric"><span>Tiempo</span><strong>{result ? formatDuration(result.timeSec) : "—"}</strong></div>
            </div>
          </section>

          <section className="advanced-stack">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Opciones avanzadas</p>
                <h2>Análisis extra</h2>
              </div>
            </div>
            
            <Projections result={result} unit={unit} />
            <Zones unit={unit} />
            <History historyTrigger={historyTrigger} onRestore={restoreHistory} />
          </section>
        </aside>
      </main>
    </div>
  );
}
