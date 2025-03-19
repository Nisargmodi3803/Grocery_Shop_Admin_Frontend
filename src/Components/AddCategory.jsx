import React, { useEffect, useState } from 'react';
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

const imageMap = importAll(require.context("../assets/Category", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const AddCategory = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [priority, setPriority] = useState();
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
        formData.append('name', name);
        formData.append('description', description);
        formData.append('priority', priority);
        formData.append('slugTitle', slugTitle);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            const response = await axios.post(
                `http://localhost:9000/add-category`,
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
                    text: 'Category has been added successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/category');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while updating the category.');
        }
    };

    const handleNameChange = async (e) => {
        setName(e.target.value);
        const slugTitle = e.target.value
            .toLowerCase()
            .replace(/[\s\(\)\[\]\{\}]+/g, '-')  // Replace all whitespaces & brackets with '-'


        setSlugTitle(slugTitle);

        try {
            const response = await axios.get(`http://localhost:9000/check-category-slug-title?slugTitle=${slugTitle}`)

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
            const response = await axios.get(`http://localhost:9000/check-category-slug-title?slugTitle=${e.target.value}`)

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

    return (
        <div className='update-brand'>
            <Sidebar activeId={3} />
            <div className="update-brand-container">
                <h2>+ Add Category</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e)}
                                required
                                placeholder='Category Title'
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug Title <span className="required">*</span></label>
                            <input
                                type="text"
                                value={slugTitle}
                                onChange={(e) => handleSlugTitleChange(e)}
                                required
                                placeholder='Category Slug Title'
                            />
                        </div>
                        {isSlugTitleExist == true && <p className="error">Slug title already exist!</p>}
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Category Description'
                            />
                        </div>
                        <div className="form-group">
                            <label>Priority <span className="required">*</span></label>
                            <input
                                type="number"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                required
                                placeholder='Category Priority'
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
