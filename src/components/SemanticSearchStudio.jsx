import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Sparkles, Filter, CheckCircle2, Zap, ArrowRight, X, DollarSign, Truck, Tag, Star } from 'lucide-react';
import { performHybridSearch, parseMultiIntentQuery } from '../data/multiIntentEngine';
import { PRODUCTS as LOCAL_PRODUCTS, USER_PERSONAS as LOCAL_PERSONAS } from '../data/catalogData';
import { performApiSearch } from '../data/api';

export default function SemanticSearchStudio({ selectedPersonaKey, products, personas }) {
  const allProducts = products || LOCAL_PRODUCTS;
  const allPersonas = personas || LOCAL_PERSONAS;
  const persona = allPersonas[selectedPersonaKey] || allPersonas.techie || { name: 'User', preferredCategories: [], vector: [], color: '#3b82f6' };
  const [searchQuery, setSearchQuery] = useState("wireless noise cancelling headphones under $260 with fast delivery");
  const [vectorWeight, setVectorWeight] = useState(0.7);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [apiResults, setApiResults] = useState(null);

  const SAMPLE_MULTI_INTENT_QUERIES = [
    "wireless noise cancelling headphones under $260 with fast delivery",
    "Japanese blue denim jacket for summer under $120",
    "barista espresso coffee machine with burr grinder under $600",
    "lightweight carbon plate running shoes under $200 with express shipping",
    "smart home hub with matter protocol under $250",
    "yoga mat eco-friendly natural rubber"
  ];

  // Perform search calculation (local fallback + API attempt)
  const { intentData, results } = useMemo(() => {
    // If we have API results, use them
    if (apiResults) return apiResults;
    // Otherwise fallback to local engine
    return performHybridSearch({
      query: searchQuery,
      category: selectedCategory,
      vectorWeight: vectorWeight,
      userPersona: persona
    });
  }, [searchQuery, selectedCategory, vectorWeight, persona, apiResults]);

  // Attempt API search on query change
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setApiResults(null); // Reset to trigger local computation

    // Try backend search
    const apiResult = await performApiSearch({
      query: query,
      category: selectedCategory,
      vectorWeight: vectorWeight,
      personaId: selectedPersonaKey
    });

    if (apiResult && apiResult.results) {
      setApiResults(apiResult);
    }
  };

  return (
    <div className="tab-container fade-in">
      {/* Workbench Card Header */}
      <div className="search-workbench-card glass-card">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={22} />
          <input
            type="text"
            className="main-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Type complex multi-intent query (e.g., 'blue denim jacket under $120 with fast delivery')..."
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => { setSearchQuery(''); setApiResults(null); }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sample Query Chips */}
        <div className="sample-queries-row">
          <span className="sample-label">Try Multi-Intent Queries:</span>
          {SAMPLE_MULTI_INTENT_QUERIES.map((q, idx) => (
            <button key={idx} className="sample-chip" onClick={() => handleSearch(q)}>
              <Sparkles size={12} /> {q}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Intent Extraction Breakdown Panel */}
      <div className="intent-card-grid">
        <div className="intent-card glass-card">
          <div className="intent-card-header">
            <Zap className="text-amber" size={18} />
            <span>PRIMARY INTENT</span>
          </div>
          <div className="intent-card-val text-amber">{intentData.primaryIntent}</div>
          <span className="intent-sub font-mono">Confidence: {(intentData.confidenceScore * 100).toFixed(1)}%</span>
        </div>

        <div className="intent-card glass-card">
          <div className="intent-card-header">
            <Filter className="text-blue" size={18} />
            <span>CATEGORY INFERRED</span>
          </div>
          <div className="intent-card-val text-blue">{intentData.categoryFilter}</div>
          <span className="intent-sub font-mono">Auto-Scoped Catalog Filter</span>
        </div>

        <div className="intent-card glass-card">
          <div className="intent-card-header">
            <DollarSign className="text-green" size={18} />
            <span>PRICE CEILING LIMIT</span>
          </div>
          <div className="intent-card-val text-green">
            {intentData.maxPrice ? `< $${intentData.maxPrice}` : 'Unconstrained'}
          </div>
          <span className="intent-sub font-mono">Extracted Numeric Constraint</span>
        </div>

        <div className="intent-card glass-card">
          <div className="intent-card-header">
            <Truck className="text-purple" size={18} />
            <span>LOGISTICS INTENT</span>
          </div>
          <div className="intent-card-val text-purple">{intentData.logisticsIntent}</div>
          <span className="intent-sub font-mono">Shipping SLA Match</span>
        </div>
      </div>

      {/* Semantic Query Expansion Badge */}
      {intentData.expandedQuery && (
        <div className="query-expansion-banner glass-card">
          <Sparkles className="text-cyan" size={16} />
          <span><strong>Semantic Query Expansion:</strong> "{searchQuery}" <ArrowRight size={14} /> "{intentData.expandedQuery}"</span>
        </div>
      )}

      {/* Hybrid Weight Tuning Slider */}
      <div className="hybrid-tuning-panel glass-card">
        <div className="tuning-header">
          <div className="flex-align">
            <SlidersHorizontal size={18} className="text-blue" />
            <h3>Hybrid Search Scorer Weighting</h3>
          </div>
          <span className="weight-display-tag">
            Dense Vector: <strong>{(vectorWeight * 100).toFixed(0)}%</strong> | Sparse BM25: <strong>{((1 - vectorWeight) * 100).toFixed(0)}%</strong>
          </span>
        </div>

        <div className="slider-wrapper">
          <span className="slider-label">0.0 (Pure BM25 Lexical)</span>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={vectorWeight}
            onChange={(e) => setVectorWeight(parseFloat(e.target.value))}
            className="hybrid-range-slider"
          />
          <span className="slider-label">1.0 (Pure Dense Vector)</span>
        </div>
      </div>

      {/* Search Results List */}
      <div className="results-container">
        <div className="results-header-row">
          <h3>Search Results ({results.length} Products Found)</h3>
          <div className="category-filter-chips">
            {["All", "Electronics", "Fashion", "Home & Kitchen", "Fitness"].map((cat) => (
              <button
                key={cat}
                className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="results-list">
          {results.map((product, index) => (
            <div key={product.id} className="result-row-card glass-card" style={{ animationDelay: `${index * 0.05}s` }}>
              <img src={product.imageUrl} alt={product.title} className="result-row-img" loading="lazy" />
              
              <div className="result-row-details">
                <div className="flex-between">
                  <span className="result-category-tag">{product.category} • {product.brand}</span>
                  <span className="result-price-tag">${product.price.toFixed(2)}</span>
                </div>
                <h4 className="result-title">{product.title}</h4>
                <p className="result-desc">{product.description}</p>
                
                <div className="product-tags">
                  {(product.tags || []).map((t, idx) => (
                    <span key={idx} className="tag-chip">#{t}</span>
                  ))}
                </div>
              </div>

              {/* Hybrid Score Breakdown Box */}
              <div className="score-breakdown-box">
                <div className="total-score-badge">
                  <Zap size={14} /> Score: <strong>{product.hybridScore}</strong>
                </div>

                <div className="sub-score-meter">
                  <div className="sub-score-label">
                    <span>Dense Vector Sim</span>
                    <span>{product.vectorScore}</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill bg-blue" style={{ width: `${product.vectorScore * 100}%` }}></div>
                  </div>
                </div>

                <div className="sub-score-meter">
                  <div className="sub-score-label">
                    <span>BM25 Sparse Lexical</span>
                    <span>{product.lexicalScore}</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill bg-purple" style={{ width: `${product.lexicalScore * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
