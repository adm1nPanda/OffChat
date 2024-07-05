import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:5055');

function Chat({ messages, sendMessage, logout }) {
    const [localMessages, setLocalMessages] = useState(messages);
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [message, setMessage] = useState('');
    const username = localStorage.getItem('username');

    useEffect(() => {
        // Fetch existing messages from the server when the component mounts
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:5055/api/messages');
                setLocalMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        const fetchPinnedMessages = async () => {
            try {
                const response = await axios.get('http://localhost:5055/api/pinned-messages');
                setPinnedMessages(response.data);
            } catch (error) {
                console.error('Error fetching pinned messages:', error);
            }
        };

        fetchMessages();
        fetchPinnedMessages();

        // Listen for new messages
        socket.on('message', (data) => {
            setLocalMessages((prevMessages) => [...prevMessages, data]);
        });

         // Listen for typing events
        socket.on('typing', (data) => {
            setTypingUsers((prevUsers) => [...new Set([...prevUsers, data.username])]);
        });

        // Listen for stop typing events
        socket.on('stop typing', (data) => {
            setTypingUsers((prevUsers) => prevUsers.filter(user => user !== data.username));
        });

        // Listen for pinned messages
        socket.on('pin', (data) => {
            setPinnedMessages((prevPinned) => [...prevPinned, data]);
        });

        // Listen for unpinned messages
        socket.on('unpin', (data) => {
            setPinnedMessages((prevPinned) => prevPinned.filter(msg => msg.id !== data.id));
        });

        socket.on('secret saved', (data) => {
            console.log(data.message);
        });

        socket.on('secret save error', (data) => {
            console.error(data.message);
        });

        socket.on('secret fetched', (data) => {
            if (data.secret) {
                addSystemMessage(`Secret - ${data.title}: ${data.secret}`);
            } else {
                addSystemMessage(`Secret not found: ${data.title}`);
            }
        });

        socket.on('secret fetch error', (data) => {
            addSystemMessage('Error retrieving secret');
        });

        socket.on('secrets listed', (data) => {
            if (data.secrets.length > 0) {
                addSystemMessage(`Available Secrets: ${data.secrets.join(', ')}`);
            } else {
                addSystemMessage('No secrets available');
            }
        });

        socket.on('list secrets error', () => {
            addSystemMessage('Error listing secrets');
        });

        return () => {
            socket.off('message');
            socket.off('typing');
            socket.off('stop typing');
            socket.off('pin');
            socket.off('unpin');
            socket.off('secret saved');
            socket.off('secret save error');
            socket.off('secret fetched');
            socket.off('secret fetch error');
            socket.off('secrets listed');
            socket.off('list secrets error');
        };
    }, []);

    const handleSendMessage = () => {
        if (typeof message === 'string' && message.trim() !== '') {
            if (message.startsWith('/')) {
                handleCommand(message);
            } else {
                sendMessage(message);
            }
            setMessage('');
        }
    };

    const handleCommand = async (command) => {
        const [cmd, ...args] = command.slice(1).split(' ');
        switch (cmd) {
            case 'help':
                addSystemMessage(
                    <div>
                        <em>Available commands:</em>
                        <ul>
                            <li><code>/help</code> - List all commands with their descriptions</li>
                            <li><code>/time</code> - Show the current server time</li>
                            <li><code>/members</code> - List all registered members</li>
                            <li><code>/pin &lt;message_id&gt;</code> - Pin a message</li>
                            <li><code>/unpin &lt;message_id&gt;</code> - Unpin a message</li>
                            <li><code>/secret &lt;title&gt; &lt;uname:pass&gt;</code> - Store a secret</li>
                            <li><code>/getsecret &lt;title&gt;</code> - Get a secret</li>
                            <li><code>/listsecrets </code> - List available secrets</li>
                        </ul>
                    </div>
                );
                break;
            case 'time':
                const currentTime = new Date().toLocaleTimeString();
                addSystemMessage(`Current time is ${currentTime}`);
                break;
            case 'members':
                try {
                    const response = await axios.get('http://localhost:5000/api/users/members');
                    const members = response.data.map(user => user.username);
                    addSystemMessage(
                        <div>
                            <em>Members:</em>
                            <ul>
                                {members.map((member, index) => (
                                    <li key={index}>{member}</li>
                                ))}
                            </ul>
                        </div>
                    );
                } catch (error) {
                    console.error('Error retrieving members:', error); // Log the error
                    addSystemMessage('Error retrieving members');
                }
                break;
            case 'pin':
                const messageId = args[0];
                if (messageId) {
                    const messageToPin = localMessages.find(msg => msg.id === parseInt(messageId, 10));
                    if (messageToPin) {
                        socket.emit('pin', messageToPin);
                    } else {
                        addSystemMessage(`Message with ID ${messageId} not found`);
                    }
                } else {
                    addSystemMessage('Usage: /pin <message_id>');
                }
                break;
            case 'unpin':
                const unpinMessageId = args[0];
                if (unpinMessageId) {
                    const messageToUnpin = pinnedMessages.find(msg => msg.id === parseInt(unpinMessageId, 10));
                    if (messageToUnpin) {
                        socket.emit('unpin', messageToUnpin);
                    } else {
                        addSystemMessage(`Pinned message with ID ${unpinMessageId} not found`);
                    }
                } else {
                    addSystemMessage('Usage: /unpin <message_id>');
                }
                break;
            case 'secret':
                const [title, ...secretParts] = args;
                const secret = secretParts.join(' ');
                if (title && secret) {
                    socket.emit('secret', { username, title, secret });
                    addSystemMessage('Secret saved securely.');
                } else {
                    addSystemMessage('Usage: /secret <title> <your_secret>');
                }
                break;
            case 'getsecret':
                const secretTitle = args.join(' ');
                if (secretTitle) {
                    socket.emit('getsecret', { username, title: secretTitle });
                } else {
                    addSystemMessage('Usage: /getsecret <title>');
                }
                break;
            case 'listsecrets':
                socket.emit('listsecrets', { username });
                break;
            default:
                addSystemMessage(`Unknown command: ${cmd}`);
                break;
        }
    };

    const addSystemMessage = (content) => {
        setLocalMessages((prevMessages) => [
            ...prevMessages,
            { username: 'System', content }
        ]);
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { username });
        }

        if (e.target.value === '') {
            setIsTyping(false);
            socket.emit('stop typing', { username });
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div>
            <div className="pinned-messages">
                <h5>Pinned Messages</h5>
                {pinnedMessages.map((msg, index) => (
                    <div key={index}>
                        <div>
                            <strong>{msg.username}: </strong>{msg.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="chat-messages">
                {localMessages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        <div>
                            <strong>{msg.username}: </strong>{msg.content}
                        </div>
                        <span className="timestamp">{formatTimestamp(msg.createdAt)}</span>
                    </div>
                ))}
                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                    </div>
                )}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default Chat;
