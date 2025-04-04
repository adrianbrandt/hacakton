import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="container">
                <h1 className="logo">Personal Finance App</h1>
                <nav className="nav">
                    <ul>
                        <li><Link to="/">Dashboard</Link></li>
                        <li><Link to="/transactions">Transactions</Link></li>
                        <li><Link to="/categories">Categories</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;