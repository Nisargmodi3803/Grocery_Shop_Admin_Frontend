import './Orders.css'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, { useEffect, useState } from "react";
import Sidebar from './Sidebar'
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaEye } from "react-icons/fa6";
import { RiDeleteBin5Line } from "react-icons/ri";

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
  const [showResult, setShowResult] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const normalizeText = (text) => text?.toString().toLowerCase() || "";

  // Filter orders based on user input
  const filteredOrders = orders.filter((order) => {
    const query = normalizeText(searchQuery);
    // console.log("Query:", query);
    return (
      normalizeText(order.invoiceNum).includes(query) || // Order No.
      normalizeText(order.invoiceDate).includes(query) || // Order Date
      normalizeText(order.invoiceDeliveryDate).includes(query) || // Delivery Date
      normalizeText(order.invoiceName).includes(query) || // Customer Name
      normalizeText(order.invoiceMobile).includes(query) || // Mobile
      normalizeText(order.invoiceTotalAmount).includes(query) || // Total Amount
      normalizeText(order.invoicePayable).includes(query) || // Payable Amount
      normalizeText(order.invoiceReceivedAmount).includes(query) || // Received Amount
      normalizeText(order.invoiceRemainingAmount).includes(query) || // Remaining Amount
      normalizeText(order.deliveryBoy?.deliveryBoyName).includes(query) || // Delivery Boy Name
      (query === "cash" && order.invoicePaymentMode === 1) || // Payment Mode: Cash
      (query === "online" && order.invoicePaymentMode !== 1) || // Payment Mode: Online
      (query === "pending" && order.invoiceStatus === 1) || // Order Status: Pending
      (query === "confirmed" && order.invoiceStatus === 2) || // Order Status: Confirmed
      (query === "dispatched" && order.invoiceStatus === 3) || // Order Status: Dispatched
      (query === "delivered" && order.invoiceStatus === 4) || // Order Status: Delivered
      (query === "rejected" && order.invoiceStatus === 5) || // Order Status: Rejected
      (query === "cancelled" && order.invoiceStatus === 6) // Order Status: Cancelled
    );
  });

  const getDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  const formatDateForDB = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [startDate, setStartDate] = useState(getDaysAgo(2));
  const [endDate, setEndDate] = useState(Date.now());


  const handleSearch = async () => {
    if (startDate && endDate) {
      try {
        const response = await axios.get(`http://localhost:9000/invoices-between-dates?startDate=${formatDateForDB(startDate)}&endDate=${formatDateForDB(endDate)}`);
        if (response.status === 200) {
          setOrders(response.data);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.log("No Orders Found");
          setOrders([]);
        } else {
          console.error(error);
          alert("Something went wrong. Please try again!");
        }
      }

    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select Start Date and End Date to search Orders',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      })
    }
  };

  useEffect(() => {
    handleSearch();
  }, [])

  const handleStartDateChange = (date) => {
    setStartDate(date);

    if (startDate && endDate) {
      if (date > endDate) {
        setEndDate(date);
      }
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Order List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Order No.</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Total</th>
                    <th>Payable</th>
                    <th>Received</th>
                    <th>Remaining</th>
                    <th>Mode</th>
                    <th>Delivery Boy</th>
                    <th>Delivery Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach((order) => {
      printContent += `
            <tr>
                <td>${order.invoicePrefix}${order.invoiceNum}</td>
                <td>${order.invoiceDate}</td>
                <td>${getOrderStatus(order.invoiceStatus)}</td>
                <td>${order.invoiceName || ''}</td>
                <td>${order.invoiceMobile || ''}</td>
                <td>${formatAmount(order.invoiceTotalAmount)}</td>
                <td>${formatAmount(order.invoicePayable)}</td>
                <td>${formatAmount(order.invoiceReceivedAmount)}</td>
                <td>${formatAmount(order.invoiceRemainingAmount)}</td>
                <td>${order.invoicePaymentMode === 1 ? "CASH" : "ONLINE"}</td>
                <td>${order.deliveryBoy?.deliveryBoyName || "Not Assigned"}</td>
                <td>${order.invoiceDeliveryDate || "N/A"}</td>
            </tr>
        `;
    });

    printContent += `</tbody></table>`;

    const newWin = window.open('', '', 'width=900,height=700');
    newWin.document.write(`
        <html>
            <head>
                <title>Order List Print</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                    th { background-color: #f0f0f0; }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  // Function to get order status text
  const getOrderStatus = (status) => {
    const statusMap = {
      1: "Pending",
      2: "Confirmed",
      3: "Dispatched",
      4: "Delivered",
      5: "Rejected",
      6: "Cancelled",
    };
    return statusMap[status] || "Unknown";
  };

  // Function to format amount
  const formatAmount = (amount) => {
    return amount ? parseFloat(amount).toFixed(2) : "0.00";
  };

  // Copy
  const handleCopy = () => {
    const text = paginatedOrders.map(order =>
      `${order.invoicePrefix}${order.invoiceNum}\t${order.invoiceDate}\t${getOrderStatus(order.invoiceStatus)}\t${order.invoiceName || ''}\t${order.invoiceMobile || ''}\t${formatAmount(order.invoiceTotalAmount)}\t${formatAmount(order.invoicePayable)}\t${formatAmount(order.invoiceReceivedAmount)}\t${formatAmount(order.invoiceRemainingAmount)}\t${order.invoicePaymentMode === 1 ? "CASH" : "ONLINE"}\t${order.deliveryBoy?.deliveryBoyName || "Not Assigned"}\t${order.invoiceDeliveryDate || "N/A"}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Order data has been copied to clipboard.',
        timer: 2000,
        showConfirmButton: false
      });
    }).catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to copy data.',
      });
    });
  };

  // PDF
  const handlePdfExport = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const tableColumn = ["Order No.", "Date", "Status", "Name", "Mobile", "Total", "Payable", "Received", "Remaining", "Mode", "Delivery Boy", "Delivery Date"];
    const tableRows = [];

    paginatedOrders.forEach((order) => {
      tableRows.push([
        `${order.invoicePrefix}${order.invoiceNum}`,
        order.invoiceDate,
        getOrderStatus(order.invoiceStatus),
        order.invoiceName || '',
        order.invoiceMobile || '',
        formatAmount(order.invoiceTotalAmount),
        formatAmount(order.invoicePayable),
        formatAmount(order.invoiceReceivedAmount),
        formatAmount(order.invoiceRemainingAmount),
        order.invoicePaymentMode === 1 ? "CASH" : "ONLINE",
        order.deliveryBoy?.deliveryBoyName || "Not Assigned",
        order.invoiceDeliveryDate || "N/A"
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Order List", 148, 15, { align: "center" });
    doc.save('Orders.pdf');
  };

  // Excel
  const handleExcelExport = () => {
    const orderData = paginatedOrders.map(order => ({
      "Order No.": `${order.invoicePrefix}${order.invoiceNum}`,
      "Date": order.invoiceDate,
      "Status": getOrderStatus(order.invoiceStatus),
      "Name": order.invoiceName || '',
      "Mobile": order.invoiceMobile || '',
      "Total": formatAmount(order.invoiceTotalAmount),
      "Payable": formatAmount(order.invoicePayable),
      "Received": formatAmount(order.invoiceReceivedAmount),
      "Remaining": formatAmount(order.invoiceRemainingAmount),
      "Mode": order.invoicePaymentMode === 1 ? "CASH" : "ONLINE",
      "Delivery Boy": order.deliveryBoy?.deliveryBoyName || "Not Assigned",
      "Delivery Date": order.invoiceDeliveryDate || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(orderData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "Orders.xlsx");
  };

  // CSV
  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Order No.,Date,Status,Name,Mobile,Total,Payable,Received,Remaining,Mode,Delivery Boy,Delivery Date",
        ...paginatedOrders.map(order =>
          `${order.invoicePrefix}${order.invoiceNum},${order.invoiceDate},${getOrderStatus(order.invoiceStatus)},${order.invoiceName || ''},${order.invoiceMobile || ''},${formatAmount(order.invoiceTotalAmount)},${formatAmount(order.invoicePayable)},${formatAmount(order.invoiceReceivedAmount)},${formatAmount(order.invoiceRemainingAmount)},${order.invoicePaymentMode === 1 ? "CASH" : "ONLINE"},${order.deliveryBoy?.deliveryBoyName || "Not Assigned"},${order.invoiceDeliveryDate || "N/A"}`
        )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteOrderAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (invoiceNum) => {
    const result = await deleteOrderAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-order/${invoiceNum}`);
        if (response.status === 200) {
          handleSearch();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the Product. Please try again!");
          console.error(error);
        }
      }
    }
  }


  return (
    <div className='orders'>
      <Sidebar activeId={1} />
      <div className="brand-content">
        <div className='search-filter'>
          <div className="date-range-container">
            <label className="date-label">Select Date <span className="required">*</span></label>
            <div className="date-picker-wrapper">
              <DatePicker
                selected={startDate}
                onChange={(date) => handleStartDateChange(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd-MM-yyyy"
                className="date-input"
                placeholderText="Start Date"
              />
              <span className="to-text">to</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd-MM-yyyy"
                className="date-input"
                placeholderText="End Date"
              />
              <div className='buttons'>
                <button onClick={() => handleSearch()}>Search</button>
              </div>
            </div>
          </div>
        </div>
        <div className="brand-header">
          <h2>ORDER LIST</h2>
        </div>
        <div className="brand-tools">
          <button className='print' onClick={handlePrint}>Print</button>
          <button className='copy' onClick={handleCopy}>Copy</button>
          <button className="pdf" onClick={handlePdfExport}>PDF</button>
          <button className="excel" onClick={handleExcelExport}>Excel</button>
          <button className="csv" onClick={handleCSVExport}>CSV</button>

          <div className="search-bar">
            <label>Search: </label>
            <input type="text"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <table className="order-table">
          <thead>
            <tr>
              <th>Order No.</th>
              <th>Date</th>
              <th>Status</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Total</th>
              <th>Payable</th>
              <th>Received</th>
              <th>Remaining</th>
              <th>Mode</th>
              <th>Delivery Boy</th>
              <th>Delivery Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr key={order.invoiceId}>
                  <td>{order.invoicePrefix}{order.invoiceNum}</td>
                  <td>{order.invoiceDate}</td>
                  <td className={
                    order.invoiceStatus == 1 ? "Pending" :
                      order.invoiceStatus == 2 ? "Confirm" :
                        order.invoiceStatus == 3 ? "Dispatched" :
                          order.invoiceStatus == 4 ? "Delivered" :
                            order.invoiceStatus == 5 ? "Rejected" :
                              order.invoiceStatus == 6 ? "Cancelled" : ""
                  }>
                    {order.invoiceStatus == 1 && "Pending"}
                    {order.invoiceStatus == 2 && "Confirmed"}
                    {order.invoiceStatus == 3 && "Dispatched"}
                    {order.invoiceStatus == 4 && "Delivered"}
                    {order.invoiceStatus == 5 && "Rejected"}
                    {order.invoiceStatus == 6 && "Cancelled"}
                  </td>
                  <td>{order.invoiceName || ''}</td>
                  <td>{order.invoiceMobile || ''}</td>
                  <td>{order.invoiceTotalAmount ? parseFloat(order.invoiceTotalAmount).toFixed(2) : "0.00"}</td>
                  <td>{order.invoicePayable ? parseFloat(order.invoicePayable).toFixed(2) : "0.00"}</td>
                  <td>{order.invoiceReceivedAmount ? parseFloat(order.invoiceReceivedAmount).toFixed(2) : "0.00"}</td>
                  <td>{order.invoiceRemainingAmount ? parseFloat(order.invoiceRemainingAmount).toFixed(2) : "0.00"}</td>
                  <td>{order.invoicePaymentMode === 1 ? "CASH" : "ONLINE"}</td>
                  <td>{order.deliveryBoy?.deliveryBoyName || <span style={{ color: 'red' }}>Not Assigned</span>}</td>
                  <td>{order.invoiceDeliveryDate || <span style={{ color: 'red' }}>N/A</span>}</td>
                  <td className="action-buttons">
                    <FaEye
                      className="edit-icon"
                      title="View"
                    // onClick={() => navigate(`/admin/product/update-product/${product.id}`)}
                    />
                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                    onClick={() => handleDelete(order.invoiceNum)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" style={{ textAlign: 'center' }}>No data available in table</td>
              </tr>
            )}
          </tbody>
        </table>

        {paginatedOrders.length > 0 && (

          <div className="pagination">
            {orders.length > 0 ? (
              <>
                <span>Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} entries</span>
                <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>
                  &lt;
                </button>
                {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
                  <button
                    key={startPage + index}
                    className={currentPage === startPage + index ? "active" : ""}
                    onClick={() => handlePageClick(startPage + index)}
                  >
                    {startPage + index}
                  </button>
                ))}
                <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>
                  &gt;
                </button>
              </>
            ) : (
              <span>No entries found</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
