import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Clock, 
  Wrench, 
  Zap, 
  Sparkles, 
  Thermometer, 
  Hammer, 
  Paintbrush, 
  ShieldAlert, 
  Tv, 
  ArrowRight,
  UserCheck,
  Award,
  DollarSign
} from 'lucide-react';

const categories = [
  {
    id: 'plumbing',
    title: 'Plumbing & Pipe Repair',
    desc: 'Leak repairs, drain cleaning, pipe fitting, and fixture installations.',
    icon: Wrench,
    badge: '24/7 Emergency',
    startingPrice: '₹499',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'electrical',
    title: 'Electrical Wiring & Upgrades',
    desc: 'Fault diagnosis, panel upgrades, lighting, and outlet installations.',
    icon: Zap,
    badge: 'Certified Electricians',
    startingPrice: '₹599',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'cleaning',
    title: 'Deep House Cleaning',
    desc: 'Full home sanitization, kitchen deep clean, and carpet washing.',
    icon: Sparkles,
    badge: 'Eco-Friendly',
    startingPrice: '₹799',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    popular: true,
  },
  {
    id: 'hvac',
    title: 'AC & Heating (HVAC)',
    desc: 'Seasonal AC maintenance, furnace repair, and duct cleaning.',
    icon: Thermometer,
    badge: 'Top Rated',
    startingPrice: '₹650',
    image: 'https://images.unsplash.com/photo-1631545806609-3f8d7e4c1b7b?auto=format&fit=crop&w=800&q=80',
    popular: false,
  },
  {
    id: 'carpentry',
    title: 'Carpentry & Furniture Assembly',
    desc: 'Custom cabinetry, door repair, and flat-pack furniture assembly.',
    icon: Hammer,
    badge: 'Master Craftsman',
    startingPrice: '₹450',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    popular: false,
  },
  {
    id: 'painting',
    title: 'Interior & Exterior Painting',
    desc: 'Wall painting, plaster repair, and exterior protective coating.',
    icon: Paintbrush,
    badge: 'Free Estimates',
    startingPrice: '₹999',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
    popular: false,
  },
  {
    id: 'pest-control',
    title: 'Pest Control Services',
    desc: 'Safe extermination for termites, rodents, insects, and garden pests.',
    icon: ShieldAlert,
    badge: 'Safe & Effective',
    startingPrice: '₹550',
    image: 'https://images.unsplash.com/photo-1587552248700-6c3b6f0b4b65?auto=format&fit=crop&w=800&q=80',
    popular: false,
  },
  {
    id: 'appliances',
    title: 'Appliance Servicing',
    desc: 'Refrigerator, washing machine, oven, and dishwasher repairs.',
    icon: Tv,
    badge: 'Same Day Available',
    startingPrice: '₹499',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    popular: false,
  },
];

