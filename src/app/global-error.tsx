'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#0d120f', color: '#f3f5f3', margin: 0, padding: '2rem', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
          <h1 style={{ color: '#d4a34b' }}>Mayamba Lodge</h1>
          <h2>System Notice</h2>
          <p style={{ color: '#9aa99c', lineHeight: '1.6' }}>
            A server error occurred while retrieving verified records.
            {error.digest && <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.5rem' }}>Digest: {error.digest}</span>}
          </p>
          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={() => reset()}
              style={{
                background: '#d4a34b',
                color: '#0d120f',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
