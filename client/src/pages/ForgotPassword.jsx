import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiPost } from '../lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const data = await apiPost('/auth/forgot-password', { email });
      setMessage(data?.message || 'If this email exists, a reset link has been sent.');
      setEmail('');
    } catch {
      setError('Could not process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-5xl mb-3">Forgot password</h1>
        <p className="mb-8 text-sm text-white/60">For customer and admin accounts.</p>

        {message && <p className="mb-6 border border-green-400/40 bg-green-950/20 px-3 py-2 text-sm text-green-200">{message}</p>}
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

          <button
            disabled={loading}
            className="w-full bg-gold py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-black hover:bg-goldSoft transition-all shadow-lg shadow-gold/10 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
          Remembered it? <Link to="/login" className="text-gold hover:text-goldSoft">Back to login</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;
