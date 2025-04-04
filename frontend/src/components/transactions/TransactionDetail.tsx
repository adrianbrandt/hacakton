import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import './TransactionDetail.css';

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
    category_id: number;
    category_name: string;
    created_at: string;
    updated_at: string;
}

interface TransactionDetailProps {
    transactionId?: string;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transactionId }) => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransaction = async () => {
            if (!transactionId) return;

            try {
                const data = await api.getTransaction(parseInt(transactionId));
                setTransaction(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch transaction details');
                setLoading(false);
                console.error(err);
            }
        };

        fetchTransaction();
    }, [transactionId]);

    const handleDelete = async () => {
        if (!transactionId) return;

        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.deleteTransaction(parseInt(transactionId));
                navigate('/transactions');
            } catch (err) {
                console.error(err);
                alert('Failed to delete transaction');
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!transaction) return <div>Transaction not found</div>;

    return (
        <div className="transaction-detail card">
            <div className="transaction-header">
                <h2>Transaction Details</h2>
                <div className="actions">
                    <button onClick={() => navigate('/transactions')} className="btn">Back to List</button>
                    <button
                        onClick={() => navigate(`/transactions/edit/${transactionId}`)}
                        className="btn btn-secondary"
                    >
                        Edit
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger">Delete</button>
                </div>
            </div>

            <div className="transaction-info">
                {/* Similar to the previous implementation */}
                <div className="info-group">
                    <h3>Basic Information</h3>
                    <div className="info-row">
                        <span className="info-label">Date:</span>
                        <span className="info-value">
                            {format(new Date(transaction.booking_date), 'dd.MM.yyyy')}
        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Amount:</span>
                        <span className={`info-value ${transaction.amount >= 0 ? 'income' : 'expense'}`}>
                            {transaction.amount.toFixed(2)} {transaction.currency}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Title:</span>
                        <span className="info-value">{transaction.title}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Description:</span>
                        <span className="info-value">{transaction.name || '-'}</span>
                    </div>
                </div>

                <div className="info-group">
                    <h3>Transaction Details</h3>
                    <div className="info-row">
                        <span className="info-label">Sender:</span>
                        <span className="info-value">{transaction.sender || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Receiver:</span>
                        <span className="info-value">{transaction.receiver || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Payment Type:</span>
                        <span className="info-value">{transaction.payment_type || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Category:</span>
                        <span className="info-value">{transaction.category_name || 'Uncategorized'}</span>
                    </div>
                </div>

                <div className="info-group">
                    <h3>System Information</h3>
                    <div className="info-row">
                        <span className="info-label">Created:</span>
                        <span className="info-value">
                            {transaction.created_at
                                ? format(new Date(transaction.created_at), 'dd.MM.yyyy HH:mm')
                                : '-'}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Last Updated:</span>
                        <span className="info-value">
                            {transaction.updated_at
                                ? format(new Date(transaction.updated_at), 'dd.MM.yyyy HH:mm')
                                : '-'}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">ID:</span>
                        <span className="info-value">{transaction.id}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetail;