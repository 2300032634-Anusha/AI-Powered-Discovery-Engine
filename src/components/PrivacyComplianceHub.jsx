import React, { useState } from 'react';
import { ShieldCheck, Lock, Trash2, Sliders, CheckCircle2, AlertTriangle, EyeOff, RefreshCw } from 'lucide-react';

export default function PrivacyComplianceHub({ dpdpConsent, setDpdpConsent }) {
  const [purgedState, setPurgedState] = useState(false);
  const [epsilonNoise, setEpsilonNoise] = useState(0.5); // 0.1 High Privacy <-> 2.0 Low Privacy

  const handleToggle = (key) => {
    setDpdpConsent(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVectorPurge = () => {
    setPurgedState(true);
    setDpdpConsent(prev => ({
      ...prev,
      personalization: false,
      searchLogging: false,
      behavioralAnalytics: false
    }));
  };

  return (
    <div className="tab-container">
      {/* Header Banner */}
      <div className="feature-banner-card">
        <div className="flex-align">
          <ShieldCheck size={24} className="text-green" />
          <h2>13. DPDP Act & Privacy Control Center</h2>
        </div>
        <p className="banner-subtitle">
          Digital Personal Data Protection Act compliance dashboard providing zero-trust granular user consent, one-click vector erasure ("Right to be Forgotten"), and differential privacy noise controls.
        </p>
      </div>

      {/* Grid: Consent Toggles + Differential Privacy Simulator */}
      <div className="privacy-grid">
        {/* Panel 1: Granular Consent Controls */}
        <div className="consent-panel">
          <div className="panel-header">
            <h3>
              <Lock size={18} className="text-blue" />
              User Consent & Purpose Limitation Toggles
            </h3>
            <span className="status-badge bg-green">DPDP 2023 Compliant</span>
          </div>

          <div className="toggles-list">
            <div className="toggle-row">
              <div>
                <h4 className="toggle-title">Personalization Vector Processing</h4>
                <p className="toggle-desc">Allows computing user-tower embeddings to tailor feed recommendations.</p>
              </div>
              <button
                className={`switch-btn ${dpdpConsent.personalization ? 'on' : 'off'}`}
                onClick={() => handleToggle('personalization')}
              >
                {dpdpConsent.personalization ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="toggle-row">
              <div>
                <h4 className="toggle-title">Search Logging & Intent Analysis</h4>
                <p className="toggle-desc">Stores natural language queries for query expansion and BM25 tuning.</p>
              </div>
              <button
                className={`switch-btn ${dpdpConsent.searchLogging ? 'on' : 'off'}`}
                onClick={() => handleToggle('searchLogging')}
              >
                {dpdpConsent.searchLogging ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="toggle-row">
              <div>
                <h4 className="toggle-title">Cross-Session Behavioral Analytics</h4>
                <p className="toggle-desc">Tracks click-stream, cart adds, and wishlist events across login sessions.</p>
              </div>
              <button
                className={`switch-btn ${dpdpConsent.behavioralAnalytics ? 'on' : 'off'}`}
                onClick={() => handleToggle('behavioralAnalytics')}
              >
                {dpdpConsent.behavioralAnalytics ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Right to be Forgotten Section */}
          <div className="purge-box">
            <div className="flex-between">
              <div>
                <h4 className="text-pink font-bold flex-align gap-2">
                  <Trash2 size={16} /> Right to be Forgotten (Vector Erasure)
                </h4>
                <p className="purge-desc">Permanently purges all active user-tower vectors and click logs from FAISS index.</p>
              </div>

              <button
                className={`purge-action-btn ${purgedState ? 'purged' : ''}`}
                onClick={handleVectorPurge}
                disabled={purgedState}
              >
                {purgedState ? 'Vectors Wiped!' : 'Purge My Data Now'}
              </button>
            </div>

            {purgedState && (
              <div className="purge-confirm-banner">
                <CheckCircle2 size={16} className="text-green" />
                <span>All vector representations and user logs have been irreversibly erased from memory!</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Differential Privacy Noise Simulator */}
        <div className="diff-privacy-panel">
          <div className="panel-header">
            <h3>
              <Sliders size={18} className="text-purple" />
              Differential Privacy (\(\epsilon\)-Noise Injection)
            </h3>
            <span className="panel-tag">Laplace Mechanism</span>
          </div>

          <p className="privacy-info-desc">
            Inject Gaussian/Laplace noise into user query embeddings to prevent membership inference attacks while maintaining vector utility.
          </p>

          <div className="epsilon-control-box">
            <div className="flex-between mb-2">
              <span className="font-bold">Privacy Loss (\(\epsilon\)):</span>
              <span className="epsilon-val text-purple font-mono">\(\epsilon = {epsilonNoise.toFixed(2)}\)</span>
            </div>

            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={epsilonNoise}
              onChange={(e) => setEpsilonNoise(parseFloat(e.target.value))}
              className="hybrid-range-slider"
            />

            <div className="flex-between text-xs mt-2 text-gray">
              <span>0.1 (Strict Privacy / High Noise)</span>
              <span>2.0 (Low Privacy / Low Noise)</span>
            </div>
          </div>

          {/* Noise Projection Preview */}
          <div className="noise-preview-box">
            <span className="preview-lbl">Noised Embedding Vector Projection:</span>
            <div className="vec-values-box mt-2">
              {[0.85, 0.90, 0.15, 0.40, 0.80, 0.92, 0.30, 0.65].map((val, idx) => {
                const noise = (Math.random() - 0.5) * (1.0 / epsilonNoise) * 0.15;
                const noisedVal = Math.min(1.0, Math.max(0.0, val + noise));
                return (
                  <span key={idx} className="vec-num text-green">
                    {noisedVal.toFixed(2)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
