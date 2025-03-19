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

const imageMap = importAll(require.context("../assets/Subcategory", false, /\.(png|jpeg|svg|jpg|JPEG)$/));

export const AddSubcategory = () => {
  return (
    <div>AddSubcategory</div>
  )
}
