import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createBooking, getMyRequests, getQuotesForRequest, updateQuoteStatus } from '../../api/services';
import { PlusCircle, Search, Clock, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { formatRupees } from '../../utils/currency';

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     color: 'text-amber-600 bg-amber-50 border-amber-200' },
  QUOTED:      { label: 'Quoted',      color: 'text-blue-600 bg-blue-50 border-blue-200' },
  ACCEPTED:    { label: 'Accepted',    color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-primary-700 bg-primary-50 border-primary-200' },
  COMPLETED:   { label: 'Completed',   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  CANCELLED:   { label: 'Cancelled',   color: 'text-red-600 bg-red-50 border-red-200' },
};

const ALL_STATUSES = ['ALL', ...Object.keys(STATUS_CONFIG)];

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [quotes, setQuotes] = useState({});
  const [bookingQuote, setBookingQuote] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  useEffect(() => {
    getMyRequests()
      .then(async res => {
        setRequests(res.data);
        const quotedRequests = res.data.filter(request => ['QUOTED', 'PENDING'].includes(request.status));
        const quoteResults = await Promise.all(quotedRequests.map(request => getQuotesForRequest(request._id).catch(() => ({ data: [] }))));
        setQuotes(Object.fromEntries(quotedRequests.map((request, index) => [request._id, quoteResults[index].data])));
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const desc = (r.description || '').toLowerCase();
    const cat = (r.aiMetadata?.categoryName || r.category?.name || '').toLowerCase();
    const matchesSearch = !search || desc.includes(search.toLowerCase()) || cat.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const decideQuote = async (quote, status) => {
    try {
      await updateQuoteStatus(quote._id, status);
      setQuotes(current => ({ ...current, [quote.request]: (current[quote.request] || []).map(item => item._id === quote._id ? { ...item, status } : item) }));
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to update quote.');
    }
  };

  const bookQuote = async (event) => {
    event.preventDefault();
    try {
      await createBooking({ quoteId: bookingQuote._id, scheduledDate, timeSlot });
      window.location.reload();
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to create booking.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Service Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{requests.length} total request{requests.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/customer/new-request"
          id="create-request-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-primary-600/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            id="request-search"
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                id={`filter-${s.toLowerCase()}`}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all
                  ${statusFilter === s
                    ? (s === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : `${cfg.color} border-current`)
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {s === 'ALL' ? 'All' : cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Request Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center gap-3 text-slate-400">
          <Sparkles className="w-10 h-10 text-slate-200" />
          <p className="text-sm font-medium">
            {requests.length === 0 ? 'No requests yet' : 'No requests match your filter'}
          </p>
          {requests.length === 0 && (
            <Link to="/customer/new-request" className="text-xs text-primary-600 hover:underline font-semibold">
              Create your first request →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
            const catName = req.aiMetadata?.categoryName || req.category?.name || 'Service Request';
            return (
              <div
                key={req._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-sm">{catName}</h3>
                    {req.aiMetadata?.isEmergency && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                        🚨 Emergency
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{req.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                    <span><Clock className="w-3 h-3 inline mr-1" />{new Date(req.createdAt).toLocaleDateString()}</span>
                    {req.location && <span>📍 {req.location}</span>}
                    {req.aiMetadata?.estimatedQuote && (
                      <span className="text-primary-600 font-semibold">
                        Est. {formatRupees(req.aiMetadata.estimatedQuote.min)}–{formatRupees(req.aiMetadata.estimatedQuote.max)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
                {(quotes[req._id] || []).length > 0 && (
                  <div className="w-full border-t border-slate-100 pt-4 sm:col-span-2">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Provider quotes</p>
                    <div className="space-y-2">
                      {quotes[req._id].map(quote => (
                        <div key={quote._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                          <div><p className="text-sm font-bold text-slate-800">₹{quote.amount}</p><p className="text-xs text-slate-500">{quote.estimatedTime} · {quote.provider?.name || 'Provider'}</p></div>
                          {quote.status === 'PENDING' ? <div className="flex gap-2"><button onClick={() => decideQuote(quote, 'REJECTED')} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">Reject</button><button onClick={() => setBookingQuote(quote)} className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white">Accept & book</button></div> : <span className="text-xs font-bold text-slate-500">{quote.status}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {bookingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={bookQuote} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-extrabold text-slate-900">Schedule your service</h2>
            <input required type="date" min={new Date().toISOString().slice(0, 10)} value={scheduledDate} onChange={event => setScheduledDate(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <input required value={timeSlot} onChange={event => setTimeSlot(event.target.value)} placeholder="Time slot, e.g. 10:00 AM - 11:00 AM" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setBookingQuote(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancel</button><button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white">Confirm booking</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
