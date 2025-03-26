import './Blog.css'
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
import { parseISO, format,isValid  } from 'date-fns';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

const imageMap = importAll(require.context("../assets/Blog", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(blogs.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedBlogs = blogs.slice(startIndex, endIndex);
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

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:9000/blogs');
      if (response.status === 200) {
        setBlogs(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Blogs Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-blog?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setBlogs(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setBlogs([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setBlogs([]);
      }
    }
  }

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchBlogs();
      return;
    }

    fetchResults(keyword);
  }

  // Print
  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Blog List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Title</th>
                    <th>Image</th>
                    <th>Description</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;

    blogs.forEach((blog) => {
      const imageSrc = imageMap[blog.image_url] || `http://localhost:9000/uploads/${blog.image_url}`;
      printContent += `
            <tr>
                <td>${blog.id}</td>
                <td>${blog.title}</td>
                <td><img src="${imageSrc}" alt="${blog.name}" width="60" height="60"/></td>
                <td>${blog.description}</td>
                <td>${blog.date}</td>
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
                <title>Blog List Print</title>
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
    const text = blogs.map(b => `${b.id}\t${b.title}\t${b.description}\t${b.date}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Blog data has been copied to clipboard.',
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
    const tableColumn = ["Id", "Title", "Description", "Date"];
    const tableRows = [];

    blogs.forEach((blog) => {
      tableRows.push([blog.id, blog.title, blog.description, blog.date]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Blog List", 105, 15, { align: "center" });
    doc.save('blogs.pdf');
  };



  // Excel
  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(blogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");
    XLSX.writeFile(workbook, "blogs.xlsx");
  };

  // CSV
  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Title,Description,Date", ...blogs.map(b => `${b.id},${b.title},${b.description},${b.date}`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "blogs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteBlogAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Blog?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteBlogAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-blog/${id}`);
        if (response.status === 200) {
          fetchBlogs();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the blog. Please try again!");
          console.error(error);
        }
      }
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "Not Specified Yet";
    try {
      const date = parseISO(dateStr); // parseISO works with YYYY-MM-DD
      return isValid(date) ? format(date, "dd-MM-yyyy") : "Invalid Date";
    } catch (error) {
      return "Invalid Date";
    }
  }

  return (
    <div className='blog'>
      <Sidebar activeId={9} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>BLOG LIST</h2>
          <button className="add-brand-btn"
            onClick={() => navigate("/admin/blogs/add-blog")}>
            Add Blog <span>+</span>
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
              <th>Title</th>
              <th>Image</th>
              <th className="description">Description</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBlogs.map((blog) => {
              const imageSrc = imageMap[blog.image_url] || `http://localhost:9000/uploads/${blog.image_url}`;
              return (
                <tr key={blog.id}>
                  <td>
                    {blog.id}
                  </td>
                  <td>{blog.title}</td>
                  <td>
                    <img src={imageSrc} alt={blog.title} className="brand-image" />
                  </td>
                  <td className="description">{blog.description}</td>
                  <td>{formatDate(blog.date)}</td>
                  <td className="action-buttons">
                    <FaPencilAlt
                      className="edit-icon"
                      title="Edit"
                      onClick={() => navigate(`/admin/blogs/update-blog/${blog.id}`)}
                    />

                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(blog.id)}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

        {paginatedBlogs.length > 0 && (

          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, blogs.length)} of {blogs.length} entries</span>

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
