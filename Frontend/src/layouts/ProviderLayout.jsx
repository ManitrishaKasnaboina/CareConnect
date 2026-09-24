import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Home, Search, ClipboardList, Settings, MapPinned } from 'lucide-react';

const ProviderLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/provider', icon: Home },
    { name: 'Find Jobs', path: '/provider/jobs', icon: Search },
    { name: 'My Quotes', path: '/provider/quotes', icon: ClipboardList },
    { name: 'Live Location', path: '/provider/location', icon: MapPinned },
    { name: 'Settings', path: '/provider/settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      roleTitle="Provider"
      navItems={navItems}
      accentColorClass="text-orange-500"
      accentBgClass="bg-gradient-to-r from-orange-500 to-amber-500"
      accentTextClass="text-orange-600"
    />
  );
};

export default ProviderLayout;
