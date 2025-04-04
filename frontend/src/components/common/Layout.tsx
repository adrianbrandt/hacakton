import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
    return (
        <div className="app">
            <Header />
            <div className="container">
                <Outlet /> {/* This is where child routes will be rendered */}
            </div>
        </div>
    );
};

export default Layout;