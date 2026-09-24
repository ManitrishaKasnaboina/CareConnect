import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAvailableRequests, getMyQuotes, getProviderBookings, getProviderProfile, updateProviderProfile, updateBookingStatus } from '../../api/services';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { formatRupees } from '../../utils/currency';
import {
  DollarSign, Star, ClipboardList, CalendarCheck,
  ToggleLeft, ToggleRight, ArrowRight, Loader2,
  Sparkles, AlertCircle, Clock, TrendingUp,
  MapPinned
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profRes, jobsRes, quotesRes, bookRes] = await Promise.allSettled([
          getProviderProfile(),
          getAvailableRequests(),
          getMyQuotes(),
          getProviderBookings(),
        ]);
        if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
        if (jobsRes.status === 'fulfilled') setAvailableJobs(jobsRes.value.data);
        if (quotesRes.status === 'fulfilled') setQuotes(quotesRes.value.data);
        if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const refreshBookings = (notification) => {
      if (notification.booking) {
        setBookings(current => [
          notification.booking,
          ...current.filter(item => item._id !== notification.booking._id)
        ]);
      }
      toast.info(notification.message);
    };
    socket.on('bookingNotification', refreshBookings);
    return () => socket.off('bookingNotification', refreshBookings);
  }, [socket]);

  const toggleAvailability = async () => {
    if (!profile) return;
    setTogglingAvailability(true);
    try {
      const res = await updateProviderProfile({ isAvailable: !profile.isAvailable });
      setProfile(res.data);
      toast.success(`You are now ${res.data.isAvailable ? 'available' : 'unavailable'} for jobs.`);
    } catch {
      toast.error('Failed to update availability.');
    } finally {
      setTogglingAvailability(false);
    }
  };

  const changeBookingStatus = async (booking, status) => {
    setUpdatingBooking(booking._id);
    try {
      const res = await updateBookingStatus(booking._id, status);
      setBookings(current => current.map(item => item._id === booking._id ? { ...item, ...res.data } : item));
      toast.success(status === 'IN_PROGRESS' ? 'Work started.' : 'Work marked as completed.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update booking.');
    } finally {
      setUpdatingBooking(null);
    }
  };

  const pendingQuotes = quotes.filter(q => q.status === 'PENDING');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.quote?.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className="relative overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-xl"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.78), rgba(30,64,175,0.72), rgba(249,115,22,0.56)), url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="flex flex-col gap-6 px-6 py-7 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="max-w-xl text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-200">Professional service dashboard</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Welcome back, {user?.name?.split(' ')[0] || 'Provider'}
            </h1>
            <p className="mt-3 text-sm text-slate-200 md:text-base">
              Manage jobs, respond faster, and keep every customer update in sync.
            </p>
          </div>

          <button
            id="toggle-availability-btn"
            onClick={toggleAvailability}
            disabled={togglingAvailability}
            className={`flex items-center justify-center gap-3 rounded-2xl border-2 px-5 py-3 text-sm font-bold shadow-lg transition-all ${
              profile?.isAvailable
                ? 'border-emerald-300 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30'
                : 'border-white/30 bg-slate-900/30 text-white hover:bg-slate-900/40'
            }`}
          >
            {togglingAvailability ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : profile?.isAvailable ? (
              <ToggleRight className="w-6 h-6" />
            ) : (
              <ToggleLeft className="w-6 h-6" />
            )}
            {profile?.isAvailable ? 'Available for jobs' : 'Unavailable'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={DollarSign} label="Total Earnings" value={formatRupees(totalEarnings)} sub="All completed jobs" accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={CalendarCheck} label="Completed Tasks" value={completedBookings.length} sub={`${bookings.length} total bookings`} accent="bg-blue-50 text-blue-600" />
        <StatCard icon={ClipboardList} label="Pending Quotes" value={pendingQuotes.length} sub="Awaiting customer reply" accent="bg-amber-50 text-amber-500" />
        <StatCard icon={Star} label="Your Rating" value={profile?.rating ? profile.rating.toFixed(1) : '–'} sub={profile?.rating ? `${profile.reviewCount || 0} reviews` : 'No ratings yet'} accent="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/provider/jobs', label: 'Browse Available Jobs', desc: `${availableJobs.length} jobs near you`, color: 'from-blue-600 to-indigo-600', icon: ClipboardList },
          { to: '/provider/quotes', label: 'My Submitted Quotes', desc: `${pendingQuotes.length} pending replies`, color: 'from-amber-500 to-orange-500', icon: DollarSign },
          { to: '/provider/location', label: 'Live Location', desc: 'Share your real-time route', color: 'from-emerald-500 to-teal-600', icon: MapPinned },
        ].map(item => (
          <Link key={item.to} to={item.to} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${item.color} text-white flex items-center justify-center shadow-md`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 transition-all group-hover:text-blue-600 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="font-bold text-slate-900 text-base">Available jobs near you</h2>
          </div>
          <Link to="/provider/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {availableJobs.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Sparkles className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium">
              {!profile?.isAvailable ? 'Enable availability to see matching jobs' : 'No matching jobs right now — check back soon!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {availableJobs.slice(0, 5).map(job => (
              <div key={job._id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {job.aiMetadata?.categoryName || job.category?.name || 'Service Request'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 truncate">{job.description}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(job.createdAt).toLocaleDateString()}</span>
                    {job.location && <span className="inline-flex items-center gap-1">📍 {job.location}</span>}
                    {job.aiMetadata?.isEmergency && <span className="font-bold text-red-600">🚨 Emergency</span>}
                  </div>
                </div>
                <Link to="/provider/jobs" className="shrink-0 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                  Quote
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Your customer jobs</h2>
            <p className="mt-1 text-xs text-slate-400">Start and complete accepted bookings here.</p>
          </div>
          <CalendarCheck className="h-5 w-5 text-blue-500" />
        </div>
        {bookings.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-400">No accepted customer jobs yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map(booking => (
              <div key={booking._id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{booking.request?.aiMetadata?.categoryName || 'Service booking'}</p>
                  <p className="mt-1 text-sm text-slate-500">{booking.request?.description || 'Customer service request'}</p>
                  <p className="mt-2 text-xs text-slate-400">{booking.request?.location || 'Location shared'} · {booking.timeSlot || 'Scheduled service'}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Customer: {booking.customer?.name || 'Customer'} · {formatRupees(booking.quote?.amount)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">{booking.status}</span>
                  {booking.status === 'CONFIRMED' && (
                    <button disabled={updatingBooking === booking._id} onClick={() => changeBookingStatus(booking, 'IN_PROGRESS')} className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
                      {updatingBooking === booking._id ? 'Updating...' : 'Start work'}
                    </button>
                  )}
                  {booking.status === 'IN_PROGRESS' && (
                    <button disabled={updatingBooking === booking._id} onClick={() => changeBookingStatus(booking, 'COMPLETED')} className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
                      {updatingBooking === booking._id ? 'Updating...' : 'Complete work'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
