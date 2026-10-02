import { useEffect, useRef, useState } from 'react'
import { ImageUp } from 'lucide-react'
import { ACCEPTED_TYPES, isAcceptedImage } from '../utils/image'

export default function UploadZone({ file, onSelect, onError, disabled }) {
  const inputRef = useRef(null)
  const previewRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    previewRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleFile(candidate) {
    if (!candidate) return
    if (!isAcceptedImage(candidate)) {
      onError('Unsupported file. Please choose a JPEG or PNG image.')
      return
    }
    onSelect(candidate)
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (!disabled) handleFile(e.dataTransfer.files?.[0])
  }

  const className = [
    'dropzone',
    dragging && 'is-dragging',
    file && 'has-preview',
    disabled && 'is-disabled',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={file ? `Selected image: ${file.name}. Press to choose another.` : 'Choose a retinal image'}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      // dragleave also fires when moving over child elements; ignore those.
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          // Reset so re-selecting the same file still fires onChange.
          e.target.value = ''
        }}
      />

      {file ? (
        <>
          <img ref={previewRef} className="dropzone-preview" alt="Selected retinal image preview" />
          <span className="dropzone-filename">{file.name}</span>
        </>
      ) : (
        <div className="dropzone-empty">
          <span className="dropzone-icon">
            <ImageUp size={28} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <p className="dropzone-title">Drop a fundus image here</p>
          <p className="dropzone-hint">or click to browse · JPEG or PNG</p>
        </div>
      )}
    </div>
  )
}
