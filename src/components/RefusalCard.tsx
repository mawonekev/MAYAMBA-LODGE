'use client';

import React from 'react';

interface RefusalCardProps {
  reason?: 'records_silent' | 'refund_or_dispute' | 'payment_unclear' | string;
  message?: string;
  whatsappNumber?: string;
  reservationsEmail?: string;
  onContactClick?: () => void;
}

export default function RefusalCard({
  reason = 'records_silent',
  message,
  whatsappNumber = '+263771234567',
  reservationsEmail = 'reservations@mayambalodge.internal',
}: RefusalCardProps) {
  // WhatsApp clean digits link
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Mayamba Lodge Reservations Team, I am contacting you regarding an inquiry on the guest app.'
  )}`;
  const mailtoUrl = `mailto:${reservationsEmail}?subject=${encodeURIComponent(
    'Mayamba Lodge Guest Inquiry'
  )}`;

  let defaultHeader = 'Information Not in Current Records';
  let defaultMessage =
    'The requested information is not yet available in Mayamba Lodge verified records. Our system never estimates or guesses. Please reach our reservations team directly:';

  if (reason === 'refund_or_dispute') {
    defaultHeader = 'Handoff to Reservations Desk Required';
    defaultMessage =
      'In accordance with Mayamba Lodge policy, all inquiries regarding refunds, disputed amounts, and private guest records are handled exclusively in person by our reservations team.';
  } else if (reason === 'payment_unclear') {
    defaultHeader = 'Payment Status Pending Verification';
    defaultMessage =
      'This transaction requires verification with the reservations desk. Please reach out to our team with your reference details.';
  }

  return (
    <div className="refusal-box" role="alert">
      <div className="refusal-header">
        <span>🛡️</span>
        <span>{defaultHeader}</span>
      </div>
      <p className="refusal-message">{message || defaultMessage}</p>

      <div className="refusal-contact-grid">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="refusal-contact-card"
          id="refusal-whatsapp-link"
        >
          <span className="refusal-icon">💬</span>
          <div>
            <div className="refusal-label">Direct WhatsApp Desk</div>
            <div className="refusal-value">{whatsappNumber}</div>
          </div>
        </a>

        <a
          href={mailtoUrl}
          className="refusal-contact-card"
          id="refusal-email-link"
        >
          <span className="refusal-icon">✉️</span>
          <div>
            <div className="refusal-label">Reservations Email</div>
            <div className="refusal-value">{reservationsEmail}</div>
          </div>
        </a>
      </div>
    </div>
  );
}
