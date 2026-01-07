/**
 * API Service for Courier Dashboard
 * Handles all HTTP requests to the Logistics backend with JWT authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Token management
const getAccessToken = (): string | null => localStorage.getItem('accessToken');
const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

const setTokens = (access: string, refresh: string): void => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('isAuthenticated', 'true');
};

const clearTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

// Refresh the access token
const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/accounts/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.access);
            return true;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }

    clearTokens();
    return false;
};

// Generic API request with auth handling
interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    skipAuth?: boolean;
}

export const apiRequest = async <T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> => {
    const { method = 'GET', body, headers = {}, skipAuth = false } = options;

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (!skipAuth) {
        const token = getAccessToken();
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    // If 401, try to refresh token and retry
    if (response.status === 401 && !skipAuth) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            requestHeaders['Authorization'] = `Bearer ${getAccessToken()}`;
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers: requestHeaders,
                body: body ? JSON.stringify(body) : undefined,
            });
        } else {
            clearTokens();
            window.location.href = '/';
            throw new Error('Session expired');
        }
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
};

// ============= Authentication =============

interface LoginResponse {
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
        first_name: string;
        last_name: string;
        company?: number | null; // Company ID
    };
    tokens: {
        access: string;
        refresh: string;
    };
}

export const createCompany = async (data: {
    name: string;
    address: string;
    phone: string;
}) => {
    return apiRequest<any>('/companies/', {
        method: 'POST',
        body: data,
    });
};

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    // Backend requires 'username' field based on API testing
    const response = await apiRequest<LoginResponse>('/accounts/auth/login/', {
        method: 'POST',
        body: { username, password },
        skipAuth: true,
    });

    setTokens(response.tokens.access, response.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
};

export const register = async (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
    company?: number;
}) => {
    return apiRequest('/accounts/auth/register/', {
        method: 'POST',
        body: data,
        skipAuth: true,
    });
};

export const logout = async (): Promise<void> => {
    try {
        await apiRequest('/accounts/auth/logout/', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearTokens();
    }
};

export const getProfile = async () => {
    return apiRequest('/accounts/auth/profile/');
};

// ============= Dashboard / Analytics =============

export const getCompanySummary = async (period: string = 'week') => {
    return apiRequest(`/analytics/company/summary/?period=${period}`);
};

export const getCompanyRevenueChart = async () => {
    return apiRequest('/analytics/company/revenue_chart/');
};

export const getCompanyDeliveryStats = async () => {
    return apiRequest('/analytics/company/delivery_stats/');
};

// ============= Deliveries =============

export const getDeliveries = async (status?: string) => {
    const query = status && status !== 'all' ? `?status=${status}` : '';
    return apiRequest(`/deliveries/${query}`);
};

export const getDelivery = async (id: number) => {
    return apiRequest(`/deliveries/${id}/`);
};

export const assignDriver = async (deliveryId: number, driverId: number) => {
    return apiRequest(`/deliveries/${deliveryId}/assign_driver/`, {
        method: 'POST',
        body: { driver_id: driverId },
    });
};

// ============= Drivers / Riders =============

export const getDrivers = async () => {
    return apiRequest('/riders/drivers/');
};

export const getDriver = async (id: number) => {
    return apiRequest(`/riders/drivers/${id}/`);
};

export const updateDriverStatus = async (id: number, status: string) => {
    return apiRequest(`/riders/drivers/${id}/update_status/`, {
        method: 'POST',
        body: { status },
    });
};

export const inviteDriver = async (data: { email: string; name: string; phone: string }) => {
    return apiRequest('/riders/invitations/', {
        method: 'POST',
        body: data,
    });
};

// ============= Companies =============

export const getMyCompany = async () => {
    return apiRequest('/companies/my_company/');
};

export const updateMyCompany = async (data: unknown) => {
    return apiRequest('/companies/my-company/', {
        method: 'PUT',
        body: data,
    });
};

// ============= Price Tiers =============

export const getPriceTiers = async () => {
    return apiRequest('/companies/price-tiers/');
};

export const createPriceTier = async (data: unknown) => {
    return apiRequest('/companies/price-tiers/', {
        method: 'POST',
        body: data,
    });
};

export const updatePriceTier = async (id: number, data: unknown) => {
    return apiRequest(`/companies/price-tiers/${id}/`, {
        method: 'PUT',
        body: data,
    });
};

export const deletePriceTier = async (id: number) => {
    return apiRequest(`/companies/price-tiers/${id}/`, {
        method: 'DELETE',
    });
};

// ============= Distance Zones =============

export const getDistanceZones = async () => {
    return apiRequest('/companies/distance-zones/');
};

export const createDistanceZone = async (data: unknown) => {
    return apiRequest('/companies/distance-zones/', {
        method: 'POST',
        body: data,
    });
};

export const updateDistanceZone = async (id: number, data: unknown) => {
    return apiRequest(`/companies/distance-zones/${id}/`, {
        method: 'PUT',
        body: data,
    });
};

export const deleteDistanceZone = async (id: number) => {
    return apiRequest(`/companies/distance-zones/${id}/`, {
        method: 'DELETE',
    });
};

// ============= Finance =============

export const getWalletBalance = async () => {
    // Extract wallet info from company endpoint
    const company = await getMyCompany();
    return {
        balance: (company as { wallet_balance?: number }).wallet_balance || 0,
        currency: 'NGN',
    };
};

export const getTransactions = async () => {
    return apiRequest('/finance/transactions/');
};

export const requestPayout = async (data: {
    amount: number;
    account_number: string;
    bank_name: string;
    account_name: string;
}) => {
    return apiRequest('/companies/payouts/request/', {
        method: 'POST',
        body: data,
    });
};

// ============= Chat =============

export const getConversations = async () => {
    return apiRequest('/chat/conversations/');
};

export const getMessages = async (conversationId: number) => {
    return apiRequest(`/chat/messages/?conversation=${conversationId}`);
};

export const startConversation = async (userId: number) => {
    return apiRequest('/chat/conversations/start/', {
        method: 'POST',
        body: { user_id: userId },
    });
};

export const sendMessage = async (conversationId: number, content: string) => {
    return apiRequest('/chat/messages/', {
        method: 'POST',
        body: { conversation: conversationId, content },
    });
};

// ============= Support =============

export const getDisputes = async () => {
    return apiRequest('/support/disputes/');
};

export const createDispute = async (data: {
    delivery: number;
    reason: string;
    description: string;
}) => {
    return apiRequest('/support/disputes/', {
        method: 'POST',
        body: data,
    });
};

// Default export for backwards compatibility
const api = {
    login,
    logout,
    getProfile,
    isAuthenticated,
    getCompanySummary,
    getCompanyRevenueChart,
    getCompanyDeliveryStats,
    getDeliveries,
    getDelivery,
    assignDriver,
    getDrivers,
    getDriver,
    updateDriverStatus,
    inviteDriver,
    getMyCompany,
    updateMyCompany,
    getPriceTiers,
    createPriceTier,
    updatePriceTier,
    deletePriceTier,
    getDistanceZones,
    createDistanceZone,
    updateDistanceZone,
    deleteDistanceZone,
    getWalletBalance,
    getTransactions,
    requestPayout,
    getConversations,
    getMessages,
    startConversation,
    sendMessage,
    getDisputes,
    createDispute,
};

export default api;
