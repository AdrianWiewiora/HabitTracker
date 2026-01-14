import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { client } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth(); // Wyciągamy funkcję login z kontekstu

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            // Strzał do API
            const data = await client<LoginResponse>('/auth/login', {
                body: {
                    email,
                    password
                }
            });

            // Logujemy w kontekście aplikacji (to zaktualizuje stan 'user' i zapisze token w localStorage)
            login(data.token, data.user);

            // Przekierowanie na Dashboard
            navigate('/');

        } catch (err: any) {
            console.error(err);
            setError(err.error || 'Login failed');
        }
    };

    return (
        <AuthLayout title="Login">
            <form className="auth-form" onSubmit={handleLogin}>

                {error && <div className="error-message">{error}</div>}

                {/* Email */}
                <div className="input-group">
                    <span className="icon"><FaEnvelope /></span>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div className="input-group">
                    <span className="icon"><FaLock /></span>
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Login
                </button>

                <div className="forgot-password">
                    <a href="#">Forgot Password?</a>
                </div>

                {/* Sekcja Social Media (zgodnie z projektem) */}
                <div className="divider">
                    <span>Or</span>
                </div>

                <div className="social-login">
                    <button type="button" className="social-btn google">
                        <FaGoogle /> Google
                    </button>
                    <button type="button" className="social-btn facebook">
                        <FaFacebook /> Facebook
                    </button>
                </div>

                <div className="auth-footer">
                    Don't have account? <Link to="/register" className="link-highlight">Sign up</Link>
                </div>
            </form>
        </AuthLayout>
    );
}