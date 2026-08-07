import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowRight, UserCheck, ShieldCheck, CreditCard } from 'lucide-react';
import GlobeBackground from '../../components/ui/Globebackground';

/* ── Shared sub-components ───────────────────────────────────────────── */
const LogoRow = ({ subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
      <div style={{
        width: 34, height: 34,
        background: 'linear-gradient(135deg, #0d9488, #022c22)',
        borderRadius: 9,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 800, fontSize: 19, color: '#022c22', letterSpacing: '-0.4px' }}>
      SterLingCrest Finance
      </span>
    </div>
    <p style={{ fontSize: 10, color: '#6B7A99', margin: 0, fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
      {subtitle}
    </p>
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
          border: `1.5px solid ${focused ? '#0d9488' : '#cbd5e1'}`,
          borderRadius: 11,
          outline: 'none',
          color: '#022c22',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(13,148,136,0.12)' : 'none',
        }}
      />
    </div>
  );
};

/* ── Register Page ───────────────────────────────────────────────────── */
const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', password: '', confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1);
  const navigate              = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await axios.post('?action=register', formData);
      if (res.data.status === 'success') {
        toast.success('Registration successful. Please verify your email.');
        navigate('/verify-email', { state: { user_id: res.data.data.user_id, email: formData.email } });
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const step1Complete = formData.full_name && formData.email && formData.phone;
  const passwordsMatch = formData.password && formData.confirm_password && formData.password === formData.confirm_password;

  const features = [
    { icon: '⚡', label: 'Instant Verification' },
    { icon: '🔒', label: 'Military-grade Security' },
    { icon: '💳', label: 'Virtual USD Card' },
  ];

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(170deg, #f0fdfa 0%, #f0fdf4 45%, #ccfbf1 100%)',
      fontFamily: '"DM Sans", sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Globe */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GlobeBackground />
      </div>

      {/* Sky fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg, rgba(235,243,251,0.70) 0%, transparent 100%)',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Scrollable content */}
      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '0 20px 40px',
        maxWidth: 430, margin: '0 auto', width: '100%',
      }}>
        <div style={{ height: 54 }} />

        <LogoRow subtitle="Open Your Account" />

        {/* Space for globe */}
        <div style={{ height: 135 }} />

        {/* Feature chips */}
        <div style={{ display: 'flex', gap: 7, marginBottom: 14, overflowX: 'auto', paddingBottom: 3, scrollbarWidth: 'none' }}>
          {features.map(f => (
            <div key={f.label} style={{
              flexShrink: 0,
              background: 'rgba(255,255,255,0.78)',
            border: '1px solid rgba(13,148,136,0.13)',
              borderRadius: 100, padding: '5px 11px',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ fontSize: 13 }}>{f.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#022c22', whiteSpace: 'nowrap' }}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Frosted glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 22,
          border: '1px solid rgba(13,148,136,0.13)',
          padding: '26px 22px 22px',
          boxShadow: '0 20px 60px rgba(2,44,34,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#022c22', margin: '0 0 3px', letterSpacing: '-0.4px' }}>
                Create account
              </h1>
              <p style={{ fontSize: 13, color: '#7A8AA8', margin: 0 }}>
                Join 10,000+ professionals worldwide
              </p>
            </div>
            {/* Step dots */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', paddingTop: 4 }}>
              {[1, 2].map(s => (
                <div key={s} style={{
                  width: s === step ? 18 : 7, height: 7,
                  borderRadius: 100,
                  background: s === step ? '#0d9488' : '#cbd5e1',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <>
                <Field label="Full Name (as per Govt ID)" name="full_name" placeholder="John Doe"
                  value={formData.full_name} onChange={handleChange} />
                <Field label="Email Address" name="email" type="email" placeholder="john@example.com"
                  value={formData.email} onChange={handleChange} />
                <Field label="Phone Number" name="phone" type="tel" placeholder="+1 234 567 8900"
                  value={formData.phone} onChange={handleChange} />

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!step1Complete}
                  style={{
                    width: '100%', padding: '15px', marginTop: 4,
                    background: step1Complete
                      ? 'linear-gradient(135deg, #0d9488 0%, #022c22 100%)'
                      : '#cbd5e1',
                    color: 'white', border: 'none', borderRadius: 13,
                    fontSize: 15, fontWeight: 800,
                    cursor: step1Complete ? 'pointer' : 'default',
                    fontFamily: '"DM Sans", sans-serif',
                    boxShadow: step1Complete ? '0 8px 24px rgba(13,148,136,0.25)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <Field label="Create Password" name="password" type="password" placeholder="Minimum 8 characters"
                  value={formData.password} onChange={handleChange} />
                <Field label="Confirm Password" name="confirm_password" type="password" placeholder="Re-enter password"
                  value={formData.confirm_password} onChange={handleChange} />

                {/* Password match indicator */}
                {formData.confirm_password && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12, marginTop: -4 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: passwordsMatch ? '#2DBE8C' : '#E85858',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: 'white', fontWeight: 800, flexShrink: 0,
                    }}>
                      {passwordsMatch ? '✓' : '✕'}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: passwordsMatch ? '#2DBE8C' : '#E85858' }}>
                      {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}

                {/* Terms */}
                <div style={{
                  display: 'flex', gap: 9, alignItems: 'flex-start',
                  padding: '11px', background: 'rgba(13,148,136,0.04)',
                  borderRadius: 10, border: '1px solid rgba(13,148,136,0.10)',
                  marginBottom: 18,
                }}>
                  <input
                    type="checkbox"
                    required
                    style={{ marginTop: 2, accentColor: '#0d9488', width: 15, height: 15, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 11, color: '#5A6A8A', lineHeight: 1.55 }}>
                    I agree to the{' '}
                    <Link to="/terms" style={{ color: '#0d9488', fontWeight: 700 }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" style={{ color: '#0d9488', fontWeight: 700 }}>Privacy Policy</Link>
                    , and consent to SterLingCrest Finance verifying my identity.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 9 }}>
                  {/* Back */}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: '0 0 46px', padding: '15px 0',
                      background: 'transparent', color: '#022c22',
                      border: '1.5px solid #a7f3d0', borderRadius: 13,
                      fontSize: 17, cursor: 'pointer', fontWeight: 700,
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  >
                    ←
                  </button>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1, padding: '15px',
                      background: loading ? '#6dbaaf' : 'linear-gradient(135deg, #0d9488 0%, #022c22 100%)',
                      color: 'white', border: 'none', borderRadius: 13,
                      fontSize: 15, fontWeight: 800,
                      cursor: loading ? 'default' : 'pointer',
                      boxShadow: '0 8px 24px rgba(13,148,136,0.30)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      fontFamily: '"DM Sans", sans-serif',
                    }}
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: 16, height: 16,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white', borderRadius: '50%',
                          animation: 'nb-spin 0.8s linear infinite',
                        }} />
                        Creating…
                      </>
                    ) : (
                      <>Begin Onboarding <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{ fontSize: 13, color: '#7A8AA8' }}>Already have an account? </span>
          <Link to="/login" style={{ fontSize: 13, fontWeight: 800, color: '#0d9488', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14 }}>
          {['PCI-DSS', 'ISO 27001', 'GDPR Ready'].map(t => (
            <span key={t} style={{ fontSize: 9, fontWeight: 700, color: '#AAB8CF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes nb-spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #AAB8CC; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Register;