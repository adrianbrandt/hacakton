import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './TransactionForm.css';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
}

interface TransactionFormData {
    booking_date: string;
    amount: string;
    sender: string;
    receiver: string;
    name: string;
    title: string;
    currency: string;
    payment_type: string;
    category_id: string;
}

const defaultFormData: TransactionFormData = {
    booking_date: new Date().toISOString().split('T')[0],
    amount: '',
    sender: '',
    receiver: '',
    name: '',
    title: '',
    currency: 'NOK',
    payment_type: '',
    category_id: '',
};

const TransactionForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState<TransactionFormData>(defaultFormData);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditing = Boolean(id);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.getCategories();
                setCategories(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load categories');
            }
        };

        const fetchTransaction = async () => {
            if (!id) return;

            try {
                setIsLoading(true);
                const data = await api.getTransaction(parseInt(id));
                setFormData({
                    booking_date: new Date(data.booking_date).toISOString().split('T')[0],
                    amount: data.amount.toString(),
                    sender: data.sender || '',
                    receiver: data.receiver || '',
                    name: data.name || '',
                    title: data.title || '',
                    currency: data.currency || 'NOK',
                    payment_type: data.payment_type || '',
                    category_id: data.category_id ? data.category_id.toString() : '',
                });
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load transaction');
                setIsLoading(false);
            }
        };

        fetchCategories();
        fetchTransaction();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
            };

            if (isEditing) {
                await api.updateTransaction(parseInt(id!), transactionData);
            } else {
                await api.createTransaction(transactionData);
            }

            setIsLoading(false);
            navigate('/transactions');
        } catch (err) {
            console.error(err);
            setError('Failed to save transaction');
            setIsLoading(false);
        }
    };

    if (isLoading && isEditing) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="transaction-form card">
            <h2>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                        type="date"
                        name="booking_date"
                        value={formData.booking_date}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Amount</label>
                    <div className="amount-input">
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className="form-control"
                            step="0.01"
                            required
                            placeholder="Use negative for expenses"
                        />
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="currency-select"
                        >
                            <option value="NOK">NOK</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Sender</label>
                    <input
                        type="text"
                        name="sender"
                        value={formData.sender}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Receiver</label>
                    <input
                        type="text"
                        name="receiver"
                        value={formData.receiver}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Payment Type</label>
                    <input
                        type="text"
                        name="payment_type"
                        value={formData.payment_type}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">-- Select Category --</option>
                        {categories
                            .filter(cat => cat.parent_id !== null) // Only show subcategories
                            .map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Saving...' : (isEditing ? 'Update Transaction' : 'Add Transaction')}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/transactions')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;