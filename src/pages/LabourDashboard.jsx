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
              👤 My Profile Dashboard
            </button>
            <button className={`dash-sidebar-btn ${tab === 'jobs' ? 'active' : ''}`} onClick={() => setTab('jobs')}>
              <Briefcase size={16} /> Open Jobs ({matchingJobs.length})
            </button>
            <button className={`dash-sidebar-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
              <Check size={16} /> Bookings Log ({myBookings.length})
            </button>
            <button className={`dash-sidebar-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
              <Award size={16} /> Client Reviews ({myReviews.length})
            </button>
          </aside>

          {/* Main Dashboard Panel */}
          <div className="card glass-card" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            
            {/* ─── Profile Workspace Tab ─── */}
            {tab === 'profile' && (
              <div className="fade-in">
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <img src={worker.photo_url || '/assets/worker1.jpeg'} alt={worker.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)', boxShadow: 'var(--shadow-sm)' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ink)' }}>{worker.name}</h3>
                    <div className="area" style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '4px 0 8px' }}>
                      📍 {worker.area}{worker.locality ? `, ${worker.locality}` : ''}
                    </div>
                    <div className="tags">
                      {(worker.work_types || []).map(t => <span className="tag" key={t}>{t}</span>)}
                    </div>
                  </div>
                </div>

                <div className="bento-grid" style={{ marginBottom: '32px' }}>
                  <div className="bento-col-4 glass-card" style={{ padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{worker.reliability_score}%</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>Reliability Score</div>
                  </div>
                  <div className="bento-col-4 glass-card" style={{ padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)' }}>{worker.total_jobs}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>Jobs Completed</div>
                  </div>
                  <div className="bento-col-4 glass-card" style={{ padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>★ {Number(worker.rating_avg).toFixed(1)}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>Average Rating</div>
                  </div>
                </div>

                {/* Availability card switcher */}
                <div className="card glass-card" style={{ padding: '24px', background: 'var(--bg)', border: '1px solid var(--border)', marginBottom: '32px', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
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
                          borderRadius: '4px',
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

            {/* ─── Jobs Tab ─── */}
            {tab === 'jobs' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', color: 'var(--ink)' }}>
                  Matching Job Leads in Noida
                </h3>
                
                {matchingJobs.length ? matchingJobs.map(j => {
                  const myOffer = (j.offers || []).find(o => o.worker_id === worker.id);
                  const isAgreed = j.agreed_worker_id === worker.id;
                  
                  return (
                    <div key={j.id} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <h4 style={{ margin: '0 0 8px', fontSize: '1.15rem', color: 'var(--ink)' }}>
                            {j.work_type} Required (Ref: {j.ref_code})
                          </h4>
                          <p className="muted" style={{ margin: '0 0 10px', fontSize: '0.85rem' }}>
                            📍 <strong>{j.area}</strong> · {j.location} · 📅 Work Date: {fmtDate(j.job_date)}
                          </p>
                          <div style={{ background: 'var(--bg)', padding: '12px 18px', borderRadius: '4px', display: 'inline-flex', gap: 14, fontSize: '0.82rem', fontWeight: 700 }}>
                            <span>Offered Daily Wage: <strong style={{ color: 'var(--primary)' }}>{money(j.wage_offered)}</strong></span>
                            {myOffer && (
                              <span>Your Counter: <strong style={{ color: 'var(--secondary)' }}>{money(myOffer.wage)}</strong> ({myOffer.status})</span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                          <span className={`status-chip ${j.status}`}>{j.status}</span>
                          {isAgreed && <span className="status-chip confirmed" style={{ background: 'var(--success-light)', color: 'var(--success-text)' }}>✓ Booked</span>}
                        </div>
                      </div>

                      {/* Negotiate Action options */}
                      {!isAgreed && (
                        <div style={{ display: 'flex', gap: '16px', marginTop: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => acceptWage(j.id, j.wage_offered)} style={{ borderRadius: '4px' }}>
                            Accept Offered Wage
                          </button>
                          <span style={{ color: 'var(--muted-light)', fontSize: '0.88rem' }}>or counter:</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="number"
                              placeholder="₹ Wage/Day"
                              value={counterWages[j.id] || ''}
                              onChange={e => setCounterWages({ ...counterWages, [j.id]: e.target.value })}
                              style={{ width: '110px', padding: '6px 12px', border: '1.5px solid var(--border)', borderRadius: '4px', outline: 'none' }}
                            />
                            <button className="btn btn-ghost btn-sm" onClick={() => submitCounterOffer(j.id, j.wage_offered)} style={{ borderRadius: '4px' }}>
                              Submit Counter
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>No active daily wage leads matching your skills in Noida Sector at present.</p>
                )}
              </div>
            )}

            {/* ─── Bookings Tab ─── */}
            {tab === 'bookings' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', color: 'var(--ink)' }}>
                  Assigned Booking History
                </h3>
                
                {myBookings.length ? myBookings.map(b => (
                  <div key={b.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: 'var(--ink)' }}>
                          {b.request.work_type} Dispatch (Ref: {b.request.ref_code})
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          👤 Client Name: <strong>{b.request.hirer_name}</strong> · 📍 Area: {b.request.area} · 📞 Contact: {b.request.is_unlocked ? b.request.hirer_phone : '🔒 Pay Fee to Unlock'}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted-light)', marginTop: '4px', fontWeight: 650 }}>
                          📅 Confirmed Dispatch Date: {fmtDate(b.confirmed_at)}
                        </div>
                      </div>
                      <span className={`status-chip ${b.status}`}>{b.status}</span>
                    </div>
                  </div>
                )) : (
                  <p className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>No confirmed job bookings assigned to your profile yet.</p>
                )}
              </div>
            )}

            {/* ─── Reviews Tab ─── */}
            {tab === 'reviews' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', color: 'var(--ink)' }}>
                  Verified Client Reviews
                </h3>
                
                {myReviews.length ? myReviews.map(r => (
                  <div className="card glass-card" key={r.id} style={{ padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong style={{ color: 'var(--ink)' }}>{r.hirer_name}</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--muted-light)', fontWeight: 650 }}>{fmtDate(r.created_at)}</span>
                    </div>
                    <div>{stars(r.rating)}</div>
                    <p style={{ margin: '8px 0 0', fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: '1.5' }}>"{r.comment}"</p>
                  </div>
                )) : (
                  <p className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>No client review records published for your profile yet.</p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
