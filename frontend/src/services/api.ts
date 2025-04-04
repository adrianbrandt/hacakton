import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
    // Transactions
    getTransactions: async () => {
        const response = await axios.get(`${API_URL}/transactions`);
        return response.data;
    },

    getTransaction: async (id: number) => {
        const response = await axios.get(`${API_URL}/transactions/${id}`);
        return response.data;
    },

    createTransaction: async (transaction: any) => {
        const response = await axios.post(`${API_URL}/transactions`, transaction);
        return response.data;
    },

    updateTransaction: async (id: number, transaction: any) => {
        const response = await axios.put(`${API_URL}/transactions/${id}`, transaction);
        return response.data;
    },

    deleteTransaction: async (id: number) => {
        await axios.delete(`${API_URL}/transactions/${id}`);
    },

    // Categories
    getCategories: async () => {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data;
    },

    getCategory: async (id: number) => {
        const response = await axios.get(`${API_URL}/categories/${id}`);
        return response.data;
    },

    getSubcategories: async (id: number) => {
        const response = await axios.get(`${API_URL}/categories/${id}/subcategories`);
        return response.data;
    },

    getCategoryTransactions: async (id: number) => {
        const response = await axios.get(`${API_URL}/categories/${id}/transactions`);
        return response.data;
    }
};

export default api;