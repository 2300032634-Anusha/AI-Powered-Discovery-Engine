// ── Discovery Engine API Client ──────────────────────────────
// Central API module for all backend communication
// Falls back to local data on network errors

const API_BASE = '/api';

async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn(`[API] Server returned non-JSON response (${response.status}) for ${endpoint}:`, text.slice(0, 150));
        return {
          success: false,
          error: `Server returned HTML/non-JSON response (${response.status})`
        };
      }
    }

    if (!response.ok) {
      return { success: false, error: data?.error || data?.message || `API Error ${response.status}` };
    }

    return data;
  } catch (err) {
    console.warn(`[API] Request failed for ${endpoint}:`, err.message);
    return { success: false, error: err.message || 'Network error' };
  }
}

// ── Products ─────────────────────────────────────────────────
export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.search) params.set('search', filters.search);
  if (filters.limit) params.set('limit', filters.limit);

  const queryStr = params.toString();
  const result = await apiFetch(`/products${queryStr ? '?' + queryStr : ''}`);
  return result?.data || null;
}

export async function fetchProductById(id) {
  const result = await apiFetch(`/products/${id}`);
  return result?.data || null;
}

// ── Personas ─────────────────────────────────────────────────
export async function fetchPersonas() {
  const result = await apiFetch('/personas');
  return result?.data || null;
}

// ── Search ───────────────────────────────────────────────────
export async function performApiSearch({ query, category, vectorWeight, personaId }) {
  const result = await apiFetch('/search', {
    method: 'POST',
    body: JSON.stringify({ query, category, vectorWeight, personaId })
  });
  return result || null;
}

// ── Interactions ─────────────────────────────────────────────
export async function logInteraction({ personaId, productId, interactionType, metadata }) {
  return apiFetch('/interactions', {
    method: 'POST',
    body: JSON.stringify({ personaId, productId, interactionType, metadata })
  });
}

export async function fetchInteractions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.personaId) params.set('personaId', filters.personaId);
  if (filters.type) params.set('type', filters.type);
  if (filters.limit) params.set('limit', filters.limit);

  const queryStr = params.toString();
  const result = await apiFetch(`/interactions${queryStr ? '?' + queryStr : ''}`);
  return result?.data || null;
}

export async function fetchInteractionStats() {
  const result = await apiFetch('/interactions/stats');
  return result?.data || null;
}

// ── RAG ──────────────────────────────────────────────────────
export async function fetchRagKnowledgeBase() {
  const result = await apiFetch('/rag');
  return result?.data || null;
}

export async function ragChat(query, personaId) {
  const result = await apiFetch('/rag/chat', {
    method: 'POST',
    body: JSON.stringify({ query, personaId })
  });
  return result?.data || null;
}

// ── FAISS Specs ──────────────────────────────────────────────
export async function fetchFaissSpecs() {
  const result = await apiFetch('/faiss-specs');
  return result?.data || null;
}

// ── Auth ───────────────────────────────────────────────────
export async function signUpUser({ name, email, password, personaId }) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, personaId })
  });
}

export async function logInUser({ email, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function fetchUserProfile(userId) {
  return apiFetch(`/auth/me/${userId}`);
}

// ── Orders & Checkout ─────────────────────────────────────────
export async function createOrder(orderPayload) {
  return apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload)
  });
}

export async function fetchUserOrders(userId) {
  const result = await apiFetch(`/orders/user/${userId}`);
  return result?.orders || [];
}

export async function fetchUserOrderStats(userId) {
  const result = await apiFetch(`/orders/stats/user/${userId}`);
  return result?.stats || { totalOrders: 0, totalSpent: 0, totalItemsPurchased: 0 };
}

// ── Health Check ─────────────────────────────────────────────
export async function checkHealth() {
  const result = await apiFetch('/health');
  return result || null;
}
