import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { Shield, Menu, X, User, LogOut, LayoutDashboard, MapPin, Search, FileText, ChevronDown, Sun, Moon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isOfficer } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isOfficer) return '/officer';
    return '/seller';
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: null },
    { path: '/marketplace', label: 'Marketplace', icon: MapPin },
    { path: '/verify', label: 'Verify Land', icon: Search },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-emerald-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-blue-900 leading-tight block">CamLand</span>
              <span className="text-[10px] text-gray-500 leading-none block -mt-0.5">Digital Registry</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </span>
              </Link>
            ))}
            {user && (
              <Link
                to="/register-land"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/register-land')
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Register Land
                </span>
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500 capitalize leading-tight">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/register-land"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Register Land
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?tab=register"
                  className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-blue-50 text-blue-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  to="/register-land"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Register Land
                </Link>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
