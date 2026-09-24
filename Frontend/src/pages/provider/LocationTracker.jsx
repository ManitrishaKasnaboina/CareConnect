import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Radio, ShieldCheck } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useSocket } from '../../context/SocketContext';
import { getProviderBookings } from '../../api/services';

const LocationTracker = () => {
  const { socket, isConnected } = useSocket();
  const [bookings, setBookings] = useState([]);
  const [jobId, setJobId] = useState('');
  const [sharing, setSharing] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getProviderBookings()
      .then(({ data }) => {
        const activeBookings = data.filter(booking => ['CONFIRMED', 'IN_PROGRESS'].includes(booking.status));
        setBookings(activeBookings);
        if (activeBookings[0]) setJobId(activeBookings[0]._id);
      })
      .catch(() => setError('Unable to load your active bookings.'));
  }, []);

  useEffect(() => {
    if (!sharing || !socket || !isConnected || !jobId) return undefined;
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.');
      setSharing(false);
      return undefined;
    }

    socket.emit('join', `job_${jobId}`);

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const nextLocation = { lat: coords.latitude, lng: coords.longitude };
        setLocation(nextLocation);
        socket.emit('updateLocation', { jobId: `job_${jobId}`, ...nextLocation });
      },
      () => setError('Location permission is required to share your route.'),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (socket) {
        socket.emit('leave', `job_${jobId}`);
      }
    };
  }, [jobId, sharing, socket, isConnected]);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_38%,#f59e0b_100%)] p-px shadow-xl">
        <div className="rounded-[27px] bg-white/90 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">Live tracking</p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Live location</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure trip sharing
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600">Share your route so the customer and operations team can follow your arrival in real time.</p>

          <div className="mt-6 grid gap-5 md:grid-cols-[1.5fr_0.7fr]">
            <label className="block text-sm font-semibold text-slate-700">
              Active booking
              <select
                value={jobId}
                onChange={(event) => setJobId(event.target.value)}
                disabled={sharing}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-orange-400 focus:bg-white"
              >
                {bookings.length === 0 && <option value="">No active bookings</option>}
                {bookings.map(booking => <option key={booking._id} value={booking._id}>{booking.request?.aiMetadata?.categoryName || 'Service booking'} · {booking.customer?.name || 'Customer'}</option>)}
              </select>
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {isConnected ? 'Connected' : 'Offline'}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {isConnected ? 'Real-time connection ready' : 'Waiting for real-time connection'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setError('');
                setSharing((current) => !current);
              }}
              disabled={!isConnected || !jobId}
              className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:shadow-orange-500/35 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sharing ? <Radio className="h-4 w-4 animate-pulse" /> : <Navigation className="h-4 w-4" />}
              {sharing ? 'Stop sharing location' : 'Start sharing location'}
            </button>

            {location && (
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-orange-500" />
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </div>
            )}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 shadow-inner h-80 relative bg-slate-100">
            {import.meta.env.VITE_GOOGLE_MAPS_API_KEY && !import.meta.env.VITE_GOOGLE_MAPS_API_KEY.startsWith('replace-') ? (
              <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultZoom={13}
                  center={location || { lat: 12.9716, lng: 77.5946 }}
                  mapId="careconnect_tracker_map"
                  disableDefaultUI={true}
                >
                  {location && (
                    <AdvancedMarker position={location}>
                      <Pin background={'#f97316'} borderColor={'#c2410c'} glyphColor={'#fff'} />
                    </AdvancedMarker>
                  )}
                  {jobId && bookings.find(b => b._id === jobId)?.request?.locationCoordinates && (
                    <AdvancedMarker position={bookings.find(b => b._id === jobId).request.locationCoordinates}>
                      <Pin background={'#3b82f6'} borderColor={'#1d4ed8'} glyphColor={'#fff'} />
                    </AdvancedMarker>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="absolute inset-0 bg-[#e5e7eb] overflow-hidden">
                <iframe
                  title="demo-map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=77.53%2C12.93%2C77.67%2C13.03&layer=mapnik"
                  className="absolute inset-0 opacity-60 grayscale pointer-events-none"
                />
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 20,60 Q 40,20 60,50 T 80,30" fill="none" stroke="#f97316" strokeWidth="0.5" strokeDasharray="1 1" className="animate-pulse" />
                </svg>

                <div className="absolute left-[20%] top-[60%] -translate-x-1/2 -translate-y-full z-10">
                  <div className="relative">
                    {sharing && <div className="absolute -inset-4 bg-orange-500/30 rounded-full animate-ping" />}
                    <MapPin className="w-10 h-10 text-orange-500 fill-orange-500 relative z-10 drop-shadow-md" />
                  </div>
                  <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xl">You</div>
                </div>
                
                <div className="absolute left-[80%] top-[30%] -translate-x-1/2 -translate-y-full z-10">
                  <div className="relative">
                    <MapPin className="w-10 h-10 text-blue-600 fill-blue-600 drop-shadow-md" />
                  </div>
                  <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xl">Customer</div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md text-white text-[11px] px-4 py-2 rounded-full font-medium shadow-lg flex items-center gap-2 whitespace-nowrap z-20">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Demo map (Add Google Maps API Key in .env for live tracking)
                </div>
              </div>
            )}
            
            {!sharing && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-30 transition-all">
                <div className="text-center bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-[260px]">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Map is offline</p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Click 'Start sharing location' to begin route tracking.</p>
                </div>
              </div>
            )}
          </div>

          {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LocationTracker;