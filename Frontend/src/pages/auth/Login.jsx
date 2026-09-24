import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { HeartHandshake, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsSubmitting(true);
    try {
      const user = await googleLogin(tokenResponse.access_token);
      toast.success(`Welcome, ${user.name}!`);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'PROVIDER') navigate('/provider');
      else navigate('/customer');
    } catch (err) {
      toast.error('Google login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google login failed.'),
  });

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const googleConfigured = Boolean(googleClientId && !googleClientId.startsWith('replace-with-'));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on user role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'PROVIDER') {
        navigate('/provider');
      } else {
        navigate(new URLSearchParams(location.search).get('next') || '/customer');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 relative shadow-2xl">
        <div className="mx-auto w-full max-w-sm lg:w-96 space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-12 h-12 bg-linear-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-7 h-7" />
              </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your CareConnect portal
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-primary-500'
                  } rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Password
                </label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-primary-500'
                  } rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-linear-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            {/* Divider */}
            <div className="relative flex items-center justify-center mt-6 mb-6">
              <div className="border-t border-slate-200 w-full"></div>
              <div className="bg-white px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider absolute">
                Or continue with
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => googleConfigured ? loginWithGoogle() : toast.error('Google sign-in is not configured yet.')}
              disabled={isSubmitting || !googleConfigured}
              className="w-full py-3.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
              Create an account
            </Link>
          </div>

        </div>
      </div>

      {/* Right side: Live Image Background */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-linear-to-br from-primary-600/90 to-slate-900/90 z-10 animate-gradient-x mix-blend-multiply"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover animate-kenburns opacity-60"
          src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop"
          alt="Beautiful home interior"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20 p-12 text-center">
           <div className="max-w-xl text-white space-y-6">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center border border-white/20 mb-8">
               <HeartHandshake className="w-10 h-10 text-primary-200" />
             </div>
             <h2 className="text-5xl font-extrabold tracking-tight">Your Home, Better.</h2>
             <p className="text-lg text-primary-100/90 font-medium leading-relaxed">
               Connect with top-rated home service professionals for everything from repairs and cleaning to everyday care.
             </p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Login;
