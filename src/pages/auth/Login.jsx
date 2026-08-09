import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowRight, ShieldCheck, Zap, Globe, ShieldAlert, Mail } from 'lucide-react';
import GlobeBackground from '../../components/ui/Globebackground';

/* ── Shared sub-components ───────────────────────────────────────────── */
const LogoRow = ({ subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <img
        src="/logo.png"
        alt="Starling Crest Finance"
        style={{ height: 60, width: 'auto', display: 'block', borderRadius: 8 }}
      />
      {subtitle && (
        <p style={{ fontSize: 10, color: '#6B7A99', margin: '4px 0 0', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

const Field = ({ label, type = 'text', placeholder, value, onChange, name }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{
        display: 'block', fontSize: 10, fontWeight: 700, color: '#5A6A8A',
        marginBottom: 5, fontFamily: '"DM Sans", sans-serif',
        letterSpacing: '0.07em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '13px 15px',
          fontSize: 14, fontFamily: '"DM Sans", sans-serif',
          background: 'rgba(255,255,255,0.9)',
          border: `1.5px solid ${focused ? '#fe820e' : '#cbd5e1'}`,
          borderRadius: 11,
          outline: 'none',
          color: '#1c1917',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(254,130,14,0.15)' : 'none',
        }}
      />
    </div>
  );
};

const AccountBlockedModal = ({ onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50, padding: 20,
  }}>
    <div style={{
      background: '#fff', borderRadius: 16, padding: '22px 20px',
      maxWidth: 380, width: '100%',
      borderLeft: '5px solid #dc2626',
      boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ShieldAlert size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#1c1917' }}>
            Account Blocked
          </h3>
          <p style={{ margin: 0, fontSize: 13.5, color: '#57534e', lineHeight: 1.5 }}>
            Your Starling Crest Finance account has been blocked for security reasons.
          </p>
          <a href="mailto:support@starlingcrestfinance.com" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 14, fontSize: 13, fontWeight: 700, color: '#fe820e', textDecoration: 'none',
          }}>
            <Mail size={15} /> Contact Support
          </a>
        </div>
      </div>
      <button onClick={onClose} style={{
        marginTop: 18, width: '100%', padding: '10px',
        background: 'transparent', border: '1.5px solid #e7e5e4', borderRadius: 10,
        fontSize: 12, fontWeight: 700, color: '#78716c', cursor: 'pointer',
      }}>
        Close
      </button>
    </div>
  </div>
);

/* ── Login Page ──────────────────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin]           = useState('');
  const [showPinField, setShowPinField] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password, pin);
    setLoading(false);

    if (result.success) {
      toast.success('Login successful');
      navigate('/dashboard');
    } else if (result.status === 'restricted') {
      setShowBlockedModal(true);
    } else if (result.pin_required) {
      setShowPinField(true);
      toast(result.message, { icon: '🔐' });
    } else {
      toast.error(result.message);
      if (result.user_id) {
        navigate('/verify-email', { state: { user_id: result.user_id, email } });
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(170deg, #fff7ed 0%, #fffbeb 45%, #ffedd5 100%)',
      fontFamily: '"DM Sans", sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Google font */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Globe */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GlobeBackground />
      </div>

      {/* Sky fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        background: 'linear-gradient(180deg, rgba(254,243,232,0.65) 0%, transparent 100%)',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Scrollable content */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '0 20px 36px',
        maxWidth: 430, margin: '0 auto', width: '100%',
      }}>
        {/* Status-bar spacer */}
        <div style={{ height: 54 }} />

        {/* Live-network badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(254,130,14,0.10)', border: '1px solid rgba(254,130,14,0.20)',
            borderRadius: 100, padding: '5px 14px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fe820e', boxShadow: '0 0 6px #fe820e' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fe820e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              GBP Banking Network
            </span>
          </div>
        </div>

        <LogoRow subtitle="Institutional Banking" />

        {/* Space for globe to show through */}
        <div style={{ height: 175 }} />

        {/* Frosted glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 22,
          border: '1px solid rgba(254,130,14,0.13)',
          padding: '26px 22px 22px',
          boxShadow: '0 20px 60px rgba(28,25,23,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: '#1c1917', margin: '0 0 3px', letterSpacing: '-0.4px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: '#7A8AA8', margin: '0 0 22px' }}>
            Sign in to Starling Crest Finance
          </p>

          <form onSubmit={handleSubmit}>
            <Field label="Email Address" type="email" name="email" placeholder="name@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
            <Field label="Password" type="password" name="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />

            {showPinField && (
              <Field
                label="Transaction PIN"
                type="password"
                name="pin"
                placeholder="••••"
                value={pin}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(val);
                }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18, marginTop: -4 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 700, color: '#fe820e', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? '#fca5a5' : 'linear-gradient(135deg, #fe820e 0%, #1c1917 100%)',
                color: 'white', border: 'none', borderRadius: 13,
                fontSize: 15, fontWeight: 800,
                cursor: loading ? 'default' : 'pointer',
                letterSpacing: '0.02em',
                boxShadow: '0 8px 24px rgba(254,130,14,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s, transform 0.15s',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 17, height: 17,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'nb-spin 0.8s linear infinite',
                  }} />
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(28,25,23,0.08)' }} />
            <span style={{ fontSize: 10, color: '#AAB4C8', fontWeight: 700, letterSpacing: '0.08em' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(28,25,23,0.08)' }} />
          </div>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '14px',
              background: 'transparent',
              color: '#1c1917', border: '1.5px solid #ffedd5',
              borderRadius: 13, fontSize: 13, fontWeight: 800,
              cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: '"DM Sans", sans-serif',
              transition: 'border-color 0.2s',
            }}>
              Create Bank Account
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 18 }}>
          {['AES-256', 'KYC Verified', 'ISO 27001'].map(t => (
            <span key={t} style={{ fontSize: 9, fontWeight: 700, color: '#99AABF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {showBlockedModal && <AccountBlockedModal onClose={() => setShowBlockedModal(false)} />}

      <style>{`
        @keyframes nb-spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #AAB8CC; }
      `}</style>
    </div>
  );
};

export default Login;
