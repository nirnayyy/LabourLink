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

  /* ─── Data state — seeded from initialData, persisted to localStorage ─── */
  const [workers, setWorkers] = useState(() => loadState('workers', initialData.workers));
  const [reviews, setReviews] = useState(() => loadState('reviews', initialData.reviews));
  const [requests, setRequests] = useState(() => loadState('requests', initialData.requests));
  const [bookings, setBookings] = useState(() => loadState('bookings', initialData.bookings));
  const [users, setUsers] = useState(() => loadState('users', initialData.users));

  // Persist whenever any data changes
  useEffect(() => { saveState('workers', workers); }, [workers]);
  useEffect(() => { saveState('reviews', reviews); }, [reviews]);
  useEffect(() => { saveState('requests', requests); }, [requests]);
  useEffect(() => { saveState('bookings', bookings); }, [bookings]);
  useEffect(() => { saveState('users', users); }, [users]);

  /* ─── Data mutation callbacks ─── */
  const onAddWorker = useCallback((w) => setWorkers(prev => [...prev, w]), []);
  const onUpdateWorker = useCallback((id, patch) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, ...patch } : w));
  }, []);

  const onAddReview = useCallback((r) => setReviews(prev => [...prev, r]), []);
  const onUpdateReview = useCallback((id, patch) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const onAddRequest = useCallback((r) => setRequests(prev => [...prev, r]), []);
  const onUpdateRequest = useCallback((id, patch) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const onAddBooking = useCallback((b) => setBookings(prev => [...prev, b]), []);
  const onUpdateBooking = useCallback((id, patch) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }, []);

  const onRegisterUser = useCallback((u) => setUsers(prev => [...prev, u]), []);

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
