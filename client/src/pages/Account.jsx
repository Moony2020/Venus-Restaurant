import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../layout/SiteHeader';
import { apiGet, apiPatch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const statusStyles = {
  pending: 'border-yellow-400/40 text-yellow-300',
  confirmed: 'border-blue-400/40 text-blue-300',
  delivered: 'border-green-400/40 text-green-300',
  preparing: 'border-gold/40 text-gold',
  'on-the-way': 'border-purple-400/40 text-purple-300'
};

const Account = () => {
  const navigate = useNavigate();
  const { user, isCheckingAuth, setAuth, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const [me, myOrders] = await Promise.all([
          apiGet('/auth/me'),
          apiGet('/orders/my')
        ]);
        if (!active) return;
        setAuth('', me);
        setOrders(myOrders);
      } catch {
        if (!active) return;
        setError('Session expired. Please login again.');
        await logout();
        navigate('/login');
      } finally {
        if (active) setLoadingOrders(false);
      }
    }

    if (!isCheckingAuth) load();

    return () => {
      active = false;
    };
  }, [user, isCheckingAuth, navigate, setAuth, logout]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const data = await apiPatch(
        '/auth/change-password',
        { currentPassword, newPassword }
      );
      setPasswordSuccess(data?.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError('Could not update password. Please check current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isCheckingAuth || loadingOrders) {
    return (
      <main className="min-h-screen bg-background text-white">
        <SiteHeader />
        <section className="mx-auto max-w-6xl px-6 py-20">Loading account...</section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold">Guest profile</p>
        <h1 className="mt-2 font-display text-5xl sm:text-6xl">Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>

        {error && <p className="mt-4 border border-red-400/40 bg-red-950/20 px-4 py-2 text-sm text-red-200">{error}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="border border-white/15 bg-white/[0.02] p-6 sm:p-7">
            <h2 className="font-display text-4xl">Profil</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/60">Namn</p><p className="border border-white/15 px-4 py-3">{user?.fullName}</p></div>
              <div><p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/60">E-post</p><p className="border border-white/15 px-4 py-3">{user?.email}</p></div>
              <div><p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/60">Beställningar</p><p className="border border-white/15 px-4 py-3">{orders.length}</p></div>
              <div><p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-white/60">Medlem sedan</p><p className="border border-white/15 px-4 py-3">{new Date(user?.createdAt || Date.now()).toISOString().slice(0, 10)}</p></div>
            </div>
            <button onClick={handleLogout} className="mt-6 border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold hover:bg-gold hover:text-black">Logout</button>
          </article>

          <article className="border border-gold/35 bg-white/[0.03] p-6 sm:p-7">
            <h2 className="font-display text-4xl">Snabbval</h2>
            <div className="mt-5 space-y-3">
              <Link to="/order-tracking" className="block border border-white/15 px-4 py-3 text-sm hover:border-gold hover:text-gold">Spåra beställning</Link>
              <Link to="/menu" className="block border border-white/15 px-4 py-3 text-sm hover:border-gold hover:text-gold">Beställ igen</Link>
              <Link to="/checkout" className="block border border-white/15 px-4 py-3 text-sm hover:border-gold hover:text-gold">Boka bord</Link>
            </div>
            <img src="/images/story-interior.png" alt="account ambiance" className="mt-6 h-48 w-full border border-white/10 object-cover" loading="lazy" />
          </article>
        </div>

        <article className="mt-6 border border-white/15 bg-white/[0.02] p-6 sm:p-7">
          <h2 className="font-display text-4xl">Mina beställningar</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[580px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/15 text-[10px] uppercase tracking-[0.16em] text-white/55">
                  <th className="py-3">Order</th>
                  <th className="py-3">Datum</th>
                  <th className="py-3">Totalt</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td className="py-4 text-white/60" colSpan="4">No orders yet.</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b border-white/10 text-sm">
                      <td className="py-4">{order.trackingCode}</td>
                      <td className="py-4">{new Date(order.createdAt).toISOString().slice(0, 10)}</td>
                      <td className="py-4">{Math.round(order.totalAmount)} SEK</td>
                      <td className="py-4"><span className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${statusStyles[order.status] || 'border-white/20 text-white/75'}`}>{order.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="mt-6 border border-gold/30 bg-white/[0.02] p-6 sm:p-7">
          <h2 className="font-display text-4xl">Byt lösenord</h2>
          {passwordError && <p className="mt-4 border border-red-400/40 bg-red-950/20 px-4 py-2 text-sm text-red-200">{passwordError}</p>}
          {passwordSuccess && <p className="mt-4 border border-green-400/40 bg-green-950/20 px-4 py-2 text-sm text-green-200">{passwordSuccess}</p>}
          <form onSubmit={handlePasswordChange} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-white/20 bg-transparent px-4 py-3 pr-12"
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors">
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-white/20 bg-transparent px-4 py-3 pr-12"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative sm:col-span-2">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-white/20 bg-transparent px-4 py-3 pr-12"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              disabled={passwordLoading}
              className="sm:col-span-2 border border-gold bg-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-black disabled:opacity-70"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </article>
      </section>
    </main>
  );
};

export default Account;

