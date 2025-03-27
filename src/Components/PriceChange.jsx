import './PriceChange.css'
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export const PriceChange = () => {
  const [products, setProducts] = useState([]);
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
  const [isSearchResultsFound, setIsSearchResultsFound] = useState(true);
  const startIndex = 0;

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
        setSubcategoryId(response.data[0].id);
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
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select Category and Subcategory to search products',
        showConfirmButton: true,
        confirmButtonText: 'OK'
      })
      return;
    }

    try {
      const response = await axios.get(`http://localhost:9000/products-subcategory/${subcategoryId}`);
      if (response.status === 200) {
        setProducts(response.data);
        setIsSearchResultsFound(false);
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
  }, [categoryId]);

  const handleClear = async () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCategoryId(null);
    setSubcategoryId(null);
    setOpenDropdown('');
    setIsSearchResultsFound(true);
    setProducts([]);
  };

  const handleUpdate = (id, field, value) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(
        `http://localhost:9000/bulk-price`,
        products
      );
      if (response.status === 200) {
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Product Price has been Updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/admin/bulk-price');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong while Updating the Product.');
    }
  };

  return (
    <div className='update-brand'>
      <Sidebar activeId={10} />
      <div className="update-brand-container">
        <h2>+ Bulk Price Change</h2>
        <div className='search-filter1'>
          <div className='filter1'>
            <div className="custom-dropdown2">
              <label>Category <span className="required">*</span></label>
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
              <label>Subcategory <span className="required">*</span></label>
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
            <button disabled={isSearchResultsFound} onClick={handleClear}>Clear</button>
          </div>
        </div>
        {
          products.length > 0 && (
            <>
              <div className="brand-header">
                <h3>PRODUCT LIST</h3>
              </div>
              <table className="product-table1">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Product Name</th>
                    <th>Base Price</th>
                    <th>MRP</th>
                    <th>Retailer Price</th>
                    <th>Wholesaler Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <tr key={product.id}>
                        <td>{index + 1}</td>
                        <td style={{ textAlign: "left" }}>
                          {product.name} - {product.variantName}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.basePrice }
                            disabled
                            style={{cursor:"not-allowed",backgroundColor:"#EEF1F5",border:"1px solid #D5DBE4"}}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.mrp}
                            onChange={(e) => handleUpdate(product.id, "mrp", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.discount_amt}
                            onChange={(e) => handleUpdate(product.id, "discount_amt", e.target.value)}
                            
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={product.wholesaler_amt}
                            onChange={(e) => handleUpdate(product.id, "wholesaler_amt", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No data available in table
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="button-group">
                <button type="submit" onClick={handleSubmit} className="update-btn">Update</button>
                <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </>
          )
        }
      </div>
    </div>
  )
}
