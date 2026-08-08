import React from 'react';
import { 
  Sparkles, Search, Layers, Cpu, Eye, UserCheck, Bot, 
  HelpCircle, ShieldCheck, Activity, Terminal, ShieldAlert, ChevronDown,
  Wifi, WifiOff, Database, UserPlus, LogIn, LogOut, User, ShoppingBag, Clock, ShoppingCart
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  selectedPersonaKey, 
  setSelectedPersonaKey,
  dpdpConsent,
  systemLatency,
  backendConnected = false,
  personas = {},
  currentUser = null,
  cartCount = 0,
  onLogout,
  onOpenAuthModal,
  onOpenCartDrawer
}) {
  const persona = personas[selectedPersonaKey] || { name: 'Tech Enthusiast', color: '#3b82f6' };

  const NAV_TABS = [
    { id: 'feed', label: '1. Home Feed', icon: Sparkles },
    { id: 'search', label: '2-3. Intent & Hybrid Search', icon: Search },
    { id: 'vector', label: '4-5. Two-Tower & FAISS', icon: Cpu },
    { id: 'multimodal', label: '6-8. Multimodal & Bundles', icon: Eye },
    { id: 'coldstart', label: '9. Cold-Start Bandit', icon: UserCheck },
    { id: 'rag', label: '10. RAG Shopping AI', icon: Bot },
    { id: 'xai', label: '11-12. XAI & Diversity', icon: HelpCircle },
    { id: 'privacy', label: '13. DPDP Privacy Hub', icon: ShieldCheck },
    { id: 'telemetry', label: '14. Latency Dashboard', icon: Activity },
    { id: 'docker', label: '15. Docker & CI/CD', icon: Terminal },
    { id: 'dashboard', label: '16. My Orders & History', icon: Clock }
  ];

  return (
    <header className="discovery-header">
      {/* Top Main Bar */}
      <div className="header-top-row">
        <div className="brand-logo-group">
          <div className="logo-badge-icon">
            <Sparkles className="logo-sparkle-icon" size={24} />
          </div>
          <div>
            <h1 className="brand-title">DISCOVERY ENGINE AI</h1>
            <p className="brand-subtitle">Semantic Search & Multi-Model Recommendation Platform</p>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div className="header-controls">
          {/* Cart & Wishlist Drawer Trigger Button */}
          <button className="header-cart-btn" onClick={onOpenCartDrawer} title="View Cart & Wishlist">
            <ShoppingCart size={18} />
            <span className="cart-btn-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>

          {/* User Auth Buttons / User Profile */}
          {currentUser ? (
            <div className="user-profile-pill">
              <img src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt={currentUser.name} className="user-avatar-img" />
              <span className="user-name-text">{currentUser.name}</span>
              <button className="logout-icon-btn" onClick={onLogout} title="Log Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="auth-header-actions">
              <button className="login-header-btn" onClick={() => onOpenAuthModal('login')}>
                <LogIn size={14} /> Log In
              </button>
              <button className="signup-header-btn" onClick={() => onOpenAuthModal('signup')}>
                <UserPlus size={14} /> Sign Up
              </button>
            </div>
          )}

          {/* Backend Connection Status */}
          <div className={`connection-badge ${backendConnected ? 'connected' : 'disconnected'}`}>
            {backendConnected ? <Database size={14} /> : <WifiOff size={14} />}
            <span>{backendConnected ? 'MySQL Live' : 'Local Mode'}</span>
          </div>

          {/* Persona Selector Dropdown */}
          <div className="persona-selector-wrapper">
            <span className="persona-label">ACTIVE PERSONA:</span>
            <div className="persona-pill" style={{ borderColor: persona.color }}>
              <span className="persona-dot" style={{ backgroundColor: persona.color }}></span>
              <select 
                value={selectedPersonaKey} 
                onChange={(e) => setSelectedPersonaKey(e.target.value)}
                className="persona-select"
              >
                {Object.keys(personas).map((key) => (
                  <option key={key} value={key}>
                    {personas[key].name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-chevron" />
            </div>
          </div>

          {/* Privacy Status Badge */}
          <div className={`privacy-badge ${dpdpConsent.personalization ? 'consented' : 'restricted'}`}>
            <ShieldCheck size={16} />
            <span>{dpdpConsent.personalization ? 'DPDP CONSENT ACTIVE' : 'PRIVACY SAFE MODE'}</span>
          </div>

          {/* Live Latency Telemetry Badge */}
          <div className="latency-badge">
            <Activity size={15} className="pulse-green" />
            <span>P95 SLA: <strong>{systemLatency} ms</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Header Tabs */}
      <nav className="header-nav-tabs">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab-button ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {isActive && <div className="tab-active-indicator"></div>}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
