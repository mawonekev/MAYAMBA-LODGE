'use client';

import React, { useEffect, useState } from 'react';
import StaffNavbar from '@/components/StaffNavbar';

interface RoomTypeOption {
  id: string;
  name: string;
}

interface AvailItem {
  id: string;
  roomTypeId: string;
  date: string;
  roomsOpen: number;
  roomType: { name: string };
}

export default function StaffAvailabilityPage() {
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('all');
  const [availability, setAvailability] = useState<AvailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Bulk update form state
  const [bulkRoomTypeId, setBulkRoomTypeId] = useState('');
  const [bulkStartDate, setBulkStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkEndDate, setBulkEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [bulkRoomsOpen, setBulkRoomsOpen] = useState(3);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const url =
        selectedRoomTypeId && selectedRoomTypeId !== 'all'
          ? `/api/staff/availability?roomTypeId=${selectedRoomTypeId}`
          : '/api/staff/availability';
      const res = await fetch(url);
      const data = await res.json();
      if (data.availability) setAvailability(data.availability);
      if (data.roomTypes) {
        setRoomTypes(data.roomTypes);
        if (!bulkRoomTypeId && data.roomTypes[0]) {
          setBulkRoomTypeId(data.roomTypes[0].id);
        }
      }
    } catch {
      alert('Error fetching availability data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRoomTypeId]);

  const handleUpdateRoomsOpen = async (item: AvailItem, newCount: number) => {
    if (newCount < 0) return;
    setUpdatingId(item.id);
    try {
      const res = await fetch('/api/staff/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: item.roomTypeId,
          date: item.date,
          roomsOpen: newCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAvailability((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, roomsOpen: newCount } : a))
        );
      }
    } catch {
      alert('Failed to update availability.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkLoading(true);
    setBulkMessage('');
    try {
      const res = await fetch('/api/staff/availability/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: bulkRoomTypeId,
          startDate: bulkStartDate,
          endDate: bulkEndDate,
          roomsOpen: bulkRoomsOpen,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkMessage(data.message);
        loadData();
      } else {
        setBulkMessage(data.error || 'Failed to bulk update.');
      }
    } catch {
      setBulkMessage('Error during bulk update.');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b100d' }}>
      <StaffNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            FR-8 Staff Requirement
          </span>
          <h1 style={{ fontSize: '1.8rem' }}>Availability Management</h1>
          <p>Set which rooms are open on which dates. Updates immediately reflect in guest availability searches.</p>
        </div>

        {/* Bulk Update Tool Card */}
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--border-gold)' }}>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--gold-light)' }}>
            Bulk Set Room Availability
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Rapidly load capacity across a range of calendar dates.
          </p>

          <form onSubmit={handleBulkSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Room Type</label>
                <select
                  className="form-select"
                  value={bulkRoomTypeId}
                  onChange={(e) => setBulkRoomTypeId(e.target.value)}
                  required
                  id="bulk-roomtype-select"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Rooms Open Count</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="form-input"
                  value={bulkRoomsOpen}
                  onChange={(e) => setBulkRoomsOpen(parseInt(e.target.value, 10))}
                  required
                  id="bulk-rooms-open-input"
                />
              </div>
            </div>

            {bulkMessage && (
              <div style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', marginBottom: '1rem' }}>
                {bulkMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={bulkLoading}
              className="btn btn-primary btn-sm"
              id="bulk-availability-submit"
            >
              {bulkLoading ? 'Applying Bulk Availability...' : 'Apply Bulk Availability'}
            </button>
          </form>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2>Date Availability Roster ({availability.length} dates loaded)</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Room:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
              value={selectedRoomTypeId}
              onChange={(e) => setSelectedRoomTypeId(e.target.value)}
              id="filter-room-select"
            >
              <option value="all">All Room Types</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Availability Table */}
        {loading ? (
          <div className="card">Loading calendar records...</div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0e1410', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Room Type</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Rooms Open</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Quick Adjust</th>
                </tr>
              </thead>
              <tbody>
                {availability.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: '600' }}>
                      {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{item.roomType.name}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '700', color: item.roomsOpen > 0 ? 'var(--gold-primary)' : 'var(--danger)' }}>
                        {item.roomsOpen}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${item.roomsOpen > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {item.roomsOpen > 0 ? 'Available' : 'Fully Booked'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          disabled={updatingId === item.id || item.roomsOpen <= 0}
                          onClick={() => handleUpdateRoomsOpen(item, item.roomsOpen - 1)}
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          disabled={updatingId === item.id}
                          onClick={() => handleUpdateRoomsOpen(item, item.roomsOpen + 1)}
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', color: 'var(--danger)' }}
                          disabled={updatingId === item.id}
                          onClick={() => handleUpdateRoomsOpen(item, 0)}
                        >
                          Zero
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
