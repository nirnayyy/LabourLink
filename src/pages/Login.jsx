import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Info, Check, User } from '../components/Icons';
import { uid } from '../data';
import { supabase } from '../supabaseClient';

const ADMIN_EMAIL = 'admin@labourlink.com';
const ADMIN_PASSWORD = 'admin123';

const VALID_ROLES = ['labour', 'hirer', 'admin'];
const VALID_MODES = ['login', 'signup'];

export default function Login({ onLogin, data, onRegisterUser, onAddWorker }) {
  const [searchParams] = useSearchParams();
  const initialRole = VALID_ROLES.includes(searchParams.get('role')) ? searchParams.get('role') : 'hirer';
  const initialMode = VALID_MODES.includes(searchParams.get('mode')) ? searchParams.get('mode') : 'login';

  const [role, setRole] = useState(initialRole);       // 'labour' | 'hirer' | 'admin'
  const [mode, setMode] = useState(initialMode);         // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [msg, setMsg] = useState(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otpCodes, setOtpCodes] = useState(['', '', '', '']); // 4-digit OTP grid

  // Labour signup fields
  const [area, setArea] = useState('');
  const [workTypesStr, setWorkTypesStr] = useState('');
  const [expectedWage, setExpectedWage] = useState('');

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setPhone('');
    setArea(''); setWorkTypesStr(''); setExpectedWage('');
    setOtpCodes(['', '', '', '']);
    setMsg(null);
  };

  const switchRole = (r) => { setRole(r); resetForm(); };
  const toggleMode = () => { setMode(m => m === 'login' ? 'signup' : 'login'); resetForm(); };

  // Password Strength Check
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: '#e2e8f0', width: '0%' };
    if (password.length < 4) return { label: 'Weak', color: '#ef4444', width: '33%' };
    if (password.length < 8) return { label: 'Medium', color: '#f59e0b', width: '66%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };
  const pwStrength = getPasswordStrength();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg(null);

    // Phone / OTP login simulation
    if (loginMethod === 'phone') {
      const otpStr = otpCodes.join('');
      if (otpStr.length < 4) {
        setMsg({ type: 'err', text: 'Please enter the complete 4-digit OTP code.' });
        return;
      }
      // Match user by phone number
      const { data: profiles } = await supabase.from('profiles').select('*').eq('phone', phone.trim()).eq('role', role);
      if (profiles && profiles.length) {
        onLogin({ role, user: profiles[0] });
      } else {
        setMsg({ type: 'err', text: 'Phone number not registered. Please register first.' });
      }
      return;
    }

    // Standard Email / Password login using Supabase Auth
    try {
      let authData = null;
      const { data: signInResult, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      if (error) {
        // If login failed, check if it matches mock credentials and auto-register
        const trimmedEmail = email.trim().toLowerCase();
        if (trimmedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          authData = await autoRegisterMock(ADMIN_EMAIL, ADMIN_PASSWORD, 'System Admin', '+91 99999-00000', 'admin');
        } else if (trimmedEmail === 'aarav@labourlink.com' && password === 'labour123') {
          authData = await autoRegisterMock('aarav@labourlink.com', 'labour123', 'Aarav Kumar', '+91 99999-11111', 'labour', 'w-1');
        } else if (trimmedEmail === 'hirer@labourlink.com' && password === 'hirer123') {
          authData = await autoRegisterMock('hirer@labourlink.com', 'hirer123', 'Hirer Client', '+91 99999-22222', 'hirer');
        } else {
          throw error;
        }
      } else {
        authData = signInResult;
      }

      const userUuid = authData.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userUuid)
        .single();

      if (profile) {
        onLogin({ role: profile.role, user: profile });
      } else {
        setMsg({ type: 'err', text: 'Authentication succeeded, but profile was not found.' });
      }
    } catch (err) {
      setMsg({ type: 'err', text: err.message || 'Invalid email or password. Please try again.' });
    }
  };

  const autoRegisterMock = async (mockEmail, mockPassword, mockName, mockPhone, mockRole, mockWorkerId = null) => {
    // 1. Sign up user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: mockEmail,
      password: mockPassword
    });
    if (signUpError) throw signUpError;

    // 2. Insert profile record
    const profile = {
      id: signUpData.user.id,
      email: mockEmail,
      name: mockName,
      phone: mockPhone,
      role: mockRole,
      worker_id: mockWorkerId
    };
    await supabase.from('profiles').insert([profile]);
    return signUpData;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (role === 'admin') {
      setMsg({ type: 'err', text: 'Admin accounts cannot be self-registered.' });
      return;
    }

    try {
      // 1. Sign up user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password
      });
      if (signUpError) throw signUpError;

      const userUuid = signUpData.user.id;

      // 2. If worker, register in workers table first
      let workerId = null;
      if (role === 'labour') {
        const workTypes = workTypesStr.split(',').map(s => s.trim()).filter(Boolean);
        if (!workTypes.length || !area) {
          setMsg({ type: 'err', text: 'Please select your area and add registered skills.' });
          return;
        }
        workerId = uid('w');

        const newWorker = {
          id: workerId,
          name: name.trim(),
          phone: phone.trim(),
          area,
          locality: '',
          photo_url: '/assets/worker1.jpeg',
          work_types: workTypes,
          availability_status: 'available',
          rating_avg: 0,
          total_reviews: 0,
          total_jobs: 0,
          reliability_score: 50,
          registered_by: 'Self-registered',
          is_blacklisted: false,
          is_published: true,
          created_at: new Date().toISOString(),
        };
        const { error: workerErr } = await supabase.from('workers').insert([newWorker]);
        if (workerErr) throw workerErr;
        onAddWorker(newWorker);
      }

      // 3. Insert profile record
      const newProfile = {
        id: userUuid,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone.trim(),
        role,
        worker_id: workerId
      };
      const { error: profileErr } = await supabase.from('profiles').insert([newProfile]);
      if (profileErr) throw profileErr;

      onRegisterUser(newProfile);
      onLogin({ role, user: newProfile });
    } catch (err) {
      setMsg({ type: 'err', text: err.message || 'Signup failed. Please try again.' });
    }
  };

  // Quick Account Auto-filler
  const triggerAutoFill = (fillRole) => {
    setRole(fillRole);
    if (fillRole === 'admin') {
      setEmail('admin@labourlink.com');
      setPassword('admin123');
      setLoginMethod('email');
    } else if (fillRole === 'labour') {
      setEmail('aarav@labourlink.com');
      setPassword('labour123');
      setLoginMethod('email');
    } else {
      setEmail('hirer@labourlink.com');
      setPassword('hirer123');
      setLoginMethod('email');
    }
    setMode('login');
  };

  const handleOtpChange = (val, idx) => {
    if (isNaN(val)) return;
    const nextCodes = [...otpCodes];
    nextCodes[idx] = val.slice(-1);
    setOtpCodes(nextCodes);
    // Auto-focus next field
    if (val && idx < 3) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px', alignItems: 'center', padding: '20px 0' }}>
        
        {/* Left Side: App Branding panel */}
        <div style={{ background: 'var(--ink)', padding: '56px', borderRadius: 'var(--radius-lg)', color: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.4rem', marginBottom: '20px' }}>LabourLink Workspace</h2>
          <p className="lead" style={{ color: 'var(--muted-light)', fontSize: '1.08rem', lineHeight: '1.65', marginBottom: '40px' }}>
            Transforming the daily wage ecosystem. We coordinate verified labor requirements for businesses, contractors, and household managers in Greater Noida.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-border)', flexShrink: 0 }}>
                <Check size={18} strokeWidth={2.5} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.98rem', color: '#ffffff', marginBottom: '3px' }}>Direct Communication Channels</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-light)' }}>Connect immediately via phone and in-app messaging after booking.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-border)', flexShrink: 0 }}>
                <Shield size={18} strokeWidth={2.5} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.98rem', color: '#ffffff', marginBottom: '3px' }}>100% Direct Cash/UPI Payments</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-light)' }}>Wages are paid fully directly to workers. Pay 0% platform cuts.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="card" style={{ padding: '36px', background: '#ffffff', border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: '8px', fontSize: '1.6rem', textAlign: 'center' }}>
            {mode === 'login' ? 'Account Log In' : 'Worker Registration'}
          </h2>
          <p className="muted text-center" style={{ marginBottom: '28px', color: 'var(--muted)' }}>
            {mode === 'login' ? 'Access your dashboard workspace' : 'Join as a verified LabourLink partner'}
          </p>

          {/* Detailed Card-Based Role Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {[
              { r: 'labour', label: '👷 Worker', desc: 'Find Job Leads' },
              { r: 'hirer', label: '🏠 Hirer', desc: 'Book Workers' },
              { r: 'admin', label: '🔒 Admin', desc: 'Moderate' }
            ].map(item => (
              <button
                key={item.r}
                onClick={() => switchRole(item.r)}
                type="button"
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: role === item.r ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: role === item.r ? 'var(--primary-light)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'inherit',
                  transition: 'all var(--transition)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: role === item.r ? 'var(--primary)' : 'var(--ink)' }}>{item.label}</div>
                <div style={{ fontSize: '0.68rem', color: role === item.r ? 'var(--primary-hover)' : 'var(--muted-light)', marginTop: '4px', fontWeight: 550 }}>{item.desc}</div>
              </button>
            ))}
          </div>

          {msg && <div className="notice err" style={{ marginBottom: '20px' }}>{msg.text}</div>}

          {/* Login Mode forms */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              {role !== 'admin' && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="radio" name="method" checked={loginMethod === 'email'} onChange={() => setLoginMethod('email')} />
                    Email login
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
                    <input type="radio" name="method" checked={loginMethod === 'phone'} onChange={() => setLoginMethod('phone')} />
                    Mock OTP verification
                  </label>
                </div>
              )}

              {loginMethod === 'email' || role === 'admin' ? (
                <>
                  <div className="field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder={role === 'admin' ? 'admin@labourlink.com' : 'you@example.com'}
                    />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="field">
                    <label>Registered Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Enter 4-Digit OTP Code</label>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '14px 0' }}>
                      {[0, 1, 2, 3].map(idx => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          value={otpCodes[idx]}
                          maxLength="1"
                          onChange={e => handleOtpChange(e.target.value, idx)}
                          style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', outline: 'none', background: '#ffffff', transition: 'all 0.2s ease' }}
                          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                          onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                      ))}
                    </div>
                    <div className="hint text-center" style={{ marginTop: '8px' }}>Type any 4 digits to simulate OTP validation.</div>
                  </div>
                </>
              )}

              <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: '16px' }}>
                Log in
              </button>
            </form>
          ) : (
            // Signup Mode forms
            <form onSubmit={handleSignup}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="field">
                  <label>Full name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aditi Sharma" required />
                </div>
                <div className="field">
                  <label>Phone *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="10-digit mobile" />
                </div>
              </div>
              <div className="field">
                <label>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              
              <div className="field">
                <label>Password *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
                
                {/* Password strength visual meter */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Complexity Strength</span>
                    <span style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: pwStrength.width, height: '100%', background: pwStrength.color, transition: 'all 0.3s ease' }}></div>
                  </div>
                </div>
              </div>

              {/* Worker Skills Section */}
              {role === 'labour' && (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                  <div className="field">
                    <label>Area Sector *</label>
                    <select value={area} onChange={e => setArea(e.target.value)} required>
                      <option value="">Select general area</option>
                      {data.areas.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Work types (comma separated) *</label>
                    <input
                      value={workTypesStr}
                      onChange={e => setWorkTypesStr(e.target.value)}
                      placeholder="e.g. General Helper, Loader / Unloader"
                      required
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label>Expected Daily Wage (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={expectedWage}
                      onChange={e => setExpectedWage(e.target.value)}
                      placeholder="e.g. 500"
                    />
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-block" type="submit" disabled={role === 'admin'} style={{ marginTop: '12px' }}>
                Register Account
              </button>
            </form>
          )}

          {/* Divider */}
          {role !== 'admin' && (
            <div style={{ textAlign: 'center', margin: '24px 0', borderTop: '1px solid var(--border)', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#ffffff', padding: '0 12px', fontSize: '0.8rem', color: 'var(--muted-light)', fontWeight: 600 }}>
                OR
              </span>
            </div>
          )}

          {/* Toggle login / signup */}
          {role !== 'admin' && (
            <div style={{ fontSize: '0.88rem', textAlign: 'center', fontWeight: 550, color: 'var(--muted)' }}>
              {mode === 'login' ? (
                <>Don't have an account? <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', paddingLeft: '4px', fontFamily: 'inherit' }}>Sign up</button></>
              ) : (
                <>Already have an account? <button onClick={toggleMode} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', paddingLeft: '4px', fontFamily: 'inherit' }}>Log in</button></>
              )}
            </div>
          )}

          {/* Auto fill credentials box */}
          <div style={{ marginTop: '28px', padding: '16px 20px', background: 'var(--secondary-light)', border: '1px dashed var(--secondary-border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-hover)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} /> Quick Click Auto-fill Demo Accounts:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => triggerAutoFill('labour')} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                👷 Worker
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => triggerAutoFill('hirer')} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                🏠 Hirer
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => triggerAutoFill('admin')} style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
                🔒 Admin
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
