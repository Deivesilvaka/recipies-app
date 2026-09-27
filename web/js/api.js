const BASE_URL_KEY = 'recipes_app_base_url';
const TOKEN_KEY = 'recipes_app_token';

export function getBaseUrl() {
  return localStorage.getItem(BASE_URL_KEY) || 'http://localhost:3000';
}

export function setBaseUrl(url) {
  localStorage.setItem(BASE_URL_KEY, url.replace(/\/+$/, ''));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(status, message) {
    super(Array.isArray(message) ? message.join(' | ') : message);
    this.status = status;
  }
}

async function parseErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

/**
 * @param {string} path
 * @param {{method?: string, body?: any, isForm?: boolean, auth?: boolean}} [options]
 */
async function request(path, options = {}) {
  const { method = 'GET', body, isForm = false, auth = false } = options;

  const headers = {};
  if (!isForm && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError(401, 'Você precisa estar logado.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.blob();
}

export const api = {
  health: () => request('/health'),

  // --- Auth ---
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  verifyEmail: (userId, otp) =>
    request(`/auth/verify/${encodeURIComponent(otp)}/userId/${userId}`, {
      method: 'POST',
    }),
  resendVerificationOtp: (userId) =>
    request(`/auth/verification-otp/${userId}`, { method: 'POST' }),
  requestForgetPassword: (userEmail) =>
    request(`/auth/forget-password?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
    }),

  // --- Users ---
  createUser: (payload) => request('/user', { method: 'POST', body: payload }),
  updateUser: (payload) =>
    request('/user', { method: 'PATCH', body: payload, auth: true }),
  getProfile: () => request('/user/profile', { auth: true }),
  updatePassword: (password, confirmPassword) =>
    request('/user/password', {
      method: 'PATCH',
      body: { password, confirmPassword },
      auth: true,
    }),
  resetPasswordWithEmail: (email, password, confirmPassword) =>
    request('/user/forget-password', {
      method: 'POST',
      body: { email, password, confirmPassword },
    }),

  // --- Recipes ---
  searchRecipes: ({ q, category, page, limit } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    const qs = params.toString();
    return request(`/recipes${qs ? `?${qs}` : ''}`);
  },
  getRecipe: (id) => request(`/recipes/${id}`),
  upsertRecipe: (payload) =>
    request('/recipes', { method: 'POST', body: payload, auth: true }),
  uploadRecipeImage: (id, file) => {
    const form = new FormData();
    form.append('image', file);
    return request(`/recipes/${id}/image`, {
      method: 'POST',
      body: form,
      isForm: true,
      auth: true,
    });
  },
  recipeImageUrl: (id) => `${getBaseUrl()}/recipes/${id}/image`,
};
