'use client'

import { useState, useEffect, useRef, memo, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'
import { SAMPLE_PRODUCTS, isSupabaseConfigured } from '@/lib/mockData'
import { 
  ShoppingBag, User, Menu, X, LogOut, LayoutDashboard, Search, 
  Package, Settings, ChevronRight, Loader2, ArrowRight
} from 'lucide-react'
import CartDrawer from '@/components/CartDrawer'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const Navbar = memo(function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { cartCount, mounted } = useCart()
  const { user, profile, isAdmin, logout } = useAuth()
  const { showToast } = useToast()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const accountMenuRef = useRef(null)
  const searchInputRef = useRef(null)

  // Close account menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto focus search input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [searchOpen])

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${searchQuery.trim()}%`)
            .limit(6)
          if (!error && data) {
            setSearchResults(data)
            setSearchLoading(false)
            return
          }
        }
        // Fallback search
        const q = searchQuery.toLowerCase().trim()
        const matches = SAMPLE_PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q))
        ).slice(0, 6)
        setSearchResults(matches)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSignOut = async () => {
    try {
      const { error } = await logout()
      if (error) throw error
      showToast('Signed out successfully', 'success')
      setAccountMenuOpen(false)
      setMobileOpen(false)
      router.push('/')
    } catch {
      showToast('Failed to sign out', 'error')
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchOpen(false)
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const isActive = useMemo(
    () => (href) => {
      if (href === '/') return pathname === '/'
      return pathname.startsWith(href)
    },
    [pathname]
  )

  const displayCount = mounted ? cartCount : 0

  return (
    <>
      {/* ── Main Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Desktop layout ── */}
          <div className="hidden md:flex items-center justify-between h-16">

            {/* LEFT — nav links */}
            <div className="flex items-center gap-7">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={
                    isActive(href)
                      ? 'text-sm font-bold text-black underline underline-offset-8'
                      : 'text-sm font-medium text-gray-700 hover:text-black transition-colors'
                  }
                >
                  {label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  <LayoutDashboard size={13} />
                  Admin
                </Link>
              )}
            </div>

            {/* CENTER — logo */}
            <Link href="/" className="text-2xl font-black tracking-[0.25em] text-black select-none hover:opacity-85 transition-opacity">
              NOORZAN
            </Link>

            {/* RIGHT — icons */}
            <div className="flex items-center gap-5">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search bags"
                className="text-gray-700 hover:text-black transition-colors p-1"
                title="Search"
              >
                <Search size={20} />
              </button>

              {/* Account Dropdown */}
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  aria-label="Account menu"
                  className="flex items-center gap-1 text-gray-700 hover:text-black transition-colors p-1"
                  title="Account"
                >
                  <User size={20} />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70">
                          <p className="text-xs font-bold text-black truncate">
                            {profile?.full_name || 'My Account'}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="inline-block mt-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                              Admin Access
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors"
                          >
                            <LayoutDashboard size={14} />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          href="/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                        >
                          <Package size={14} />
                          My Orders
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={14} />
                          Profile Settings
                        </Link>

                        <div className="border-t border-gray-100 my-1" />

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-bold uppercase tracking-wider text-black">Welcome to Noorzan</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Sign in to track orders & manage your bag collection</p>
                        </div>

                        <div className="p-3 space-y-2">
                          <Link
                            href="/auth/login"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider text-center hover:bg-gray-900 transition-colors"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/auth/signup"
                            onClick={() => setAccountMenuOpen(false)}
                            className="block w-full py-2.5 border border-black text-black text-xs font-bold uppercase tracking-wider text-center hover:bg-gray-50 transition-colors"
                          >
                            Create Account
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative text-gray-700 hover:text-black transition-colors p-1"
                aria-label={`Cart (${displayCount} items)`}
                title="Cart"
              >
                <ShoppingBag size={21} />
                {displayCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold leading-none w-4 h-4 flex items-center justify-center rounded-full">
                    {displayCount > 99 ? '99+' : displayCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Mobile layout ── */}
          <div className="flex md:hidden items-center justify-between h-14">

            {/* LEFT — hamburger + search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="text-gray-800 hover:text-black transition-colors p-1"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className="text-gray-800 hover:text-black transition-colors p-1"
                aria-label="Search"
              >
                <Search size={19} />
              </button>
            </div>

            {/* CENTER — logo */}
            <Link href="/" className="text-lg font-black tracking-[0.2em] text-black select-none">
              NOORZAN
            </Link>

            {/* RIGHT — account & cart */}
            <div className="flex items-center gap-3">
              <Link
                href={user ? '/dashboard' : '/auth/login'}
                className="text-gray-800 hover:text-black transition-colors p-1"
                aria-label="Account"
              >
                <User size={20} />
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="relative text-gray-800 hover:text-black transition-colors p-1"
                aria-label={`Cart (${displayCount} items)`}
              >
                <ShoppingBag size={21} />
                {displayCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold leading-none w-4 h-4 flex items-center justify-center rounded-full">
                    {displayCount > 99 ? '99+' : displayCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── LIVE PREDICTIVE SEARCH MODAL (DN Store style) ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-8 md:pt-16 px-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-gray-200 px-4 py-3.5">
              <Search size={20} className="text-gray-400 mr-3 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search bags by name, style, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-base font-medium text-black placeholder-gray-400 focus:outline-none"
              />
              {searchLoading && <Loader2 size={18} className="animate-spin text-gray-400 mr-2" />}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </form>

            {/* Quick Suggestions / Live Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {searchQuery.trim() === '' ? (
                <div className="py-6 text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Popular Searches</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Backpack', 'Laptop Bag', 'Handbag', 'Travel Bag', 'Messenger'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-xs font-semibold text-gray-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                    Found {searchResults.length} Products
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                      >
                        <div className="w-14 h-14 bg-gray-100 flex-shrink-0 overflow-hidden">
                          <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-black truncate">{product.name}</p>
                          <p className="text-[11px] text-gray-500 uppercase tracking-wider">{product.category}</p>
                          <p className="text-xs font-black text-black mt-0.5">
                            PKR {Number(product.price).toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                    <button
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold uppercase tracking-wider text-black hover:underline inline-flex items-center gap-1"
                    >
                      View All Results for "{searchQuery}" <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ) : !searchLoading ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  No bags found matching "<span className="font-semibold text-black">{searchQuery}</span>".
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile slide drawer (left side) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-black text-white shadow-2xl">
            {/* Close button */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-lg font-black tracking-widest">NOORZAN</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-6 py-4 text-base border-b border-white/10 transition-colors ${
                    isActive(href)
                      ? 'font-bold text-white'
                      : 'font-medium text-white/80 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 text-base font-bold text-amber-400 hover:text-amber-300 border-b border-white/10 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Admin Dashboard
                </Link>
              )}

              {user && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-6 py-4 text-base font-medium text-white/80 hover:text-white border-b border-white/10 transition-colors"
                  >
                    <Package size={18} />
                    My Orders
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-6 py-4 text-base font-medium text-white/80 hover:text-white border-b border-white/10 transition-colors"
                  >
                    <Settings size={18} />
                    Profile Settings
                  </Link>
                </>
              )}
            </nav>

            {/* Bottom auth */}
            <div className="border-t border-white/10 px-6 py-5 space-y-3">
              {user ? (
                <>
                  <div className="text-xs text-gray-400">
                    Signed in as <span className="text-white font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-2.5 border border-white text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
})

export default Navbar