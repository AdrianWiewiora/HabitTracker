import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { client } from '../../api/client';
import { GoogleLogin } from '@react-oauth/google';

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
    const [isLoading, setIsLoading] = useState(false);

    // 1. KLASYCZNE LOGOWANIE
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await client<LoginResponse>('/auth/login', {
                body: { email, password }
            });

            localStorage.setItem('token', data.token);
            window.location.href = '/HabitTracker/';

        } catch (err: any) {
            console.error(err);
            setError(err.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. LOGOWANIE PRZEZ GOOGLE
    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError('');
        setIsLoading(true);

        try {
            const data = await client<LoginResponse>('/auth/google', {
                method: 'POST',
                body: { credential: credentialResponse.credential }
            });

            localStorage.setItem('token', data.token);
            window.location.href = '/HabitTracker/';

        } catch (err: any) {
            console.error(err);
            setError(err.error || 'Google Authentication Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Log In">
            <form className="auth-form" onSubmit={handleLogin}>

                {error && <div className="message error">{error}</div>}

                {/* Email */}
                <div className="input-group">
                    <span className="icon"><FaEnvelope /></span>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
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
                        disabled={isLoading}
                    />
                </div>

                <div className="forgot-password">
                    <Link to="#">Forgot Password?</Link>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Login"}
                </button>

                <div className="divider">OR</div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google login popup closed or failed.')}
                        theme="filled_black"
                        shape="pill"
                        text="continue_with"
                    />
                </div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register" className="link-highlight">Sign Up</Link>
                </div>
            </form>
        </AuthLayout>
    );
}