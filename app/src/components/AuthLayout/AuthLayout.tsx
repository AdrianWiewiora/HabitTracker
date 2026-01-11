import {useMemo, type ReactNode} from 'react';
import './AuthLayout.scss';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {

    const squares = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => {
            const isOrange = i % 3 === 0;
            const size = Math.random() * 40 + 30;
            const top = Math.random() * 100;
            const left = Math.random() * 100;

            return (
                <div
                    key={i}
                    className={`square ${isOrange ? 'orange' : 'green'}`}
                    style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        top: `${top}%`,
                        left: `${left}%`,
                    }}
                />
            );
        });
    }, []);

    return (
        <div className="auth-layout">
            <div className="background-squares">
                {squares}
            </div>

            <div className="auth-content">
                <div className="logo-container">
                    <div className="text-logo">
                        <span className="orange">Habi</span><span className="green">TUA</span>
                    </div>
                </div>

                <div className="auth-card">
                    <h2>{title}</h2>
                    {children}
                </div>
            </div>
        </div>
    );
}