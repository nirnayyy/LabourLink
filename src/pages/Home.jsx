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
    "👷 Rajesh Yadav confirmed for Digger (Beldar) job at Kasna Chowk — ₹650 agreed",
    "🧹 Sunita Devi confirmed for Cleaning Help at Gaur City, Greater Noida West",
    "📦 Vikram Singh assigned to Shifting / Moving job in Sector 62",
    "🎨 Mohan Lal booked for Painting assignment at Knowledge Park — ₹850 agreed",
    "🏠 New general worker request received for Bennett University community project"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIdx(prev => (prev + 1) % tickerItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  return (
    <div className="fade-in">
      {/* ─── LIVE ACTIVITY TICKER ─── */}
      <div style={{ background: 'var(--secondary-light)', borderBottom: '1px solid var(--secondary-border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--secondary)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span className="live-pulse" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }}></span>
            Live Feed
          </span>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)', transition: 'all 0.5s ease', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {tickerItems[tickerIdx]}
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="hero" style={{ background: 'radial-gradient(circle at 90% 10%, hsl(var(--h-primary), 80%, 94%) 0%, transparent 45%), radial-gradient(circle at 10% 90%, hsl(var(--h-secondary), 85%, 94%) 0%, transparent 45%)', padding: '100px 0 80px', borderBottom: '1px solid var(--border)' }}>
        <div className="container hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, padding: '6px 16px', borderRadius: '999px', marginBottom: '24px', border: '1px solid var(--primary-border)' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
              Hyperlocal Daily Wage Network · Greater Noida
            </div>
            <h1 style={{ marginBottom: '24px', lineHeight: '1.15' }}>Need daily helpers? <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--indigo) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get vetted, honest workers.</span></h1>
            <p className="lead" style={{ marginBottom: '32px' }}>
              Bridging the digital gap at local labour chowks. Specify your work requirements (loading, shifting, cleaning, digging) and our team <strong>personally contacts and confirms a verified worker</strong>. No smartphone required for workers. Zero commissions. Pay directly.
            </p>
            <div className="hero-cta">
              <Link to="/post-job" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                <FileText size={18} />
                Hire a Worker Today
              </Link>
              <Link to="/browse" className="btn btn-ghost" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                <Briefcase size={18} />
                Browse Directory
              </Link>
            </div>
            <div style={{ marginTop: '20px' }}>
              <Link to="/login?role=labour&mode=signup" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--indigo)', fontWeight: 700, fontSize: '0.92rem', textDecoration: 'none' }}>
                Looking for work? Join as a registered worker today →
              </Link>
            </div>
            
            <div className="hero-badges" style={{ marginTop: '40px' }}>
              <span className="pill">
                <Shield size={14} style={{ color: 'var(--primary)' }} />
                In-Person Verified
              </span>
              <span className="pill">
                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                9 PM Confirmation SLA
              </span>
              <span className="pill">
                <Star size={14} style={{ color: 'var(--primary)' }} />
                Verified Ratings
              </span>
            </div>
          </div>
          
          <div className="hero-photo" style={{ border: '1px solid var(--border)', background: 'var(--border)' }}>
            <img src="/assets/hero-chowk.jpeg" alt="Daily wage workers at a labour chowk in Greater Noida" />
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(15, 23, 42, 0.85)', padding: '12px 20px', borderRadius: 'var(--radius-md)', color: '#ffffff', fontSize: '0.85rem', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: 'var(--shadow-lg)' }}>
              📍 <strong>Kasna Chowk Registry Center, Greater Noida</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="trust-strip">
        <div className="container">
          <div className="stat"><b>{publishedWorkers.length}+</b><span>Verified Workers</span></div>
          <div className="stat"><b>{totalJobs}+</b><span>Jobs Filled</span></div>
          <div className="stat"><b>{publishedReviews.length}+</b><span>Platform Reviews</span></div>
          <div className="stat"><b>100%</b><span>Zero Commission</span></div>
        </div>
      </section>

      {/* ─── BENNETT SOCIAL PROJECT FEATURE ─── */}
      <section className="section" style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid cols-3" style={{ gap: '32px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem', border: '1.5px solid var(--primary-border)' }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>Safe Direct Hiring</h3>
                <p className="muted" style={{ margin: 0, lineHeight: '1.6' }}>No online advance wallet deposits. Pay the workers directly in cash or UPI once the daily job is finished.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem', border: '1.5px solid var(--primary-border)' }}>
                <Check size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>In-Person Registry</h3>
                <p className="muted" style={{ margin: 0, lineHeight: '1.6' }}>Every worker on our platform has been physically visited, interviewed, and photo-verified at local labor chowks.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
              <div style={{ background: 'var(--indigo-light)', color: 'var(--indigo)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem', border: '1.5px solid var(--indigo-border)' }}>
                <Info size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>Bennett Initiative</h3>
                <p className="muted" style={{ margin: 0, lineHeight: '1.6' }}>Built and managed by Bennett University students as a community welfare social service. Non-profit and community-focused.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STEPPER: HOW IT WORKS ─── */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Hiring Flow</p>
            <h2>How LabourLink Works</h2>
            <p className="lead">A reliable, human-assisted process. We do the coordination so you don't have to drive to the chowk.</p>
          </div>
          <div className="stepper" style={{ marginBottom: '64px' }}>
            <div className="step-item active">
              <div className="step-number">1</div>
              <div className="step-label">Post Job Request</div>
            </div>
            <div className="step-item active">
              <div className="step-number">2</div>
              <div className="step-label">Availability Verified</div>
            </div>
            <div className="step-item active">
              <div className="step-number">3</div>
              <div className="step-label">Get Details SMS</div>
            </div>
            <div className="step-item active">
              <div className="step-number">4</div>
              <div className="step-label">Rate &amp; Review</div>
            </div>
          </div>
          <div className="grid cols-4" style={{ gap: '20px' }}>
            {[
              { n: '01', t: 'Post Your Need', d: 'Submit a simple job request online details (work type, location, date, offered wage).' },
              { n: '02', t: 'Our Team Confirms', d: 'We check availability, phone the workers, and confirm someone reliable for your job.' },
              { n: '03', t: 'Get Details via SMS', d: 'Receive worker details, including contact numbers and verified photo, prior to work starting.' },
              { n: '04', t: 'Review and Rate', d: 'After completion, rate the worker. This updates their community reliability score.' },
            ].map(s => (
              <div className="card" key={s.n} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '14px', fontSize: '1.5rem', fontWeight: 800 }}>{s.n}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{s.t}</h3>
                <p className="muted" style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.55' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED WORKERS ─── */}
      <section className="section" style={{ background: '#ffffff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Worker Registry</p>
            <h2>Verified Workers Near You</h2>
            <p className="lead">Top-rated workers registered in the Greater Noida area with stellar reliability records.</p>
          </div>
          <div className="grid cols-4" style={{ gap: '24px' }}>
            {topWorkers.length ? topWorkers.map(w => (
              <Link to={`/worker/${w.id}`} className="card worker-card" key={w.id}>
                <div className="photo">
                  <img src={w.photo_url || '/assets/worker1.jpeg'} alt={w.name} />
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow-sm)', border: '1px solid #d1fae5' }}>
                    <Check size={12} strokeWidth={3} />
                    Verified
                  </div>
                </div>
                <div className="body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{w.name}</h3>
                    <span className={`badge-avail ${w.availability_status}`} style={{ flexShrink: 0 }}>{w.availability_status}</span>
                  </div>
                  <div className="area">📍 {w.area}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                    <div className="rating-row">
                      <span className="stars">{stars(w.rating_avg)}</span>
                      <strong style={{ color: 'var(--ink)' }}>{Number(w.rating_avg).toFixed(1)}</strong>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-light)', fontWeight: 600 }}>{w.total_jobs} jobs done</span>
                  </div>
                  <div className="tags" style={{ marginTop: '8px' }}>
                    {(w.work_types || []).slice(0, 2).map(t => <span className="tag" key={t}>{t}</span>)}
                  </div>
                </div>
              </Link>
            )) : <p className="muted">No workers registered at the moment.</p>}
          </div>
          <div className="text-center" style={{ marginTop: 44 }}>
            <Link to="/browse" className="btn btn-ghost" style={{ border: '1.5px solid var(--primary)', color: 'var(--primary)' }}>
              Search Full Worker Directory →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE WAGE CALCULATOR & WAGE GUIDE ─── */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Fair Pay Policy</p>
            <h2>Interactive Wage Estimator</h2>
            <p className="lead">Choose a work category to view current daily market rate guidance in Greater Noida.</p>
          </div>
          
          <div className="split" style={{ alignItems: 'start', maxWidth: '1020px', margin: '0 auto', gap: '48px' }}>
            {/* Interactive Calculator widget */}
            <div className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)', width: '100%' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--primary)' }} />
                Daily Wage Guidance
              </h3>
              
              <div className="field">
                <label>Select Work Type</label>
                <select value={calcWorkType} onChange={e => setCalcWorkType(e.target.value)}>
                  {wages.map(w => (
                    <option key={w.work_type} value={w.work_type}>{w.work_type}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <span className="muted" style={{ fontWeight: 500 }}>Daily Wage Range (8 Hrs):</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
                    {money(selectedWage.min_wage)} – {money(selectedWage.max_wage)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px' }}>
                  <span className="muted">Estimated Platform Fee:</span>
                  <strong style={{ color: 'var(--success)' }}>₹0.00 ( Bennett Social Project )</strong>
                </div>
              </div>

              <Link to={`/post-job?work_type=${encodeURIComponent(calcWorkType)}`} className="btn btn-primary btn-block" style={{ padding: '14px' }}>
                📋 Post Job for {calcWorkType}
              </Link>
            </div>

            {/* Static guidance description */}
            <div style={{ marginTop: '12px' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--ink)', marginBottom: '16px' }}>Direct Payment Principles</h3>
              <p className="muted" style={{ fontSize: '0.98rem', lineHeight: '1.65', marginBottom: '24px' }}>
                Providing fair wages ensures quality, dependable work. These ranges represent typical averages for skilled and unskilled daily tasks in Noida, updated regularly by social chowk audits.
              </p>
              
              <div style={{ display: 'flex', gap: '14px', padding: '20px', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', marginBottom: '20px', alignItems: 'start' }}>
                <div style={{ fontSize: '1.4rem', color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}><Shield size={20} /></div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-hover)', lineHeight: '1.6' }}>
                  <strong>Zero Platform Cuts:</strong> We take ₹0 commission from worker payouts. The wage amount you agree is paid entirely directly to the worker in cash or via personal UPI.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '14px', padding: '20px', background: 'var(--secondary-light)', border: '1px solid var(--secondary-border)', borderRadius: 'var(--radius-md)', alignItems: 'start' }}>
                <div style={{ fontSize: '1.4rem', color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }}><Activity size={20} /></div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary-hover)', lineHeight: '1.6' }}>
                  <strong>Support Local Workers:</strong> Most daily wage helpers rely on direct daily payments for household operations. Direct cash/UPI payments ensure liquidity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONCIERGE / TRUST ─── */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container split">
          <div className="hero-photo" style={{ border: '1px solid var(--border)', background: 'var(--border)' }}>
            <img src="/assets/team-register.jpeg" alt="LabourLink team registering a worker at the chowk" />
          </div>
          <div>
            <p className="eyebrow">Trust &amp; Rigor</p>
            <h2 style={{ marginBottom: '20px' }}>We Meet Workers In Person</h2>
            <p className="lead" style={{ marginBottom: '20px' }}>
              Unlike automated bulletin boards where anyone can list services, our student team visits chowks across Greater Noida. We screen workers, confirm identity details, record their skills, and take their photographs.
            </p>
            <p className="muted" style={{ fontSize: '0.95rem', marginBottom: '28px', lineHeight: '1.65' }}>
              Workers do not require any smartphone or mobile app. They receive job coordination calls from our helpline, allowing us to connect community hiring needs directly to them without digital barriers.
            </p>
            <Link to="/about" className="btn btn-indigo" style={{ padding: '14px 28px' }}>
              Read Our Trust &amp; Safety Guidelines
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOR WORKERS ─── */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, #f0fdf4 100%)', borderTop: '1px solid var(--border)' }}>
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
              <div className="card" key={s.t} style={{ textAlign: 'center', background: '#ffffff', border: '1px solid var(--border)', padding: '36px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{s.t}</h3>
                <p className="muted" style={{ fontSize: '0.88rem', margin: 0, lineHeight: '1.6' }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: 44 }}>
            <Link to="/login?role=labour&mode=signup" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>
              🤝 Register as a Local Worker
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section text-center" style={{ background: 'var(--ink)', color: '#ffffff', borderTop: '4px solid var(--primary)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Ready to Hire Verified Daily Workers?</h2>
          <p className="lead" style={{ color: 'var(--muted-light)', marginBottom: '36px' }}>
            Submit your requirements before 8:00 PM today. We will call you to confirm your worker details by 9:00 PM for work starting tomorrow.
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center', gap: '16px', margin: 0 }}>
            <Link to="/post-job" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }}>📋 Post a Job Now</Link>
            <Link to="/login?role=labour&mode=signup" className="btn btn-ghost" style={{ background: 'transparent', color: '#ffffff', borderColor: '#334155', padding: '16px 36px', fontSize: '1rem' }}>🤝 Register as a Worker</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
