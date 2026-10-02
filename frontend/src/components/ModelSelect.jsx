import { MODELS } from '../config/models'

export default function ModelSelect({ value, onChange, disabled }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor="model-select">
        Model
      </label>
      <select
        id="model-select"
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {MODELS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  )
}
