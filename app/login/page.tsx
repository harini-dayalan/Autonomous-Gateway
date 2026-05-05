'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Save the user login to our live JSON database via API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      setSuccess('User saved to live database. Redirecting...');

      // Store the role for the UI to use
      localStorage.setItem('sentinel_role', selectedRole!);

      // Redirect after a short delay so user can see success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: '#08051A' }}>
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(167,139,250,0.05)' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(243,174,255,0.05)' }}></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 transition-opacity hover:opacity-80">
        <span className="material-symbols-outlined text-violet-300">arrow_back</span>
        <span className="text-sm font-semibold text-violet-300 tracking-wider">Back to Home</span>
      </Link>

      <div className="glass-card rounded-[2rem] p-10 w-full max-w-md relative z-10 border" style={{ borderColor: 'rgba(167,139,250,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        
        {/* STEP 1: ROLE SELECTION */}
        {!selectedRole ? (
          <>
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #cebdff 0%, #a78bfa 100%)' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: '#1a0a4a' }}>fingerprint</span>
            </div>
            
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold mb-2">Gateway Access</h1>
              <p className="text-sm" style={{ color: '#948e9d' }}>Select your identity provider profile to authenticate into the Zero-Trust network.</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setSelectedRole('admin')}
                className="w-full relative group overflow-hidden rounded-xl p-4 flex items-center text-left transition-all duration-300 border bg-[#0f0d14]/70 border-[#494552]/40 hover:border-[#a78bfa]"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-colors" style={{ background: 'rgba(167,139,250,0.1)', color: '#cebdff' }}>
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Security Admin</h3>
                  <p className="text-xs" style={{ color: '#948e9d' }}>Full compliance & kernel access</p>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" style={{ color: '#a78bfa' }}>arrow_forward</span>
              </button>

              <button 
                onClick={() => setSelectedRole('user')}
                className="w-full relative group overflow-hidden rounded-xl p-4 flex items-center text-left transition-all duration-300 border bg-[#0f0d14]/70 border-[#494552]/40 hover:border-[#a78bfa]"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-colors" style={{ background: 'rgba(167,139,250,0.05)', color: '#cac4d4' }}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Standard User</h3>
                  <p className="text-xs" style={{ color: '#948e9d' }}>LLM Gateway & pipeline access</p>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" style={{ color: '#cac4d4' }}>arrow_forward</span>
              </button>
            </div>
            <div className="mt-8 pt-6 border-t flex flex-col items-center justify-center gap-2" style={{ borderColor: 'rgba(167,139,250,0.1)' }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs" style={{ color: '#948e9d' }}>lock</span>
                <span className="text-xs" style={{ color: '#948e9d' }}>Secured by Sentinel Zero-Trust Auth</span>
              </div>
            </div>
          </>
        ) : (
          /* STEP 2: CREDENTIALS ENTRY */
          <>
            <button onClick={() => setSelectedRole(null)} className="absolute top-6 left-6 text-[#948e9d] hover:text-white transition-colors flex items-center text-xs font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined mr-1" style={{ fontSize: 16 }}>arrow_back</span>
              Back
            </button>

            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg mt-4" style={{ background: selectedRole === 'admin' ? 'linear-gradient(135deg, #cebdff 0%, #a78bfa 100%)' : 'rgba(167,139,250,0.1)', color: selectedRole === 'admin' ? '#1a0a4a' : '#cebdff' }}>
              <span className="material-symbols-outlined text-3xl">{selectedRole === 'admin' ? 'admin_panel_settings' : 'person'}</span>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2 capitalize">{selectedRole} Login</h1>
              <p className="text-sm" style={{ color: '#948e9d' }}>Enter your corporate credentials. These will be logged to the active database.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs text-center font-semibold">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-xs text-center font-semibold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                  {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#948e9d' }}>Corporate Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#a78bfa', fontSize: 18 }}>mail</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@enterprise.com"
                    className="w-full bg-[#0f0d14] border border-[#494552] rounded-xl py-3 pl-11 pr-4 text-sm text-[#e6e0ea] focus:outline-none focus:border-[#a78bfa] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#948e9d' }}>Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#a78bfa', fontSize: 18 }}>key</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0f0d14] border border-[#494552] rounded-xl py-3 pl-11 pr-4 text-sm text-[#e6e0ea] focus:outline-none focus:border-[#a78bfa] transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-4"
                style={{ 
                  background: loading ? 'rgba(167,139,250,0.5)' : '#a78bfa', 
                  color: '#1a0a4a' 
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#1a0a4a] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Authenticate & Connect
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
