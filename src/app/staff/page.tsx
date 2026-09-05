'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StaffNavbar from '@/components/StaffNavbar';

interface MetricsData {
  conversion: {
    searchEventCount: number;
    totalBookingsCount: number;
    paidBookingsCount: number;
    searchMissCount: number;
    conversionRatePercentage: number;
    paidConversionRatePercentage: number;
  };
  handoffs: {
    totalHandoffs: number;
    breakdown: {
      records_silent: number;
      refund_or_dispute: number;
      payment_unclear: number;
    };
  };
  abandonedPayments: {
    totalAbandoned: number;
    notPaidCount: number;
    unclearPendingReviewCount: number;
  };
  rateStaleness: {
    latestRateValidFrom: string | null;
    latestAvailabilityDate: string | null;
    daysSinceRateValidFrom: number;
    stalenessLevel: 'Fresh' | 'Attention Needed' | 'Stale';
  };
}

export default function StaffDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = () => {
    setLoading(true);
    fetch('/api/staff/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b100d' }}>
      <StaffNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              PRD Section 12 Success Metrics
            </span>
            <h1 style={{ fontSize: '2rem' }}>Operations & Conversion Dashboard</h1>
            <p>Live metrics computed directly from PostgreSQL database rows.</p>
          </div>

          <button
            type="button"
            onClick={fetchMetrics}
            className="btn btn-secondary btn-sm"
            id="refresh-metrics-btn"
          >
            🔄 Refresh Database Metrics
          </button>
        </div>

        {loading ? (
          <div className="card">Loading real-time metrics...</div>
        ) : metrics ? (
          <div>
            {/* The 4 Core Success Metrics Grid */}
            <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
              {/* Metric 1: Search-to-Payment Conversion Rate */}
              <div className="card" style={{ border: '1px solid var(--border-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Metric 1 • PRD Section 12
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginTop: '0.2rem' }}>
                      Search-to-Payment Conversion
                    </h3>
                  </div>
                  <span className="badge badge-gold">
                    {metrics.conversion.conversionRatePercentage}% Total
                  </span>
                </div>

                <div style={{ fontSize: '2.4rem', fontWeight: '700', color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>
                  {metrics.conversion.paidConversionRatePercentage}%
                  <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}> paid conversion</span>
                </div>

                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Directly tests whether viewing availability and rates converts guests into paid bookings.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: '#0a0e0b', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>SEARCH EVENTS</span>
                    <strong>{metrics.conversion.searchEventCount}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>TOTAL BOOKINGS</span>
                    <strong>{metrics.conversion.totalBookingsCount}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>PAID BOOKINGS</span>
                    <strong style={{ color: 'var(--success)' }}>{metrics.conversion.paidBookingsCount}</strong>
                  </div>
                </div>
              </div>

              {/* Metric 2: Count of Handed-off Questions */}
              <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Metric 2 • PRD Section 12
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginTop: '0.2rem' }}>
                      Handed-Off Question Count
                    </h3>
                  </div>
                  <span className="badge badge-warning">
                    {metrics.handoffs.totalHandoffs} Total Routes
                  </span>
                </div>

                <div style={{ fontSize: '2.4rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  {metrics.handoffs.totalHandoffs}
                  <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}> handoff events logged</span>
                </div>

                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Measures the gap between what guests request and what records currently answer.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: '#0a0e0b', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>RECORDS SILENT</span>
                    <strong>{metrics.handoffs.breakdown.records_silent}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>REFUND/DISPUTE</span>
                    <strong>{metrics.handoffs.breakdown.refund_or_dispute}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>PAYMENT UNCLEAR</span>
                    <strong>{metrics.handoffs.breakdown.payment_unclear}</strong>
                  </div>
                </div>
              </div>

              {/* Metric 3: Count of Abandoned Payments */}
              <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Metric 3 • PRD Section 12
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginTop: '0.2rem' }}>
                      Abandoned Payment Count
                    </h3>
                  </div>
                  <span className={`badge ${metrics.abandonedPayments.totalAbandoned > 0 ? 'badge-danger' : 'badge-success'}`}>
                    {metrics.abandonedPayments.totalAbandoned} Incomplete
                  </span>
                </div>

                <div style={{ fontSize: '2.4rem', fontWeight: '700', color: metrics.abandonedPayments.totalAbandoned > 0 ? 'var(--danger)' : 'var(--success)', marginBottom: '0.5rem' }}>
                  {metrics.abandonedPayments.totalAbandoned}
                  <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}> payments uncompleted</span>
                </div>

                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Flags whether guests are dropping out during checkout or experiencing gateway failures.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#0a0e0b', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>STATUS: NOT_PAID</span>
                    <strong>{metrics.abandonedPayments.notPaidCount}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>UNCLEAR / PENDING</span>
                    <strong>{metrics.abandonedPayments.unclearPendingReviewCount}</strong>
                  </div>
                </div>
              </div>

              {/* Metric 4: Rate Staleness */}
              <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Metric 4 • PRD Section 12 & Risk 2
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginTop: '0.2rem' }}>
                      Rate & Availability Staleness
                    </h3>
                  </div>
                  <span className={`badge ${metrics.rateStaleness.stalenessLevel === 'Fresh' ? 'badge-success' : 'badge-warning'}`}>
                    {metrics.rateStaleness.stalenessLevel}
                  </span>
                </div>

                <div style={{ fontSize: '2.4rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  {metrics.rateStaleness.daysSinceRateValidFrom}
                  <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)' }}> days since rate schedule start</span>
                </div>

                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Prevents Risk 2 in Section 13: staff neglecting updates while app presents outdated pricing.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#0a0e0b', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>LATEST RATE START</span>
                    <strong>{metrics.rateStaleness.latestRateValidFrom ? new Date(metrics.rateStaleness.latestRateValidFrom).toLocaleDateString() : 'None'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem', display: 'block' }}>AVAILABILITY LOADED TO</span>
                    <strong>{metrics.rateStaleness.latestAvailabilityDate ? new Date(metrics.rateStaleness.latestAvailabilityDate).toLocaleDateString() : 'None'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Staff Management Navigation */}
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Staff Functional Requirements (FR-8 to FR-13)</h2>
            <div className="grid-3">
              <Link href="/staff/availability" className="card" style={{ padding: '1.25rem' }} id="admin-card-availability">
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📅</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>FR-8 Availability Management</h3>
                <p style={{ fontSize: '0.82rem' }}>Adjust open rooms per date, inspect daily capacity, and bulk publish dates.</p>
              </Link>

              <Link href="/staff/rates" className="card" style={{ padding: '1.25rem' }} id="admin-card-rates">
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>💲</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>FR-9 Rate Management</h3>
                <p style={{ fontSize: '0.82rem' }}>Set seasonal tariffs, specify currency, and define validity date windows.</p>
              </Link>

              <Link href="/staff/content" className="card" style={{ padding: '1.25rem' }} id="admin-card-content">
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>📝</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>FR-10 Content Management</h3>
                <p style={{ fontSize: '0.82rem' }}>Manage fact sheet, dining hours, WhatsApp number, reservations email, and photos.</p>
              </Link>

              <Link href="/staff/guests" className="card" style={{ padding: '1.25rem' }} id="admin-card-guests">
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>👥</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>FR-11 Guest Sign Up Review</h3>
                <p style={{ fontSize: '0.82rem' }}>Audit registered guest phone numbers, registration dates, and reservation counts.</p>
              </Link>

              <Link href="/staff/flags" className="card" style={{ padding: '1.25rem' }} id="admin-card-flags">
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🚩</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>FR-12 Flag Review</h3>
                <p style={{ fontSize: '0.82rem' }}>Review feedback submitted by guests regarding incorrect content and mark resolved.</p>
              </Link>

              <Link href="/staff/payments" className="card" style={{ padding: '1.25rem' }} id="admin-card-payments">
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>💳</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>FR-13 Payment Status View</h3>
                <p style={{ fontSize: '0.82rem' }}>Inspect booking payment statuses (paid, not_paid, unclear) and Flutterwave references.</p>
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
