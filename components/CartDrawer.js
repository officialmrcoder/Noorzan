'use client'

import Link from 'next/link'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

const FREE_SHIPPING_THRESHOLD = 3000

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
  } = useCart()
  const { showToast } = useToast()

  const shippingProgress = Math.min((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - cartSubtotal, 0)
  const freeShippingUnlocked = cartSubtotal >= FREE_SHIPPING_THRESHOLD

  const handleRemove = (item) => {
    removeFromCart(item.id, item.size)
    showToast(`${item.name} removed from bag`, 'info')
  }

  const handleQtyChange = (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) {
      handleRemove(item)
    } else {
      updateQuantity(item.id, item.size, newQty)
    }
  }

  return (
    <>
      {/* ── Overlay ── */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Right panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Your Bag</h2>
            {cartCount > 0 && (
              <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── FREE SHIPPING PROGRESS ── */}
        {cartCount > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-600 mb-2">
              {freeShippingUnlocked
                ? '🎉 You\'ve unlocked free shipping!'
                : `You're PKR ${remaining.toLocaleString()} away from free shipping!`}
            </p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── CART ITEMS / EMPTY STATE ── */}
        {cartCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 py-10">
            <div className="text-gray-300">
              <ShoppingBag size={56} strokeWidth={1.2} />
            </div>
            <p className="text-base font-semibold text-gray-700">Your bag is empty</p>
            <p className="text-sm text-gray-400 text-center">
              Add items you love to your bag. Review them before checkout.
            </p>
            <Link
              href="/products"
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-6 py-3 rounded-sm hover:bg-gray-900 transition-colors"
            >
              Start Shopping
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-3">
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-20 rounded-lg border border-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-black truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {item.size && (
                      <span className="text-xs text-gray-500">Size: {item.size}</span>
                    )}
                    {item.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold text-black">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </p>

                  {/* Quantity stepper + remove */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                      <button
                        onClick={() => handleQtyChange(item, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-black select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="ml-auto text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FOOTER ── */}
        {cartCount > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Subtotal</span>
              <span className="text-sm font-bold text-black">
                PKR {cartSubtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-400">Tax &amp; shipping calculated at checkout</p>

            {/* Checkout button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-black text-white text-sm font-bold py-3.5 rounded-sm hover:bg-gray-900 transition-colors"
            >
              Checkout
              <ArrowRight size={16} />
            </Link>

            {/* Continue shopping */}
            <button
              onClick={onClose}
              className="block w-full text-center text-xs text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
