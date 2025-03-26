import './Product.css'
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { FaPencilAlt } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { HiOutlineDuplicate } from "react-icons/hi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const Product = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(products.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  const maxPageNumbersToShow = 4;
  const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);
  const [showResult, setShowResult] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [showDropdownCategory, setShowDropdownCategory] = useState(false);
  const [showDropdownSubcategory, setShowDropdownSubcategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubategory, setSelectedSubcategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const searchInputRef = useRef(null);
  const [categoryId, setCategoryId] = useState();
  const [subcategoryId, setSubcategoryId] = useState();
  const [openDropdown, setOpenDropdown] = useState('');

  const toggleDropdown = (dropdownType) => {
    setSearchTerm('');
    setOpenDropdown(openDropdown === dropdownType ? '' : dropdownType);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (showDropdownCategory && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showDropdownCategory]);

  useEffect(() => {
    if (showDropdownSubcategory && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showDropdownSubcategory]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setShowDropdownCategory(false);
    setCategoryId(cat.id);
    setSearchTerm('');
  };

  const handleSelectSubcategory = (sub) => {
    setSelectedSubcategory(sub);
    setShowDropdownSubcategory(false);
    setSubcategoryId(sub.id);
    setSearchTerm('');
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const defaultCat = categories.find(cat => cat.id === categoryId);
      setSelectedCategory(defaultCat);
    }
  }, [categoryId, categories]);

  const filteredSubcategories = subcategories.filter((sub) =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (subcategoryId && subcategories.length > 0) {
      const defaultSubcategory = subcategories.find(sub => sub.id === subcategoryId);
      setSelectedSubcategory(defaultSubcategory);
    }
  }, [subcategoryId, subcategories]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:9000/categories');
      if (response.status === 200) {
        setCategories(response.data);

        if (categoryId) {
          const defaultCat = response.data.find(cat => cat.id === categoryId);
          setSelectedCategory(defaultCat);
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Categories Found");
      } else {
        console.error("Error fetching categories:", error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [categoryId]);

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/subcategories-category/${categoryId}`);
      if (response.status === 200) {
        setSubcategories(response.data);

        if (subcategoryId) {
          const defaultSubcategory = response.data.find(sub => sub.id === subcategoryId);
          setSelectedSubcategory(defaultSubcategory);
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        console.log("No Subcategories Found");
      } else {
        console.error("Error fetching subcategories:", error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId, subcategoryId]);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:9000/products');
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No products Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchResults = async (keyword) => {
    try {
      const response = await axios.get(`http://localhost:9000/search-product?keyword=${encodeURIComponent(keyword)}`);
      if (response.status === 200) {
        if (response.data.length === 0) {
          return;
        }
        setProducts(response.data);
        setShowResult(true);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setShowResult(false);
        setProducts([]);
      } else {
        console.error("Error fetching search results:", error);
        alert("Error fetching search results. Please try again later.");
        setProducts([]);
      }
    }
  }

  const handleSearchChange = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === "") {
      setShowResult(false);
      setSearchTerm("");
      fetchProducts();
      return;
    }

    fetchResults(keyword);
  }

  // Print
  const handlePrint = () => {
    let printContent = `
              <h2 style="text-align:center; margin-bottom:20px;">Product List</h2>
              <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
                  <thead>
                      <tr>
                          <th>Id</th>
                          <th>Code</th>
                          <th>Name</th>
                          <th>Variant</th>
                          <th>Brand</th>
                          <th>Subcategory</th>
                          <th>Category</th>
                          <th>Base Price</th>
                          <th>MRP</th>
                          <th>Retailer Price</th>
                          <th>Wholesaler Price</th>
                      </tr>
                  </thead>
                  <tbody>
          `;

    products.forEach((product) => {
      printContent += `
                  <tr>
                      <td>${product.id}</td>
                      <td>${product.referenceCode || ''}</td>
                      <td>${product.name}</td>
                      <td>${product.variantName}</td>
                      <td>${product.brand?.name || ''}</td>
                      <td>${product.subcat?.name || ''}</td>
                      <td>${product.cat?.name || ''}</td>
                      <td>${product.basePrice ? parseFloat(product.basePrice).toFixed(2) : "0.00"}</td>
                      <td>${product.mrp ? parseFloat(product.mrp).toFixed(2) : "0.00"}</td>
                      <td>${product.discount_amt ? parseFloat(product.discount_amt).toFixed(2) : "0.00"}</td>
                      <td>${product.wholesaler_amt ? parseFloat(product.wholesaler_amt).toFixed(2) : "0.00"}</td>
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
                      <title>Product List Print</title>
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



  //Copy
  const handleCopy = () => {
    const text = paginatedProducts.map(p =>
      `${p.id}\t${p.referenceCode || ''}\t${p.name}\t${p.variantName || ''}\t${p.brand?.name || ''}\t${p.subcat?.name || ''}\t${p.cat?.name || ''}\t${p.basePrice || 0}\t${p.mrp || 0}\t${p.discount_amt || 0}\t${p.wholesaler_amt || 0}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Product data has been copied to clipboard.',
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
    const doc = new jsPDF({ orientation: "landscape" });
    const tableColumn = ["Id", "Code", "Name", "Variant", "Brand", "Subcategory", "Category", "Base Price", "MRP", "Retailer Price", "Wholesaler Price"];
    const tableRows = [];

    products.forEach((p) => {
      tableRows.push([
        p.id,
        p.referenceCode || '',
        p.name,
        p.variantName,
        p.brand?.name || '',
        p.subcat?.name || '',
        p.cat?.name || '',
        p.basePrice ? parseFloat(p.basePrice).toFixed(2) : "0.00",
        p.mrp ? parseFloat(p.mrp).toFixed(2) : "0.00",
        p.discount_amt ? parseFloat(p.discount_amt).toFixed(2) : "0.00",
        p.wholesaler_amt ? parseFloat(p.wholesaler_amt).toFixed(2) : "0.00"
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.setFontSize(16);
    doc.text("Product List", 148, 15, { align: "center" });
    doc.save('Products.pdf');
  };




  // Excel
  const handleExcelExport = () => {
    const productData = products.map(p => ({
      Id: p.id,
      Code: p.referenceCode || '',
      Name: p.name,
      Variant: p.variantName,
      Brand: p.brand?.name || '',
      Subcategory: p.subcat?.name || '',
      Category: p.cat?.name || '',
      "Base Price": p.basePrice ? parseFloat(p.basePrice).toFixed(2) : "0.00",
      MRP: p.mrp ? parseFloat(p.mrp).toFixed(2) : "0.00",
      "Retailer Price": p.discount_amt ? parseFloat(p.discount_amt).toFixed(2) : "0.00",
      "Wholesaler Price": p.wholesaler_amt ? parseFloat(p.wholesaler_amt).toFixed(2) : "0.00",
    }));

    const worksheet = XLSX.utils.json_to_sheet(productData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "Products.xlsx");
  };


  // CSV
  const handleCSVExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + ["Id,Code,Name,Variant,Brand,Subcategory,Category,Base Price,MRP,Retailer Price,Wholesaler Price",
        ...products.map(p =>
          `${p.id},${p.referenceCode || ''},${p.name},${p.variantName},${p.brand?.name || ''},${p.subcategory?.name || ''},${p.category?.name || ''},${p.basePrice},${p.mrp},${p.discount_amt},${p.wholesaler_amt}`
        )].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const deleteProductAlert = async () => {
    return await Swal.fire({
      title: "Are you sure you want to delete this Product?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteProductAlert();

    if (result.isConfirmed) {
      try {
        const response = await axios.patch(`http://localhost:9000/delete-product/${id}`);
        if (response.status === 200) {
          fetchProducts();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.error(error);
        } else {
          alert("Something went wrong in deleting the Product. Please try again!");
          console.error(error);
        }
      }
    }
  }

  const handleSearch = async () => {
    if (categoryId === undefined || subcategoryId === undefined) {
      alert("Please select Category and Subcategory to search products");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:9000/products-subcategory/${subcategoryId}`);
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log("No products Found");
      } else {
        console.error(error);
        alert("Something went wrong. Please try again!");
      }
    }
  };

  const handleViewAll = async () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCategoryId(null);
    setSubcategoryId(null);
    setOpenDropdown('');
    fetchProducts();
  };


  return (
    <div className='product'>
      <Sidebar activeId={5} />
      <div className="brand-content">
        <div className='search-filter'>
          <div className='filter'>
            <div className="custom-dropdown1">
              <label>Category</label>
              <div
                className="dropdown-header1"
                onClick={() => toggleDropdown('category')}
              >
                <span>{selectedCategory ? selectedCategory.name : 'Select Category'}</span>
                <span className="arrow">{openDropdown === 'category' ? '▲' : '▼'}</span>
              </div>
              {openDropdown === 'category' && (
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
                    {filteredCategories
                      .filter((cat) =>
                        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((cat) => (
                        <div
                          key={cat.id}
                          className={`dropdown-item1 ${categoryId === cat.id ? 'selected' : ''}`}
                          onClick={() => {
                            handleSelectCategory(cat);
                            setOpenDropdown('');
                          }}
                        >
                          {cat.name}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="custom-dropdown1">
              <label>Subcategory</label>
              <div
                className="dropdown-header1"
                onClick={() => toggleDropdown('subcategory')}
              >
                <span>{selectedSubategory ? selectedSubategory.name : 'Select Subcategory'}</span>
                <span className="arrow">{openDropdown === 'subcategory' ? '▲' : '▼'}</span>
              </div>
              {openDropdown === 'subcategory' && (
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
                    {filteredSubcategories
                      .filter((sub) =>
                        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className={`dropdown-item1 ${subcategoryId === sub.id ? 'selected' : ''}`}
                          onClick={() => {
                            handleSelectSubcategory(sub);
                            setOpenDropdown('');
                          }}
                        >
                          {sub.name}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='buttons'>
            <button onClick={handleSearch}>Search</button>
            <button onClick={handleViewAll}>View All</button>
          </div>
        </div>
        <div className="brand-header">
          <h2>PRODUCT LIST</h2>
          <button className="add-brand-btn"
            onClick={() => navigate("/admin/product/add-product")}>
            Add Product <span>+</span>
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
        <table className="product-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Code</th>
              <th>Name</th>
              <th>Variant</th>
              <th>Brand</th>
              <th>Subcategory</th>
              <th>Category</th>
              <th>Base Price</th>
              <th>MRP</th>
              <th>Retailer Price</th>
              <th>Wholesaler Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.referenceCode}</td>
                  <td>{product.name}</td>
                  <td>{product.variantName}</td>
                  <td>{product.brand?.name || ''}</td>
                  <td>{product.subcat?.name || ''}</td>
                  <td>{product.cat?.name || ''}</td>
                  <td>{product.basePrice ? parseFloat(product.basePrice).toFixed(2) : "0.00"}</td>
                  <td>{product.mrp ? parseFloat(product.mrp).toFixed(2) : "0.00"}</td>
                  <td>{product.discount_amt ? parseFloat(product.discount_amt).toFixed(2) : "0.00"}</td>
                  <td>{product.wholesaler_amt ? parseFloat(product.wholesaler_amt).toFixed(2) : "0.00"}</td>
                  <td className="action-buttons">
                    <FaPencilAlt
                      className="edit-icon"
                      title="Edit"
                      onClick={() => navigate(`/admin/product/update-product/${product.id}`)}
                    />
                    <RiDeleteBin5Line
                      className="delete-icon"
                      title="Delete"
                      onClick={() => handleDelete(product.id)}
                    />
                    <HiOutlineDuplicate
                      className="duplicate-icon"
                      title="Duplicate"
                      onClick={() => navigate(`/admin/product/duplicate-product/${product.id}`)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center' }}>No data available in table</td>
              </tr>
            )}
          </tbody>
        </table>

        {paginatedProducts.length > 0 && (

          <div className="pagination">
            {products.length > 0 ? (
              <>
                <span>Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} entries</span>
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
