import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Menu, X, ShieldCheck, User } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-primary-800 to-primary-600 bg-clip-text text-transparent">
                CareConnect
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-primary-600 font-semibold -mt-1">
                Trusted Home Services
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
            <a href="#services" className="hover:text-primary-600 transition-colors">
              Services
            </a>
            <a href="#how-it-works" className="hover:text-primary-600 transition-colors">
              How It Works
            </a>
            <a href="#why-us" className="hover:text-primary-600 transition-colors">
              Why Us
            </a>
            <Link to="/provider" className="flex items-center gap-1.5 text-slate-700 hover:text-primary-600 transition-colors font-semibold">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              Join as Provider
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-primary-600 hover:border-primary-300 font-medium text-sm transition-all"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium text-sm shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/35 transition-all transform active:scale-95"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <a
            href="#services"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            Services
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            How It Works
          </a>
          <a
            href="#why-us"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            Why Us
          </a>
          <Link
            to="/provider"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-primary-600 hover:bg-primary-50 font-semibold"
          >
            Join as Provider
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium shadow-md shadow-primary-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
