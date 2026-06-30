import React, { useState, useCallback, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import WorkerDetail from './pages/WorkerDetail';
import PostJob from './pages/PostJob';
import Confirmation from './pages/Confirmation';
import Reviews from './pages/Reviews';
import About from './pages/About';
import Login from './pages/Login';
import LabourDashboard from './pages/LabourDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import { initialData, loadState, saveState } from './data';
import { supabase } from './supabaseClient';

const AUTH_KEY = 'auth';

function App() {
  /* ─── Auth ─── */
  const [auth, setAuth] = useState(() => loadState(AUTH_KEY, { role: null, user: null }));
  const navigate = useNavigate();

  useEffect(() => { saveState(AUTH_KEY, auth); }, [auth]);

  const handleLogin = useCallback(({ role, user }) => {
    setAuth({ role, user });
    if (role === 'admin') navigate('/admin');
    else if (role === 'labour') navigate('/labour');
    else navigate('/hirer');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setAuth({ role: null, user: null });
    navigate('/');
  }, [navigate]);

  /* ─── Data state ─── */
  const [workers, setWorkers] = useState(() => loadState('workers', initialData.workers));
  const [reviews, setReviews] = useState(() => loadState('reviews', initialData.reviews));
  const [requests, setRequests] = useState(() => loadState('requests', initialData.requests));
  const [bookings, setBookings] = useState(() => loadState('bookings', initialData.bookings));
  const [users, setUsers] = useState(() => loadState('users', initialData.users));

  // Sync with Supabase on mount
  useEffect(() => {
    async function syncData() {
      try {
        const { data: dbWorkers } = await supabase.from('workers').select('*');
        if (dbWorkers && dbWorkers.length) {
          setWorkers(dbWorkers);
          saveState('workers', dbWorkers);
        }
        
        const { data: dbReviews } = await supabase.from('reviews').select('*');
        if (dbReviews && dbReviews.length) {
          setReviews(dbReviews);
          saveState('reviews', dbReviews);
        }

        const { data: dbRequests } = await supabase.from('requests').select('*');
        if (dbRequests && dbRequests.length) {
          setRequests(dbRequests);
          saveState('requests', dbRequests);
        }

        const { data: dbBookings } = await supabase.from('bookings').select('*');
        if (dbBookings && dbBookings.length) {
          setBookings(dbBookings);
          saveState('bookings', dbBookings);
        }

        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && dbProfiles.length) {
          const mappedUsers = dbProfiles.map(p => ({
            id: p.id,
            email: p.email,
            name: p.name,
            phone: p.phone,
            role: p.role,
            worker_id: p.worker_id
          }));
          setUsers(mappedUsers);
          saveState('users', mappedUsers);
        }
      } catch (err) {
        console.warn('Could not sync with Supabase backend:', err);
      }
    }
    syncData();
  }, []);

  /* ─── Data mutation callbacks with Supabase syncing ─── */
  const onAddWorker = useCallback(async (w) => {
    setWorkers(prev => {
      const next = [...prev, w];
      saveState('workers', next);
      return next;
    });
    try {
      await supabase.from('workers').insert([w]);
    } catch (err) {
      console.error('Failed to sync insert worker with Supabase:', err);
    }
  }, []);

  const onUpdateWorker = useCallback(async (id, patch) => {
    setWorkers(prev => {
      const next = prev.map(w => w.id === id ? { ...w, ...patch } : w);
      saveState('workers', next);
      return next;
    });
    try {
      await supabase.from('workers').update(patch).eq('id', id);
    } catch (err) {
      console.error('Failed to sync update worker with Supabase:', err);
    }
  }, []);

  const onAddReview = useCallback(async (r) => {
    setReviews(prev => {
      const next = [...prev, r];
      saveState('reviews', next);
      return next;
    });
    try {
      await supabase.from('reviews').insert([r]);
    } catch (err) {
      console.error('Failed to sync insert review with Supabase:', err);
    }
  }, []);

  const onUpdateReview = useCallback(async (id, patch) => {
    setReviews(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...patch } : r);
      saveState('reviews', next);
      return next;
    });
    try {
      await supabase.from('reviews').update(patch).eq('id', id);
    } catch (err) {
      console.error('Failed to sync update review with Supabase:', err);
    }
  }, []);

  const onAddRequest = useCallback(async (r) => {
    setRequests(prev => {
      const next = [...prev, r];
      saveState('requests', next);
      return next;
    });
    try {
      await supabase.from('requests').insert([r]);
    } catch (err) {
      console.error('Failed to sync insert request with Supabase:', err);
    }
  }, []);

  const onUpdateRequest = useCallback(async (id, patch) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...patch } : r);
      saveState('requests', next);
      return next;
    });
    try {
      await supabase.from('requests').update(patch).eq('id', id);
    } catch (err) {
      console.error('Failed to sync update request with Supabase:', err);
    }
  }, []);

  const onAddBooking = useCallback(async (b) => {
    setBookings(prev => {
      const next = [...prev, b];
      saveState('bookings', next);
      return next;
    });
    try {
      await supabase.from('bookings').insert([b]);
    } catch (err) {
      console.error('Failed to sync insert booking with Supabase:', err);
    }
  }, []);

  const onUpdateBooking = useCallback(async (id, patch) => {
    setBookings(prev => {
      const next = prev.map(b => b.id === id ? { ...b, ...patch } : b);
      saveState('bookings', next);
      return next;
    });
    try {
      await supabase.from('bookings').update(patch).eq('id', id);
    } catch (err) {
      console.error('Failed to sync update booking with Supabase:', err);
    }
  }, []);

  const onRegisterUser = useCallback(async (u) => {
    setUsers(prev => {
      const next = [...prev, u];
      saveState('users', next);
      return next;
    });
    try {
      const profileUuid = u.id?.includes('u-') ? '00000000-0000-0000-0000-' + u.id.replace('u-', '').padEnd(12, '0').slice(0, 12) : '00000000-0000-0000-0000-000000000000';
      await supabase.from('profiles').insert([{
        id: profileUuid,
        email: u.email,
        name: u.name,
        phone: u.phone,
        role: u.role,
        worker_id: u.worker_id
      }]);
    } catch (err) {
      console.error('Failed to sync profile registration with Supabase:', err);
    }
  }, []);

  /* ─── Composite data object passed to pages ─── */
  const data = {
    workers,
    reviews,
    requests,
    bookings,
    users,
    wages: initialData.wages,
    areas: initialData.areas,
    workTypes: initialData.workTypes,
  };

  return (
    <Layout auth={auth} onLogout={handleLogout}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home data={data} />} />
        <Route path="/browse" element={<Browse data={data} />} />
        <Route path="/worker/:id" element={<WorkerDetail data={data} onAddReview={onAddReview} />} />
        <Route path="/post-job" element={<PostJob data={data} onSubmit={onAddRequest} auth={auth} />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/reviews" element={<Reviews data={data} />} />
        <Route path="/about" element={<About />} />

        {/* Auth */}
        <Route
          path="/login"
          element={
            auth.role
              ? <Navigate to={auth.role === 'admin' ? '/admin' : auth.role === 'labour' ? '/labour' : '/hirer'} />
              : <Login onLogin={handleLogin} data={data} onRegisterUser={onRegisterUser} onAddWorker={onAddWorker} />
          }
        />

        {/* Dashboards */}
        <Route
          path="/labour"
          element={
            auth.role === 'labour'
              ? <LabourDashboard auth={auth} data={data} onUpdateWorker={onUpdateWorker} onUpdateRequest={onUpdateRequest} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/hirer"
          element={
            auth.role === 'hirer'
              ? <CustomerDashboard auth={auth} data={data} onUpdateRequest={onUpdateRequest} onAddReview={onAddReview} onAddBooking={onAddBooking} />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/admin"
          element={
            auth.role === 'admin'
              ? <AdminDashboard
                  auth={auth} data={data}
                  onUpdateRequest={onUpdateRequest}
                  onUpdateWorker={onUpdateWorker}
                  onAddWorker={onAddWorker}
                  onAddBooking={onAddBooking}
                  onUpdateReview={onUpdateReview}
                  onUpdateBooking={onUpdateBooking}
                />
              : <Navigate to="/login" />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
