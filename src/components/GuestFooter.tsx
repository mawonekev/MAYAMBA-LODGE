'use client';

import React from 'react';
import Link from 'next/link';

export default function GuestFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand-text" style={{ marginBottom: '0.75rem' }}>
              <span className="brand-name" style={{ color: 'var(--gold-primary)' }}>
                MAYAMBA LODGE
              </span>
              <span className="brand-tagline">Authentic Riverside Wildlife Sanctuary</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              Operating strictly from verified lodge records. Direct booking without intermediary commissions.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Guest Services</h4>
            <ul className="footer-list">
              <li>
                <Link href="/guest/availability" className="footer-link">
                  Search Room Availability
                </Link>
              </li>
              <li>
                <Link href="/guest/rooms" className="footer-link">
                  Chalets & Rates
                </Link>
              </li>
              <li>
                <Link href="/guest/hotel-info" className="footer-link">
                  Lodge Fact Sheet & Hours
                </Link>
              </li>
              <li>
                <Link href="/guest/bookings" className="footer-link">
                  Look Up Existing Reservation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Support & Integrity</h4>
            <ul className="footer-list">
              <li>
                <Link href="/guest/flag" className="footer-link">
                  Report Inaccurate Content (FR-7)
                </Link>
              </li>
              <li>
                <Link href="/guest/auth" className="footer-link">
                  Guest Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/staff/login" className="footer-link">
                  Staff Administrative Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {new Date().getFullYear()} Mayamba Lodge. All rights reserved. Operating on Demonstration Test Data.</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Verified Database Records</span>
            <span>•</span>
            <span>Zero AI Hallucination Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
