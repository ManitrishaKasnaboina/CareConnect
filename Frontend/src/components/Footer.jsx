import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                CareConnect
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              CareConnect is your premier on-demand platform connecting homeowners and businesses with verified, top-tier home service professionals. Quality care, guaranteed.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-primary-400" />
                <span>Verified Professionals</span>
              </div>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Popular Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#services" className="hover:text-primary-400 transition-colors">Plumbing & Leak Fix</a></li>
              <li><a href="#services" className="hover:text-primary-400 transition-colors">Electrical Repairs</a></li>
              <li><a href="#services" className="hover:text-primary-400 transition-colors">House Deep Cleaning</a></li>
              <li><a href="#services" className="hover:text-primary-400 transition-colors">HVAC & AC Service</a></li>
              <li><a href="#services" className="hover:text-primary-400 transition-colors">Carpentry & Assembly</a></li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a></li>
              <li><Link to="/provider" className="hover:text-primary-400 transition-colors">Become a Provider</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Customer Portal</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact Us</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                <span>support@careconnect.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                <span>+1 (800) 555-CARE</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                <span>100 Innovation Way, Suite 400<br />San Francisco, CA 94105</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CareConnect Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
