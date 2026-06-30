import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Info, ArrowLeft, Check, Calendar, MapPin, Activity } from '../components/Icons';
import { uid, nextRef, money } from '../data';

export default function PostJob({ data, onSubmit, auth }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { areas, workTypes, wages } = data;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    hirer_name: auth?.user?.name || '',
    hirer_phone: auth?.user?.phone || '',
    area: searchParams.get('area') || '',
    location: '',
    work_type: searchParams.get('work_type') || '',
    num_workers: 1,
    job_date: '',
    wage_offered: '',
    notes: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const selectedWageGuide = wages.find(w => w.work_type === form.work_type);

  // Simple step validation
  const validateStep1 = () => {
    return form.hirer_name.trim() !== '' && form.hirer_phone.trim() !== '';
  };
  const validateStep2 = () => {
    return form.area !== '' && form.work_type !== '' && form.location.trim() !== '';
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const request = {
      id: uid('req'),
      ref_code: nextRef(),
      hirer_name: form.hirer_name.trim(),
      hirer_phone: form.hirer_phone.trim(),
      hirer_email: auth?.user?.email || '',
      area: form.area,
      location: form.location.trim(),
      work_type: form.work_type,
      num_workers: parseInt(form.num_workers, 10) || 1,
      job_date: form.job_date,
      wage_offered: form.wage_offered ? parseFloat(form.wage_offered) : null,
      notes: form.notes.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    onSubmit(request);
    sessionStorage.setItem('ll_ref', request.ref_code);
    sessionStorage.setItem('ll_name', request.hirer_name);
    navigate('/confirmation');
  };

  // Cost calculator calculation
  const proposedWage = Number(form.wage_offered) || (selectedWageGuide ? selectedWageGuide.min_wage : 0);
  const totalCostEstimate = proposedWage * Number(form.num_workers);

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="section-head" style={{ marginBottom: '32px' }}>
          <p className="eyebrow">Booking Assistant</p>
          <h2>Post a Job Requirement</h2>
          <p className="lead">Verify daily-wage helpers in 3 quick conversational steps.</p>
        </div>

        {/* Conversational Progress Stepper */}
        <div className="stepper" style={{ marginBottom: '44px', maxWidth: '600px', margin: '0 auto 44px' }}>
          <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">{step > 1 ? <Check size={14} strokeWidth={3} /> : '1'}</div>
            <div className="step-label">Hirer Info</div>
          </div>
          <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">{step > 2 ? <Check size={14} strokeWidth={3} /> : '2'}</div>
            <div className="step-label">Job Details</div>
          </div>
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Wage &amp; Dates</div>
          </div>
        </div>

        <div className="split" style={{ alignItems: 'start', gap: '36px', gridTemplateColumns: '1.4fr 1fr' }}>
          {/* Form Side */}
          <div className="card" style={{ padding: '32px', background: '#ffffff', border: '1px solid var(--border)' }}>
            <form onSubmit={step === 3 ? handleSubmit : handleNext}>
              
              {/* STEP 1: Hirer Info */}
              {step === 1 && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>👤</span> Hirer Contact Information
                  </h3>
                  <div className="field">
                    <label htmlFor="f-name">Your Full Name *</label>
                    <input
                      id="f-name"
                      name="hirer_name"
                      value={form.hirer_name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      required
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label htmlFor="f-phone">Mobile Phone Number *</label>
                    <input
                      id="f-phone"
                      name="hirer_phone"
                      value={form.hirer_phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      pattern="[0-9+ ]{10,15}"
                      required
                    />
                    <div className="hint">Required to send you worker details &amp; photos via SMS.</div>
                  </div>
                </div>
              )}

              {/* STEP 2: Job Details */}
              {step === 2 && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>👷</span> Job Description &amp; Address
                  </h3>
                  <div className="grid cols-2" style={{ gap: '20px' }}>
                    <div className="field">
                      <label htmlFor="f-area">Coverage Area *</label>
                      <select id="f-area" name="area" value={form.area} onChange={handleChange} required>
                        <option value="">Select general area</option>
                        {areas.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="f-type">Work Category Needed *</label>
                      <select id="f-type" name="work_type" value={form.work_type} onChange={handleChange} required>
                        <option value="">Select work category</option>
                        {workTypes.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="f-loc">Exact Address / Landmark *</label>
                    <input
                      id="f-loc"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Gaur City, Tower 10, Flat 402"
                      required
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label htmlFor="f-num">Number of Workers Needed *</label>
                    <input
                      id="f-num"
                      name="num_workers"
                      type="number"
                      min="1"
                      value={form.num_workers}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Wage & Dates */}
              {step === 3 && (
                <div className="fade-in">
                  <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>📅</span> Proposed Payout &amp; Date
                  </h3>
                  <div className="field">
                    <label htmlFor="f-date">Work Date *</label>
                    <input
                      id="f-date"
                      name="job_date"
                      type="date"
                      min={today}
                      value={form.job_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field" style={{ background: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '20px' }}>
                    <label htmlFor="f-wage" style={{ fontWeight: 700 }}>Proposed Daily Wage (₹ per worker for 8 hours)</label>
                    <input
                      id="f-wage"
                      name="wage_offered"
                      type="number"
                      min="0"
                      value={form.wage_offered}
                      onChange={handleChange}
                      placeholder={selectedWageGuide ? `e.g. ${selectedWageGuide.min_wage}` : "e.g. 500"}
                      style={{ background: '#ffffff' }}
                      required
                    />
                    {selectedWageGuide && (
                      <div className="hint" style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Info size={14} /> Market Guidance for {form.work_type}: {money(selectedWageGuide.min_wage)} – {money(selectedWageGuide.max_wage)}
                      </div>
                    )}
                  </div>
                  <div className="field" style={{ marginTop: '20px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label htmlFor="f-notes" style={{ margin: 0 }}>Additional Notes (Optional)</label>
                      <button
                        type="button"
                        onClick={() => {
                          const base = form.notes || "shifting household boxes";
                          const optimized = `[LabourLink AI Optimizer v2.0]:\n• Task: Assist with ${base}.\n• Landmark: Near ${form.location || "site address"}.\n• Note: Worker will pay directly via UPI. Direct coordination required.`;
                          setForm(f => ({ ...f, notes: optimized }));
                        }}
                        style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid var(--primary-border)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        🪄 AI Optimize Description
                      </button>
                    </div>
                    <textarea
                      id="f-notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Add landmark clues, specific tools, or job descriptions..."
                    />
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', gap: '16px' }}>
                {step > 1 && (
                  <button className="btn btn-ghost" type="button" onClick={handlePrev}>
                    Back
                  </button>
                )}
                <button className="btn btn-primary" type="submit" style={{ marginLeft: 'auto', padding: '12px 36px' }}>
                  {step === 3 ? 'Confirm & Post Request' : 'Continue'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Cost Estimator Card */}
          <div className="card" style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} style={{ color: 'var(--secondary)' }} />
              Estimated Cost Panel
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Workers Required:</span>
                <strong style={{ color: 'var(--ink)' }}>{form.num_workers} 👤</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Work Category:</span>
                <strong style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px', color: 'var(--ink)' }}>
                  {form.work_type || '—'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="muted">Estimated Daily Rate:</span>
                <strong style={{ color: 'var(--ink)' }}>{money(proposedWage)}/day</strong>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                <strong style={{ color: 'var(--ink)' }}>Daily Total:</strong>
                <strong style={{ color: 'var(--secondary)' }}>{money(totalCostEstimate)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', background: 'var(--primary-light)', padding: '16px', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-md)', marginTop: '24px', alignItems: 'start' }}>
              <div style={{ fontSize: '1.1rem', color: 'var(--primary)', flexShrink: 0 }}><Shield size={16} /></div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary-hover)', lineHeight: '1.45' }}>
                <strong>No upfront platform charges:</strong> LabourLink takes ₹0 commission cuts. Pay worker directly once completed.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
