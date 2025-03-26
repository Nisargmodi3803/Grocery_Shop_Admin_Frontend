import './City.css'
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

export const City = () => {
  const [cities, setCities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(cities.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedCities = cities.slice(startIndex, endIndex);
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

  const fetchCities = async () => {
    try {
      const response = await axios.get('http://localhost:9000/all-cities');
      if (response.status === 200) {
        setCities(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No cities Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-city?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setCities(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setCities([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setCities([]);
      }
    }
  }

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchCities();
      return;
    }

    fetchResults(keyword);
  }

  // Print
  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">City List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>City Name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    cities.forEach((city) => {
      printContent += `
            <tr>
                <td>${city.cityId}</td>
                <td>${city.cityName}</td>
                <td>${city.cityIsActive===1 ? 'Active' : 'Inactive'}</td>
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
                <title>City List Print</title>
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
    const text = cities.map(b => `${b.cityId}\t${b.cityName}\t${b.cityIsActive===1 ? 'Active' : 'Inactive'}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Cities data has been copied to clipboard.',
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
    const tableColumn = ["Id", "City Name", "Status"];
    const tableRows = [];

    cities.forEach((city) => {
      tableRows.push([city.cityId, city.cityName, city.cityIsActive===1 ? 'Active' : 'Inactive']);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("City List", 105, 15, { align: "center" });
    doc.save('cities.pdf');
  };



  // Excel
  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(cities);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");
    XLSX.writeFile(workbook, "cities.xlsx");
  };

  // CSV
  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,City Name,Status", ...cities.map(b => `${b.cityId},${b.cityName},${b.cityIsActive===1 ? 'Active' : 'Inactive'}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteCityAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this City?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteCityAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-city/${id}`);
        if (response.status === 200) {
          fetchCities();
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the City. Please try again!");
          console.error(error);
        }
      }
    }
  }

  return (

    <div className='city'>
      <Sidebar activeId={6} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>CITY LIST</h2>
          <button className="add-brand-btn"
            onClick={() => navigate("/admin/city/add-city")}>
            Add City <span>+</span>
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
              <th>City Name</th>
              {/* <th className="description">Description</th> */}
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCities.map((city) => {
              return (
                <tr key={city.id}>
                  <td>
                    {city.cityId}
                  </td>
                  <td>{city.cityName}</td>
                  <td>{city.cityIsActive===1 ? 'Active' : 'Inactive'}</td>
                  <td className="action-buttons">
                    <FaPencilAlt
                      className="edit-icon"
                      title="Edit"
                      onClick={() => navigate(`/admin/city/update-city/${city.cityId}`)}
                    />


                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(city.cityId)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedCities.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, cities.length)} of {cities.length} entries</span>

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
