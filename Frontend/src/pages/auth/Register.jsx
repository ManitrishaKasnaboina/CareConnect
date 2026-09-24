import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { HeartHandshake, User, Mail, Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const Register = () => {
  const { register: registerAuth, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');

  const handleGoogleSuccess = async (tokenResponse) => {
    setIsSubmitting(true);
    try {
      const user = await googleLogin(tokenResponse.access_token, selectedRole);
      toast.success(`Welcome to CareConnect, ${user.name}!`);
      if (user.role === 'PROVIDER') navigate('/provider');
      else navigate('/customer');
    } catch (err) {
      toast.error('Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in failed.'),
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && roleParam.toUpperCase() === 'PROVIDER') {
      setSelectedRole('PROVIDER');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: selectedRole,
    },
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await registerAuth(data.name, data.email, data.password, selectedRole);
      toast.success(`Account created! Welcome to CareConnect, ${user.name}.`);

      if (user.role === 'PROVIDER') {
        navigate('/provider');
      } else {
        navigate(searchParams.get('next') || '/customer');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 relative shadow-2xl overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-[400px] space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 group mb-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-7 h-7" />
              </div>
            </Link>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Join CareConnect to book or offer expert home services
            </p>
          </div>

          {/* Role Selection Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleRoleChange('CUSTOMER')}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'CUSTOMER'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>I Need Services</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('PROVIDER')}
              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'PROVIDER'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>I'm a Provider</span>
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.name ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-primary-500'
                  } rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
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
              className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
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
              onClick={() => registerWithGoogle()}
              disabled={isSubmitting}
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
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </div>

        </div>
      </div>

      {/* Right side: Live Image Background */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-700/80 to-slate-900/90 z-10 animate-gradient-x mix-blend-multiply"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover animate-kenburns opacity-70"
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop"
          alt="Home cleaning service"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20 p-12 text-center">
           <div className="max-w-xl text-white space-y-6">
             <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center border border-white/20 mb-8">
               <ShieldCheck className="w-10 h-10 text-primary-200" />
             </div>
             <h2 className="text-5xl font-extrabold tracking-tight">Start Your Journey</h2>
             <p className="text-lg text-primary-100/90 font-medium leading-relaxed">
               Join our community today to find trusted home service experts, or sign up to offer your own professional skills to homes nearby.
             </p>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Register;
