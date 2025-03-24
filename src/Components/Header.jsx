import React, { use, useEffect, useState } from "react";
import "./Header.css";
import companyLogo from '../assets/Logo/060622034612bits.png'
import { useNavigate } from "react-router-dom";

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isAuth = sessionStorage.getItem("isAuthenticated");
        if (isAuth==="true") {
            setIsAuthenticated(true);
        }else{
            navigate("/admin/login");
        }
    });


    const handleLogout = () => {
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("username");
        setIsAuthenticated(false);
        navigate("/admin/login");
    }
    

    return (
        <header className="fixed-header">
            <div className="header">
                <div className="header-left">
                    <img
                        src={companyLogo}
                        alt="Company Logo"
                        title="Bits Infotech"
                        className="company-logo"
                        loading="lazy"
                    />
                </div>

                <div className="header-right" onClick={handleLogout}>
                    <button className="power-btn">{isAuthenticated ? "⏻":""}</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
