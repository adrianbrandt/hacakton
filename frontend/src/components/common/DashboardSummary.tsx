import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Transaction {
    id: number;
    amount: number;
    booking_date: string;
    // ... other properties
}

const DashboardSummary: React.FC = () => {
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    // Calculate summary values
    const totalIncome = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome + totalExpenses;

    return (
        <div className="dashboard-summary">
            <div className="summary-card">
                <h3>Total Income</h3>
                <p className="income">{totalIncome.toFixed(2)} NOK</p>
            </div>
            <div className="summary-card">
                <h3>Total Expenses</h3>
                <p className="expense">{Math.abs(totalExpenses).toFixed(2)} NOK</p>
            </div>
            <div className="summary-card">
                <h3>Balance</h3>
                <p className={balance >= 0 ? 'income' : 'expense'}>
                    {balance.toFixed(2)} NOK
                </p>
            </div>
            <div className="summary-card">
                <h3>Transactions</h3>
                <p>{transactions.length}</p>
            </div>
        </div>
    );
};

export default DashboardSummary;