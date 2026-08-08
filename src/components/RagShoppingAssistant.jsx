import React, { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, BookOpen, CheckCircle2, User, HelpCircle, Terminal, Database } from 'lucide-react';
import { MOCK_RAG_KNOWLEDGE_BASE, PRODUCTS as LOCAL_PRODUCTS } from '../data/catalogData';
import { ragChat as apiRagChat, fetchRagKnowledgeBase } from '../data/api';

export default function RagShoppingAssistant({ products, personaId }) {
  const allProducts = products || LOCAL_PRODUCTS;
  const [ragKnowledge, setRagKnowledge] = useState(MOCK_RAG_KNOWLEDGE_BASE);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your AI RAG Shopping Concierge. I can help you find products, compare specs, or answer policy questions grounded in our official catalog context.",
      citations: []
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeGroundingPassages, setActiveGroundingPassages] = useState([]);
  const [usingApi, setUsingApi] = useState(false);

  // Fetch RAG knowledge base from API on mount
  useEffect(() => {
    async function loadRag() {
      const apiRag = await fetchRagKnowledgeBase();
      if (apiRag && apiRag.length > 0) {
        setRagKnowledge(apiRag);
        setActiveGroundingPassages([apiRag[0]]);
        setUsingApi(true);
      } else {
        setActiveGroundingPassages([MOCK_RAG_KNOWLEDGE_BASE[0]]);
      }
    }
    loadRag();
  }, []);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { sender: "user", text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Try API-based RAG first
    const apiResult = await apiRagChat(query, personaId);

    if (apiResult) {
      setActiveGroundingPassages(apiResult.retrievedPassages || []);
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: apiResult.response,
          citations: apiResult.citations || []
        }
      ]);
      setIsTyping(false);
      return;
    }

    // Fallback to local RAG logic
    setTimeout(() => {
      let botResponse = "";
      let retrievedPassages = [];
      let citations = [];
      const qLower = query.toLowerCase();

      if (qLower.includes("return") || qLower.includes("policy") || qLower.includes("exchange")) {
        retrievedPassages = [ragKnowledge[0]];
        botResponse = `According to our official Return & Exchange Policy: ${ragKnowledge[0].content} [1]`;
        citations = [{ index: 1, title: ragKnowledge[0].title }];
      } else if (qLower.includes("headphone") || qLower.includes("battery") || qLower.includes("aurasound")) {
        retrievedPassages = [ragKnowledge[1], allProducts[0]];
        botResponse = `The AuraSound Pro Wireless ANC Headphones offer 35 hours of active battery life with 10-minute fast charging giving 5 hours of playback. They include a 2-year manufacturer warranty [1] and feature 40mm titanium drivers for audiophile performance [2].`;
        citations = [
          { index: 1, title: ragKnowledge[1]?.title || 'Battery Info' },
          { index: 2, title: allProducts[0]?.title || 'Product' }
        ];
      } else if (qLower.includes("denim") || qLower.includes("wash") || qLower.includes("size")) {
        retrievedPassages = [ragKnowledge[2]];
        botResponse = `KuroStudio Japanese selvedge denim is raw and unwashed 14oz cotton [1]. We recommend washing inside out in cold water after 6 months of wear to preserve natural indigo fades.`;
        citations = [{ index: 1, title: ragKnowledge[2]?.title || 'Denim Care' }];
      } else if (qLower.includes("espresso") || qLower.includes("coffee") || qLower.includes("descale")) {
        retrievedPassages = [ragKnowledge[3]];
        botResponse = `For espresso machine maintenance: ${ragKnowledge[3]?.content || 'Use filtered water and run clean cycle every 200 shots.'} [1]`;
        citations = [{ index: 1, title: ragKnowledge[3]?.title || 'Espresso Care' }];
      } else if (qLower.includes("shipping") || qLower.includes("delivery")) {
        const entry = ragKnowledge.find(r => r.title?.toLowerCase().includes('shipping'));
        if (entry) {
          retrievedPassages = [entry];
          botResponse = `${entry.content} [1]`;
          citations = [{ index: 1, title: entry.title }];
        } else {
          botResponse = `Standard shipping takes 3-5 days. Express 1-2 days. Free shipping over $75.`;
          citations = [{ index: 1, title: "Shipping Policy" }];
        }
      } else {
        retrievedPassages = [allProducts[0], allProducts[8] || allProducts[1]];
        botResponse = `Based on our current catalog inventory, we have top-rated items in Electronics (AuraSound ANC Headphones at $249.99) and Home & Kitchen (Barista Precision Espresso Machine at $549.00). Both items feature free 1-day express delivery.`;
        citations = [{ index: 1, title: "Catalog Search Index" }];
      }

      setActiveGroundingPassages(retrievedPassages);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: botResponse, citations }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="tab-container fade-in">
      {/* Header Banner */}
      <div className="feature-banner-card glass-card">
        <div className="flex-align">
          <Bot size={24} className="text-cyan" />
          <h2>10. RAG Conversational Shopping Assistant</h2>
        </div>
        <p className="banner-subtitle">
          Retrieval-Augmented Generation (RAG) assistant grounded in real-time catalog vector embeddings and policy knowledge bases with transparent citation tracking.
        </p>
      </div>

      {/* RAG Grid Layout: Chat View + Grounding Passage Inspector */}
      <div className="rag-layout-grid">
        {/* Left Panel: Chat Interface */}
        <div className="chat-card glass-card">
          <div className="chat-header">
            <div className="flex-align">
              <Bot size={18} className="text-cyan" />
              <span>AI Shopping Concierge (Grounded in {usingApi ? 'MySQL' : 'Local'} RAG)</span>
            </div>
            <span className={`status-badge ${usingApi ? 'bg-green' : 'bg-amber'}`}>
              {usingApi ? '● MySQL Grounded' : '● Local Mode'}
            </span>
          </div>

          <div className="chat-messages-box">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-row ${msg.sender}`}>
                <div className="avatar-circle">
                  {msg.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="citations-list">
                      {msg.citations.map((c, i) => (
                        <span key={i} className="citation-chip">
                          [{c.index}] {c.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row bot">
                <div className="avatar-circle"><Bot size={14} /></div>
                <div className="message-bubble typing-dots">
                  <span>.</span><span>.</span><span>.</span> RAG Vector Retrieval in progress
                </div>
              </div>
            )}
          </div>

          {/* Quick Question Chips */}
          <div className="quick-rag-chips">
            <button className="q-chip" onClick={() => handleSend("What is the return policy?")}>
              Return Policy?
            </button>
            <button className="q-chip" onClick={() => handleSend("Tell me about AuraSound headphone battery")}>
              Headphone Battery?
            </button>
            <button className="q-chip" onClick={() => handleSend("How to care for raw denim?")}>
              Raw Denim Care?
            </button>
            <button className="q-chip" onClick={() => handleSend("What are the shipping options?")}>
              Shipping Info?
            </button>
            <button className="q-chip" onClick={() => handleSend("Espresso machine maintenance tips")}>
              Espresso Care?
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask RAG assistant about products, shipping, returns..."
              className="chat-input"
            />
            <button className="send-btn" onClick={() => handleSend()}>
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Right Panel: Grounding Context & Passage Inspector */}
        <div className="grounding-inspector-card glass-card">
          <div className="panel-header">
            <h3>
              <BookOpen size={18} className="text-purple" />
              Retrieved RAG Grounding Passages
            </h3>
            <span className="panel-tag">
              <Database size={12} /> {usingApi ? 'MySQL Source' : 'Vector Top-K Context'}
            </span>
          </div>

          <div className="passages-list">
            {activeGroundingPassages.map((p, idx) => (
              <div key={idx} className="passage-card">
                <div className="flex-between">
                  <span className="passage-title font-bold">[{idx + 1}] {p.title}</span>
                  <span className="passage-score text-green font-mono">Similarity: 0.94</span>
                </div>
                <p className="passage-content">{p.content || p.description}</p>
              </div>
            ))}
          </div>

          <div className="system-prompt-box">
            <span className="prompt-label"><Terminal size={13} /> RAG System Prompt:</span>
            <code className="prompt-code">
              "You are an AI e-commerce assistant. Answer strictly based on retrieved vector passages below. If answer is not in context, decline gracefully. Output citations [1], [2]."
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
