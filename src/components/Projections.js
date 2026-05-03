"use client";

import { useState } from "react";
import { RACES_KM } from "../lib/constants";
import { projectRaces } from "../lib/calculator";
import { formatDistance, formatDuration } from "../lib/formatters";
import { distanceFromKm } from "../lib/units";

export default function Projections({ result, unit }) {
  const [model, setModel] = useState("linear");
  
  const projections = result?.ok ? projectRaces(result, model) : null;

  return (
    <details className="accordion" open>
      <summary>
        <span>Proyecciones</span>
        <small>5K · 10K · media · maratón</small>
      </summary>
      <div className="accordion-content">
        <div className="table-toolbar">
          <label htmlFor="projectionModelSelect">Modelo</label>
          <select id="projectionModelSelect" value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="linear">Lineal</option>
            <option value="riegel">Riegel</option>
          </select>
        </div>
        <div className="table-wrap" tabIndex="0" aria-label="Tabla de proyecciones con scroll horizontal si hace falta">
          <table>
            <thead>
              <tr>
                <th scope="col">Prueba</th>
                <th scope="col">Distancia</th>
                <th scope="col">Tiempo</th>
                <th scope="col">Ajustado</th>
              </tr>
            </thead>
            <tbody>
              {projections ? (
                projections.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row.label}</strong></td>
                    <td>{formatDistance(distanceFromKm(row.km, unit), unit, 2)}</td>
                    <td><code>{formatDuration(row.timeSec)}</code></td>
                    <td><code>{formatDuration(row.adjustedTimeSec)}</code></td>
                  </tr>
                ))
              ) : (
                RACES_KM.map((race, i) => (
                  <tr key={i}>
                    <td><strong>{race.label}</strong></td>
                    <td>{formatDistance(distanceFromKm(race.km, unit), unit, 2)}</td>
                    <td><code>—</code></td>
                    <td><code>—</code></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
