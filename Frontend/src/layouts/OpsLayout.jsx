import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Activity, Map, AlertTriangle, Settings } from 'lucide-react';

const OpsLayout = () => {
  const navItems = [
    { name: 'Live Map', path: '/ops', icon: Map },
    { name: 'Active Jobs', path: '/ops/jobs', icon: Activity },
    { name: 'Escalations', path: '/ops/escalations', icon: AlertTriangle },
    { name: 'Settings', path: '/ops/settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      roleTitle="Ops Manager"
      navItems={navItems}
      accentColorClass="text-indigo-500"
      accentBgClass="bg-indigo-500"
      accentTextClass="text-indigo-600"
    />
  );
};

export default OpsLayout;
