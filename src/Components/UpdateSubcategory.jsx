import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Select from 'react-select';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Subcategory", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const UpdateSubcategory = () => {
    const { subcategoryId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState();
    const [categoryId, setCategoryId] = useState();
    const [imageFile, setImageFile] = useState(null);
    const [slugTitle, setSlugTitle] = useState('');
    const [existingImage, setExistingImage] = useState('');
    const [oldSlugTitle, setOldSlugTitle] = useState('');
    const [isSlugTitleExist, setIsSlugTitleExist] = useState();
    const [categories, setCategories] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (showDropdown && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [showDropdown]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('slugTitle', slugTitle);
        formData.append('categoryId', categoryId);
        formData.append('priority', priority);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            const response = await axios.patch(
                `http://localhost:9000/update-subcategory/${subcategoryId}`,
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
                    title: 'Updated!',
                    text: 'subcategory data has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/subcategory');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while updating the subcategory.');
        }
    };

    const fetchSubcategory = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/subcategory/${subcategoryId}`);
            if (response.status === 200) {
                const subcategoryData = response.data;
                setName(subcategoryData.name || '');
                setDescription(subcategoryData.description || '');
                setSlugTitle(subcategoryData.slug_title || '');
                setOldSlugTitle(subcategoryData.slug_title || '');
                setPriority(subcategoryData.priority);
                setCategoryId(subcategoryData.category?.id);
                const imageSrc = imageMap[subcategoryData.image_url] || `http://localhost:9000/uploads/${subcategoryData.image_url}`;
                setExistingImage(imageSrc);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while fetching subcategory details.");
        }
    };

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
        if (subcategoryId) {
            const loadSubcategoryAndCategories = async () => {
                await fetchSubcategory();
                await fetchCategories();
            };
            loadSubcategoryAndCategories();
        }
    }, [subcategoryId]);
    

    const handleNameChange = async (e) => {
        setName(e.target.value);
        const slugTitle = e.target.value
            .toLowerCase()
            .replace(/[\s\(\)\[\]\{\}]+/g, '-')  // Replace all whitespaces & brackets with '-'


        setSlugTitle(slugTitle);

        if (slugTitle !== oldSlugTitle) {
            try {
                const response = await axios.get(`http://localhost:9000/check-subcategory-slug-title?slugTitle=${slugTitle}`)

                if (response.status == 200) {
                    if (response.data == true) {
                        setIsSlugTitleExist(response.data);
                    } else {
                        setIsSlugTitleExist(response.data);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleSlugTitleChange = async (e) => {
        setSlugTitle(e.target.value);
        if (slugTitle !== oldSlugTitle) {
            try {
                const response = await axios.get(`http://localhost:9000/check-subcategory-slug-title?slugTitle=${e.target.value}`)

                if (response.status == 200) {
                    if (response.data == true) {
                        setIsSlugTitleExist(response.data);
                    } else {
                        setIsSlugTitleExist(response.data);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleSelect = (cat) => {
        setSelectedCategory(cat);
        setShowDropdown(false);
        setCategoryId(cat.id);
        console.log(cat.id)
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

    
    return (
        <div className='update-brand'>
            <Sidebar activeId={3} />
            <div className="update-brand-container">
                <h2>+ Update Subcategory</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e)}
                                required
                                placeholder="Subcategory Name"
                            />
                        </div>

                        <div className="custom-dropdown">
                            <label>Select Category <span className="required">*</span></label>
                            <div
                                className="dropdown-header"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <span>{selectedCategory ? selectedCategory.name : 'Select Category'}</span>
                                <span className="arrow">{showDropdown ? '▲' : '▼'}</span>
                            </div>
                            {showDropdown && (
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
                                                    onClick={() => handleSelect(cat)}
                                                >
                                                    {cat.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Slug Title <span className="required">*</span></label>
                            <input
                                type="text"
                                value={slugTitle}
                                onChange={(e) => handleSlugTitleChange(e)}
                                required
                                placeholder="Subcategory Slug Title"
                            />
                        </div>
                        {isSlugTitleExist == true && <p className="error">Slug title already exist!</p>}
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Subcategory Description"
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority <span className="required">*</span></label>
                            <input
                                type="number"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                required
                                placeholder="Subcategory Priority"
                            />
                        </div>
                        <div className="form-group">
                            <label>Image</label>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            <small>Select Size: (250px X 150px)</small>
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="preview" className="image-preview" />
                            ) : existingImage ? (
                                <img src={existingImage} alt="existing" className="image-preview" />
                            ) : null}
                        </div>
                        <div className="button-group">
                            <button type="submit" className="update-btn">Update</button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
