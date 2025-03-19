import React from "react";
import "./Header.css";
import companyLogo from '../assets/Logo/060622034612bits.png'

const Header = () => {
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

                <div className="header-right">
                    <button className="power-btn">⏻</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
