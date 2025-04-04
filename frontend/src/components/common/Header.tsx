import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const location = useLocation();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('nb-NO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('nb-NO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'home' },
        { path: '/transactions', label: 'Transactions', icon: 'list' },
        { path: '/categories', label: 'Categories', icon: 'folder' }
    ];

    return (
        <header className="header">
            <div className="container header-content">
                <div className="header-logo">
                    <h1>Personal Finance Tracker</h1>
                    <div className="header-datetime">
                        <span className="date">{formatDate(currentTime)}</span>
                        <span className="time">{formatTime(currentTime)}</span>
                    </div>
                </div>
                <nav className="header-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;