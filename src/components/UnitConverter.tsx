import { useState } from "react";
import { unitGroups, convertUnit } from "../data/units";
import type { UnitCategory } from "../types";
import SelectInput from "./SelectInput";

export default function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [value, setValue] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("km");

  const categoryOptions = unitGroups.map((g) => ({
    value: g.category,
    label: getCategoryEmoji(g.category) + " " + g.label,
  }));

  const currentGroup = unitGroups.find((g) => g.category === category)!;
  const unitOptions = currentGroup.units.map((u) => ({
    value: u.id,
    label: u.label,
  }));

  function getCategoryEmoji(cat: UnitCategory): string {
    switch (cat) {
      case "length":
        return "📏";
      case "weight":
        return "⚖️";
      case "temperature":
        return "🌡️";
    }
  }

  function handleCategoryChange(newCategory: string) {
    const cat = newCategory as UnitCategory;
    setCategory(cat);
    setValue("");
    const group = unitGroups.find((g) => g.category === cat)!;
    setFromUnit(group.units[0].id);
    setToUnit(group.units[1].id);
  }

  function handleSwap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  const parsedValue = parseFloat(value);
  const isValid = value !== "" && !isNaN(parsedValue);

  const result = isValid
    ? convertUnit(parsedValue, fromUnit, toUnit, category)
    : null;

  function formatResult(val: number): string {
    if (Number.isInteger(val)) return val.toLocaleString("es-DO");
    const abs = Math.abs(val);
    if (abs >= 1000) {
      return val.toLocaleString("es-DO", { maximumFractionDigits: 2 });
    }
    if (abs >= 1) {
      return val.toLocaleString("es-DO", { maximumFractionDigits: 4 });
    }
    return val.toLocaleString("es-DO", { maximumFractionDigits: 8 });
  }

  function getUnitLabel(id: string): string {
    return currentGroup.units.find((u) => u.id === id)?.label ?? id;
  }

  return (
    <div className="converter-card">
      <h2 className="converter-title">📐 Unidades</h2>

      <SelectInput
        id="unit-category"
        label="Categoría"
        value={category}
        onChange={handleCategoryChange}
        options={categoryOptions}
      />

      <div className="field-group">
        <label htmlFor="unit-value" className="field-label">
          Valor
        </label>
        <input
          id="unit-value"
          type="number"
          placeholder="Ingresa un valor..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="number-input"
        />
      </div>

      <div className="row-fields">
        <SelectInput
          id="from-unit"
          label="De"
          value={fromUnit}
          onChange={setFromUnit}
          options={unitOptions}
        />

        <button
          onClick={handleSwap}
          className="swap-btn"
          title="Intercambiar unidades"
          aria-label="Intercambiar unidades"
        >
          ⇄
        </button>

        <SelectInput
          id="to-unit"
          label="A"
          value={toUnit}
          onChange={setToUnit}
          options={unitOptions}
        />
      </div>

      <div className="result-box">
        {!isValid ? (
          <p className="result-placeholder">
            Ingresa un valor para ver el resultado
          </p>
        ) : result === null ? (
          <p className="result-error">No se pudo realizar la conversión</p>
        ) : (
          <>
            <p className="result-label">Resultado</p>
            <p className="result-value">
              {formatResult(result)}{" "}
              <span className="result-code">{toUnit.toUpperCase()}</span>
            </p>
            <p className="result-note">
              {formatResult(parsedValue)} {getUnitLabel(fromUnit).split("(")[0].trim()} ={" "}
              {formatResult(result)} {getUnitLabel(toUnit).split("(")[0].trim()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
