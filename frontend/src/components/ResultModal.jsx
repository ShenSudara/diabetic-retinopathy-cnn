import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import ResultPanel from './ResultPanel'

export default function ResultModal({ open, onClose, ...panelProps }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-label="Prediction result"
      onClose={onClose}
      // The dialog element itself is only the click target when the backdrop is clicked.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-body">
        <button type="button" className="icon-button modal-close" onClick={onClose} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </button>
        <ResultPanel {...panelProps} />
      </div>
    </dialog>
  )
}
