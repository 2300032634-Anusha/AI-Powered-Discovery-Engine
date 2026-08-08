import React, { useState } from 'react';
import { UserCheck, RefreshCw, Sparkles, CheckCircle2, Sliders, Play, TrendingUp, HelpCircle } from 'lucide-react';
import { simulateColdStartBandit } from '../data/faissEngine';
import { PRODUCTS } from '../data/catalogData';

export default function ColdStartBanditStudio() {
  const [algorithm, setAlgorithm] = useState("thompson"); // thompson vs ucb
  const [iterations, setIterations] = useState(50);
  const [banditResults, setBanditResults] = useState(() => simulateColdStartBandit("thompson", 50));
  
  // Interactive Onboarding Quiz State
  const [quizStep, setQuizStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleRunBandit = () => {
    const res = simulateColdStartBandit(algorithm, iterations);
    setBanditResults(res);
  };

  const handleStyleToggle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  return (
    <div className="tab-container">
      {/* Header Banner */}
      <div className="feature-banner-card">
        <div className="flex-align">
          <UserCheck size={24} className="text-green" />
          <h2>9. Cold-Start Recommendation Engine & Multi-Armed Bandits</h2>
        </div>
        <p className="banner-subtitle">
          Solve zero-history user cold start and new item exploration bottlenecks using Thompson Sampling, Upper Confidence Bound (UCB), and interactive onboarding preference bootstrapping.
        </p>
      </div>

      {/* Grid: Bandit Simulator & Onboarding Quiz */}
      <div className="coldstart-grid">
        {/* Panel 1: Multi-Armed Bandit (MAB) Simulation */}
        <div className="bandit-panel">
          <div className="panel-header">
            <h3>
              <TrendingUp size={18} className="text-purple" />
              Multi-Armed Bandit (MAB) Strategy Simulator
            </h3>
            <span className="panel-tag font-mono">Exploration vs Exploitation Tradeoff</span>
          </div>

          <div className="controls-row">
            <div className="control-group">
              <label>MAB Algorithm:</label>
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="select-input">
                <option value="thompson">Thompson Sampling (Bayesian Beta-Binomial)</option>
                <option value="ucb">Upper Confidence Bound (UCB1)</option>
              </select>
            </div>

            <div className="control-group">
              <label>Iterations (Traffic Pulls):</label>
              <select value={iterations} onChange={(e) => setIterations(parseInt(e.target.value))} className="select-input">
                <option value={25}>25 Traffic Impressions</option>
                <option value={50}>50 Traffic Impressions</option>
                <option value={100}>100 Traffic Impressions</option>
              </select>
            </div>

            <button className="run-bandit-btn" onClick={handleRunBandit}>
              <Play size={15} /> Run Simulation
            </button>
          </div>

          {/* Arms Performance Cards */}
          <div className="arms-grid">
            {banditResults.arms.map((arm) => (
              <div key={arm.id} className="arm-card">
                <div className="flex-between">
                  <h4 className="arm-name">{arm.name}</h4>
                  <span className="arm-ctr-badge text-green">CTR: {(arm.estimatedCTR * 100).toFixed(1)}%</span>
                </div>
                <div className="arm-stats">
                  <span>Pulls: {arm.pulls}</span>
                  <span>Rewards: {arm.rewards}</span>
                  {algorithm === "thompson" && <span>\(\alpha={arm.alpha}, \beta={arm.beta}\)</span>}
                </div>
                <div className="meter-track mt-2">
                  <div className="meter-fill bg-purple" style={{ width: `${arm.estimatedCTR * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Pulled Log */}
          <div className="bandit-log-box">
            <span className="log-title">Simulation Log Trajectory (Last 5 Pulls):</span>
            {banditResults.history.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="log-row">
                <span>Pull #{item.step}: Selected <strong>{item.armChosen}</strong></span>
                <span className={item.reward ? 'text-green font-bold' : 'text-gray'}>
                  {item.reward ? '★ User Clicked (Reward = 1)' : 'x Passed (Reward = 0)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Interactive Cold-Start Onboarding Quiz */}
        <div className="quiz-panel">
          <div className="panel-header">
            <h3>
              <HelpCircle size={18} className="text-amber" />
              New Visitor Onboarding Preference Quiz
            </h3>
            <span className="panel-tag">Bootstraps User Vector in 3 Clicks</span>
          </div>

          {!quizCompleted ? (
            <div className="quiz-body">
              {quizStep === 1 && (
                <div className="quiz-step-card">
                  <span className="step-count">Step 1 of 2</span>
                  <h4>What styles and categories interest you today?</h4>
                  <div className="quiz-options-grid">
                    {["High-End Audio & Tech", "Minimalist Streetwear", "Artisanal Coffee & Cooking", "Marathon Running & Fitness"].map((cat) => (
                      <button
                        key={cat}
                        className={`quiz-option-btn ${selectedStyles.includes(cat) ? 'selected' : ''}`}
                        onClick={() => handleStyleToggle(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button
                    className="next-quiz-btn"
                    disabled={selectedStyles.length === 0}
                    onClick={() => setQuizStep(2)}
                  >
                    Next Step <Sparkles size={16} />
                  </button>
                </div>
              )}

              {quizStep === 2 && (
                <div className="quiz-step-card">
                  <span className="step-count">Step 2 of 2</span>
                  <h4>What is your target budget range?</h4>
                  <div className="quiz-options-grid">
                    {["Under $50 (Bargain)", "$50 - $200 (Standard)", "$200+ (Premium Flagship)"].map((b) => (
                      <button
                        key={b}
                        className={`quiz-option-btn ${selectedBudget === b ? 'selected' : ''}`}
                        onClick={() => setSelectedBudget(b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <button
                    className="next-quiz-btn"
                    disabled={!selectedBudget}
                    onClick={() => setQuizCompleted(true)}
                  >
                    Generate Initial Vector <CheckCircle2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="quiz-completed-box">
              <CheckCircle2 size={36} className="text-green" />
              <h4>Initial User Vector Generated!</h4>
              <p>Preferences: {selectedStyles.join(', ')} | Budget: {selectedBudget}</p>
              <div className="vector-mini-preview justify-center my-3">
                {[0.82, 0.75, 0.40, 0.90, 0.60, 0.85, 0.30, 0.70].map((v, i) => (
                  <span key={i} className="vec-bar bg-green" style={{ height: `${v * 28 + 4}px` }}></span>
                ))}
              </div>
              <button className="reset-quiz-btn" onClick={() => { setQuizStep(1); setQuizCompleted(false); }}>
                Reset Onboarding Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
