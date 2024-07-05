import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ActivityLogs.css';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetchActivityLogs();
    }, []);

    const fetchActivityLogs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/activitylogs');
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        }
    };

    return (
        <div className="activity-logs-container">
            <h2>Activity Logs</h2>
            <div className="logs-list">
                {logs.map((log) => (
                    <div key={log.id} className="log-entry">
                        <span className="log-user">{log.user}</span>
                        <span className="log-action">{log.action_type}</span>
                        <span className="log-timestamp">{new Date(log.createdAt).toLocaleString()}</span>
                        <span className="log-details">{log.details}</span>
                        {log.related_entity && <span className="log-entity">({log.related_entity})</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLogs;
