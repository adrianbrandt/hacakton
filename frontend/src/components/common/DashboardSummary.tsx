import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Transaction {
    id: number;
    amount: number;
    booking_date: string;
    title: string;
    category_name?: string;
}

interface CategorySummary {
    name: string;
    totalAmount: number;
    transactionCount: number;
}

const DashboardSummary: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch transactions
                const transactionsData = await api.getTransactions();
                setTransactions(transactionsData.slice(0, 10)); // Last 10 transactions

                // Calculate category summaries
                const categoryTotals = transactionsData.reduce((acc, transaction) => {
                    if (!transaction.category_name) return acc;

                    const existingCategory = acc.find(
                        cat => cat.name === transaction.category_name
                    );

                    if (existingCategory) {
                        existingCategory.totalAmount += transaction.amount;
                        existingCategory.transactionCount += 1;
                    } else {
                        acc.push({
                            name: transaction.category_name,
                            totalAmount: transaction.amount,
                            transactionCount: 1
                        });
                    }

                    return acc;
                }, [] as CategorySummary[])
                    .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount))
                    .slice(0, 5); // Top 5 categories

                setCategorySummary(categoryTotals);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch dashboard data');
                setLoading(false);
                console.error(err);
            }
        };

        fetchDashboardData();
    }, []);

    const calculateSummary = () => {
        const totalIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
    };

    const { totalIncome, totalExpenses, balance } = calculateSummary();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="dashboard">
            <div className="dashboard-summary">
                <div className="summary-card">
                    <h3>Total Income</h3>
                    <p className="income">{totalIncome.toFixed(2)} NOK</p>
                </div>
                <div className="summary-card">
                    <h3>Total Expenses</h3>
                    <p className="expense">{totalExpenses.toFixed(2)} NOK</p>
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

            <div className="dashboard-sections">
                <div className="card recent-transactions">
                    <div className="card-header">
                        <h3>Recent Transactions</h3>
                        <Link to="/transactions" className="btn btn-small">View All</Link>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id}>
                                <td>{new Date(transaction.booking_date).toLocaleDateString()}</td>
                                <td>{transaction.title}</td>
                                <td>{transaction.category_name || 'Uncategorized'}</td>
                                <td className={transaction.amount >= 0 ? 'income' : 'expense'}>
                                    {transaction.amount.toFixed(2)} NOK
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="card category-summary">
                    <div className="card-header">
                        <h3>Top Categories</h3>
                        <Link to="/categories" className="btn btn-small">View All</Link>
                    </div>
                    <table>
                        <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total Amount</th>
                            <th>Transactions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categorySummary.map(category => (
                            <tr key={category.name}>
                                <td>{category.name}</td>
                                <td className={category.totalAmount >= 0 ? 'income' : 'expense'}>
                                    {category.totalAmount.toFixed(2)} NOK
                                </td>
                                <td>{category.transactionCount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;