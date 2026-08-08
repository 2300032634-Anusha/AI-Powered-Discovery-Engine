import React, { useState } from 'react';
import { Eye, Layers, ShoppingBag, Sparkles, CheckCircle2, RefreshCw, Palette, ArrowRight, Tag, Star } from 'lucide-react';
import { PRODUCTS as LOCAL_PRODUCTS } from '../data/catalogData';

export default function MultimodalCompleteLook({ products }) {
  const allProducts = products || LOCAL_PRODUCTS;
  const [anchorProductId, setAnchorProductId] = useState("prod-010");
  const [addedBundleToCart, setAddedBundleToCart] = useState(false);

  const anchorProduct = allProducts.find(p => p.id === anchorProductId) || allProducts[5] || allProducts[0];

  // Complete the look matched items
  const matchedLookItems = allProducts.filter(p => (anchorProduct.completeTheLook || []).includes(p.id));

  // Frequently bought together matched items
  const fbtItems = allProducts.filter(p => (anchorProduct.frequentlyBoughtTogether || []).includes(p.id));

  // Calculate bundle pricing & savings
  const bundleTotalPrice = [anchorProduct, ...fbtItems].reduce((acc, curr) => acc + curr.price, 0);
  const bundleDiscountedPrice = bundleTotalPrice * 0.85;
  const bundleSavings = bundleTotalPrice - bundleDiscountedPrice;

  return (
    <div className="tab-container fade-in">
      {/* Header Banner */}
      <div className="feature-banner-card glass-card">
        <div className="flex-align">
          <Eye size={24} className="text-pink" />
          <h2>Multimodal Embeddings, Complete the Look & Bundles</h2>
        </div>
        <p className="banner-subtitle">
          Text + Vision multimodal fusion vectors (512-dim) power visual outfit completion, aesthetic color harmony matching, and FP-Growth association bundle generation.
        </p>
      </div>

      {/* Anchor Product Selector */}
      <div className="anchor-selector-row">
        <span className="anchor-label">Select Anchor Product:</span>
        <div className="anchor-chips">
          {allProducts.slice(0, 10).map((prod) => (
            <button
              key={prod.id}
              className={`anchor-chip ${anchorProductId === prod.id ? 'active' : ''}`}
              onClick={() => {
                setAnchorProductId(prod.id);
                setAddedBundleToCart(false);
              }}
            >
              {prod.title}
            </button>
          ))}
        </div>
      </div>

      {/* Multimodal Vector & Anchor Details */}
      <div className="multimodal-details-grid">
        <div className="anchor-main-card glass-card">
          <div className="card-badge bg-pink">Anchor Item</div>
          <img src={anchorProduct.imageUrl} alt={anchorProduct.title} className="anchor-img" loading="lazy" />
          <div className="anchor-body">
            <span className="anchor-cat">{anchorProduct.category} • {anchorProduct.brand}</span>
            <h3 className="anchor-title">{anchorProduct.title}</h3>
            <span className="anchor-price">${anchorProduct.price.toFixed(2)}</span>
            <p className="anchor-desc">{anchorProduct.description}</p>

            {/* Color Palette Display */}
            <div className="palette-row">
              <Palette size={14} className="text-purple" />
              <span>Extracted Palette:</span>
              <div className="color-swatches">
                {(anchorProduct.colorPalette || []).map((hex, idx) => (
                  <span key={idx} className="swatch-circle" style={{ backgroundColor: hex }} title={hex}></span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 512-Dim Vector Projection */}
        <div className="vector-inspector-card glass-card">
          <h4>
            <Layers className="text-blue" size={18} />
            Multimodal Vector Fusion (CLIP / SigLIP 512-dim)
          </h4>
          <p className="inspector-desc">
            Text embedding (title, tags) is fused with ViT visual patch tokens to form a single cross-modal joint embedding.
          </p>

          <div className="vector-dual-view">
            <div className="vector-channel">
              <span className="channel-lbl">Visual Vision Embedding Vector</span>
              <div className="vec-values-box">
                {(anchorProduct.visualEmbedding || []).map((v, i) => (
                  <span key={i} className="vec-num text-purple">{v.toFixed(2)}</span>
                ))}
              </div>
            </div>

            <div className="vector-channel">
              <span className="channel-lbl">Textual Semantic Embedding Vector</span>
              <div className="vec-values-box">
                {(anchorProduct.textEmbedding || []).map((v, i) => (
                  <span key={i} className="vec-num text-blue">{v.toFixed(2)}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="fusion-status-pill">
            <Sparkles size={14} className="text-pink" />
            <span>Cross-Modal Similarity Cosine Alignment: <strong>0.942 (High Harmony)</strong></span>
          </div>
        </div>
      </div>

      {/* Feature 7: Complete the Look */}
      <div className="stylist-section">
        <div className="section-header-row">
          <h3>
            <Sparkles className="text-pink" size={20} />
            7. Complete the Look (AI Visual Stylist)
          </h3>
          <span className="section-tag">Color Harmony & Aesthetic Silhouette Alignment</span>
        </div>

        <div className="look-grid">
          {matchedLookItems.map((item) => (
            <div key={item.id} className="look-card glass-card">
              <img src={item.imageUrl} alt={item.title} className="look-img" loading="lazy" />
              <div className="look-body">
                <span className="look-cat">{item.category} • {item.subCategory}</span>
                <h4 className="look-title">{item.title}</h4>
                <div className="flex-between">
                  <span className="look-price">${item.price.toFixed(2)}</span>
                  <span className="harmony-pill bg-pink">
                    Style Match: 96%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 8: Frequently Bought Together */}
      <div className="fbt-section">
        <div className="section-header-row">
          <h3>
            <ShoppingBag className="text-green" size={20} />
            8. Frequently Bought Together (FP-Growth Association Rules)
          </h3>
          <span className="section-tag font-mono">Apriori Mining: Support = 0.082 | Confidence = 0.86 | Lift = 4.2x</span>
        </div>

        <div className="bundle-box glass-card">
          <div className="bundle-items-row">
            <div className="bundle-item">
              <img src={anchorProduct.imageUrl} alt={anchorProduct.title} className="bundle-thumb" loading="lazy" />
              <div className="bundle-item-name">{anchorProduct.title}</div>
              <div className="bundle-item-price">${anchorProduct.price.toFixed(2)}</div>
            </div>

            <span className="plus-sign">+</span>

            {fbtItems.map((item, idx) => (
              <React.Fragment key={item.id}>
                <div className="bundle-item">
                  <img src={item.imageUrl} alt={item.title} className="bundle-thumb" loading="lazy" />
                  <div className="bundle-item-name">{item.title}</div>
                  <div className="bundle-item-price">${item.price.toFixed(2)}</div>
                </div>
                {idx < fbtItems.length - 1 && <span className="plus-sign">+</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="bundle-checkout-card">
            <div className="bundle-price-info">
              <div className="original-bundle-total">Total Price: <s>${bundleTotalPrice.toFixed(2)}</s></div>
              <div className="discounted-bundle-total text-green">
                Bundle Price (15% Off): <strong>${bundleDiscountedPrice.toFixed(2)}</strong>
              </div>
              <div className="savings-tag">You Save: ${bundleSavings.toFixed(2)}</div>
            </div>

            <button
              className={`add-bundle-btn ${addedBundleToCart ? 'added' : ''}`}
              onClick={() => setAddedBundleToCart(true)}
            >
              {addedBundleToCart ? (
                <>
                  <CheckCircle2 size={18} /> Bundle Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add All to Cart (Save 15%)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
