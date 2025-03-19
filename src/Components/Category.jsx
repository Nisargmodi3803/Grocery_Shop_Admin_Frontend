import './Category.css'
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

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Category", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const Category = () => {
  const [category, setCategory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(category.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedCategory = category.slice(startIndex, endIndex);
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

  const fetchCategory = async () => {
    try {
      const response = await axios.get('http://localhost:9000/categories');
      if (response.status === 200) {
        setCategory(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Categories Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-category?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setCategory(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setCategory([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setCategory([]);
      }
    }
  }

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchCategory();
      return;
    }

    fetchResults(keyword);
  }

  // Print
  const handlePrint = () => {
    let printContent = `
              <h2 style="text-align:center; margin-bottom:20px;">Category List</h2>
              <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
                  <thead>
                      <tr>
                          <th>Id</th>
                          <th>Image</th>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Priority</th>
                      </tr>
                  </thead>
                  <tbody>
          `;

    paginatedCategory.forEach((category) => {
      const imageSrc = imageMap[category.image_url] || `http://localhost:9000/uploads/${category.image_url}`;
      printContent += `
                  <tr>
                      <td>${category.id}</td>
                      <td><img src="${imageSrc}" alt="${category.name}" width="60" height="60"/></td>
                      <td>${category.name}</td>
                      <td>${category.description}</td>
                      <td>${category.priority}</td>
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
                      <title>category List Print</title>
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
    const text = category.map(b => `${b.id}\t${b.name}\t${b.description}\t${b.priority}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Brand data has been copied to clipboard.',
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
    const tableColumn = ["Id", "Category", "Description","Priority"];
    const tableRows = [];

    category.forEach((c) => {
      tableRows.push([c.id, c.name, c.description,c.priority]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Category List", 105, 15, { align: "center" });
    doc.save('Categories.pdf');
  };



  // Excel
  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(category);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, "Categories.xlsx");
  };

  // CSV
  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Category,Description,Priority", ...category.map(b => `${b.id},${b.name},${b.description},${b.priority}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Categories.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteCategoryAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Category?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteCategoryAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-category/${id}`);
        if (response.status === 200) {
          fetchCategory();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the Category. Please try again!");
          console.error(error);
        }
      }
    }
  }

  return (
    <div className='category'>
      <Sidebar activeId={3} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>CATEGORY LIST</h2>
          <button className="add-brand-btn"
            onClick={() => navigate("/admin/category/add-category")}>
            Add Category <span>+</span>
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
              <th>Image</th>
              <th>Category</th>
              <th className="description">Description</th>
              <th>Priority</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategory.map((category) => {
              const imageSrc = imageMap[category.image_url] || `http://localhost:9000/uploads/${category.image_url}`;
              return (
                <tr key={category.id}>
                  <td>
                    {category.id}
                  </td>
                  <td>
                    <img src={imageSrc} alt={category.name} className="brand-image" />
                  </td>
                  <td>{category.name}</td>
                  <td className="description">{category.description}</td>
                  <td>{ category.priority }</td>
                  <td className="action-buttons">
                    <FaPencilAlt
                      className="edit-icon"
                      title="Edit"
                      onClick={() => navigate(`/admin/category/update-category/${category.id}`)}
                    />


                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(category.id)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedCategory.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, category.length)} of {category.length} entries</span>

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
