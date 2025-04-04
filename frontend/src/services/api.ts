import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface Transaction {
    id: number;
    booking_date: string;
    amount: number;
    sender: string;
    receiver: string;
    name: string;
    title: string;
    currency: string;
    payment_type: string;
    category_id?: number | null;
    category_name?: string;
}

interface Category {
    id: number;
    name: string;
    sifo_code?: string;
    description?: string;
    parent_id?: number | null;
    created_at?: string;
}

export const api = {
    // Transactions
    getTransactions: async (options?: {
        limit?: number,
        sort?: 'desc' | 'asc',
        startDate?: Date,
        endDate?: Date
    }): Promise<Transaction[]> => {
        const params = new URLSearchParams();

        if (options?.limit) {
            params.append('limit', options.limit.toString());
        }

        if (options?.sort) {
            params.append('sort', options.sort);
        }

        if (options?.startDate) {
            params.append('startDate', options.startDate.toISOString());
        }

        if (options?.endDate) {
            params.append('endDate', options.endDate.toISOString());
        }

        const response = await axios.get<Transaction[]>(`${API_URL}/transactions`, {
            params
        });

        // Ensure amount is a number
        return response.data.map(transaction => ({
            ...transaction,
            amount: Number(transaction.amount)
        }));
    },

    getTransaction: async (id: number): Promise<Transaction> => {
        const response = await axios.get<Transaction>(`${API_URL}/transactions/${id}`);
        return response.data;
    },

    createTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
        const response = await axios.post<Transaction>(`${API_URL}/transactions`, transaction);
        return response.data;
    },

    updateTransaction: async (id: number, transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
        const response = await axios.put<Transaction>(`${API_URL}/transactions/${id}`, transaction);
        return response.data;
    },

    deleteTransaction: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/transactions/${id}`);
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data;
    },

    getCategory: async (id: number): Promise<Category> => {
        const response = await axios.get(`${API_URL}/categories/${id}`);
        return response.data;
    },

    createCategory: async (category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
        const response = await axios.post(`${API_URL}/categories`, category);
        return response.data;
    },

    updateCategory: async (id: number, category: Omit<Category, 'id' | 'created_at'>): Promise<Category> => {
        const response = await axios.put(`${API_URL}/categories/${id}`, category);
        return response.data;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/categories/${id}`);
    },

    getSubcategories: async (id: number): Promise<Category[]> => {
        const response = await axios.get(`${API_URL}/categories/${id}/subcategories`);
        return response.data;
    },

    getCategoryTransactions: async (id: number): Promise<Transaction[]> => {
        const response = await axios.get(`${API_URL}/categories/${id}/transactions`);
        return response.data;
    }
};

export default api;