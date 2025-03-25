import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { parseISO, format, isValid, set, min } from 'date-fns';


export const UpdateCouponCode = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [type, setType] = useState(0);
    const [code, setCode] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [value, setValue] = useState();
    const [MinBillAmount, setMinBillAmount] = useState();
    const [maxDiscount, setMaxDiscount] = useState();
    const [couponFor, setCouponFor] = useState(1);
    const [status, setStatus] = useState(1);
    const [isCodeExist, setIsCodeExist] = useState(false);
    const { couponId } = useParams();

    const fetchCouponCode = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/admin/coupon/${couponId}`);
            if (response.status === 200) {
                const data = response.data;
                setTitle(data.couponTitle);
                setType(data.couponType);
                setCode(data.couponCode);
                setStartDate(data.couponStartDate);
                setEndDate(data.couponEndDate);
                setValue(data.couponValue);
                setMinBillAmount(data.couponMinimumBillAmount);
                setMaxDiscount(data.couponMaxDiscount);
                setCouponFor(data.couponCodeFor);
                setStatus(data.couponStatus);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while fetching the Coupon Code.');
        }
    };

    useEffect(() => {
        fetchCouponCode();
    }, [couponId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.patch(
                `http://localhost:9000/update-coupon-code/${couponId}`, {
                code: code,
                title: title,
                startDate: startDate,
                endDate: endDate,
                type: type,
                codeFor: couponFor,
                value: value,
                minValue: MinBillAmount,
                maxDiscount: maxDiscount,
                status: status
            });

            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Coupon Code has been Updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/coupon');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while Updating the Coupon Code.');
        }
    };


    const handleCode = async (e) => {
        setCode(e.target.value);

        try {
            const response = await axios.get(`http://localhost:9000/check-coupon-code?code=${e.target.value}`)

            if (response.status == 200) {
                if (response.data == true) {
                    setIsCodeExist(response.data);
                } else {
                    setIsCodeExist(response.data);
                }
            }
        } catch (error) {
            console.log(error);
        }

    }
    return (
        <div className='update-brand'>
            <Sidebar activeId={8} />
            <div className="update-brand-container">
                <h2>+ Update Coupon Code</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Title <span className="required">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder='Coupon Title'
                                required
                            />
                        </div>

                        <div className='form-group' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ marginRight: '10px' }}>Type <span className="required">*</span></label>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="1"
                                        checked={type === "1" || type === 1}
                                        onChange={(e) => setType(e.target.value)}
                                    />
                                    Fixed Amount
                                </label>
                            </div>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="2"
                                        checked={type === "2" || type === 2}
                                        onChange={(e) => setType(e.target.value)}
                                    />
                                    Percentage(%)
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Code <span className="required">*</span></label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => handleCode(e)}
                                placeholder='Coupon Title'
                                required
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            />
                        </div>
                        {isCodeExist == true && <p className="error">Code already exist!</p>}

                        <div className="form-group">
                            <label>Coupon Value <span className="required">*</span></label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder='Coupon Value'
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <label>Start Date <span className="required">*</span></label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder='Start Date (DD-MM-YYYY) [Select Date Range]'
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <label>End Date <span className="required">*</span></label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder='End Date (DD-MM-YYYY) [Select Date Range]'
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Minimum Bill Amount <span className="required">*</span></label>
                            <input
                                type="number"
                                value={MinBillAmount}
                                onChange={(e) => setMinBillAmount(e.target.value)}
                                placeholder='Minimum Bill Amount'
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Maximum Discount <span className="required">*</span></label>
                            <input
                                type="number"
                                value={maxDiscount}
                                onChange={(e) => setMaxDiscount(e.target.value)}
                                placeholder='Maximum Discount'
                                required
                            />
                        </div>

                        <div className='form-group' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ marginRight: '10px' }}>Coupon Type <span className="required">*</span></label>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="couponFor"
                                        value="1"
                                        checked={couponFor === "1" || couponFor === 1}
                                        onChange={(e) => setCouponFor(e.target.value)}
                                    />
                                    Secret Code
                                </label>
                            </div>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="couponFor"
                                        value="2"
                                        checked={couponFor === "2" || couponFor === 2}
                                        onChange={(e) => setCouponFor(e.target.value)}
                                    />
                                    General Coupon
                                </label>
                            </div>
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
                            <button type="submit" className="update-btn" disabled={isCodeExist}>Update</button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
