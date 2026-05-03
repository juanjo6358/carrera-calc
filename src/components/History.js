"use client";

import { useState, useEffect } from "react";
import { readHistory, clearHistory as clearStorageHistory } from "../lib/storage";

export default function History({ historyTrigger, onRestore }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(readHistory());
  }, [historyTrigger]);

  const handleClear = () => {
    clearStorageHistory();
    setHistory([]);
    alert("Historial vaciado.");
  };

  return (
    <details className="accordion">
      <summary>
        <span>Historial</span>
        <small>últimos cálculos</small>
      </summary>
      <div className="accordion-content">
        <div className="history-toolbar">
          <p className="help-text">Toca un cálculo para restaurarlo.</p>
          <button className="button button--ghost button--small" type="button" onClick={handleClear}>Vaciar</button>
        </div>
        <div className="history-list" aria-live="polite">
          {history.length > 0 ? (
            history.map((item) => (
              <button key={item.id} className="history-item" type="button" onClick={() => onRestore(item)}>
                <strong>{item.main}</strong>
                <span>{item.sub}</span>
              </button>
            ))
          ) : (
            <p className="empty-state">Todavía no hay cálculos guardados.</p>
          )}
        </div>
      </div>
    </details>
  );
}
