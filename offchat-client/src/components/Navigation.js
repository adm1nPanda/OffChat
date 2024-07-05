import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ logout, toggleTheme }) => {
    return (
        <nav className="navbar">
            <div className="navbar-brand">OffChat</div>
            <ul className="navbar-links">
                <li><a className="nav-link" onClick={toggleTheme}>Toggle Theme</a></li>
                <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : undefined}>Chat</NavLink></li>
                <li><NavLink to="/incidents" className={({ isActive }) => isActive ? 'active' : undefined}>Incidents</NavLink></li>
                <li><NavLink to="/activitylogs" className={({ isActive }) => isActive ? 'active' : undefined}>Activity Logs</NavLink></li>
                <li><NavLink to="/secrets" className={({ isActive }) => isActive ? 'active' : undefined}>Secrets</NavLink></li>
                <li><a onClick={(e) => { e.preventDefault(); logout(); }} className={({ isActive }) => isActive ? 'active' : undefined}>Logout</a></li>
            </ul>
        </nav>
    );
};

export default Navigation;
