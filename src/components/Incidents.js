
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import './Incidents.css';

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [ttp, setTtp] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('Low');
    const [status, setStatus] = useState('Open');
    const [tags, setTags] = useState('');
    const [assignedUser, setAssignedUser] = useState('');
    const [selectedIncident, setSelectedIncident] = useState(null);
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/incidents');
            setIncidents(response.data);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        }
    };

    const handleCreateIncident = async () => {
        if (ttp.trim() !== '' ) {
            try {
                const response = await axios.post('http://localhost:5000/api/incidents', {
                    ttp,
                    description,
                    severity,
                    status,
                    tags,
                    assigned_user: assignedUser,
                    username
                });
                setIncidents([...incidents, response.data]);
                resetForm();
            } catch (error) {
                console.error('Error creating incident:', error);
            }
        }
    };

    const handleDeleteIncident = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/incidents/${id}`);
            setIncidents(incidents.filter(incident => incident.id !== id));
        } catch (error) {
            console.error('Error deleting incident:', error);
        }
    };

    const handleSelectIncident = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/incidents/${id}`);
            setSelectedIncident(response.data);
        } catch (error) {
            console.error('Error retrieving incident:', error);
        }
    };

    const resetForm = () => {
        setTtp('');
        setDescription('');
        setSeverity('Low');
        setStatus('Open');
        setTags('');
        setAssignedUser('');
        setSelectedIncident(null);
    };

    return (
    <div className="incidents-container">
        <h2>Incidents</h2>
        <div className="incidents-form">
            <input
                type="text"
                placeholder="TTP"
                value={ttp}
                onChange={(e) => setTtp(e.target.value)}
                className="input-field"
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
            ></textarea>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="input-field">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
            </select>
            <input
                type="text"
                placeholder="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input-field"
            />
            <input
                type="text"
                placeholder="Assigned User"
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                className="input-field"
            />
            <button onClick={handleCreateIncident} className="action-button">Create Incident</button>
            {selectedIncident && (
                <div className="selected-incident">
                    <h3>Selected Incident</h3>
                    <p>TTP: {selectedIncident.ttp}</p>
                    <p>Description: {selectedIncident.description}</p>
                    <p>Severity: {selectedIncident.severity}</p>
                    <p>Status: {selectedIncident.status}</p>
                    <p>Tags: {selectedIncident.tags}</p>
                    <p>Assigned User: {selectedIncident.assigned_user}</p>
                </div>
            )}
        </div>
        <div className="incidents-timeline">
            <Timeline>
                {incidents.map((incident) => (
                    <TimelineEvent
                        key={incident.id}
                        title={incident.ttp}
                        createdAt={new Date(incident.createdAt).toLocaleString()}
                        icon={<i className="event-icon" />}
                        className="timeline-event"
                        style={{ background:"var(--content-background-color)", 
                                 color: "var(--text-color)" }}
                    >
                    </TimelineEvent>
                ))}
            </Timeline>
        </div>
    </div>
);
};

export default Incidents;