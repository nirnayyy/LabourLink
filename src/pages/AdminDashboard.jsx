import React, { useState, useMemo } from 'react';
import { MapPin, Check, Shield, Search, Trash, Sliders, Award } from '../components/Icons';
import { stars, fmtDate, money, uid } from '../data';

export default function AdminDashboard({
  auth, data,
  onUpdateRequest, onUpdateWorker, onAddWorker, onAddBooking, onUpdateReview, onUpdateBooking,
}) {
  const [tab, setTab] = useState('requests');
  const [msg, setMsg] = useState(null);
  const [openAssign, setOpenAssign] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [showAddWorker, setShowAddWorker] = useState(false);

  // Vetting audit drawer state
  const [vettingWorker, setVettingWorker] = useState(null);

  // Search & Filter states inside admin panels
  const [reqSearch, setReqSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  // New worker form fields
  const [nw, setNw] = useState({ name: '', phone: '', area: 'Knowledge Park', photo: '', types: '' });

  const requests = useMemo(() => [...data.requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [data.requests]);
  const workers = useMemo(() => [...data.workers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [data.workers]);
  const bookings = useMemo(() => [...data.bookings].sort((a, b) => new Date(b.confirmed_at || 0) - new Date(a.confirmed_at || 0)), [data.bookings]);
  const reviews = useMemo(() => [...data.reviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [data.reviews]);

  const pending = requests.filter(r => r.status === 'pending').length;
  const revPending = reviews.filter(r => r.status === 'pending').length;

  const notice = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 5000);
  };

  const chip = (s) => <span className={`status-chip ${s}`}>{s.replace('_', ' ')}</span>;

  // Search filter logic
  const filteredRequests = useMemo(() => {
    return requests.filter(r => 
      r.ref_code.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.hirer_name.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.work_type.toLowerCase().includes(reqSearch.toLowerCase())
    );
  }, [requests, reqSearch]);

  const filteredWorkers = useMemo(() => {
    return workers.filter(w => 
      w.name.toLowerCase().includes(workerSearch.toLowerCase()) ||
      w.phone.includes(workerSearch) ||
      w.area.toLowerCase().includes(workerSearch.toLowerCase())
    );
  }, [workers, workerSearch]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const req = data.requests.find(r => r.id === b.job_request_id) || {};
      const w = data.workers.find(wr => wr.id === b.worker_id) || {};
      return (
        (req.ref_code && req.ref_code.toLowerCase().includes(bookingSearch.toLowerCase())) ||
        (w.name && w.name.toLowerCase().includes(bookingSearch.toLowerCase())) ||
        (req.hirer_name && req.hirer_name.toLowerCase().includes(bookingSearch.toLowerCase()))
      );
    });
  }, [bookings, bookingSearch, data.requests, data.workers]);

  /* ─── Request Assigning Actions ─── */
  const confirmWorker = (reqId) => {
    if (!selectedWorker) return notice('err', 'Select a worker first.');
    const booking = {
      id: uid('b'),
      job_request_id: reqId,
      worker_id: selectedWorker,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      completed_at: null,
    };
    onAddBooking(booking);
    onUpdateRequest(reqId, { status: 'confirmed' });
    setOpenAssign(null);
    notice('ok', 'Worker confirmed! WhatsApp SMS dispatch triggered.');
  };

  const setReqStatus = (id, status) => {
    onUpdateRequest(id, { status });
    if (status === 'completed') {
      const bk = data.bookings.find(b => b.job_request_id === id);
      if (bk) onUpdateBooking(bk.id, { status: 'completed', completed_at: new Date().toISOString() });
    }
    notice('ok', `Request marked as ${status}.`);
  };

  /* ─── Worker registration ─── */
  const handleAddWorker = () => {
    const types = nw.types.split(',').map(s => s.trim()).filter(Boolean);
    if (!nw.name.trim() || !nw.phone.trim() || !types.length) {
      return notice('err', 'Name, phone and work types are required.');
    }
    const worker = {
      id: uid('w'),
      name: nw.name.trim(),
      phone: nw.phone.trim(),
      area: nw.area,
      locality: '',
      photo_url: nw.photo.trim() || '/assets/worker1.jpeg',
      work_types: types,
      availability_status: 'available',
      rating_avg: 0,
      total_reviews: 0,
      total_jobs: 0,
      reliability_score: 50,
      registered_by: auth.user?.email || 'team',
      is_blacklisted: false,
      is_published: true,
      created_at: new Date().toISOString(),
    };
    onAddWorker(worker);
    setNw({ name: '', phone: '', area: 'Knowledge Park', photo: '', types: '' });
    setShowAddWorker(false);
    notice('ok', 'Worker registered successfully.');
  };

  const toggleBlacklist = (w) => {
    const next = !w.is_blacklisted;
    onUpdateWorker(w.id, { is_blacklisted: next, is_published: !next });
    notice('ok', next ? 'Worker blacklisted.' : 'Worker un-blacklisted.');
  };

  /* ─── Moderation Review Actions ─── */
  const setReviewStatus = (id, status) => {
    onUpdateReview(id, { status });
    notice('ok', `Review comment status changed to ${status}.`);
  };

  // Mock Export CSV helper
  const handleCSVExport = (filename) => {
    alert(`Export Success!\nCSV sheet "${filename}_records.csv" exported with ${filteredWorkers.length} rows.`);
  };

  const availWorkers = workers.filter(w => !w.is_blacklisted);

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Dash Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="eyebrow">Internal Admin Console</p>
            <h2>Admin Control Center</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => handleCSVExport(tab)} style={{ fontWeight: 700 }}>
              📥 Export CSV
            </button>
            <span className="status-chip confirmed" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700 }}>
              {auth.user?.email}
            </span>
          </div>
        </div>

        {/* Dynamic Metric KPIs cards */}
        <div className="kpi-grid">
          <div className="kpi">
            <b>{pending}</b>
            <span>Pending Dispatches</span>
          </div>
          <div className="kpi">
            <b>{workers.length}</b>
            <span>Registered Workers</span>
          </div>
          <div className="kpi">
            <b>{bookings.length}</b>
            <span>Confirmed Bookings</span>
          </div>
          <div className="kpi">
            <b>{revPending}</b>
            <span>Pending Reviews</span>
          </div>
        </div>

        {msg && <div className={`notice ${msg.type === 'ok' ? 'ok' : 'err'}`} style={{ marginBottom: '24px' }}>{msg.text}</div>}

        {/* Tabs section */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border)', marginBottom: '28px', paddingBottom: '2px', overflowX: 'auto' }}>
          {[
            { key: 'requests', label: 'Job Requests' },
            { key: 'workers', label: 'Workers Registry' },
            { key: 'bookings', label: 'Bookings Log' },
            { key: 'reviews', label: 'Reviews Moderation' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setMsg(null); }}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 20px',
                fontSize: '0.92rem',
                fontWeight: tab === t.key ? 700 : 550,
                color: tab === t.key ? 'var(--primary)' : 'var(--muted)',
                cursor: 'pointer',
                borderBottom: tab === t.key ? '3px solid var(--primary)' : '3px solid transparent',
                marginBottom: '-5px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB CONTENT: REQUESTS ═══ */}
        {tab === 'requests' && (
          <div className="fade-in">
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
              <input
                type="text"
                placeholder="Search job requests by Ref code, client name, category..."
                value={reqSearch}
                onChange={e => setReqSearch(e.target.value)}
                style={{
                  padding: '10px 16px 10px 42px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)',
                  width: '100%',
                  maxWidth: '380px',
                  outline: 'none',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div className="table-wrapper">
              <table className="data">
                <thead>
                  <tr><th>Ref Code</th><th>Client Details</th><th>Job Description</th><th>Status</th><th>Control Actions</th></tr>
                </thead>
                <tbody>
                  {filteredRequests.length ? filteredRequests.map(r => (
                    <React.Fragment key={r.id}>
                      <tr>
                        <td>
                          <strong>{r.ref_code}</strong><br />
                          <span className="muted" style={{ fontSize: '0.8rem' }}>{fmtDate(r.created_at)}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{r.hirer_name}</div>
                          <span className="muted" style={{ fontSize: '0.82rem' }}>{r.hirer_phone}</span>
                        </td>
                        <td>
                          <strong>{r.work_type}</strong> Needed<br />
                          <span className="muted" style={{ fontSize: '0.82rem' }}>📍 {r.area} · Proposed: {money(r.wage_offered)}</span><br />
                          <span className="muted" style={{ fontSize: '0.82rem' }}>📅 Date: {fmtDate(r.job_date)}</span>
                          
                          {r.agreed_worker_id && (
                            <div style={{ fontSize: '0.78rem', marginTop: '6px', background: 'var(--primary-light)', padding: '4px 8px', borderRadius: '6px', color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--primary-border)', display: 'inline-block' }}>
                              🤝 Agreed worker: {data.workers.find(w => w.id === r.agreed_worker_id)?.name} ({r.is_unlocked ? '🔓 Paid' : '🔒 Unpaid'})
                            </div>
                          )}
                        </td>
                        <td>{chip(r.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {r.status === 'pending' && (
                              <button className="btn btn-primary btn-sm" onClick={() => setOpenAssign(openAssign === r.id ? null : r.id)}>
                                Assign Worker
                              </button>
                            )}
                            {r.status === 'confirmed' && (
                              <button className="btn btn-primary btn-sm" onClick={() => setReqStatus(r.id, 'completed')}>
                                Complete
                              </button>
                            )}
                            {r.status !== 'completed' && r.status !== 'cancelled' && (
                              <button className="btn btn-ghost btn-sm" onClick={() => setReqStatus(r.id, 'cancelled')}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Assign Drawer */}
                      {openAssign === r.id && (
                        <tr>
                          <td colSpan="5" style={{ background: 'var(--bg)', padding: '16px 20px' }}>
                            <div className="card" style={{ padding: '20px', background: '#ffffff', display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap', border: '1px solid var(--primary-border)' }}>
                              <div className="field" style={{ margin: 0, minWidth: '280px', flex: 1 }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Available Worker</label>
                                <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.88rem' }}>
                                  <option value="">Choose worker...</option>
                                  {availWorkers.map(w => (
                                    <option key={w.id} value={w.id}>
                                      {w.name} — {w.area} ({w.availability_status})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <button className="btn btn-primary btn-sm" onClick={() => confirmWorker(r.id)} style={{ padding: '10px 20px' }}>
                                Confirm Placement &amp; Dispatch
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr><td colSpan="5" className="muted text-center" style={{ padding: '32px' }}>No requests matching search queries.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB CONTENT: WORKERS ═══ */}
        {tab === 'workers' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
                <input
                  type="text"
                  placeholder="Search workers by name, phone, area..."
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                  style={{
                    padding: '10px 16px 10px 42px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border)',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.9rem',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddWorker(!showAddWorker)}>
                {showAddWorker ? 'Cancel' : '+ Register New Worker'}
              </button>
            </div>

            {showAddWorker && (
              <div className="card" style={{ padding: '28px', background: '#ffffff', border: '1.5px solid var(--primary-border)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} style={{ color: 'var(--primary)' }} />
                  Register Worker Profile (At Chowk Interview)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="field">
                    <label>Worker Name *</label>
                    <input value={nw.name} onChange={e => setNw(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Vikram Singh" required />
                  </div>
                  <div className="field">
                    <label>Mobile Number *</label>
                    <input value={nw.phone} onChange={e => setNw(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit phone" required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="field">
                    <label>Greater Noida Area *</label>
                    <select value={nw.area} onChange={e => setNw(f => ({ ...f, area: e.target.value }))}>
                      {data.areas.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Photo URL (Optional)</label>
                    <input value={nw.photo} onChange={e => setNw(f => ({ ...f, photo: e.target.value }))} placeholder="/assets/worker1.jpeg" />
                  </div>
                </div>
                <div className="field">
                  <label>Skills / Work Categories (comma separated) *</label>
                  <input value={nw.types} onChange={e => setNw(f => ({ ...f, types: e.target.value }))} placeholder="General Helper, Loader / Unloader" />
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleAddWorker}>
                  Save Profile to Registry
                </button>
              </div>
            )}

            <div className="table-wrapper">
              <table className="data">
                <thead>
                  <tr><th>Worker Name</th><th>Coverage Sector</th><th>Registered Skills</th><th>Vetting Auditing</th><th>Status</th><th>Control</th></tr>
                </thead>
                <tbody>
                  {filteredWorkers.length ? filteredWorkers.map(w => (
                    <tr key={w.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={w.photo_url || '/assets/worker1.jpeg'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }} />
                          <div>
                            <strong style={{ fontSize: '0.95rem' }}>{w.name}</strong><br />
                            <span className="muted" style={{ fontSize: '0.8rem' }}>{w.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>{w.area}</td>
                      <td>
                        <div className="tags">
                          {(w.work_types || []).map(t => <span className="tag" key={t}>{t}</span>)}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }} onClick={() => setVettingWorker(w)}>
                          🛡️ Audit Scorecard
                        </button>
                      </td>
                      <td>
                        <select
                          value={w.availability_status}
                          onChange={e => {
                            onUpdateWorker(w.id, { availability_status: e.target.value });
                            notice('ok', 'Availability status updated.');
                          }}
                          style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px' }}
                        >
                          <option value="available">Available</option>
                          <option value="working">Working</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            background: w.is_blacklisted ? 'var(--error-light)' : 'var(--bg)',
                            color: w.is_blacklisted ? 'var(--error-text)' : 'var(--ink)',
                            borderColor: w.is_blacklisted ? 'var(--error-border)' : 'var(--border)'
                          }}
                          onClick={() => toggleBlacklist(w)}
                        >
                          {w.is_blacklisted ? 'Un-blacklist' : 'Blacklist'}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="muted text-center" style={{ padding: '32px' }}>No workers registered in database.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB CONTENT: BOOKINGS ═══ */}
        {tab === 'bookings' && (
          <div className="fade-in">
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
              <input
                type="text"
                placeholder="Search bookings by Job Code, worker name, client..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                style={{
                  padding: '10px 16px 10px 42px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)',
                  width: '100%',
                  maxWidth: '380px',
                  outline: 'none',
                  fontSize: '0.9rem',
                  background: '#ffffff',
                  transition: 'all 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div className="table-wrapper">
              <table className="data">
                <thead>
                  <tr><th>Booking Code</th><th>Worker Details</th><th>Hirer Client</th><th>Status</th><th>Action Override</th></tr>
                </thead>
                <tbody>
                  {filteredBookings.length ? filteredBookings.map(b => {
                    const req = data.requests.find(r => r.id === b.job_request_id) || {};
                    const w = data.workers.find(wr => wr.id === b.worker_id) || {};
                    return (
                      <tr key={b.id}>
                        <td>
                          <strong>{req.ref_code}</strong><br />
                          <span className="muted" style={{ fontSize: '0.8rem' }}>{req.work_type} · 📅 {fmtDate(req.job_date)}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{w.name}</div>
                          <span className="muted" style={{ fontSize: '0.8rem' }}>{w.phone}</span>
                        </td>
                        <td><strong style={{ color: 'var(--ink)' }}>{req.hirer_name}</strong></td>
                        <td>{chip(b.status)}</td>
                        <td>
                          <select
                            value={b.status}
                            onChange={e => {
                              const patch = { status: e.target.value };
                              if (e.target.value === 'completed') patch.completed_at = new Date().toISOString();
                              onUpdateBooking(b.id, patch);
                              notice('ok', 'Booking status overridden.');
                            }}
                            style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px' }}
                          >
                            <option value="proposed">Proposed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="no_show">No Show</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="5" className="muted text-center" style={{ padding: '32px' }}>No bookings found in logs.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB CONTENT: REVIEWS MODERATION ═══ */}
        {tab === 'reviews' && (
          <div className="table-wrapper fade-in">
            <table className="data">
              <thead>
                <tr><th>Worker ID</th><th>Client Hirer</th><th>Stars</th><th>Comment</th><th>Status</th><th>Review Moderation</th></tr>
              </thead>
              <tbody>
                {reviews.length ? reviews.map(r => {
                  const w = data.workers.find(wr => wr.id === r.worker_id) || {};
                  return (
                    <tr key={r.id}>
                      <td><strong style={{ color: 'var(--ink)' }}>{w.name || 'Worker'}</strong></td>
                      <td>{r.hirer_name}</td>
                      <td><span className="stars">{stars(r.rating)}</span></td>
                      <td><span style={{ fontStyle: 'italic', color: 'var(--muted)' }}>"{r.comment}"</span></td>
                      <td>{chip(r.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {r.status !== 'published' && (
                            <button className="btn btn-primary btn-sm" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setReviewStatus(r.id, 'published')}>
                              Approve
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setReviewStatus(r.id, 'rejected')}>
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" className="muted text-center" style={{ padding: '32px' }}>No reviews pending moderation.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── SIDE VETTING CHECKLIST DRAWER ─── */}
      {vettingWorker && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100%', background: '#ffffff', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', zIndex: 1100, padding: '36px 28px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--primary)' }} />
              Vetting Scorecard
            </h3>
            <button style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--muted-light)', transition: 'color 0.2s ease' }} onMouseEnter={e => e.target.style.color = 'var(--ink)'} onMouseLeave={e => e.target.style.color = 'var(--muted-light)'} onClick={() => setVettingWorker(null)}>
              ✕
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '28px', background: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <img src={vettingWorker.photo_url || '/assets/worker1.jpeg'} alt="" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)', margin: '0 auto 12px', boxShadow: 'var(--shadow-sm)' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{vettingWorker.name}</h4>
            <div className="muted" style={{ fontSize: '0.82rem', marginTop: '2px', fontWeight: 600 }}>📍 Area Sector: {vettingWorker.area}</div>
          </div>

          <h5 style={{ margin: '0 0 16px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted-light)', fontWeight: 700 }}>6-Point Audit Checklist</h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            {[
              { id: 'aadhaar', label: 'Aadhaar Identity Proof Checked', defaultChecked: true },
              { id: 'chowk', label: 'Local Labor Chowk Interview Completed', defaultChecked: true },
              { id: 'references', label: 'Previous Work Reference Calls Made', defaultChecked: true },
              { id: 'skills', label: 'Work Category Skill Check Completed', defaultChecked: true },
              { id: 'reliability', label: 'Attendance Punctuality Verified', defaultChecked: true },
              { id: 'residence', label: 'Greater Noida Locality Confirmed', defaultChecked: true }
            ].map(chk => (
              <label key={chk.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 550, color: 'var(--ink)' }}>
                <input type="checkbox" defaultChecked={chk.defaultChecked} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                <span>{chk.label}</span>
              </label>
            ))}
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 'auto', padding: '14px' }} onClick={() => { setVettingWorker(null); notice('ok', 'Verification checklist updated.'); }}>
            ✓ Update Verification Profile
          </button>
        </div>
      )}
    </section>
  );
}
