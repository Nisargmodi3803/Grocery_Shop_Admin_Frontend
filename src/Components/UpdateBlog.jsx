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


export const UpdateBlog = () => {
    const { blogId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
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
        formData.append('date', date);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        try {
            const response = await axios.patch(
                `http://localhost:9000/update-blog/${blogId}`,
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
                    text: 'Blog data has been updated successfully.',
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

    const fetchBlog = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/blog-id/${blogId}`);
            if (response.status === 200) {
                const blogData = response.data;
                setName(blogData.title || '');
                setDescription(blogData.description || '');
                setSlugTitle(blogData.slug_title || '');
                setDate(blogData.date || '');
                setOldSlugTitle(blogData.slug_title || '');
                const imageSrc = imageMap[blogData.image_url] || `http://localhost:9000/uploads/${blogData.image_url}`;
                setExistingImage(imageSrc);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while fetching blog details.");
        }
    };

    useEffect(() => {
        if (blogId) {
            fetchBlog();
        }
    }, [blogId]);

    const handleNameChange = async (e) => {
        setName(e.target.value);
        const slugTitle = e.target.value
            .toLowerCase()
            .replace(/[\s\(\)\[\]\{\}]+/g, '-')  // Replace all whitespaces & brackets with '-'


        setSlugTitle(slugTitle);

        if (slugTitle !== oldSlugTitle) {
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
        }
    };

    const handleSlugTitleChange = async (e) => {
        setSlugTitle(e.target.value);
        if (slugTitle !== oldSlugTitle) {
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
                <h2>+ Update Blog</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-section">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleNameChange(e)}
                                required
                                placeholder='Blog Title'
                            />
                        </div>
                        <div className="form-group">
                            <label>Slug Title <span className="required">*</span></label>
                            <input
                                type="text"
                                value={slugTitle}
                                onChange={(e) => handleSlugTitleChange(e)}
                                required
                                placeholder='Blog Slug Title'
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
    )
}
