import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, LogOut, User, LayoutDashboard, MapPin, Calendar, Settings, Users, Grid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const userLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/find-parking', label: 'Find Parking', icon: MapPin },
    { path: '/my-bookings', label: 'My Bookings', icon: Calendar },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/parking-lots', label: 'Parking Lots', icon: MapPin },
    { path: '/admin/slots', label: 'Slots', icon: Grid },
    { path: '/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/admin/analytics', label: 'Analytics', icon: Settings },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-lg"
            >
              <Car className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ParkEase
            </span>
          </Link>

          {user && (
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.path} to={link.path}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${isActive(link.path)
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{link.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-slate-50 dark:bg-gray-700 rounded-lg">
                  <User className="h-4 w-4 text-slate-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-200">{user?.full_name}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                      ADMIN
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.nav >
  );
}
