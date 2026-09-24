import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, LogOut, X, Mail, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { useSocket } from '../context/SocketContext';

const DashboardLayout = ({ roleTitle, navItems, accentColorClass, accentBgClass, accentTextClass }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { notifications, clearNotifications } = useSocket();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ed_0%,#eef6ff_40%,#f8fafc_100%)] flex overflow-hidden text-slate-800">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 text-white border-r border-white/10 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl shadow-slate-900/20",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg", accentBgClass)}>
              C
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight">CareConnect</div>
            </div>
          </Link>
          <button className="lg:hidden text-slate-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className={clsx("text-[11px] font-bold uppercase tracking-[0.22em] mb-4 opacity-80", accentTextClass)}>
            {roleTitle} Portal
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-3 rounded-2xl font-medium text-sm transition-all duration-200",
                    isActive
                      ? clsx(accentBgClass, "text-white shadow-lg ring-1 ring-white/10")
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-2xl font-medium text-sm text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-70" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <header className="h-20 bg-white/75 backdrop-blur-xl border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0">
          <button
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <button
              onClick={() => setNotificationsOpen(open => !open)}
              aria-label="Open notifications"
              className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>

            {notificationsOpen && (
              <div className="absolute right-20 top-16 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  {notifications.length > 0 && <button onClick={clearNotifications} className="text-xs font-semibold text-primary-600">Clear</button>}
                </div>
                {notifications.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-slate-400">No new booking updates.</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="flex gap-3 border-b border-slate-50 px-2 py-3 last:border-0">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <div><p className="text-xs font-semibold text-slate-700">{notification.message}</p><p className="mt-1 text-[11px] text-slate-400">Booking status: {notification.booking?.status || 'Updated'}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-8 w-px bg-slate-200 mx-1" />

            <button onClick={() => setProfileOpen(true)} aria-label="Open profile details" className="flex items-center gap-3 cursor-pointer group text-left">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-700 leading-tight">{user?.name || 'User'}</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{roleTitle}</div>
              </div>
              <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform", accentBgClass)}>
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>
          </div>
        </header>

        {profileOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setProfileOpen(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={event => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white", accentBgClass)}>{user?.name?.charAt(0) || 'U'}</div>
                  <div><h2 className="font-extrabold text-slate-900">{user?.name || 'User'}</h2><p className="text-xs uppercase tracking-wider text-slate-400">{roleTitle}</p></div>
                </div>
                <button onClick={() => setProfileOpen(false)} aria-label="Close profile details" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-3 py-5 text-sm">
                <p className="flex items-center gap-3 text-slate-600"><Mail className="h-4 w-4 text-slate-400" />{user?.email || 'Email unavailable'}</p>
                <p className="flex items-center gap-3 text-slate-600"><ShieldCheck className="h-4 w-4 text-slate-400" />{user?.role || roleTitle}</p>
              </div>
              <button onClick={() => setProfileOpen(false)} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">Close</button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f5f7fb]">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
