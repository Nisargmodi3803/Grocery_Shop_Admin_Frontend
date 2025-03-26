import './PriceChange.css'
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

export const PriceChange = () => {
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

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId, subcategoryId]);

  return (
    <div className='update-brand'>
      <Sidebar activeId={10} />
      <div className="update-brand-container">
        <h2>+ Bulk Price Change</h2>
        <div className='search-filter1'>
          <div className='filter1'>
            <div className="custom-dropdown2">
              <label>Category</label>
              <div
                className="dropdown-header2"
                onClick={() => toggleDropdown('category')}
              >
                <span>{selectedCategory ? selectedCategory.name : 'Select Category'}</span>
                <span className="arrow">{openDropdown === 'category' ? '▲' : '▼'}</span>
              </div>
              {openDropdown === 'category' && (
                <div className="dropdown-list2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dropdown-search2"
                    ref={searchInputRef}
                  />
                  <div className="dropdown-items-container2">
                    {filteredCategories
                      .filter((cat) =>
                        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((cat) => (
                        <div
                          key={cat.id}
                          className={`dropdown-item2 ${categoryId === cat.id ? 'selected' : ''}`}
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
            <div className="custom-dropdown2">
              <label>Subcategory</label>
              <div
                className="dropdown-header2"
                onClick={() => toggleDropdown('subcategory')}
              >
                <span>{selectedSubategory ? selectedSubategory.name : 'Select Subcategory'}</span>
                <span className="arrow">{openDropdown === 'subcategory' ? '▲' : '▼'}</span>
              </div>
              {openDropdown === 'subcategory' && (
                <div className="dropdown-list2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="dropdown-search2"
                    ref={searchInputRef}
                  />
                  <div className="dropdown-items-container2">
                    {filteredSubcategories
                      .filter((sub) =>
                        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((sub) => (
                        <div
                          key={sub.id}
                          className={`dropdown-item2 ${subcategoryId === sub.id ? 'selected' : ''}`}
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
          </div>
        </div>
      </div>
    </div>
  )
}
