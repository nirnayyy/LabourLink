import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="fade-in">
      <section className="section" style={{ background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our mission</p>
            <h2>Connecting honest work with people who need it</h2>
            <p className="lead">
              LabourLink is an independent startup initiative from <b>Greater Noida</b>.
              We're digitising the labour chowk — making daily-wage workers discoverable beyond
              the street corner, while keeping the process simple and human.
            </p>
          </div>

          <div className="split" style={{ gap: '48px' }}>
            <div className="hero-photo" style={{ border: '1px solid var(--border)', background: 'var(--border)' }}>
              <img src="/assets/team-register.jpeg" alt="Team registering workers at the chowk" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--ink)', marginBottom: '16px' }}>Why you can trust LabourLink</h3>
              <ul style={{ paddingLeft: 20, lineHeight: '2.1', fontSize: '0.98rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><b>Real photos &amp; numbers</b> — we register every worker in person at the chowk.</li>
                <li><b>Reviews tied to workers</b> — accountability for every individual.</li>
                <li><b>Human-confirmed</b> — our team calls and confirms a worker before you're notified.</li>
                <li><b>Minimal data</b> — we only take what's needed to coordinate your job.</li>
                <li><b>Fair wages</b> — transparent market-rate guidance for the Noida area.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>The human-assisted model</h2>
          </div>
          <div className="grid cols-3" style={{ gap: '28px' }}>
            <div className="card" style={{ padding: '36px', background: '#ffffff', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🤝</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>For workers</h3>
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--muted)' }}>
                No app, no smartphone needed. Keep standing at the chowk as usual — we just
                also call you when work comes in. Extends your reach for free.
              </p>
            </div>
            <div className="card" style={{ padding: '36px', background: '#ffffff', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏠</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>For hirers</h3>
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--muted)' }}>
                Post a need online instead of driving to a chowk. We send you a confirmed,
                verified worker — perfect for Noida households, students and small businesses.
              </p>
            </div>
            <div className="card" style={{ padding: '36px', background: '#ffffff', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📞</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>The bridge</h3>
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--muted)' }}>
                Our student helpline is the trusted middle layer — calling, confirming and coordinating
                so both sides get a reliable result.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">FAQ</p>
            <h2>Common questions</h2>
          </div>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '12px 28px', background: '#ffffff', border: '1px solid var(--border)' }}>
              {[
                { q: 'Do workers need a smartphone or app?', a: 'No. Workers only need a basic phone. We handle everything digital on their behalf.' },
                { q: 'How fast will I get a worker?', a: 'Post before 8 PM and we confirm a worker for the next day by 9 PM.' },
                { q: 'How do payments work?', a: 'Payment is made directly between you and the worker, as agreed. LabourLink does not handle money.' },
                { q: 'Which areas do you cover?', a: 'Currently Greater Noida — Knowledge Park, Kasna, Greater Noida West and the Sector 62 belt.' },
              ].map((item, i) => (
                <details key={i} style={{ padding: '20px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', outline: 'none' }}>
                  <summary style={{ fontWeight: 650, cursor: 'pointer', fontSize: '0.98rem', color: 'var(--ink)' }}>{item.q}</summary>
                  <p className="muted" style={{ marginTop: '10px', fontSize: '0.9rem', lineHeight: '1.65', color: 'var(--muted)' }}>{item.a}</p>
                </details>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <Link to="/post-job" className="btn btn-primary" style={{ padding: '14px 28px' }}>📋 Post a Job</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
