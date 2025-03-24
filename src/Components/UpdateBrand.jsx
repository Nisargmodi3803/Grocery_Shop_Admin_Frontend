import './UpdateBrand.css';
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

const imageMap = importAll(require.context("../assets/Brand", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const UpdateBrand = () => {
    const { brandId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [slugTitle, setSlugTitle] = useState('');
    const [existingImage, setExistingImage] = useState('');
    const [oldSlugTitle, setOldSlugTitle] = useState('');
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
        formData.append('slugTitle', slugTitle);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            const response = await axios.patch(
                `http://localhost:9000/update-brand/${brandId}`,
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
                    text: 'Brand data has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/admin/brands');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while updating the brand.');
        }
    };

    const fetchBrand = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/brand-id/${brandId}`);
            if (response.status === 200) {
                const brandData = response.data;
                setName(brandData.name || '');
                setDescription(brandData.description || '');
                setSlugTitle(brandData.slug_title || '');
                setOldSlugTitle(brandData.slug_title || '');
                const imageSrc = imageMap[brandData.image_url] || `http://localhost:9000/uploads/${brandData.image_url}`;
                setExistingImage(imageSrc);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while fetching brand details.");
        }
    };

    useEffect(() => {
        if (brandId) {
            fetchBrand();
        }
    }, [brandId]);

    const handleNameChange = async (e) => {
        setName(e.target.value);
        const slugTitle = e.target.value
            .toLowerCase()
            .replace(/[\s\(\)\[\]\{\}]+/g, '-')  // Replace all whitespaces & brackets with '-'


        setSlugTitle(slugTitle);

        if (slugTitle !== oldSlugTitle) {
            try {
                const response = await axios.get(`http://localhost:9000/check-brand-slug-title?slugTitle=${slugTitle}`)

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
                const response = await axios.get(`http://localhost:9000/check-brand-slug-title?slugTitle=${e.target.value}`)

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

    return (
        <div className='update-brand'>
            <Sidebar activeId={2} />
            <div className="update-brand-container">
                <h2>+ Update Brand</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e)}
                                required
                                placeholder='Brand Title'
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug Title <span className="required">*</span></label>
                            <input
                                type="text"
                                value={slugTitle}
                                onChange={(e) => handleSlugTitleChange(e)}
                                required
                                placeholder='Brand Slug Title'
                            />
                        </div>
                        {isSlugTitleExist == true && <p className="error">Slug title already exist!</p>}
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='Brand Description'
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
    );
};