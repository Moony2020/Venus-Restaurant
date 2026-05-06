import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiPost } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiPost('/auth/login', { email, password });
      setAuth(data?.token || '', data?.user || null);
      if (data?.user?.role === 'admin') navigate('/admin/leads');
      else navigate('/account');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-5xl mb-8">Login</h1>
        {error && <p className="mb-6 border border-red-400/40 bg-red-950/20 px-3 py-2 text-sm text-red-200">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Email Address</p>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com" 
              className="w-full border border-white/10 bg-panel/30 px-4 py-4 text-sm focus:border-gold outline-none transition-colors" 
              required 
            />
          </div>

          <div className="relative">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Password</p>
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full border border-white/10 bg-panel/30 px-4 py-4 text-sm focus:border-gold outline-none transition-colors pr-12" 
              required 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute bottom-4 right-4 text-white/30 hover:text-gold transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            disabled={loading} 
            className="w-full bg-gold py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-black hover:bg-goldSoft transition-all shadow-lg shadow-gold/10 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
          No account? <Link to="/register" className="text-gold hover:text-goldSoft">Register now</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
