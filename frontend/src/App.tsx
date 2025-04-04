import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import DashboardSummary from './components/common/DashboardSummary';

// Transactions
import TransactionList from './components/transactions/TransactionList';
import TransactionDetail from './components/transactions/TransactionDetail';
import TransactionForm from './components/transactions/TransactionForm';

// Categories
import CategoryList from './components/categories/CategoryList';
import CategoryDetail from './components/categories/CategoryDetail';
import CategoryForm from './components/categories/CategoryForm';

import './App.css';

const App: React.FC = () => {
    return (
        <Router>
            <div className="app">
                <Header />
                <div className="container">
                    <Routes>
                        {/* Dashboard */}
                        <Route path="/" element={<DashboardSummary />} />

                        {/* Transactions Routes */}
                        <Route path="/transactions" element={<TransactionList />} />
                        <Route path="/transactions/new" element={<TransactionForm />} />
                        <Route path="/transactions/edit/:id" element={<TransactionForm />} />
                        <Route path="/transactions/:id" element={<TransactionDetail />} />

                        {/* Categories Routes */}
                        <Route path="/categories" element={<CategoryList />} />
                        <Route path="/categories/new" element={<CategoryForm />} />
                        <Route path="/categories/edit/:id" element={<CategoryForm />} />
                        <Route path="/categories/:id" element={<CategoryDetail />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;