'use client';

import React, { useEffect, useState } from 'react';
import StaffNavbar from '@/components/StaffNavbar';

interface RoomTypeOption {
  id: string;
  name: string;
}

interface RateItem {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  pricePerNight: number;
  currency: string;
  validFrom: string;
  validTo: string;
  isTestData: boolean;
}

export default function StaffRatesPage() {
  const [rates, setRates] = useState<RateItem[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // New rate form state
  const [roomTypeId, setRoomTypeId] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState('2027-12-31');
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  const loadRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/rates');
      const data = await res.json();
      if (data.rates) setRates(data.rates);
      if (data.roomTypes) {
        setRoomTypes(data.roomTypes);
        if (!roomTypeId && data.roomTypes[0]) {
          setRoomTypeId(data.roomTypes[0].id);
        }
      }
    } catch {
      alert('Error fetching rate data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormMsg('');
    try {
      const res = await fetch('/api/staff/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId,
          pricePerNight,
          currency,
          validFrom,
          validTo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg('New rate published successfully.');
        setPricePerNight('');
        loadRates();
      } else {
        setFormMsg(data.error || 'Failed to publish rate.');
      }
    } catch {
      setFormMsg('Error connecting to rate service.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b100d' }}>
      <StaffNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            FR-9 Staff Requirement
          </span>
          <h1 style={{ fontSize: '1.8rem' }}>Rate Management</h1>
          <p>Staff sets and publishes seasonal tariffs per room type with start and end validity dates.</p>
        </div>

        <div className="grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
          {/* Rate Publishing Form */}
          <div className="card" style={{ border: '1px solid var(--border-gold)' }}>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--gold-light)' }}>
              Publish / Update Room Rate
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Newly defined rates will be enforced for all guest availability searches falling within the validity window.
            </p>

            <form onSubmit={handleCreateRate}>
              <div className="form-group">
                <label className="form-label">Room Type</label>
                <select
                  className="form-select"
                  value={roomTypeId}
                  onChange={(e) => setRoomTypeId(e.target.value)}
                  required
                  id="rate-roomtype-select"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Price Per Night</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    className="form-input"
                    placeholder="e.g. 350.00"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    required
                    id="rate-price-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    required
                    id="rate-currency-input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Valid From</label>
                  <input
                    type="date"
                    className="form-input"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valid To</label>
                  <input
                    type="date"
                    className="form-input"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {formMsg && (
                <div style={{ fontSize: '0.88rem', color: 'var(--gold-primary)', marginBottom: '1rem' }}>
                  {formMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-block btn-lg"
                id="rate-submit-btn"
              >
                {saving ? 'Publishing Rate...' : 'Publish Rate Schedule'}
              </button>
            </form>
          </div>

          {/* Active Rates Directory */}
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Published Rates Roster ({rates.length})
            </h2>

            {loading ? (
              <div className="card">Loading tariffs...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {rates.map((r) => {
                  const now = new Date();
                  const isCurrentlyActive =
                    new Date(r.validFrom) <= now && new Date(r.validTo) >= now;

                  return (
                    <div key={r.id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem' }}>{r.roomTypeName}</h3>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                            Rate ID: {r.id}
                          </span>
                        </div>

                        <span className={`badge ${isCurrentlyActive ? 'badge-success' : 'badge-gold'}`}>
                          {isCurrentlyActive ? 'Currently Active' : 'Scheduled'}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>
                        {r.currency} {r.pricePerNight.toFixed(2)}
                        <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>
                          {' '}
                          / night
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                        Valid from {new Date(r.validFrom).toLocaleDateString()} through{' '}
                        {new Date(r.validTo).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
