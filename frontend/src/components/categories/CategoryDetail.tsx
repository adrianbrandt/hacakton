import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';

interface Category {
    id: number;
    name: string;
    sifo_code?: string;
    description?: string;
    parent_id: number | null;
    created_at: string;
}

interface Transaction {
    id: number;
    booking_date: string;
    amount: number;
    title: string;
    currency: string;
}

const CategoryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            try {
                const [categoryData, transactionsData] = await Promise.all([
                    api.getCategory(parseInt(id!)),
                    api.getCategoryTransactions(parseInt(id!))
                ]);

                setCategory(categoryData);
                setTransactions(transactionsData);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch category details');
                setLoading(false);
                console.error(err);
            }
        };

        fetchCategoryDetails();
    }, [id]);

    const calculateTotalAmount = () => {
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!category) return <div>Category not found</div>;

    return (
        <div className="category-detail card">
            <div className="transaction-header">
                <h2>Category Details</h2>
                <div className="actions">
                    <Link to="/categories" className="btn">Back to List</Link>
                    <Link to={`/categories/edit/${id}`} className="btn btn-secondary">Edit</Link>
                </div>
            </div>

            <div className="category-info">
                <div className="info-group">
                    <h3>Basic Information</h3>
                    <div className="info-row">
                        <span className="info-label">Name:</span>
                        <span className="info-value">{category.name}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">SIFO Code:</span>
                        <span className="info-value">{category.sifo_code || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Description:</span>
                        <span className="info-value">{category.description || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Created:</span>
                        <span className="info-value">
                            {category.created_at
                                ? format(new Date(category.created_at), 'dd.MM.yyyy HH:mm')
                                : '-'}
                        </span>
                    </div>
                </div>

                <div className="info-group">
                    <h3>Financial Summary</h3>
                    <div className="info-row">
                        <span className="info-label">Total Transactions:</span>
                        <span className="info-value">{transactions.length}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Total Amount:</span>
                        <span className={`info-value ${calculateTotalAmount() >= 0 ? 'income' : 'expense'}`}>
                            {calculateTotalAmount().toFixed(2)} NOK
                        </span>
                    </div>
                </div>
            </div>

            {transactions.length > 0 && (
                <div className="category-transactions">
                    <h3>Recent Transactions</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{format(new Date(transaction.booking_date), 'dd.MM.yyyy')}</td>
                                <td>{transaction.title}</td>
                                <td className={transaction.amount >= 0 ? 'income' : 'expense'}>
                                    {transaction.amount.toFixed(2)} {transaction.currency}
                                </td>
                                <td>
                                    <Link
                                        to={`/transactions/${transaction.id}`}
                                        className="btn btn-small"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CategoryDetail;