import React, { useState } from 'react';
import { Layers, Database, Upload, RefreshCw, CheckCircle2, FileCode, Sliders, ArrowRight } from 'lucide-react';

export default function DatastoreManager({ datastore }) {
  const [sourceType, setSourceType] = useState('gcs');
  const [chunkStrategy, setChunkStrategy] = useState('layout-aware');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('IDLE');

  const handleStartSync = () => {
    setIsSyncing(true);
    setSyncStatus('CONNECTING_GCS');
    setTimeout(() => setSyncStatus('EXTRACTING_PARSING'), 600);
    setTimeout(() => setSyncStatus('INDEXING_SCANN'), 1200);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('SYNC_COMPLETE');
    }, 1800);
  };

  const activeSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "id": { "type": "string", "keyPropertyMapping": "DOCUMENT_ID" },
      "title": { "type": "string", "keyPropertyMapping": "TITLE" },
      "category": { "type": "string", "keyPropertyMapping": "CATEGORY" },
      "snippet": { "type": "string" },
      "fullContent": { "type": "string" },
      "attributes": {
        "type": "object",
        "properties": {
          "confidentiality": { "type": "string" },
          "format": { "type": "string" },
          "readTime": { "type": "string" }
        }
      }
    },
    "required": ["id", "title", "fullContent"]
  };

  return (
    <div className="datastore-manager-container">
      <div className="manager-header-card">
        <div>
          <h2>DataStore Ingestion & Schema Management</h2>
          <p>Configure automated data connectors, layout parsing, chunking strategies & schema mappings for GCP Discovery Engine.</p>
        </div>
        <div className="datastore-id-pill">
          <Database size={16} /> DataStore ID: <code>{datastore.id}</code>
        </div>
      </div>

      <div className="manager-grid">
        {/* Left Column: Config Panel */}
        <div className="manager-config-panel">
          <div className="panel-card">
            <h3>1. Data Source Connector</h3>
            <div className="source-tabs">
              <button 
                className={`source-tab ${sourceType === 'gcs' ? 'active' : ''}`}
                onClick={() => setSourceType('gcs')}
              >
                <Upload size={16} /> GCS Bucket (PDF/HTML/TXT)
              </button>
              <button 
                className={`source-tab ${sourceType === 'bigquery' ? 'active' : ''}`}
                onClick={() => setSourceType('bigquery')}
              >
                <Database size={16} /> BigQuery Table
              </button>
              <button 
                className={`source-tab ${sourceType === 'crawler' ? 'active' : ''}`}
                onClick={() => setSourceType('crawler')}
              >
                <RefreshCw size={16} /> Web Crawler
              </button>
            </div>

            {sourceType === 'gcs' && (
              <div className="connector-details">
                <label>GCS URI Pattern</label>
                <input type="text" defaultValue="gs://gcp-enterprise-docs-bucket/v2/**/*.pdf" />
                <span className="help-text">Supports PDF, DOCX, PPTX, HTML, and JSON document formats.</span>
              </div>
            )}

            {sourceType === 'bigquery' && (
              <div className="connector-details">
                <label>BigQuery Table ID</label>
                <input type="text" defaultValue="gcp-project.enterprise_dw.documents_metadata" />
                <span className="help-text">Structured document schema with JSON columns.</span>
              </div>
            )}

            {sourceType === 'crawler' && (
              <div className="connector-details">
                <label>Target Domain URL</label>
                <input type="text" defaultValue="https://docs.cloud.google.com/" />
                <span className="help-text">Automated incremental site crawling & index updates.</span>
              </div>
            )}
          </div>

          <div className="panel-card">
            <h3>2. Layout Parsing & Document Chunking Strategy</h3>
            <div className="chunking-options">
              <label className={`chunk-option ${chunkStrategy === 'layout-aware' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="chunk" 
                  checked={chunkStrategy === 'layout-aware'}
                  onChange={() => setChunkStrategy('layout-aware')} 
                />
                <div>
                  <strong>Layout-Aware Document Parsing (Recommended)</strong>
                  <p>Uses Gemini Vision to parse headers, tables, diagrams, and multi-column document layouts seamlessly.</p>
                </div>
              </label>

              <label className={`chunk-option ${chunkStrategy === 'fixed' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="chunk" 
                  checked={chunkStrategy === 'fixed'}
                  onChange={() => setChunkStrategy('fixed')} 
                />
                <div>
                  <strong>Fixed Token Window (500 tokens / 50 overlap)</strong>
                  <p>Standard text splitting for simple plaintext or single-column documents.</p>
                </div>
              </label>

              <label className={`chunk-option ${chunkStrategy === 'page-level' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="chunk" 
                  checked={chunkStrategy === 'page-level'}
                  onChange={() => setChunkStrategy('page-level')} 
                />
                <div>
                  <strong>Page-Level Chunking</strong>
                  <p>Each page is indexed as an independent vector chunk with page-number metadata.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="panel-card">
            <div className="sync-action-row">
              <button 
                className={`trigger-sync-btn ${isSyncing ? 'syncing' : ''}`}
                onClick={handleStartSync}
                disabled={isSyncing}
              >
                <RefreshCw size={18} className={isSyncing ? 'spin-icon' : ''} />
                <span>{isSyncing ? 'Syncing Index...' : 'Trigger Ingestion Pipeline'}</span>
              </button>

              {syncStatus === 'SYNC_COMPLETE' && (
                <span className="sync-success-badge">
                  <CheckCircle2 size={16} /> Index Successfully Updated & ScaNN Vectors Generated
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Schema Inspector */}
        <div className="manager-schema-panel">
          <div className="schema-header">
            <FileCode size={18} />
            <span>Discovery Engine JSON Schema Mapping</span>
          </div>
          <pre className="schema-code-box">
            {JSON.stringify(activeSchema, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
