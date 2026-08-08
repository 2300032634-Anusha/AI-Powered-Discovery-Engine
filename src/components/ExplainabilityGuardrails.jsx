import React, { useState, useMemo } from 'react';
import { HelpCircle, Sliders, ShieldAlert, CheckCircle2, BarChart2, PieChart, Sparkles, RefreshCw } from 'lucide-react';
import { PRODUCTS as LOCAL_PRODUCTS, USER_PERSONAS as LOCAL_PERSONAS } from '../data/catalogData';
import { applyMMRDiversity } from '../data/faissEngine';

export default function ExplainabilityGuardrails({ selectedPersonaKey, products, personas }) {
  const allProducts = products || LOCAL_PRODUCTS;
  const allPersonas = personas || LOCAL_PERSONAS;
  const persona = allPersonas[selectedPersonaKey] || allPersonas.techie || { name: 'User', color: '#3b82f6' };
  const [lambdaParam, setLambdaParam] = useState(0.65);
  const [selectedProduct, setSelectedProduct] = useState(allProducts[0]);

  const mmrResults = useMemo(() => {
    const rawItems = allProducts.map((p, idx) => ({
      ...p,
      hybridScore: Number((0.95 - (idx * 0.04)).toFixed(2))
    }));

    const mmrList = applyMMRDiversity(rawItems, lambdaParam, 6);
    return {
      rawList: rawItems.slice(0, 6),
      mmrList
    };
  }, [lambdaParam, allProducts]);

  const categoryEntropy = useMemo(() => {
    const categories = mmrResults.mmrList.map(item => item.category);
    const unique = new Set(categories);
    return Number((unique.size / 4.0).toFixed(2));
  }, [mmrResults]);

  return (
    <div className="tab-container fade-in">
      <div className="feature-banner-card glass-card">
        <div className="flex-align">
          <HelpCircle size={24} className="text-amber" />
          <h2>11-12. Recommendation Explanations (XAI) & Diversity Guardrails</h2>
        </div>
        <p className="banner-subtitle">
          Transparent Feature Attribution breakdown (XAI) paired with Maximal Marginal Relevance (MMR) intra-list diversity controls to eliminate recommendation echo chambers.
        </p>
      </div>

      <div className="xai-section">
        <div className="section-header-row">
          <h3><PieChart size={20} className="text-blue" /> 11. Explainable AI (XAI) Feature Attribution Inspector</h3>
          <span className="section-tag">SHAP / Integrated Gradients Value Breakdown</span>
        </div>

        <div className="xai-inspector-grid">
          <div className="xai-product-selector">
            <span className="selector-title">Select Product to Inspect Rationale:</span>
            <div className="xai-thumbs-list">
              {allProducts.slice(0, 7).map((p) => (
                <div key={p.id} className={`xai-thumb-card ${selectedProduct.id === p.id ? 'active' : ''}`} onClick={() => setSelectedProduct(p)}>
                  <img src={p.imageUrl} alt={p.title} className="thumb-img" loading="lazy" />
                  <div className="thumb-info">
                    <span className="thumb-cat">{p.category}</span>
                    <h5 className="thumb-title">{p.title}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="xai-details-card glass-card">
            <div className="flex-between">
              <h4>Feature Attribution for: <strong className="text-blue">{selectedProduct.title}</strong></h4>
              <span className="price-tag">${selectedProduct.price.toFixed(2)}</span>
            </div>

            <div className="explanation-quote-box">
              <Sparkles size={16} className="text-amber" />
              <span>"{selectedProduct.explanation}"</span>
            </div>

            <div className="feature-bars-list">
              {[
                { label: 'User Browsing & Interaction History', key: 'userHistory', color: 'bg-blue', textColor: 'text-blue' },
                { label: 'Two-Tower Vector Embedding Similarity', key: 'vectorSim', color: 'bg-purple', textColor: 'text-purple' },
                { label: 'Category Trending & Popularity Velocity', key: 'categoryTrend', color: 'bg-pink', textColor: 'text-pink' },
                { label: 'Target Price & Spend Fit', key: 'priceFit', color: 'bg-green', textColor: 'text-green' }
              ].map(feat => (
                <div key={feat.key} className="feature-bar-row">
                  <div className="flex-between">
                    <span>{feat.label}</span>
                    <span className={`font-mono font-bold ${feat.textColor}`}>{(selectedProduct.xaiWeights || {})[feat.key] || 0}%</span>
                  </div>
                  <div className="meter-track">
                    <div className={`meter-fill ${feat.color}`} style={{ width: `${(selectedProduct.xaiWeights || {})[feat.key] || 0}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mmr-section mt-6">
        <div className="section-header-row">
          <h3><ShieldAlert size={20} className="text-pink" /> 12. Diversity Guardrails (Maximal Marginal Relevance - MMR)</h3>
          <span className="section-tag font-mono">\(\text{MMR} = \text{ArgMax} \left[ \lambda \cdot \text{Sim}_1(d_i, Q) - (1-\lambda) \cdot \max \text{Sim}_2(d_i, d_j) \right]\)</span>
        </div>

        <div className="mmr-slider-card glass-card">
          <div className="flex-between">
            <span className="font-bold">MMR Tradeoff Parameter (\(\lambda\)):</span>
            <span className="lambda-tag">\(\lambda = {lambdaParam.toFixed(2)}\) (Relevance: {(lambdaParam * 100).toFixed(0)}% | Diversity: {((1 - lambdaParam) * 100).toFixed(0)}%)</span>
          </div>
          <div className="slider-wrapper my-3">
            <span className="slider-label">0.0 (Max Diversity / Wide Exploration)</span>
            <input type="range" min="0.10" max="1.00" step="0.05" value={lambdaParam} onChange={(e) => setLambdaParam(parseFloat(e.target.value))} className="hybrid-range-slider" />
            <span className="slider-label">1.0 (Max Relevance / Filter Bubble)</span>
          </div>
          <div className="metrics-row">
            <div className="metric-badge"><span>Category Entropy Score:</span><strong className="text-green font-mono">{categoryEntropy} / 1.00</strong></div>
            <div className="metric-badge"><span>Intra-List Price Variance:</span><strong className="text-purple font-mono">High ($29 - $1,199)</strong></div>
            <div className="metric-badge"><span>Filter Bubble Risk:</span><strong className={lambdaParam > 0.85 ? 'text-amber' : 'text-green'}>{lambdaParam > 0.85 ? 'High Risk' : 'Protected by Guardrails'}</strong></div>
          </div>
        </div>

        <div className="comparison-dual-grid">
          <div className="list-column-card glass-card">
            <h4 className="column-title text-amber">Pure Relevance Ranking (\(\lambda=1.0\))</h4>
            <p className="column-sub">High category clustering / redundancy</p>
            <div className="mini-products-list">
              {mmrResults.rawList.map((item, idx) => (
                <div key={idx} className="mini-product-row">
                  <span className="rank-num">#{idx + 1}</span>
                  <img src={item.imageUrl} alt={item.title} className="mini-thumb" loading="lazy" />
                  <div className="mini-details">
                    <span className="mini-title">{item.title}</span>
                    <span className="mini-cat">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="list-column-card border-green glass-card">
            <h4 className="column-title text-green">MMR Re-Ranked (\(\lambda={lambdaParam.toFixed(2)}\))</h4>
            <p className="column-sub">Balanced categories, styles & prices</p>
            <div className="mini-products-list">
              {mmrResults.mmrList.map((item, idx) => (
                <div key={idx} className="mini-product-row bg-green-subtle">
                  <span className="rank-num text-green">#{idx + 1}</span>
                  <img src={item.imageUrl} alt={item.title} className="mini-thumb" loading="lazy" />
                  <div className="mini-details">
                    <span className="mini-title">{item.title}</span>
                    <span className="mini-cat font-bold text-purple">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
