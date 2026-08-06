interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export default function SelectInput({
  id,
  label,
  value,
  onChange,
  options,
}: SelectInputProps) {
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-input"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
