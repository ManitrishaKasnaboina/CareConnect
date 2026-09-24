import React, { useEffect, useState } from 'react';
import { getMyBookings, rateBooking } from '../../api/services';
import { CalendarCheck, Clock, MapPin, User, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import LiveMap from '../../components/LiveMap';
import { formatRupees } from '../../utils/currency';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  CONFIRMED:   { label: 'Confirmed',  color: 'text-blue-600 bg-blue-50 border-blue-200',     icon: CalendarCheck },
  PENDING:     { label: 'Scheduled',  color: 'text-blue-600 bg-blue-50 border-blue-200',     icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  COMPLETED:   { label: 'Completed',  color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  CANCELLED:   { label: 'Cancelled',  color: 'text-red-600 bg-red-50 border-red-200',         icon: XCircle },
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [ratingBooking, setRatingBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    getMyBookings()
      .then(res => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => !['COMPLETED','CANCELLED'].includes(b.status));
  const past     = bookings.filter(b =>  ['COMPLETED','CANCELLED'].includes(b.status));
  const displayed = tab === 'upcoming' ? upcoming : past;

  const submitRating = async (event) => {
    event.preventDefault();
    try {
      await rateBooking(ratingBooking._id, rating, review);
      setBookings(current => current.map(booking => booking._id === ratingBooking._id
        ? { ...booking, customerRating: rating, customerReview: review }
        : booking));
      setRatingBooking(null);
      setReview('');
      toast.success('Thanks for rating your provider.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit rating.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">Track your scheduled and past service appointments.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'past',     label: `Past (${past.length})` },
        ].map(t => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all
              ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 flex flex-col items-center gap-3 text-slate-400">
          <CalendarCheck className="w-10 h-10 text-slate-200" />
          <p className="text-sm font-medium">
            {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map(booking => {
            const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = cfg.icon;
            const providerName = booking.provider?.name || booking.provider?.user?.name || 'Provider';
            const serviceDate = booking.scheduledDate
              ? `${new Date(booking.scheduledDate).toLocaleDateString()}${booking.timeSlot ? ` · ${booking.timeSlot}` : ''}`
              : 'To be scheduled';

            const coordinates = booking.request?.locationCoordinates;
            const hasMapLocation = Number.isFinite(coordinates?.lat) && Number.isFinite(coordinates?.lng);

            return (
              <div key={booking._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900">
                        {booking.request?.aiMetadata?.categoryName || 'Service Booking'}
                      </h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>

                    {booking.request?.description && (
                      <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                        {booking.request.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {providerName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {serviceDate}
                      </span>
                      {booking.request?.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {booking.request.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {booking.quote?.amount && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">Total Cost</p>
                      <p className="text-xl font-extrabold text-slate-900">{formatRupees(booking.quote.amount)}</p>
                    </div>
                  )}
                </div>
                {booking.status === 'COMPLETED' && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    {booking.customerRating ? (
                      <p className="text-sm font-semibold text-amber-600">Your rating: {'★'.repeat(booking.customerRating)}{'☆'.repeat(5 - booking.customerRating)}</p>
                    ) : (
                      <button onClick={() => setRatingBooking(booking)} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600">Rate provider</button>
                    )}
                  </div>
                )}
                {tab === 'upcoming' && hasMapLocation && (
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900">Live provider tracking</h4>
                        <p className="text-xs text-slate-500">The provider appears when they start sharing their route.</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-primary-500" />
                    </div>
                    <LiveMap
                      jobId={booking._id}
                      initialLat={coordinates.lat}
                      initialLng={coordinates.lng}
                      customerLocation={coordinates}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form onSubmit={submitRating} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-extrabold text-slate-900">Rate your provider</h2>
            <select value={rating} onChange={event => setRating(Number(event.target.value))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
              {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} out of 5 stars</option>)}
            </select>
            <textarea value={review} onChange={event => setReview(event.target.value)} maxLength={500} rows={4} placeholder="Share a short review (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setRatingBooking(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">Cancel</button><button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white">Submit rating</button></div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
