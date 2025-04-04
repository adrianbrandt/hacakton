import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api, { Transaction } from '../../services/api';
import './TransactionList.css';

const TransactionList: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await api.getTransactions();
                // Ensure amount is a number
                const processedTransactions = data.map(transaction => ({
                    ...transaction,
                    amount: Number(transaction.amount)
                }));
                setTransactions(processedTransactions);
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
        const confirmDelete = window.confirm('Are you sure you want to delete this transaction?');

        if (confirmDelete) {
            try {
                await api.deleteTransaction(id);
                setTransactions(transactions.filter(t => t.id !== id));
            } catch (err) {
                console.error(err);
                setError('Failed to delete transaction');
            }
        }
    };

    const isValidAmount = (amount: number): boolean => {
        return !isNaN(amount) && isFinite(amount);
    };

    if (loading) {
        return (
            <div className="transaction-list loading">
                <div className="spinner"></div>
                <p>Loading transactions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="transaction-list error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-secondary">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="transaction-list">
            <div className="card">
                <div className="transaction-header">
                    <h2>Transactions</h2>
                    <Link to="/transactions/new" className="btn">Add Transaction</Link>
                </div>

                {transactions.length === 0 ? (
                    <div className="no-transactions">
                        <p>No transactions found.</p>
                        <Link to="/transactions/new" className="btn">Add your first transaction</Link>
                    </div>
                ) : (
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
                            {transactions.map(transaction => {
                                // Safely handle amount formatting
                                const formattedAmount = isValidAmount(transaction.amount)
                                    ? transaction.amount.toFixed(2)
                                    : 'N/A';

                                return (
                                    <tr key={transaction.id}>
                                        <td>{format(new Date(transaction.booking_date), 'dd.MM.yyyy')}</td>
                                        <td>{transaction.title}</td>
                                        <td>{transaction.category_name || 'Uncategorized'}</td>
                                        <td className={
                                            transaction.amount >= 0
                                                ? 'amount income'
                                                : 'amount expense'
                                        }>
                                            {formattedAmount} {transaction.currency}
                                        </td>
                                        <td>
                                            <div className="actions">
                                                <Link
                                                    to={`/transactions/${transaction.id}`}
                                                    className="btn btn-small btn-view"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/transactions/edit/${transaction.id}`}
                                                    className="btn btn-small btn-edit"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(transaction.id)}
                                                    className="btn btn-small btn-delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionList;