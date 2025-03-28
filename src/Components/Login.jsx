import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        console.log("Form submitted!");

        try {
            const response = await axios.post(`http://localhost:9000/admin/login`, {
                userName: username.trim(),
                password: password
            });

            if (response.status === 200) {
                console.log(response.data);
                sessionStorage.setItem('isAuthenticated', "true");
                sessionStorage.setItem('username', username);
                navigate('/admin');
            } else if (response.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Invalid username or password',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            if (error.response.status === 404) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Invalid username or password',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else if (error.response.status === 400) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Invalid username or password',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                console.error(error);
                alert('Something went wrong while logging in.');
            }
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Admin Login</h2>
            <form onSubmit={handleLogin} className="login-box">
                <input
                    type="text"
                    placeholder="Username"
                    className="login-input"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="login-input"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="login-button">LOGIN</button>
            </form>
            <p className="footer-text">
                Manage by | <span className="footer-highlight">Bits Infotech</span>
            </p>
        </div>
    );
}
