import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, KeyRound, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useGame } from '../context/GameContext';

export default function HostLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useGame();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter the Host PIN.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() })
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('host_auth_pin', pin.trim());
        localStorage.setItem('host_auth_pin', pin.trim());
        showToast('Host authenticated successfully!', 'success');
        navigate('/host');
      } else {
        setError(data.message || 'Invalid Host PIN. Access denied.');
        showToast(data.message || 'Incorrect PIN', 'danger');
      }
    } catch (err) {
      setError('Failed to connect to authentication server.');
      showToast('Network error verifying PIN', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-2xl shadow-2xl z-10 flex flex-col items-center text-center animate-scale-up">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6">
          <Shield className="w-8 h-8" />
        </div>

        <div className="text-xs font-black tracking-widest text-amber-400 uppercase mb-1">
          SECURE EVENT PORTAL
        </div>
        <h1 className="text-3xl font-black text-slate-100 tracking-tight mb-2">
          HOST LOGIN
        </h1>
        <p className="text-xs text-slate-400 mb-6 max-w-xs">
          Enter the authorized coordinator PIN to access the game controls and live scoring engine.
        </p>

        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs font-bold flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="text-left">
            <label className="block text-xs font-black tracking-wider text-slate-400 uppercase mb-2">
              Enter Host PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="• • • •"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-2xl tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                autoFocus
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1 text-center font-mono">
              (Default demo PIN: 1234)
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>VERIFYING PIN...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>UNLOCK HOST DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-300">
            ← Back to Home
          </Link>
          <Link to="/display" target="_blank" className="text-cyan-400 hover:underline font-semibold">
            Open Display Mode ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
