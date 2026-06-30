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
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <Link to="/browse" className="btn btn-ghost btn-sm" style={{ fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Directory
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleShare}>
            <Share size={16} /> {copied ? 'Link Copied!' : 'Share Profile'}
          </button>
        </div>

        <div className="split" style={{ alignItems: 'start', gap: '36px' }}>
          
          {/* Left panel: Info & Verification Checklists */}
          <div>
            <div className="card" style={{ padding: '36px', background: '#ffffff', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
                <img
                  src={worker.photo_url || '/assets/worker1.jpeg'}
                  alt={worker.name}
                  style={{ width: '130px', height: '130px', borderRadius: '20px', objectFit: 'cover', border: '4px solid var(--primary-light)', boxShadow: 'var(--shadow-sm)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className={`badge-avail ${worker.availability_status}`}>{worker.availability_status}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-light)', fontWeight: 700 }}>UID: {worker.id.toUpperCase()}</span>
                  </div>
                  <h1 style={{ fontSize: '2.2rem', margin: '0 0 8px' }}>{worker.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.95rem' }}>
                    <MapPin size={14} style={{ color: 'var(--muted-light)' }} /> {worker.area}{worker.locality ? `, ${worker.locality}` : ''}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '16px 0', margin: '24px 0', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star fill="var(--warning)" size={18} />
                  <strong style={{ fontSize: '1.2rem' }}>{Number(worker.rating_avg).toFixed(1)}</strong>
                  <span className="muted" style={{ color: 'var(--muted)' }}>· {worker.total_reviews} reviews · {worker.total_jobs} jobs done</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 750, background: 'var(--primary-light)', padding: '6px 14px', borderRadius: '99px', border: '1px solid var(--primary-border)' }}>
                  <Shield size={14} /> In-Person Screened
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted-light)', margin: '0 0 12px' }}>Registered Skills</h4>
                <div className="tags">
                  {(worker.work_types || []).map(t => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>

              {/* 6-Point verification Checklist */}
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--muted-light)', margin: '0 0 16px' }}>🛡️ In-Person Verification &amp; Vetting</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Identity Proof (Aadhaar)', done: true },
                    { label: 'Physical Chowk Register', done: true },
                    { label: 'Reference Call Checks', done: true },
                    { label: 'Skills Test Vetted', done: true },
                    { label: 'Punctuality Track Checked', done: true },
                    { label: 'Noida Residence Confirmed', done: true }
                  ].map((chk, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--ink)', fontWeight: 550 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success-light)', border: '1px solid var(--success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
                        <Check size={12} strokeWidth={3.5} />
                      </div>
                      {chk.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating breakdown Histogram chart */}
            <div className="card" style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)', marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.15rem' }}>⭐ Star Ratings Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[5, 4, 3, 2, 1].map(starsNum => {
                  const count = rCounts[starsNum] || 0;
                  const pct = (count / totalR) * 100;
                  return (
                    <div key={starsNum} style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem' }}>
                      <span style={{ width: '56px', fontWeight: 600, color: 'var(--muted)' }}>{starsNum} Stars</span>
                      <div style={{ flex: 1, height: '10px', background: 'var(--bg)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--warning)', borderRadius: '99px' }}></div>
                      </div>
                      <span style={{ width: '28px', color: 'var(--muted-light)', textAlign: 'right', fontWeight: 600 }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vertical timeline of past jobs */}
            <div className="card" style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 24px', fontSize: '1.15rem' }}>📋 Verified Work Experience Timeline</h3>
              <div className="timeline">
                {mockWorkTimeline.map((item, idx) => (
                  <div className="timeline-item" key={idx}>
                    <div className="timeline-dot completed"></div>
                    <div className="timeline-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>{item.category}</strong>
                        <span className="muted" style={{ fontSize: '0.78rem', fontWeight: 600 }}>{fmtDate(item.date)}</span>
                      </div>
                      <p className="muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Booking card & Review submissions */}
          <div>
            <div className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', position: 'sticky', top: '100px', marginBottom: '32px', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem' }}>📋 Coordinator Booking</h3>
              
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span className="muted" style={{ fontWeight: 500 }}>Reliability Score:</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{worker.reliability_score || 50}/100</strong>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${worker.reliability_score || 50}%`, height: '100%', background: 'var(--primary)', borderRadius: '99px' }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-light)', marginTop: '10px', lineHeight: '1.4' }}>Based on punctuality, job attendance, and direct Noida user feedbacks.</div>
              </div>

              <Link
                to={`/post-job?work_type=${encodeURIComponent((worker.work_types || [])[0] || '')}&area=${encodeURIComponent(worker.area)}`}
                className="btn btn-primary btn-block"
                style={{ padding: '14px 20px' }}
              >
                Book {worker.name} Now
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '0.8rem', color: 'var(--muted)', justifyContent: 'center' }}>
                <Shield size={14} style={{ color: 'var(--success)' }} /> Direct Cash/UPI payment · Pay worker directly.
              </div>
            </div>

            {/* Review list */}
            <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', fontSize: '1.25rem' }}>
                <span>Verified Client Reviews</span>
                <span style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', fontSize: '0.78rem', padding: '2px 10px', borderRadius: '99px', color: 'var(--primary)', fontWeight: 700 }}>
                  {workerReviews.length}
                </span>
              </h3>

              {workerReviews.length ? workerReviews.map(r => (
                <div className="card" key={r.id} style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border)', marginBottom: '20px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Verified Hire
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', paddingRight: '90px' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>{r.hirer_name}</strong>
                    <span className="stars">{stars(r.rating)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--muted)', lineHeight: '1.65', fontStyle: 'italic' }}>"{r.comment}"</p>
                  <div className="muted" style={{ fontSize: '0.78rem', marginTop: '14px', fontWeight: 550, color: 'var(--muted-light)' }}>📅 Job completed on {fmtDate(r.created_at)}</div>
                </div>
              )) : (
                <div style={{ padding: '40px 20px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem' }}>No reviews yet</h4>
                  <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>Be the first to review this worker after completing an assignment.</p>
                </div>
              )}

              {/* Review submit forms */}
              <div className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', marginTop: '36px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>Submit a Job Review</h4>
                <p className="muted" style={{ margin: '0 0 24px', fontSize: '0.85rem' }}>All review submissions undergo verification by our student moderation team.</p>
                
                {msg && <div className="notice ok" style={{ marginBottom: '20px' }}>{msg}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label htmlFor="r-name">Your Full Name</label>
                    <input id="r-name" value={form.hirer_name} onChange={e => setForm(f => ({ ...f, hirer_name: e.target.value }))} placeholder="e.g. Aditi Sharma" required />
                  </div>

                  {/* Visual Clickable Star Rating Input */}
                  <div className="field">
                    <label style={{ marginBottom: '6px' }}>Rate Worker Punctuality &amp; Skills</label>
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
                            size={28}
                            fill={idx <= form.rating ? 'var(--warning)' : 'none'}
                            style={{
                              color: idx <= form.rating ? 'var(--warning)' : 'var(--border-hover)',
                              transition: 'transform 0.2s ease',
                              transform: idx <= form.rating ? 'scale(1.15)' : 'scale(1)'
                            }}
                          />
                        </button>
                      ))}
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--warning-text)', marginLeft: '8px', background: 'var(--warning-light)', padding: '2px 10px', borderRadius: '99px', border: '1px solid var(--warning-border)' }}>
                        {form.rating} Star{form.rating > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="r-comment">Review Description</label>
                    <textarea id="r-comment" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} placeholder="Tell us about their punctuality, performance, and general behavior..." required />
                  </div>
                  <button className="btn btn-primary btn-block" type="submit">Submit Review for Verification</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
