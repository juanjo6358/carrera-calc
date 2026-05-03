"use client";

import { useState } from "react";
import { calculateHrZones, calculatePaceZones } from "../lib/calculator";
import { formatPace, parseInteger, parsePace } from "../lib/formatters";
import { unitPaceLabel } from "../lib/units";

export default function Zones({ unit }) {
  const [zonesType, setZonesType] = useState("hr");
  const [hrMax, setHrMax] = useState("");
  const [hrRest, setHrRest] = useState("");
  const [ltPace, setLtPace] = useState("");

  const hrZones = calculateHrZones(parseInteger(hrMax), parseInteger(hrRest));
  const paceZones = calculatePaceZones(parsePace(ltPace));

  return (
    <details className="accordion">
      <summary>
        <span>Zonas de entrenamiento</span>
        <small>FC o ritmo umbral</small>
      </summary>
      <div className="accordion-content">
        <fieldset className="mini-segmented">
          <legend className="sr-only">Tipo de zonas</legend>
          <input id="zonesByHr" name="zonesType" type="radio" value="hr" checked={zonesType === "hr"} onChange={() => setZonesType("hr")} />
          <label htmlFor="zonesByHr">Frecuencia cardíaca</label>
          
          <input id="zonesByPace" name="zonesType" type="radio" value="pace" checked={zonesType === "pace"} onChange={() => setZonesType("pace")} />
          <label htmlFor="zonesByPace">Ritmo umbral</label>
        </fieldset>

        {zonesType === "hr" ? (
          <div className="zone-panel">
            <div className="compact-grid">
              <div className="input-card input-card--subtle">
                <label htmlFor="hrMaxInput">FC máxima</label>
                <input id="hrMaxInput" type="text" inputMode="numeric" placeholder="190" value={hrMax} onChange={(e) => setHrMax(e.target.value)} />
              </div>
              <div className="input-card input-card--subtle">
                <label htmlFor="hrRestInput">FC reposo <span className="muted">opcional</span></label>
                <input id="hrRestInput" type="text" inputMode="numeric" placeholder="60" value={hrRest} onChange={(e) => setHrRest(e.target.value)} />
              </div>
            </div>
            <div className="table-wrap" tabIndex="0" aria-label="Tabla de zonas de frecuencia cardíaca">
              <table>
                <thead>
                  <tr><th scope="col">Zona</th><th scope="col">Intensidad</th><th scope="col">BPM</th></tr>
                </thead>
                <tbody>
                  {hrZones.length > 0 ? (
                    hrZones.map((zone, i) => (
                      <tr key={i}>
                        <td><strong>{zone.name}</strong><br/><span>{zone.use}</span></td>
                        <td>{Math.round(zone.low * 100)}–{Math.round(zone.high * 100)}% · {zone.method}</td>
                        <td><code>{zone.bpmLow}–{zone.bpmHigh}</code></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">Introduce tu FC máxima para calcular zonas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="zone-panel">
            <div className="input-card input-card--subtle input-card--wide">
              <div className="label-row">
                <label htmlFor="ltPaceInput">Ritmo umbral</label>
                <span className="field-unit">{unitPaceLabel(unit)}</span>
              </div>
              <input id="ltPaceInput" type="text" inputMode="decimal" placeholder="4:20" value={ltPace} onChange={(e) => setLtPace(e.target.value)} />
            </div>
            <div className="table-wrap" tabIndex="0" aria-label="Tabla de zonas por ritmo">
              <table>
                <thead>
                  <tr><th scope="col">Zona</th><th scope="col">Uso</th><th scope="col">Ritmo</th></tr>
                </thead>
                <tbody>
                  {paceZones.length > 0 ? (
                    paceZones.map((zone, i) => (
                      <tr key={i}>
                        <td><strong>{zone.name}</strong></td>
                        <td>{zone.use}</td>
                        <td><code>{formatPace(zone.fastSec)}–{formatPace(zone.slowSec)} {unitPaceLabel(unit)}</code></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3">Introduce tu ritmo umbral para calcular zonas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