const Home = () => {
  const [selectedService, setSelectedService] = useState('');
  const [zipCode, setZipCode] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedService || zipCode) {
      navigate(`/register?next=${encodeURIComponent(`/customer/new-request?service=${selectedService}`)}&zip=${encodeURIComponent(zipCode)}`);
    } else {
      navigate('/register?next=/customer/new-request');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[620px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-105 transition-transform duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/85 to-primary-950/80" />
        
        {/* Decorative ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center z-10">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>On-Demand Home Repair & Care Services Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Expert Home Services, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-teal-200 bg-clip-text text-transparent">
              Delivered Right To Your Doorstep
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Connect with background-checked plumbers, electricians, cleaners, and technicians in minutes. Transparent pricing & guaranteed quality.
          </p>

          {/* Search Box Card */}
          <div className="mt-10 max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl shadow-slate-950/50 border border-white/20">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              
              {/* Service Select / Input */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="What service do you need? (e.g. Plumbing, AC Repair)"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
                />
              </div>

              {/* Location Input */}
              <div className="w-full md:w-56 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Zip Code / City"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transition-all transform active:scale-95 shrink-0 flex items-center justify-center gap-2"
              >
                <span>Find Experts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-center gap-3 text-slate-300">
              <UserCheck className="w-5 h-5 text-primary-400" />
              <div className="text-left">
                <p className="text-base font-bold text-white leading-none">5,000+</p>
                <p className="text-xs text-slate-400">Verified Pros</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-300">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div className="text-left">
                <p className="text-base font-bold text-white leading-none">4.9 / 5</p>
                <p className="text-xs text-slate-400">12k+ Reviews</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-300">
              <ShieldCheck className="w-5 h-5 text-primary-400" />
              <div className="text-left">
                <p className="text-base font-bold text-white leading-none">100%</p>
                <p className="text-xs text-slate-400">Guaranteed Work</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 text-primary-400" />
              <div className="text-left">
                <p className="text-base font-bold text-white leading-none">&lt; 60 Mins</p>
                <p className="text-xs text-slate-400">Avg Arrival</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Categories Grid Section */}
      <section id="services" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">Our Offerings</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                Explore Popular Services
              </h2>
              <p className="text-slate-500 mt-2 text-base max-w-xl">
                Choose from our verified network of licensed professionals for any household maintenance or repair job.
              </p>
            </div>
            <Link 
              to="/register"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm group"
            >
              <span>View all 25+ services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.5), rgba(15,23,42,.05)), url('${cat.image}')` }} />
                  <div className="p-6 pt-4">
                  <div>
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-colors duration-300 shadow-sm">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                        {cat.badge}
                      </span>
                    </div>

                    {/* Title & Desc */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Bottom Row: Price & CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Starting from</span>
                      <span className="text-base font-extrabold text-slate-900">{cat.startingPrice}</span>
                    </div>
                    <Link
                      to={`/register?next=${encodeURIComponent(`/customer/new-request?service=${cat.id}`)}`}
                      className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-primary-600 text-slate-700 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">Seamless Experience</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              How CareConnect Works
            </h2>
            <p className="text-slate-500 mt-3 text-base">
              Get your home issues resolved in 3 easy steps with zero hassle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center relative group hover:border-primary-200 transition-colors">
              <div className="w-14 h-14 bg-primary-600 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary-500/20 group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Request a Service</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Choose your needed service, describe the issue, and pick a convenient time slot that fits your schedule.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center relative group hover:border-primary-200 transition-colors">
              <div className="w-14 h-14 bg-primary-600 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary-500/20 group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Match with Verified Expert</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our smart matching engine instantly assigns a top-rated, background-checked professional near you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center relative group hover:border-primary-200 transition-colors">
              <div className="w-14 h-14 bg-primary-600 text-white font-extrabold text-xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary-500/20 group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Service & Safe Payment</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Track your provider in real-time. Inspect completed work and pay securely via online payment or card.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">Why We Stand Out</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Built on Trust, Quality & Safety
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              We eliminate the guesswork from home maintenance so you can enjoy peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/80 hover:border-primary-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Rigorous Vetting</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every provider undergoes strict criminal background checks, license verification, and skill evaluations.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/80 hover:border-primary-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Upfront Transparent Pricing</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Know the exact cost before booking. No surprise extra fees or hidden charges after completion.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/80 hover:border-primary-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Quality Guarantee</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Not satisfied with the job? Our CareConnect Guarantee ensures we fix it or refund your payment.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/80 hover:border-primary-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">24/7 Rapid Response</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Emergency burst pipe or power failure? Dispatch emergency care experts to your location at any hour.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* For Customers */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-primary-600/20 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
                  For Homeowners & Renters
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  Need a home service today?
                </h3>
                <p className="text-primary-100 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                  Book certified plumbers, electricians, or cleaners in less than 2 minutes and experience hassle-free service.
                </p>
              </div>
              <div>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-primary-800 font-bold text-sm rounded-xl hover:bg-primary-50 shadow-md transition-all transform active:scale-95"
                >
                  <span>Book a Service Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* For Providers */}
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-950/20 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-primary-400 mb-4">
                  For Professionals & Contractors
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  Are you a skilled service provider?
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                  Join the CareConnect Provider Network. Grow your client base, manage schedules, and boost your monthly revenue.
                </p>
              </div>
              <div>
                <Link
                  to="/register?role=provider"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm rounded-xl shadow-md transition-all transform active:scale-95"
                >
                  <span>Join as a Provider</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
