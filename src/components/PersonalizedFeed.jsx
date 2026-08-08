import React, { useState, useMemo } from 'react';
import { Sparkles, TrendingUp, Heart, ShoppingBag, Info, RefreshCw, Zap, Star } from 'lucide-react';
import { PRODUCTS as LOCAL_PRODUCTS, USER_PERSONAS as LOCAL_PERSONAS } from '../data/catalogData';
import { logInteraction } from '../data/api';

export default function PersonalizedFeed({ 
  selectedPersonaKey, 
  dpdpConsent, 
  products, 
  personas, 
  wishlistItems = [],
  onAddToCart,
  onToggleWishlist 
}) {
  const allProducts = products || LOCAL_PRODUCTS;
  const allPersonas = personas || LOCAL_PERSONAS;
  const persona = allPersonas[selectedPersonaKey] || allPersonas.techie || { name: 'User', preferredCategories: [], vector: [], color: '#3b82f6', description: '', avgSpend: '' };
  const [clickedItems, setClickedItems] = useState([]);

  // Compute persona-boosted feed items
  const feedProducts = useMemo(() => {
    return allProducts.map(prod => {
      let score = 0.70;

      if (persona.preferredCategories && persona.preferredCategories.includes(prod.category)) {
        score += 0.22;
      }

      if (!dpdpConsent.personalization) {
        score = 0.65 + (prod.rating / 10);
      } else {
        let dot = 0;
        const pVec = persona.vector || [];
        const tEmb = prod.textEmbedding || [];
        for (let i = 0; i < Math.min(pVec.length, tEmb.length); i++) {
          dot += pVec[i] * tEmb[i];
        }
        score += (dot / 25.0);
      }

      return {
        ...prod,
        personaScore: Number(Math.min(0.99, Math.max(0.50, score)).toFixed(2))
      };
    }).sort((a, b) => b.personaScore - a.personaScore);
  }, [selectedPersonaKey, dpdpConsent, allProducts]);

  const handleLike = async (product) => {
    const isLiked = wishlistItems.some(w => w.id === product.id);
    logInteraction({ 
      personaId: selectedPersonaKey, 
      productId: product.id, 
      interactionType: isLiked ? 'unlike' : 'like' 
    });
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  const handleProductClick = async (prod) => {
    if (!clickedItems.includes(prod.id)) {
      setClickedItems([...clickedItems, prod.id]);
      logInteraction({ personaId: selectedPersonaKey, productId: prod.id, interactionType: 'click' });
    }
  };

  return (
    <div className="tab-container fade-in">
      {/* Persona Header Summary Card */}
      <div className="persona-banner-card glass-card" style={{ borderLeft: `6px solid ${persona.color}` }}>
        <div className="persona-banner-left">
          <div className="persona-badge-icon" style={{ backgroundColor: `${persona.color}25`, color: persona.color }}>
            <Sparkles size={28} />
          </div>
          <div>
            <h2 className="banner-title">{persona.name} — Personalized Feed</h2>
            <p className="banner-desc">{persona.description}</p>
          </div>
        </div>
        <div className="persona-banner-metrics">
          <div className="metric-pill">
            <span className="metric-label">Preferred Categories</span>
            <span className="metric-val">{(persona.preferredCategories || []).join(', ') || 'Cold-Start / Generic'}</span>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Avg Budget Span</span>
            <span className="metric-val">{persona.avgSpend}</span>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Personalization Status</span>
            <span className={`metric-val ${dpdpConsent.personalization ? 'text-green' : 'text-amber'}`}>
              {dpdpConsent.personalization ? 'Vector Score Active' : 'Fallback Popularity'}
            </span>
          </div>
        </div>
      </div>

      {/* Feed Layout Grid */}
      <div className="feed-sections">
        {/* Section 1: Recommended For You */}
        <div className="feed-section-header">
          <h3 className="section-heading">
            <Sparkles className="text-amber" size={20} />
            Top Recommendations for {persona.name}
          </h3>
          <span className="section-tag">Ranked by Two-Tower User-Item Vector Match</span>
        </div>

        <div className="product-grid">
          {feedProducts.slice(0, 8).map((product, index) => {
            const isLiked = wishlistItems.some(w => w.id === product.id);
            const isClicked = clickedItems.includes(product.id);
            const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

            return (
              <div 
                key={product.id} 
                className={`product-card ${isClicked ? 'clicked-state' : ''}`}
                onClick={() => handleProductClick(product)}
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <div className="product-img-wrapper">
                  <img src={product.imageUrl} alt={product.title} className="product-img" loading="lazy" />
                  <div className="product-img-overlay"></div>
                  <button 
                    className={`like-btn ${isLiked ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(product);
                    }}
                  >
                    <Heart size={18} fill={isLiked ? '#ec4899' : 'none'} color={isLiked ? '#ec4899' : '#ffffff'} />
                  </button>
                  <div className="score-badge" style={{ backgroundColor: persona.color }}>
                    <Zap size={13} /> {(product.personaScore * 100).toFixed(0)}% Match
                  </div>
                  {discount > 0 && (
                    <div className="discount-badge">-{discount}%</div>
                  )}
                </div>

                <div className="product-info">
                  <span className="product-category">{product.category} • {product.brand}</span>
                  <h4 className="product-title">{product.title}</h4>
                  
                  <div className="product-tags">
                    {(product.tags || []).slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag-chip">#{tag}</span>
                    ))}
                  </div>

                  <div className="product-price-row">
                    <div>
                      <span className="current-price">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <span className="rating-badge">
                      <Star size={12} fill="#f59e0b" color="#f59e0b" /> {product.rating}
                      <span className="review-count">({product.reviewCount})</span>
                    </span>
                  </div>

                  <div className="xai-explanation-box">
                    <Info size={13} className="text-blue" />
                    <span>{product.explanation}</span>
                  </div>

                  <button 
                    className="card-add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) onAddToCart(product);
                    }}
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 2: Trending & Style Bundles */}
        <div className="feed-section-header" style={{ marginTop: '2.5rem' }}>
          <h3 className="section-heading">
            <TrendingUp className="text-pink" size={20} />
            Trending & Style Matches
          </h3>
          <span className="section-tag">Cross-Category Exploration Feed</span>
        </div>

        <div className="product-grid">
          {feedProducts.slice(8, 14).map((product, index) => {
            const isLiked = wishlistItems.some(w => w.id === product.id);

            return (
              <div key={product.id} className="product-card" style={{ animationDelay: `${index * 0.06}s` }}>
                <div className="product-img-wrapper">
                  <img src={product.imageUrl} alt={product.title} className="product-img" loading="lazy" />
                  <div className="product-img-overlay"></div>
                  <button 
                    className={`like-btn ${isLiked ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(product);
                    }}
                  >
                    <Heart size={18} fill={isLiked ? '#ec4899' : 'none'} color={isLiked ? '#ec4899' : '#ffffff'} />
                  </button>
                  <div className="score-badge bg-gray">
                    <TrendingUp size={13} /> Trending
                  </div>
                </div>

                <div className="product-info">
                  <span className="product-category">{product.category} • {product.brand}</span>
                  <h4 className="product-title">{product.title}</h4>
                  <div className="product-price-row">
                    <span className="current-price">${product.price.toFixed(2)}</span>
                    <span className="rating-badge">
                      <Star size={12} fill="#f59e0b" color="#f59e0b" /> {product.rating}
                    </span>
                  </div>

                  <button 
                    className="card-add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) onAddToCart(product);
                    }}
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
