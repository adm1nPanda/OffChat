import React, { useState } from 'react';
import Navigation from './Navigation';
import './MainLayout.css';

const MainLayout = ({ children, logout }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode', !isDarkMode);
    };
    
    return (
        <div className={`main-layout ${isDarkMode ? 'dark-mode' : ''}`}>
            <Navigation logout={logout} toggleTheme={toggleTheme} />
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
