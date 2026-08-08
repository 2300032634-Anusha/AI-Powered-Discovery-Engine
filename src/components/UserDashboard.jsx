import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, DollarSign, Package, User, Clock, MapPin, 
  CreditCard, CheckCircle2, Truck, RefreshCw, AlertCircle, Sparkles, LogIn 
} from 'lucide-react';
import { fetchUserOrders, fetchUserOrderStats } from '../data/api';

export default function UserDashboard({ currentUser, personas = {}, onOpenAuthModal }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, totalItemsPurchased: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const userOrders = await fetchUserOrders(currentUser.id);
      const userStats = await fetchUserOrderStats(currentUser.id);

      setOrders(userOrders);
      setStats(userStats);
      setLoading(false);
    }

    loadDashboardData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="tab-container fade-in">
        <div className="dashboard-guest-card glass-card">
          <User size={48} className="text-blue" />
          <h2>Client Purchase History & Orders Dashboard</h2>
          <p>Please log in or sign up to view your past orders, delivery addresses, and total spent analytics.</p>
          <div className="flex-align mt-4">
            <button className="signup-header-btn" onClick={() => onOpenAuthModal('login')}>
              <LogIn size={16} /> Log In to Account
            </button>
            <button className="login-header-btn" onClick={() => onOpenAuthModal('signup')}>
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const persona = personas[currentUser.personaId] || { name: 'Tech Enthusiast', color: '#3b82f6' };

  return (
    <div className="tab-container fade-in">
      {/* Dashboard Banner */}
      <div className="persona-banner-card glass-card" style={{ borderLeft: `6px solid ${persona.color}` }}>
        <div className="persona-banner-left">
          <img 
            src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
            alt={currentUser.name} 
            className="dashboard-avatar-img" 
          />
          <div>
            <h2 className="banner-title">Welcome Back, {currentUser.name}!</h2>
            <p className="banner-desc">Account Email: {currentUser.email} • Persona: {persona.name}</p>
          </div>
        </div>
        <div className="persona-banner-metrics">
          <div className="metric-pill">
            <span className="metric-label">Account ID</span>
            <span className="metric-val font-mono">#{currentUser.id}</span>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Registered Since</span>
            <span className="metric-val">{new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Analytics Summary Metric Cards */}
      <div className="dashboard-metrics-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-green">
            <DollarSign size={24} className="text-green" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Spent in Store</span>
            <span className="stat-val text-green">${stats.totalSpent.toFixed(2)}</span>
            <span className="stat-sub">Across {stats.totalOrders} order(s)</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-blue">
            <ShoppingBag size={24} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Orders Placed</span>
            <span className="stat-val text-blue">{stats.totalOrders}</span>
            <span className="stat-sub">Recorded in MySQL database</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-purple">
            <Package size={24} className="text-purple" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Items Purchased</span>
            <span className="stat-val text-purple">{stats.totalItemsPurchased}</span>
            <span className="stat-sub">Delivered to your address</span>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper bg-amber">
            <Sparkles size={24} className="text-amber" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Linked Persona</span>
            <span className="stat-val text-amber">{persona.name}</span>
            <span className="stat-sub">Recommendation Model Vector</span>
          </div>
        </div>
      </div>

      {/* Purchase History Section */}
      <div className="purchase-history-section mt-6">
        <div className="section-header-row">
          <h3>
            <Clock className="text-blue" size={20} />
            Purchase History & Purchased Items ({orders.length})
          </h3>
          <span className="section-tag">Persisted Client Data from MySQL Database</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Fetching purchase history from MySQL...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-history-card glass-card">
            <Package size={40} className="text-dim" />
            <h4>No Purchase History Found</h4>
            <p>You haven't placed any orders yet. Add items to your cart and complete checkout to see your purchase history here!</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-history-card glass-card">
                {/* Order Header Row */}
                <div className="order-card-header">
                  <div className="order-header-info">
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="order-header-badges">
                    <span className="status-pill bg-green">
                      <Truck size={14} /> {order.status || 'Processing'}
                    </span>
                    <span className="order-total-pill">
                      Total: <strong>${order.totalAmount.toFixed(2)}</strong>
                    </span>
                  </div>
                </div>

                {/* Delivery Address Details */}
                <div className="order-address-box">
                  <div className="address-col">
                    <span className="box-lbl"><MapPin size={14} className="text-purple" /> Delivery Address:</span>
                    <span className="box-val">{order.shippingName} — {order.shippingAddress}, {order.shippingCity} ({order.shippingPostalCode})</span>
                  </div>
                  <div className="address-col">
                    <span className="box-lbl"><CreditCard size={14} className="text-blue" /> Payment & Contact:</span>
                    <span className="box-val">{order.paymentMethod} • Phone: {order.shippingPhone}</span>
                  </div>
                </div>

                {/* Purchased Items List */}
                <div className="order-purchased-items">
                  <span className="items-title">Purchased Items ({order.items.length}):</span>
                  <div className="items-grid">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="purchased-item-row">
                        <img src={item.imageUrl} alt={item.productTitle} className="purchased-item-thumb" />
                        <div className="purchased-item-details">
                          <span className="p-title">{item.productTitle}</span>
                          <span className="p-price">${item.price.toFixed(2)} x {item.quantity} unit(s)</span>
                        </div>
                        <span className="p-total">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
