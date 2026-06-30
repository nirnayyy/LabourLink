import React from 'react';
import { Link } from 'react-router-dom';

export default function Confirmation() {
  const ref = sessionStorage.getItem('ll_ref') || 'LL-XXXXXX';
  const name = sessionStorage.getItem('ll_name') || '';

  return (
    <section className="section fade-in">
      <div className="container">
        <div className="confirm-box">
          <div className="check">✓</div>
          <h2>{name ? `Thank you, ${name}!` : 'Request received!'}</h2>
          <p className="lead">Your job request reference is</p>
          <div className="ref-code">{ref}</div>
          <p className="muted">
            Our team will <b>call you to confirm a worker</b>. If you posted before 8 PM,
            expect confirmation by <b>9 PM</b> for the next day.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 22 }}>
            <Link to="/browse" className="btn btn-ghost">Browse workers</Link>
            <Link to="/" className="btn btn-primary">Back to home</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
