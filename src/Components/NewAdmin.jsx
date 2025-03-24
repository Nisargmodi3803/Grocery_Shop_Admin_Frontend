import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export const NewAdmin = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUserNameExist, setIsUserNameExist] = useState(undefined);
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (password) => {
        if (password.length < 4) {
            return "Password is too short (min 4 characters)";
        } else if (password.length > 15) {
            return "Password is too long (max 15 characters)";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errorMsg = validatePassword(password);
        if (errorMsg) {
            setPasswordError(errorMsg);
            return;
        } else if (password !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        } else {
            setPasswordError('');
        }

        try {
            const response = await axios.post(`http://localhost:9000/admin/register`, {
                userName: userName.trim(),
                password: password
            });

            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Registered!',
                    text: 'Admin has been registered successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Clear form fields
                setUserName('');
                setPassword('');
                setConfirmPassword('');
                setIsUserNameExist(undefined);
                setPasswordError('');
            }
        } catch (error) {
            if (error.response?.status === 409) {
                alert('Username already exists!');
            } else {
                console.error(error);
                alert('Something went wrong while registering the admin.');
            }
        }
    };

    const handleUserNameChange = async (e) => {
        const value = e.target.value;
        setUserName(value);

        if (value.trim() !== '') {
            try {
                const response = await axios.get(`http://localhost:9000/admin/check-username?username=${value.trim()}`);
                setIsUserNameExist(response.data === true);
            } catch (error) {
                console.error(error);
            }
        } else {
            setIsUserNameExist(undefined);
        }
    };

    const disableSubmit = useMemo(() => {
        return (
            isUserNameExist === true ||
            !!passwordError ||
            password.trim() === '' ||
            confirmPassword.trim() === '' ||
            userName.trim() === '' ||
            password !== confirmPassword
        );
    }, [isUserNameExist, passwordError, password, confirmPassword, userName]);

    return (
        <div className='update-brand'>
            <Sidebar activeId={18} />
            <div className="update-brand-container">
                <h2>+ New Admin</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-group">
                            <label>Username <span className="required">*</span></label>
                            <input
                                type="text"
                                value={userName}
                                onChange={handleUserNameChange}
                                placeholder='Username'
                                required
                            />
                        </div>
                        {isUserNameExist && <p className="error">Username already exists!</p>}

                        <div className="form-group">
                            <label>Password <span className="required">*</span></label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Password (4 to 15 characters)'
                                required
                            />
                        </div>
                        {passwordError && <p className="error">{passwordError}</p>}

                        <div className="form-group">
                            <label>Confirm Password <span className="required">*</span></label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder='Confirm Password'
                                required
                            />
                        </div>
                        {confirmPassword && confirmPassword !== password && (
                            <p className="error">Passwords do not match</p>
                        )}

                        <div className="button-group">
                            <button
                                type="submit"
                                className="update-btn"
                                disabled={disableSubmit}
                            >
                                Register
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
