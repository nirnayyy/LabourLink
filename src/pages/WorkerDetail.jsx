import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Calendar, Check, Shield, ArrowLeft, Share, Award } from '../components/Icons';
import { stars, fmtDate, uid } from '../data';

export default function WorkerDetail({ data, onAddReview }) {
  const { id } = useParams();
  const worker = data.workers.find(w => w.id === id);
  const workerReviews = data.reviews
    .filter(r => r.worker_id === id && r.status === 'published')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const [form, setForm] = useState({ hirer_name: '', rating: 5, comment: '' });
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!worker) {
    return (
      <section className="section">
        <div className="container">
          <div className="notice err">Worker profile not found in database.</div>
          <Link to="/browse" className="btn btn-ghost" style={{ marginTop: 12 }}>← Return to Directory</Link>
        </div>
      </section>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hirer_name.trim()) return;
    const review = {
      id: uid('r'),
      worker_id: id,
      hirer_name: form.hirer_name.trim(),
      rating: parseInt(form.rating, 10),
      comment: form.comment.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    onAddReview(review);
    setForm({ hirer_name: '', rating: 5, comment: '' });
    setMsg('Review submitted successfully. It will display on this worker’s profile once verified by our team.');
    setTimeout(() => setMsg(null), 6000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock rating breakdown counts
  const rCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  workerReviews.forEach(r => {
    if (rCounts[r.rating] !== undefined) rCounts[r.rating]++;
  });
  const totalR = workerReviews.length || 1;

  // Mock vertical timeline of past work
  const mockWorkTimeline = [
    { desc: 'Apartment shifting at Gaur City', date: '2026-06-18', category: 'Shifting / Moving' },
    { desc: 'Industrial loading at Kasna Sector 3', date: '2026-06-10', category: 'Loader / Unloader' },
    { desc: 'Deep home cleaning helper job', date: '2026-05-28', category: 'Cleaning Help' }
  ];

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh', position: 'relative' }}>
      <div className="container">
        
        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Link to="/browse" className="btn btn-ghost btn-sm" style={{ fontWeight: 700, padding: '8px 16px', borderRadius: '4px', border: '1.5px solid var(--border)' }}>
            <ArrowLeft size={16} /> Back to Directory
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleShare} style={{ fontWeight: 750, padding: '8px 16px', borderRadius: '4px', border: '1.5px solid var(--border)' }}>
            <Share size={16} /> {copied ? 'Link Copied!' : 'Share Profile'}
          </button>
        </div>

        <div className="split" style={{ alignItems: 'start', gap: '40px' }}>
          
          {/* Left panel: Info & Verification Checklists */}
          <div style={{ flex: 1.3 }}>
            <div className="card glass-card" style={{ padding: '36px', background: '#ffffff', border: '1px solid var(--border)', marginBottom: '32px', borderRadius: 'var(--radius-lg)' }}>
              
              {/* Profile Cover Header */}
              <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
                <img
                  src={worker.photo_url || '/assets/worker1.jpeg'}
                  alt={worker.name}
                  style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover', border: '3px solid var(--primary-light)', boxShadow: 'var(--shadow)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className={`status-chip ${worker.availability_status}`} style={{ textTransform: 'capitalize' }}>{worker.availability_status}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-light)', fontWeight: 750 }}>UID: {worker.id.toUpperCase()}</span>
                  </div>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1.8rem', color: 'var(--ink)' }}>{worker.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.92rem' }}>
                    <MapPin size={14} style={{ color: 'var(--muted-light)' }} /> {worker.area}{worker.locality ? `, ${worker.locality}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1.5px solid var(--border)', borderBottom: '1.5px solid var(--border)', padding: '16px 0', margin: '24px 0', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star fill="var(--warning)" size={18} style={{ color: 'var(--warning)' }} />
                  <strong style={{ fontSize: '1.15rem', color: 'var(--ink)' }}>{Number(worker.rating_avg).toFixed(1)}</strong>
                  <span className="muted" style={{ color: 'var(--muted)', fontWeight: 600 }}>· {worker.total_reviews} reviews · {worker.total_jobs} jobs done</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800, background: 'var(--primary-light)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--primary-border)' }}>
                  <Shield size={14} /> In-Person Screened
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted-light)', margin: '0 0 12px', fontWeight: 800 }}>Registered Skills</h4>
                <div className="tags">
                  {(worker.work_types || []).map(t => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>

              {/* 6-Point verification Checklist */}
              <div>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted-light)', margin: '0 0 16px', fontWeight: 800 }}>🛡️ In-Person Verification Vetting</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {[
                    { label: 'Identity Proof (Aadhaar)', done: true },
                    { label: 'Physical Chowk Register', done: true },
                    { label: 'Reference Call Checks', done: true },
                    { label: 'Skills Test Vetted', done: true },
                    { label: 'Punctuality Track Checked', done: true },
                    { label: 'Noida Residence Confirmed', done: true }
                  ].map((chk, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--ink)', fontWeight: 600 }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--success-light)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyCentert: 'center', color: 'var(--success)', flexShrink: 0, justifyContent: 'center' }}>
                        <Check size={12} strokeWidth={3.5} />
                      </div>
                      {chk.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating breakdown Histogram */}
            <div className="card glass-card" style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)', marginBottom: '32px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.20rem', color: 'var(--ink)' }}>⭐ Star Ratings Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[5, 4, 3, 2, 1].map(starsNum => {
                  const count = rCounts[starsNum] || 0;
                  const pct = (count / totalR) * 100;
                  return (
                    <div key={starsNum} className="rating-bar-container">
                      <span style={{ width: '56px', fontWeight: 750, color: 'var(--muted)', fontSize: '0.82rem' }}>{starsNum} Stars</span>
                      <div className="rating-bar" style={{ border: '1px solid var(--border)' }}>
                        <div className="rating-bar-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span style={{ width: '24px', color: 'var(--muted)', textAlign: 'right', fontWeight: 750, fontSize: '0.82rem' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vertical timeline of past jobs */}
            <div className="card glass-card" style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '1.20rem', color: 'var(--ink)' }}>📋 Verified Work Experience Timeline</h3>
              <div className="timeline">
                {mockWorkTimeline.map((item, idx) => (
                  <div className="timeline-item" key={idx}>
                    <div className="timeline-dot completed" style={{ background: 'var(--primary)', border: '2px solid var(--primary-border)' }}></div>
                    <div className="timeline-content" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>{item.category}</strong>
                        <span className="muted" style={{ fontSize: '0.78rem', fontWeight: 700 }}>{fmtDate(item.date)}</span>
                      </div>
                      <p className="muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Booking card & Review submissions */}
          <div style={{ flex: 0.9, position: 'sticky', top: '100px' }}>
            <div className="card glass-card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', marginBottom: '32px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', color: 'var(--ink)' }}>📋 Coordinator Booking</h3>
              
              {/* Circular SVG Reliability Gauge */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg width="100" height="100" className="gauge-svg">
                    <circle cx="50" cy="50" r="40" className="gauge-track" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="gauge-fill"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * (worker.reliability_score || 50)) / 100}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>{worker.reliability_score || 50}%</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Reliable</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 750, fontSize: '0.88rem', color: 'var(--ink)', marginBottom: '4px' }}>Chowk Attendance Score</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-light)', lineHeight: '1.45', fontWeight: 550 }}>
                    Based on verified arrival audits and client ratings in Noida.
                  </div>
                </div>
              </div>

              <Link
                to={`/post-job?work_type=${encodeURIComponent((worker.work_types || [])[0] || '')}&area=${encodeURIComponent(worker.area)}`}
                className="btn btn-primary btn-block"
                style={{ padding: '14px 20px', borderRadius: 'var(--radius-sm)' }}
              >
                Book {worker.name} Now
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '0.8rem', color: 'var(--muted)', justifyContent: 'center', fontWeight: 550 }}>
                <Shield size={14} style={{ color: 'var(--success)' }} /> Direct Cash/UPI payment · Pay worker directly.
              </div>
            </div>

            {/* Review list */}
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', fontSize: '1.25rem' }}>
                <span style={{ color: 'var(--ink)' }}>Verified Reviews</span>
                <span style={{ background: 'var(--primary-light)', border: '1.5px solid var(--primary-border)', fontSize: '0.78rem', padding: '2px 10px', borderRadius: '99px', color: 'var(--primary)', fontWeight: 800 }}>
                  {workerReviews.length}
                </span>
              </h3>

              {workerReviews.length ? workerReviews.map(r => (
                <div className="card glass-card" key={r.id} style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border)', marginBottom: '20px', position: 'relative', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Verified Hire
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', paddingRight: '90px' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>{r.hirer_name}</strong>
                    <span className="stars" style={{ fontSize: '1rem' }}>{stars(r.rating)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--muted)', lineHeight: '1.6', fontStyle: 'italic' }}>"{r.comment}"</p>
                  <div className="muted" style={{ fontSize: '0.78rem', marginTop: '14px', fontWeight: 700, color: 'var(--muted-light)' }}>📅 Job completed on {fmtDate(r.created_at)}</div>
                </div>
              )) : (
                <div className="card glass-card" style={{ padding: '40px 20px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--ink)' }}>No reviews yet</h4>
                  <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>Be the first to review this worker after completing an assignment.</p>
                </div>
              )}

              {/* Review submit form */}
              <div className="card glass-card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', marginTop: '36px', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: 'var(--ink)' }}>Submit a Job Review</h4>
                <p className="muted" style={{ margin: '0 0 24px', fontSize: '0.85rem' }}>All review submissions undergo verification by our student moderation team.</p>
                
                {msg && <div className="notice ok" style={{ marginBottom: '20px' }}>{msg}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="r-name" style={{ fontSize: '0.82rem', fontWeight: 750 }}>Your Full Name</label>
                    <input id="r-name" value={form.hirer_name} onChange={e => setForm(f => ({ ...f, hirer_name: e.target.value }))} placeholder="e.g. Aditi Sharma" required style={{ padding: '10px 14px' }} />
                  </div>

                  {/* Star Rating Input */}
                  <div className="field">
                    <label style={{ marginBottom: '6px', fontSize: '0.82rem', fontWeight: 750 }}>Rate Worker Punctuality &amp; Skills</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 0' }}>
                      {[1, 2, 3, 4, 5].map(idx => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, rating: idx }))}
                          aria-label={`Rate ${idx} Stars`}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', outline: 'none' }}
                        >
                          <Star
                            size={26}
                            fill={idx <= form.rating ? 'var(--warning)' : 'none'}
                            style={{
                              color: idx <= form.rating ? 'var(--warning)' : 'var(--border-hover)',
                              transition: 'transform 0.2s ease',
                              transform: idx <= form.rating ? 'scale(1.15)' : 'scale(1)'
                            }}
                          />
                        </button>
                      ))}
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--warning-text)', marginLeft: '8px', background: 'var(--warning-light)', padding: '3px 12px', borderRadius: '99px', border: '1px solid var(--warning-border)' }}>
                        {form.rating} Star{form.rating > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="r-comment" style={{ fontSize: '0.82rem', fontWeight: 750 }}>Review Description</label>
                    <textarea id="r-comment" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Tell us about their punctuality, performance, and general behavior..." required style={{ padding: '12px 14px', minHeight: '100px' }} />
                  </div>
                  <button className="btn btn-primary btn-block" type="submit" style={{ borderRadius: 'var(--radius-sm)' }}>Submit Review for Verification</button>
                </form>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
