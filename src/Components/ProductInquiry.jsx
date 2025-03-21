import './ProductInquiry.css';
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { RiDeleteBin5Line } from "react-icons/ri";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const ProductInquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(inquiries.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedInquiries = inquiries.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
  const [showResult, setShowResult] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const fetchInquires = async () => {
    try {
      const response = await axios.get('http://localhost:9000/inquiries');
      if (response.status === 200) {
        setInquiries(response.data);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again!");
    }
  };

  useEffect(() => {
    fetchInquires();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-inquiry?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        setInquiries(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setShowResult(false);
        setInquiries([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
      }
    }
  };

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setInquiries([]);
      fetchInquires();
      return;
    }

    fetchResults(keyword);
  };

  const deleteInquiryAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Inquiry?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteInquiryAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-inquiry/${id}`);
        if (response.status === 200) {
          fetchInquires();
        }
      } catch (error) {
        alert("Something went wrong in deleting the Inquiry. Please try again!");
        console.error(error);
      }
    }
  };

  const formatDateOnly = (dateTimeString) => {
    if (!dateTimeString) return "Invalid Date";
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (dateString) => {
    const dateObj = new Date(dateString.replace(' ', 'T'));
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Inquiry List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Required Quantity</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedInquiries.forEach((inquiry) => {
      printContent += `
            <tr>
                <td>${inquiry.inquiryId}</td>
                <td>${formatDateOnly(inquiry.cDate)}</td>
                <td>${formatTime(inquiry.cDate)}</td>
                <td>${inquiry.customer ? `${inquiry.customer.customerName} - ${inquiry.customer.customerMobile}` : 'N/A'}</td>
                <td>${inquiry.product ? `${inquiry.product.name} - ${inquiry.product.variantName}` : 'N/A'}</td>
                <td>${inquiry.inquiryQuantity}</td>
                <td>${inquiry.inquiryMessage}</td>
            </tr>
        `;
    });

    printContent += `
            </tbody>
        </table>
    `;

    const newWin = window.open('', '', 'width=1000,height=700');
    newWin.document.write(`
        <html>
            <head>
                <title>Inquiry List Print</title>
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

  const handlePdfExport = () => {
    const doc = new jsPDF();
    const tableColumn = ["Id", "Date", "Time", "Customer", "Product", "Quantity", "Message"];
    const tableRows = [];

    inquiries.forEach((inquiry) => {
      tableRows.push([
        inquiry.inquiryId,
        formatDateOnly(inquiry.cDate),
        formatTime(inquiry.cDate),
        inquiry.customer ? `${inquiry.customer.customerName} - ${inquiry.customer.customerMobile}` : 'N/A',
        inquiry.product ? `${inquiry.product.name} - ${inquiry.product.variantName}` : 'N/A',
        inquiry.inquiryQuantity,
        inquiry.inquiryMessage,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Inquiry List", 105, 15, { align: "center" });
    doc.save('inquiries.pdf');
  };

  const handleCopy = () => {
    const text = inquiries.map(inquiry =>
      `${inquiry.inquiryId}\t${formatDateOnly(inquiry.cDate)}\t${formatTime(inquiry.cDate)}\t${inquiry.customer ? `${inquiry.customer.customerName} - ${inquiry.customer.customerMobile}` : 'N/A'}\t${inquiry.product ? `${inquiry.product.name} - ${inquiry.product.variantName}` : 'N/A'}\t${inquiry.inquiryQuantity}\t${inquiry.inquiryMessage}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Inquiry data has been copied to clipboard.',
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

  const handleExcelExport = () => {
    const excelData = inquiries.map((inquiry) => ({
      Id: inquiry.inquiryId,
      Date: formatDateOnly(inquiry.cDate),
      Time: formatTime(inquiry.cDate),
      Customer: inquiry.customer ? `${inquiry.customer.customerName} - ${inquiry.customer.customerMobile}` : 'N/A',
      Product: inquiry.product ? `${inquiry.product.name} - ${inquiry.product.variantName}` : 'N/A',
      Quantity: inquiry.inquiryQuantity,
      Message: inquiry.inquiryMessage,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");
    XLSX.writeFile(workbook, "inquiries.xlsx");
  };

  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Id,Date,Time,Customer,Product,Quantity,Message",
        ...inquiries.map(i =>
          `${i.inquiryId},${formatDateOnly(i.cDate)},${formatTime(i.cDate)},${i.customer ? `${i.customer.customerName} - ${i.customer.customerMobile}` : 'N/A'},${i.product ? `${i.product.name} - ${i.product.variantName}` : 'N/A'},${i.inquiryQuantity},${i.inquiryMessage}`
        )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inquiries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='product-inquiry'>
      <Sidebar activeId={15} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>INQUIRY LIST</h2>
        </div>
        <div className="brand-tools">
          <button className='print' onClick={handlePrint}>Print</button>
          <button className='copy' onClick={handleCopy}>Copy</button>
          <button className="pdf" onClick={handlePdfExport}>PDF</button>
          <button className="excel" onClick={handleExcelExport}>Excel</button>
          <button className="csv" onClick={handleCSVExport}>CSV</button>
          <div className="search-bar">
            <label>Search: </label>
            <input type="text" onChange={handleSearchChange} />
          </div>
        </div>
        <table className="brand-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Date</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Required Quantity</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInquiries.map((inquiry) => (
              <tr key={inquiry.inquiryId}>
                <td>{inquiry.inquiryId}</td>
                <td>{formatDateOnly(inquiry.cDate)}</td>
                <td>{formatTime(inquiry.cDate)}</td>
                <td>{inquiry.customer ? `${inquiry.customer.customerName} - ${inquiry.customer.customerMobile}` : 'N/A'}</td>
                <td>{inquiry.product ? `${inquiry.product.name} - ${inquiry.product.variantName}` : 'N/A'}</td>
                <td>{inquiry.inquiryQuantity}</td>
                <td>{inquiry.inquiryMessage}</td>
                <td className="action-buttons">
                  <RiDeleteBin5Line
                    className="delete-icon"
                    title="Delete"
                    onClick={() => handleDelete(inquiry.inquiryId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedInquiries.length > 0 && (
          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, inquiries.length)} of {inquiries.length} entries</span>
            <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
              <button
                key={startPage + index}
                className={currentPage === startPage + index ? "active" : ""}
                onClick={() => handlePageClick(startPage + index)}
              >
                {startPage + index}
              </button>
            ))}
            <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
          </div>
        )}
      </div>
    </div>
  );
};
