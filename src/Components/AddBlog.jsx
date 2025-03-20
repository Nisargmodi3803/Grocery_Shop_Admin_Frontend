import './AddBrand.css'
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { parseISO, format, isValid } from 'date-fns';

const importAll = (r) => {
    let images = {};
    r.keys().forEach((item) => {
        images[item.replace("./", "")] = r(item);
    });
    return images;
};

const imageMap = importAll(require.context("../assets/Blog", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const AddBlog = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [slugTitle, setSlugTitle] = useState('');
    const [existingImage, setExistingImage] = useState('');
    const [isSlugTitleExist, setIsSlugTitleExist] = useState();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('slugTitle', slugTitle);
        formData.append('date', date);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            const response = await axios.post(
                `http://localhost:9000/add-blog`,
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
                    text: 'Blog has been added successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/blogs');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while updating the blog.');
        }
    };

    const handleNameChange = async (e) => {
        setTitle(e.target.value);
        const slugTitle = e.target.value
            .toLowerCase()
            .replace(/[\s\(\)\[\]\{\}]+/g, '-')  // Replace all whitespaces & brackets with '-'


        setSlugTitle(slugTitle);

        try {
            const response = await axios.get(`http://localhost:9000/check-blog-slug-title?slugTitle=${slugTitle}`)

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

    };

    const handleSlugTitleChange = async (e) => {
        setSlugTitle(e.target.value);

        try {
            const response = await axios.get(`http://localhost:9000/check-blog-slug-title?slugTitle=${e.target.value}`)

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
        <div className='update-brand'>
            <Sidebar activeId={9} />
            <div className="update-brand-container">
                <h2>+ Add Blog</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => handleNameChange(e)}
                                placeholder='Blog Title'
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug Title <span className="required">*</span></label>
                            <input
                                type="text"
                                value={slugTitle}
                                onChange={(e) => handleSlugTitleChange(e)}
                                placeholder='Blog Slug Title'
                            />
                        </div>
                        {isSlugTitleExist == true && <p className="error">Slug title already exist!</p>}
                        <div className="form-group">
                            <label>Description <span className="required">*</span></label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Blog Description'
                                required
                            />
                        </div>
                        <div className='form-group'>
                        <label>Date <span className="required">*</span></label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                placeholder='Blog Date (DD-MM-YYYY)' 
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Image <span className="required">*</span></label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required />
                            <small>Select Size: (250px X 150px)</small>
                            {imageFile ? (
                                <img src={URL.createObjectURL(imageFile)} alt="preview" className="image-preview" />
                            ) : existingImage ? (
                                <img src={existingImage} alt="existing" className="image-preview" />
                            ) : null}
                        </div>
                        <div className="button-group">
                            <button type="submit" className="update-btn">Add</button>
                            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
