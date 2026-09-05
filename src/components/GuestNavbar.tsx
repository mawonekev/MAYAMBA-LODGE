'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GuestNavbar() {
  const pathname = usePathname();
  const [guest, setGuest] = useState<{ id: string; phoneNumber: string } | null>(null);

  useEffect(() => {
    fetch('/api/guest/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.guest) {
          setGuest(data.guest);
        } else {
          setGuest(null);
        }
      })
      .catch(() => setGuest(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/guest/auth/logout', { method: 'POST' });
    setGuest(null);
    window.location.href = '/guest/auth';
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-link" id="nav-brand-link">
          <div className="brand-symbol">M</div>
          <div className="brand-text">
            <span className="brand-name">MAYAMBA LODGE</span>
            <span className="brand-tagline">Riverside Safari Sanctuary</span>
          </div>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <Link
                href="/guest/availability"
                className={`nav-item ${pathname === '/guest/availability' ? 'active' : ''}`}
                id="nav-availability"
              >
                Search Dates
              </Link>
            </li>
            <li>
              <Link
                href="/guest/rooms"
                className={`nav-item ${pathname.startsWith('/guest/rooms') ? 'active' : ''}`}
                id="nav-rooms"
              >
                Rooms & Rates
              </Link>
            </li>
            <li>
              <Link
                href="/guest/hotel-info"
                className={`nav-item ${pathname === '/guest/hotel-info' ? 'active' : ''}`}
                id="nav-hotel-info"
              >
                Lodge Info
              </Link>
            </li>
            <li>
              <Link
                href="/guest/bookings"
                className={`nav-item ${pathname.startsWith('/guest/bookings') ? 'active' : ''}`}
                id="nav-bookings"
              >
                My Bookings
              </Link>
            </li>
            <li>
              <Link
                href="/guest/flag"
                className={`nav-item ${pathname === '/guest/flag' ? 'active' : ''}`}
                id="nav-flag"
              >
                Report Issue
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          {guest ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-gold" title="Signed in guest">
                📱 {guest.phoneNumber}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                id="guest-signout-btn"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/guest/auth" className="btn btn-primary btn-sm" id="guest-signin-link">
              Sign In
            </Link>
          )}
          <Link
            href="/staff/login"
            className="btn btn-secondary btn-sm"
            style={{ opacity: 0.75, fontSize: '0.75rem' }}
            id="staff-portal-link"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </header>
  );
}
