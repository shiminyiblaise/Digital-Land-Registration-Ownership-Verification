const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('land_user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(data: { email: string; password: string; name: string; phone: string; role?: string }) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('land_user', JSON.stringify(result.user));
    }
    return result;
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async updateProfile(data: any) {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getLands(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/lands?${params}`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getMarketplace() {
    const res = await fetch(`${API_URL}/lands/marketplace`);
    return res.json();
  },

  async getMyLands() {
    const res = await fetch(`${API_URL}/lands/my-lands`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getPendingLands() {
    const res = await fetch(`${API_URL}/lands/pending`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getLandById(id: string) {
    const res = await fetch(`${API_URL}/lands/code/${id}`);
    return res.json();
  },

  async registerLand(data: any) {
    const res = await fetch(`${API_URL}/lands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateLand(id: string, data: any) {
    const res = await fetch(`${API_URL}/lands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async approveLand(id: string) {
    const res = await fetch(`${API_URL}/lands/${id}/approve`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async rejectLand(id: string, reason?: string) {
    const res = await fetch(`${API_URL}/lands/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async advertiseLand(id: string) {
    const res = await fetch(`${API_URL}/lands/${id}/advertise`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async deleteLand(id: string) {
    const res = await fetch(`${API_URL}/lands/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getTransactions() {
    const res = await fetch(`${API_URL}/transactions`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async createTransaction(data: { land_id: string; method: string }) {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async completeTransaction(id: string) {
    const res = await fetch(`${API_URL}/transactions/${id}/complete`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getUsers(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_URL}/users?${params}`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_URL}/users/stats`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async verifyUser(id: string) {
    const res = await fetch(`${API_URL}/users/${id}/verify`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async updateUserRole(id: string, role: string) {
    const res = await fetch(`${API_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async verifyLand(data: { land_id: string; facial_match: boolean; id_verified: boolean; document_verified: boolean; notes?: string }) {
    const res = await fetch(`${API_URL}/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getLandVerification(landId: string) {
    const res = await fetch(`${API_URL}/verification/land/${landId}`);
    return res.json();
  },

  async getVerifications() {
    const res = await fetch(`${API_URL}/verification`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async getCart() {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async addToCart(landId: string) {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ landId })
    });
    return res.json();
  },

  async removeFromCart(landId: string) {
    const res = await fetch(`${API_URL}/cart/${landId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async clearCart() {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.json();
  }
};

export default api;
