import './TimeSlot.css'
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { RiDeleteBin5Line } from "react-icons/ri";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { FaPencilAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


export const TimeSlot = () => {
  const [slots, setSlots] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(slots.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedSlots = slots.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
  const [showResult, setShowResult] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const fetchSlots = async () => {
    try {
      const response = await axios.get('http://localhost:9000/time-slot');
      if (response.status === 200) {
        setSlots(response.data);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again!");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-slot?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        setSlots(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setShowResult(false);
        setSlots([]);
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
      setSlots([]);
      fetchSlots();
      return;
    }

    fetchResults(keyword);
  };

  const deleteSlotAlert = async () => {
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
    const result = await deleteSlotAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-slot/${id}`);
        if (response.status === 200) {
          fetchSlots();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the slot. Please try again!");
          console.error(error);
        }
      }
    }
  };



  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Delivery Time Slot List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Time Slot</th>
                    <th>Priority</th>
                </tr>
            </thead>
            <tbody>
    `;

    slots.forEach((slot) => {
      printContent += `
            <tr>
                <td>${slot.deliveryTimeSlotId}</td>
                <td>${slot.deliveryTime}</td>
                <td>${slot.deliveryTimePrioriy}</td>
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
                <title>Delivery Time Slot List Print</title>
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
    const tableColumn = ["Id", "Time Slot", "Priority"];
    const tableRows = [];

    slots.forEach((slot) => {
      tableRows.push([
        slot.deliveryTimeSlotId,
        slot.deliveryTime,
        slot.deliveryTimePrioriy,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Delivery Time Slot List", 105, 15, { align: "center" });
    doc.save('delivery_time_slots.pdf');
  };



  const handleCopy = () => {
    const text = slots.map(slot =>
      `${slot.deliveryTimeSlotId}\t${slot.deliveryTime}\t${slot.deliveryTimePrioriy}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Delivery Time Slot data has been copied to clipboard.',
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
    const excelData = slots.map((slot) => ({
      Id: slot.deliveryTimeSlotId,
      "Time Slot": slot.deliveryTime,
      Priority: slot.deliveryTimePrioriy,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Delivery Time Slots");
    XLSX.writeFile(workbook, "delivery_time_slots.xlsx");
  };


  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Id,Time Slot,Priority",
        ...slots.map(slot =>
          `${slot.deliveryTimeSlotId},${slot.deliveryTime},${slot.deliveryTimePrioriy}`
        )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "delivery_time_slots.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='time-slot'>
      <Sidebar activeId={14} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>DELIVERY TIME SLOT LIST</h2>
          <button className="add-brand-btn"
            onClick={() => navigate("/admin/time-slot/add-slot")}>
            Add Delivery Time Slot <span>+</span>
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
              <th>Time Slot</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSlots.map((slot) => {
              return (
                <tr key={slot.deliveryTimeSlotId}>
                  <td>
                    {slot.deliveryTimeSlotId}
                  </td>
                  <td>
                    {slot.deliveryTime}
                  </td>
                  <td>{slot.deliveryTimePrioriy}</td>
                  <td className="action-buttons">
                    <FaPencilAlt
                      className="edit-icon"
                      title="Edit"
                      onClick={() => navigate(`/admin/time-slot/update-slot/${slot.deliveryTimeSlotId}`)}
                    />


                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(slot.deliveryTimeSlotId)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedSlots.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, slots.length)} of {slots.length} entries</span>

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
