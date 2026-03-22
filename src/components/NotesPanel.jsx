import React from 'react'
import useStore from '../store/useStore.js'

export default function NotesPanel({ exercise, onClose }) {
  const setSubstitution = useStore((s) => s.setSubstitution)
  const session = useStore((s) => s.session)

  if (!exercise) return null

  const activeSubIndex = session?.substitutions[exercise.id]

  const handleSub = (index) => {
    setSubstitution(exercise.id, index)
    onClose()
  }

  const handleUseOriginal = () => {
    setSubstitution(exercise.id, undefined)
    onClose()
  }

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />

        <div className="bottom-sheet-title">{exercise.name}</div>

        {/* Coaching Notes */}
        <div className="section-title">Coaching Notes</div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text2)', marginBottom: 16 }}>
          {exercise.notes}
        </p>

        {/* Image Placeholder */}
        <div className="image-placeholder">
          <div className="image-placeholder-icon">📷</div>
          <div>Image placeholder — add exercise photo</div>
        </div>

        {/* Substitutions */}
        <div className="section-title">Substitutions</div>
        <div className="sub-buttons">
          {/* Original exercise */}
          <button
            className={`sub-btn ${activeSubIndex === undefined ? 'active' : ''}`}
            onClick={handleUseOriginal}
          >
            <span className="sub-btn-icon">🏋️</span>
            <span className="sub-btn-text">
              <div className="sub-btn-label">Original</div>
              <div className="sub-btn-name">{exercise.name}</div>
            </span>
            {activeSubIndex === undefined && (
              <span style={{ color: 'var(--accent)', fontSize: 18 }}>✓</span>
            )}
          </button>

          {exercise.subs.map((subName, idx) => (
            <button
              key={idx}
              className={`sub-btn ${activeSubIndex === idx ? 'active' : ''}`}
              onClick={() => handleSub(idx)}
            >
              <span className="sub-btn-icon">🔄</span>
              <span className="sub-btn-text">
                <div className="sub-btn-label">Sub {idx + 1}</div>
                <div className="sub-btn-name">{subName}</div>
              </span>
              {activeSubIndex === idx && (
                <span style={{ color: 'var(--accent)', fontSize: 18 }}>✓</span>
              )}
            </button>
          ))}
        </div>

        <button
          className="btn btn-secondary btn-full mt-16"
          onClick={onClose}
          style={{ marginBottom: 8 }}
        >
          Done
        </button>
      </div>
    </div>
  )
}
