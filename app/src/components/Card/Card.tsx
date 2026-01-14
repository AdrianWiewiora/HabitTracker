import React from 'react';
import './Card.scss';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
    return (
        <div className={`card ${className || ''}`} {...props}>
            {children}
        </div>
    );
};

export default Card;