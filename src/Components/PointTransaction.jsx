import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { RiDeleteBin5Line } from "react-icons/ri";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const PointTransaction = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerPoints, setCustomerPoints] = useState([]);
  const searchInputRef = useRef(null);
  const [customerId, setCustomerId] = useState();
  const [openDropdown, setOpenDropdown] = useState('');
  const [isSearchResultsFound, setIsSearchResultsFound] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(customerPoints.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedCustomerPoints = customerPoints.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

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

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowDropdown(false);
    setCustomerId(customer.customerId)
    setSearchTerm('');
  };

  const filteredCustomers = customers.filter((cat) =>
    cat.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (customerId && customers.length > 0) {
      const defaultCustomer = customers.find(cat => cat.customerId === customerId);
      setSelectedCustomer(defaultCustomer);
    }
  }, [customerId, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:9000/customers');
      if (response.status === 200) {
        setCustomers(response.data);

        if (customerId) {
          const defaultCustomer = customers.find(cat => cat.customerId === customerId);
          setSelectedCustomer(defaultCustomer);
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Customers Found");
      } else {
        console.error("Error fetching Customers:", error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [customerId]);

  const handleSearch = async () => {
    if (customerId === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select Customer',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      })
      return;
    }

    try {
      const response = await axios.get(`http://localhost:9000/admin/points/${customerId}`);
      if (response.status === 200) {
        setCustomerPoints(response.data);
        setIsSearchResultsFound(false);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Customer Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  const handleClear = async () => {
    setSearchTerm('');
    setSelectedCustomer(null);
    setCustomerId(null);
    setOpenDropdown('');
    setIsSearchResultsFound(true);
    setCustomerPoints([]);
  };

  const formatDateOnly = (dateTimeString) => {
    if (!dateTimeString) return "Invalid Date";
    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const handlePrint = () => {
    let printContent = `
          <h2 style="text-align:center; margin-bottom:20px;">Customer Points List</h2>
          <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
              <thead>
                  <tr>
                      <th>Id</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Credit</th>
                      <th>Debit</th>
                      <th>Available</th>
                  </tr>
              </thead>
              <tbody>
      `;

    paginatedCustomerPoints.forEach((points) => {
      printContent += `
              <tr>
                  <td>${points.id}</td>
                  <td>${points.customerPointDetail}</td>
                  <td>${formatDateOnly(points.c_date)}</td>
                  <td>${points.customerPointType === 1 ? parseFloat(points.customerPoint).toFixed(2) : ""}</td>
                  <td>${points.customerPointType === 2 ? parseFloat(points.customerPoint).toFixed(2) : ""}</td>
                  <td>${parseFloat(points.customerAvailablePoint).toFixed(2)}</td>
              </tr>
          `;
    });

    printContent += `</tbody></table>`;

    const newWin = window.open("", "", "width=900,height=700");
    newWin.document.write(`
          <html>
              <head>
                  <title>Customer Points Print</title>
                  <style>
                      body { font-family: Arial, sans-serif; margin: 20px; }
                      table { width: 100%; border-collapse: collapse; }
                      th, td { padding: 8px; text-align: center; }
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
    const text = paginatedCustomerPoints.map(p =>
      `${p.id}\t${p.customerPointDetail}\t${formatDateOnly(p.c_date)}\t${p.customerPointType === 1 ? parseFloat(p.customerPoint).toFixed(2) : ""}\t${p.customerPointType === 2 ? parseFloat(p.customerPoint).toFixed(2) : ""}\t${parseFloat(p.customerAvailablePoint).toFixed(2)}`
    ).join("\n");

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Customer Points data has been copied to clipboard.",
        timer: 2000,
        showConfirmButton: false
      });
    }).catch(() => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to copy data.",
      });
    });
  };

  const handlePdfExport = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const tableColumn = ["Id", "Message", "Date", "Credit", "Debit", "Available"];
    const tableRows = [];

    paginatedCustomerPoints.forEach((p) => {
      tableRows.push([
        p.id,
        p.customerPointDetail,
        formatDateOnly(p.c_date),
        p.customerPointType === 1 ? parseFloat(p.customerPoint).toFixed(2) : "",
        p.customerPointType === 2 ? parseFloat(p.customerPoint).toFixed(2) : "",
        parseFloat(p.customerAvailablePoint).toFixed(2)
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Customer Points List", 148, 15, { align: "center" });
    doc.save("CustomerPoints.pdf");
  };

  const handleExcelExport = () => {
    const pointsData = paginatedCustomerPoints.map(p => ({
      Id: p.id,
      Message: p.customerPointDetail,
      Date: formatDateOnly(p.c_date),
      Credit: p.customerPointType === 1 ? parseFloat(p.customerPoint).toFixed(2) : "",
      Debit: p.customerPointType === 2 ? parseFloat(p.customerPoint).toFixed(2) : "",
      Available: parseFloat(p.customerAvailablePoint).toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(pointsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Points");
    XLSX.writeFile(workbook, "CustomerPoints.xlsx");
  };

  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Message,Date,Credit,Debit,Available",
        ...paginatedCustomerPoints.map(p =>
          `${p.id},${p.customerPointDetail},${formatDateOnly(p.c_date)},${p.customerPointType === 1 ? parseFloat(p.customerPoint).toFixed(2) : ""},${p.customerPointType === 2 ? parseFloat(p.customerPoint).toFixed(2) : ""},${parseFloat(p.customerAvailablePoint).toFixed(2)}`
        )].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "CustomerPoints.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className='orders'>
      <Sidebar activeId={11} />
      <div className="brand-content">
        <div className='search-filter'>
          <div className='filter'>
            <div className="custom-dropdown1">
              <label>Customer <span className="required">*</span></label>
              <div
                className="dropdown-header1"
                onClick={() => toggleDropdown('customer')}
              >
                <span>{selectedCustomer ? selectedCustomer.customerName : 'Select Customer'}</span>
                <span className="arrow">{openDropdown === 'customer' ? '▲' : '▼'}</span>
              </div>
              {openDropdown === 'customer' && (
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
                    {filteredCustomers
                      .filter((cat) =>
                        cat.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((cat) => (
                        <div
                          key={cat.customerId}
                          className={`dropdown-item1 ${customerId === cat.customerId ? 'selected' : ''}`}
                          onClick={() => {
                            handleSelect(cat);
                            setOpenDropdown('');
                          }}
                        >
                          {cat.customerName}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='buttons'>
            <button onClick={handleSearch}>Search</button>
            <button disabled={isSearchResultsFound} onClick={handleClear}>Clear</button>
          </div>
        </div>
        <div className="brand-header">
          <h2>POINT TRANSACTION</h2>
        </div>
        <div className="brand-tools">
          <button className='print' onClick={handlePrint}>Print</button>
          <button className='copy' onClick={handleCopy}>Copy</button>
          <button className="pdf" onClick={handlePdfExport}>PDF</button>
          <button className="excel" onClick={handleExcelExport}>Excel</button>
          <button className="csv" onClick={handleCSVExport}>CSV</button>
        </div>
        <table className="product-table">
          <thead>
            <tr>
              <th>Id</th>
              <th className='description'>Message</th>
              <th>Date</th>
              <th>Credit</th>
              <th>Debit</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomerPoints.length > 0 ? (
              paginatedCustomerPoints.map((points) => (
                <tr key={points.id}>
                  <td>{points.id}</td>
                  <td className='description'>{points.customerPointDetail}</td>
                  <td>{formatDateOnly(points.c_date)}</td>
                  <td>{points.customerPointType === 1 ? parseFloat(points.customerPoint).toFixed(2) : ""}</td>
                  <td>{points.customerPointType === 2 ? parseFloat(points.customerPoint).toFixed(2) : ""}</td>
                  <td>{parseFloat(points.customerAvailablePoint).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center' }}>No data available in table</td>
              </tr>
            )}
          </tbody>
        </table>

        {paginatedCustomerPoints.length > 0 && (

          <div className="pagination">
            {customerPoints.length > 0 ? (
              <>
                <span>Showing {startIndex + 1} to {Math.min(endIndex, customerPoints.length)} of {customerPoints.length} entries</span>
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
