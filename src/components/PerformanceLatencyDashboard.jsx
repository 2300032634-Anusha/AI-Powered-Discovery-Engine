import React, { useState, useEffect } from 'react';
import { Activity, Server, Zap, Cpu, HardDrive, Clock, BarChart2, RefreshCw } from 'lucide-react';

export default function PerformanceLatencyDashboard({ systemLatency }) {
  const [qps, setQps] = useState(1420);
  const [cacheHitRate, setCacheHitRate] = useState(94.5);
  const [memoryMb, setMemoryMb] = useState(384);

  // Simulate live jitter telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQps(prev => Math.floor(1400 + Math.random() * 80));
      setCacheHitRate(prev => Number((94.0 + Math.random() * 1.2).toFixed(1)));
      setMemoryMb(prev => Math.floor(380 + Math.random() * 15));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tab-container">
      {/* Header Banner */}
      <div className="feature-banner-card">
        <div className="flex-align">
          <Activity size={24} className="text-green" />
          <h2>14. Real-Time Latency & SLA Performance Telemetry</h2>
        </div>
        <p className="banner-subtitle">
          Sub-50ms SLA monitoring dashboard tracking query intent parsing, FAISS vector retrieval, two-tower neural ranking, and cache hit ratios.
        </p>
      </div>

      {/* Main SLA Metrics Grid */}
      <div className="telemetry-grid">
        <div className="telemetry-card">
          <div className="card-header-row">
            <span className="card-title">P95 LATENCY SLA</span>
            <Clock size={18} className="text-green" />
          </div>
          <div className="telemetry-val text-green">{systemLatency} ms</div>
          <span className="card-sub font-mono">Target SLA: &lt; 50.0 ms</span>
        </div>

        <div className="telemetry-card">
          <div className="card-header-row">
            <span className="card-title">SYSTEM THROUGHPUT</span>
            <Zap size={18} className="text-blue" />
          </div>
          <div className="telemetry-val text-blue">{qps.toLocaleString()} QPS</div>
          <span className="card-sub font-mono">Peak Benchmark Capacity</span>
        </div>

        <div className="telemetry-card">
          <div className="card-header-row">
            <span className="card-title">CACHE HIT RATIO</span>
            <Server size={18} className="text-purple" />
          </div>
          <div className="telemetry-val text-purple">{cacheHitRate}%</div>
          <span className="card-sub font-mono">Redis L1 In-Memory Cache</span>
        </div>

        <div className="telemetry-card">
          <div className="card-header-row">
            <span className="card-title">VECTOR RAM FOOTPRINT</span>
            <HardDrive size={18} className="text-amber" />
          </div>
          <div className="telemetry-val text-amber">{memoryMb} MB</div>
          <span className="card-sub font-mono">FAISS Index Memory Overhead</span>
        </div>
      </div>

      {/* Pipeline Stage Latency Breakdown */}
      <div className="stage-breakdown-card mt-6">
        <div className="section-header-row">
          <h3>
            <BarChart2 size={20} className="text-blue" />
            End-to-End Pipeline Stage Latency Breakdown (ms)
          </h3>
          <span className="section-tag font-mono">Execution Microseconds Profiler</span>
        </div>

        <div className="stages-list">
          <div className="stage-row">
            <div className="flex-between">
              <span className="stage-name font-bold">1. Multi-Intent NLP Query Parser</span>
              <span className="stage-time text-green font-mono">4.2 ms</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill bg-green" style={{ width: '15%' }}></div>
            </div>
          </div>

          <div className="stage-row">
            <div className="flex-between">
              <span className="stage-name font-bold">2. FAISS ANN Vector Retrieval (IndexHNSW)</span>
              <span className="stage-time text-purple font-mono">1.8 ms</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill bg-purple" style={{ width: '8%' }}></div>
            </div>
          </div>

          <div className="stage-row">
            <div className="flex-between">
              <span className="stage-name font-bold">3. Two-Tower Neural Ranking & Dot Product</span>
              <span className="stage-time text-blue font-mono">12.5 ms</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill bg-blue" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="stage-row">
            <div className="flex-between">
              <span className="stage-name font-bold">4. MMR Diversity & Category Guardrail Re-Ranking</span>
              <span className="stage-time text-amber font-mono">5.1 ms</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill bg-amber" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Percentiles Table */}
      <div className="sla-table-card mt-6">
        <h4>Latency SLA Percentiles Summary</h4>
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Percentile</th>
              <th>Target SLA</th>
              <th>Observed Latency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>P50 (Median)</td>
              <td>&lt; 20 ms</td>
              <td className="font-mono text-green">12.4 ms</td>
              <td><span className="status-badge bg-green">PASSED</span></td>
            </tr>
            <tr>
              <td>P95 (95th Percentile)</td>
              <td>&lt; 50 ms</td>
              <td className="font-mono text-green">26.8 ms</td>
              <td><span className="status-badge bg-green">PASSED</span></td>
            </tr>
            <tr>
              <td>P99 (Tail Latency)</td>
              <td>&lt; 100 ms</td>
              <td className="font-mono text-green">45.2 ms</td>
              <td><span className="status-badge bg-green">PASSED</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
