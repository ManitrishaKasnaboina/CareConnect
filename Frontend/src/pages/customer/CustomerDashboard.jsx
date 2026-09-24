import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyRequests, getMyBookings } from '../../api/services';
import {
  ClipboardList, CalendarCheck,
  PlusCircle, ArrowRight, Clock, CheckCircle2,
  AlertCircle, Loader2, TrendingUp, Sparkles
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     color: 'text-amber-600 bg-amber-50 border-amber-200' },
  QUOTED:      { label: 'Quoted',      color: 'text-blue-600 bg-blue-50 border-blue-200' },
  ACCEPTED:    { label: 'Accepted',    color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-primary-700 bg-primary-50 border-primary-200' },
  COMPLETED:   { label: 'Completed',   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  CANCELLED:   { label: 'Cancelled',   color: 'text-red-600 bg-red-50 border-red-200' },
};

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, bookRes] = await Promise.allSettled([
          getMyRequests(),
          getMyBookings(),
        ]);
        if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data);
        if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data);
      } catch {
        // errors handled per-call above
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeRequests = requests.filter(r => ['PENDING','QUOTED','ACCEPTED','IN_PROGRESS'].includes(r.status));
  const completedCount = requests.filter(r => r.status === 'COMPLETED').length;
  const upcomingBookings = bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');

  const recentRequests = [...requests].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening with your home services.</p>
        </div>
        <Link
          to="/customer/new-request"
          id="new-request-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-600/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={ClipboardList}
          label="Active Requests"
          value={activeRequests.length}
          sub={`${requests.length} total`}
          accent="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={CalendarCheck}
          label="Upcoming Bookings"
          value={upcomingBookings.length}
          sub="Scheduled services"
          accent="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Jobs"
          value={completedCount}
          sub="All time"
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/customer/new-request', icon: PlusCircle, label: 'Request a Service', desc: 'Describe your issue & get matched', color: 'from-primary-600 to-teal-600' },
          { to: '/customer/requests',    icon: ClipboardList, label: 'View My Requests',  desc: 'Track all your service requests',  color: 'from-blue-600 to-indigo-600' },
          { to: '/customer/bookings',    icon: CalendarCheck, label: 'My Bookings',       desc: 'Manage your scheduled services',  color: 'from-violet-600 to-purple-600' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4 overflow-hidden">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="font-bold text-slate-900 text-base">Recent Requests</h2>
          </div>
          <Link to="/customer/requests" className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Sparkles className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium">No service requests yet</p>
            <Link to="/customer/new-request" className="text-xs text-primary-600 hover:underline font-semibold">
              Create your first request →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentRequests.map(req => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
              return (
                <div key={req._id} className="px-6 py-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">
                        {req.aiMetadata?.categoryName || req.category?.name || 'Service Request'}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{req.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:block">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
