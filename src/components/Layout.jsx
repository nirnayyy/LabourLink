import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Check, Chevron, User, Briefcase, FileText, LogOut, Menu, Cross, Shield } from './Icons';

export default function Layout({ auth, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const dashPath =
    auth.role === 'admin'
      ? '/admin'
      : auth.role === 'labour'
        ? '/labour'
        : auth.role === 'hirer'
          ? '/hirer'
          : null;

  return (
    <>
      {/* ─── Header ─── */}
      <header className="site-header">
        <div className="container nav">
          <NavLink className="brand" to="/" onClick={() => setMenuOpen(false)}>
            <img src="/assets/logo.jpeg" alt="LabourLink logo" />
            <span>Labour<b>Link</b></span>
            <span className="badge-avail available" style={{ fontSize: '0.65rem', padding: '3px 8px', marginLeft: '8px' }}>
              <Check size={10} strokeWidth={3} style={{ marginRight: '3px' }} />
              Verified
            </span>
          </NavLink>

          <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/browse" onClick={() => setMenuOpen(false)}>Find Workers</NavLink>
            <NavLink to="/reviews" onClick={() => setMenuOpen(false)}>Reviews</NavLink>
            <NavLink to="/about" onClick={() => setMenuOpen(false)}>About &amp; Trust</NavLink>

            {auth.role ? (
              <>
                <NavLink className="btn-shimmer" to="/post-job" onClick={() => setMenuOpen(false)}>
                  <FileText size={16} strokeWidth={2.5} />
                  Post a Job
                </NavLink>
                
                <div className="profile-dropdown-container" ref={dropdownRef}>
                  <button
                    className={`profile-trigger ${profileOpen ? 'active' : ''}`}
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-expanded={profileOpen}
                  >
                    <div className="avatar-circle">
                      {auth.user?.name ? auth.user.name[0].toUpperCase() : auth.user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="profile-trigger-info">
                      <span className="profile-name">
                        {auth.user?.name ? auth.user.name.split(' ')[0] : auth.user?.email ? auth.user.email.split('@')[0] : 'User'}
                      </span>
                      <span className={`role-badge-small ${auth.role}`}>{auth.role}</span>
                    </div>
                    <Chevron size={14} strokeWidth={2.5} className={`chevron-icon ${profileOpen ? 'rotate' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="profile-dropdown-menu">
                      <div className="dropdown-header">
                        <div className="large-avatar-circle">
                          {auth.user?.name ? auth.user.name[0].toUpperCase() : auth.user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{auth.user?.name || 'User'}</div>
                          <div className="user-email">{auth.user?.email}</div>
                          <span className={`role-badge-tag ${auth.role}`}>{auth.role}</span>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <div className="dropdown-links">
                        <NavLink
                          to={dashPath}
                          className="dropdown-item"
                          onClick={() => {
                            setProfileOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <Briefcase size={16} strokeWidth={2} />
                          <span>My Dashboard</span>
                        </NavLink>

                        <NavLink
                          to="/post-job"
                          className="dropdown-item"
                          onClick={() => {
                            setProfileOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <FileText size={16} strokeWidth={2} />
                          <span>Post a New Job</span>
                        </NavLink>
                      </div>

                      <div className="dropdown-divider"></div>

                      <button className="dropdown-item logout-btn" onClick={handleLogout}>
                        <LogOut size={16} strokeWidth={2} />
                        <span>Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink className="btn-shimmer" to="/post-job" onClick={() => setMenuOpen(false)}>
                  <FileText size={16} strokeWidth={2.5} />
                  Post a Job
                </NavLink>
                <NavLink className="profile-trigger" to="/login" onClick={() => setMenuOpen(false)} aria-label="Login">
                  <div className="avatar-circle" style={{ background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <User size={15} strokeWidth={2.5} />
                  </div>
                  <span className="profile-name" style={{ color: 'var(--ink)', paddingRight: '4px' }}>Sign In</span>
                </NavLink>
              </>
            )}
          </nav>

          <button
            className="nav-toggle"
            aria-label="Menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <Cross size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ─── Page content ─── */}
      <main>{children}</main>

      {/* ─── Footer ─── */}
      <footer className="site-footer">
        <div className="container">
          <div className="cols">
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ffffff', margin: '0 0 20px' }}>
                <img src="/assets/logo.jpeg" alt="Logo" style={{ height: '30px', width: '30px', borderRadius: '6px' }} />
                LabourLink
              </h4>
              <p style={{ fontSize: '0.9rem', maxWidth: '340px', margin: '0 0 20px', lineHeight: '1.65' }}>
                Digitising the labour chowk in Greater Noida. We screen, register, and verify daily-wage workers in person, bridging the trust gap for local households and businesses.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#111827', border: '1px solid #1f2937', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ background: 'var(--success-light)', color: 'var(--success-text)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>✓</div>
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 700 }}>Bennett University Initiative</div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '1px' }}>Local Community Social Project</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 style={{ color: '#ffffff', margin: '0 0 20px' }}>Marketplace Links</h4>
              <NavLink to="/browse">Browse Local Workers</NavLink>
              <NavLink to="/post-job">Post a Job Requirement</NavLink>
              <NavLink to="/reviews">Read Verified Reviews</NavLink>
              <NavLink to="/about">Our Verification Process</NavLink>
            </div>
            
            <div>
              <h4 style={{ color: '#ffffff', margin: '0 0 20px' }}>Daily Operations SLA</h4>
              <p style={{ fontSize: '0.88rem', margin: '0 0 16px', lineHeight: '1.6' }}>
                Post your hiring needs before <strong style={{ color: 'var(--secondary)' }}>8:00 PM</strong>. Our team physically checks availability and calls you to confirm your worker by <strong style={{ color: 'var(--secondary)' }}>9:00 PM</strong>.
              </p>
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', marginTop: '16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>
                  <Shield size={14} style={{ marginRight: '6px' }} />
                  100% Direct Cash/UPI Payment
                </span>
                <div style={{ color: '#475569', fontSize: '0.76rem', marginTop: '4px' }}>We take ₹0 commissions. Pay workers directly.</div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                © {new Date().getFullYear()} LabourLink · Kasna, Knowledge Park &amp; Greater Noida · Created by Nirnay &amp; Team
              </div>
              <div style={{ display: 'flex', gap: '16px', color: '#475569' }}>
                <NavLink to="/about" style={{ fontSize: '0.8rem', color: '#475569', display: 'inline', padding: 0 }}>Terms</NavLink> · 
                <NavLink to="/about" style={{ fontSize: '0.8rem', color: '#475569', display: 'inline', padding: 0 }}>Privacy</NavLink> · 
                <NavLink to="/login" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'inline', padding: 0, fontWeight: 'bold' }}>Team Login</NavLink>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
