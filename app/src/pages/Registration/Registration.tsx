import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye } from 'react-icons/fa';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { client } from '../../api/client';
import './Registration.scss';

// Typujemy to, co zwraca backend przy rejestracji (token + user)
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

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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

            // Jeśli kod dotarł tutaj, to znaczy, że jest sukces (201 Created)
            // 'client' sam rzuciłby błąd (catch) gdyby było np. 400 lub 500

            localStorage.setItem('token', data.token);
            navigate('/login');

        } catch (err: any) {
            // Nasz client rzuca obiektem błędu z backendu (np. { error: "User exists" })
            console.error(err);
            setError(err.error || 'Registration failed');
        }
    };

    return (
        <AuthLayout title="Sign In">
            <form className="auth-form" onSubmit={handleRegister}>

                {error && <div style={{ color: '#FF1A1A', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

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

                {/* Nickname */}
                <div className="input-group">
                    <span className="icon"><FaUser /></span>
                    <input
                        type="text"
                        placeholder="Nickname"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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

                {/* Repeat Password */}
                <div className="input-group">
                    <span className="icon"><FaEye /></span>
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Sign Up
                </button>

                <div className="auth-footer">
                    Already a user? <Link to="/login" className="link-highlight">Login</Link>
                </div>
            </form>
        </AuthLayout>
    );
}