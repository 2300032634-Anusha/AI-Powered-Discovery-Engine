import React, { useState, useMemo } from 'react';
import { Cpu, Layers, Activity, Zap, CheckCircle2, BarChart2, Server, Globe, Database } from 'lucide-react';
import { FAISS_INDEX_TYPES, computeTwoTowerMatrix } from '../data/faissEngine';
import { PRODUCTS as LOCAL_PRODUCTS, USER_PERSONAS as LOCAL_PERSONAS } from '../data/catalogData';

export default function TwoTowerFaissStudio({ selectedPersonaKey, products, personas }) {
  const allProducts = products || LOCAL_PRODUCTS;
  const allPersonas = personas || LOCAL_PERSONAS;
  const persona = allPersonas[selectedPersonaKey] || allPersonas.techie || { name: 'User', vector: [], color: '#3b82f6' };
  const [selectedIndex, setSelectedIndex] = useState("IndexHNSW");

  // Compute Two-Tower dot-product similarity matrix
  const similarityMatrix = useMemo(() => {
    // Use local computation with the (possibly API-fetched) data
    const userVec = persona.vector || [];
    const matrix = allProducts.map(prod => {
      let dotProduct = 0;
      const tEmb = prod.textEmbedding || [];
      for (let i = 0; i < Math.min(userVec.length, tEmb.length); i++) {
        dotProduct += userVec[i] * tEmb[i];
      }
      const similarityScore = Number((dotProduct / 8.0).toFixed(3));
      return {
        productId: prod.id,
        title: prod.title,
        category: prod.category,
        price: prod.price,
        imageUrl: prod.imageUrl,
        similarityScore: Math.min(0.99, Math.max(0.30, similarityScore))
      };
    });
    matrix.sort((a, b) => b.similarityScore - a.similarityScore);
    return matrix;
  }, [selectedPersonaKey, allProducts, persona]);

  const activeIndexSpec = FAISS_INDEX_TYPES[selectedIndex];

  return (
    <div className="tab-container fade-in">
      {/* Two-Tower Model Architecture Diagram Header */}
      <div className="architecture-banner-card glass-card">
        <div className="banner-title-row">
          <Cpu size={24} className="text-blue" />
          <h2>Two-Tower Deep Retrieval & FAISS Index Simulator</h2>
        </div>
        <p className="banner-subtitle">
          Dual neural network towers compute high-dimensional embeddings for User Context (Tower A) and Catalog Items (Tower B), enabling sub-5ms vector dot-product retrieval.
        </p>

        {/* Visual Two Tower Model Graphic */}
        <div className="two-tower-graphic">
          <div className="tower-box user-tower">
            <h4 className="tower-title">USER TOWER (Tower A)</h4>
            <div className="tower-layers">
              <span className="layer-badge">User Persona Vector [{persona.name}]</span>
              <span className="layer-badge">Session Context & Click Stream</span>
              <span className="layer-badge">Dense Embedding Projection (d=512)</span>
            </div>
            <div className="vector-mini-preview">
              {(persona.vector || []).slice(0, 8).map((val, idx) => (
                <span key={idx} className="vec-bar" style={{ height: `${Math.abs(val) * 28 + 4}px` }}></span>
              ))}
            </div>
          </div>

          <div className="dot-product-bridge">
            <div className="dot-circle">
              <Zap size={20} className="text-amber" />
              <span>Dot Product \(\mathbf{U} \cdot \mathbf{V}\)</span>
            </div>
            <div className="bridge-line"></div>
          </div>

          <div className="tower-box item-tower">
            <h4 className="tower-title">ITEM TOWER (Tower B)</h4>
            <div className="tower-layers">
              <span className="layer-badge">Product Titles & Description</span>
              <span className="layer-badge">Category & Price Attributes</span>
              <span className="layer-badge">Multimodal Visual Embeddings</span>
            </div>
            <div className="vector-mini-preview">
              {[0.85, 0.90, 0.15, 0.40, 0.80, 0.92, 0.30, 0.65].map((val, idx) => (
                <span key={idx} className="vec-bar bg-purple" style={{ height: `${val * 28 + 4}px` }}></span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAISS Vector Index Selector & Benchmarks */}
      <div className="faiss-benchmark-section">
        <div className="section-header-row">
          <h3>
            <Database className="text-purple" size={20} />
            FAISS Vector Indexing & SLA Benchmarks
          </h3>
          <span className="section-tag">Approximate Nearest Neighbor (ANN) Algorithms</span>
        </div>

        <div className="index-type-grid">
          {Object.keys(FAISS_INDEX_TYPES).map((key) => {
            const indexItem = FAISS_INDEX_TYPES[key];
            const isSelected = selectedIndex === key;
            return (
              <div
                key={key}
                className={`index-card glass-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedIndex(key)}
              >
                <div className="flex-between">
                  <span className="index-name font-mono">{indexItem.name}</span>
                  {isSelected && <CheckCircle2 size={18} className="text-green" />}
                </div>
                <p className="index-desc">{indexItem.description}</p>
                
                <div className="index-metrics-mini">
                  <div>
                    <span className="mini-lbl">Search SLA</span>
                    <span className="mini-val text-green">{indexItem.searchLatencyMs} ms</span>
                  </div>
                  <div>
                    <span className="mini-lbl">Throughput</span>
                    <span className="mini-val text-blue">{indexItem.qps} QPS</span>
                  </div>
                  <div>
                    <span className="mini-lbl">Recall@10</span>
                    <span className="mini-val text-purple">{(indexItem.recallAt10 * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="index-detail-spec glass-card">
          <div className="spec-header">
            <h4>Active Vector Index: <strong className="text-purple">{activeIndexSpec.name}</strong></h4>
            <span className="complexity-badge font-mono">Complexity: {activeIndexSpec.complexity}</span>
          </div>
          <p className="spec-recommendation">{activeIndexSpec.bestFor}</p>

          <div className="spec-grid">
            <div className="spec-pill"><span className="lbl">Index Build Time</span><span className="val">{activeIndexSpec.buildTimeMs} ms</span></div>
            <div className="spec-pill"><span className="lbl">Search Latency</span><span className="val text-green">{activeIndexSpec.searchLatencyMs} ms</span></div>
            <div className="spec-pill"><span className="lbl">Throughput QPS</span><span className="val text-blue">{activeIndexSpec.qps.toLocaleString()} QPS</span></div>
            <div className="spec-pill"><span className="lbl">Accuracy Recall@10</span><span className="val text-purple">{(activeIndexSpec.recallAt10 * 100).toFixed(1)}%</span></div>
            <div className="spec-pill"><span className="lbl">RAM Footprint</span><span className="val">{activeIndexSpec.memoryOverheadMb} MB</span></div>
          </div>
        </div>
      </div>

      {/* Two-Tower User-Item Matrix Results */}
      <div className="similarity-matrix-section">
        <div className="section-header-row">
          <h3>
            <BarChart2 className="text-amber" size={20} />
            Two-Tower Vector Dot-Product Scores [{persona.name}]
          </h3>
          <span className="section-tag">Ranked by Inner Product Matrix Match</span>
        </div>

        <div className="matrix-grid">
          {similarityMatrix.map((item) => (
            <div key={item.productId} className="matrix-card glass-card">
              <img src={item.imageUrl} alt={item.title} className="matrix-card-img" loading="lazy" />
              <div className="matrix-card-body">
                <span className="matrix-category">{item.category}</span>
                <h5 className="matrix-title">{item.title}</h5>
                <div className="flex-between">
                  <span className="matrix-price">${item.price.toFixed(2)}</span>
                  <span className="matrix-score-pill">
                    Dot Sim: <strong>{item.similarityScore}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
