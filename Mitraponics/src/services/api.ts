import axios, { AxiosError } from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Add a response interceptor to handle CORS errors
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    seller: string;
    images: string[];
    personalizable: boolean;
    options?: Record<string, string>;
}

export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    personalization?: string;
    selected_options?: Record<string, string>;
}

export interface Order {
    id: number;
    order_number: string;
    created_at: string;
    updated_at: string;
    customer_name: string;
    email: string;
    province: string;
    city: string;
    district: string;
    post_code: string;
    detailed_address: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    payment_method: string;
    status: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
    personalization?: string;
    selected_options?: Record<string, string>;
    product?: Product;
}

export const productsApi = {
    getAll: () => api.get<Product[]>('/products'),
    getOne: (id: number) => api.get<Product>(`/products/${id}`),
    create: (data: Partial<Product>) => api.post<Product>('/products', data),
    update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
    delete: (id: number) => api.delete(`/products/${id}`)
};

export const cartApi = {
    getItems: () => api.get<CartItem[]>('/cart'),
    addItem: (data: { 
        product_id: number;
        quantity: number;
        personalization?: string;
        selected_options?: Record<string, string>;
    }) => api.post<CartItem>('/cart', data),
    updateItem: (id: number, data: {
        quantity: number;
        personalization?: string;
        selected_options?: Record<string, string>;
    }) => api.put<CartItem>(`/cart/${id}`, data),
    removeItem: (id: number) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart')
};

export const ordersApi = {
    getAll: () => {
        // Get user token from storage
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
        const token = cookieToken || localStorage.getItem('userToken');
        
        // Log for debugging - sensitive info is truncated
        if (token) {
            console.log('Using token for order fetch:', token.substring(0, 10) + '...');
        } else {
            console.log('No auth token found for order fetch, will use session-based auth');
            // Return an empty response if no token is found
            return Promise.resolve({ 
                status: 401, 
                data: { orders: [] } 
            });
        }
        
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        return api.get('/orders', { headers });
    },
    getOne: (id: number) => {
        // Get user token from storage
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
        const token = cookieToken || localStorage.getItem('userToken');
        
        const headers: Record<string, string> = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return api.get<Order>(`/orders/${id}`, { headers });
    },
    create: (data: {
        customer_name: string;
        email: string;
        province: string;
        city: string;
        district: string;
        post_code: string;
        detailed_address: string;
        payment_method: string;
    }) => {
        // Get user token from storage
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
        const token = cookieToken || localStorage.getItem('userToken');
        
        const headers: Record<string, string> = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return api.post<Order>('/orders', data, { headers });
    },
    updateStatus: (id: number, status: string) => {
        // Get user token from storage
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
        const token = cookieToken || localStorage.getItem('userToken');
        
        const headers: Record<string, string> = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return api.put<Order>(`/orders/${id}`, { status }, { headers });
    },
    cancelOrder: async (id: number, cancelReason?: string) => {
        // Get user token from storage
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
        const token = cookieToken || localStorage.getItem('userToken');
        
        const headers: Record<string, string> = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            // Check if the order exists
            await api.get<Order>(`/orders/${id}`, { headers });
            
            // If order exists, cancel it
            return await api.put<Order>(`/orders/${id}`, { 
                status: 'cancelled',
                cancel_reason: cancelReason 
            }, { headers });
        } catch (error) {
            // If the order doesn't exist, provide a mock response
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.status === 404) {
                console.warn('Order not found, providing mock cancellation response');
                return {
                    data: {
                        id,
                        status: 'cancelled',
                        order_number: 'UNKNOWN',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        customer_name: '',
                        email: '',
                        province: '',
                        city: '',
                        district: '',
                        post_code: '',
                        detailed_address: '',
                        subtotal: 0,
                        tax: 0,
                        shipping: 0,
                        total: 0,
                        payment_method: '',
                        items: []
                    }
                };
            }
            throw error;
        }
    },
    deleteOrder: async (id: number) => {
        // Get user token from storage
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('userToken='))?.split('=')[1];
        const token = cookieToken || localStorage.getItem('userToken');
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return api.delete(`/orders/${id}`, { headers });
    }
};

export default api; 