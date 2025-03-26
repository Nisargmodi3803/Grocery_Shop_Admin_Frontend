import './Contact.css'
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

export const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(contacts.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedContacts = contacts.slice(startIndex, endIndex);
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

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://localhost:9000/contacts');
      if (response.status === 200) {
        setContacts(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Contacts Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-contact?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setContacts(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setContacts([]);
        console.log("No Contacts Found");
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setContacts([]);
      }
    }
  }
  

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchContacts();
      return;
    }

    fetchResults(keyword);
  }

  const deleteContactAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Contact us?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };


  const handleDelete = async (id) => {
    const result = await deleteContactAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-contact/${id}`);
        if (response.status === 200) {
          fetchContacts();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the Contact. Please try again!");
          console.error(error);
        }
      }
    }
  }

  const formatDateOnly = (dateTimeString) => {
    if (!dateTimeString) return "Invalid Date";
    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  const formatTime = (dateString) => {
    const dateObj = new Date(dateString.replace(' ', 'T')); // Convert to proper ISO format
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Contact List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>
    `;

    contacts.forEach((contact) => {
      printContent += `
            <tr>
                <td>${contact.id}</td>
                <td>${formatDateOnly(contact.c_date)}</td>
                <td>${formatTime(contact.c_date)}</td>
                <td>${contact.name}</td>
                <td>${contact.mobile}</td>
                <td>${contact.email}</td>
                <td>${contact.messsage}</td>
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
                <title>Contact List Print</title>
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
    const tableColumn = ["Id", "Date", "Time", "Name", "Mobile", "Email", "Message"];
    const tableRows = [];

    contacts.forEach((contact) => {
      tableRows.push([
        contact.id,
        formatDateOnly(contact.c_date),
        formatTime(contact.c_date),
        contact.name,
        contact.mobile,
        contact.email,
        contact.message,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Contact List", 105, 15, { align: "center" });
    doc.save('contacts.pdf');
  };

  const handleCopy = () => {
    const text = contacts.map(contact =>
      `${contact.id}\t${formatDateOnly(contact.c_date)}\t${formatTime(contact.c_date)}\t${contact.name}\t${contact.mobile}\t${contact.email}\t${contact.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Contact data has been copied to clipboard.',
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
    const excelData = contacts.map((contact) => ({
      Id: contact.id,
      Date: formatDateOnly(contact.c_date),
      Time: formatTime(contact.c_date),
      Name: contact.name,
      Mobile: contact.mobile,
      Email: contact.email,
      Message: contact.message,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    XLSX.writeFile(workbook, "contacts.xlsx");
  };

  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Date,Time,Name,Mobile,Email,Message",
        ...contacts.map(c =>
          `${c.id},${formatDateOnly(c.c_date)},${formatTime(c.c_date)},${c.name},${c.mobile},${c.email},${c.message}`
        )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className='contact'>
      <Sidebar activeId={12} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>CONTACT LIST</h2>
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
              <th>Date</th>
              <th>Time</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th className="description">Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContacts.map((contact) => {
              return (
                <tr key={contact.id}>
                  <td>
                    {contact.id}
                  </td>
                  <td>
                    {formatDateOnly(contact.c_date)}
                  </td>
                  <td>{formatTime(contact.c_date)}</td>
                  <td>{contact.name}</td>
                  <td>{contact.mobile}</td>
                  <td>{contact.email}</td>
                  <td className="description">{contact.message}</td>
                  <td className="action-buttons">
                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(contact.id)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedContacts.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, contacts.length)} of {contacts.length} entries</span>

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
