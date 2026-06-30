import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Sliders, Check, Award, Grid, List } from '../components/Icons';
import { stars } from '../data';

export default function Browse({ data }) {
  const { workers } = data;
  const [searchParams] = useSearchParams();
  const [areaFilter, setAreaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'

  const published = workers.filter(w => w.is_published && !w.is_blacklisted);
  const areas = useMemo(() => [...new Set(published.map(w => w.area).filter(Boolean))].sort(), [published]);
  const types = useMemo(() => [...new Set(published.flatMap(w => w.work_types || []))].sort(), [published]);

  const filtered = useMemo(() => {
    let list = published;
    if (areaFilter) list = list.filter(w => w.area === areaFilter);
    if (typeFilter) list = list.filter(w => (w.work_types || []).includes(typeFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(w => 
        w.name.toLowerCase().includes(q) || 
        (w.locality && w.locality.toLowerCase().includes(q)) || 
        (w.work_types || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.rating_avg - a.rating_avg);
  }, [published, areaFilter, typeFilter, searchQuery]);

  return (
    <section className="section fade-in" style={{ background: 'var(--bg)', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Header */}
        <div className="section-head" style={{ marginBottom: '40px' }}>
          <p className="eyebrow">Worker Directory</p>
          <h2>Search Verified Local Workers</h2>
          <p className="lead">
            Screened, photo-verified, and registered in-person at Greater Noida labour chowks.
          </p>
        </div>

        {/* Search and Layout controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
            <input
              type="text"
              placeholder="Search workers by name, locality, or skill (e.g. Aarav, Gaur City, Paint)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 18px 16px 52px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s ease',
                background: '#ffffff',
                fontFamily: 'inherit'
              }}
              onFocus={e => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = 'var(--shadow-glow)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#ffffff', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '4px', boxShadow: 'var(--shadow-sm)' }}>
            <button
              onClick={() => setLayoutMode('grid')}
              aria-label="Grid Layout"
              style={{ background: layoutMode === 'grid' ? 'var(--primary-light)' : 'none', border: 'none', padding: '10px', borderRadius: '4px', color: layoutMode === 'grid' ? 'var(--primary)' : 'var(--muted-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              aria-label="List Layout"
              style={{ background: layoutMode === 'list' ? 'var(--primary-light)' : 'none', border: 'none', padding: '10px', borderRadius: '4px', color: layoutMode === 'list' ? 'var(--primary)' : 'var(--muted-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '36px', alignItems: 'start' }}>
          {/* Filters Sidebar */}
          <aside className="card glass-card" style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)', position: 'sticky', top: '100px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <Sliders size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ink)' }}>Filters</h3>
            </div>

            <div className="field">
              <label htmlFor="f-area" style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--muted-light)' }}>📍 Coverage Area</label>
              <select id="f-area" value={areaFilter} onChange={e => setAreaFilter(e.target.value)} style={{ padding: '11px 14px', fontSize: '0.9rem', outline: 'none' }}>
                <option value="">All Areas</option>
                {areas.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="f-type" style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--muted-light)' }}>🔧 Type of Work</label>
              <select id="f-type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '11px 14px', fontSize: '0.9rem', outline: 'none' }}>
                <option value="">All Categories</option>
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {(areaFilter || typeFilter || searchQuery) && (
              <button
                className="btn btn-ghost btn-sm btn-block"
                style={{ marginTop: '24px', borderStyle: 'dashed', borderColor: 'var(--border-hover)', color: 'var(--muted)', borderRadius: '4px' }}
                onClick={() => { setAreaFilter(''); setTypeFilter(''); setSearchQuery(''); }}
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Directory Listings */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <p className="muted" style={{ margin: 0, fontWeight: 700, color: 'var(--muted)' }}>
                Showing {filtered.length} active worker{filtered.length === 1 ? '' : 's'} profile{filtered.length === 1 ? '' : 's'}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--success-text)', background: 'var(--success-light)', padding: '6px 14px', borderRadius: '99px', fontWeight: 800, border: '1px solid var(--success-border)' }}>
                <Check size={12} strokeWidth={3} />
                100% In-Person Vetted
              </div>
            </div>

            {layoutMode === 'grid' ? (
              <div className="grid cols-3" style={{ gap: '24px' }}>
                {filtered.length ? filtered.map(w => (
                  <Link to={`/worker/${w.id}`} className="card glass-card" key={w.id} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', background: '#ffffff', overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                      <img src={w.photo_url || '/assets/worker1.jpeg'} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className={`status-chip ${w.availability_status}`} style={{ position: 'absolute', bottom: '12px', left: '12px', boxShadow: 'var(--shadow-sm)', textTransform: 'capitalize' }}>
                        {w.availability_status}
                      </span>
                    </div>
                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--ink)' }}>{w.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', margin: '6px 0 14px', color: 'var(--muted)' }}>
                        <MapPin size={12} style={{ color: 'var(--muted-light)' }} /> {w.area}
                      </div>

                      {/* Reliability Score Bar */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '6px', fontWeight: 700 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> Reliability</span>
                          <span style={{ color: 'var(--primary)' }}>{w.reliability_score || 50}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${w.reliability_score || 50}%`, height: '100%', background: 'var(--primary)', borderRadius: '99px' }}></div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.82rem' }}>
                        <div className="rating-row">
                          <span className="stars">{stars(w.rating_avg)}</span>
                          <strong style={{ color: 'var(--ink)', marginLeft: '4px' }}>{Number(w.rating_avg).toFixed(1)}</strong>
                        </div>
                        <span style={{ color: 'var(--muted-light)', fontWeight: 700 }}>{w.total_jobs} jobs</span>
                      </div>

                      <div className="tags" style={{ marginTop: '14px' }}>
                        {(w.work_types || []).slice(0, 2).map(t => <span className="tag" key={t}>{t}</span>)}
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="card glass-card" style={{ gridColumn: '1 / -1', padding: '64px 32px', textAlign: 'center', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--ink)' }}>No workers match these filters</h3>
                    <p className="muted" style={{ margin: 0 }}>Try changing your selected area or work types to broaden your search.</p>
                  </div>
                )}
              </div>
            ) : (
              /* List layout mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filtered.length ? filtered.map(w => (
                  <Link to={`/worker/${w.id}`} className="card glass-card" key={w.id} style={{ display: 'flex', textDecoration: 'none', color: 'inherit', overflow: 'hidden', height: '160px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: '#ffffff' }}>
                    <img
                      src={w.photo_url || '/assets/worker1.jpeg'}
                      alt={w.name}
                      style={{ width: '200px', height: '100%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--ink)' }}>{w.name}</h3>
                          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', marginTop: '4px', color: 'var(--muted)' }}>
                            <MapPin size={12} style={{ color: 'var(--muted-light)' }} /> {w.area} {w.locality ? `· ${w.locality}` : ''}
                          </div>
                        </div>
                        <span className={`status-chip ${w.availability_status}`} style={{ textTransform: 'capitalize' }}>{w.availability_status}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '32px', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                        <div className="rating-row" style={{ fontSize: '0.9rem' }}>
                          <span className="stars">{stars(w.rating_avg)}</span>
                          <strong style={{ marginLeft: '4px', color: 'var(--ink)' }}>{Number(w.rating_avg).toFixed(1)}</strong>
                          <span className="muted" style={{ color: 'var(--muted-light)', marginLeft: '4px' }}>({w.total_reviews} reviews)</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--muted)' }}>
                          💼 <strong>{w.total_jobs}</strong> jobs completed
                        </div>
                        <div style={{ flex: 1, maxWidth: '220px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '4px', fontWeight: 700 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Award size={12} /> Reliability</span>
                            <strong style={{ color: 'var(--primary)' }}>{w.reliability_score}%</strong>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '99px' }}>
                            <div style={{ width: `${w.reliability_score}%`, height: '100%', background: 'var(--primary)', borderRadius: '99px' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="card glass-card" style={{ padding: '64px 32px', textAlign: 'center', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                    <h3 style={{ margin: '0 0 8px', color: 'var(--ink)' }}>No workers match these filters</h3>
                    <p className="muted" style={{ margin: 0 }}>Try changing your selected area or work types to broaden your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
