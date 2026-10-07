import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
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
import AccountSettings from './pages/AccountSettings';
import { getAvailableRequests, getMyQuotes, submitQuote, getProviderProfile, getAllProviders, getProviderById, updateProviderProfile } from './api/services';
import { toast } from 'react-toastify';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID || 'dummy_client_id';

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
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    phone: '',
    serviceArea: '',
    skills: '',
    languages: '',
    experienceYears: 0,
    hourlyRate: 0,
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProviderProfile()
      .then(({ data }) => {
        setProfile(data);
        setForm({
          displayName: data.displayName || '',
          headline: data.headline || '',
          phone: data.phone || '',
          serviceArea: data.serviceArea || '',
          skills: (data.skills || []).join(', '),
          languages: (data.languages || []).join(', '),
          experienceYears: data.experienceYears || 0,
          hourlyRate: data.hourlyRate || 0,
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
        hourlyRate: Number(form.hourlyRate),
        skills: form.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        languages: form.languages.split(',').map(lang => lang.trim()).filter(Boolean),
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
    <form onSubmit={saveProfile} className="max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Provider profile</h1>
        <p className="mt-2 text-sm text-slate-500">Show customers your identity, skills, and experience before they book.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Professional name
            <input name="displayName" value={form.displayName} onChange={updateField} placeholder="Amit Kumar" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700">Headline
            <input name="headline" value={form.headline} onChange={updateField} placeholder="Certified electrician and appliance specialist" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700">Phone number
            <input name="phone" value={form.phone} onChange={updateField} placeholder="+91 98765 43210" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700">Service area
            <input name="serviceArea" value={form.serviceArea} onChange={updateField} placeholder="Koramangala, Bengaluru" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700">Years of experience
            <input name="experienceYears" type="number" min="0" value={form.experienceYears} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700">Hourly rate (₹)
            <input name="hourlyRate" type="number" min="0" value={form.hourlyRate} onChange={updateField} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Skills
            <input name="skills" value={form.skills} onChange={updateField} placeholder="Plumbing, repairs, installation" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Languages
            <input name="languages" value={form.languages} onChange={updateField} placeholder="English, Hindi, Kannada" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
          </label>

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">About you
            <textarea name="bio" value={form.bio} onChange={updateField} rows="5" placeholder="Describe your experience, certifications, and the services you provide" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-orange-500" />
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

const ProviderDirectoryPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    getAllProviders()
      .then(({ data }) => setProviders(data || []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredProviders = providers.filter((provider) => {
    const user = provider.user || {};
    const displayName = provider.displayName || user.name || 'Service Provider';
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || [
      displayName,
      provider.headline,
      provider.serviceArea,
      provider.bio,
      ...(provider.skills || []),
      ...(provider.languages || [])
    ].some((value) => String(value || '').toLowerCase().includes(query));

    const matchesAvailability = !showAvailableOnly || provider.isAvailable;
    return matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Find trusted providers</h1>
        <p className="mt-2 text-sm text-slate-500">Browse verified professionals by skill, service area, and experience.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by skill, area, or name"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary-500 md:max-w-md"
          />
          <button
            type="button"
            onClick={() => setShowAvailableOnly((value) => !value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${showAvailableOnly ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
          >
            {showAvailableOnly ? 'Showing available only' : 'Filter: all providers'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Loading providers...</div>
      ) : filteredProviders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">No providers match your search yet.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProviders.map((provider) => {
            const user = provider.user || {};
            const skills = provider.skills || [];
            const displayName = provider.displayName || user.name || 'Service Provider';

            return (
              <div key={provider._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-lg font-bold text-orange-700">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{displayName}</h3>
                      <p className="text-xs text-slate-500">{provider.headline || 'Home service professional'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${provider.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {provider.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p><strong className="text-slate-900">Area:</strong> {provider.serviceArea || 'Not specified'}</p>
                  <p><strong className="text-slate-900">Experience:</strong> {provider.experienceYears || 0} years</p>
                  {provider.hourlyRate ? <p><strong className="text-slate-900">Rate:</strong> ₹{provider.hourlyRate}/hr</p> : null}
                  <p><strong className="text-slate-900">Rating:</strong> {provider.rating ? `${provider.rating.toFixed(1)} / 5` : 'New'}
                    {provider.reviewCount ? ` (${provider.reviewCount} reviews)` : ''}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.slice(0, 4).map(skill => (
                    <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>

                {provider.bio && (
                  <p className="mt-4 text-sm text-slate-500 line-clamp-3">{provider.bio}</p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">{provider.languages?.length ? provider.languages.join(', ') : 'English'}</span>
                  <Link to={`/customer/providers/${provider._id}`} className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700">
                    View profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProviderProfileDetailPage = () => {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      setProvider(null);
      setLoading(false);
      return;
    }

    getProviderById(providerId)
      .then(({ data }) => setProvider(data))
      .catch(() => setProvider(null))
      .finally(() => setLoading(false));
  }, [providerId]);

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading provider profile...</div>;
  }

  if (!provider) {
    return (
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-900">Provider not found</h1>
        <p className="text-sm text-slate-500">This service provider is no longer available or the profile could not be loaded.</p>
        <Link to="/customer/providers" className="inline-flex rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
          Back to providers
        </Link>
      </div>
    );
  }

  const user = provider.user || {};
  const displayName = provider.displayName || user.name || 'Service Provider';
  const skills = provider.skills || [];
  const languages = provider.languages || [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link to="/customer/providers" className="mb-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
          ← Back to providers
        </Link>

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-2xl font-bold text-orange-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{displayName}</h1>
              <p className="text-sm text-slate-500">{provider.headline || 'Home service professional'}</p>
            </div>
          </div>

          <span className={`rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${provider.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
            {provider.isAvailable ? 'Available now' : 'Currently busy'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">About</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{provider.bio || 'This provider has not added a bio yet.'}</p>

          <div className="mt-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.length ? skills.map(skill => (
                  <span key={skill} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{skill}</span>
                )) : <span className="text-sm text-slate-500">No skills listed yet.</span>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-400">Languages</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {languages.length ? languages.map(language => (
                  <span key={language} className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">{language}</span>
                )) : <span className="text-sm text-slate-500">No languages listed yet.</span>}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Professional details</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><strong className="text-slate-900">Service area:</strong> {provider.serviceArea || 'Not specified'}</p>
              <p><strong className="text-slate-900">Experience:</strong> {provider.experienceYears || 0} years</p>
              <p><strong className="text-slate-900">Hourly rate:</strong> {provider.hourlyRate ? `₹${provider.hourlyRate}/hr` : 'Not specified'}</p>
              <p><strong className="text-slate-900">Phone:</strong> {provider.phone || 'Not shared'}</p>
              <p><strong className="text-slate-900">Rating:</strong> {provider.rating ? `${provider.rating.toFixed(1)} / 5` : 'New'} {provider.reviewCount ? `(${provider.reviewCount} reviews)` : ''}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Link to="/customer/new-request" className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-bold text-white hover:bg-primary-700">
              Request service
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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
                <Route path="providers" element={<ProviderDirectoryPage />} />
                <Route path="providers/:providerId" element={<ProviderProfileDetailPage />} />
                <Route path="settings" element={<AccountSettings />} />
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
                <Route path="settings" element={<AccountSettings />} />
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
                <Route path="settings" element={<AccountSettings />} />
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
