import { toResizedJpegBase64 } from '../utils/image'

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const MOCK_CLASSES = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']

function abortError() {
  return new DOMException('The request was aborted.', 'AbortError')
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(abortError())
      },
      { once: true },
    )
  })
}

async function mockPredict(model, signal) {
  await delay(1500, signal)
  const raw = MOCK_CLASSES.map(() => Math.random() ** 3)
  const total = raw.reduce((a, b) => a + b, 0)
  const probabilities = Object.fromEntries(MOCK_CLASSES.map((c, i) => [c, raw[i] / total]))
  const [label, confidence] = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0]
  return { model, label, confidence, probabilities }
}

export async function predict({ model, file, signal }) {
  const image = await toResizedJpegBase64(file)
  if (signal?.aborted) throw abortError()

  if (USE_MOCK) return mockPredict(model, signal)

  if (!API_URL) throw new Error('VITE_API_URL is not configured.')

  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, image }),
    signal,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Request failed (HTTP ${res.status}).`)
  }
  if (!data?.probabilities) throw new Error('Unexpected response from the server.')
  return data
}
