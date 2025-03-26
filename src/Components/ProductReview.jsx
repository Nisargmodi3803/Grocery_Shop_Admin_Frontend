import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { RiDeleteBin5Line } from "react-icons/ri";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { LuClock9 } from "react-icons/lu";
import { FcApproval } from "react-icons/fc";
import { MdOutlineCancel } from "react-icons/md";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const ProductReview = () => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(reviews.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedReviews = reviews.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
  const [showResult, setShowResult] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const navigate = useNavigate();

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get('http://localhost:9000/reviews');
      if (response.status === 200) {
        setReviews(response.data);
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Reviews Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-review?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        setReviews(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setShowResult(false);
        setReviews([]);
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
      setReviews([]);
      fetchReviews();
      return;
    }

    fetchResults(keyword);
  };

  const deleteReviewAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Review?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteReviewAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-product-review/${id}`);
        if (response.status === 200) {
          fetchReviews();
        }
      } catch (error) {
        alert("Something went wrong in deleting the Review. Please try again!");
        console.error(error);
      }
    }
  };

  const handleApproved = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:9000/approved/${id}`);
      if (response.status === 200) {
        fetchReviews();
      }
    } catch (error) {
      alert("Something went wrong in approving the Review. Please try again!");
      console.error(error);
    }
  }

  const pendingReviewAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to change Status to Pending for this Review?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handlePending = async (id) => {
    const result = await pendingReviewAlert();
    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/pending/${id}`);
        if (response.status === 200) {
          fetchReviews();
        }
      } catch (error) {
        alert("Something went wrong in pending the Review. Please try again!");
        console.error(error);
      }
    }
  }

  const rejectedReviewAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to change Status to Rejected for this Review?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleRejected = async (id) => {
    const result = await rejectedReviewAlert();
    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/rejected/${id}`);
        if (response.status === 200) {
          fetchReviews();
        }
      } catch (error) {
        alert("Something went wrong in Rejecting the Review. Please try again!");
        console.error(error);
      }
    }
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<AiFillStar key={i} color="gold" />);
      } else {
        stars.push(<AiOutlineStar key={i} color="gray" />);
      }
    }
    return stars;
  };

  const handlePrint = () => {
    let printContent = `
        <h2 style="text-align:center; margin-bottom:20px;">Product Review List</h2>
        <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Status</th>
                    <th>Customer Name</th>
                    <th>Product Name | Variant</th>
                    <th>Order ID</th>
                    <th>Rating</th>
                    <th>Review</th>
                </tr>
            </thead>
            <tbody>
    `;

    reviews.forEach((review) => {
      printContent += `
            <tr>
                <td>${review.ratingId}</td>
                <td>${review.status === 1 ? "Pending" : review.status === 2 ? "Approved" : "Rejected"}</td>
                <td>${review.customer ? review.customer.customerName : 'N/A'}</td>
                <td>${review.product ? `${review.product.name} | ${review.product.variantName}` : 'N/A'}</td>
                <td>${review.invoice ? `${review.invoice.invoicePrefix}${review.invoice.invoiceNum}` : ''}</td>
                <td>${review.rating}</td>
                <td>${review.review}</td>
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
                <title>Product Review List Print</title>
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
    const tableColumn = ["Id", "Status", "Customer", "Product", "Order ID", "Rating", "Review"];
    const tableRows = [];

    reviews.forEach((review) => {
      tableRows.push([
        review.ratingId,
        review.status === 1 ? "Pending" : review.status === 2 ? "Approved" : "Rejected",
        review.customer ? review.customer.customerName : 'N/A',
        review.product ? `${review.product.name} | ${review.product.variantName}` : 'N/A',
        review.invoice ? `${review.invoice.invoicePrefix}${review.invoice.invoiceNum}` : '',
        review.rating,
        review.review
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Product Review List", 105, 15, { align: "center" });
    doc.save('product_reviews.pdf');
  };

  const handleCopy = () => {
    const text = reviews.map(review =>
      `${review.ratingId}\t${review.status === 1 ? "Pending" : review.status === 2 ? "Approved" : "Rejected"}\t${review.customer ? review.customer.customerName : 'N/A'}\t${review.product ? `${review.product.name} | ${review.product.variantName}` : 'N/A'}\t${review.invoice ? `${review.invoice.invoicePrefix}${review.invoice.invoiceNum}` : ''}\t${review.rating}\t${review.review}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Product review data has been copied to clipboard.',
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
    const excelData = reviews.map((review) => ({
      Id: review.ratingId,
      Status: review.status === 1 ? "Pending" : review.status === 2 ? "Approved" : "Rejected",
      Customer: review.customer ? review.customer.customerName : 'N/A',
      Product: review.product ? `${review.product.name} | ${review.product.variantName}` : 'N/A',
      Order_ID: review.invoice ? `${review.invoice.invoicePrefix}${review.invoice.invoiceNum}` : '',
      Rating: review.rating,
      Review: review.review
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Reviews");
    XLSX.writeFile(workbook, "product_reviews.xlsx");
  };

  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Id,Status,Customer,Product,Order ID,Rating,Review",
        ...reviews.map(r =>
          `${r.ratingId},${r.status === 1 ? "Pending" : r.status === 2 ? "Approved" : "Rejected"},${r.customer ? r.customer.customerName : 'N/A'},${r.product ? `${r.product.name} | ${r.product.variantName}` : 'N/A'},${r.invoice ? `${r.invoice.invoicePrefix}${r.invoice.invoiceNum}` : ''},${r.rating},${r.review}`
        )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "product_reviews.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const fetchSortedReviews = async () => {
    let api = "";

    switch (sortOption) {
      case "All Reviews":
        api = `http://localhost:9000/reviews`;
        break;
      case "Status: Approved":
        api = `http://localhost:9000/approved-reviews`;
        break;
      case "Status: Pending":
        api = `http://localhost:9000/pending-reviews`;
        break;
      case "Status: Rejected":
        api = `http://localhost:9000/rejected-reviews`;
        break;
    }

    try {
      const response = await axios.get(api);
      if (response.status === 200) {
        setReviews(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No Reviews Found");
      } else {
        console.error("Error fetching Reviews:", error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    if (sortOption) {
      fetchSortedReviews();
    } else {
      fetchReviews();
    }
  }, [sortOption]);

  return (
    <div className='product'>
      <Sidebar activeId={16} />
      <div className="brand-content">
        <div className="brand-header">
          <h2>REVIEW LIST</h2>
          <select class="sort-dropdown" onChange={handleSortChange}>
            <option>All Reviews </option>
            <option>Status: Approved</option>
            <option>Status: Pending</option>
            <option>Status: Rejected</option>
          </select>
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
              <th>Status</th>
              <th>Customer Name</th>
              <th>Product Name | varient</th>
              <th>Order ID</th>
              <th>Rating</th>
              <th className='description'>Review</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.map((review) => (
              <tr key={review.ratingId}>
                <td>{review.ratingId}</td>
                <td style={{ color: review.status == 1 ? "#FFA500" : review.status == 2 ? "green" : "red" }}>
                  {review.status == 1 ? "Pending" : review.status == 2 ? "Approved" : "Rejected"}
                </td>
                <td>{review.customer ? `${review.customer.customerName}` : 'N/A'}</td>
                <td>{review.product ? `${review.product.name} | ${review.product.variantName}` : 'N/A'}</td>
                <td>{review.invoice ? `${review.invoice.invoicePrefix}${review.invoice.invoiceNum}` : ''}</td>
                <td style={{ fontSize: "18px" }}>{renderStars(review.rating)}</td>
                <td className='description'>{review.review}</td>
                <td className="action-buttons">
                  {review.status === 1 && ( // Pending: show Approve & Reject
                    <>
                      <FcApproval
                        className="approved-icon"
                        title="Approve"
                        onClick={() => handleApproved(review.ratingId)}
                      />
                      <MdOutlineCancel
                        className="rejected-icon"
                        title="Reject"
                        onClick={() => handleRejected(review.ratingId)}
                      />
                    </>
                  )}

                  {review.status === 2 && ( // Approved: show option to move back to Pending or reject
                    <>
                      <LuClock9
                        className="pending-icon"
                        title="Mark as Pending"
                        onClick={() => handlePending(review.ratingId)}
                      />
                      <MdOutlineCancel
                        className="rejected-icon"
                        title="Reject"
                        onClick={() => handleRejected(review.ratingId)}
                      />
                    </>
                  )}

                  {review.status === 3 && ( // Rejected: maybe show approve or mark as pending
                    <>
                      <FcApproval
                        className="approved-icon"
                        title="Approve"
                        onClick={() => handleApproved(review.ratingId)}
                      />
                      <LuClock9
                        className="pending-icon"
                        title="Mark as Pending"
                        onClick={() => handlePending(review.ratingId)}
                      />
                    </>
                  )}

                  <RiDeleteBin5Line
                    className="delete-icon"
                    title="Delete"
                    onClick={() => handleDelete(review.ratingId)}
                  />
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {paginatedReviews.length > 0 && (
          <div className="pagination">
            <span>Showing {startIndex + 1} to {Math.min(endIndex, reviews.length)} of {reviews.length} entries</span>
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
  )
}
