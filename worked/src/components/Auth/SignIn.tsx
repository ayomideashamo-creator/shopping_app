import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simple mock authentication
      // In production, this would call a backend API with Supabase Auth
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Mock user ID based on email
      const userId = btoa(email).substring(0, 20);
      login(userId, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-box">
          <h1>The Counter</h1>
          <p className="auth-tagline">Shop Management System</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-demo">
            <p>Demo credentials:</p>
            <code>demo@counter.com / password123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
