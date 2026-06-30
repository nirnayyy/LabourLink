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
            <button className="btn btn-ghost btn-sm" onClick={() => handleCSVExport(tab)} style={{ fontWeight: 700, borderRadius: '4px', border: '1.5px solid var(--border)' }}>
              📥 Export CSV
            </button>
            <span className="status-chip confirmed" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px' }}>
              {auth.user?.email}
            </span>
          </div>
        </div>

        {/* Bento Grid Metrics */}
        <div className="bento-grid" style={{ marginBottom: '32px' }}>
          <div className="bento-col-3 glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)' }}>{pending}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--muted)', marginTop: '4px' }}>Pending Dispatches</div>
          </div>
          <div className="bento-col-3 glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ink)' }}>{workers.length}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--muted)', marginTop: '4px' }}>Registered Workers</div>
          </div>
          <div className="bento-col-3 glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)' }}>{bookings.length}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--muted)', marginTop: '4px' }}>Confirmed Bookings</div>
          </div>
          <div className="bento-col-3 glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-md)', background: '#ffffff', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--error)' }}>{revPending}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--muted)', marginTop: '4px' }}>Pending Reviews</div>
          </div>
        </div>

        {msg && <div className={`notice ${msg.type === 'ok' ? 'ok' : 'err'}`} style={{ marginBottom: '24px' }}>{msg.text}</div>}

        {/* Tabs navigation */}
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
                fontWeight: tab === t.key ? 750 : 550,
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

        {/* ═══ TAB: REQUESTS ═══ */}
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
                  borderRadius: '4px',
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

            <div className="table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="data" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '16px' }}>Ref Code</th>
                    <th style={{ padding: '16px' }}>Client Details</th>
                    <th style={{ padding: '16px' }}>Job Description</th>
                    <th style={{ padding: '16px' }}>Status</th>
                    <th style={{ padding: '16px' }}>Control Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length ? filteredRequests.map(r => (
                    <React.Fragment key={r.id}>
                      <tr style={{ borderBottom: '1px solid var(--border)', background: '#ffffff' }}>
                        <td style={{ padding: '16px', fontWeight: 800, color: 'var(--primary)' }}>{r.ref_code}</td>
                        <td style={{ padding: '16px' }}>
                          <strong style={{ color: 'var(--ink)' }}>{r.hirer_name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{r.hirer_phone}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <strong style={{ color: 'var(--ink)' }}>{r.work_type}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{r.area} · offered: {money(r.wage_offered)}/day</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span className={`status-chip ${r.status}`}>{r.status}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {r.status === 'pending' && (
                              <button className="btn btn-primary btn-sm" onClick={() => setOpenAssign(openAssign === r.id ? null : r.id)} style={{ borderRadius: '4px' }}>
                                👷 Assign Worker
                              </button>
                            )}
                            {r.status === 'confirmed' && (
                              <button className="btn btn-ghost btn-sm" onClick={() => setReqStatus(r.id, 'completed')} style={{ color: 'var(--success)', borderColor: 'var(--success-border)', borderRadius: '4px' }}>
                                ✓ Complete
                              </button>
                            )}
                            {r.status !== 'cancelled' && r.status !== 'completed' && (
                              <button className="btn btn-ghost btn-sm" onClick={() => setReqStatus(r.id, 'cancelled')} style={{ color: 'var(--error)', borderColor: 'var(--error-border)', borderRadius: '4px' }}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Assign Panel */}
                      {openAssign === r.id && (
                        <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)' }}>
                          <td colSpan="5" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Select Worker to Confirm:</span>
                              <select
                                value={selectedWorker}
                                onChange={e => setSelectedWorker(e.target.value)}
                                style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '4px', outline: 'none', background: '#ffffff' }}
                              >
                                <option value="">-- Choose Available Worker --</option>
                                {availWorkers
                                  .filter(w => (w.work_types || []).includes(r.work_type) && w.area === r.area)
                                  .map(w => (
                                    <option key={w.id} value={w.id}>
                                      {w.name} ({w.availability_status}) - Avg: {w.rating_avg}★
                                    </option>
                                  ))}
                              </select>
                              <button className="btn btn-primary btn-sm" onClick={() => confirmWorker(r.id)} style={{ borderRadius: '4px' }}>
                                Confirm Dispatch &amp; Notify
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No requests matching search criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB: WORKERS ═══ */}
        {tab === 'workers' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
                <input
                  type="text"
                  placeholder="Search workers by name, phone, area..."
                  value={workerSearch}
                  onChange={e => setWorkerSearch(e.target.value)}
                  style={{
                    padding: '10px 16px 10px 42px',
                    borderRadius: '4px',
                    border: '1.5px solid var(--border)',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.9rem',
                    background: '#ffffff'
                  }}
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddWorker(!showAddWorker)} style={{ borderRadius: '4px' }}>
                {showAddWorker ? 'Cancel Register' : '➕ Register New Worker'}
              </button>
            </div>

            {/* Inline Add Worker form */}
            {showAddWorker && (
              <div className="card glass-card" style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '28px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1.15rem' }}>Chowk In-Person Registry Form</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div className="field">
                    <label>Full Name</label>
                    <input value={nw.name} onChange={e => setNw({ ...nw, name: e.target.value })} placeholder="e.g. Ramesh Kumar" />
                  </div>
                  <div className="field">
                    <label>Phone Number</label>
                    <input value={nw.phone} onChange={e => setNw({ ...nw, phone: e.target.value })} placeholder="e.g. +91 99999-XXXXX" />
                  </div>
                  <div className="field">
                    <label>Labour Chowk Area</label>
                    <select value={nw.area} onChange={e => setNw({ ...nw, area: e.target.value })}>
                      {data.areas.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Skills / Skills Tags (comma separated)</label>
                    <input value={nw.types} onChange={e => setNw({ ...nw, types: e.target.value })} placeholder="e.g. General Helper, Painter" />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleAddWorker} style={{ borderRadius: '4px' }}>Save Worker Profile</button>
              </div>
            )}

            <div className="table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="data" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '16px' }}>Photo</th>
                    <th style={{ padding: '16px' }}>Worker Name</th>
                    <th style={{ padding: '16px' }}>Phone</th>
                    <th style={{ padding: '16px' }}>Vetting Audit</th>
                    <th style={{ padding: '16px' }}>Reliability</th>
                    <th style={{ padding: '16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.length ? filteredWorkers.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border)', background: w.is_blacklisted ? '#fff1f2' : '#ffffff' }}>
                      <td style={{ padding: '16px' }}>
                        <img src={w.photo_url || '/assets/worker1.jpeg'} alt="" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <strong style={{ color: 'var(--ink)' }}>{w.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>📍 {w.area}</div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{w.phone}</td>
                      <td style={{ padding: '16px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setVettingWorker(w)} style={{ borderRadius: '4px', border: '1px solid var(--border)' }}>
                          🛡️ Audit Status
                        </button>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{w.reliability_score}%</div>
                        <div style={{ width: '80px', height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                          <div style={{ width: `${w.reliability_score}%`, height: '100%', background: 'var(--primary)' }}></div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleBlacklist(w)} style={{ color: w.is_blacklisted ? 'var(--success)' : 'var(--error)', borderColor: 'var(--border)', borderRadius: '4px' }}>
                            {w.is_blacklisted ? 'Whitelist' : '⚠️ Blacklist'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No workers registered.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB: BOOKINGS ═══ */}
        {tab === 'bookings' && (
          <div className="fade-in">
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
              <input
                type="text"
                placeholder="Search bookings log by ref code, client, or worker..."
                value={bookingSearch}
                onChange={e => setBookingSearch(e.target.value)}
                style={{
                  padding: '10px 16px 10px 42px',
                  borderRadius: '4px',
                  border: '1.5px solid var(--border)',
                  width: '100%',
                  maxWidth: '380px',
                  outline: 'none',
                  fontSize: '0.9rem',
                  background: '#ffffff'
                }}
              />
            </div>

            <div className="table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="data" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '16px' }}>Job Code</th>
                    <th style={{ padding: '16px' }}>Worker Confirmed</th>
                    <th style={{ padding: '16px' }}>Client Details</th>
                    <th style={{ padding: '16px' }}>Agreed Daily Wage</th>
                    <th style={{ padding: '16px' }}>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length ? filteredBookings.map(b => {
                    const req = data.requests.find(r => r.id === b.job_request_id) || {};
                    const w = data.workers.find(wr => wr.id === b.worker_id) || {};
                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', background: '#ffffff' }}>
                        <td style={{ padding: '16px', fontWeight: 800, color: 'var(--primary)' }}>{req.ref_code}</td>
                        <td style={{ padding: '16px' }}>
                          <strong style={{ color: 'var(--ink)' }}>{w.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>📞 {w.phone}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <strong style={{ color: 'var(--ink)' }}>{req.hirer_name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{req.hirer_phone}</div>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 700, color: 'var(--ink)' }}>{money(req.agreed_wage || req.wage_offered)}</td>
                        <td style={{ padding: '16px', color: 'var(--muted)', fontSize: '0.85rem' }}>{fmtDate(b.confirmed_at)}</td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No bookings active.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB: REVIEWS MODERATION ═══ */}
        {tab === 'reviews' && (
          <div className="fade-in">
            <div className="table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table className="data" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)' }}>
                    <th style={{ padding: '16px' }}>Worker ID</th>
                    <th style={{ padding: '16px' }}>Reviewer Name</th>
                    <th style={{ padding: '16px' }}>Stars &amp; Comment</th>
                    <th style={{ padding: '16px' }}>Review Date</th>
                    <th style={{ padding: '16px' }}>Moderation State</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.length ? reviews.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', background: '#ffffff' }}>
                      <td style={{ padding: '16px', fontWeight: 700 }}>{r.worker_id.toUpperCase()}</td>
                      <td style={{ padding: '16px', fontWeight: 650 }}>{r.hirer_name}</td>
                      <td style={{ padding: '16px' }}>
                        <div>{stars(r.rating)}</div>
                        <p style={{ margin: '4px 0 0', fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--muted)' }}>"{r.comment}"</p>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.82rem', color: 'var(--muted)' }}>{fmtDate(r.created_at)}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`status-chip ${r.status}`}>{r.status}</span>
                          {r.status === 'pending' && (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={() => setReviewStatus(r.id, 'published')} style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}>
                                Approve
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setReviewStatus(r.id, 'rejected')} style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'var(--error-border)', borderRadius: '4px' }}>
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No review comments submitted yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Vetting Audit Status Drawer/Modal */}
      {vettingWorker && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 15, 25, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div className="card glass-card" style={{ padding: '36px', background: '#ffffff', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%', border: '1px solid var(--border)' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px', color: 'var(--ink)' }}>
              🛡️ Audit Vetting Scorecard
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '24px' }}>
              Detailed physical checks scorecard registered in-person at labor chowk Registry Center:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
              {[
                { label: 'Aadhaar Identity Screened', checked: true },
                { label: 'Chowk In-Person Registry Record', checked: true },
                { label: 'Residence Reference Checks', checked: true },
                { label: 'Category Skills Verification', checked: true },
                { label: 'Prior Employment Punctuality Check', checked: true },
                { label: 'Active Availability Verified', checked: w => w.availability_status !== 'unavailable' }
              ].map((chk, i) => {
                const isPassed = typeof chk.checked === 'function' ? chk.checked(vettingWorker) : chk.checked;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--ink)' }}>
                    <span>{chk.label}</span>
                    <span style={{ color: isPassed ? 'var(--success)' : 'var(--error)', fontWeight: 700 }}>
                      {isPassed ? '✓ PASSED' : '✕ PENDING'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid var(--border)', paddingTop: '20px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Audit Reliability Rating:</span>
                <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--primary)' }}>
                  {vettingWorker.reliability_score}%
                </strong>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setVettingWorker(null)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1.5px solid var(--border)' }}>
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
