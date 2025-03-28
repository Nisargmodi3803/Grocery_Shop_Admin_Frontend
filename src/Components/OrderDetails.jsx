import './OrderDetails.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState, useRef } from "react";
import Sidebar from './Sidebar'
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaEye } from "react-icons/fa6";
import { RiDeleteBin5Line } from "react-icons/ri";

export const OrderDetails = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState({});
    const [OrderDetails, setOrderDetails] = useState([]);
    const { invoiceNum } = useParams();
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
    const [DeliveryBoys, setDeliveryBoys] = useState([]);
    const [deliveryBoyId, setDeliveryBoyId] = useState(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [status, setStatus] = useState({
        1: "Pending",
        2: "Confirm",
        3: "Dispatched",
        4: "Delivered",
        5: "Rejected",
        6: "Canceled"
    });
    const [statusNum, setStatusNum] = useState(0);
    const [openDropdown, setOpenDropdown] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef(null);
    const [deliveryDate, setDeliveryDate] = useState(Date.now());
    const [totalPayable, setTotalPayable] = useState(0);

    const toggleDropdown = (dropdownType) => {
        setSearchTerm('');
        setOpenDropdown(openDropdown === dropdownType ? '' : dropdownType);
        setTimeout(() => searchInputRef.current?.focus(), 100);
    };

    useEffect(() => {
        if (showDropdown && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showDropdown]);

    const handleSelect = (boy) => {
        setSelectedDeliveryBoy(boy);
        setShowDropdown(false);
        setDeliveryBoyId(boy.deliveryBoyId)
        setSearchTerm('');
    };

    const handleSelectStatus = (num) => {
        setSelectedStatus(status);
        setShowStatusDropdown(false);
        setStatusNum(num);
        setSearchTerm('');
    };

    const filteredDeliveryBoy = DeliveryBoys.filter((cat) =>
        cat.deliveryBoyName.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const filterStatus = (searchTerm) => {
        return Object.entries(status)
            .filter(([key, value]) => value.toLowerCase().includes(searchTerm.toLowerCase()))
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});
    };

    useEffect(() => {
        if (deliveryBoyId && DeliveryBoys.length > 0) {
            const defaultDeliveryBoy = DeliveryBoys.find(cat => cat.deliveryBoyId === deliveryBoyId);
            setSelectedDeliveryBoy(defaultDeliveryBoy);
        }
    }, [deliveryBoyId, deliveryBoyId]);

    useEffect(() => {
        if (statusNum && status[statusNum]) {
            setSelectedStatus(status[statusNum]);
        }
    }, [statusNum, status]);


    const fetchDeliveryBoys = async () => {
        try {
            const response = await axios.get('http://localhost:9000/delivery-boys');
            if (response.status === 200) {
                setDeliveryBoys(response.data);

                if (deliveryBoyId) {
                    const defaultDeliveryBoy = DeliveryBoys.find(cat => cat.deliveryBoyId === deliveryBoyId);
                    setSelectedDeliveryBoy(defaultDeliveryBoy);
                }
            }
        } catch (error) {
            if (error.response.status === 404) {
                console.log("No Delivery Boys Found");
            } else {
                console.error("Error fetching Delivery Boys:", error);
                alert("Something went wrong. Please try again!");
            }
        }
    };

    useEffect(() => {
        fetchDeliveryBoys();
    }, [deliveryBoyId]);

    const fetchOrder = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/order/${invoiceNum}`);
            if (response.status === 200) {
                setOrder(response.data);
                setStatusNum(response.data.invoiceStatus)
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Order Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again!");
            }
        }
    }

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/product-order/${order.invoiceId}`);
            if (response.status === 200) {
                setOrderDetails(response.data);
                setTotalPayable(response.data[0].totalPayable);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Order Details Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again!");
            }
        }
    }

    useEffect(() => {
        if (order.invoiceId) {
            fetchOrderDetails();
        }
    }, [order]);

    const handleAssignDeliveryBoy = async () => {
        if (deliveryBoyId === undefined) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please select Delivery Boy',
                showConfirmButton: true,
                confirmButtonText: 'OK'
            })
            return;
        }

        try {
            const response = await axios.patch(`http://localhost:9000/admin/assign-boy?deliveryBoyId=${deliveryBoyId}&invoiceNum=${order.invoiceNum}`);

            if (response.status === 200) {
                fetchOrder();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Delivery Boy has been assigned successfully',
                    showConfirmButton: true,
                    confirmButtonText: 'OK'
                })
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Delivery Boy Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again!");
            }
        }
    };

    const handleDeliveryDateChange = (date) => {
        if (deliveryDate > date)
            return;

        setDeliveryDate(date);
    }

    const formatDateForDB = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleStatusChange = async () => {
        try {
            const response = await axios.patch(`http://localhost:9000/change-status?invoiceNum=${order.invoiceNum}&status=${statusNum}&date=${formatDateForDB(deliveryDate)}`);

            if (response.status === 200) {
                fetchOrder();
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Status has been updated successfully',
                    showConfirmButton: true,
                    confirmButtonText: 'OK'
                })
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Order Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again!");
            }
        }
    }

    const calculateTotalMRP = () => {
        return OrderDetails.reduce((total, item) => total + item.mrp, 0);
    }

    const calculateTotalDiscount = () => {
        const payable = OrderDetails.reduce((total, item) => total + item.totalAmount, 0);
        return calculateTotalMRP() - payable;
    }

    return (
        <div className='orders'>
            <Sidebar activeId={1} />
            <div className="update-brand-container">
                <h2>INVOICE</h2>
                <div className="form-section">
                    <div className="invoice-data">
                        <div className="invoice-basics-details">
                            <div className="form-group1">
                                <label>Invoice No.: </label>
                                <span>{order.invoicePrefix}{order.invoiceNum}</span>
                            </div>
                            <div className="form-group1">
                                <label>Name: </label>
                                <span>{order.invoiceName}</span>
                            </div>
                            <div className="form-group1">
                                <label>Mobile: </label>
                                <span>{order.invoiceMobile}</span>
                            </div>
                            <div className="form-group1">
                                <label>Email: </label>
                                <span>{order.invoiceEmailId}</span>
                            </div>
                            <div className="form-group1">
                                <label>Date: </label>
                                <span>{order.invoiceDate}</span>
                            </div>
                            <div className="form-group1">
                                <label>Time: </label>
                                <span>{order.invoiceTime}</span>
                            </div>
                        </div>
                        <div className="invoice-delivery-boy">
                            <div className="form-group1">
                                <label>City: </label>
                                <span>{order.city?.cityName || "N/A"}</span>
                            </div>
                            <div className="form-group1">
                                <label>Pincode: </label>
                                <span>{order.invoicePincode}</span>
                            </div>
                            <div className="form-group1">
                                <label>Address: </label>
                                <span style={{ maxWidth: '300px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                    {order.invoiceAddress}
                                </span>

                            </div>
                            <div className="form-group1">
                                <label>Delivery Time : </label>
                                <span>{order.deliveryTimeSlot?.deliveryTime || "N/A"}</span>
                            </div>
                            {
                                order.deliveryBoy ? (
                                    <div className="form-group1">
                                        <label>Delivery Boy: </label>
                                        <span>{order.deliveryBoy.deliveryBoyName}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className='form-group1'>
                                            <div className='filter1'>
                                                <div className="custom-dropdown1" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                                                    <label style={{ paddingTop: '10px' }}>Delivery Boy: </label>
                                                    <div
                                                        className="dropdown-header1"
                                                        onClick={() => toggleDropdown('deliveryBoy')}
                                                    >
                                                        <span>{selectedDeliveryBoy ? selectedDeliveryBoy.deliveryBoyName : 'Select Delivery Boy'}</span>
                                                        <span className="arrow">{openDropdown === 'deliveryBoy' ? '▲' : '▼'}</span>
                                                    </div>
                                                    {openDropdown === 'deliveryBoy' && (
                                                        <div className="dropdown-list1">
                                                            <input
                                                                type="text"
                                                                placeholder="Search..."
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                className="dropdown-search1"
                                                                ref={searchInputRef}
                                                            />
                                                            <div className="dropdown-items-container1">
                                                                {filteredDeliveryBoy
                                                                    .filter((cat) =>
                                                                        cat.deliveryBoyName.toLowerCase().includes(searchTerm.toLowerCase())
                                                                    )
                                                                    .map((cat) => (
                                                                        <div
                                                                            key={cat.deliveryBoyId}
                                                                            className={`dropdown-item1 ${deliveryBoyId === cat.deliveryBoyId ? 'selected' : ''}`}
                                                                            onClick={() => {
                                                                                handleSelect(cat);
                                                                                setOpenDropdown('');
                                                                            }}
                                                                        >
                                                                            {cat.deliveryBoyName}
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className='form-group1'>
                                            <button className="update-btn" onClick={handleAssignDeliveryBoy}>Assign Delivery Boy</button>
                                        </div>
                                    </>
                                )
                            }

                        </div>
                    </div>
                    <div className='invoice-status'>
                        <div className="form-group1">
                            <div className="filter1">
                                <div className="custom-dropdown1" style={{ display: 'flex', width: '100%', gap: '10px' }}>
                                    <label className="custom-label">Order Status:</label>

                                    <div className="dropdown-header1"
                                        style={{ width: "150px" }}
                                        onClick={() => toggleDropdown('status')}>
                                        <span>{statusNum && status[statusNum] ? status[statusNum] : 'Select Status'}</span>
                                        <span className="arrow">{openDropdown === 'status' ? '▲' : '▼'}</span>
                                    </div>

                                    {openDropdown === 'status' && (
                                        <div className="dropdown-list1"
                                            style={{ width: "175px", marginLeft: "112px" }}>
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="dropdown-search1"
                                                ref={searchInputRef}
                                            />

                                            <div className="dropdown-items-container1">
                                                {Object.entries(status)
                                                    .filter(([key, value]) => value.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className={`dropdown-item1 ${statusNum == key ? 'selected' : ''}`}
                                                            onClick={() => {
                                                                setStatusNum(parseInt(key)); // Update status number
                                                                setOpenDropdown('');
                                                            }}
                                                        >
                                                            {value}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='form-group1'>
                            <label className="custom-label">Delivery Date: </label>
                            <div className="date-range-container">
                                <div className="date-picker-wrapper">
                                    <DatePicker
                                        selected={deliveryDate}
                                        onChange={(date) => handleDeliveryDateChange(date)}
                                        selectsStart
                                        dateFormat="dd-MM-yyyy"
                                        className="date-input"
                                        placeholderText="Start Date"
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '-15px' }} className='form-group1'>
                            <button className="update-btn" onClick={handleStatusChange}>Change</button>
                        </div>
                    </div>
                </div>

                <h2>INVOICE DETAILS</h2>
                <table className="order-table">
                    <thead>
                        <tr>
                            <th style={{backgroundColor:"#DBEAFE"}}>Order No.</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>Product Name</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>Varient</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>Base Price</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>CGST</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>SGST</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>MRP</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>Offer Price</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>Quantity</th>
                            <th style={{backgroundColor:"#DBEAFE"}}>Payable Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {OrderDetails.length > 0 ? (
                            OrderDetails.map((detail) => (
                                <tr key={detail.detailId}>
                                    <td>{detail.invoice.invoicePrefix}{detail.invoice.invoiceNum}</td>
                                    <td>{detail.productName}</td>
                                    <td>{detail.productVariantName}</td>
                                    <td>{detail.basePrice ? parseFloat(detail.basePrice).toFixed(2) : "0.00"}</td>
                                    <td>{detail.product.cgst ? parseFloat(detail.product.cgst).toFixed(2) : "0.00"}</td>
                                    <td>{detail.product.sgst ? parseFloat(detail.product.sgst).toFixed(2) : "0.00"}</td>
                                    <td>{detail.mrp ? parseFloat(detail.mrp).toFixed(2) : "0.00"}</td>
                                    <td>{detail.totalAmount ? parseFloat(detail.totalAmount).toFixed(2) : "0.00"}</td>
                                    <td>{detail.quantity}</td>
                                    <td>{parseFloat(detail.totalAmount*detail.quantity).toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="15" style={{ textAlign: 'center' }}>No data available in table</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="invoice-summary">
                    <div className='form-group1'>
                        <label>MRP Total: </label>
                        <span>{parseFloat(calculateTotalMRP()).toFixed(2)}</span>
                    </div>
                    <div className='form-group1'>
                        <label>Discount: </label>
                        <span>{parseFloat(calculateTotalDiscount()).toFixed(2)}</span>
                    </div>
                    <div className='form-group1'>
                        <label>Discount: </label>
                        <span>{parseFloat(totalPayable).toFixed(2)}</span>
                    </div>
                    <div className='form-group1'>
                        <label>Coupon Discount: </label>
                        <span>{order.invoiceCouponCodeDiscount? parseFloat(order.invoiceCouponCodeDiscount).toFixed(2) : "0.00"}</span>
                    </div>
                    <div className='form-group1'>
                        <label>Delivery Charge: </label>
                        <span>{order.invoiceDeliveryCharges? parseFloat(order.invoiceDeliveryCharges).toFixed(2) : "0.00"}</span>
                    </div>
                    <div className='form-group1'>
                        <label>Total: </label>
                        <span>{parseFloat(totalPayable).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
