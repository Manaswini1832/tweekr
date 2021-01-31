import React from 'react'
import ReactDom from 'react-dom'
import "./Modal.css";

export default function Modal({ open, children, onClose }) {
  if (!open) return null

  return ReactDom.createPortal(
    <div>
      <div onClick={onClose} className="overlay" />
      <div className="modal">
        {children}
      </div>
    </div>,
    document.getElementById('portal')
  )
}