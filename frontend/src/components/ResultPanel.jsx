import { AlertCircle, Info, Loader2 } from 'lucide-react'
import { MODELS } from '../config/models'

const percent = (p) => `${(p * 100).toFixed(1)}%`

function modelLabel(value) {
  return MODELS.find((m) => m.value === value)?.label ?? value
}

export default function ResultPanel({ status, result, error }) {
  if (status === 'loading') {
    return (
      <div className="result-state" role="status" aria-live="polite">
        <Loader2 className="spin" size={28} aria-hidden="true" />
        <p className="result-state-title">Analyzing image…</p>
        <p className="muted">
          The first request may take up to 20 seconds while the model warms up.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="result-state is-error" role="alert">
        <AlertCircle size={28} aria-hidden="true" />
        <p className="result-state-title">Prediction failed</p>
        <p className="muted">{error}</p>
      </div>
    )
  }

  if (status !== 'success' || !result) return null

  const entries = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1])

  return (
    <div className="result">
      <div className="result-head">
        <span className="eyebrow">Prediction · {modelLabel(result.model)}</span>
        <h2 className="result-label">{result.label}</h2>
        <p className="result-confidence">
          <strong>{percent(result.confidence)}</strong> confidence
        </p>
      </div>

      <ul className="bars">
        {entries.map(([name, p]) => (
          <li key={name} className={name === result.label ? 'bar is-top' : 'bar'}>
            <div className="bar-row">
              <span>{name}</span>
              <span className="bar-value">{percent(p)}</span>
            </div>
            <div
              className="bar-track"
              role="meter"
              aria-label={name}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(p * 100)}
            >
              <div className="bar-fill" style={{ width: `${p * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>

      <p className="notice">
        <Info size={16} aria-hidden="true" />
        For educational purposes only. Not a medical diagnosis.
      </p>
    </div>
  )
}
