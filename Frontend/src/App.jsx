import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyRequests from './pages/customer/MyRequests';
import NewRequest from './pages/customer/NewRequest';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import ProviderLayout from './layouts/ProviderLayout';
import AdminLayout from './layouts/AdminLayout';
import OpsLayout from './layouts/OpsLayout';
import LocationTracker from './pages/provider/LocationTracker';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import MyBookings from './pages/customer/MyBookings';
import { getAvailableRequests, getMyQuotes, submitQuote, getProviderProfile, updateProviderProfile } from './api/services';
import { toast } from 'react-toastify';

const demoJobs = [
  {
    id: 'job-1',
    title: 'Kitchen Sink Pipe Leak',
    category: 'Plumbing',
    location: 'Koramangala, Bengaluru',
    price: '₹799',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    description: 'Water is leaking under the kitchen sink and the cabinet floor is getting wet.',
  },
  {
    id: 'job-2',
    title: 'Bedroom Ceiling Fan Repair',
    category: 'Electrical',
    location: 'Indiranagar, Bengaluru',
    price: '₹650',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80',
    description: 'The fan makes a buzzing sound and intermittently stops working during peak hours.',
  },
  {
    id: 'job-3',
    title: 'Bathroom Tile Cleaning',
    category: 'Cleaning',
    location: 'HSR Layout, Bengaluru',
    price: '₹1,200',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80',
    description: 'Need deep bathroom tile and grout cleaning before the guest visit this weekend.',
  },
  {
    id: 'job-4',
    title: 'AC Cooling Not Working',
    category: 'HVAC',
    location: 'Whitefield, Bengaluru',
    price: '₹1,500',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    description: 'The AC is running but not cooling the room properly and the compressor is noisy.',
  },
];

const ProviderJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteJob, setQuoteJob] = useState(null);
  const [amount, setAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    getAvailableRequests()
      .then(res => setJobs(res.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const sendQuote = async (event) => {
    event.preventDefault();
    if (!quoteJob || !amount || !estimatedTime) return;
    try {
      await submitQuote({ request: quoteJob._id, amount: Number(amount), estimatedTime });
      setJobs(current => current.filter(job => job._id !== quoteJob._id));
      setQuoteJob(null);
      setAmount('');
      setEstimatedTime('');
      toast.success('Quote submitted to the customer.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit quote.');
    }
  };

  return (
  <div className="space-y-6">
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <h1 className="text-2xl font-extrabold text-slate-900">Available jobs</h1>
      <p className="mt-2 text-slate-500">New nearby opportunities are listed below for your service area.</p>
    </div>

    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
      {loading ? <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading available jobs...</div> : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No matching live jobs yet. Customer requests will appear here when your profile is available.</div>
      ) : jobs.map((job) => (
        <div key={job._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url('${demoJobs[job._id?.charCodeAt(0) % demoJobs.length]?.image || demoJobs[0].image}')` }} />
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
                {job.aiMetadata?.categoryName || job.category?.name || 'Home service'}
              </span>
              <span className="text-lg font-extrabold text-slate-900">₹{job.aiMetadata?.estimatedQuote?.min || '—'}</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{job.aiMetadata?.categoryName || job.category?.name || 'Service request'}</h3>
              <p className="mt-2 text-sm text-slate-500">{job.description}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{job.location || 'Location shared after quote'}</span>
              <button onClick={() => setQuoteJob(job)} className="rounded-xl bg-primary-600 px-3 py-2 font-semibold text-white hover:bg-primary-700">
                Quote job
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
    {quoteJob && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
        <form onSubmit={sendQuote} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-2xl">
          <div><h2 className="text-xl font-extrabold text-slate-900">Send your quote</h2><p className="mt-1 text-sm text-slate-500">Quote for {quoteJob.aiMetadata?.categoryName || 'this service request'}.</p></div>
          <input type="number" min="1" required value={amount} onChange={event => setAmount(event.target.value)} placeholder="Amount in rupees" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500" />
          <input required value={estimatedTime} onChange={event => setEstimatedTime(event.target.value)} placeholder="Estimated time (e.g. 2 hours)" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500" />
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setQuoteJob(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white">Submit quote</button></div>
        </form>
      </div>
    )}
  </div>
  );
};

const ProviderQuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  useEffect(() => { getMyQuotes().then(res => setQuotes(res.data)).catch(() => setQuotes([])); }, []);
  return <div className="space-y-6"><div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm"><h1 className="text-2xl font-extrabold text-slate-900">My quotes</h1><p className="mt-2 text-slate-500">Track submitted quotes and customer responses.</p></div><div className="space-y-3">{quotes.length === 0 ? <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">You have not submitted any quotes yet.</div> : quotes.map(quote => <div key={quote._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5"><div><p className="font-bold text-slate-900">{quote.request?.description || 'Service request'}</p><p className="mt-1 text-xs text-slate-500">{quote.estimatedTime}</p></div><div className="text-right"><p className="font-extrabold text-primary-700">₹{quote.amount}</p><p className="text-xs text-slate-500">{quote.status}</p></div></div>)}</div></div>;
};

const ProviderSettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ serviceArea: '', skills: '', experienceYears: 0, bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProviderProfile()
      .then(({ data }) => {
        setProfile(data);
        setForm({
          serviceArea: data.serviceArea || '',
          skills: (data.skills || []).join(', '),
          experienceYears: data.experienceYears || 0,
          bio: data.bio || '',
        });
      })
      .catch(() => toast.error('Unable to load your provider profile.'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  const saveProfile = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await updateProviderProfile({
        ...form,
        experienceYears: Number(form.experienceYears),
        skills: form.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      });
      setProfile(data);
      toast.success('Provider profile saved.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading provider profile...</div>;

  return (
    <form onSubmit={saveProfile} className="max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Provider profile</h1>
        <p className="mt-2 text-sm text-slate-500">Add the details customers need before they accept your quote.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Service area
            <input name="serviceArea" value={form.serviceArea} onChange={updateField} placeholder="City or neighborhood" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Years of experience
            <input name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Skills
            <input name="skills" value={form.skills} onChange={updateField} placeholder="Plumbing, repairs, installation" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">About you
            <textarea name="bio" value={form.bio} onChange={updateField} rows="5" placeholder="Describe your experience and the services you provide" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">Status: <strong className={profile?.isAvailable ? 'text-emerald-600' : 'text-slate-500'}>{profile?.isAvailable ? 'Available for jobs' : 'Unavailable'}</strong></p>
          <button disabled={saving} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">{saving ? 'Saving...' : 'Save profile'}</button>
        </div>
      </div>
    </form>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id'}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CustomerDashboard />} />
                <Route path="requests" element={<MyRequests />} />
                <Route path="new-request" element={<NewRequest />} />
                <Route path="bookings" element={<MyBookings />} />
              </Route>

              {/* Provider Routes */}
              <Route
                path="/provider"
                element={
                  <ProtectedRoute allowedRoles={['PROVIDER']}>
                    <ProviderLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProviderDashboard />} />
                <Route path="jobs" element={<ProviderJobsPage />} />
                <Route path="quotes" element={<ProviderQuotesPage />} />
                <Route path="location" element={<LocationTracker />} />
                <Route path="settings" element={<ProviderSettingsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<div>Admin Dashboard (WIP)</div>} />
              </Route>

              {/* Ops Manager Routes */}
              <Route
                path="/ops"
                element={
                  <ProtectedRoute allowedRoles={['OPERATIONS_MANAGER']}>
                    <OpsLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<div>Ops Dashboard (WIP)</div>} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
