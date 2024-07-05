import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Incidents from './components/Incidents';
import ActivityLogs from './components/ActivityLogs';
import MainLayout from './components/MainLayout';

const socket = io('http://localhost:5055');

function App() {
    const [messages] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    const handleSendMessage = (message) => {
        const username = localStorage.getItem('username');
        socket.emit('message', { username, content: message });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
    };

    return (
        <MainLayout logout={logout}>
            <Routes>
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Chat messages={messages} sendMessage={handleSendMessage} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/incidents"
                    element={
                        isAuthenticated ? <Incidents /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/activitylogs"
                    element={
                        isAuthenticated ? <ActivityLogs /> : <Navigate to="/login" />
                    }
                />
            </Routes>
        </MainLayout>
    );
}

export default App;
