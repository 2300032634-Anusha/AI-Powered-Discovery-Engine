import React, { useState } from 'react';
import { 
  X, MapPin, CreditCard, Truck, CheckCircle2, ShieldCheck, 
  ShoppingBag, ArrowRight, User, Phone, Building, Hash, AlertCircle 
} from 'lucide-react';
import { createOrder } from '../data/api';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  currentUser = null,
  selectedPersonaKey = 'techie',
  onOrderCompleted 
}) {
  const [shippingForm, setShippingForm] = useState({
    name: currentUser?.name || '',
    address: '123 Tech Avenue, Suite 400',
    city: 'San Francisco',
    postalCode: '94105',
    phone: '+1 (555) 234-5678',
    paymentMethod: 'Credit Card'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  if (!isOpen) return null;

  // Financial calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalItemCount = cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  const shippingFee = subtotal >= 75 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shippingFee + tax;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!shippingForm.name.trim() || !shippingForm.address.trim() || !shippingForm.city.trim() || !shippingForm.phone.trim()) {
      setErrorMsg('Please complete all required shipping address fields.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        userId: currentUser?.id || null,
        personaId: selectedPersonaKey,
        totalAmount: grandTotal,
        totalItems: totalItemCount,
        shippingName: shippingForm.name,
        shippingAddress: shippingForm.address,
        shippingCity: shippingForm.city,
        shippingPostalCode: shippingForm.postalCode,
        shippingPhone: shippingForm.phone,
        paymentMethod: shippingForm.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.id,
          productTitle: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl
        }))
      };

      const res = await createOrder(orderPayload);

      if (res && res.success) {
        setOrderConfirmation({
          orderId: res.orderId,
          totalAmount: grandTotal,
          totalItems: totalItemCount,
          shippingName: shippingForm.name,
          shippingAddress: `${shippingForm.address}, ${shippingForm.city}`,
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
          })
        });

        onOrderCompleted(res.orderId);
      } else {
        setErrorMsg(res?.error || 'Order submission failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay fade-in" onClick={onClose}>
      <div className="checkout-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {orderConfirmation ? (
          /* Order Confirmation View */
          <div className="order-success-view fade-in">
            <div className="success-badge-icon">
              <CheckCircle2 size={48} className="text-green" />
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="order-id-tag">Order ID: #{orderConfirmation.orderId}</p>

            <div className="confirmation-details-box glass-card">
              <div className="detail-row">
                <span className="lbl"><Truck size={16} className="text-blue" /> Estimated Delivery:</span>
                <span className="val text-green font-bold">{orderConfirmation.deliveryDate}</span>
              </div>
              <div className="detail-row">
                <span className="lbl"><MapPin size={16} className="text-purple" /> Shipping Address:</span>
                <span className="val">{orderConfirmation.shippingName}, {orderConfirmation.shippingAddress}</span>
              </div>
              <div className="detail-row">
                <span className="lbl"><ShoppingBag size={16} className="text-amber" /> Total Items & Paid:</span>
                <span className="val font-mono font-bold">${orderConfirmation.totalAmount.toFixed(2)} ({orderConfirmation.totalItems} items)</span>
              </div>
            </div>

            <p className="mysql-persist-note">
              <ShieldCheck size={14} className="text-green" />
              Order details & client shipping address permanently stored in MySQL database table (`orders`).
            </p>

            <button 
              className="view-dashboard-btn"
              onClick={() => {
                onClose();
              }}
            >
              Close & View Dashboard
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div className="checkout-grid-layout">
            {/* Left Column: Delivery Address & Payment */}
            <div className="checkout-form-column">
              <div className="checkout-header">
                <div className="flex-align">
                  <MapPin className="text-blue" size={24} />
                  <h3>Amazon Delivery & Shipping Address</h3>
                </div>
                <p className="checkout-sub">Enter shipping address for delivery and client data persistence</p>
              </div>

              {errorMsg && (
                <div className="auth-alert error-alert">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form id="checkout-form" onSubmit={handleSubmitOrder} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Recipient Full Name *</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      className="auth-input"
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address & House Number *</label>
                  <div className="input-with-icon">
                    <MapPin size={18} className="input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123 Tech Blvd, Apt 4B"
                      className="auth-input"
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group">
                    <label className="form-label">City / Town *</label>
                    <div className="input-with-icon">
                      <Building size={18} className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. San Francisco"
                        className="auth-input"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal / ZIP Code</label>
                    <div className="input-with-icon">
                      <Hash size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="e.g. 94105"
                        className="auth-input"
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Phone Number *</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      className="auth-input"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="form-group">
                  <label className="form-label">Select Payment Method</label>
                  <div className="payment-options-grid">
                    {['Credit Card', 'UPI / Net Banking', 'Cash on Delivery'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={`payment-option-card ${shippingForm.paymentMethod === method ? 'active' : ''}`}
                        onClick={() => setShippingForm({ ...shippingForm, paymentMethod: method })}
                      >
                        <CreditCard size={16} />
                        <span>{method}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column: Order Items Summary & Total Amount */}
            <div className="checkout-summary-column glass-card">
              <h4>Order Summary ({totalItemCount} items)</h4>

              <div className="summary-items-scroll">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item-row">
                    <img src={item.imageUrl} alt={item.title} className="summary-item-img" />
                    <div className="summary-item-details">
                      <span className="title">{item.title}</span>
                      <span className="price">${item.price.toFixed(2)} x {item.quantity || 1}</span>
                    </div>
                    <span className="item-total-val">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-price-breakdown">
                <div className="row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="row">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green font-bold' : ''}>
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="row">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="row grand-total-row">
                  <span>Total Amount</span>
                  <span className="grand-total-price">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                className="place-order-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-sm"></div>
                ) : (
                  <>
                    <span>Place Order & Pay ${grandTotal.toFixed(2)}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
