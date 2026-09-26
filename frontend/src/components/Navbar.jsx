import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Shield,
  Syringe,
  Activity,
  PhoneCall,
  ShoppingBag,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Lock,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
      isActive
        ? 'bg-slate-100 text-slate-900 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-slate-100 text-slate-900 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 fill-current text-sky-400" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                Woffy
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                Health OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Dashboard
                </NavLink>
                <NavLink to="/pet-profiles" className={navLinkClass}>
                  <Shield className="w-4 h-4 text-amber-600" />
                  My Pets
                </NavLink>
                <NavLink to="/vaccinations" className={navLinkClass}>
                  <Syringe className="w-4 h-4 text-blue-600" />
                  Vaccines
                </NavLink>
                <NavLink to="/records" className={navLinkClass}>
                  <Activity className="w-4 h-4 text-purple-600" />
                  Records
                </NavLink>
              </>
            )}
            <NavLink to="/services/rescue" className={navLinkClass}>
              <PhoneCall className="w-4 h-4 text-red-500" />
              Rescue Helpline
            </NavLink>
            <NavLink to="/shop" className={navLinkClass}>
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              Shop
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                <Lock className="w-4 h-4 text-indigo-600" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/create-pet-profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                  Add Pet
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden"
                    title="Account options"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs border border-slate-200">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        Dashboard
                      </Link>
                      <Link
                        to="/pet-profiles"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Shield className="w-3.5 h-3.5 text-sky-600" />
                        My Pets
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Profile Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Admin Portal
                        </Link>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/create-pet-profile"
                className="p-1.5 rounded-lg bg-slate-900 text-white"
                title="Add Pet"
              >
                <PlusCircle className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
            Home
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/pet-profiles" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                My Pets
              </NavLink>
              <NavLink to="/vaccinations" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Vaccinations
              </NavLink>
              <NavLink to="/records" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Health Records
              </NavLink>
              <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
                Settings
              </NavLink>
            </>
          ) : null}
          <NavLink to="/services/rescue" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
            Rescue Directory
          </NavLink>
          <NavLink to="/shop" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
            Pet Shop
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
              Admin Portal
            </NavLink>
          )}

          <div className="pt-3 border-t border-gray-200 mt-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.fullName})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-lg bg-amber-500 text-white font-medium text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
