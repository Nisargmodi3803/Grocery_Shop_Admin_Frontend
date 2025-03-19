import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import './Brands.css';
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

const imageMap = importAll(require.context("../assets/Brand", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const totalPages = Math.ceil(brands.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedBrands = brands.slice(startIndex, endIndex);
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

    const fetchBrands = async () => {
        try {
            const response = await axios.get('http://localhost:9000/brand');
            if (response.status === 200) {
                setBrands(response.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("No Brands Found");
            } else {
                console.error(error);
                alert("Something went wrong. Please try again!");
            }
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchResults = async (keyword) => {
        try {
            const response = await axios.get(`http://localhost:9000/search-brand?keyword=${encodeURIComponent(keyword)}`);
            if (response.status === 200) {
                if (response.data.length === 0) {
                    return;
                }
                setBrands(response.data);
                setShowResult(true);
            }
        } catch (error) {
            if (error.response.status === 404) {
                setShowResult(false);
            } else {
                console.error("Error fetching search results:", error);
                alert("Error fetching search results. Please try again later.");
            }
        }
    }

    const handleSearchChange = async (e) => {
        const keyword = e.target.value;
        setSearchTerm(keyword);

        if (keyword.trim() === "") {
            setShowResult(false);
            setSearchTerm("");
            fetchBrands();
            return;
        }

        fetchResults(keyword);
    }

    // Print
    const handlePrint = () => {
        window.print();
    };

    //Copy
    const handleCopy = () => {
        const text = brands.map(b => `${b.id}\t${b.name}\t${b.description}`).join('\n');
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
        autoTable(doc, {
            head: [['Id', 'Name', 'Description']],
            body: brands.map(b => [b.id, b.name, b.description]),
        });
        doc.save('brands.pdf');
    };

    // Excel
    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(brands);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");
        XLSX.writeFile(workbook, "brands.xlsx");
    };

    // CSV
    const handleCSVExport = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["Id,Name,Description", ...brands.map(b => `${b.id},${b.name},${b.description}`)].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "brands.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteBrandAlert = async () => {
        return await Swal.fire({
            title: "Are you sure you want to delete this Brand?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            confirmButtonColor: "green",
            cancelButtonColor: "red",
        });
    };

    const handleDelete = async (id) => {
        const result = await deleteBrandAlert();

        if(result.isConfirmed) {
            try {
                const response = await axios.patch(`http://localhost:9000/delete-brand/${id}`);
                if(response.status === 200) {
                    fetchBrands();
                }
            }catch(error) {
                if(error.response?.status === 400) {
                    console.error(error);
                }else{
                    alert("Something went wrong in deleting the brand. Please try again!");
                    console.error(error);
                }
            }
        }
    }

    return (
        <div className="brands">
            <Sidebar activeId={2} />
            <div className="brand-content">
                <div className="brand-header">
                    <h2>BRAND LIST</h2>
                    <button className="add-brand-btn">
                        Add Brand <span>+</span>
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
                            <th>Name</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBrands.map((brand) => {
                            const imageSrc = imageMap[brand.image_url] || `http://localhost:9000/uploads/${brand.image_url}`;
                            return (
                                <tr key={brand.id}>
                                    <td>
                                        {brand.id}
                                    </td>
                                    <td>
                                        <img src={imageSrc} alt={brand.name} className="brand-image" />
                                    </td>
                                    <td>{brand.name}</td>
                                    <td>{brand.description}</td>
                                    <td className="action-buttons">
                                        <FaPencilAlt
                                            className="edit-icon"
                                            title="Edit"
                                            onClick={() => navigate(`/admin/brands/update-brand/${brand.id}`)}
                                        />


                                        <RiDeleteBin5Line
                                            className="delete-icon"
                                            title="Delete"
                                            onClick={() => handleDelete(brand.id)}
                                        />
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>

                </table>

                {paginatedBrands.length > 0 && (

                    <div className="pagination">
                        <span>Showing {startIndex + 1} to {Math.min(endIndex, brands.length)} of {brands.length} entries</span>

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
    );
};
