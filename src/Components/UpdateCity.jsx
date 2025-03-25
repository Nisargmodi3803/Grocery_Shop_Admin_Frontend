import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export const UpdateCity = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [status, setStatus] = useState(1);
    const { cityId } = useParams();

    const fetchCity = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/city/${cityId}`);
            if (response.status === 200) {
                setName(response.data.cityName);
                setStatus(response.data.cityIsActive);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No City Found");
            } else {
                console.error(error);
                alert('Something went wrong while fetching the City.');
            }
        }
    }

    useEffect(() => {
        fetchCity();
    }, [cityId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(name, status)
            const response = await axios.patch(
                `http://localhost:9000/update-city/${cityId}`, {
                city: name,
                status: status
            })
            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'City has been Updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/city');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while updating the City.');
        }
    };
    
    return (
        <div className='update-brand'>
            <Sidebar activeId={6} />
            <div className="update-brand-container">
                <h2>+ Update City</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='City Name'
                                required
                            />
                        </div>
                        <div className='form-group' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ marginRight: '10px' }}>Status <span className="required">*</span></label>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="1"
                                        checked={status === "1" || status === 1}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    Active
                                </label>
                            </div>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="2"
                                        checked={status === "2" || status === 2}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    Inactive
                                </label>
                            </div>
                        </div>

                        <div className="button-group">
                            <button type="submit" className="update-btn">Update</button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
