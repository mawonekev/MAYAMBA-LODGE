'use client';

import React, { useState, useEffect } from 'react';

interface WildlifeScene {
  id: string;
  name: string;
  time: string;
  url: string;
}

const WILDLIFE_SCENES: WildlifeScene[] = [
  {
    id: 'elephants',
    name: 'Zambezi River Elephants',
    time: 'Sunset River Crossing',
    url: '/images/wildlife/elephants-river.jpg',
  },
  {
    id: 'leopard',
    name: 'Savanna Leopard',
    time: 'Dawn in Acacia Canopy',
    url: '/images/wildlife/leopard-savanna.jpg',
  },
  {
    id: 'lion',
    name: 'Pride of the Zambezi',
    time: 'Golden Hour on Granite Kopje',
    url: '/images/wildlife/lion-sunset.jpg',
  },
];

export default function WildlifeBackdrop() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  // Optional subtle rotation every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % WILDLIFE_SCENES.length);
    }, 35000);
    return () => clearInterval(timer);
  }, []);

  const activeScene = WILDLIFE_SCENES[activeIndex];

  return (
    <div className="wildlife-backdrop-container" aria-hidden="true">
      {/* Background Images with smooth cross-fade */}
      {WILDLIFE_SCENES.map((scene, idx) => (
        <div
          key={scene.id}
          className={`wildlife-backdrop-image ${idx === activeIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${scene.url})` }}
        />
      ))}

      {/* Atmospheric Multi-layer Safari Vignette Overlay */}
      <div className="wildlife-backdrop-overlay" />

      {/* Subtle Ambient Wildlife Badge in Bottom-Right Corner */}
      <div className="wildlife-ambient-pill">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="wildlife-pill-btn"
          title="Change Wildlife Backdrop"
        >
          <span className="wildlife-pill-dot" />
          <span className="wildlife-pill-icon">🐘</span>
          <span className="wildlife-pill-text">
            <strong>Wildlife Backdrop:</strong> {activeScene.name}
          </span>
          <span className="wildlife-pill-arrow">{showPicker ? '▾' : '▴'}</span>
        </button>

        {showPicker && (
          <div className="wildlife-picker-menu">
            <div className="wildlife-picker-header">Select Wildlife Backdrop</div>
            {WILDLIFE_SCENES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setShowPicker(false);
                }}
                className={`wildlife-picker-item ${idx === activeIndex ? 'active' : ''}`}
              >
                <div
                  className="wildlife-picker-thumb"
                  style={{ backgroundImage: `url(${s.url})` }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div className="wildlife-picker-name">{s.name}</div>
                  <div className="wildlife-picker-time">{s.time}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
