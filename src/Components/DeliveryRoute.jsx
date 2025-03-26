import './DeliveryRoute.css'
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

export const DeliveryRoute = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(deliveryBoys.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedDeliveryBoys = deliveryBoys.slice(startIndex, endIndex);
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

  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get('http://localhost:9000/delivery-boys');
      if (response.status === 200) {
        setDeliveryBoys(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Delivery Boys Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-delivery-boy?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setDeliveryBoys(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setDeliveryBoys([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setDeliveryBoys([]);
      }
    }
  }

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchDeliveryBoys();
      return;
    }

    fetchResults(keyword);
  }

  const deleteDeliveryBoyAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Delivery Boy?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteDeliveryBoyAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-delivery-boy/${id}`);
        if (response.status === 200) {
          fetchDeliveryBoys();
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the Delivery Boy. Please try again!");
          console.error(error);
        }
      }
    }
  }

  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Delivery Boy List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Vehicle No.</th>
                    <th>Route</th>
                </tr>
            </thead>
            <tbody>
    `;

    deliveryBoys.forEach((boy) => {
      printContent += `
            <tr>
                <td>${boy.deliveryBoyId}</td>
                <td>${boy.deliveryBoyName}</td>
                <td>${boy.deliveryBoyMobileNo}</td>
                <td>${boy.deliveryBoyEmail}</td>
                <td>${boy.deliveryVehicleNo}</td>
                <td>${boy.deliveryRoute}</td>
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
                <title>Delivery Boy List Print</title>
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
    const text = deliveryBoys.map(b =>
      `${b.deliveryBoyId}\t${b.deliveryBoyName}\t${b.deliveryBoyMobileNo}\t${b.deliveryBoyEmail}\t${b.deliveryVehicleNo}\t${b.deliveryRoute}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Delivery boys data has been copied to clipboard.',
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
    const tableColumn = ["Id", "Name", "Mobile", "Email", "Vehicle No.", "Route"];
    const tableRows = [];

    deliveryBoys.forEach((boy) => {
      tableRows.push([
        boy.deliveryBoyId,
        boy.deliveryBoyName,
        boy.deliveryBoyMobileNo,
        boy.deliveryBoyEmail,
        boy.deliveryVehicleNo,
        boy.deliveryRoute
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Delivery Boy List", 105, 15, { align: "center" });
    doc.save('delivery_boys.pdf');
  };

  const handleExcelExport = () => {
    const exportData = deliveryBoys.map(boy => ({
      Id: boy.deliveryBoyId,
      Name: boy.deliveryBoyName,
      Mobile: boy.deliveryBoyMobileNo,
      Email: boy.deliveryBoyEmail,
      VehicleNo: boy.deliveryVehicleNo,
      Route: boy.deliveryRoute
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DeliveryBoys");
    XLSX.writeFile(workbook, "delivery_boys.xlsx");
  };

  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Name,Mobile,Email,Vehicle No.,Route", ...deliveryBoys.map(b =>
        `${b.deliveryBoyId},${b.deliveryBoyName},${b.deliveryBoyMobileNo},${b.deliveryBoyEmail},${b.deliveryVehicleNo},${b.deliveryRoute}`
      )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "delivery_boys.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className='delivery'>
      <Sidebar activeId={13} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>DELIVERY BOY LIST</h2>
          <button className="add-brand-btn"
            onClick={() => navigate("/admin/delivery-boy/add-delivery-boy")}>
            Add Delivery Boy <span>+</span>
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
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Vehicle No.</th>
              <th>Route</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeliveryBoys.map((boy) => {
              return (
                <tr key={boy.deliveryBoyId}>
                  <td>
                    {boy.deliveryBoyId}
                  </td>
                  <td>{boy.deliveryBoyName}</td>
                  <td>{boy.deliveryBoyMobileNo}</td>
                  <td>{boy.deliveryBoyEmail}</td>
                  <td>{boy.deliveryVehicleNo}</td>
                  <td>{boy.deliveryRoute}</td>
                  <td className="action-buttons">
                    <FaPencilAlt
                      className="edit-icon"
                      title="Edit"
                      onClick={() => navigate(`/admin/delivery-boy/update-delivery-boy/${boy.deliveryBoyId}`)}
                    />


                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(boy.deliveryBoyId)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedDeliveryBoys.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, deliveryBoys.length)} of {deliveryBoys.length} entries</span>

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
