import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export const UpdateDeliveryRoute = () => {
    const navigate = useNavigate();
    const { deliveryBoyId } = useParams();

    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [route, setRoute] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // success or error

    const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const fetchDeliveryBoy = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/delivery-boy/${deliveryBoyId}`);
            if (response.status === 200) {
                const data = response.data;
                setName(data.deliveryBoyName);
                setMobile(data.deliveryBoyMobileNo);
                setEmail(data.deliveryBoyEmail);
                setVehicleNo(data.deliveryVehicleNo);
                setRoute(data.deliveryRoute);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while fetching the delivery boy.');
        }
    };

    useEffect(() => {
        fetchDeliveryBoy();
    }, [deliveryBoyId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
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

        try {
            const response = await axios.patch(
                `http://localhost:9000/update-delivery-boy/${deliveryBoyId}`,
                {
                    name,
                    mobile,
                    email,
                    vehicleNo,
                    route
                }
            );
            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Delivery Boy has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/delivery-boy');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while updating the delivery boy.');
        }
    };

    const disableSubmit =
        !name ||
        !mobile ||
        !email ||
        !vehicleNo ||
        !route ;

    return (
        <div className='update-brand'>
            <Sidebar activeId={13} />
            <div className="update-brand-container">
                <h2>Update Delivery Boy</h2>
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
                        <div className="button-group">
                            <button type="submit" className="update-btn" disabled={disableSubmit}>Update</button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
