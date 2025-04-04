import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import api, { Transaction } from '../../services/api';
import './DashboardSummary.css';

interface CategorySummary {
    name: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

const DashboardSummary: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const now = new Date();
                const startDate = timeframe === 'month'
                    ? startOfMonth(now)
                    : startOfYear(now);

                const endDate = timeframe === 'month'
                    ? endOfMonth(now)
                    : endOfYear(now);

                // Fetch transactions with date range
                const data = await api.getTransactions({
                    startDate,
                    endDate,
                    sort: 'desc'
                });

                if (data.length === 0) {
                    setError('No transactions found for the selected timeframe.');
                }

                setTransactions(data);

                // Calculate category summaries
                const categoryTotals = calculateCategorySummary(data);
                setCategorySummary(categoryTotals);

                setLoading(false);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to fetch dashboard data. Please try again.');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [timeframe]);

    const calculateCategorySummary = (transList: Transaction[]): CategorySummary[] => {
        const expenseTransactions = transList.filter(t => t.amount < 0);
        const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));

        const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
            const category = transaction.category_name || 'Uncategorized';
            const existingCategory = acc.find(c => c.name === category);
            const amount = Math.abs(transaction.amount);

            if (existingCategory) {
                existingCategory.totalAmount += amount;
                existingCategory.transactionCount += 1;
            } else {
                acc.push({
                    name: category,
                    totalAmount: amount,
                    transactionCount: 1,
                    percentage: 0
                });
            }

            return acc;
        }, [] as CategorySummary[]);

        // Calculate percentages
        return categoryTotals.map(category => ({
            ...category,
            percentage: totalExpenses > 0
                ? parseFloat(((category.totalAmount / totalExpenses) * 100).toFixed(2))
                : 0
        })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);
    };

    const calculateSummary = () => {
        const totalIncome = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = Math.abs(transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses
        };
    };

    const { totalIncome, totalExpenses, balance } = calculateSummary();

    if (loading) {
        return (
            <div className="dashboard loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-secondary">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <h2>Financial Overview</h2>
                <div className="timeframe-toggle">
                    <button
                        className={`btn ${timeframe === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('month')}
                    >
                        This Month
                    </button>
                    <button
                        className={`btn ${timeframe === 'year' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTimeframe('year')}
                    >
                        This Year
                    </button>
                </div>
            </div>

            <div className="dashboard-summary">
                <div className="summary-card income">
                    <h3>Total Income</h3>
                    <p className="amount">{totalIncome.toFixed(2)} NOK</p>
                </div>
                <div className="summary-card expenses">
                    <h3>Total Expenses</h3>
                    <p className="amount">{totalExpenses.toFixed(2)} NOK</p>
                </div>
                <div className="summary-card balance">
                    <h3>Net Balance</h3>
                    <p className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
                        {balance.toFixed(2)} NOK
                    </p>
                </div>
                <div className="summary-card transactions">
                    <h3>Total Transactions</h3>
                    <p className="amount">{transactions.length}</p>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="card recent-transactions">
                    <div className="card-header">
                        <h3>Recent Transactions</h3>
                        <Link to="/transactions" className="btn btn-small">View All</Link>
                    </div>
                    {transactions.length > 0 ? (
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
                            {transactions.slice(0, 10).map(transaction => (
                                <tr key={transaction.id}>
                                    <td>{format(new Date(transaction.booking_date), 'dd.MM.yyyy')}</td>
                                    <td>{transaction.title}</td>
                                    <td>{transaction.category_name || 'Uncategorized'}</td>
                                    <td className={transaction.amount >= 0 ? 'income' : 'expense'}>
                                        {transaction.amount.toFixed(2)} NOK
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-transactions">
                            <p>No transactions found for this period.</p>
                        </div>
                    )}
                </div>

                <div className="card category-summary">
                    <div className="card-header">
                        <h3>Top Expense Categories</h3>
                        <Link to="/categories" className="btn btn-small">View All</Link>
                    </div>
                    {categorySummary.length > 0 ? (
                        <div className="category-breakdown">
                            {categorySummary.map(category => (
                                <div key={category.name} className="category-item">
                                    <div className="category-info">
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-amount">{category.totalAmount.toFixed(2)} NOK</span>
                                    </div>
                                    <div className="category-percentage">
                                        <div
                                            className="percentage-bar"
                                            style={{width: `${category.percentage}%`}}
                                        ></div>
                                        <span>{category.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-categories">
                            <p>No expense categories found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardSummary;