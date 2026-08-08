// Multi-Intent Detection & Semantic Search Scoring Engine
import { PRODUCTS } from './catalogData';

export function parseMultiIntentQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return {
      primaryIntent: "Catalog Search",
      categoryFilter: "All",
      maxPrice: null,
      extractedAttributes: [],
      logisticsIntent: "Standard",
      confidenceScore: 0.95,
      expandedQuery: ""
    };
  }

  const queryLower = rawQuery.toLowerCase();
  
  // 1. Detect Max Price Intent (e.g. "under $80", "less than 120", "< 200")
  let maxPrice = null;
  const priceMatch = queryLower.match(/(?:under|less than|below|<\s*)\$?(\d+)/i);
  if (priceMatch && priceMatch[1]) {
    maxPrice = parseFloat(priceMatch[1]);
  }

  // 2. Detect Category Intent
  let categoryFilter = "All";
  if (queryLower.includes("headphone") || queryLower.includes("laptop") || queryLower.includes("keyboard") || queryLower.includes("mouse") || queryLower.includes("audio") || queryLower.includes("electronics")) {
    categoryFilter = "Electronics";
  } else if (queryLower.includes("denim") || queryLower.includes("jacket") || queryLower.includes("tee") || queryLower.includes("shirt") || queryLower.includes("chino") || queryLower.includes("trousers") || queryLower.includes("shoes") || queryLower.includes("sneakers") || queryLower.includes("backpack") || queryLower.includes("fashion")) {
    categoryFilter = "Fashion";
  } else if (queryLower.includes("espresso") || queryLower.includes("coffee") || queryLower.includes("grinder") || queryLower.includes("glass") || queryLower.includes("cups") || queryLower.includes("kitchen")) {
    categoryFilter = "Home & Kitchen";
  } else if (queryLower.includes("running") || queryLower.includes("marathon") || queryLower.includes("watch") || queryLower.includes("gps") || queryLower.includes("water bottle") || queryLower.includes("fitness")) {
    categoryFilter = "Fitness";
  }

  // 3. Detect Logistics Intent (e.g. "fast delivery", "quick shipping", "2 day", "1 day")
  let logisticsIntent = "Standard";
  if (queryLower.includes("fast") || queryLower.includes("quick") || queryLower.includes("overnight") || queryLower.includes("express") || queryLower.includes("1 day") || queryLower.includes("2 day")) {
    logisticsIntent = "Express Fast Delivery (<= 2 Days)";
  }

  // 4. Extract Attribute Features
  const keywords = ["wireless", "noise cancelling", "bluetooth", "denim", "organic", "leather", "carbon plate", "lightweight", "breathable", "barista", "hot-swappable", "ergonomic", "stainless steel"];
  const extractedAttributes = keywords.filter(kw => queryLower.includes(kw));

  // 5. Detect Primary Intent
  let primaryIntent = "Product Search";
  if (queryLower.includes("how to") || queryLower.includes("return") || queryLower.includes("warranty") || queryLower.includes("policy") || queryLower.includes("care")) {
    primaryIntent = "Support & Policy RAG";
  } else if (queryLower.includes("bundle") || queryLower.includes("outfit") || queryLower.includes("look") || queryLower.includes("pair with")) {
    primaryIntent = "Complete the Look & Bundles";
  } else if (queryLower.includes("deal") || queryLower.includes("discount") || queryLower.includes("cheap") || queryLower.includes("sale")) {
    primaryIntent = "Bargain & Deals";
  }

  // 6. Semantic Query Expansion
  let expandedQuery = rawQuery;
  if (extractedAttributes.includes("wireless")) expandedQuery += " bluetooth cord-free";
  if (extractedAttributes.includes("running")) expandedQuery += " marathon athletic footwear PEBA foam";
  if (extractedAttributes.includes("espresso")) expandedQuery += " barista Italian 19-bar extraction";

  return {
    primaryIntent,
    categoryFilter,
    maxPrice,
    extractedAttributes,
    logisticsIntent,
    confidenceScore: 0.94 + (extractedAttributes.length * 0.015),
    expandedQuery
  };
}

// Calculate Cosine Similarity between two 8-dim vectors
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0.5;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Perform Hybrid Search Scoring (BM25 Sparse Lexical + Dense Vector)
export function performHybridSearch({
  query,
  category = "All",
  vectorWeight = 0.7, // 0.0 = 100% Lexical BM25, 1.0 = 100% Dense Vector
  userPersona = null,
  maxPriceLimit = null
}) {
  const intentData = parseMultiIntentQuery(query);
  const searchCategory = category !== "All" ? category : intentData.categoryFilter;
  const effectiveMaxPrice = maxPriceLimit || intentData.maxPrice;

  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  let results = PRODUCTS.map(product => {
    // Sparse Lexical BM25 approximation
    let titleMatches = 0;
    let descMatches = 0;
    let tagMatches = 0;

    queryTerms.forEach(term => {
      if (product.title.toLowerCase().includes(term)) titleMatches += 1;
      if (product.description.toLowerCase().includes(term)) descMatches += 1;
      if (product.tags.some(t => t.toLowerCase().includes(term))) tagMatches += 1;
    });

    const lexicalRaw = (titleMatches * 0.4) + (tagMatches * 0.35) + (descMatches * 0.25);
    const lexicalScore = Math.min(1.0, lexicalRaw / (queryTerms.length || 1));

    // Vector Similarity against query text vector simulation
    const dummyQueryVector = [0.80, 0.85, 0.20, 0.40, 0.75, 0.85, 0.30, 0.60];
    const vectorScore = cosineSimilarity(dummyQueryVector, product.textEmbedding);

    // Hybrid Composite Score
    let hybridScore = (vectorScore * vectorWeight) + (lexicalScore * (1 - vectorWeight));

    // User persona boost
    if (userPersona && userPersona.preferredCategories.includes(product.category)) {
      hybridScore += 0.08;
    }

    return {
      ...product,
      lexicalScore: Number(lexicalScore.toFixed(3)),
      vectorScore: Number(vectorScore.toFixed(3)),
      hybridScore: Number(Math.min(0.99, Math.max(0.40, hybridScore)).toFixed(3))
    };
  });

  // Apply filters
  if (searchCategory !== "All") {
    results = results.filter(p => p.category === searchCategory);
  }

  if (effectiveMaxPrice && !isNaN(effectiveMaxPrice)) {
    results = results.filter(p => p.price <= effectiveMaxPrice);
  }

  // Sort by final score
  results.sort((a, b) => b.hybridScore - a.hybridScore);

  return {
    intentData,
    results
  };
}
