'use client';

import React, { useState, memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, mounted } = useCart();
  const { user, profile, isAdmin, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      showToast(error.message || 'Logout failed', 'error');
    } else {
      showToast('Logged out successfully', 'success');
    }
  };

  const isActive = (path) => pathname === path;

  const navLinks = useMemo(() => [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Profile', path: '/profile' },
  ], []);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              <ShoppingBag className="w-7 h-7 text-indigo-600" />
              <span>NOORZAN</span>
            </Link>
          </div>


          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                  isActive(link.path) ? 'text-indigo-600 font-semibold' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-indigo-600 ${
                  isActive('/admin') ? 'text-indigo-600 font-semibold' : 'text-amber-600'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth / Account */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || user.email.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-rose-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-4">
            {/* Cart Icon Mobile */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-amber-50 text-amber-600 font-semibold'
                    : 'text-amber-600 hover:bg-amber-50/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Admin Dashboard
              </Link>
            )}

            <div className="border-t border-gray-100 my-2 pt-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    My Account ({profile?.full_name || user.email.split('@')[0]})
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-base font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
export default memo(Navbar);
