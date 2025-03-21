import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';


export const UpdateTimeSlot = () => {
    const navigate = useNavigate();
    const [slot, setSlot] = useState('');
    const [priority, setPriority] = useState();
    const { slotId } = useParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(
                `http://localhost:9000/update-slot/${slotId}?slot=${slot}&priority=${priority}`
            );
            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Delivery Time Slot has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/time-slot');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while updating the Slot.');
        }
    };

    const fetchSlot = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/time-slot/${slotId}`);
            if (response.status === 200) {
                setSlot(response.data.deliveryTime);
                setPriority(response.data.deliveryTimePrioriy);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Slot Found");
            } else {
                console.error(error);
                alert('Something went wrong while fetching the Time Slot.');
            }
        }
    }

    useEffect(() => {
        fetchSlot();
    }, [slotId]);


    return (
        <div className='update-brand'>
            <Sidebar activeId={14} />
            <div className="update-brand-container">
                <h2>+ Update Delivery Time Slot</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Time Slot <span className="required">*</span></label>
                            <input
                                type="text"
                                value={slot}
                                onChange={(e) => setSlot(e.target.value)}
                                placeholder='Eg. (11:00 AM to 12:00 PM)'
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority <span className="required">*</span></label>
                            <input
                                type="number"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                required
                                placeholder='Time Slot Priority'
                            />
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
