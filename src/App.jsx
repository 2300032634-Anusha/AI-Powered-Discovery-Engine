import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PersonalizedFeed from './components/PersonalizedFeed';
import SemanticSearchStudio from './components/SemanticSearchStudio';
import TwoTowerFaissStudio from './components/TwoTowerFaissStudio';
import MultimodalCompleteLook from './components/MultimodalCompleteLook';
import ColdStartBanditStudio from './components/ColdStartBanditStudio';
import RagShoppingAssistant from './components/RagShoppingAssistant';
import ExplainabilityGuardrails from './components/ExplainabilityGuardrails';
import PrivacyComplianceHub from './components/PrivacyComplianceHub';
import PerformanceLatencyDashboard from './components/PerformanceLatencyDashboard';
import DockerCicdStudio from './components/DockerCicdStudio';
import AuthModal from './components/AuthModal';
import CartWishlistDrawer from './components/CartWishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import UserDashboard from './components/UserDashboard';
import { PRODUCTS as LOCAL_PRODUCTS, USER_PERSONAS as LOCAL_PERSONAS } from './data/catalogData';
import { fetchProducts, fetchPersonas, checkHealth } from './data/api';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedPersonaKey, setSelectedPersonaKey] = useState('techie');
  
  // Data state — fetched from API with local fallback
  const [products, setProducts] = useState(LOCAL_PRODUCTS);
  const [personas, setPersonas] = useState(LOCAL_PERSONAS);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('discovery_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup');

  // DPDP Privacy Compliance state
  const [dpdpConsent, setDpdpConsent] = useState({
    personalization: true,
    searchLogging: true,
    behavioralAnalytics: true
  });

  // Simulated latency
  const [systemLatency, setSystemLatency] = useState(26.4);

  const handleOpenAuthModal = (mode = 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('discovery_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save user session to localStorage');
    }
    if (user?.personaId && personas[user.personaId]) {
      setSelectedPersonaKey(user.personaId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('discovery_user');
    } catch (e) {
      console.warn('Could not remove user session');
    }
  };

  // Cart & Wishlist Handlers
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartDrawerOpen(true);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, 'cart');
      return;
    }
    setCartItems(prev => 
      prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveItem = (productId, type = 'cart') => {
    if (type === 'cart') {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const handleToggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleMoveToCart = (product) => {
    handleRemoveItem(product.id, 'wishlist');
    handleAddToCart(product);
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleOrderCompleted = (orderId) => {
    setCartItems([]);
    setActiveTab('dashboard');
  };

  // Fetch data from backend on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      // Check backend health
      const health = await checkHealth();
      const isConnected = health?.status === 'healthy';
      setBackendConnected(isConnected);

      if (isConnected) {
        // Fetch products from MySQL
        const apiProducts = await fetchProducts();
        if (apiProducts && apiProducts.length > 0) {
          setProducts(apiProducts);
          console.log(`✅ Loaded ${apiProducts.length} products from MySQL backend`);
        }

        // Fetch personas from MySQL
        const apiPersonas = await fetchPersonas();
        if (apiPersonas && Object.keys(apiPersonas).length > 0) {
          setPersonas(apiPersonas);
          console.log(`✅ Loaded ${Object.keys(apiPersonas).length} personas from MySQL backend`);
        }
      } else {
        console.log('⚠️ Backend not available — using local fallback data');
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="app-root">
      {/* Animated background particles */}
      <div className="bg-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPersonaKey={selectedPersonaKey}
        setSelectedPersonaKey={setSelectedPersonaKey}
        dpdpConsent={dpdpConsent}
        systemLatency={systemLatency}
        backendConnected={backendConnected}
        personas={personas}
        currentUser={currentUser}
        cartCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
      />

      <main className="app-main-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Connecting to Discovery Engine...</p>
            <div className="loading-shimmer-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="shimmer-card">
                  <div className="shimmer-img"></div>
                  <div className="shimmer-line w-80"></div>
                  <div className="shimmer-line w-60"></div>
                  <div className="shimmer-line w-40"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'feed' && (
              <PersonalizedFeed
                selectedPersonaKey={selectedPersonaKey}
                dpdpConsent={dpdpConsent}
                products={products}
                personas={personas}
                wishlistItems={wishlistItems}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
              />
            )}

            {activeTab === 'search' && (
              <SemanticSearchStudio
                selectedPersonaKey={selectedPersonaKey}
                products={products}
                personas={personas}
              />
            )}

            {activeTab === 'vector' && (
              <TwoTowerFaissStudio
                selectedPersonaKey={selectedPersonaKey}
                products={products}
                personas={personas}
              />
            )}

            {activeTab === 'multimodal' && (
              <MultimodalCompleteLook
                products={products}
              />
            )}

            {activeTab === 'coldstart' && (
              <ColdStartBanditStudio
                products={products}
              />
            )}

            {activeTab === 'rag' && (
              <RagShoppingAssistant
                products={products}
                personaId={selectedPersonaKey}
              />
            )}

            {activeTab === 'xai' && (
              <ExplainabilityGuardrails
                selectedPersonaKey={selectedPersonaKey}
                products={products}
                personas={personas}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyComplianceHub
                dpdpConsent={dpdpConsent}
                setDpdpConsent={setDpdpConsent}
              />
            )}

            {activeTab === 'telemetry' && (
              <PerformanceLatencyDashboard
                systemLatency={systemLatency}
                backendConnected={backendConnected}
              />
            )}

            {activeTab === 'docker' && (
              <DockerCicdStudio />
            )}

            {activeTab === 'dashboard' && (
              <UserDashboard
                currentUser={currentUser}
                personas={personas}
                onOpenAuthModal={handleOpenAuthModal}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-glow"></div>
        <div className="footer-content">
          <div className="footer-title">
            <span className="footer-logo-text">Discovery Engine AI</span>
            <span className="footer-divider">—</span>
            <span>E-Commerce Recommendation & Semantic Discovery Platform</span>
          </div>
          <div className="footer-links">
            <span className="footer-badge">
              <span className="footer-badge-dot"></span>
              {backendConnected ? 'MySQL Connected' : 'Local Mode'}
            </span>
            <span>•</span>
            <span>{products.length} Products Loaded</span>
            <span>•</span>
            <span>DPDP Compliant</span>
            <span>•</span>
            <span>P95 SLA: {systemLatency}ms</span>
            <span>•</span>
            <span>FAISS IndexHNSW32</span>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        personas={personas}
        defaultMode={authModalMode}
      />

      <CartWishlistDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        wishlistItems={wishlistItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onMoveToCart={handleMoveToCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        selectedPersonaKey={selectedPersonaKey}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
}
