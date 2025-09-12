import React from "react";
import { NavLink } from "react-router-dom";
import { CiMenuBurger } from "react-icons/ci";

const MobileNavigation = ({ navLinks, handleLinkClick, handlemenu, isVisible }) => {
    if (!isVisible) return null;

    const styles = {
        mobileNavbar: {
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 70,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(139, 92, 246, 0.2)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            zIndex: 1030,
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
        },
        mobileNavLink: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 12px",
            borderRadius: 12,
            textDecoration: "none",
            color: "#666",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            minWidth: 60,
            flex: 1,
        },
        mobileNavLinkActive: {
            color: "#8b5cf6",
            background: "rgba(139, 92, 246, 0.1)",
            transform: "translateY(-2px)",
        },
        mobileNavMenuBtn: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 12px",
            borderRadius: 12,
            border: "none",
            background: "transparent",
            color: "#8b5cf6",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            minWidth: 60,
            flex: 1,
        },
        mobileNavIcon: {
            fontSize: 20,
            marginBottom: 2,
        },
        mobileNavText: {
            fontSize: 10,
            fontWeight: "600",
            textAlign: "center",
            lineHeight: 1,
        }
    };

    return (
        <div style={styles.mobileNavbar}>
            {navLinks.slice(0, 4).map((link, index) => (
                <NavLink 
                    key={index}
                    to={link.path}
                    style={({ isActive }) => ({
                        ...styles.mobileNavLink,
                        ...(isActive ? styles.mobileNavLinkActive : {})
                    })}
                    onClick={handleLinkClick}
                >
                    <div style={styles.mobileNavIcon}>{link.icon}</div>
                    <span style={styles.mobileNavText}>{link.label}</span>
                </NavLink>
            ))}
            <button 
                style={styles.mobileNavMenuBtn}
                onClick={handlemenu}
            >
                <CiMenuBurger style={styles.mobileNavIcon} />
                <span style={styles.mobileNavText}>Menu</span>
            </button>
        </div>
    );
};

export default MobileNavigation;