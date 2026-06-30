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
            <Link to="/post-job" className="btn btn-primary btn-sm" style={{ borderRadius: '4px' }}>📋 Post a New Job</Link>
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
          <div className="card glass-card" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            
            {/* ─── Jobs Tab ─── */}
            {tab === 'jobs' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', color: 'var(--ink)' }}>
                  My Job Posting Registry
                </h3>
                
                {myRequests.length ? myRequests.map(j => {
                  const agreedWorker = j.agreed_worker_id ? data.workers.find(w => w.id === j.agreed_worker_id) : null;
                  
                  return (
                    <div key={j.id} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--ink)' }}>
                            {j.work_type} — <span style={{ color: 'var(--primary)' }}>{j.ref_code}</span>
                          </h4>
                          <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                            📍 <strong>{j.area}</strong> · {j.location} · 📅 Date: {fmtDate(j.job_date)} · Offered: <strong>{money(j.wage_offered)}/day</strong>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`status-chip ${j.status}`}>{j.status}</span>
                          {(j.status === 'pending' || j.status === 'confirmed') && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(j.id)} style={{ padding: '6px 12px', fontSize: '0.78rem', borderRadius: '4px' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Pipeline timeline */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg)', border: '1px solid var(--border)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', margin: '20px 0', fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 700 }}>
                        <span style={{ color: 'var(--primary)' }}>✓ Posted</span>
                        <span style={{ color: j.offers?.length > 0 || j.agreed_worker_id ? 'var(--primary)' : 'var(--muted-light)' }}>
                          {j.offers?.length > 0 || j.agreed_worker_id ? '✓ Negotiating' : 'Negotiating'}
                        </span>
                        <span style={{ color: j.agreed_worker_id ? 'var(--primary)' : 'var(--muted-light)' }}>
                          {j.agreed_worker_id ? '✓ Wage Agreed' : 'Wage Agreed'}
                        </span>
                        <span style={{ color: j.is_unlocked ? 'var(--primary)' : 'var(--muted-light)' }}>
                          {j.is_unlocked ? '✓ Verified Dispatch' : 'Verified Dispatch'}
                        </span>
                      </div>

                      {/* Offers Negotiation section */}
                      {j.status === 'pending' && (j.offers || []).length > 0 && (
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '16px' }}>
                          <h5 style={{ margin: '0 0 12px', fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            💬 Active Worker Bids &amp; Wage Proposals
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {j.offers.map(o => (
                              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, background: '#ffffff', padding: '12px 16px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                <div>
                                  <strong style={{ color: 'var(--ink)' }}>{o.worker_name}</strong>
                                  <span style={{ color: 'var(--muted-light)', fontSize: '0.78rem', marginLeft: '8px' }}>Bid: <strong>{money(o.wage)}/day</strong></span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  {o.status === 'agreed' ? (
                                    <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.82rem' }}>Accepted</span>
                                  ) : (
                                    <>
                                      <button className="btn btn-primary btn-sm" onClick={() => acceptWorkerOffer(j.id, o.worker_id, o.wage)} style={{ borderRadius: '4px' }}>
                                        Accept Bid
                                      </button>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>or counter:</span>
                                      <input
                                        type="number"
                                        placeholder="₹ Counter"
                                        value={counterInputs[`${j.id}-${o.worker_id}`] || ''}
                                        onChange={e => setCounterInputs({ ...counterInputs, [`${j.id}-${o.worker_id}`]: e.target.value })}
                                        style={{ width: '90px', padding: '5px 10px', border: '1.5px solid var(--border)', borderRadius: '4px', outline: 'none' }}
                                      />
                                      <button className="btn btn-ghost btn-sm" onClick={() => submitCounterOffer(j.id, o.worker_id, o.wage)} style={{ borderRadius: '4px' }}>
                                        Submit Counter
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pay to Unlock Checkout panel */}
                      {j.status === 'pending' && j.agreed_worker_id && !j.is_unlocked && agreedWorker && (
                        <div style={{ marginTop: '20px', background: 'var(--primary-light)', border: '1.5px solid var(--primary-border)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <strong style={{ display: 'block', color: 'var(--primary-hover)', fontSize: '0.95rem' }}>
                              🎉 Wage agreed with {agreedWorker.name} at {money(j.agreed_wage)}/day!
                            </strong>
                            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Pay the community registration fee to unlock in-app worker chat and phone logs.</span>
                          </div>
                          <button className="btn btn-primary" onClick={() => setPayingJob(j)} style={{ borderRadius: '4px' }}>
                            💳 Pay and Confirm (₹99)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <p className="muted" style={{ padding: '32px 0', textAlign: 'center' }}>You have not posted any daily wage job requirements yet.</p>
                )}
              </div>
            )}

            {/* ─── Assigned Bookings Tab ─── */}
            {tab === 'bookings' && (
              <div className="fade-in">
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', color: 'var(--ink)' }}>
                  Assigned Workers Logs &amp; Chats
                </h3>
                
                {myBookings.length ? myBookings.map(b => (
                  <div key={b.id} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img src={b.worker.photo_url || '/assets/worker1.jpeg'} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} />
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: 'var(--ink)' }}>{b.worker.name}</h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            📍 {b.worker.area} · Role: <strong>{b.request.work_type}</strong> · Wage: <strong>{money(b.request.agreed_wage || b.request.wage_offered)}/day</strong>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--success-text)', fontWeight: 650, marginTop: '4px' }}>
                            📞 Phone: {b.worker.phone} (Unlocked)
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setChattingWorker(b.worker)} style={{ borderRadius: '4px', border: '1.5px solid var(--border)' }}>
                          💬 In-App Chat
                        </button>
                        {b.request.status !== 'completed' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleComplete(b.request.id)} style={{ borderRadius: '4px' }}>
                            ✓ Mark Job Completed
                          </button>
                        )}
                        {b.request.status === 'completed' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setReviewForm({ target: b.worker.id, rating: 5, comment: '' })} style={{ borderRadius: '4px', color: 'var(--secondary)', borderColor: 'var(--secondary-border)' }}>
                            ★ Review Worker
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="muted" style={{ padding: '32px 0', textAlign: 'center' }}>No assigned daily workers in your active bookings history.</p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Review Worker modal overlay */}
      {reviewForm.target && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 15, 25, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div className="card glass-card" style={{ padding: '36px', background: '#ffffff', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 6px', color: 'var(--ink)' }}>Write a Verified Review</h3>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>Submit your feedback to update the Noida community rating scoreboard.</p>
            <form onSubmit={handleReview}>
              <div className="field">
                <label>Punctuality &amp; Skills Rating</label>
                <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Good)</option>
                  <option value="3">3 Stars (Average)</option>
                  <option value="2">2 Stars (Poor)</option>
                  <option value="1">1 Star (Very Bad)</option>
                </select>
              </div>
              <div className="field">
                <label>Review Description</label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Write your experience..." required style={{ minHeight: '90px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReviewForm({ target: null, rating: 5, comment: '' })} style={{ borderRadius: '4px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '4px' }}>Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── checkout QR code overlay ─── */}
      {payingJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 15, 25, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
          <div className="card glass-card" style={{ padding: '36px', background: '#ffffff', borderRadius: 'var(--radius-lg)', maxWidth: '440px', width: '90%', textAlign: 'center', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--ink)', marginBottom: '8px' }}>Scan &amp; Confirm Dispatch</h3>
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>One-time registration fee to unlock worker's phone logs.</p>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'inline-block', marginBottom: '24px' }}>
              <img src="/assets/qr-code.jpeg" alt="Pay UPI QR Code" style={{ width: '170px', height: '170px', display: 'block', margin: '0 auto', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '12px' }}>
                UPI ID: <strong>99999XXXXX@paytm</strong>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              <div className="field" style={{ textAlign: 'left' }}>
                <label>Transfer Transaction Reference ID / UPI Ref Number</label>
                <input placeholder="Enter 12-digit transaction ID..." required style={{ padding: '10px 14px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPayingJob(null)} style={{ borderRadius: '4px' }}>Cancel Payment</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: '4px' }}>✓ Verify Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── in-app chat drawer overlay ─── */}
      {chattingWorker && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(11, 15, 25, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div className="card glass-card" style={{ width: '480px', height: '580px', background: '#ffffff', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ background: 'var(--ink)', padding: '20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={chattingWorker.photo_url || '/assets/worker1.jpeg'} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem' }}>{chattingWorker.name}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>● Active Translation (Hindi &lt;&gt; English)</span>
                </div>
              </div>
              <button onClick={() => setChattingWorker(null)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.4rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {getChatList(chattingWorker.id).map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender === 'hirer' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{
                    background: msg.sender === 'hirer' ? 'var(--primary)' : '#ffffff',
                    color: msg.sender === 'hirer' ? '#ffffff' : 'var(--ink)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    borderTopLeftRadius: msg.sender === 'worker' ? '2px' : '12px',
                    borderTopRightRadius: msg.sender === 'hirer' ? '2px' : '12px',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    border: msg.sender === 'worker' ? '1px solid var(--border)' : 'none',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {isTranslated && msg.sender === 'worker' ? "धन्यवाद। कृपया लैंडमार्क लोकेशन कोआर्डिनेट्स साझा करें।" : msg.text}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted-light)', display: 'block', textAlign: msg.sender === 'hirer' ? 'right' : 'left', marginTop: '4px', fontWeight: 600 }}>
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ background: '#ffffff', padding: '16px', borderTop: '1px solid var(--border)' }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Type message in English..."
                  value={typedMessage}
                  onChange={e => setTypedMessage(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '4px', outline: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '4px' }}>Send</button>
              </form>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsTranslated(!isTranslated)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isTranslated ? "✓ Showing Original English" : "🗣️ Translate Worker's Hindi"}
                </button>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted-light)' }}>SMS fallback active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
