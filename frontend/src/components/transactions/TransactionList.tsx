import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import './TransactionList.css';

interface Transaction {
    id: number;
    booking_date: string;
    amount: number;
    sender: string;
    receiver: string;
    name: string;
    title: string;
    currency: string;
    payment_type: string;
    category_name: string;
}

const TransactionList: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await api.getTransactions();
                setTransactions(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch transactions');
                setLoading(false);
                console.error(err);
            }
        };

        fetchTransactions();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.deleteTransaction(id);
                setTransactions(transactions.filter(t => t.id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete transaction');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="transaction-list">
            <div className="card">
                <div className="transaction-header">
                    <h2>Transactions</h2>
                    <Link to="/transactions/new" className="btn">Add Transaction</Link>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{format(new Date(transaction.booking_date), 'dd.MM.yyyy')}</td>
                                <td>{transaction.title}</td>
                                <td>{transaction.category_name || 'Uncategorized'}</td>
                                <td className={transaction.amount >= 0 ? 'income' : 'expense'}>
                                    {transaction.amount.toFixed(2)} {transaction.currency}
                                </td>
                                <td>
                                    <div className="actions">
                                        <Link to={`/transactions/${transaction.id}`} className="btn btn-small">View</Link>
                                        <Link to={`/transactions/edit/${transaction.id}`} className="btn btn-small btn-secondary">Edit</Link>
                                        <button
                                            onClick={() => handleDelete(transaction.id)}
                                            className="btn btn-small btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionList;