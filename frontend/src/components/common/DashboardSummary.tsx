import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api, { Transaction } from '../../services/api';
import './DashboardSummary.css';

interface CategorySummary {
    name: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

interface DateFilter {
    label: string;
    startDate: Date;
    endDate: Date;
}
const DashboardSummary: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dateFilters: DateFilter[] = [
        {
            label: 'This Month',
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
        {
            label: 'Last Month',
            startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
        },
        {
            label: 'This Year',
            startDate: new Date(new Date().getFullYear(), 0, 1),
            endDate: new Date(new Date().getFullYear(), 11, 31),
        },
        {
            label: 'Last Year',
            startDate: new Date(new Date().getFullYear() - 1, 0, 1),
            endDate: new Date(new Date().getFullYear() - 1, 11, 31),
        },
        {
            label: 'All Time',
            startDate: new Date(2000, 0, 1), // Far back start date
            endDate: new Date(),
        },
    ];

    const [selectedFilter, setSelectedFilter] = useState<DateFilter>(dateFilters[0]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const options = {
                    startDate: selectedFilter.startDate,
                    endDate: selectedFilter.endDate,
                };

                const data = await api.getTransactions(options);
                setTransactions(data);

                const categoryTotals = calculateCategorySummary(data);
                setCategorySummary(categoryTotals);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedFilter]);

    const calculateCategorySummary = (transList: Transaction[]): CategorySummary[] => {
        const expenseTransactions = transList.filter((t) => t.amount < 0);
        const totalExpenses = Math.abs(
            expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
        );

        const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
            const category = transaction.category_name || 'Uncategorized';
            const existingCategory = acc.find((c) => c.name === category);
            const amount = Math.abs(transaction.amount);

            if (existingCategory) {
                existingCategory.totalAmount += amount;
                existingCategory.transactionCount += 1;
            } else {
                acc.push({
                    name: category,
                    totalAmount: amount,
                    transactionCount: 1,
                    percentage: 0,
                });
            }

            return acc;
        }, [] as CategorySummary[]);

        return categoryTotals
            .map((category) => ({
                ...category,
                percentage:
                    totalExpenses > 0
                        ? parseFloat(((category.totalAmount / totalExpenses) * 100).toFixed(2))
                        : 0,
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount);
    };

    const calculateSummary = (transactions: Transaction[]) => {
        const totalIncome = transactions
            .filter((t) => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = Math.abs(
            transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
        );

        return {
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
        };
    };

    const { totalIncome, totalExpenses, balance } = calculateSummary(transactions);

    const chartData = transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.booking_date).toLocaleString('default', { month: 'short', year: 'numeric' });
        const existingMonth = acc.find((d) => d.month === month);

        if (existingMonth) {
            existingMonth.income += transaction.amount > 0 ? transaction.amount : 0;
            existingMonth.expense += transaction.amount < 0 ? Math.abs(transaction.amount) : 0;
        } else {
            acc.push({
                month,
                income: transaction.amount > 0 ? transaction.amount : 0,
                expense: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
            });
        }

        return acc;
    }, [] as { month: string; income: number; expense: number }[]).sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Financial Overview</h2>
                <select
                    value={selectedFilter.label}
                    onChange={(e) => {
                        const filter = dateFilters.find((f) => f.label === e.target.value);
                        if (filter) setSelectedFilter(filter);
                    }}
                    className="filter-select"
                >
                    {dateFilters.map((filter) => (
                        <option key={filter.label} value={filter.label}>
                            {filter.label}
                        </option>
                    ))}
                </select>
            </div>

            {error ? (
                <div className="dashboard-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            ) : (
                <>
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
                    </div>

                    <div className="dashboard-chart">
                        <h3>Income vs Expense</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#82ca9d" />
                                <Line type="monotone" dataKey="expense" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="dashboard-category-summary">
                        <h3>Expense by Category</h3>
                        <div className="category-chart">
                            {categorySummary.map((category) => (
                                <div key={category.name} className="category-item">
                                    <div className="category-info">
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-amount">
                      {category.totalAmount.toFixed(2)} NOK
                    </span>
                                    </div>
                                    <div className="category-bar">
                                        <div
                                            className="category-bar-fill"
                                            style={{ width: `${category.percentage}%` }}
                                        />
                                    </div>
                                    <span className="category-percentage">{category.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-recent-transactions">
                        <h3>Recent Transactions</h3>
                        <div className="transactions-table">
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
                                {transactions.slice(0, 10).map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{new Date(transaction.booking_date).toLocaleDateString()}</td>
                                        <td>{transaction.title}</td>
                                        <td>{transaction.category_name || 'Uncategorized'}</td>
                                        <td
                                            className={transaction.amount >= 0 ? 'amount income' : 'amount expense'}
                                        >
                                            {transaction.amount.toFixed(2)} {transaction.currency}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardSummary;