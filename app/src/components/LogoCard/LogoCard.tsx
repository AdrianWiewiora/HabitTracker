import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../Card/Card';
import { FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';
import logo from '@/assets/images/habitua-logo.png';
import './LogoCard.scss';

const LogoCard: React.FC = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Card className="logo-card" onMouseLeave={() => setIsMenuOpen(false)}>

            {/* LOGO (Po lewej) */}
            <div className="logo-wrapper">
                <img src={logo} alt="HabiTUA Logo" />
            </div>

            {/* IKONA USERA (Po prawej) */}
            <div className="user-section">
                <button
                    className="user-icon-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    title="User Menu"
                >
                    <FaUserCircle size={36} />
                </button>

                {/* DROPDOWN */}
                {isMenuOpen && (
                    <div className="user-dropdown">
                        <div className="user-info">
                            <small>Logged as</small>
                            <strong>{user?.username || 'Guest'}</strong>
                        </div>

                        <div className="divider"></div>

                        <button className="menu-item" onClick={() => alert("Settings coming soon")}>
                            <FaCog /> Settings
                        </button>

                        <button className="menu-item logout" onClick={logout}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default LogoCard;