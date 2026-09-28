import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Shield,
  Syringe,
  Activity,
  PhoneCall,
  ShoppingBag,
  PlusCircle,
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
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'text-blue-600 font-semibold'
        : 'text-slate-600 hover:text-blue-600'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-600 font-semibold'
        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo - Woofy. */}
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900 group-hover:opacity-95 transition-opacity font-sans">
              Woofy<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <a href="#services" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Services
            </a>
            <a href="#why-us" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Why Us
            </a>
            <NavLink to="/shop" className={navLinkClass}>
              Pet Shop
            </NavLink>
            <a href="#contact" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Contact Us
            </a>

            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/pet-profiles" className="px-3 py-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  My Pets
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink to="/admin" className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <Lock className="w-4 h-4" />
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-white" />
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
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Administrator
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        Dashboard
                      </Link>
                      <Link
                        to="/pet-profiles"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        My Pets
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-500" />
                        Profile Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          Admin Portal
                        </Link>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-normal text-sm hover:bg-slate-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-all hover:shadow-md active:scale-98"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/create-pet-profile"
                className="p-2 rounded-xl bg-blue-600 text-white shadow-sm"
                title="Add Pet"
              >
                <PlusCircle className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 px-4 pt-2 pb-5 space-y-1 bg-white shadow-xl">
          <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
            Home
          </NavLink>
          <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600">
            Services
          </a>
          <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600">
            Why Us
          </a>
          <NavLink to="/shop" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
            Pet Shop
          </NavLink>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600">
            Contact Us
          </a>

          {isAuthenticated ? (
            <>
              <div className="border-t border-slate-100 my-2 pt-2">
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
              </div>
            </>
          ) : null}

          {isAdmin && (
            <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass}>
              Admin Portal
            </NavLink>
          )}

          <div className="pt-3 border-t border-slate-100 mt-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.fullName})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-normal text-sm hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-sm"
                >
                  Sign Up Free
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
