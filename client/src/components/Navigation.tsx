// ============================================================
// Navigation — top bar with logo, nav links, and logout
// ============================================================

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigationGuard } from '../context/NavigationGuardContext';
import { LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navGuard = useNavigationGuard();
  const [menuOpen, setMenuOpen] = useState(false);
  const [guardWarning, setGuardWarning] = useState<{ message: string; dest: string } | null>(null);

  function guardedNavigate(path: string) {
    if (location.pathname === path) return;
    const warning = navGuard.check();
    if (warning) {
      setGuardWarning({ message: warning, dest: path });
    } else {
      navigate(path);
    }
  }

  if (!user) return null;

  // Show role-appropriate nav items
  const navItems: Array<{ label: string; path: string }> = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Messages', path: '/messages' },
  ];

  // Admin gets a role badge in the nav (dashboard already shows admin view)
  const roleLabel =
    user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Staff' : 'Parent';

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="bg-brand-500 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo / app name */}
            <button
              onClick={() => guardedNavigate('/dashboard')}
              className="flex items-center gap-2 font-bold text-lg"
            >
              Unity Pulse
            </button>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => guardedNavigate(item.path)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User info + logout (desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{roleLabel}</span>
              <span className="text-sm text-white/80">
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-1.5 rounded-md hover:bg-white/10"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile nav dropdown */}
          {menuOpen && (
            <nav className="sm:hidden pb-3 space-y-1" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { guardedNavigate(item.path); setMenuOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-white/20 pt-2 mt-2 flex items-center justify-between px-3">
                <span className="text-sm text-white/80">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-sm hover:bg-white/10 px-2 py-1 rounded-md"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Navigation guard warning modal */}
      {guardWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">ATLs Are Incomplete</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {guardWarning.message}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setGuardWarning(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Stay
              </button>
              <button
                onClick={() => { const dest = guardWarning.dest; setGuardWarning(null); navigate(dest); }}
                className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
