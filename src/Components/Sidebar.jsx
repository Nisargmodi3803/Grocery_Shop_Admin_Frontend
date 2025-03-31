import React, { useState } from "react";
import "./SideBar.css";
import { FaList } from "react-icons/fa";
import { FaTags } from "react-icons/fa6";
import { BiSolidCategory } from "react-icons/bi";
import { TfiLayoutAccordionList } from "react-icons/tfi";
import { FaToolbox } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { FaUserAlt } from "react-icons/fa";
import { BiSolidCoupon } from "react-icons/bi";
import { FaPenToSquare } from "react-icons/fa6";
import { MdOutlinePriceChange } from "react-icons/md";
import { FaGift } from "react-icons/fa6";
import { FaMobileAlt } from "react-icons/fa";
import { FaTruck } from "react-icons/fa";
import { HiSpeakerphone } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";
import { TbArrowsSort } from "react-icons/tb";
import { MdDashboard } from "react-icons/md";

const Sidebar = ({ activeId }) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <ul className='side-nav-list'>
        <li className={activeId === 19 && "active"}
          onClick={() => navigate("/admin/dashboard")}>
          <MdDashboard /> Dashboard
        </li>
        <li className={activeId === 1 && "active"}
          onClick={() => navigate("/admin/orders")}>
          <FaList /> Orders
        </li>

        <li className={activeId === 2 && "active"}
          onClick={() => navigate("/admin/brands")}>
          <FaTags /> Brand
        </li>

        <li className={activeId === 3 && "active"}
          onClick={() => navigate("/admin/category")}>
          <BiSolidCategory /> Category
        </li>

        <li className={activeId === 4 && "active"}
          onClick={() => navigate("/admin/subcategory")}>
          <TfiLayoutAccordionList /> Subcategory
        </li>

        <li className={activeId === 5 && "active"}
          onClick={() => navigate("/admin/product")}>
          <FaToolbox /> Product
        </li>

        <li className={activeId === 6 && "active"}
          onClick={() => navigate("/admin/city")}>
          <IoLocationSharp /> City
        </li>

        <li className={activeId === 7 && "active"}
          onClick={() => navigate("/admin/customers")}>
          <FaUserAlt /> Customers
        </li>

        <li className={activeId === 8 && "active"}
          onClick={() => navigate("/admin/coupon")}>
          <BiSolidCoupon /> Coupon Code
        </li>

        <li className={activeId === 9 && "active"}
          onClick={() => navigate("/admin/blogs")}>
          <FaPenToSquare /> Blogs
        </li>

        <li className={activeId === 10 && "active"}
          onClick={() => navigate("/admin/bulk-price")}>
          <MdOutlinePriceChange /> Bulk Price Change
        </li>

        <li className={activeId === 11 && "active"}
          onClick={() => navigate("/admin/point-transaction")}>
          <TbArrowsSort /> Point Transaction
        </li>

        <li className={activeId === 12 && "active"}
          onClick={() => navigate("/admin/contact")}>
          <FaMobileAlt /> Contact
        </li>

        <li className={activeId === 13 && "active"}
          onClick={() => navigate("/admin/delivery-boy")}>
          <FaTruck /> Delivery Boy
        </li>

        <li className={activeId === 14 && "active"}
          onClick={() => navigate("/admin/time-slot")}>
          <IoLocationSharp /> Delivery Time Slot
        </li>

        <li className={activeId === 15 && "active"}
          onClick={() => navigate("/admin/product-inquiry")}>
          <HiSpeakerphone /> Product Inquiry
        </li>

        <li className={activeId === 16 && "active"}
          onClick={() => navigate("/admin/product-review")}>
          <FaStar /> Product Review
        </li>

        <li className={activeId === 17 && "active"}
          onClick={() => navigate("/admin/update-password")}>
          <FaLock /> Update Password
        </li>

        <li className={activeId === 18 && "active"}
          onClick={() => navigate("/admin/new-admin")}>
          <RiAdminFill /> New Admin
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
