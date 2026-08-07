import { useState } from "react";
import { currencies, convertCurrency } from "../data/currencies";
import SelectInput from "./SelectInput";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");

  const currencyOptions = currencies.map((c) => ({
    value: c.code,
    label: `${c.symbol} ${c.code} — ${c.name}`,
  }));

  const parsedAmount = parseFloat(amount);
  const isValidAmount = amount !== "" && !isNaN(parsedAmount) && parsedAmount >= 0;

  const result = isValidAmount
    ? convertCurrency(parsedAmount, fromCurrency, toCurrency)
    : null;

  const toSymbol = currencies.find((c) => c.code === toCurrency)?.symbol ?? "";

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  function formatResult(value: number): string {
    if (toCurrency === "JPY") {
      return value.toLocaleString("es-DO", { maximumFractionDigits: 0 });
    }
    return value.toLocaleString("es-DO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return (
    <div className="converter-card">
      <h2 className="converter-title">💱 Monedas</h2>

      <div className="field-group">
        <label htmlFor="amount" className="field-label">
          Cantidad
        </label>
        <input
          id="amount"
          type="number"
          min="0"
          placeholder="Ingresa una cantidad..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="number-input"
        />
      </div>

      <div className="row-fields">
        <SelectInput
          id="from-currency"
          label="De"
          value={fromCurrency}
          onChange={setFromCurrency}
          options={currencyOptions}
        />

        <button
          onClick={handleSwap}
          className="swap-btn"
          title="Intercambiar monedas"
          aria-label="Intercambiar monedas"
        >
          ⇄
        </button>

        <SelectInput
          id="to-currency"
          label="A"
          value={toCurrency}
          onChange={setToCurrency}
          options={currencyOptions}
        />
      </div>

      <div className="result-box">
        {!isValidAmount ? (
          <p className="result-placeholder">
            Ingresa una cantidad para ver el resultado
          </p>
        ) : result === null ? (
          <p className="result-error">No se pudo realizar la conversión</p>
        ) : (
          <>
            <p className="result-label">Resultado</p>
            <p className="result-value">
              {toSymbol} {formatResult(result)}{" "}
              <span className="result-code">{toCurrency}</span>
            </p>
            <p className="result-note">
              1 {fromCurrency} ={" "}
              {formatResult(convertCurrency(1, fromCurrency, toCurrency) ?? 0)}{" "}
              {toCurrency}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
