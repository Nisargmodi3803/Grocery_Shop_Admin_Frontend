import './Dashboard.css';
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { IoLayers } from "react-icons/io5";

export const Dashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [confirmedOrders, setConfirmedOrders] = useState(0);
  const [dispatchedOrders, setDispatchedOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [rejectedOrders, setRejectedOrders] = useState(0);
  const [canceledOrders, setCanceledOrders] = useState(0);
  const [todayPendingOrders, setTodayPendingOrders] = useState([]);
  const [todayConfirmedOrders, setTodayConfirmedOrders] = useState([]);
  const [todayDeliveredOrders, setTodayDeliveredOrders] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [todayDate, setTodayDate] = useState(new Date());

  const formatDateForDB = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchTodayPendingOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/admin/today-pending?date=${formatDateForDB(todayDate)}`);
      if (response.status === 200) {
        setTodayPendingOrders(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Pending Orders Found");
        setTodayPendingOrders([]);
      } else {

        console.error('Error fetching today pending orders:', error);
      }
    }
  }

  const fetchTodayConfirmedOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/admin/today-confirm?date=${formatDateForDB(todayDate)}`);
      if (response.status === 200) {
        setTodayConfirmedOrders(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Pending Orders Found");
        setTodayConfirmedOrders([]);
      } else {

        console.error('Error fetching today pending orders:', error);
      }
    }
  }

  const fetchTodayDeliveredOrders = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/admin/today-delivered?date=${formatDateForDB(todayDate)}`);
      if (response.status === 200) {
        setTodayDeliveredOrders(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Pending Orders Found");
        setTodayDeliveredOrders([]);
      } else {
        console.error('Error fetching today pending orders:', error);
      }

    }
  }


  // Fetch order counts from backend
  const fetchOrderCounts = async () => {
    try {
      const [
        totalRes,
        pendingRes,
        confirmedRes,
        dispatchedRes,
        deliveredRes,
        rejectedRes,
        canceledRes,
        productRes,
        customerRes
      ] = await Promise.all([
        axios.get('http://localhost:9000/admin/count-invoice'),
        axios.get('http://localhost:9000/admin/count-pending-invoice'),
        axios.get('http://localhost:9000/admin/count-confirm-invoice'),
        axios.get('http://localhost:9000/admin/count-dispatched-invoice'),
        axios.get('http://localhost:9000/admin/count-delivered-invoice'),
        axios.get('http://localhost:9000/admin/count-rejected-invoice'),
        axios.get('http://localhost:9000/admin/count-canceled-invoice'),
        axios.get('http://localhost:9000/admin/product-count'),
        axios.get('http://localhost:9000/admin/customer-count')
      ]);

      animateCount(setTotalOrders, totalRes.data);
      animateCount(setPendingOrders, pendingRes.data);
      animateCount(setConfirmedOrders, confirmedRes.data);
      animateCount(setDispatchedOrders, dispatchedRes.data);
      animateCount(setDeliveredOrders, deliveredRes.data);
      animateCount(setRejectedOrders, rejectedRes.data);
      animateCount(setCanceledOrders, canceledRes.data);
      animateCount(setTotalProducts, productRes.data);
      animateCount(setTotalCustomers, customerRes.data);

    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Function to animate count from 0 to target value
  const animateCount = (setter, targetValue) => {
    let count = 0;
    const duration = 1000; // Animation duration in milliseconds
    const stepTime = Math.max(Math.floor(duration / targetValue), 20);

    const timer = setInterval(() => {
      count += 1;
      setter(count);
      if (count >= targetValue) {
        clearInterval(timer);
        setter(targetValue);
      }
    }, stepTime);
  };

  useEffect(() => {
    fetchOrderCounts();
    fetchTodayPendingOrders();
    fetchTodayConfirmedOrders();
    fetchTodayDeliveredOrders();
  }, []);

  const cards = [
    { count: totalOrders, label: "Orders", color: "blue", icon: "fas fa-shopping-cart" },
    { count: pendingOrders, label: "Pending Orders", color: "red", icon: "fas fa-hourglass-half" },
    { count: confirmedOrders, label: "Confirm Order", color: "cyan", icon: "fas fa-clipboard-check" },
    { count: dispatchedOrders, label: "Dispatch Orders", color: "purple", icon: "fas fa-truck-moving" },
    { count: deliveredOrders, label: "Delivered Orders", color: "dark-purple", icon: "fas fa-box-open" },
    { count: rejectedOrders, label: "Rejected Orders", color: "dark-red", icon: "fa fa-exclamation-triangle" },
    { count: canceledOrders, label: "Canceled Orders", color: "gray", icon: "fas fa-times-circle" },
    { count: totalProducts, label: "Products", color: "green", icon: "fas fa-boxes" },
    { count: totalCustomers, label: "Customers", color: "orange", icon: "fas fa-users" },
  ];

  return (
    <div className='product'>
      <Sidebar activeId={19} />
      <div className='update-brand-container'>
        <h2>DASHBOARD</h2>
        <div className="dashboard-container">
          {cards.map((card, index) => (
            <div key={index} className={`card ${card.color}`}>
              <i className={card.icon}></i>
              <h3>{card.count}</h3>
              <p>{card.label}</p>
            </div>
          ))}
        </div>
        <div className='brand-content'>
          <div className='brand-header'>
            <h2><IoLayers /> TODAY'S PENDING ORDERS</h2>
          </div>
          <table className="order-table">
            <thead>
              <tr>
                <th style={{ backgroundColor: "#DBEAFE" }}>Order No.</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Customer Name</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Mobile</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Email</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Invoice Amount</th>
              </tr>
            </thead>
            <tbody>
              {todayPendingOrders.length > 0 ? (
                todayPendingOrders.map((order) => (
                  <tr key={order.detailId}>
                    <td>{order.invoicePrefix}{order.invoiceNum}</td>
                    <td>{order.invoiceName}</td>
                    <td>{order.invoiceMobile}</td>
                    <td>{order.invoiceEmailId}</td>
                    <td>{order.invoiceTotalAmount ? parseFloat(order.invoiceTotalAmount).toFixed(2) : "0.00"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" style={{ textAlign: 'center' }}>No data available in table</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='brand-content'>
          <div className='brand-header'>
            <h2><IoLayers /> TODAY'S CONFIRMED ORDERS</h2>
          </div>
          <table className="order-table">
            <thead>
              <tr>
                <th style={{ backgroundColor: "#DBEAFE" }}>Order No.</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Customer Name</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Mobile</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Email</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Invoice Amount</th>
              </tr>
            </thead>
            <tbody>
              {todayConfirmedOrders.length > 0 ? (
                todayConfirmedOrders.map((order) => (
                  <tr key={order.detailId}>
                    <td>{order.invoicePrefix}{order.invoiceNum}</td>
                    <td>{order.invoiceName}</td>
                    <td>{order.invoiceMobile}</td>
                    <td>{order.invoiceEmailId}</td>
                    <td>{order.invoiceTotalAmount ? parseFloat(order.invoiceTotalAmount).toFixed(2) : "0.00"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" style={{ textAlign: 'center' }}>No data available in table</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className='brand-content'>
          <div className='brand-header'>
            <h2><IoLayers /> TODAY'S DELIVERED ORDERS</h2>
          </div>
          <table className="order-table">
            <thead>
              <tr>
                <th style={{ backgroundColor: "#DBEAFE" }}>Order No.</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Customer Name</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Mobile</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Email</th>
                <th style={{ backgroundColor: "#DBEAFE" }}>Invoice Amount</th>
              </tr>
            </thead>
            <tbody>
              {todayDeliveredOrders.length > 0 ? (
                todayDeliveredOrders.map((order) => (
                  <tr key={order.detailId}>
                    <td>{order.invoicePrefix}{order.invoiceNum}</td>
                    <td>{order.invoiceName}</td>
                    <td>{order.invoiceMobile}</td>
                    <td>{order.invoiceEmailId}</td>
                    <td>{order.invoiceTotalAmount ? parseFloat(order.invoiceTotalAmount).toFixed(2) : "0.00"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" style={{ textAlign: 'center' }}>No data available in table</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
