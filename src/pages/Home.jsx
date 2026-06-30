import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, Info, Check, Calendar, Briefcase, Activity, FileText } from '../components/Icons';
import { stars, money } from '../data';

export default function Home({ data }) {
  const { workers, reviews, wages } = data;
  const publishedWorkers = workers.filter(w => w.is_published && !w.is_blacklisted);
  const topWorkers = [...publishedWorkers]
    .sort((a, b) => b.rating_avg - a.rating_avg || b.total_jobs - a.total_jobs)
    .slice(0, 4);

  const totalJobs = publishedWorkers.reduce((s, w) => s + (w.total_jobs || 0), 0);
  const publishedReviews = reviews.filter(r => r.status === 'published');

  // Wage calculator state
  const [calcWorkType, setCalcWorkType] = useState('General Helper');
  const selectedWage = wages.find(w => w.work_type === calcWorkType) || wages[0];

  // Active Job Ticker State
  const [tickerIdx, setTickerIdx] = useState(0);
  const tickerItems = [
    "⚡ Rajesh Yadav confirmed for Digger (Beldar) job at Kasna Chowk — ₹650 agreed",
    "⚡ Sunita Devi confirmed for Cleaning Help at Gaur City, Greater Noida West",
    "⚡ Vikram Singh assigned to Shifting / Moving job in Sector 62",
    "⚡ Mohan Lal booked for Painting assignment at Knowledge Park — ₹850 agreed",
    "⚡ New general worker request received for Bennett University community project"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIdx(prev => (prev + 1) % tickerItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  return (
    <div className="fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Mesh Blobs */}
      <div className="mesh-blob" style={{ top: '10%', left: '5%' }}></div>
      <div className="mesh-blob accent" style={{ top: '40%', right: '10%' }}></div>

      {/* ─── LIVE ACTIVITY TICKER ─── */}
      <div style={{ background: 'var(--secondary-light)', borderBottom: '1px solid var(--secondary-border)', padding: '10px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--secondary)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            <span className="live-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }}></span>
            Live Ticker
          </span>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {tickerItems[tickerIdx]}
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section style={{ padding: '80px 0 100px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
        <div className="container hero-grid" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, padding: '6px 14px', borderRadius: '4px', marginBottom: '24px', border: '1.5px solid var(--primary-border)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary)' }}></span>
              Hyperlocal Daily Wage Network · Greater Noida
            </div>
            <h1 style={{ marginBottom: '24px', lineHeight: '1.1', fontSize: 'clamp(2.5rem, 6vw, 3.8rem)' }}>
              Need daily helpers? <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get vetted, honest workers.</span>
            </h1>
            <p className="lead" style={{ marginBottom: '36px', color: 'var(--muted)', fontSize: '1.1rem' }}>
              Bridging the digital gap at local labor chowks. Specify your work requirements (loading, shifting, cleaning, digging) and our team <strong>personally contacts and confirms a verified worker</strong>. Zero commissions. Pay directly.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/post-job" className="btn btn-primary" style={{ padding: '16px 32px', borderRadius: 'var(--radius-sm)' }}>
                <FileText size={18} />
                Hire a Worker Today
              </Link>
              <Link to="/browse" className="btn btn-ghost" style={{ padding: '16px 32px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)' }}>
                <Briefcase size={18} />
                Browse Directory
              </Link>
            </div>
            <div style={{ marginTop: '24px' }}>
              <Link to="/login?role=labour&mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                Looking for daily wage work? Join as a registered worker today →
              </Link>
            </div>
            
            <div className="hero-badges" style={{ marginTop: '48px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="pill" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ink)' }}>
                <Shield size={14} style={{ color: 'var(--primary)' }} />
                In-Person Verified
              </span>
              <span className="pill" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ink)' }}>
                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                9 PM Confirmation SLA
              </span>
              <span className="pill" style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--ink)' }}>
                <Star size={14} style={{ color: 'var(--primary)' }} />
                Verified Ratings
              </span>
            </div>
          </div>
          
          <div className="hero-photo" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
            <img src="/assets/hero-chowk.jpeg" alt="Daily wage workers at a labour chowk in Greater Noida" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(11, 15, 25, 0.85)', padding: '14px 20px', borderRadius: 'var(--radius-md)', color: '#ffffff', fontSize: '0.82rem', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: 'var(--shadow-lg)' }}>
              📍 <strong>Kasna Chowk Registry Center, Greater Noida</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BENTO GRID ─── */}
      <section className="section" style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="bento-grid">
            
            <div className="bento-col-4 glass-card" style={{ padding: '36px', borderRadius: 'var(--radius-lg)', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1' }}>{publishedWorkers.length}+</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '10px', color: 'var(--ink)' }}>Verified Local Workers</div>
              <p className="muted" style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>Physically registered and identity-audited daily wage partners in Noida chowks.</p>
            </div>
            
            <div className="bento-col-4 glass-card" style={{ padding: '36px', borderRadius: 'var(--radius-lg)', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1' }}>{totalJobs}+</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '10px', color: 'var(--ink)' }}>Jobs Successfully Completed</div>
              <p className="muted" style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>Coordinated helper dispatches completed for residential and commercial builds.</p>
            </div>

            <div className="bento-col-4 glass-card" style={{ padding: '36px', borderRadius: 'var(--radius-lg)', background: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--secondary)', lineHeight: '1' }}>100%</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '10px', color: 'var(--ink)' }}>Zero Platform Cuts</div>
              <p className="muted" style={{ margin: '8px 0 0', fontSize: '0.85rem' }}>Every rupee goes directly to the worker. Zero commissions taken from worker payouts.</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── BENNETT SOCIAL PROJECT FEATURES ─── */}
      <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="bento-grid">
            {[
              { icon: <Shield size={24} />, t: 'Safe Direct Payouts', d: 'No online wallets or deposits. Pay workers directly via cash or personal UPI once the daily job is finished.' },
              { icon: <Check size={24} />, t: 'In-Person Registry', d: 'Every worker has been visited, interviewed, and photo-verified at local labor chowks by our coordination team.' },
              { icon: <Info size={24} />, t: 'Bennett Welfare Project', d: 'Built and managed by Bennett University students as a community welfare social service. Non-profit and student-run.' }
            ].map((f, i) => (
              <div className="bento-col-4 glass-card" key={i} style={{ padding: '32px', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1.5px solid var(--primary-border)' }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '10px', color: 'var(--ink)' }}>{f.t}</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STEPPER: HOW IT WORKS ─── */}
      <section className="section" style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: '48px' }}>
            <p className="eyebrow">Hiring Flow</p>
            <h2>How LabourLink Works</h2>
            <p className="lead">A reliable, human-assisted process. We handle the coordination so you do not have to drive to the chowk.</p>
          </div>
          
          <div className="stepper" style={{ marginBottom: '56px' }}>
            {['Post Job Request', 'Availability Verified', 'Get Details SMS', 'Rate & Review'].map((label, idx) => (
              <div className="step-item active" key={idx}>
                <div className="step-number" style={{ background: 'var(--primary)', border: '2px solid var(--primary-border)' }}>{idx + 1}</div>
                <div className="step-label" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid cols-4" style={{ gap: '24px' }}>
            {[
              { n: '01', t: 'Post Your Need', d: 'Submit a simple job request online details (work type, location, date, offered wage).' },
              { n: '02', t: 'Our Team Confirms', d: 'We check availability, phone the workers, and confirm someone reliable for your job.' },
              { n: '03', t: 'Get Details via SMS', d: 'Receive worker details, including contact numbers and verified photo, prior to work starting.' },
              { n: '04', t: 'Review and Rate', d: 'After completion, rate the worker. This updates their community reliability score.' },
            ].map(s => (
              <div className="card glass-card" key={s.n} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '32px' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '16px', fontSize: '1.6rem', fontWeight: 800 }}>{s.n}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{s.t}</h3>
                <p className="muted" style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED WORKERS ─── */}
      <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Worker Registry</p>
            <h2>Verified Workers Near You</h2>
            <p className="lead">Top-rated workers registered in the Greater Noida area with stellar reliability records.</p>
          </div>
          <div className="grid cols-4" style={{ gap: '24px' }}>
            {topWorkers.length ? topWorkers.map(w => (
              <Link to={`/worker/${w.id}`} className="card glass-card" key={w.id} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', background: '#ffffff', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img src={w.photo_url || '/assets/worker1.jpeg'} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--success-light)', color: 'var(--success-text)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--success-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Check size={12} strokeWidth={3} />
                    Verified
                  </div>
                </div>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.15rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--ink)' }}>{w.name}</h3>
                    <span className={`status-chip ${w.availability_status}`} style={{ flexShrink: 0, textTransform: 'capitalize' }}>{w.availability_status}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>📍 {w.area}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '1rem' }}>{stars(w.rating_avg)}</span>
                      <strong style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>{Number(w.rating_avg).toFixed(1)}</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-light)', fontWeight: 700 }}>{w.total_jobs} jobs done</span>
                  </div>
                </div>
              </Link>
            )) : <p className="muted">No workers registered at the moment.</p>}
          </div>
          <div className="text-center" style={{ marginTop: 48 }}>
            <Link to="/browse" className="btn btn-ghost" style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)', padding: '14px 28px' }}>
              Search Full Worker Directory →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WAGE ESTIMATOR & DIRECT PAYMENTS ─── */}
      <section className="section" style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Fair Pay Policy</p>
            <h2>Interactive Wage Estimator</h2>
            <p className="lead">Choose a work category to view current daily market rate guidance in Greater Noida.</p>
          </div>
          
          <div className="bento-grid" style={{ alignItems: 'start', maxWidth: '1020px', margin: '0 auto' }}>
            
            <div className="bento-col-6 glass-card" style={{ padding: '36px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
                <Activity size={20} style={{ color: 'var(--primary)' }} />
                Daily Wage Guidance
              </h3>
              
              <div className="field" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Select Work Type</label>
                <select value={calcWorkType} onChange={e => setCalcWorkType(e.target.value)} style={{ padding: '10px 14px', outline: 'none' }}>
                  {wages.map(w => (
                    <option key={w.work_type} value={w.work_type}>{w.work_type}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                  <span className="muted" style={{ fontWeight: 600 }}>Daily Wage Range (8 Hrs):</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.3rem', fontFamily: 'Plus Jakarta Sans' }}>
                    {money(selectedWage.min_wage)} – {money(selectedWage.max_wage)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                  <span className="muted">Estimated Platform Fee:</span>
                  <strong style={{ color: 'var(--success)' }}>₹0.00 ( Bennett Social Project )</strong>
                </div>
              </div>

              <Link to={`/post-job?work_type=${encodeURIComponent(calcWorkType)}`} className="btn btn-primary btn-block" style={{ padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                📋 Post Job for {calcWorkType}
              </Link>
            </div>

            <div className="bento-col-6" style={{ padding: '12px' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '16px' }}>Direct Payment Principles</h3>
              <p className="muted" style={{ fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '28px' }}>
                Providing fair wages ensures quality, dependable work. These ranges represent typical averages for skilled and unskilled daily tasks in Noida, updated regularly by social chowk audits.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', padding: '20px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', marginBottom: '20px', alignItems: 'start' }}>
                <div style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }}><Shield size={20} /></div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-hover)', lineHeight: '1.6' }}>
                  <strong>Zero Platform Cuts:</strong> We take ₹0 commission from worker payouts. The wage amount you agree is paid entirely directly to the worker in cash or via personal UPI.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', padding: '20px', background: 'var(--secondary-light)', border: '1px solid var(--secondary-border)', borderRadius: 'var(--radius-md)', alignItems: 'start' }}>
                <div style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '3px' }}><Activity size={20} /></div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary-hover)', lineHeight: '1.6' }}>
                  <strong>Support Local Workers:</strong> Most daily wage helpers rely on direct daily payments for household operations. Direct cash/UPI payments ensure liquidity.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── CONCIERGE / TRUST ─── */}
      <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="container split" style={{ gap: '48px' }}>
          <div className="hero-photo" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <img src="/assets/team-register.jpeg" alt="LabourLink team registering a worker at the chowk" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p className="eyebrow">Trust &amp; Rigor</p>
            <h2 style={{ marginBottom: '20px' }}>We Meet Workers In Person</h2>
            <p className="lead" style={{ marginBottom: '20px' }}>
              Unlike automated bulletin boards where anyone can list services, our student team visits chowks across Greater Noida. We screen workers, confirm identity details, record their skills, and take their photographs.
            </p>
            <p className="muted" style={{ fontSize: '0.95rem', marginBottom: '32px', lineHeight: '1.7' }}>
              Workers do not require any smartphone or mobile app. They receive job coordination calls from our helpline, allowing us to connect community hiring needs directly to them without digital barriers.
            </p>
            <Link to="/about" className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: 'var(--radius-sm)' }}>
              Read Our Trust &amp; Safety Guidelines
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOR WORKERS ─── */}
      <section className="section" style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">For Workers</p>
            <h2>Looking for Daily Wage Jobs?</h2>
            <p className="lead">Register your profile to receive calls for work from local clients throughout Greater Noida.</p>
          </div>
          <div className="grid cols-3" style={{ gap: '28px' }}>
            {[
              { icon: '📱', t: 'Free Registration', d: 'Receive direct telephone calls for work. No smartphone or internet plan required.' },
              { icon: '💰', t: 'Keep 100% Earnings', d: 'No middleman cuts. Get paid full wages directly in cash or UPI by the client.' },
              { icon: '⭐', t: 'Build Work History', d: 'Stellar work performance updates your rating, leading to more regular work offers.' },
            ].map(s => (
              <div className="card glass-card" key={s.t} style={{ textAlign: 'center', background: '#ffffff', border: '1px solid var(--border)', padding: '36px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{s.t}</h3>
                <p className="muted" style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6' }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 48 }}>
            <Link to="/login?role=labour&mode=signup" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}>
              🤝 Register as a Local Worker
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section text-center" style={{ background: 'var(--ink)', color: '#ffffff', borderTop: '4px solid var(--primary)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '2rem' }}>Ready to Hire Verified Daily Workers?</h2>
          <p className="lead" style={{ color: 'var(--muted-light)', marginBottom: '36px' }}>
            Submit your requirements before 8:00 PM today. We will call you to confirm your worker details by 9:00 PM for work starting tomorrow.
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center', gap: '16px', margin: 0 }}>
            <Link to="/post-job" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}>📋 Post a Job Now</Link>
            <Link to="/login?role=labour&mode=signup" className="btn btn-ghost" style={{ background: 'transparent', color: '#ffffff', borderColor: '#334155', padding: '16px 36px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}>🤝 Register as a Worker</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
