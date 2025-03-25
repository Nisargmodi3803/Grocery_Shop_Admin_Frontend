import './CouponCode.css'
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { FaPencilAlt } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { parseISO, format, parse, isValid } from 'date-fns';

export const CouponCode = () => {
  const [codes, setCodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(codes.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedCodes = codes.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
  const [showResult, setShowResult] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Handle Click
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const fetchCodes = async () => {
    try {
      const response = await axios.get('http://localhost:9000/admin/coupon-codes');
      if (response.status === 200) {
        setCodes(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Coupon Code Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-coupon-code?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setCodes(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setCodes([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setCodes([]);
      }
    }
  }

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchCodes();
      return;
    }

    fetchResults(keyword);
  }

  const deleteCouponCodeAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Coupon Code?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteCouponCodeAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-coupon-code/${id}`);
        if (response.status === 200) {
          fetchCodes();
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the Coupon Code. Please try again!");
          console.error(error);
        }
      }
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "Not Specified Yet";
    try {
      let date;
      // Check if dateStr starts with a 4-digit year => ISO format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        date = parseISO(dateStr);
      } else {
        // Otherwise, parse using dd-MM-yyyy
        date = parse(dateStr, "dd-MM-yyyy", new Date());
      }
      return isValid(date) ? format(date, "dd-MM-yyyy") : "Invalid Date";
    } catch (error) {
      return "Invalid Date";
    }
  }

  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Coupon Code List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Code</th>
                    <th>Coupon Title</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Type</th>
                    <th>Coupon For</th>
                    <th>Value</th>
                    <th>Min. Bill Amount</th>
                    <th>Max. Discount</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedCodes.forEach((code) => {
      printContent += `
            <tr>
                <td>${code.couponId}</td>
                <td>${code.couponCode}</td>
                <td>${code.couponTitle}</td>
                <td>${formatDate(code.couponStartDate)}</td>
                <td>${formatDate(code.couponEndDate)}</td>
                <td>${code.couponType === 1 ? "Fix Amount" : "Percentage"}</td>
                <td>${code.couponCodeFor === 1 ? "Secret" : "General"}</td>
                <td>${code.couponValue ? parseFloat(code.couponValue).toFixed(2) : "0.00"}</td>
                <td>${code.couponMinimumBillAmount ? parseFloat(code.couponMinimumBillAmount).toFixed(2) : "0.00"}</td>
                <td>${code.couponMaxDiscount ? parseFloat(code.couponMaxDiscount).toFixed(2) : "0.00"}</td>
            </tr>
        `;
    });

    printContent += `
            </tbody>
        </table>
    `;

    const newWin = window.open('', '', 'width=900,height=700');
    newWin.document.write(`
        <html>
            <head>
                <title>Coupon Code List Print</title>
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

  const handleCopy = () => {
    const text = codes.map(code =>
      `${code.couponId}\t${code.couponCode}\t${code.couponTitle}\t${formatDate(code.couponStartDate)}\t${formatDate(code.couponEndDate)}\t${code.couponType === 1 ? "Fix Amount" : "Percentage"}\t${code.couponCodeFor === 1 ? "Secret" : "General"}\t${code.couponValue?.toFixed(2) ?? "0.00"}\t${code.couponMinimumBillAmount?.toFixed(2) ?? "0.00"}\t${code.couponMaxDiscount?.toFixed(2) ?? "0.00"}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Coupon code data has been copied to clipboard.',
        timer: 2000,
        showConfirmButton: false
      });
    }).catch((err) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to copy data.',
      });
    });
  };

  const handlePdfExport = () => {
    const doc = new jsPDF();
    const tableColumn = ["Id", "Code", "Title", "Start Date", "End Date", "Type", "For", "Value", "Min. Bill", "Max. Discount"];
    const tableRows = [];

    codes.forEach((code) => {
      tableRows.push([
        code.couponId,
        code.couponCode,
        code.couponTitle,
        formatDate(code.couponStartDate),
        formatDate(code.couponEndDate),
        code.couponType === 1 ? "Fix Amount" : "Percentage",
        code.couponCodeFor === 1 ? "Secret" : "General",
        code.couponValue?.toFixed(2) ?? "0.00",
        code.couponMinimumBillAmount?.toFixed(2) ?? "0.00",
        code.couponMaxDiscount?.toFixed(2) ?? "0.00"
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Coupon Code List", 105, 15, { align: "center" });
    doc.save('coupon_codes.pdf');
  };

  const handleExcelExport = () => {
    const exportData = codes.map(code => ({
      Id: code.couponId,
      Code: code.couponCode,
      Title: code.couponTitle,
      StartDate: formatDate(code.couponStartDate),
      EndDate: formatDate(code.couponEndDate),
      Type: code.couponType === 1 ? "Fix Amount" : "Percentage",
      For: code.couponCodeFor === 1 ? "Secret" : "General",
      Value: code.couponValue?.toFixed(2) ?? "0.00",
      MinBillAmount: code.couponMinimumBillAmount?.toFixed(2) ?? "0.00",
      MaxDiscount: code.couponMaxDiscount?.toFixed(2) ?? "0.00"
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CouponCodes");
    XLSX.writeFile(workbook, "coupon_codes.xlsx");
  };

  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Code,Title,Start Date,End Date,Type,For,Value,Min. Bill Amount,Max. Discount", ...codes.map(code =>
        `${code.couponId},${code.couponCode},${code.couponTitle},${formatDate(code.couponStartDate)},${formatDate(code.couponEndDate)},${code.couponType === 1 ? "Fix Amount" : "Percentage"},${code.couponCodeFor === 1 ? "Secret" : "General"},${code.couponValue?.toFixed(2) ?? "0.00"},${code.couponMinimumBillAmount?.toFixed(2) ?? "0.00"},${code.couponMaxDiscount?.toFixed(2) ?? "0.00"}`
      )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "coupon_codes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='coupon'>
      <Sidebar activeId={8} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>COUPON CODE LIST</h2>
          <button className="add-brand-btn"
            onClick={() => navigate("/admin/coupon/add-coupon")}>
            Add Coupon Code <span>+</span>
          </button>
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
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <table className="brand-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Code</th>
              <th className="description">Coupon Title</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Type</th>
              <th>Coupon for</th>
              <th>Value</th>
              <th>Min. Bill Amount</th>
              <th>Max. Discount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCodes.map((code) => {
              return (
                <tr key={code.couponId}>
                  <td>
                    {code.couponId}
                  </td>
                  <td>{code.couponCode}</td>
                  <td className="description">{code.couponTitle}</td>
                  <td>{formatDate(code.couponStartDate)}</td>
                  <td>{formatDate(code.couponEndDate)}</td>
                  <td>{code.couponType === 1 ? "Fix Amount" : "Percentage"}</td>
                  <td>{code.couponCodeFor === 1 ? "Secret" : "General"}</td>
                  <td>{code.couponValue ? parseFloat(code.couponValue).toFixed(2) : "0.00"}</td>
                  <td>{code.couponMinimumBillAmount ? parseFloat(code.couponMinimumBillAmount).toFixed(2) : "0.00"}</td>
                  <td>{code.couponMaxDiscount ? parseFloat(code.couponMaxDiscount).toFixed(2) : "0.00"}</td>
                  <td className="action-buttons">
                    <FaPencilAlt
                      className="edit-icon"
                      title="Edit"
                      onClick={() => navigate(`/admin/coupon/update-coupon/${code.couponId}`)}
                    />

                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(code.couponId)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedCodes.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, codes.length)} of {codes.length} entries</span>

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
          </div>
        )}
      </div>
    </div>
  )
}
