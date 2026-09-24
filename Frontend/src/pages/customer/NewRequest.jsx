import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createServiceRequest } from '../../api/services';
import { toast } from 'react-toastify';
import {
  ArrowRight, ArrowLeft, MapPin, FileText, LocateFixed,
  Sparkles, CheckCircle2, Loader2,
  Wrench, Zap, Droplets, Thermometer, Hammer, Paintbrush, Bug, Tv2
} from 'lucide-react';

const STEPS = ['Describe Issue', 'Add Location', 'Review & Submit'];

const SERVICE_ICONS = {
  Plumbing: Droplets, Electrical: Zap, Cleaning: Sparkles,
  HVAC: Thermometer, Carpentry: Hammer, Painting: Paintbrush,
  'Pest Control': Bug, Appliances: Tv2, Other: Wrench
};

const SERVICE_MEDIA = {
  Plumbing: {
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Trusted plumbing help for leaks, drains, and repairs',
  },
  Electrical: {
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
    caption: 'Qualified electricians for safer homes',
  },
  Cleaning: {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    caption: 'A fresh, comfortable home starts here',
  },
  HVAC: {
    image: 'https://images.unsplash.com/photo-1631545806609-3f8d7e4c1b7b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Fast AC and climate-care support',
  },
  Carpentry: {
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Skilled hands for furniture and woodwork',
  },
  Painting: {
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80',
    caption: 'Bring your walls back to life',
  },
  'Pest Control': {
    image: 'https://images.unsplash.com/photo-1587552248700-6c3b6f0b4b65?auto=format&fit=crop&w=1200&q=80',
    caption: 'Effective care for a healthier home',
  },
  Appliances: {
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80',
    caption: 'Keep essential appliances working smoothly',
  },
  Other: {
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    caption: 'Tell us what your home needs',
  },
};

const CATEGORIES = [
  { value: 'Plumbing', label: 'Plumbing', image: SERVICE_MEDIA.Plumbing.image },
  { value: 'Electrical', label: 'Electrical', image: SERVICE_MEDIA.Electrical.image },
  { value: 'Cleaning', label: 'Cleaning', image: SERVICE_MEDIA.Cleaning.image },
  { value: 'HVAC', label: 'AC & Heating (HVAC)', image: SERVICE_MEDIA.HVAC.image },
  { value: 'Carpentry', label: 'Carpentry', image: SERVICE_MEDIA.Carpentry.image },
  { value: 'Painting', label: 'Painting', image: SERVICE_MEDIA.Painting.image },
  { value: 'Pest Control', label: 'Pest Control Services', image: SERVICE_MEDIA['Pest Control'].image },
  { value: 'Appliances', label: 'Appliances', image: SERVICE_MEDIA.Appliances.image },
  { value: 'Other', label: 'Other', image: SERVICE_MEDIA.Other.image },
];

const NewRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service') || '';
  const normalizedService = requestedService.replace(/-/g, ' ');
  const initialCategory = CATEGORIES.find(category => (
    category.value.toLowerCase() === normalizedService.toLowerCase()
    || category.label.toLowerCase() === normalizedService.toLowerCase()
  ))?.value || '';
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const locationWatchId = useRef(null);
  const [form, setForm] = useState({
    description: '',
    category: initialCategory,
    location: '',
    locationCoordinates: null,
    urgency: 'normal',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const stopSharingLocation = () => {
    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
    setSharingLocation(false);
  };

  useEffect(() => () => stopSharingLocation(), []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported by this browser.');
      return;
    }

    if (sharingLocation) {
      stopSharingLocation();
      return;
    }

    setLocating(true);
    const updateLocation = ({ coords }) => {
      const locationCoordinates = { lat: coords.latitude, lng: coords.longitude };
      setForm(prev => ({
        ...prev,
        locationCoordinates,
        location: prev.location || `Current location (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`,
      }));
    };

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        updateLocation({ coords });
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`);
          const data = await response.json();
          if (data.display_name) update('location', data.display_name);
        } catch {
          // Coordinates are still saved when reverse geocoding is unavailable.
        }
        locationWatchId.current = navigator.geolocation.watchPosition(updateLocation, () => {
          toast.error('Location updates stopped. Your last shared location is still saved.');
          stopSharingLocation();
        }, { enableHighAccuracy: true, maximumAge: 60000 });
        setLocating(false);
        setSharingLocation(true);
        toast.success('Current location sharing is on.');
      },
      () => {
        setLocating(false);
        toast.error('Location permission is required to enable map tracking.');
      },
      { enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await createServiceRequest({
        description: form.description,
        category: form.category || undefined,
        location: form.location,
        locationCoordinates: form.locationCoordinates,
        urgency: form.urgency,
      });
      toast.success('Service request submitted successfully!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMedia = SERVICE_MEDIA[form.category] || SERVICE_MEDIA.Other;
  const mapLocation = form.locationCoordinates;
  const mapDelta = 0.01;
  const mapUrl = mapLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapLocation.lng - mapDelta}%2C${mapLocation.lat - mapDelta}%2C${mapLocation.lng + mapDelta}%2C${mapLocation.lat + mapDelta}&layer=mapnik&marker=${mapLocation.lat}%2C${mapLocation.lng}`
    : '';

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl">
        <div
          className="relative h-56 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(6,78,59,.88), rgba(6,78,59,.35)), url('${selectedMedia.image}')` }}
        >
          <div className="flex h-full items-center justify-center text-center text-white">
            <div>
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-200" />
              <h1 className="mt-4 text-3xl font-extrabold">Request booked successfully</h1>
              <p className="mt-2 text-sm text-emerald-100">We are matching you with a verified {form.category || 'home service'} professional.</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 p-6 text-center sm:p-8">
          <div className="rounded-2xl bg-emerald-50 p-4 text-left text-sm text-emerald-800">
            <p className="font-bold">What happens next?</p>
            <p className="mt-1">Providers will review your request and you can track replies from your requests page.</p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/customer/requests" className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700">View my requests</Link>
            <Link to="/customer" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl">
        <div
          className="relative min-h-52 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.88), rgba(15,23,42,.3)), url('${selectedMedia.image}')` }}
        >
          <div className="relative max-w-xl px-6 py-8 text-white sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-200">CareConnect booking</p>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">Create a service request</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{selectedMedia.caption}. Describe the issue and we will match you with the right expert.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="space-y-8">

      {/* Step Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-slate-100 text-slate-400'}`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-slate-900' : 'text-slate-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-primary-600' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Describe Issue */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Describe Your Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={5}
              placeholder="e.g. My kitchen sink is leaking badly under the cabinet and water is pooling on the floor..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              <Sparkles className="w-3 h-3 inline mr-1 text-primary-500" />
              Our AI will automatically classify your request from your description.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Service Category <span className="text-slate-400 font-normal">(Optional – AI will auto-detect)</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = SERVICE_ICONS[cat.value] || Wrench;
                return (
                  <button
                    key={cat.value}
                    id={`category-${cat.value.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => update('category', form.category === cat.value ? '' : cat.value)}
                    style={cat.image ? { backgroundImage: `linear-gradient(rgba(15,23,42,.6), rgba(15,23,42,.6)), url('${cat.image}')` } : undefined}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all
                      ${cat.image ? 'bg-cover bg-center text-white border-slate-500' : ''}
                      ${form.category === cat.value
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : cat.image
                          ? 'hover:border-primary-300'
                          : 'border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-slate-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Urgency Level</label>
            <div className="flex gap-3">
              {[
                { val: 'normal', label: 'Normal', desc: 'Within 24–48 hrs', color: 'text-blue-600 bg-blue-50 border-blue-300' },
                { val: 'urgent', label: 'Urgent',  desc: 'Within a few hrs',  color: 'text-amber-600 bg-amber-50 border-amber-300' },
                { val: 'emergency', label: 'Emergency', desc: 'ASAP / 24-7', color: 'text-red-600 bg-red-50 border-red-300' },
              ].map(u => (
                <button
                  key={u.val}
                  id={`urgency-${u.val}`}
                  type="button"
                  onClick={() => update('urgency', u.val)}
                  className={`flex-1 p-3 rounded-xl border text-xs font-semibold transition-all
                    ${form.urgency === u.val ? u.color + ' border-2' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  <div className="font-bold">{u.label}</div>
                  <div className="font-normal opacity-70 mt-0.5">{u.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Service Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={e => update('location', e.target.value)}
                placeholder="123 Main Street, City, State, ZIP"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className={`mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${sharingLocation ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100' : 'border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
            >
              <LocateFixed className={`h-4 w-4 ${locating || sharingLocation ? 'animate-pulse' : ''}`} />
              {locating ? 'Finding your current location...' : sharingLocation ? 'Stop sharing location' : 'Share my current location'}
            </button>
            {form.locationCoordinates && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {sharingLocation ? 'Sharing live location while this request is open' : 'Current location saved for provider tracking'}
              </p>
            )}
            {mapUrl && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                <iframe title="Selected service location" src={mapUrl} className="h-56 w-full border-0" loading="lazy" />
                <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  <span>Service location selected on map</span>
                </div>
              </div>
            )}
          </div>

          {/* Summary so far */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Request Summary</p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 leading-snug">{form.description || '—'}</p>
              </div>
              {form.category && (
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700">{form.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-slate-900">Review Your Request</h3>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 space-y-3">
            {[
              { label: 'Description',  val: form.description },
              { label: 'Category',     val: form.category || 'AI will auto-detect' },
              { label: 'Location',     val: form.location },
              { label: 'Urgency',      val: form.urgency.charAt(0).toUpperCase() + form.urgency.slice(1) },
            ].map(item => (
              <div key={item.label} className="flex gap-3">
                <span className="text-xs font-bold text-primary-600 w-24 shrink-0 pt-0.5">{item.label}</span>
                <span className="text-sm text-slate-700">{item.val}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">AI Matching Active</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Our system will analyze your description, auto-classify the issue, and match you with the best available provider.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="back-btn"
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/customer')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            id="next-btn"
            onClick={() => setStep(s => s + 1)}
            disabled={step === 0 && !form.description.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-md shadow-primary-600/20 transition-all active:scale-95"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="submit-request-btn"
            onClick={handleSubmit}
            disabled={submitting || !form.location.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-primary-600/20 transition-all active:scale-95"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        )}
      </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url('${selectedMedia.image}')` }} />
            <div className="space-y-3 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Booking summary</p>
              <div>
                <p className="text-sm font-bold text-slate-900">{form.category || 'Home service'}</p>
                <p className="mt-1 text-xs text-slate-500">{form.urgency.charAt(0).toUpperCase() + form.urgency.slice(1)} priority</p>
              </div>
              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">{form.location || 'Service address pending'}</p>
                <p className="mt-1">{form.description ? `${form.description.slice(0, 72)}${form.description.length > 72 ? '...' : ''}` : 'Your issue description will appear here.'}</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Verified professionals
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NewRequest;
