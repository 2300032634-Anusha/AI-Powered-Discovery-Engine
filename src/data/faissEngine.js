// Two-Tower, FAISS Vector Indexing, MAB Cold Start & MMR Diversity Engine
import { PRODUCTS, USER_PERSONAS } from './catalogData';

// FAISS Index Types & Specifications
export const FAISS_INDEX_TYPES = {
  IndexFlatIP: {
    name: "IndexFlatIP",
    description: "Exact Brute-Force Inner Product Index",
    buildTimeMs: 12,
    searchLatencyMs: 42.5,
    qps: 1850,
    recallAt10: 1.00,
    memoryOverheadMb: 64,
    complexity: "O(N * d)",
    bestFor: "Small to mid-size catalogs (< 100K items) requiring 100% exact precision."
  },
  IndexIVFFlat: {
    name: "IndexIVFFlat",
    description: "Inverted File Voronoi Partitioning Index (nlist=100, nprobe=10)",
    buildTimeMs: 180,
    searchLatencyMs: 8.2,
    qps: 12400,
    recallAt10: 0.954,
    memoryOverheadMb: 82,
    complexity: "O((N/nlist) * d)",
    bestFor: "Large scale catalogs (1M+ items) balancing memory and ultra-fast lookup."
  },
  IndexHNSW: {
    name: "IndexHNSW32",
    description: "Hierarchical Navigable Small World Graph (M=32, efSearch=64)",
    buildTimeMs: 950,
    searchLatencyMs: 1.8,
    qps: 45000,
    recallAt10: 0.988,
    memoryOverheadMb: 240,
    complexity: "O(log N)",
    bestFor: "Ultra-low latency real-time recommendation engines with sub-2ms SLA."
  }
};

// Compute Two-Tower Similarity Matrix (User Tower dot Item Tower)
export function computeTwoTowerMatrix(personaKey = "techie") {
  const persona = USER_PERSONAS[personaKey] || USER_PERSONAS.techie;
  const userVec = persona.vector;

  const matrix = PRODUCTS.map(prod => {
    let dotProduct = 0;
    for (let i = 0; i < Math.min(userVec.length, prod.textEmbedding.length); i++) {
      dotProduct += userVec[i] * prod.textEmbedding[i];
    }
    const similarityScore = Number((dotProduct / 8.0).toFixed(3)); // Normalized
    return {
      productId: prod.id,
      title: prod.title,
      category: prod.category,
      price: prod.price,
      imageUrl: prod.imageUrl,
      similarityScore: Math.min(0.99, Math.max(0.30, similarityScore))
    };
  });

  matrix.sort((a, b) => b.similarityScore - a.similarityScore);
  return matrix;
}

// Simulated Multi-Armed Bandit (Thompson Sampling / UCB) for Cold-Start
export function simulateColdStartBandit(algorithm = "thompson", iterations = 50) {
  // Initialize arms (categories / item clusters)
  const arms = [
    { id: "arm-electronics", name: "Electronics & Audio", alpha: 1, beta: 1, rewards: 0, pulls: 0 },
    { id: "arm-fashion", name: "Urban Streetwear & Denim", alpha: 1, beta: 1, rewards: 0, pulls: 0 },
    { id: "arm-home", name: "Espresso & Kitchen Gear", alpha: 1, beta: 1, rewards: 0, pulls: 0 },
    { id: "arm-fitness", name: "Marathon Running & GPS", alpha: 1, beta: 1, rewards: 0, pulls: 0 }
  ];

  // Hidden true click-through rates (CTR) for simulation
  const trueCTR = {
    "arm-electronics": 0.28,
    "arm-fashion": 0.19,
    "arm-home": 0.12,
    "arm-fitness": 0.35
  };

  const history = [];

  for (let i = 1; i <= iterations; i++) {
    let selectedArm = null;

    if (algorithm === "thompson") {
      // Sample from Beta distribution
      let maxSample = -1;
      arms.forEach(arm => {
        // Approximate Beta distribution sample using mean + noise
        const mean = arm.alpha / (arm.alpha + arm.beta);
        const variance = (arm.alpha * arm.beta) / (Math.pow(arm.alpha + arm.beta, 2) * (arm.alpha + arm.beta + 1));
        const sample = mean + (Math.random() - 0.5) * Math.sqrt(variance) * 2;
        if (sample > maxSample) {
          maxSample = sample;
          selectedArm = arm;
        }
      });
    } else {
      // Upper Confidence Bound (UCB1)
      let maxUCB = -1;
      arms.forEach(arm => {
        if (arm.pulls === 0) {
          selectedArm = arm;
          maxUCB = Infinity;
        } else {
          const mean = arm.rewards / arm.pulls;
          const ucbValue = mean + Math.sqrt((2 * Math.log(i)) / arm.pulls);
          if (ucbValue > maxUCB) {
            maxUCB = ucbValue;
            selectedArm = arm;
          }
        }
      });
    }

    // Simulate user click based on true CTR
    const userClicked = Math.random() < trueCTR[selectedArm.id];
    selectedArm.pulls += 1;
    if (userClicked) {
      selectedArm.rewards += 1;
      selectedArm.alpha += 1;
    } else {
      selectedArm.beta += 1;
    }

    history.push({
      step: i,
      armChosen: selectedArm.name,
      reward: userClicked ? 1 : 0,
      estimatedCTR: Number((selectedArm.rewards / selectedArm.pulls).toFixed(3))
    });
  }

  return {
    arms,
    history
  };
}

// Maximal Marginal Relevance (MMR) Diversity Guardrail Re-ranking Algorithm
// Formula: MMR = ArgMax [ \lambda * Sim1(d_i, Q) - (1 - \lambda) * Max_d_j [ Sim2(d_i, d_j) ] ]
export function applyMMRDiversity(items, lambdaParam = 0.7, topK = 6) {
  if (!items || items.length === 0) return [];

  const selected = [];
  const unselected = [...items];

  // Pick the single highest scoring item first
  selected.push(unselected.shift());

  while (selected.length < topK && unselected.length > 0) {
    let bestScore = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < unselected.length; i++) {
      const candidate = unselected[i];
      const relevanceScore = candidate.hybridScore || candidate.similarityScore || 0.8;

      // Max similarity with already selected items (diversity penalty based on category/price overlap)
      let maxSimWithSelected = 0;
      selected.forEach(sel => {
        let sim = 0;
        if (candidate.category === sel.category) sim += 0.5;
        if (candidate.brand === sel.brand) sim += 0.3;
        const priceDiff = Math.abs(candidate.price - sel.price) / Math.max(candidate.price, sel.price);
        if (priceDiff < 0.2) sim += 0.2;
        if (sim > maxSimWithSelected) maxSimWithSelected = sim;
      });

      // MMR Score calculation
      const mmrScore = (lambdaParam * relevanceScore) - ((1 - lambdaParam) * maxSimWithSelected);

      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) {
      selected.push(unselected.splice(bestIndex, 1)[0]);
    } else {
      break;
    }
  }

  return selected;
}
