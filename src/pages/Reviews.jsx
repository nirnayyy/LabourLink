import React from 'react';
import { Link } from 'react-router-dom';
import { stars, fmtDate } from '../data';
import { MapPin } from '../components/Icons';

export default function Reviews({ data }) {
  const { reviews, workers } = data;
  const published = reviews
    .filter(r => r.status === 'published')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getWorker = (id) => workers.find(w => w.id === id) || {};

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">What hirers say</p>
          <h2>Reviews from real customers</h2>
          <p className="lead">
            Every review is tied to a real job and verified by our team before publishing.
          </p>
        </div>

        <div className="grid cols-2" style={{ maxWidth: 960, margin: '0 auto', gap: '24px' }}>
          {published.length ? published.map(r => {
            const w = getWorker(r.worker_id);
            return (
              <div className="card" key={r.id} style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src={w.photo_url || '/assets/worker1.jpeg'}
                      alt={w.name || 'Worker'}
                      style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }}
                    />
                    <div>
                      <Link
                        to={`/worker/${r.worker_id}`}
                        style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.98rem', textDecoration: 'none' }}
                      >
                        {w.name || 'Worker'}
                      </Link>
                      <div className="muted" style={{ fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', color: 'var(--muted)' }}>
                        <MapPin size={10} style={{ color: 'var(--muted-light)' }} /> {w.area || ''}
                      </div>
                    </div>
                  </div>
                  <span className="stars" style={{ fontSize: '1.05rem' }}>{stars(r.rating)}</span>
                </div>
                <p style={{ margin: '0 0 12px', fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--ink)', lineHeight: '1.6' }}>"{r.comment || ''}"</p>
                <div className="muted" style={{ fontSize: '.8rem', fontWeight: 650, color: 'var(--muted-light)' }}>
                  — {r.hirer_name} · {fmtDate(r.created_at)}
                </div>
              </div>
            );
          }) : (
            <p className="muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px' }}>No reviews yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
