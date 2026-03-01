import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Campus Connect</h1>
                <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <p className="toggle-auth">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? 'Login' : 'Sign Up'}
                    </span>
                </p>
            </div>

            <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
        }
        .auth-card {
          background: white;
          padding: 2.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h1 { color: #4a5568; margin-bottom: 0.5rem; }
        h2 { color: #718096; font-weight: 400; margin-bottom: 2rem; }
        .form-group { text-align: left; margin-bottom: 1.5rem; }
        label { display: block; color: #4a5568; margin-bottom: 0.5rem; font-size: 0.9rem; }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
        }
        input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        button {
          width: 100%;
          padding: 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover { background: #5a67d8; }
        button:disabled { background: #cbd5e0; cursor: not-allowed; }
        .error-message { color: #e53e3e; margin-top: 1rem; font-size: 0.9rem; }
        .toggle-auth { margin-top: 1.5rem; color: #718096; font-size: 0.9rem; }
        .toggle-auth span { color: #667eea; cursor: pointer; font-weight: 600; }
      `}</style>
        </div>
    );
};

export default AuthPage;
