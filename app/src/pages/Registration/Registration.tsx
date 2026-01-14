import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye } from 'react-icons/fa';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { client } from '../../api/client';
import './Registration.scss';

interface RegisterResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

export default function Registration() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== repeatPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const data = await client<RegisterResponse>('/auth/register', {
                body: {
                    email,
                    username,
                    password
                }
            });

            // 2. Sukces! Wyświetlamy komunikat
            setSuccess('Registration successful! Redirecting...');
            localStorage.setItem('token', data.token);
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.error || 'Registration failed');
        }
    };

    return (
        <AuthLayout title="Sign Up">
            <form className="auth-form" onSubmit={handleRegister}>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                {/* Email */}
                <div className="input-group">
                    <span className="icon"><FaEnvelope /></span>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!!success}
                    />
                </div>

                {/* Nickname */}
                <div className="input-group">
                    <span className="icon"><FaUser /></span>
                    <input
                        type="text"
                        placeholder="Nickname"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={!!success}
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
                        disabled={!!success}
                    />
                </div>

                {/* Repeat Password */}
                <div className="input-group">
                    <span className="icon"><FaEye /></span>
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        disabled={!!success}
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={!!success}>
                    {success ? "Success!" : "Sign Up"}
                </button>

                <div className="auth-footer">
                    Already a user? <Link to="/login" className="link-highlight">Login</Link>
                </div>
            </form>
        </AuthLayout>
    );
}