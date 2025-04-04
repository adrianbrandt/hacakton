import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useRouteError
} from 'react-router-dom';
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

// Error Boundary Component
function ErrorBoundary() {
    const error = useRouteError();
    console.error('Routing Error:', error);

    return (
        <div>
            <h1>Oops! Something went wrong.</h1>
            <p>An unexpected error occurred while routing.</p>
        </div>
    );
}

const App: React.FC = () => {
    console.log('App component rendering'); // Debugging log

    return (
        <Router>
            <div className="app">
                <Header />
                <div className="container">
                    <Routes>
                        {/* Dashboard */}
                        <Route
                            path="/"
                            element={<DashboardSummary />}
                            errorElement={<ErrorBoundary />}
                        />

                        {/* Transactions Routes */}
                        <Route
                            path="/transactions"
                            element={<TransactionList />}
                            errorElement={<ErrorBoundary />}
                        />
                        <Route
                            path="/transactions/new"
                            element={<TransactionForm />}
                            errorElement={<ErrorBoundary />}
                        />
                        <Route
                            path="/transactions/edit/:id"
                            element={<TransactionForm />}
                            errorElement={<ErrorBoundary />}
                        />
                        <Route
                            path="/transactions/:id"
                            element={<TransactionDetail />}
                            errorElement={<ErrorBoundary />}
                        />

                        {/* Categories Routes */}
                        <Route
                            path="/categories"
                            element={<CategoryList />}
                            errorElement={<ErrorBoundary />}
                        />
                        <Route
                            path="/categories/new"
                            element={<CategoryForm />}
                            errorElement={<ErrorBoundary />}
                        />
                        <Route
                            path="/categories/edit/:id"
                            element={<CategoryForm />}
                            errorElement={<ErrorBoundary />}
                        />
                        <Route
                            path="/categories/:id"
                            element={<CategoryDetail />}
                            errorElement={<ErrorBoundary />}
                        />

                        {/* Fallback route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;