import React, { useState } from 'react';
import { 
  X, ShoppingCart, Heart, Trash2, Plus, Minus, ArrowRight, 
  Sparkles, Truck, ShieldCheck, Tag, ShoppingBag 
} from 'lucide-react';

export default function CartWishlistDrawer({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  wishlistItems = [],
  onUpdateQuantity, 
  onRemoveItem,
  onMoveToCart,
  onProceedToCheckout 
}) {
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'wishlist'

  if (!isOpen) return null;

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalItemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  const freeShippingThreshold = 75;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 9.99;
  const estimatedTax = subtotal * 0.08;
  const grandTotal = subtotal + shippingFee + estimatedTax;

  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="drawer-overlay fade-in" onClick={onClose}>
      <div className="drawer-container glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="flex-align">
            <ShoppingBag className="text-blue" size={22} />
            <h3 className="drawer-title">Shopping Bag & Wishlist</h3>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="drawer-tabs">
          <button 
            className={`drawer-tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <ShoppingCart size={16} /> Cart ({totalItemCount})
          </button>
          <button 
            className={`drawer-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={16} /> Wishlist ({wishlistItems.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="drawer-body">
          {activeTab === 'cart' ? (
            <>
              {/* Free Shipping Progress Indicator */}
              {subtotal > 0 && (
                <div className="free-shipping-card">
                  <div className="flex-between">
                    <span className="shipping-text">
                      <Truck size={15} className="text-green" />
                      {amountNeededForFreeShipping === 0 
                        ? '🎉 You unlocked FREE Express Shipping!' 
                        : `Add $${amountNeededForFreeShipping.toFixed(2)} more for FREE Shipping`}
                    </span>
                    <span className="shipping-val font-mono">{freeShippingProgress.toFixed(0)}%</span>
                  </div>
                  <div className="meter-track mt-2">
                    <div className="meter-fill bg-green" style={{ width: `${freeShippingProgress}%` }}></div>
                  </div>
                </div>
              )}

              {cartItems.length === 0 ? (
                <div className="empty-drawer-state">
                  <ShoppingCart size={48} className="empty-icon text-dim" />
                  <h4>Your Cart is Empty</h4>
                  <p>Explore recommended items and click "Add to Cart" to start your order.</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <img src={item.imageUrl} alt={item.title} className="cart-item-img" />
                      <div className="cart-item-info">
                        <span className="cart-item-cat">{item.category}</span>
                        <h5 className="cart-item-title">{item.title}</h5>
                        <div className="cart-item-price-row">
                          <span className="cart-item-price">${item.price.toFixed(2)}</span>
                          <span className="cart-item-line-total">
                            Total: ${(item.price * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="cart-item-actions">
                        <div className="qty-controls">
                          <button 
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="qty-val">{item.quantity || 1}</span>
                          <button 
                            className="qty-btn"
                            onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button 
                          className="remove-item-btn"
                          onClick={() => onRemoveItem(item.id, 'cart')}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Wishlist View */}
              {wishlistItems.length === 0 ? (
                <div className="empty-drawer-state">
                  <Heart size={48} className="empty-icon text-dim" />
                  <h4>Your Wishlist is Empty</h4>
                  <p>Heart items in the feed to save them here for later.</p>
                </div>
              ) : (
                <div className="cart-items-list">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <img src={item.imageUrl} alt={item.title} className="cart-item-img" />
                      <div className="cart-item-info">
                        <span className="cart-item-cat">{item.category}</span>
                        <h5 className="cart-item-title">{item.title}</h5>
                        <span className="cart-item-price">${item.price.toFixed(2)}</span>
                      </div>

                      <div className="flex-align">
                        <button 
                          className="move-to-cart-btn"
                          onClick={() => onMoveToCart(item)}
                        >
                          Move to Cart
                        </button>
                        <button 
                          className="remove-item-btn"
                          onClick={() => onRemoveItem(item.id, 'wishlist')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Summary & Checkout Button (Only for Cart tab with items) */}
        {activeTab === 'cart' && cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Items Subtotal ({totalItemCount} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shippingFee === 0 ? 'text-green font-bold' : ''}>
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax (8%)</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span className="grand-total-val">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button className="proceed-checkout-btn" onClick={onProceedToCheckout}>
              <span>Proceed to Amazon Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
