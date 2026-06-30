import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Check, Chevron, User, Briefcase, FileText, LogOut, Menu, Cross, Shield } from './Icons';

export default function Layout({ auth, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Accessibility State Toggles
  const [largeText, setLargeText] = useState(() => localStorage.getItem('large-text') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('high-contrast') === 'true');

  useEffect(() => {
    if (largeText) {
      document.body.classList.add('large-text');
    } else {
      document.body.classList.remove('large-text');
    }
    localStorage.setItem('large-text', largeText);
  }, [largeText]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('high-contrast', highContrast);
  }, [highContrast]);

  // LILA Chatbot State
  const [lilaOpen, setLilaOpen] = useState(false);
  const [lilaMessages, setLilaMessages] = useState([
    { sender: 'bot', text: 'Welcome to LabourLink! I am LILA, your interactive assistant. How can I help you today?' }
  ]);
  const [lilaChips, setLilaChips] = useState([
    "👨‍🌾 Find a Local Worker",
    "🧹 Register as a Worker",
    "📋 Post a Job Need",
    "📞 Call Helpline Desk"
  ]);

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

  const handleChipClick = (chip) => {
    // Add user message
    setLilaMessages(prev => [...prev, { sender: 'user', text: chip }]);

    // Trigger dynamic bot response
    setTimeout(() => {
      let botText = "";
      let nextChips = [];

      if (chip === "👨‍🌾 Find a Local Worker") {
        botText = "You can search and filter workers by skills or Noida neighborhoods in our directory. Reliability scores are updated after every daily wage job. Click below to browse:";
        nextChips = ["🔍 Open Directory", "↩️ Main Options"];
      } else if (chip === "🔍 Open Directory") {
        navigate('/browse');
        setLilaOpen(false);
        return;
      } else if (chip === "🧹 Register as a Worker") {
        botText = "To register as a worker and receive direct daily work calls from clients, please register on our portal. Zero platform cuts taken! No smartphone is required for workers to receive calls.";
        nextChips = ["📝 Worker Sign Up", "↩️ Main Options"];
      } else if (chip === "📝 Worker Sign Up") {
        navigate('/login?role=labour&mode=signup');
        setLilaOpen(false);
        return;
      } else if (chip === "📋 Post a Job Need") {
        botText = "Post a job request before 8:00 PM, and our student coordinators will telephone you and confirm a helper by 9:00 PM. Zero platform commissions.";
        nextChips = ["📋 Start Job Request", "↩️ Main Options"];
      } else if (chip === "📋 Start Job Request") {
        navigate('/post-job');
        setLilaOpen(false);
        return;
      } else if (chip === "📞 Call Helpline Desk") {
        botText = "You can contact our LabourLink startup coordination desk directly at +91 99999-XXXXX (Active 9 AM to 9 PM daily). We are here to help!";
        nextChips = ["↩️ Main Options"];
      } else {
        // Default or Main Options
        botText = "How else can LILA assist you today?";
        nextChips = [
          "👨‍🌾 Find a Local Worker",
          "🧹 Register as a Worker",
          "📋 Post a Job Need",
          "📞 Call Helpline Desk"
        ];
      }

      setLilaMessages(prev => [...prev, { sender: 'bot', text: botText }]);
      setLilaChips(nextChips);
    }, 500);
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
      {/* ─── Top Accessibility & Welfare Bar ─── */}
      <div className="top-utility-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>🇮🇳 National Digital Chowk Welfare Initiative</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <button
              onClick={() => setLargeText(t => !t)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            >
              ♿ {largeText ? "Normal Text (A-)" : "Large Text (A+)"}
            </button>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <button
              onClick={() => setHighContrast(c => !c)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
            >
              🌓 {highContrast ? "Normal Theme" : "High Contrast"}
            </button>
          </div>
          <div>
            <span>📞 Registry Helpline: <strong>+91 99999-XXXXX</strong></span>
          </div>
        </div>
      </div>

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

      {/* ─── LILA Chatbot Floating Drawer ─── */}
      <div className="lila-chatbot-container">
        {!lilaOpen ? (
          <button className="lila-trigger-btn lila-pulse-active" onClick={() => setLilaOpen(true)}>
            💬 Ask LILA Assistant
          </button>
        ) : (
          <div className="lila-chat-drawer">
            <div className="lila-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                <strong style={{ fontSize: '0.92rem' }}>LILA Chatbot (Online)</strong>
              </div>
              <button onClick={() => setLilaOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '1.1rem', padding: '2px' }}>×</button>
            </div>
            
            <div className="lila-chat-body">
              {lilaMessages.map((msg, idx) => (
                <div key={idx} className={`lila-message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="lila-chat-footer">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-light)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select an Option:
              </div>
              <div className="lila-chips-container">
                {lilaChips.map((chip, idx) => (
                  <button key={idx} className="lila-chip" onClick={() => handleChipClick(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
                  <div style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 700 }}>Independent Startup Venture</div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '1px' }}>Noida Labour Chowk Digitalization</div>
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
