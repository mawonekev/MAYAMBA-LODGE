'use client';

import React, { useEffect, useState } from 'react';
import StaffNavbar from '@/components/StaffNavbar';

interface HotelInfoData {
  id: string;
  factSheet: string;
  checkInTime: string;
  checkOutTime: string;
  outletOpenTime: string;
  outletCloseTime: string;
  outletName: string;
  whatsappNumber: string;
  reservationsEmail: string;
}

interface PhotoData {
  id: string;
  url: string;
  caption: string | null;
  roomTypeId: string | null;
  roomType?: { name: string } | null;
}

interface RoomTypeData {
  id: string;
  name: string;
}

export default function StaffContentPage() {
  const [, setHotelInfo] = useState<HotelInfoData | null>(null);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Hotel Info edit state
  const [factSheet, setFactSheet] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [outletOpenTime, setOutletOpenTime] = useState('');
  const [outletCloseTime, setOutletCloseTime] = useState('');
  const [outletName, setOutletName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [reservationsEmail, setReservationsEmail] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');

  // New photo state
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoRoomTypeId, setNewPhotoRoomTypeId] = useState('none');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMsg, setPhotoMsg] = useState('');

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/content');
      const data = await res.json();
      if (data.hotelInfo) {
        setHotelInfo(data.hotelInfo);
        setFactSheet(data.hotelInfo.factSheet);
        setCheckInTime(data.hotelInfo.checkInTime);
        setCheckOutTime(data.hotelInfo.checkOutTime);
        setOutletOpenTime(data.hotelInfo.outletOpenTime);
        setOutletCloseTime(data.hotelInfo.outletCloseTime);
        setOutletName(data.hotelInfo.outletName);
        setWhatsappNumber(data.hotelInfo.whatsappNumber);
        setReservationsEmail(data.hotelInfo.reservationsEmail);
      }
      if (data.photos) setPhotos(data.photos);
      if (data.roomTypes) setRoomTypes(data.roomTypes);
    } catch {
      alert('Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleSaveHotelInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg('');
    try {
      const res = await fetch('/api/staff/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factSheet,
          checkInTime,
          checkOutTime,
          outletOpenTime,
          outletCloseTime,
          outletName,
          whatsappNumber,
          reservationsEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInfoMsg('Lodge information and refusal handoff contacts saved successfully.');
      } else {
        setInfoMsg(data.error || 'Failed to save information.');
      }
    } catch {
      setInfoMsg('Connection error.');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingPhoto(true);
    setPhotoMsg('');
    try {
      const res = await fetch('/api/staff/content/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newPhotoUrl,
          caption: newPhotoCaption,
          roomTypeId: newPhotoRoomTypeId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPhotoMsg('Photo added to gallery.');
        setNewPhotoUrl('');
        setNewPhotoCaption('');
        loadContent();
      } else {
        setPhotoMsg(data.error || 'Failed to add photo.');
      }
    } catch {
      setPhotoMsg('Connection error.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    try {
      await fetch(`/api/staff/content/photos?id=${id}`, { method: 'DELETE' });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Failed to delete photo.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b100d' }}>
      <StaffNavbar />

      <main className="container" style={{ flex: 1, padding: '2.5rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
            FR-10 Staff Requirement
          </span>
          <h1 style={{ fontSize: '1.8rem' }}>Content Management</h1>
          <p>Update property fact sheet, operating hours, refusal handoff contacts, and gallery photos.</p>
        </div>

        {loading ? (
          <div className="card">Loading lodge records...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Fact Sheet & Schedules Form */}
            <div className="card" style={{ border: '1px solid var(--border-gold)' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--gold-light)' }}>
                Fact Sheet, Dining Schedules & Handoff Contacts
              </h2>

              <form onSubmit={handleSaveHotelInfo}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--gold-light)' }}>
                      Direct WhatsApp Desk (Required for Handoffs)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      required
                      id="content-whatsapp-input"
                    />
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      Rendered on all refusal cards when guest queries missing data or disputes.
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--gold-light)' }}>
                      Reservations Email (Required for Handoffs)
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={reservationsEmail}
                      onChange={(e) => setReservationsEmail(e.target.value)}
                      required
                      id="content-email-input"
                    />
                    <small style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      Destination for automated refusal routing.
                    </small>
                  </div>
                </div>

                <div className="grid-3" style={{ margin: '1rem 0' }}>
                  <div className="form-group">
                    <label className="form-label">Check-In Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Check-Out Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Restaurant / Outlet Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={outletName}
                      onChange={(e) => setOutletName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Outlet Opening Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={outletOpenTime}
                      onChange={(e) => setOutletOpenTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Outlet Closing Time</label>
                    <input
                      type="text"
                      className="form-input"
                      value={outletCloseTime}
                      onChange={(e) => setOutletCloseTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Lodge Fact Sheet & Sanctuary Overview</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    value={factSheet}
                    onChange={(e) => setFactSheet(e.target.value)}
                    required
                    id="content-factsheet-input"
                  />
                </div>

                {infoMsg && (
                  <div style={{ color: 'var(--gold-primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {infoMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingInfo}
                  className="btn btn-primary btn-lg"
                  id="save-hotel-info-btn"
                >
                  {savingInfo ? 'Saving Changes...' : 'Save Hotel Info & Contact Rules'}
                </button>
              </form>
            </div>

            {/* Photo Management Section */}
            <div className="card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Photo Gallery Management</h2>

              {/* Upload Photo Form */}
              <form onSubmit={handleAddPhoto} style={{ marginBottom: '2rem', background: '#0a0e0b', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--gold-light)', marginBottom: '0.75rem' }}>
                  Add Photo to Gallery
                </h3>

                <div className="grid-3" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://images.unsplash.com/..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      required
                      id="new-photo-url-input"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Caption</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sunset river deck lounge"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assign to Room Type</label>
                    <select
                      className="form-select"
                      value={newPhotoRoomTypeId}
                      onChange={(e) => setNewPhotoRoomTypeId(e.target.value)}
                    >
                      <option value="none">General Property Photo</option>
                      {roomTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {photoMsg && (
                  <div style={{ color: 'var(--gold-primary)', fontSize: '0.85rem', margin: '0.75rem 0' }}>
                    {photoMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                  id="add-photo-submit-btn"
                >
                  {uploadingPhoto ? 'Saving...' : 'Add Photo'}
                </button>
              </form>

              {/* Photos Grid */}
              <div className="grid-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="card" style={{ padding: '0.5rem', background: '#0e1410' }}>
                    <div
                      style={{
                        height: '140px',
                        backgroundImage: `url(${photo.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '0.5rem',
                      }}
                    />
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#fff', marginBottom: '0.25rem' }}>
                      {photo.roomType?.name || 'General Lodge'}
                    </div>
                    {photo.caption && (
                      <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>{photo.caption}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)', fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                    >
                      Delete Photo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
