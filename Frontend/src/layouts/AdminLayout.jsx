import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { LayoutDashboard, Users, Grid, Settings } from 'lucide-react';

const AdminLayout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: Grid },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <DashboardLayout
      roleTitle="Platform Admin"
      navItems={navItems}
      accentColorClass="text-primary-500"
      accentBgClass="bg-primary-500"
      accentTextClass="text-primary-600"
    />
  );
};

export default AdminLayout;
