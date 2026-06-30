import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Check, Shield, Briefcase, Award, Star } from '../components/Icons';
import { stars, fmtDate, money, uid } from '../data';

export default function LabourDashboard({ auth, data, onUpdateWorker, onUpdateRequest }) {
  const [tab, setTab] = useState('profile');
  const [counterWages, setCounterWages] = useState({}); // { jobId: '' }
  const [msg, setMsg] = useState(null);

  const worker = data.workers.find(w => w.id === auth.user?.worker_id);
  const myReviews = data.reviews
    .filter(r => r.worker_id === auth.user?.worker_id && r.status === 'published')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Jobs matching worker's area and skills
  const matchingJobs = data.requests.filter(r => {
    if (r.status !== 'pending' && r.agreed_worker_id !== worker?.id) return false;
    if (r.status === 'completed' || r.status === 'cancelled') return false;
    if (!worker) return false;
    if (r.area !== worker.area) return false;
    return (worker.work_types || []).includes(r.work_type);
  });

  const myBookings = data.bookings
    .filter(b => b.worker_id === auth.user?.worker_id)
    .map(b => {
      const req = data.requests.find(r => r.id === b.job_request_id) || {};
      return { ...b, request: req };
    })
    .sort((a, b) => new Date(b.confirmed_at || 0) - new Date(a.confirmed_at || 0));

  const handleAvailability = (status) => {
    if (!worker) return;
    onUpdateWorker(worker.id, { availability_status: status });
    setMsg({ type: 'ok', text: `Availability status updated to ${status}!` });
    setTimeout(() => setMsg(null), 4000);
  };

  const submitCounterOffer = (jobId, currentWage) => {
    const amount = Number(counterWages[jobId]);
    if (!amount || amount <= 0) {
      alert('Please enter a valid wage offer.');
      return;
    }

    const request = data.requests.find(r => r.id === jobId);
    if (!request) return;

    let updatedOffers = [...(request.offers || [])];
    const existingOfferIdx = updatedOffers.findIndex(o => o.worker_id === worker.id);

    if (existingOfferIdx >= 0) {
      updatedOffers[existingOfferIdx] = {
        ...updatedOffers[existingOfferIdx],
        wage: amount,
        history: [...updatedOffers[existingOfferIdx].history, { sender: 'worker', wage: amount }]
      };
    } else {
      updatedOffers.push({
        id: uid('o'),
        worker_id: worker.id,
        worker_name: worker.name,
        wage: amount,
        status: 'pending',
        history: [
          { sender: 'hirer', wage: currentWage },
          { sender: 'worker', wage: amount }
        ]
      });
    }

    onUpdateRequest(jobId, { offers: updatedOffers });
    setCounterWages(prev => ({ ...prev, [jobId]: '' }));
    setMsg({ type: 'ok', text: `Submitted counter offer of ₹${amount}/day. Client will be notified.` });
    setTimeout(() => setMsg(null), 5000);
  };

  const acceptWage = (jobId, wage) => {
    const request = data.requests.find(r => r.id === jobId);
    if (!request) return;

    let updatedOffers = [...(request.offers || [])];
    const existingOfferIdx = updatedOffers.findIndex(o => o.worker_id === worker.id);

    if (existingOfferIdx >= 0) {
      updatedOffers = updatedOffers.map(o => {
        if (o.worker_id === worker.id) {
          return { ...o, wage, status: 'agreed', history: [...o.history, { sender: 'worker', wage }] };
        }
        return { ...o, status: 'rejected' };
      });
    } else {
      updatedOffers.push({
        id: uid('o'),
        worker_id: worker.id,
        worker_name: worker.name,
        wage,
        status: 'agreed',
        history: [{ sender: 'worker', wage }]
      });
    }

    onUpdateRequest(jobId, {
      agreed_worker_id: worker.id,
      agreed_wage: wage,
      offers: updatedOffers
    });
    setMsg({ type: 'ok', text: `Wage agreed at ₹${wage}/day! Client will pay the portal fee to unlock contact.` });
    setTimeout(() => setMsg(null), 5000);
  };

  if (!worker) {
    return (
      <section className="section">
        <div className="container">
          <div className="notice err">
            Worker profile not found. Your account may not be linked to a worker profile.
          </div>
        </div>
      </section>
    );
  }

  // Mock Earnings Analytics data
  const mockEarnings = [
    { day: 'Mon', amt: 600 },
    { day: 'Tue', amt: 800 },
    { day: 'Wed', amt: 0 },
    { day: 'Thu', amt: 700 },
    { day: 'Fri', amt: 900 },
    { day: 'Sat', amt: 600 },
    { day: 'Sun', amt: 0 }
  ];
  const maxAmt = Math.max(...mockEarnings.map(e => e.amt)) || 1000;

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Dash Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <p className="eyebrow">Worker Workspace</p>
            <h2>Welcome, {worker.name} 👷</h2>
          </div>
        </div>

        {msg && <div className={`notice ${msg.type === 'ok' ? 'ok' : 'err'}`} style={{ marginBottom: '24px' }}>{msg.text}</div>}

        <div className="dash-layout">
          {/* Sidebar Nav */}
          <aside className="dash-sidebar">
            <button className={`dash-sidebar-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
              👤 My Profile Card
            </button>
            <button className={`dash-sidebar-btn ${tab === 'jobs' ? 'active' : ''}`} onClick={() => setTab('jobs')}>
              <Briefcase size={16} /> Open Jobs ({matchingJobs.length})
            </button>
            <button className={`dash-sidebar-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
              <Check size={16} /> My Bookings ({myBookings.length})
            </button>
            <button className={`dash-sidebar-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
              <Award size={16} /> Client Reviews ({myReviews.length})
            </button>
          </aside>

          {/* Main Dashboard Panel */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '32px' }}>
            
            {/* ─── Profile Workspace Tab ─── */}
            {tab === 'profile' && (
              <div className="fade-in">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <img src={worker.photo_url || '/assets/worker1.jpeg'} alt={worker.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)', boxShadow: 'var(--shadow-sm)' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{worker.name}</h3>
                    <div className="area" style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '4px 0 8px' }}>
                      📍 {worker.area}{worker.locality ? `, ${worker.locality}` : ''}
                    </div>
                    <div className="tags">
                      {(worker.work_types || []).map(t => <span className="tag" key={t}>{t}</span>)}
                    </div>
                  </div>
                </div>

                <div className="kpi-grid">
                  <div className="kpi">
                    <b>{worker.reliability_score}%</b>
                    <span>Reliability Score</span>
                  </div>
                  <div className="kpi">
                    <b>{worker.total_jobs}</b>
                    <span>Jobs Completed</span>
                  </div>
                  <div className="kpi">
                    <b>★ {Number(worker.rating_avg).toFixed(1)}</b>
                    <span>Average Rating</span>
                  </div>
                </div>

                {/* Availability card switcher */}
                <div className="card" style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: '32px' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: worker.availability_status === 'available' ? 'var(--success)' : worker.availability_status === 'working' ? 'var(--warning)' : 'var(--error)' }}></span>
                    Change Payout Availability
                  </h4>
                  <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '18px' }}>
                    Updating status notifies matching clients in Noida instantly. Toggle below:
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                      { s: 'available', label: 'Available', bg: 'var(--success-light)', txt: 'var(--success-text)', bdr: 'var(--success-border)', keyColor: 'var(--success)' },
                      { s: 'working', label: 'Working', bg: 'var(--warning-light)', txt: 'var(--warning-text)', bdr: 'var(--warning-border)', keyColor: 'var(--warning)' },
                      { s: 'unavailable', label: 'Offline', bg: '#f1f5f9', txt: 'var(--muted)', bdr: 'var(--border)', keyColor: 'var(--muted-light)' }
                    ].map(btn => (
                      <button
                        key={btn.s}
                        onClick={() => handleAvailability(btn.s)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: worker.availability_status === btn.s ? btn.bg : '#ffffff',
                          color: worker.availability_status === btn.s ? btn.txt : 'var(--muted)',
                          border: worker.availability_status === btn.s ? `2px solid ${btn.keyColor}` : '1.5px solid var(--border)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* sparkline Earnings columns */}
                <div>
                  <h4 style={{ margin: '0 0 16px', fontSize: '1.05rem', color: 'var(--ink)' }}>📈 Weekly Earnings Chart (Daily Wages)</h4>
                  <div style={{ display: 'flex', alignItems: 'end', gap: '16px', background: 'var(--bg)', padding: '28px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', height: '190px' }}>
                    {mockEarnings.map((item, idx) => {
                      const pct = (item.amt / maxAmt) * 100;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'end' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                            {item.amt > 0 ? `₹${item.amt}` : '—'}
                          </span>
                          <div style={{ width: '100%', height: `${pct || 4}%`, background: item.amt > 0 ? 'var(--primary)' : 'var(--border-hover)', borderRadius: '6px 6px 0 0', transition: 'all 0.6s ease' }}></div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '10px', fontWeight: 700 }}>{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Open Jobs Tab ─── */}
            {tab === 'jobs' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', fontSize: '1.2rem' }}>
                  Available Chowk Requests Matching Your Skills
                </h3>
                
                {matchingJobs.length ? matchingJobs.map(j => {
                  const myOffer = j.offers?.find(o => o.worker_id === worker.id);
                  return (
                    <div key={j.id} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: 'var(--ink)' }}>
                            {j.work_type} Required
                          </h4>
                          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                            📍 <strong>{j.area}</strong> · {j.location} · 📅 Job Date: {fmtDate(j.job_date)} · Proposed: <strong>{money(j.wage_offered)}/day</strong>
                          </div>
                          {j.notes && <div style={{ padding: '10px 14px', fontSize: '0.82rem', margin: '10px 0 0', fontStyle: 'italic', background: 'var(--bg)', color: 'var(--muted)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>Notes: {j.notes}</div>}
                        </div>
                        <div>
                          <span className={`status-chip ${j.status}`}>{j.status}</span>
                        </div>
                      </div>

                      {/* Wage Negotiations */}
                      <div style={{ marginTop: '20px', background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        {!myOffer ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 550, color: 'var(--ink)' }}>Interested in this work? Accept the wage or offer your price:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <button className="btn btn-primary btn-sm" onClick={() => acceptWage(j.id, j.wage_offered)}>
                                Accept {money(j.wage_offered)}
                              </button>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                  type="number"
                                  placeholder="Counter ₹"
                                  value={counterWages[j.id] || ''}
                                  onChange={e => setCounterWages(prev => ({ ...prev, [j.id]: e.target.value }))}
                                  style={{ width: '100px', padding: '8px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                                />
                                <button className="btn btn-ghost btn-sm" onClick={() => submitCounterOffer(j.id, j.wage_offered)}>
                                  Counter
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {myOffer.status === 'agreed' ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                  <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>✓ Wage Agreed at {money(j.agreed_wage)}/day!</span>
                                  <div style={{ fontSize: '0.88rem', marginTop: '6px', color: 'var(--muted)' }}>
                                    {j.is_unlocked ? (
                                      <span>🔓 Client Unlocked Details. Hirer Name: <strong>{j.hirer_name}</strong> · Phone: <strong>📞 {j.hirer_phone}</strong></span>
                                    ) : (
                                      <span>Waiting for client portal unlock payment (₹10 service fee).</span>
                                    )}
                                  </div>
                                </div>
                                {j.is_unlocked && (
                                  <div style={{ background: 'var(--success-light)', color: 'var(--success-text)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid var(--success-border)' }}>
                                    Unlocked &amp; Ready
                                  </div>
                                )}
                              </div>
                            ) : myOffer.status === 'pending' ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Negotiating...</span>
                                  <div style={{ fontSize: '0.88rem', marginTop: '4px', color: 'var(--muted)' }}>
                                    {myOffer.history[myOffer.history.length - 1].sender === 'hirer' ? (
                                      <span>Client countered with <strong style={{ color: 'var(--secondary)' }}>{money(myOffer.wage)}</strong>.</span>
                                    ) : (
                                      <span>You proposed <strong style={{ color: 'var(--secondary)' }}>{money(myOffer.wage)}</strong>. Waiting for client response...</span>
                                    )}
                                  </div>
                                </div>
                                {myOffer.history[myOffer.history.length - 1].sender === 'hirer' && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button className="btn btn-primary btn-sm" onClick={() => acceptWage(j.id, myOffer.wage)}>
                                      Accept {money(myOffer.wage)}
                                    </button>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <input
                                        type="number"
                                        placeholder="Counter ₹"
                                        value={counterWages[j.id] || ''}
                                        onChange={e => setCounterWages(prev => ({ ...prev, [j.id]: e.target.value }))}
                                        style={{ width: '90px', padding: '8px 10px', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                                      />
                                      <button className="btn btn-ghost btn-sm" onClick={() => submitCounterOffer(j.id, myOffer.wage)}>
                                        Counter
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="muted" style={{ fontSize: '0.88rem', fontStyle: 'italic' }}>
                                Another worker was selected for this assignment.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                    <p className="muted" style={{ margin: 0 }}>No open jobs matching your skills and area right now. Check back later!</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Bookings Tab ─── */}
            {tab === 'bookings' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px', fontSize: '1.2rem' }}>My Confirmed Assignments</h3>
                {myBookings.length ? myBookings.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: 'var(--ink)' }}>
                        {b.request.work_type} — Ref: {b.request.ref_code}
                      </h4>
                      <div className="muted" style={{ fontSize: '0.85rem' }}>
                        📍 {b.request.area} · 📅 Date: {fmtDate(b.request.job_date)} · Client Name: {b.request.hirer_name} · 📞 Contact: {b.request.is_unlocked ? b.request.hirer_phone : '[🔒 Payment Pending]'}
                      </div>
                    </div>
                    <span className={`status-chip ${b.status}`}>{b.status}</span>
                  </div>
                )) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
                    <p className="muted" style={{ margin: 0 }}>No bookings assigned yet. Confirmed jobs will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Reviews Tab ─── */}
            {tab === 'reviews' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px', fontSize: '1.2rem' }}>Verified Client Reviews</h3>
                {myReviews.length ? myReviews.map(r => (
                  <div className="card" key={r.id} style={{ padding: '24px', marginBottom: '16px', border: '1px solid var(--border)', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--ink)', fontSize: '0.98rem' }}>{r.hirer_name}</strong>
                      <span className="stars">{stars(r.rating)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--muted)', lineHeight: '1.6', fontStyle: 'italic' }}>"{r.comment}"</p>
                    <div className="muted" style={{ fontSize: '0.78rem', marginTop: '12px', fontWeight: 550 }}>Job Completed on {fmtDate(r.created_at)}</div>
                  </div>
                )) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⭐</div>
                    <p className="muted" style={{ margin: 0 }}>No reviews yet. After completing jobs, clients will leave ratings here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
