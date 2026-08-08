import React, { useState, useMemo } from 'react';
import { 
  Search, SlidersHorizontal, Sparkles, FileText, CheckCircle2, 
  ExternalLink, Info, Filter, ArrowUpDown, Tag, Zap, ChevronRight, X, BookOpen 
} from 'lucide-react';

export default function DiscoveryStudio({ datastore, activeDatastoreKey }) {
  const [searchQuery, setSearchQuery] = useState(datastore.sampleQueries[0]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vectorWeight, setVectorWeight] = useState(0.7); // 0.0 to 1.0 (Dense vs Sparse)
  const [minRelevance, setMinRelevance] = useState(0.75);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiModelVersion, setAiModelVersion] = useState("gemini-1.5-flash");

  // Filtered & Ranked Documents based on searchQuery, category, and hybrid weighting
  const filteredDocs = useMemo(() => {
    let list = [...datastore.documents];

    if (selectedCategory !== 'All') {
      list = list.filter(d => d.category === selectedCategory);
    }

    if (!searchQuery.trim()) return list;

    const queryLower = searchQuery.toLowerCase();

    // Compute composite dynamic score based on vectorWeight slider
    return list.map(doc => {
      const textMatch = doc.title.toLowerCase().includes(queryLower) || doc.snippet.toLowerCase().includes(queryLower);
      const categoryMatch = doc.category.toLowerCase().includes(queryLower);
      
      const lexicalBoost = textMatch ? 0.35 : 0.05;
      const calcLexical = Math.min(1.0, doc.lexicalScore + lexicalBoost);
      const calcVector = doc.vectorSimilarity;

      // Composite hybrid retrieval formula: (Vector * W) + (Lexical * (1 - W))
      const combinedScore = (calcVector * vectorWeight) + (calcLexical * (1 - vectorWeight));

      return {
        ...doc,
        computedScore: Math.min(0.99, Math.max(0.60, combinedScore))
      };
    })
    .filter(d => d.computedScore >= minRelevance)
    .sort((a, b) => b.computedScore - a.computedScore);
  }, [datastore, searchQuery, selectedCategory, vectorWeight, minRelevance]);

  // Dynamic AI Synthesized Summary Answer based on top docs
  const aiGeneratedSummary = useMemo(() => {
    if (filteredDocs.length === 0) {
      return {
        summaryText: "No document passages in the selected DataStore satisfied the minimum relevance threshold for generative synthesis.",
        citations: []
      };
    }

    const topDoc = filteredDocs[0];
    if (activeDatastoreKey === 'enterprise') {
      return {
        summaryText: `Based on verified enterprise architecture documentation, ${topDoc.snippet} Fine-grained security access policies dynamically evaluate claims during query execution [1]. Furthermore, for high-throughput streaming environments, Apache Beam handles low-latency windowing with exact-once guarantees [2].`,
        citations: [
          { index: 1, title: topDoc.title, page: 2 },
          { index: 2, title: filteredDocs[1]?.title || topDoc.title, page: 3 }
        ]
      };
    } else if (activeDatastoreKey === 'ecommerce') {
      return {
        summaryText: `The highest match for your request is the ${topDoc.title} priced at ${topDoc.attributes.price || '$299.99'} [1]. Key specifications include ${topDoc.snippet} Customer feedback rates this model at ${topDoc.attributes.rating || '4.9'} stars [2].`,
        citations: [
          { index: 1, title: topDoc.title, page: 1 },
          { index: 2, title: filteredDocs[1]?.title || topDoc.title, page: 1 }
        ]
      };
    } else {
      return {
        summaryText: `Peer-reviewed scientific findings indicate that ${topDoc.snippet} Genomic whole-sequence analysis verified tissue-specific targeted uptake with non-detectable off-target mutations [1]. Single-cell transcriptomics further mapped immunological response markers [2].`,
        citations: [
          { index: 1, title: topDoc.title, doi: topDoc.attributes.doi || "10.1038/nature" },
          { index: 2, title: filteredDocs[1]?.title || topDoc.title, doi: "10.1016/j.cell" }
        ]
      };
    }
  }, [filteredDocs, activeDatastoreKey]);

  const triggerSearchSample = (q) => {
    setSearchQuery(q);
    setIsAiGenerating(true);
    setTimeout(() => setIsAiGenerating(false), 400);
  };

  return (
    <div className="discovery-studio-container">
      {/* Search Bar & Sample Chips */}
      <div className="search-workbench-card">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={22} />
          <input
            type="text"
            className="main-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${datastore.name} using natural language...`}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              <X size={18} />
            </button>
          )}
          <button 
            className="execute-search-btn"
            onClick={() => {
              setIsAiGenerating(true);
              setTimeout(() => setIsAiGenerating(false), 300);
            }}
          >
            <Sparkles size={16} /> Search & Synthesize
          </button>
        </div>

        <div className="sample-queries-bar">
          <span className="sample-label"><Zap size={14} /> Suggested Intent Queries:</span>
          <div className="chips-row">
            {datastore.sampleQueries.map((query, idx) => (
              <button 
                key={idx} 
                className={`query-chip ${searchQuery === query ? 'active-chip' : ''}`}
                onClick={() => triggerSearchSample(query)}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="studio-layout">
        {/* Left Sidebar: Controls & Facet Filters */}
        <aside className="studio-sidebar">
          <div className="control-panel-card">
            <div className="panel-header">
              <SlidersHorizontal size={18} />
              <span>Vector & Lexical Hybrid Tuning</span>
            </div>

            <div className="tuning-control">
              <div className="slider-label-row">
                <span>Sparse Lexical (BM25)</span>
                <span className="weight-badge">{Math.round((1 - vectorWeight) * 100)}% / {Math.round(vectorWeight * 100)}%</span>
                <span>Dense Vector (ScaNN)</span>
              </div>
              <input 
                type="range" 
                min="0.0" 
                max="1.0" 
                step="0.05"
                value={vectorWeight}
                onChange={(e) => setVectorWeight(parseFloat(e.target.value))}
                className="tuning-slider"
              />
              <div className="slider-hint">
                {vectorWeight > 0.7 
                  ? "Semantic conceptual retrieval prioritized (Dense Vectors)" 
                  : vectorWeight < 0.3 
                  ? "Exact keyword pattern match prioritized (Lexical BM25)" 
                  : "Balanced Hybrid RRF (Reciprocal Rank Fusion)"}
              </div>
            </div>

            <div className="tuning-control">
              <div className="slider-label-row">
                <span>Min Relevance Cutoff</span>
                <span className="cutoff-val">{Math.round(minRelevance * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="0.95" 
                step="0.05"
                value={minRelevance}
                onChange={(e) => setMinRelevance(parseFloat(e.target.value))}
                className="tuning-slider"
              />
            </div>
          </div>

          {/* Facets Panel */}
          <div className="control-panel-card">
            <div className="panel-header">
              <Filter size={18} />
              <span>Category Facets</span>
            </div>
            <div className="facet-list">
              <button 
                className={`facet-item ${selectedCategory === 'All' ? 'selected' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                <span>All Categories</span>
                <span className="facet-count">{datastore.documents.length}</span>
              </button>
              {datastore.categories.map((cat, idx) => {
                const count = datastore.documents.filter(d => d.category === cat).length;
                return (
                  <button 
                    key={idx}
                    className={`facet-item ${selectedCategory === cat ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{cat}</span>
                    <span className="facet-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Generator Settings */}
          <div className="control-panel-card">
            <div className="panel-header">
              <Sparkles size={18} />
              <span>RAG Synthesis Model</span>
            </div>
            <select 
              className="model-select"
              value={aiModelVersion}
              onChange={(e) => setAiModelVersion(e.target.value)}
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Low Latency)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context RAG)</option>
              <option value="vertex-extractive-answer">Extractive Answer Model (Snippet Only)</option>
            </select>
          </div>
        </aside>

        {/* Right Main Feed */}
        <main className="studio-feed">
          {/* AI Generative Answer Summary Card */}
          <div className={`ai-answer-card ${isAiGenerating ? 'generating' : ''}`}>
            <div className="ai-answer-header">
              <div className="ai-title">
                <Sparkles size={20} className="icon-ai-glow" />
                <span>Generative AI Answer Synthesis</span>
                <span className="grounded-badge">
                  <CheckCircle2 size={13} /> Grounded in {filteredDocs.length} Verified Sources
                </span>
              </div>
              <span className="model-tag">{aiModelVersion}</span>
            </div>

            <div className="ai-answer-body">
              {isAiGenerating ? (
                <div className="generating-loader">
                  <div className="pulse-bar"></div>
                  <span>Retrieving vector embeddings & synthesizing answer...</span>
                </div>
              ) : (
                <p className="ai-text">
                  {aiGeneratedSummary.summaryText}
                </p>
              )}
            </div>

            {aiGeneratedSummary.citations.length > 0 && !isAiGenerating && (
              <div className="citations-footer">
                <span className="citations-title"><BookOpen size={14} /> Grounding Footnotes & Citations:</span>
                <div className="citation-links">
                  {aiGeneratedSummary.citations.map((cite, i) => (
                    <span key={i} className="citation-chip" title={cite.title}>
                      [{cite.index}] {cite.title.substring(0, 32)}...
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Results Metadata Bar */}
          <div className="results-header-bar">
            <div className="results-count">
              Found <strong>{filteredDocs.length}</strong> matching document payloads for DataStore <code>{datastore.id}</code>
            </div>
            <div className="sort-indicator">
              <ArrowUpDown size={14} /> Sorted by Hybrid Score (Dense Vector: {Math.round(vectorWeight * 100)}%)
            </div>
          </div>

          {/* Document Feed */}
          {filteredDocs.length === 0 ? (
            <div className="empty-results-box">
              <Info size={36} />
              <h4>No Matched Documents</h4>
              <p>Try broadening your query, lowering the minimum relevance cutoff, or selecting "All Categories".</p>
            </div>
          ) : (
            <div className="document-list">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="doc-card" onClick={() => setSelectedDoc(doc)}>
                  <div className="doc-card-top">
                    <div className="doc-type-badge">
                      <FileText size={14} /> {doc.category}
                    </div>
                    <div className="score-badges">
                      <span className="hybrid-score-tag" title="Combined Hybrid Score">
                        Match: {Math.round((doc.computedScore || doc.relevanceScore) * 100)}%
                      </span>
                      <span className="vector-score-tag" title="Vector Similarity Score">
                        Vector: {Math.round(doc.vectorSimilarity * 100)}%
                      </span>
                    </div>
                  </div>

                  <h3 className="doc-title">{doc.title}</h3>
                  <p className="doc-snippet">{doc.snippet}</p>

                  <div className="doc-meta-row">
                    <span className="meta-item"><Tag size={13} /> {doc.author}</span>
                    <span className="meta-item">Updated: {doc.updatedAt}</span>
                    {doc.attributes?.price && <span className="meta-price">{doc.attributes.price}</span>}
                    {doc.attributes?.journal && <span className="meta-journal">{doc.attributes.journal}</span>}
                    <button className="view-detail-btn">
                      Inspect Payload <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Document Detail Modal / Drawer */}
      {selectedDoc && (
        <div className="modal-backdrop" onClick={() => setSelectedDoc(null)}>
          <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-cat"><FileText size={14} /> {selectedDoc.category}</span>
                <h2>{selectedDoc.title}</h2>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedDoc(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="score-stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Hybrid Score</span>
                  <span className="stat-val">{Math.round((selectedDoc.computedScore || selectedDoc.relevanceScore) * 100)}%</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">ScaNN Vector Sim</span>
                  <span className="stat-val">{Math.round(selectedDoc.vectorSimilarity * 100)}%</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">BM25 Lexical</span>
                  <span className="stat-val">{Math.round(selectedDoc.lexicalScore * 100)}%</span>
                </div>
              </div>

              <div className="drawer-section">
                <h3>Document Full Passage Content</h3>
                <pre className="full-content-box">{selectedDoc.fullContent}</pre>
              </div>

              {selectedDoc.groundingCitations && (
                <div className="drawer-section">
                  <h3>Grounding Snippets & Citations</h3>
                  <ul className="citation-list">
                    {selectedDoc.groundingCitations.map((c, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} className="check-icon" /> "{c.text}" (Page/Section {c.page || 1})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="drawer-section">
                <h3>Document Metadata Payload</h3>
                <pre className="json-code-block">{JSON.stringify(selectedDoc.attributes, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
