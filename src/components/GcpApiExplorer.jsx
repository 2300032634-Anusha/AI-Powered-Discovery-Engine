import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Play, Server, FileJson, Sparkles } from 'lucide-react';
import { API_SNIPPETS } from '../data/mockDataStores';

export default function GcpApiExplorer({ datastoreKey, datastore }) {
  const [lang, setLang] = useState('python');
  const [copied, setCopied] = useState(false);
  const [testQuery, setTestQuery] = useState('BigQuery row-level security best practices');
  const [gcpProjectId, setGcpProjectId] = useState('gcp-enterprise-prod-01');
  const [location, setLocation] = useState('global');
  const [isSimulating, setIsSimulating] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const getSnippet = () => {
    if (lang === 'python') return API_SNIPPETS.pythonSearch(datastore.id, testQuery, 0.7);
    if (lang === 'node') return API_SNIPPETS.nodeSearch(datastore.id, testQuery);
    return API_SNIPPETS.curlSearch(datastore.id, testQuery);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateCall = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setApiResponse({
        summary: {
          summaryText: `Generative RAG Answer: Based on verified source documents, ${datastore.documents[0].snippet}`,
          summarySkipped: false,
          safetyAttributes: {
            categories: ["Hate Speech", "Harassment", "Dangerous Content"],
            scores: [0.01, 0.02, 0.01]
          }
        },
        results: datastore.documents.map(d => ({
          id: d.id,
          relevanceScore: d.relevanceScore,
          document: {
            name: `projects/${gcpProjectId}/locations/${location}/collections/default_collection/dataStores/${datastore.id}/branches/0/documents/${d.id}`,
            id: d.id,
            schemaId: "default_schema",
            derivedStructData: {
              title: d.title,
              category: d.category,
              snippet: d.snippet,
              extractive_answers: [
                { content: d.snippet, pageNumber: "1" }
              ]
            }
          }
        })),
        totalSize: datastore.documents.length,
        attributionToken: "c18a902f-5b4d-491a-8e2a"
      });
    }, 600);
  };

  return (
    <div className="api-explorer-container">
      <div className="api-header-box">
        <div className="api-title-row">
          <Code2 size={24} className="icon-code" />
          <div>
            <h2>Google Cloud Discovery Engine API Explorer</h2>
            <p>Generate production SDK code for <code>projects.locations.dataStores.servingConfigs.search</code></p>
          </div>
        </div>

        <div className="api-config-bar">
          <div className="input-group">
            <label>GCP Project ID</label>
            <input 
              type="text" 
              value={gcpProjectId} 
              onChange={(e) => setGcpProjectId(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label>Location / Region</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="global">global (Multi-region)</option>
              <option value="us">us (United States)</option>
              <option value="eu">eu (European Union)</option>
            </select>
          </div>

          <div className="input-group flex-grow">
            <label>Search Query Test Parameter</label>
            <input 
              type="text" 
              value={testQuery} 
              onChange={(e) => setTestQuery(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="api-workbench-grid">
        {/* Code Snippet Column */}
        <div className="code-column">
          <div className="code-toolbar">
            <div className="lang-tabs">
              <button 
                className={`lang-tab ${lang === 'python' ? 'active' : ''}`}
                onClick={() => setLang('python')}
              >
                Python SDK
              </button>
              <button 
                className={`lang-tab ${lang === 'node' ? 'active' : ''}`}
                onClick={() => setLang('node')}
              >
                Node.js SDK
              </button>
              <button 
                className={`lang-tab ${lang === 'curl' ? 'active' : ''}`}
                onClick={() => setLang('curl')}
              >
                cURL REST API
              </button>
            </div>

            <div className="toolbar-actions">
              <button className="copy-code-btn" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
              </button>
              <button className="test-api-btn" onClick={handleSimulateCall}>
                <Play size={15} /> Execute API Request
              </button>
            </div>
          </div>

          <pre className="code-display-block">
            <code>{getSnippet()}</code>
          </pre>
        </div>

        {/* Live Payload Inspector Column */}
        <div className="payload-column">
          <div className="payload-header">
            <FileJson size={18} />
            <span>Simulated GCP API Response Payload</span>
            {isSimulating && <span className="running-spinner">Executing...</span>}
          </div>

          <div className="payload-body">
            {apiResponse ? (
              <pre className="json-response-view">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            ) : (
              <div className="payload-placeholder">
                <Terminal size={32} />
                <p>Click <strong>"Execute API Request"</strong> above to trigger a test API call and inspect the JSON response schema returned by Google Cloud Discovery Engine.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
