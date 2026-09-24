import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Home, ClipboardList, CalendarCheck, Settings } from 'lucide-react';

const CustomerLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/customer', icon: Home },
    { name: 'My Requests', path: '/customer/requests', icon: ClipboardList },
    { name: 'Bookings', path: '/customer/bookings', icon: CalendarCheck },
    { name: 'Settings', path: '/customer/settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      roleTitle="Customer"
      navItems={navItems}
      accentColorClass="text-emerald-500"
      accentBgClass="bg-emerald-500"
      accentTextClass="text-emerald-600"
    />
  );
};

export default CustomerLayout;

