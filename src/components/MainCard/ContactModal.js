import React from 'react';

function ContactModal({ isOpen, onClose, onConfirm, onAddNew }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div id="contact-modal" className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Verifica Contatto</h3>
          <button onClick={onClose} className="modal-close-button">
            <svg viewBox="0 0 24 24"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <p>Trovati 2 contatti con nome simile:</p>
          <div className="radio-group">
            <label className="radio-label"> <input type="radio" name="contact" value="1" /> <div> <p>Mario Rossi</p> <span>Via Roma 123, Roma - CF: RSSMRA80A01H501Z</span> </div> </label>
            <label className="radio-label"> <input type="radio" name="contact" value="2" /> <div> <p>Mario Rossi</p> <span>Via Milano 45, Roma - CF: RSSMRA75B15H501W</span> </div> </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="link-button" onClick={onAddNew}>Aggiungi nuovo contatto</button>
          <div className="modal-footer-actions">
            <button className="button-secondary" onClick={onClose}>Annulla</button>
            <button className="button-primary" onClick={onConfirm}>Conferma</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactModal;