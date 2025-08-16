import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://kritikhel-production.up.railway.app/api';

const AdminLogin = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate that all fields are filled
        if (!credentials.username.trim() || !credentials.password.trim()) {
            setError('Username and password are required');
            setLoading(false);
            return;
        }

        // Validate credentials with the backend
        try {
            const response = await axios.post(`${API_URL}/admin/login`, {
                username: credentials.username,
                password: credentials.password
            });
            
            // Store the JWT token
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminUsername', credentials.username);
            onLoginSuccess();
        } catch (error) {
            if (error.response?.status === 401) {
                setError('Invalid username or password');
            } else {
                setError('Server error. Please try again.');
            }
        }
        
        setLoading(false);
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-form">
                <h2>Admin Access</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={credentials.username}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        required
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
