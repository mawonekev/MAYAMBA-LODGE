'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Application Error caught by boundary:', error);
  }, [error]);

  const isDatabaseError =
    error.message?.includes('database') ||
    error.message?.includes('Prisma') ||
    error.message?.includes('connect') ||
    error.message?.includes('ECONNREFUSED');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d120f',
        color: '#f3f5f3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #d4a34b 0%, #8c6320 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: '#0d120f',
          }}
        >
          M
        </div>

        <span
          style={{
            background: 'rgba(217, 83, 79, 0.15)',
            color: '#ff8585',
            border: '1px solid rgba(217, 83, 79, 0.3)',
            borderRadius: '9999px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block',
            marginBottom: '0.75rem',
          }}
        >
          {isDatabaseError ? 'Database Connection Notice' : 'Application Notice'}
        </span>

        <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.75rem' }}>
          {isDatabaseError
            ? 'Live Database Connection Required'
            : 'Service Temporarily Unavailable'}
        </h1>

        <p style={{ color: '#9aa99c', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          {isDatabaseError
            ? 'Mayamba Lodge operates strictly on live, verified database records (zero AI guessing). If running on Vercel, please ensure your remote PostgreSQL connection string is configured in Vercel Project Settings under DATABASE_URL.'
            : 'An unexpected exception occurred while retrieving records. Our systems are designed never to invent or guess answers.'}
        </p>

        {error.digest && (
          <div
            style={{
              background: '#151c17',
              border: '1px solid #2b392f',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.75rem',
              fontSize: '0.8rem',
              color: '#6d7d6f',
              fontFamily: 'monospace',
            }}
          >
            Diagnostic Error Digest: {error.digest}
          </div>
        )}

        {/* Refusal Contact Direct Card */}
        <div
          style={{
            background: 'linear-gradient(145deg, #241914 0%, #17110e 100%)',
            border: '1px solid #733c2a',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
          }}
        >
          <div style={{ color: '#ff9b85', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            Direct Human Reservations Assistance (PRD Section 6)
          </div>
          <p style={{ color: '#e3d3c8', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Whenever verified records are unreachable, all inquiries route directly to our reservations desk:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <a
              href="https://wa.me/263771234567"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid #5a3224',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#fff',
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              <span>💬</span>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#b59f93', textTransform: 'uppercase' }}>WhatsApp Desk</div>
                <div style={{ fontWeight: '600' }}>+263 77 123 4567</div>
              </div>
            </a>

            <a
              href="mailto:reservations@mayambalodge.internal"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid #5a3224',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#fff',
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              <span>✉️</span>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#b59f93', textTransform: 'uppercase' }}>Email Desk</div>
                <div style={{ fontWeight: '600' }}>reservations@mayambalodge.internal</div>
              </div>
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: 'linear-gradient(135deg, #d4a34b 0%, #b08130 100%)',
              color: '#0d120f',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Retry Connection
          </button>
          <Link
            href="/"
            style={{
              background: '#1e2922',
              color: '#f3f5f3',
              border: '1px solid #2b392f',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
