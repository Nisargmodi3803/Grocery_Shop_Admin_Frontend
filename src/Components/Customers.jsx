import './Customers.css'
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { FaPencilAlt } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdBlock } from "react-icons/md";
import { BsUnlock } from "react-icons/bs";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Customer", false, /\.(png|jpeg|svg|jpg|JPEG|JPG)$/));

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(customers.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);
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

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:9000/customers');
      if (response.status === 200) {
        setCustomers(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No customers Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-customer?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setCustomers(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setCustomers([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setCustomers([]);
      }
    }
  }

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchCustomers();
      return;
    }

    fetchResults(keyword);
  }

  // Print
  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Customer List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Points</th>
                    <th>Address</th>
                    <th>Gender</th>
                    <th>Referral Code</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedCustomers.forEach((customer) => {
      printContent += `
            <tr>
                <td>${customer.customerId}</td>
                <td>${customer.customerName}</td>
                <td>${customer.customerMobile}</td>
                <td>${customer.customerEmail}</td>
                <td>${customer.customerPoints}</td>
                <td>${customer.customerAddress}</td>
                <td>${customer.customerGender === 1 ? "Male" : customer.customerGender === 2 ? "Female" : "Other"}</td>
                <td>${customer.customerReferralCode}</td>
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
                <title>Customer List Print</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                    th { background-color: #f0f0f0; }
                    img { width: 60px; height: auto; }
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


  //Copy
  const handleCopy = () => {
    const text = currentPage.map(customer => `${customer.customerId}\t${customer.customerName}\t${customer.customerMobile}\t${customer.customerEmail}\t${customer.customerAddress}\t${customer.customerGender === 1 ? "Male" : customer.customerGender === 2 ? "Female" : "Other"}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Customers data has been copied to clipboard.',
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

  // PDF
  const handlePdfExport = () => {
    const doc = new jsPDF();
    const tableColumn = ["Id", "Name", "Mobile", "Email", "Address", "Gender", "Referral Code"];
    const tableRows = [];

    customers.forEach((customer) => {
      tableRows.push([customer.customerId, customer.customerName, customer.customerMobile, customer.customerEmail, customer.customerAddress, customer.customerGender === 1 ? "Male" : customer.customerGender === 2 ? "Female" : "Other", customer.customerReferralCode]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Customer List", 105, 15, { align: "center" });
    doc.save('customers.pdf');
  };



  // Excel
  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");
    XLSX.writeFile(workbook, "customers.xlsx");
  };

  // CSV
  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Name,Mobile,Email,Address,Gender,Referral Code", ...customers.map(customer => `${customer.customerId},${customer.customerName},${customer.customerMobile},${customer.customerEmail},${customer.customerAddress},${customer.customerGender === 1 ? "Male" : customer.customerGender === 2 ? "Female" : "Other"},${customer.customerReferralCode}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteCustomerAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to Delete this Customer?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteCustomerAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-customer/${id}`);
        if (response.status === 200) {
          fetchCustomers();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the Customer. Please try again!");
          console.error(error);
        }
      }
    }
  }

  const handleBlockCustomer = async (email) => {
    try {
      const response = await axios.patch(`http://localhost:9000/block-customer/${email}`);
      if (response.status === 200) {
        fetchCustomers();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.error(error);
      } else {
        alert("Something went wrong in blocking the Customer. Please try again!");
        console.error(error);
      }
    }
  }

  const handleUnblockCustomer = async (email) => {
    try {
      const response = await axios.patch(`http://localhost:9000/unblock-customer/${email}`);
      if (response.status === 200) {
        fetchCustomers();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.error(error);
      } else {
        alert("Something went wrong in unblocking the Customer. Please try again!");
        console.error(error);
      }
    }
  }

  return (
    <div className='customers'>
      <Sidebar activeId={7} />
      <div className="brand-content">
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
              <th>Name</th>
              <th>Image</th>
              <th>Mobile</th>
              <th>Email</th>
              <th className="description">Address</th>
              <th>Gender</th>
              <th>Referral Code</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer) => {
              const imageSrc = customer.customerImage && customer.customerImage !== 'default.png' ? `http://localhost:9000/uploads/${customer.customerImage}` : imageMap[customer.customerImage] || customer.customerImage;
              return (
                <tr key={customer.customerId}>
                  <td>
                    {customer.customerId}
                  </td>
                  <td>{customer.customerName}</td>
                  <td>
                    <img src={imageSrc} alt={customer.name} className="brand-image" />
                  </td>
                  <td>{customer.customerMobile}</td>
                  <td>{customer.customerEmail}</td>
                  <td className="description">{customer.customerAddress}</td>
                  <td>{customer.customerGender === 1 ? "Male" : customer.customerGender === 2 ? "Female" : "Other"}</td>
                  <td>{customer.customerReferralCode}</td>
                  <td className="action-buttons">
                    {customer.isBlocked===1?(
                      <MdBlock
                      className="delete-icon"
                      title="Block"
                      style={{ color: "maroon"}}
                      onClick={() => handleBlockCustomer(customer.customerEmail)}
                    />
                    ):(
                      <BsUnlock
                      className="edit-icon"
                      title="Unblock"
                      onClick={() => handleUnblockCustomer(customer.customerEmail)}
                    />
                    )}

                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(customer.customerId)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedCustomers.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, customers.length)} of {customers.length} entries</span>

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
