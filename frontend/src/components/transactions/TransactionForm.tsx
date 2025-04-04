import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface TransactionFormProps {
    transactionId?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transactionId }) => {
    const [formData, setFormData] = useState<TransactionFormData>({
        booking_date: new Date().toISOString().split('T')[0],
        amount: '',
        sender: '',
        receiver: '',
        name: '',
        title: '',
        currency: 'NOK',
        payment_type: '',
        category_id: '',
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoryData = await api.getCategories();
                setCategories(categoryData);

                // If editing, fetch transaction details
                if (transactionId) {
                    setIsLoading(true);
                    const transactionData = await api.getTransaction(parseInt(transactionId));
                    setFormData({
                        booking_date: new Date(transactionData.booking_date).toISOString().split('T')[0],
                        amount: transactionData.amount.toString(),
                        sender: transactionData.sender || '',
                        receiver: transactionData.receiver || '',
                        name: transactionData.name || '',
                        title: transactionData.title || '',
                        currency: transactionData.currency || 'NOK',
                        payment_type: transactionData.payment_type || '',
                        category_id: transactionData.category_id ? transactionData.category_id.toString() : '',
                    });
                    setIsLoading(false);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [transactionId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
            };

            if (transactionId) {
                // Update existing transaction
                await api.updateTransaction(parseInt(transactionId), transactionData);
            } else {
                // Create new transaction
                await api.createTransaction(transactionData);
            }

            navigate('/transactions');
        } catch (err) {
            console.error(err);
            setError('Failed to save transaction');
            setIsLoading(false);
        }
    };

    if (isLoading && transactionId) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="transaction-form card">
            <h2>{transactionId ? 'Edit Transaction' : 'Add New Transaction'}</h2>

            <form onSubmit={handleSubmit}>
                {/* Date Input */}
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

                {/* Amount Input */}
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

                {/* Title Input */}
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

                {/* Description Input */}
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

                {/* Sender Input */}
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

                {/* Receiver Input */}
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

                {/* Payment Type Input */}
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

                {/* Category Select */}
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
                            .filter(cat => cat.parent_id !== null)
                            .map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Saving...'
                            : (transactionId ? 'Update Transaction' : 'Add Transaction')
                        }
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/transactions')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;