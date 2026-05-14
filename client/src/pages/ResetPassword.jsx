import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import SiteHeader from '../layout/SiteHeader';
import { apiPatch } from '../lib/api';

const ResetPassword = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiPatch('/auth/reset-password', { token, newPassword });
      setSuccess(data?.message || 'Password reset successfully. You can now sign in.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 1200);
    } catch {
      setError('Invalid or expired link. Please request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-5xl mb-8">Reset password</h1>

        {error && <p className="mb-6 border border-red-400/40 bg-red-950/20 px-3 py-2 text-sm text-red-200">{error}</p>}
        {success && <p className="mb-6 border border-green-400/40 bg-green-950/20 px-3 py-2 text-sm text-green-200">{success}</p>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="relative">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">New Password</p>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-white/10 bg-panel/30 px-4 py-4 text-sm focus:border-gold outline-none transition-colors pr-12"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute bottom-4 right-4 text-white/30 hover:text-gold transition-colors"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">Confirm Password</p>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-white/10 bg-panel/30 px-4 py-4 text-sm focus:border-gold outline-none transition-colors pr-12"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute bottom-4 right-4 text-white/30 hover:text-gold transition-colors"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gold py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-black hover:bg-goldSoft transition-all shadow-lg shadow-gold/10 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Reset password'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
          <Link to="/forgot-password" className="text-gold hover:text-goldSoft">Request a new link</Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPassword;
