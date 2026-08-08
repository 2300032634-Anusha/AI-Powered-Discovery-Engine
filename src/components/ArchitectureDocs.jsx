import React, { useState } from 'react';
import { Cpu, ShieldCheck, Zap, BookOpen, Layers, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ArchitectureDocs() {
  const [activeStage, setActiveStage] = useState('ingestion');

  const stages = [
    {
      id: 'ingestion',
      title: '1. Ingestion & Layout Parsing',
      icon: Layers,
      summary: 'Data connectors pull unstructured PDFs, HTML, or BigQuery records. Gemini Vision layout parser extracts text, tables, and visual charts while preserving document structure.',
      details: [
        'Supports Cloud Storage (GCS), BigQuery, Cloud SQL, and live site Crawling.',
        'Layout-Aware OCR automatically categorizes headers, subheadings, bullet lists, and complex data tables.',
        'Incremental automated synchronization triggered via Cloud Pub/Sub audit logs.'
      ]
    },
    {
      id: 'indexing',
      title: '2. ScaNN Vector & Lexical Indexing',
      icon: Cpu,
      summary: 'Passages are converted into high-dimensional vector embeddings using Google ScaNN (Scalable Nearest Neighbors) alongside inverted lexical BM25 index structures.',
      details: [
        '768-dimensional multimodal vector embeddings generated for text and images.',
        'Sub-50ms P99 retrieval latency across 100M+ document vector indexes.',
        'Automatic OCR text extraction for scanned images and PDF diagrams.'
      ]
    },
    {
      id: 'retrieval',
      title: '3. Hybrid Retrieval & RRF Ranking',
      icon: Zap,
      summary: 'Queries undergo natural language intent parsing. Dense vector similarity and sparse BM25 lexical scores are merged using Reciprocal Rank Fusion (RRF).',
      details: [
        'Dynamic slider controls balance dense semantic context against exact keyword matching.',
        'Automatic query expansion handles synonyms, spelling corrections, and acronym expansion.',
        'Faceted metadata filtering enforces document-level security access policies in real time.'
      ]
    },
    {
      id: 'synthesis',
      title: '4. Gemini RAG Answer & Grounding',
      icon: Sparkles,
      summary: 'Top retrieved passages are passed to Gemini 1.5 Pro / Flash. The model generates a concise synthesized answer complete with inline footnote citations.',
      details: [
        'Strict grounding checks prevent hallucinations by verifying every generated sentence against source passages.',
        'Extractive segments highlight the exact sentence in original documents.',
        'Custom prompt preambles enforce enterprise tone, guidelines, and safety policies.'
      ]
    }
  ];

  return (
    <div className="arch-docs-container">
      <div className="arch-hero-card">
        <h2>Google Cloud Discovery Engine (Vertex AI Search) Architecture</h2>
        <p>End-to-End Deep Retrieval, Multi-modal Vector Indexing, Hybrid Scoring, and Generative Answer Synthesis Pipeline.</p>
      </div>

      {/* Interactive Pipeline Steps */}
      <div className="pipeline-flow-grid">
        {stages.map((stage, idx) => {
          const IconComp = stage.icon;
          const isActive = activeStage === stage.id;
          return (
            <div 
              key={stage.id} 
              className={`pipeline-card ${isActive ? 'active' : ''}`}
              onClick={() => setActiveStage(stage.id)}
            >
              <div className="card-top">
                <div className="stage-icon-box">
                  <IconComp size={22} />
                </div>
                <span className="step-num">Step 0{idx + 1}</span>
              </div>

              <h3>{stage.title}</h3>
              <p>{stage.summary}</p>
              
              <div className="card-action">
                <span>View Technical Spec</span> <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stage Deep-Dive */}
      {activeStage && (
        <div className="stage-deep-dive-card">
          <div className="dive-header">
            <CheckCircle2 size={20} className="icon-check-glow" />
            <h3>Technical Deep Dive: {stages.find(s => s.id === activeStage)?.title}</h3>
          </div>
          <ul className="dive-list">
            {stages.find(s => s.id === activeStage)?.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Enterprise Reference Grid */}
      <div className="arch-reference-grid">
        <div className="ref-card">
          <ShieldCheck size={24} className="ref-icon" />
          <h3>Enterprise IAM & Security</h3>
          <p>Enforce row-level security and ACL token claims. Discovery Engine evaluates user access rights before returning document search payloads or synthesizing RAG answers.</p>
        </div>

        <div className="ref-card">
          <Zap size={24} className="ref-icon" />
          <h3>ScaNN Vector Engine Performance</h3>
          <p>Scalable Nearest Neighbors indexing ensures P99 search latencies stay below 45ms even at billion-vector scale, with automated index re-sharding.</p>
        </div>

        <div className="ref-card">
          <BookOpen size={24} className="ref-icon" />
          <h3>Grounding & Factuality</h3>
          <p>Built-in factuality verification measures answer overlap with target snippets. Sentences failing grounding threshold checks are automatically removed or flagged.</p>
        </div>
      </div>
    </div>
  );
}
