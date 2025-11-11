import React from 'react';
import Card from '../Card/Card';
import './LogoCard.scss';
import logo from '@/assets/images/habitua-logo.png';

const LogoCard: React.FC = () => {
    return (
        <Card className="logo-card">
            <img src={logo} alt="HabiTUA Logo" />
        </Card>
    );
};

export default LogoCard;
