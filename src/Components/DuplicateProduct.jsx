import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Product", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const DuplicateProduct = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [varientName, setVarientName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState();
    const [brandId, setBrandId] = useState();
    const [subcategoryId, setSubcategoryId] = useState();
    const [shortDescription, setShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [priority, setPriority] = useState(0);
    const [cgst, setCgst] = useState(0);
    const [sgst, setSgst] = useState(0);
    const [status, setStatus] = useState(1);
    const [basePrice, setBasePrice] = useState();
    const [mrp, setMrp] = useState();
    const [billingPrice, setBillingPrice] = useState();
    const [wholesalerPrice, setWholesalerPrice] = useState();
    const [slugTitle, setSlugTitle] = useState('');
    const [existingImage, setExistingImage] = useState('');
    const [isSlugTitleExist, setIsSlugTitleExist] = useState();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [showDropdownBrand, setShowDropdownBrand] = useState(false);
    const [showDropdownCategory, setShowDropdownCategory] = useState(false);
    const [showDropdownSubcategory, setShowDropdownSubcategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubategory, setSelectedSubcategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);
    const { productId } = useParams();

    useEffect(() => {
        if (showDropdownBrand && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showDropdownBrand]);

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

    const handleSelectBrand = (brand) => {
        setSelectedBrand(brand);
        setShowDropdownBrand(false);
        setBrandId(brand.id);
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

    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (brandId && brands.length > 0) {
            const defaultBrand = brands.find(brand => brand.id === brandId);
            setSelectedBrand(defaultBrand);
        }
    }, [brandId, brands]);

    const fetchSubcategories = async () => {
        try {
            const response = await axios.get('http://localhost:9000/subcategories');
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
                console.error("Error fetching Subcategories:", error);
                alert("Something went wrong. Please try again!");
            }
        }
    };

    useEffect(() => {
        fetchSubcategories();
    }, [subcategoryId]);

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

    const fetchBrands = async () => {
        try {
            const response = await axios.get('http://localhost:9000/brand');
            if (response.status === 200) {
                setBrands(response.data);

                if (brandId) {
                    const defaultBrand = response.data.find(brand => brand.id === brandId);
                    setSelectedBrand(defaultBrand);
                }
            }
        } catch (error) {
            if (error.response.status === 404) {
                console.log("No Brands Found");
            } else {
                console.error("Error fetching Brands:", error);
                alert("Something went wrong. Please try again!");
            }
        }
    };

    useEffect(() => {
        fetchBrands();
    }, [brandId]);


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/product/${productId}`);
            if (response.status === 200) {
                const productData = response.data;
                setName(productData.name);
                setVarientName(productData.variantName);
                setCategoryId(productData.cat.id);
                setBrandId(productData.brand.id);
                setSubcategoryId(productData.subcat.id);
                setShortDescription(productData.description);
                setLongDescription(productData.long_description);
                setPriority(productData.priority);
                setCgst(productData.cgst);
                setSgst(productData.sgst);
                setStatus(productData.productIsActive);
                setBasePrice(productData.basePrice);
                setMrp(productData.mrp);
                setBillingPrice(productData.discount_amt);
                setWholesalerPrice(productData.wholesaler_amt);
                setSlugTitle(productData.slug_title);
                const imageSrc = imageMap[productData.image_url] || `http://localhost:9000/uploads/${productData.image_url}`;
                setExistingImage(imageSrc);
                checkSlugAvailability(productData.slug_title);;
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while fetching subcategory details.");
        }
    };

    useEffect(() => {
        if (productId) {
            const load = async () => {
                await fetchProduct();
                await fetchCategories();
                await fetchSubcategories();
                await fetchBrands();
            };
            load();
        }
    }, [productId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('variantName', varientName);
        formData.append('categoryId', categoryId);
        formData.append('brandId', brandId);
        formData.append('subcategoryId', subcategoryId);
        formData.append('description', shortDescription);
        formData.append('longDescription', longDescription);
        formData.append('priority', priority);
        formData.append('cgst', cgst);
        formData.append('sgst', sgst);
        formData.append('status', status);
        formData.append('basePrice', basePrice);
        formData.append('mrp', mrp);
        formData.append('discountPrice', billingPrice);
        formData.append('wholesalePrice', wholesalerPrice);
        formData.append('slugTitle', slugTitle);

        if (imageFile) {
            formData.append('imageFile', imageFile); // if user selected a new image
        } else {
            formData.append('existingImageUrl', existingImage); // reuse the original image URL if no new file is uploaded
        }

        try {
            const response = await axios.post(
                `http://localhost:9000/duplicate-product/${productId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Added!',
                    text: 'A new variant of the product has been added successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/product');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while Adding the Product.');
        }
    };


    const handleNameChange = async (e) => {
        const value = e.target.value;
        setName(value);
        const slug = value
            .toLowerCase()
            .replace(/[\s\(\)\[\]\{\}]+/g, '-');

        setSlugTitle(slug);
        checkSlugAvailability(slug);
    };

    const handleSlugTitleChange = async (e) => {
        const slug = e.target.value.toLowerCase().replace(/[\s\(\)\[\]\{\}]+/g, '-');
        setSlugTitle(slug);
        checkSlugAvailability(slug);
    };

    const checkSlugAvailability = async (slug) => {
        try {
            const response = await axios.get(`http://localhost:9000/check-product-slug-title?slugTitle=${slug}`);
            setIsSlugTitleExist(response.data === true);
        } catch (error) {
            console.log(error);
        }
    };

    const calculateBasePriceFromMRP = (mrp, cgst, sgst) => {
        const totalGstPercent = cgst + sgst;
        const basePrice = mrp / (1 + totalGstPercent / 100);
        return basePrice.toFixed(2);
    }

    const handleMRPChange = (e) => {
        setMrp(e.target.value);
        if (cgst != 0 && sgst != 0) {
            setBasePrice(calculateBasePriceFromMRP(e.target.value, cgst, sgst));
        } else {
            setBasePrice(e.target.value);
        }
    }

    return (
        <div className='update-brand'>
            <Sidebar activeId={5} />
            <div className="update-brand-container">
                <h2>+ Duplicate Product</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e)}
                                required
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                                placeholder='Product Name'
                            />
                        </div>
                        <div className="form-group">
                            <label>Variant Name<span className="required">*</span></label>
                            <input
                                type="text"
                                value={varientName}
                                onChange={(e) => setVarientName(e.target.value)}
                                required
                                placeholder='Product Variant Name'
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug Title <span className="required">*</span></label>
                            <input
                                type="text"
                                value={slugTitle}
                                onChange={(e) => handleSlugTitleChange(e)}
                                required
                                placeholder='Product Slug Title'
                            />
                        </div>
                        {isSlugTitleExist == true && <p className="error">This slug already exists please enter a different slug!</p>}
                        <div className="custom-dropdown">
                            <label>Select Brand <span className="required">*</span></label>
                            <div
                                className="dropdown-header"
                                // onClick={() => setShowDropdownBrand(!showDropdownBrand)}
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            >
                                <span>{selectedBrand ? selectedBrand.name : 'Select Brand'}</span>
                                <span className="arrow">{showDropdownBrand ? '▲' : '▼'}</span>
                            </div>
                            {showDropdownBrand && (
                                <div className="dropdown-list">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="dropdown-search"
                                        ref={searchInputRef}
                                    />
                                    <div className="dropdown-items-container">
                                        {filteredBrands.length > 0 && (
                                            filteredBrands.map((brand) => (
                                                <div
                                                    key={brand.id}
                                                    className={`dropdown-item ${brandId === brand.id ? 'selected' : ''
                                                        }`}
                                                    onClick={() => handleSelectBrand(brand)}
                                                >
                                                    {brand.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="custom-dropdown">
                            <label>Select Category <span className="required">*</span></label>
                            <div
                                className="dropdown-header"
                                // onClick={() => setShowDropdownCategory(!showDropdownCategory)}
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            >
                                <span>{selectedCategory ? selectedCategory.name : 'Select Category'}</span>
                                <span className="arrow">{showDropdownCategory ? '▲' : '▼'}</span>
                            </div>
                            {showDropdownCategory && (
                                <div className="dropdown-list">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="dropdown-search"
                                        ref={searchInputRef}
                                    />
                                    <div className="dropdown-items-container">
                                        {filteredCategories.length > 0 && (
                                            filteredCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className={`dropdown-item ${categoryId === cat.id ? 'selected' : ''
                                                        }`}
                                                    onClick={() => handleSelectCategory(cat)}
                                                >
                                                    {cat.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="custom-dropdown">
                            <label>Select Subcategory <span className="required">*</span></label>
                            <div
                                className="dropdown-header"
                                // onClick={() => setShowDropdownSubcategory(!showDropdownSubcategory)}
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            >
                                <span>{selectedSubategory ? selectedSubategory.name : 'Select Subcategory'}</span>
                                <span className="arrow">{showDropdownSubcategory ? '▲' : '▼'}</span>
                            </div>
                            {showDropdownSubcategory && (
                                <div className="dropdown-list">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="dropdown-search"
                                        ref={searchInputRef}
                                    />
                                    <div className="dropdown-items-container">
                                        {filteredSubcategories.length > 0 && (
                                            filteredSubcategories.map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className={`dropdown-item ${subcategoryId === sub.id ? 'selected' : ''
                                                        }`}
                                                    onClick={() => handleSelectSubcategory(sub)}
                                                >
                                                    {sub.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Short Description</label>
                            <input
                                type="text"
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                placeholder='Product Short Description'
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Long Description</label>
                            <input
                                type="text"
                                value={longDescription}
                                onChange={(e) => setLongDescription(e.target.value)}
                                placeholder='Product Long Description'
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <small>Select Size: (250px X 150px)</small>
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="preview" className="image-preview" />
                            ) : existingImage ? (
                                <img src={existingImage} alt="existing" className="image-preview" />
                            ) : null}
                        </div>
                        <div className="form-group">
                            <label>CGST <span className="required">*</span></label>
                            <input
                                type="number"
                                value={cgst}
                                onChange={(e) => setCgst(e.target.value)}
                                required
                                placeholder='Product CGST'
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>SGST <span className="required">*</span></label>
                            <input
                                type="number"
                                value={sgst}
                                onChange={(e) => setSgst(e.target.value)}
                                required
                                placeholder='Product SGST'
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Base Price <span className="required">*</span></label>
                            <input
                                type="number"
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                required
                                placeholder='Product Base Price'
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>MRP <span className="required">*</span></label>
                            <input
                                type="number"
                                value={mrp}
                                onChange={(e) => handleMRPChange(e)}
                                required
                                placeholder='Product MRP'
                            />
                        </div>
                        <div className="form-group">
                            <label>Retailer Price (Billing Amount) <span className="required">*</span></label>
                            <input
                                type="number"
                                value={billingPrice}
                                onChange={(e) => setBillingPrice(e.target.value)}
                                required
                                placeholder='Product Retailer Price'
                            />
                        </div>
                        <div className="form-group">
                            <label>Wholesaler Price <span className="required">*</span></label>
                            <input
                                type="number"
                                value={wholesalerPrice}
                                onChange={(e) => setWholesalerPrice(e.target.value)}
                                required
                                placeholder='Product Wholesaler Price'
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority <span className="required">*</span></label>
                            <input
                                type="number"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                required
                                placeholder='Product Priority'
                                disabled
                                style={{ backgroundColor: '#ddd', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div className='form-group' style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ marginRight: '10px' }}>Status <span className="required">*</span></label>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="1"
                                        checked={status === "1" || status === 1}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    Buy Now
                                </label>
                            </div>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="2"
                                        checked={status === "2" || status === 2}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    Out of Stock
                                </label>
                            </div>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="3"
                                        checked={status === "3" || status === 3}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    Coming Soon
                                </label>
                            </div>
                            <div style={{ cursor: "pointer" }}>
                                <label style={{ color: "grey", fontWeight: "500" }}>
                                    <input
                                        type="radio"
                                        name="status"
                                        value="4"
                                        checked={status === "4" || status === 4}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    Inquiry Now
                                </label>
                            </div>
                        </div>
                        <div className="button-group">
                            <button type="submit" className="update-btn" disabled={isSlugTitleExist}>Duplicate</button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
