import React from 'react';
import { X } from 'lucide-react';
import s from './Modal.module.css';
export default function Modal({ title, children, onClose, onConfirm, confirmLabel='OK', danger=false }) {
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e=>e.stopPropagation()}>
        <div className={s.header}><span>{title}</span><button onClick={onClose}><X size={16}/></button></div>
        <div className={s.body}>{children}</div>
        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
          {onConfirm && <button className={danger?s.dangerBtn:s.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>}
        </div>
      </div>
    </div>
  );
}
