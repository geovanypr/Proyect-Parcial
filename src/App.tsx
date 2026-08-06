import { useState } from "react";
import CurrencyConverter from "./components/CurrencyConverter";
import UnitConverter from "./components/UnitConverter";
import "./styles.css";

type Tab = "currency" | "units";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("currency");

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">
            <span className="logo-icon">⟳</span> ConvertX
          </h1>
          <p className="tagline">Conversor de monedas y unidades</p>
        </div>
      </header>

      <main className="main">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "currency" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("currency")}
          >
            💱 Monedas
          </button>
          <button
            className={`tab-btn ${activeTab === "units" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("units")}
          >
            📐 Unidades
          </button>
        </div>

        <div className="converter-wrapper">
          {activeTab === "currency" ? (
            <CurrencyConverter />
          ) : (
            <UnitConverter />
          )}
        </div>
      </main>

      <footer className="footer">
        <p>ConvertX — Los tipos de cambio son aproximados y de uso educativo</p>
      </footer>
    </div>
  );
}
