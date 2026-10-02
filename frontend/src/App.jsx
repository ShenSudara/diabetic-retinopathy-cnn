import { useEffect, useRef, useState } from 'react'
import { Eye, RotateCcw, Upload, X } from 'lucide-react'
import UploadZone from './components/UploadZone'
import ModelSelect from './components/ModelSelect'
import ResultPanel from './components/ResultPanel'
import ResultModal from './components/ResultModal'
import { DEFAULT_MODEL } from './config/models'
import { predict } from './services/api'

const WIDE_QUERY = '(min-width: 1024px)'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export default function App() {
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const abortRef = useRef(null)
  const isWide = useMediaQuery(WIDE_QUERY)

  const loading = status === 'loading'

  useEffect(() => () => abortRef.current?.abort(), [])

  function resetResult() {
    setStatus('idle')
    setResult(null)
    setError('')
    setModalOpen(false)
  }

  function handleSelect(next) {
    setFile(next)
    setFileError('')
    resetResult()
  }

  async function handleUpload() {
    if (!file || loading) return
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setResult(null)
    setError('')
    setModalOpen(true)

    try {
      const data = await predict({ model, file, signal: controller.signal })
      if (abortRef.current !== controller) return
      setResult(data)
      setStatus('success')
      setModalOpen(true)
    } catch (err) {
      // A stale controller means Cancel/Clear already reset the UI.
      if (abortRef.current !== controller) return
      if (err.name === 'AbortError') {
        resetResult()
      } else {
        setError(err.message || 'Something went wrong.')
        setStatus('error')
        setModalOpen(true)
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  function handleCancel() {
    if (loading) {
      abortRef.current?.abort()
      abortRef.current = null
      resetResult()
    } else {
      setFile(null)
      setFileError('')
      resetResult()
    }
  }

  function handleClear() {
    abortRef.current?.abort()
    abortRef.current = null
    setFile(null)
    setFileError('')
    setModel(DEFAULT_MODEL)
    resetResult()
  }

  const showPanel = isWide && status !== 'idle'

  return (
    <div className="app">
      <header className="app-header">
        <span className="brand-dot" aria-hidden="true" />
        <div>
          <h1>Diabetic Retinopathy Screening</h1>
          <p className="muted">Upload a retinal fundus image and choose a CNN model to grade it.</p>
        </div>
      </header>

      <main className={showPanel ? 'layout has-panel' : 'layout'}>
        <section className="card" aria-labelledby="upload-heading">
          <div className="card-head">
            <h2 id="upload-heading">Image</h2>
            <button
              type="button"
              className="button ghost"
              onClick={handleClear}
              disabled={!file && status === 'idle' && model === DEFAULT_MODEL && !fileError}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Clear
            </button>
          </div>

          <UploadZone file={file} onSelect={handleSelect} onError={setFileError} disabled={loading} />
          {fileError && (
            <p className="field-error" role="alert">
              {fileError}
            </p>
          )}

          <ModelSelect value={model} onChange={setModel} disabled={loading} />

          <div className="actions">
            <button type="button" className="button primary" onClick={handleUpload} disabled={!file || loading}>
              <Upload size={16} aria-hidden="true" />
              {loading ? 'Uploading…' : 'Upload'}
            </button>
            <button type="button" className="button secondary" onClick={handleCancel} disabled={!file && !loading}>
              <X size={16} aria-hidden="true" />
              Cancel
            </button>
            {!isWide && status !== 'idle' && !modalOpen && (
              <button type="button" className="button ghost" onClick={() => setModalOpen(true)}>
                <Eye size={16} aria-hidden="true" />
                View result
              </button>
            )}
          </div>
        </section>

        {showPanel && (
          <section className="card result-card" aria-label="Prediction result">
            <ResultPanel status={status} result={result} error={error} />
          </section>
        )}
      </main>

      {!isWide && (
        <ResultModal
          open={modalOpen && status !== 'idle'}
          onClose={() => setModalOpen(false)}
          status={status}
          result={result}
          error={error}
        />
      )}
    </div>
  )
}
