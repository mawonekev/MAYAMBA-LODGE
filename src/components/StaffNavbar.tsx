'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function StaffNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [staff, setStaff] = useState<{ id: string; username: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/staff/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.staff) {
          setStaff(data.staff);
        } else {
          router.push('/staff/login');
        }
      })
      .catch(() => router.push('/staff/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/staff/auth/logout', { method: 'POST' });
    router.push('/staff/login');
  };

  return (
    <header style={{ background: '#0a0f0c', borderBottom: '1px solid #334438' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '65px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/staff" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="brand-symbol" style={{ width: '32px', height: '32px', fontSize: '0.95rem' }}>M</div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                MAYAMBA LODGE
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--gold-primary)', letterSpacing: '0.1em' }}>
                STAFF ADMIN PANEL
              </div>
            </div>
          </Link>
        </div>

        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '1.25rem', alignItems: 'center', margin: 0, padding: 0 }}>
            <li>
              <Link
                href="/staff"
                className={`nav-item ${pathname === '/staff' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
                id="staff-nav-dashboard"
              >
                📊 Metrics
              </Link>
            </li>
            <li>
              <Link
                href="/staff/availability"
                className={`nav-item ${pathname === '/staff/availability' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
                id="staff-nav-availability"
              >
                📅 Availability (FR-8)
              </Link>
            </li>
            <li>
              <Link
                href="/staff/rates"
                className={`nav-item ${pathname === '/staff/rates' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
                id="staff-nav-rates"
              >
                💲 Rates (FR-9)
              </Link>
            </li>
            <li>
              <Link
                href="/staff/content"
                className={`nav-item ${pathname === '/staff/content' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
                id="staff-nav-content"
              >
                📝 Content (FR-10)
              </Link>
            </li>
            <li>
              <Link
                href="/staff/guests"
                className={`nav-item ${pathname === '/staff/guests' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
                id="staff-nav-guests"
              >
                👥 Guests (FR-11)
              </Link>
            </li>
            <li>
              <Link
                href="/staff/flags"
                className={`nav-item ${pathname === '/staff/flags' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
                id="staff-nav-flags"
              >
                🚩 Flags (FR-12)
              </Link>
            </li>
            <li>
              <Link
                href="/staff/payments"
                className={`nav-item ${pathname === '/staff/payments' ? 'active' : ''}`}
                style={{ fontSize: '0.85rem' }}
                id="staff-nav-payments"
              >
                💳 Payments (FR-13)
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {staff && (
            <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
              👤 {staff.username} ({staff.role})
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            id="staff-logout-btn"
          >
            Log Out
          </button>
          <Link href="/" className="btn btn-secondary btn-sm" style={{ opacity: 0.7 }}>
            Guest App ↗
          </Link>
        </div>
      </div>
    </header>
  );
}
