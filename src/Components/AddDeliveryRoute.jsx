import React, { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export const AddDeliveryRoute = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [route, setRoute] = useState('');
    const [password, setPassword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // success or error

    const validateMobile = (mobile) => {
        const mobileRegex = /^[0-9]{10}$/;
        return mobileRegex.test(mobile);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        if (password.length < 4) {
            return "Password too short (min 4 characters)";
        } else if (password.length > 15) {
            return "Password too long (max 15 characters)";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordError = validatePassword(password);
        if (!validateMobile(mobile)) {
            setResponseMessage("Invalid Mobile Number");
            setMessageType("error");
            return;
        }
        if (!validateEmail(email)) {
            setResponseMessage("Invalid Email Address");
            setMessageType("error");
            return;
        }
        if (passwordError) {
            setResponseMessage(passwordError);
            setMessageType("error");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:9000/add-delivery-boy`, {
                name,
                mobile,
                email,
                vehicleNo,
                route,
                password
            });

            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Added!',
                    text: 'Delivery Boy has been added successfully.',
                    timer: 2000, showConfirmButton: false
                });
                navigate('/admin/delivery-boy');
            }
        } catch (error) {
            console.error(error);
            setResponseMessage("Something went wrong while adding the Delivery Boy.");
            setMessageType("error");
        }
    };

    const disableSubmit = useMemo(() => {
        return (
            name.trim() === '' ||
            mobile.trim() === '' ||
            email.trim() === '' ||
            vehicleNo.trim() === '' ||
            route.trim() === '' ||
            password.trim() === '' ||
            !validateMobile(mobile) ||
            !validateEmail(email) ||
            !!validatePassword(password)
        );
    }, [name, mobile, email, vehicleNo, route, password]);

    return (
        <div className='update-brand'>
            <Sidebar activeId={13} />
            <div className="update-brand-container">
                <h2>+ Add Delivery Boy</h2>
                {responseMessage && (
                    <p className={`response-message ${messageType}`}>{responseMessage}</p>
                )}
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Delivery Boy Name'
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mobile No.<span className="required">*</span></label>
                            <input
                                type="text"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder='10-digit Mobile No.'
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Id.<span className="required">*</span></label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='Email ID'
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Vehicle No.<span className="required">*</span></label>
                            <input
                                type="text"
                                value={vehicleNo}
                                onChange={(e) => setVehicleNo(e.target.value)}
                                placeholder='Vehicle No.'
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Delivery Route<span className="required">*</span></label>
                            <input
                                type="text"
                                value={route}
                                onChange={(e) => setRoute(e.target.value)}
                                placeholder='Delivery Route'
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password<span className="required">*</span></label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Password (4-15 characters)'
                                required
                            />
                        </div>
                        <div className="button-group">
                            <button type="submit" className="update-btn" disabled={disableSubmit}>Add</button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
