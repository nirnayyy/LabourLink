import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Check, Shield, Info, Briefcase, Award } from '../components/Icons';
import { fmtDate, money, stars, uid } from '../data';

export default function CustomerDashboard({ auth, data, onUpdateRequest, onAddReview, onAddBooking }) {
  const [tab, setTab] = useState('jobs');
  const [reviewForm, setReviewForm] = useState({ target: null, rating: 5, comment: '' });
  const [msg, setMsg] = useState(null);

  // Negotiation & checkout states
  const [counterInputs, setCounterInputs] = useState({}); // { 'reqId-workerId': '' }
  const [payingJob, setPayingJob] = useState(null); // job request currently checking out
  const [chattingWorker, setChattingWorker] = useState(null); // worker details for chat panel
  const [chatMessages, setChatMessages] = useState({}); // { workerId: [msgObj] }
  const [isTranslated, setIsTranslated] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');

  const myRequests = data.requests
    .filter(r => r.hirer_email === auth.user?.email || r.hirer_name === auth.user?.name)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const myBookings = data.bookings
    .filter(b => {
      const req = data.requests.find(r => r.id === b.job_request_id);
      return req && (req.hirer_email === auth.user?.email || req.hirer_name === auth.user?.name);
    })
    .map(b => {
      const req = data.requests.find(r => r.id === b.job_request_id) || {};
      const worker = data.workers.find(w => w.id === b.worker_id) || {};
      return { ...b, request: req, worker };
    })
    .sort((a, b) => new Date(b.confirmed_at || 0) - new Date(a.confirmed_at || 0));

  const handleComplete = (reqId) => {
    onUpdateRequest(reqId, { status: 'completed' });
    const booking = data.bookings.find(b => b.job_request_id === reqId);
    if (booking) {
      booking.status = 'completed';
      booking.completed_at = new Date().toISOString();
    }
    setMsg({ type: 'ok', text: 'Job marked as completed! Review your worker below.' });
    setTimeout(() => setMsg(null), 5000);
  };

  const handleCancel = (reqId) => {
    onUpdateRequest(reqId, { status: 'cancelled' });
    setMsg({ type: 'ok', text: 'Hiring request cancelled successfully.' });
    setTimeout(() => setMsg(null), 4000);
  };

  const submitCounterOffer = (reqId, workerId, currentWage) => {
    const key = `${reqId}-${workerId}`;
    const amount = Number(counterInputs[key]);
    if (!amount || amount <= 0) {
      alert('Please enter a valid wage offer.');
      return;
    }

    const request = data.requests.find(r => r.id === reqId);
    if (!request) return;

    const updatedOffers = (request.offers || []).map(o => {
      if (o.worker_id === workerId) {
        return {
          ...o,
          wage: amount,
          history: [...o.history, { sender: 'hirer', wage: amount }]
        };
      }
      return o;
    });

    onUpdateRequest(reqId, { offers: updatedOffers });
    setCounterInputs(prev => ({ ...prev, [key]: '' }));
    setMsg({ type: 'ok', text: `Counter offer of ₹${amount}/day submitted.` });
    setTimeout(() => setMsg(null), 5000);
  };

  const acceptWorkerOffer = (reqId, workerId, wage) => {
    const request = data.requests.find(r => r.id === reqId);
    if (!request) return;

    const updatedOffers = (request.offers || []).map(o => {
      if (o.worker_id === workerId) {
        return { ...o, wage, status: 'agreed' };
      }
      return { ...o, status: 'rejected' };
    });

    onUpdateRequest(reqId, {
      agreed_worker_id: workerId,
      agreed_wage: wage,
      offers: updatedOffers
    });
    setMsg({ type: 'ok', text: `Wage agreed at ₹${wage}! Proceed to pay portal fee to unlock contact.` });
    setTimeout(() => setMsg(null), 6000);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!payingJob) return;

    const reqId = payingJob.id;
    const workerId = payingJob.agreed_worker_id;

    onUpdateRequest(reqId, {
      is_unlocked: true,
      status: 'confirmed'
    });

    const newBooking = {
      id: uid('b'),
      job_request_id: reqId,
      worker_id: workerId,
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    };
    onAddBooking(newBooking);

    setPayingJob(null);
    setMsg({ type: 'ok', text: 'Payment successful! Worker details are now unlocked.' });
    setTimeout(() => setMsg(null), 5000);
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!reviewForm.target) return;
    const review = {
      id: uid('r'),
      worker_id: reviewForm.target,
      hirer_name: auth.user?.name || 'Customer',
      rating: parseInt(reviewForm.rating, 10),
      comment: reviewForm.comment.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    onAddReview(review);
    setReviewForm({ target: null, rating: 5, comment: '' });
    setMsg({ type: 'ok', text: 'Review submitted! It will appear on the profile after validation.' });
    setTimeout(() => setMsg(null), 4000);
  };

  // Mock message sending
  const sendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !chattingWorker) return;
    const wId = chattingWorker.id;
    const newMsg = {
      id: Date.now(),
      sender: 'hirer',
      text: typedMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => ({
      ...prev,
      [wId]: [...(prev[wId] || [
        { id: 1, sender: 'worker', text: 'Namaste! I am ready to join tomorrow as agreed.', time: '05:30 PM' }
      ]), newMsg]
    }));
    setTypedMessage('');

    // Trigger mock worker response
    setTimeout(() => {
      const respMsg = {
        id: Date.now() + 1,
        sender: 'worker',
        text: 'Dhanyawad. Please share landmark location coordinates.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => ({
        ...prev,
        [wId]: [...(prev[wId] || []), respMsg]
      }));
    }, 2000);
  };

  const getChatList = (wId) => {
    return chatMessages[wId] || [
      { id: 1, sender: 'worker', text: 'Namaste! I am ready to join tomorrow as agreed.', time: '05:30 PM' }
    ];
  };

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Dash Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="eyebrow">Employer Workspace</p>
            <h2>Welcome, {auth.user?.name || 'Customer'} 🏠</h2>
          </div>
          <div>
            <Link to="/post-job" className="btn btn-primary btn-sm">📋 Post a New Job</Link>
          </div>
        </div>

        {msg && <div className={`notice ${msg.type === 'ok' ? 'ok' : 'err'}`} style={{ marginBottom: '24px' }}>{msg.text}</div>}

        <div className="dash-layout">
          {/* Sidebar Nav */}
          <aside className="dash-sidebar">
            <button className={`dash-sidebar-btn ${tab === 'jobs' ? 'active' : ''}`} onClick={() => setTab('jobs')}>
              <Briefcase size={16} /> My Job Requests ({myRequests.length})
            </button>
            <button className={`dash-sidebar-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
              <Check size={16} /> Assigned Workers ({myBookings.length})
            </button>
          </aside>

          {/* Main Panel Content */}
          <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '32px' }}>
            
            {/* ─── Jobs Tab ─── */}
            {tab === 'jobs' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px' }}>My Job Posting Registry</h3>
                
                {myRequests.length ? myRequests.map(j => {
                  const agreedWorker = j.agreed_worker_id ? data.workers.find(w => w.id === j.agreed_worker_id) : null;
                  
                  return (
                    <div key={j.id} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--ink)' }}>
                            {j.work_type} — <span style={{ color: 'var(--secondary)' }}>{j.ref_code}</span>
                          </h4>
                          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                            📍 <strong>{j.area}</strong> · {j.location} · 📅 Date: {fmtDate(j.job_date)} · Offered: <strong>{money(j.wage_offered)}/day</strong>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`status-chip ${j.status}`}>{j.status}</span>
                          {(j.status === 'pending' || j.status === 'confirmed') && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(j.id)} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Visual Pipeline timeline */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', margin: '20px 0', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>
                        <span style={{ color: 'var(--primary)' }}>✓ Posted</span>
                        <span style={{ color: j.offers?.length > 0 || j.agreed_worker_id ? 'var(--primary)' : 'var(--muted-light)' }}>
                          {j.offers?.length > 0 || j.agreed_worker_id ? '✓ Negotiating' : 'Negotiating'}
                        </span>
                        <span style={{ color: j.agreed_worker_id ? 'var(--primary)' : 'var(--muted-light)' }}>
                          {j.agreed_worker_id ? '✓ Agreed' : 'Agreed'}
                        </span>
                        <span style={{ color: j.is_unlocked ? 'var(--primary)' : 'var(--muted-light)' }}>
                          {j.is_unlocked ? '✓ Details Unlocked' : 'Details Unlocked'}
                        </span>
                        <span style={{ color: j.status === 'completed' ? 'var(--primary)' : 'var(--muted-light)' }}>
                          {j.status === 'completed' ? '✓ Finished' : 'Finished'}
                        </span>
                      </div>

                      {/* Negotiation block */}
                      {j.status === 'pending' && (
                        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)', marginTop: '16px' }}>
                          <h5 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink)' }}>
                            🤝 Wage Negotiation Desk
                          </h5>

                          {!j.agreed_worker_id ? (
                            <div>
                              {j.offers && j.offers.length > 0 ? (
                                j.offers.map(o => {
                                  const key = `${j.id}-${o.worker_id}`;
                                  const lastMsg = o.history[o.history.length - 1];
                                  const isWorkerTurn = lastMsg.sender === 'worker';

                                  return (
                                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                      <div>
                                        <strong style={{ color: 'var(--ink)' }}>{o.worker_name}</strong>
                                        <div className="muted" style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                                          Bid: <strong style={{ color: 'var(--secondary)' }}>{money(o.wage)}</strong> · 
                                          {isWorkerTurn ? ' Counter-offered' : ' Propose Sent'}
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {isWorkerTurn ? (
                                          <>
                                            <button className="btn btn-primary btn-sm" onClick={() => acceptWorkerOffer(j.id, o.worker_id, o.wage)}>
                                              Accept {money(o.wage)}
                                            </button>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                              <input
                                                type="number"
                                                placeholder="Counter ₹"
                                                value={counterInputs[key] || ''}
                                                onChange={e => setCounterInputs(prev => ({ ...prev, [key]: e.target.value }))}
                                                style={{ width: '100px', padding: '8px 10px', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
                                              />
                                              <button className="btn btn-ghost btn-sm" onClick={() => submitCounterOffer(j.id, o.worker_id, o.wage)} style={{ padding: '8px 14px' }}>
                                                Counter
                                              </button>
                                            </div>
                                          </>
                                        ) : (
                                          <span className="muted" style={{ fontSize: '0.82rem', fontStyle: 'italic' }}>
                                            Waiting for worker response...
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
                                  No bids received yet. Nearby verified workers are being coordinated by the team.
                                </p>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                              <div>
                                <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'block', fontSize: '0.95rem' }}>✓ Wage Agreed!</span>
                                <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>
                                  You booked <strong>{agreedWorker?.name}</strong> at <strong>{money(j.agreed_wage)}/day</strong>.
                                </div>
                              </div>
                              {!j.is_unlocked ? (
                                <button className="btn btn-secondary btn-sm" onClick={() => setPayingJob(j)} style={{ padding: '10px 18px' }}>
                                  💳 Pay Unlock Fee (₹10)
                                </button>
                              ) : (
                                <div style={{ background: 'var(--success-light)', color: 'var(--success-text)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 700, border: '1px solid var(--success-border)' }}>
                                  🔓 Unlocked! Direct Contact: {agreedWorker?.phone}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Finish Confirmation Trigger */}
                      {j.status === 'confirmed' && agreedWorker && (
                        <div style={{ marginTop: 16, padding: 18, background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ fontSize: '0.9rem' }}>
                            <strong>Confirmed Worker: {agreedWorker.name}</strong> · Wage: {money(j.agreed_wage)} · Contact: {agreedWorker.phone}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setChattingWorker(agreedWorker)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                              💬 Chat Mock
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => handleComplete(j.id)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                              ✓ Completed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div style={{ padding: '64px 32px', textAlign: 'center', background: '#ffffff' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>No job requests found</h4>
                    <p className="muted" style={{ margin: '0 0 20px' }}>You haven't posted any requirements yet.</p>
                    <Link to="/post-job" className="btn btn-primary">Post your first job</Link>
                  </div>
                )}
              </div>
            )}

            {/* ─── Bookings Tab ─── */}
            {tab === 'bookings' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px' }}>Assigned Daily Workers Registry</h3>
                
                {myBookings.length ? myBookings.map(b => (
                  <div key={b.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                      <img src={b.worker.photo_url || '/assets/worker1.jpeg'} alt={b.worker.name} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid var(--border)' }} />
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <Link to={`/worker/${b.worker.id}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>
                          {b.worker.name}
                        </Link>
                        <div className="muted" style={{ fontSize: '0.82rem', marginTop: '2px', color: 'var(--muted)' }}>
                          📍 {b.worker.area} · 📞 Contact: {b.request.is_unlocked ? b.worker.phone : '[🔒 Locked — Pay Fee]'}
                        </div>
                        <div className="muted" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                          Work: {b.request.work_type} · Ref: {b.request.ref_code} · Wage: {money(b.request.agreed_wage)}/day
                        </div>
                      </div>
                      <span className={`status-chip ${b.status}`}>{b.status}</span>
                    </div>

                    {/* Review Forms */}
                    {b.status === 'completed' && (
                      <div style={{ marginTop: 16, paddingLeft: '72px' }}>
                        {reviewForm.target === b.worker.id ? (
                          <form onSubmit={handleReview} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end', background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                            <div className="field" style={{ margin: 0, minWidth: '160px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Choose Stars</label>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                {[1, 2, 3, 4, 5].map(idx => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setReviewForm(f => ({ ...f, rating: idx }))}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                                  >
                                    <Star size={20} fill={idx <= reviewForm.rating ? 'var(--warning)' : 'none'} style={{ color: idx <= reviewForm.rating ? 'var(--warning)' : 'var(--border-hover)' }} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="field" style={{ margin: 0, flex: 2, minWidth: '240px' }}>
                              <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Review Description</label>
                              <input placeholder="Describe punctuality, work performance, and general behavior..." value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} style={{ padding: '8px 12px', fontSize: '0.88rem' }} required />
                            </div>
                            <button className="btn btn-primary btn-sm" type="submit" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Submit</button>
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setReviewForm({ target: null, rating: 5, comment: '' })} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => setReviewForm(f => ({ ...f, target: b.worker.id }))} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                            ⭐ Leave a Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )) : (
                  <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👷</div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>No confirmed workers yet</h4>
                    <p className="muted" style={{ margin: 0 }}>Completed bookings and assigned workers will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── UPI QR PAYMENT CHECKOUT MODAL ─── */}
      {payingJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 13, 22, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16, backdropFilter: 'blur(6px)' }}>
          <div className="fade-in card" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '440px', padding: '36px 28px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', position: 'relative' }}>
            <button style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--muted-light)' }} onClick={() => setPayingJob(null)}>
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>💳</div>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Secure Contact Activation</h3>
              <p className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
                UPI / NetBanking simulation (₹10 Platform Maintenance Fee)
              </p>
            </div>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span className="muted">Job Code:</span>
                <strong style={{ color: 'var(--ink)' }}>{payingJob.ref_code}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span className="muted">Booked Worker:</span>
                <strong style={{ color: 'var(--ink)' }}>{data.workers.find(w => w.id === payingJob.agreed_worker_id)?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span className="muted">Daily Wage:</span>
                <strong style={{ color: 'var(--ink)' }}>{money(payingJob.agreed_wage)}</strong>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Amount Due:</span>
                <strong style={{ color: 'var(--secondary)' }}>₹10.00</strong>
              </div>
            </div>

            {/* Simulated QR Code */}
            <div style={{ textAlign: 'center', marginBottom: '24px', background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <img src="/assets/logo.jpeg" alt="Simulated QR Code" style={{ width: '130px', height: '130px', margin: '0 auto 10px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>UPI ID: labourlink@upi</div>
            </div>

            <form onSubmit={handlePayment}>
              <button className="btn btn-primary btn-block" type="submit" style={{ padding: '14px' }}>
                ✓ Simulate Successful Payment (₹10)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── INTERACTIVE MOCK MESSAGING PANEL ─── */}
      {chattingWorker && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '340px', height: '420px', background: '#ffffff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', zIndex: 1100, overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ background: 'var(--ink)', color: '#ffffff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={chattingWorker.photo_url || '/assets/worker1.jpeg'} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ffffff' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{chattingWorker.name}</div>
                <button
                  type="button"
                  onClick={() => setIsTranslated(!isTranslated)}
                  style={{ background: 'var(--primary-light)', border: 'none', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', marginTop: '3px' }}
                >
                  {isTranslated ? '🇺🇸 Translate to EN' : '🇮🇳 Translate to HI'}
                </button>
              </div>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setChattingWorker(null)}>
              ✕
            </button>
          </div>
          {/* Chat Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {getChatList(chattingWorker.id).map(m => {
              // Mock translation dictionary
              const dict = {
                "Namaste! I am ready to join tomorrow as agreed.": "नमस्ते! मैं सहमति के अनुसार कल काम पर आने के लिए तैयार हूँ।",
                "Dhanyawad. Please share landmark location coordinates.": "धन्यवाद। कृपया मुख्य लैंडमार्क स्थान के निर्देश साझा करें।"
              };
              const displayText = (isTranslated && m.sender === 'worker') ? (dict[m.text] || dict[m.text] || `[HI]: ${m.text}`) : m.text;

              return (
                <div key={m.id} style={{ alignSelf: m.sender === 'hirer' ? 'flex-end' : 'flex-start', background: m.sender === 'hirer' ? 'var(--primary)' : '#ffffff', color: m.sender === 'hirer' ? '#ffffff' : 'var(--ink)', padding: '10px 14px', borderRadius: '12px', maxWidth: '80%', boxShadow: 'var(--shadow-sm)', fontSize: '0.85rem', border: m.sender === 'worker' ? '1px solid var(--border)' : 'none' }}>
                  <div>{displayText}</div>
                  <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '5px', opacity: 0.8 }}>{m.time}</div>
                </div>
              );
            })}
          </div>
          {/* Chat Form */}
          <form onSubmit={sendMessage} style={{ borderTop: '1px solid var(--border)', display: 'flex', padding: '8px', background: '#ffffff' }}>
            <input
              type="text"
              placeholder="Type message..."
              value={typedMessage}
              onChange={e => setTypedMessage(e.target.value)}
              style={{ flex: 1, border: 'none', padding: '10px', fontSize: '0.88rem', outline: 'none' }}
            />
            <button className="btn btn-primary btn-sm" type="submit" style={{ padding: '8px 16px', borderRadius: '6px' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
