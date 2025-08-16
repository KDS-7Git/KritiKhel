import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://kritikhel-production.up.railway.app/api';

const AdminDashboard = ({ onLogout }) => {
    const [players, setPlayers] = useState([]);
    const [leaderboards, setLeaderboards] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('players');
    const [error, setError] = useState('');
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', rollNumber: '' });
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const adminToken = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchPlayers();
        fetchLeaderboards();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/players`, {
                headers: { 'x-admin-token': adminToken }
            });
            setPlayers(response.data);
        } catch (error) {
            console.error('Failed to fetch players:', error);
            if (error.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('adminToken');
                onLogout();
                return;
            }
            setError('Failed to fetch players: ' + (error.response?.data?.message || error.message));
        }
        setLoading(false);
    };

    const fetchLeaderboards = async () => {
        const games = ['bubbleChallenge', 'jumbledWords'];
        const leaderboardData = {};
        
        for (const game of games) {
            try {
                const response = await axios.get(`${API_URL}/leaderboard/${game}`);
                leaderboardData[game] = response.data;
            } catch (error) {
                console.error(`Failed to fetch ${game} leaderboard:`, error);
                leaderboardData[game] = [];
            }
        }
        setLeaderboards(leaderboardData);
    };

    const deletePlayer = async (rollNumber) => {
        if (!window.confirm(`Are you sure you want to delete player ${rollNumber}?`)) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/admin/players/${rollNumber}`, {
                headers: { 'x-admin-token': adminToken }
            });
            fetchPlayers();
            fetchLeaderboards();
        } catch (error) {
            setError('Failed to delete player');
        }
    };

    const exportData = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/export`, {
                headers: { 'x-admin-token': adminToken },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `game_data_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setError('Failed to export data');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Kolkata'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const editPlayer = (player) => {
        setEditingPlayer(player.rollNumber);
        setEditForm({
            name: player.name,
            phone: player.phone,
            rollNumber: player.rollNumber
        });
    };

    const savePlayerEdit = async () => {
        try {
            await axios.put(`${API_URL}/admin/players/${editingPlayer}`, editForm, {
                headers: { 'x-admin-token': adminToken }
            });
            setEditingPlayer(null);
            fetchPlayers();
        } catch (error) {
            setError('Failed to update player');
        }
    };

    const cancelEdit = () => {
        setEditingPlayer(null);
        setEditForm({ name: '', phone: '', rollNumber: '' });
    };

    const togglePlayerSelection = (rollNumber) => {
        setSelectedPlayers(prev => 
            prev.includes(rollNumber) 
                ? prev.filter(r => r !== rollNumber)
                : [...prev, rollNumber]
        );
    };

    const selectAllPlayers = () => {
        if (selectedPlayers.length === players.length) {
            setSelectedPlayers([]);
        } else {
            setSelectedPlayers(players.map(p => p.rollNumber));
        }
    };

    const deleteSelectedPlayers = async () => {
        if (selectedPlayers.length === 0) return;
        
        const confirmMessage = selectedPlayers.length === players.length 
            ? 'Are you sure you want to delete ALL players? This action cannot be undone!'
            : `Are you sure you want to delete ${selectedPlayers.length} selected players?`;
            
        if (!window.confirm(confirmMessage)) return;

        try {
            await axios.delete(`${API_URL}/admin/players/bulk`, {
                headers: { 'x-admin-token': adminToken },
                data: { rollNumbers: selectedPlayers }
            });
            setSelectedPlayers([]);
            fetchPlayers();
            fetchLeaderboards();
        } catch (error) {
            setError('Failed to delete selected players');
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="admin-actions">
                    <button onClick={exportData} className="export-btn">Export Data</button>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="admin-tabs">
                <button 
                    className={activeTab === 'players' ? 'active' : ''} 
                    onClick={() => setActiveTab('players')}
                >
                    Players ({players.length})
                </button>
                <button 
                    className={activeTab === 'leaderboards' ? 'active' : ''} 
                    onClick={() => setActiveTab('leaderboards')}
                >
                    Leaderboards
                </button>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {activeTab === 'players' && (
                <div className="players-section">
                    <div className="section-header">
                        <h2>All Players ({players.length})</h2>
                        <div className="bulk-actions">
                            <button 
                                onClick={selectAllPlayers}
                                className="select-all-btn"
                            >
                                {selectedPlayers.length === players.length ? 'Deselect All' : 'Select All'}
                            </button>
                            {selectedPlayers.length > 0 && (
                                <button 
                                    onClick={deleteSelectedPlayers}
                                    className="bulk-delete-btn"
                                >
                                    Delete Selected ({selectedPlayers.length})
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPlayers.length === players.length && players.length > 0}
                                            onChange={selectAllPlayers}
                                        />
                                    </th>
                                    <th>Roll Number</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Jumbled Words</th>
                                    <th>Bubble Challenge</th>
                                    <th>Registration Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map(player => (
                                    <tr key={player.rollNumber} className={selectedPlayers.includes(player.rollNumber) ? 'selected' : ''}>
                                        <td>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedPlayers.includes(player.rollNumber)}
                                                onChange={() => togglePlayerSelection(player.rollNumber)}
                                            />
                                        </td>
                                        <td>
                                            {editingPlayer === player.rollNumber ? (
                                                <input 
                                                    type="text" 
                                                    value={editForm.rollNumber}
                                                    onChange={(e) => setEditForm({...editForm, rollNumber: e.target.value})}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                <span className="roll-number">{player.rollNumber}</span>
                                            )}
                                        </td>
                                        <td>
                                            {editingPlayer === player.rollNumber ? (
                                                <input 
                                                    type="text" 
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                player.name
                                            )}
                                        </td>
                                        <td>
                                            {editingPlayer === player.rollNumber ? (
                                                <input 
                                                    type="text" 
                                                    value={editForm.phone}
                                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                                    className="edit-input"
                                                />
                                            ) : (
                                                <span className="phone-number">{player.phone}</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ textAlign: 'center' }}>
                                                <span className="score jumbled-score">
                                                    {player.scores?.jumbledWords || 0}
                                                </span>
                                                {player.scoreSubmissions?.jumbledWords?.submittedAt && (
                                                    <div className="submission-time">
                                                        {formatDate(player.scoreSubmissions.jumbledWords.submittedAt)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ textAlign: 'center' }}>
                                                <span className="score bubble-score">
                                                    {player.scores?.bubbleChallenge || 0}
                                                </span>
                                                {player.scoreSubmissions?.bubbleChallenge?.submittedAt && (
                                                    <div className="submission-time">
                                                        {formatDate(player.scoreSubmissions.bubbleChallenge.submittedAt)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="date-cell">{formatDate(player.createdAt)}</td>
                                        <td>
                                            {editingPlayer === player.rollNumber ? (
                                                <div className="edit-actions">
                                                    <button onClick={savePlayerEdit} className="save-btn">Save</button>
                                                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="row-actions">
                                                    <button 
                                                        onClick={() => editPlayer(player)}
                                                        className="edit-btn"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => deletePlayer(player.rollNumber)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'leaderboards' && (
                <div className="leaderboards-section">
                    <h2>Game Leaderboards</h2>
                    {Object.entries(leaderboards).map(([game, data]) => (
                        <div key={game} className="game-leaderboard">
                            <h3>{game === 'jumbledWords' ? 'Jumbled Words' : 'Bubble Challenge'}</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Roll Number</th>
                                            <th>Name</th>
                                            <th>Phone</th>
                                            <th>Score</th>
                                            <th>Submission Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data && data.length > 0 ? data.map((entry, index) => (
                                            <tr key={entry.rollNumber}>
                                                <td>
                                                    <span className={`rank rank-${index + 1 <= 3 ? index + 1 : 'other'}`}>
                                                        {index + 1}
                                                        {index === 0 && ' 🥇'}
                                                        {index === 1 && ' 🥈'}
                                                        {index === 2 && ' 🥉'}
                                                    </span>
                                                </td>
                                                <td><span className="roll-number">{entry.rollNumber || 'N/A'}</span></td>
                                                <td>{entry.name || 'N/A'}</td>
                                                <td><span className="phone-number">{entry.phone || 'N/A'}</span></td>
                                                <td>
                                                    <span className={`score ${game === 'jumbledWords' ? 'jumbled-score' : 'bubble-score'}`}>
                                                        {entry.score !== undefined && entry.score !== null ? entry.score : 0}
                                                    </span>
                                                </td>
                                                <td className="date-cell">{formatDate(entry.submittedAt)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                                    No players have scores for this game yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
