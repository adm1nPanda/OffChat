import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Secrets.css';

const socket = io('http://localhost:5055');

const Secrets = () => {
    const [secrets, setSecrets] = useState([]);
    const [title, setTitle] = useState('');
    const [secret, setSecret] = useState('');
    const [retrievedSecrets, setRetrievedSecrets] = useState({});
    const username = localStorage.getItem('username'); // Assume username is stored in localStorage

    useEffect(() => {
        socket.on('secret saved', (data) => {
            console.log(data.message);
            handleListSecrets();
        });
        socket.on('secret fetched', (data) => {
            setRetrievedSecrets(prev => ({ ...prev, [data.title]: data.secret }));
        });
        socket.on('secrets listed', (data) => {
            setSecrets(data.secrets);
        });

        return () => {
            socket.off('secret saved');
            socket.off('secret fetched');
            socket.off('secrets listed');
        };
    }, []);

    const handleCreateSecret = () => {
        socket.emit('secret', { username, title, secret });
        setTitle('');
        setSecret('');
    };

    const handleListSecrets = () => {
        socket.emit('listsecrets', { username });
    };

    const handleRetrieveSecret = (secretTitle) => {
        socket.emit('getsecret', { username, title: secretTitle });
    };

    return (
        <div className="secrets-container">
            <h2>Secrets</h2>
            <div className="secrets-form">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                />
                <textarea
                    placeholder="Secret"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    className="input-field"
                ></textarea>
                <button onClick={handleCreateSecret} className="action-button">Create Secret</button>
                <button onClick={handleListSecrets} className="action-button">List Secrets</button>
            </div>
            <div className="secrets-list">
                <h3>Saved Secrets</h3>
                {secrets.map((secretTitle, index) => (
                    <div key={index} className="secret-entry">
                        <span className="secret-title" onClick={() => handleRetrieveSecret(secretTitle)}>{secretTitle}</span>
                        {retrievedSecrets[secretTitle] && (
                            <span className="secret-content">{retrievedSecrets[secretTitle]}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Secrets;