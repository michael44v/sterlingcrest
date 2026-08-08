import React, { useState } from 'react';
import {
  ArrowRight, ShieldCheck, Zap, Globe, Percent, ChevronRight, Lock,
  Send, TrendingUp, Headphones, CheckCircle2, Star, Fingerprint,
  ArrowUpRight, ArrowDownLeft, Menu, X
} from 'lucide-react';

const LandingPage = () => {
  const user = null; // swap in your auth hook when wiring this back up
  const [navOpen, setNavOpen] = useState(false);

  const features = [
    {
      icon: Send,
      title: 'Instant transfers',
      desc: 'Send and receive in seconds, not days — domestic or international, one simple flow.',
    },
    {
      icon: ShieldCheck,
      title: 'Bank-grade security',
      desc: 'AES-256 encryption and live fraud monitoring watch every transaction, quietly, all the time.',
    },
    {
      icon: TrendingUp,
      title: 'Smart insights',
      desc: 'See exactly where your money goes, with spending patterns that update themselves.',
    },
    {
      icon: Headphones,
      title: '24/7 real support',
      desc: 'A real person, not a bot loop, whenever something actually needs a human.',
    },
  ];

  const steps = [
    { n: '01', title: 'Sign up', desc: 'Verify your identity in minutes with just an ID and a selfie.' },
    { n: '02', title: 'Fund your account', desc: 'Link a bank, add a card, or wire funds directly. No minimum to start.' },
    { n: '03', title: 'Transact', desc: 'Pay, transfer, save, or spend with your virtual or physical card.' },
    { n: '04', title: 'Track', desc: 'Watch balances and spending update in real time, down to the second.' },
  ];

  const testimonials = [
    {
      name: 'Amara Okoye',
      role: 'Small business owner',
      img: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote: "Payroll used to eat my Friday afternoon. Now I run it before my coffee's cold and everyone's paid within the hour.",
    },
    {
      name: 'Daniel Kim',
      role: 'Freelance designer',
      img: 'https://randomuser.me/api/portraits/men/32.jpg',
      quote: "Clients pay in three currencies. StarlingCrest is the first account that's never made that feel like a problem.",
    },
    {
      name: 'Priya Ramesh',
      role: 'Operations manager',
      img: 'https://randomuser.me/api/portraits/women/44.jpg',
      quote: 'The spending breakdown caught a duplicate vendor charge our old bank never flagged. It paid for itself in a week.',
    },
  ];

  return (
    <div className="scf-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .scf-page {
          --bg: #FAF7F2;
          --surface: #FFFFFF;
          --surface-alt: #F2EBE0;
          --border: #E8DFD1;
          --text: #241F1A;
          --text-muted: #6F6459;
          --orange: #E85D04;
          --orange-deep: #A93F07;
          --orange-tint: #FCE9D9;
          --orange-tint-2: #FBDFC4;
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }
        .scf-page * { box-sizing: border-box; }
        .scf-display { font-family: 'Fraunces', serif; letter-spacing: -0.01em; }
        .scf-mono { font-family: 'IBM Plex Mono', monospace; }

        .scf-nav {
          position: sticky; top: 0; z-index: 50;
          background: rgba(250,247,242,0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }
        .scf-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 76px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .scf-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); }
        .scf-logo-mark {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(145deg, var(--orange), var(--orange-deep));
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: 'Fraunces', serif; font-weight: 700; font-size: 17px;
          box-shadow: 0 4px 10px -3px rgba(232,93,4,0.5);
        }
        .scf-logo-word { font-weight: 700; font-size: 17px; letter-spacing: -0.01em; }
        .scf-logo-word span { color: var(--orange); }

        .scf-nav-links { display: flex; align-items: center; gap: 32px; }
        .scf-nav-link { color: var(--text-muted); font-size: 14.5px; font-weight: 500; text-decoration: none; transition: color .15s; }
        .scf-nav-link:hover { color: var(--text); }
        .scf-nav-actions { display: flex; align-items: center; gap: 10px; }

        .scf-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 600; font-size: 14.5px; border-radius: 12px;
          border: none; cursor: pointer; text-decoration: none;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          white-space: nowrap;
        }
        .scf-btn-primary {
          background: var(--orange); color: white; padding: 13px 22px;
          box-shadow: 0 8px 20px -8px rgba(232,93,4,0.55);
        }
        .scf-btn-primary:hover { background: var(--orange-deep); transform: translateY(-1px); }
        .scf-btn-ghost {
          background: transparent; color: var(--text); padding: 12px 18px;
          border: 1px solid var(--border);
        }
        .scf-btn-ghost:hover { border-color: #D8CBB6; background: var(--surface); }
        .scf-btn-text { background: transparent; color: var(--text-muted); padding: 10px 4px; }
        .scf-btn-text:hover { color: var(--text); }
        .scf-btn-lg { padding: 16px 28px; font-size: 15.5px; border-radius: 14px; }

        .scf-menu-toggle { display: none; background: none; border: none; color: var(--text); cursor: pointer; }

        /* HERO */
        .scf-hero {
          max-width: 1200px; margin: 0 auto; padding: 76px 24px 60px;
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center;
        }
        .scf-eyebrow {
          display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px;
          background: var(--orange-tint); color: var(--orange-deep); border-radius: 100px;
          font-size: 12.5px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase;
          margin-bottom: 22px;
        }
        .scf-hero h1 {
          font-size: 52px; line-height: 1.08; font-weight: 600; margin: 0 0 22px;
        }
        .scf-hero h1 em { font-style: normal; color: var(--orange); }
        .scf-hero p.lead {
          font-size: 18px; line-height: 1.6; color: var(--text-muted); max-width: 480px; margin: 0 0 32px;
        }
        .scf-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 30px; }
        .scf-trust-line {
          display: flex; flex-wrap: wrap; gap: 18px; font-size: 13px; color: var(--text-muted);
        }
        .scf-trust-line span { display: flex; align-items: center; gap: 6px; }

        /* Hero visual: photo + floating balance card */
        .scf-hero-visual { position: relative; }
        .scf-hero-photo {
          width: 100%; aspect-ratio: 4/4.6; border-radius: 28px; overflow: hidden;
          box-shadow: 0 30px 60px -25px rgba(36,31,26,0.35);
          position: relative;
        }
        .scf-hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .scf-hero-photo::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(232,93,4,0) 55%, rgba(58,32,10,0.35) 100%);
        }

        .scf-balance-card {
          position: absolute; left: -34px; bottom: 34px; width: 250px;
          background: linear-gradient(150deg, #2B2420, #1B1613);
          border-radius: 18px; padding: 20px 22px; color: white;
          box-shadow: 0 25px 45px -18px rgba(0,0,0,0.5);
          z-index: 3;
        }
        .scf-balance-card .label { font-size: 11.5px; color: #C9B8A5; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 6px; }
        .scf-balance-card .amount { font-size: 26px; font-weight: 600; }
        .scf-balance-card .row { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.12); }
        .scf-balance-card .chip { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #C9B8A5; }
        .scf-balance-card .dots { display: flex; gap: 3px; }
        .scf-balance-card .dots span { width: 4px; height: 4px; border-radius: 50%; background: #C9B8A5; display: inline-block; }

        .scf-notif-card {
          position: absolute; right: -20px; top: 44px; width: 214px;
          background: var(--surface); border-radius: 16px; padding: 14px 16px;
          box-shadow: 0 20px 40px -18px rgba(36,31,26,0.3); border: 1px solid var(--border);
          display: flex; align-items: center; gap: 10px; z-index: 3;
        }
        .scf-notif-icon {
          width: 34px; height: 34px; border-radius: 10px; background: var(--orange-tint);
          color: var(--orange-deep); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .scf-notif-card .t1 { font-size: 12.5px; font-weight: 600; color: var(--text); }
        .scf-notif-card .t2 { font-size: 12px; color: var(--text-muted); }

        /* Sections shared */
        .scf-section { padding: 88px 24px; }
        .scf-section-inner { max-width: 1200px; margin: 0 auto; }
        .scf-section-head { text-align: center; max-width: 620px; margin: 0 auto 56px; }
        .scf-kicker {
          color: var(--orange-deep); font-weight: 700; font-size: 13px; letter-spacing: 0.04em;
          text-transform: uppercase; margin-bottom: 12px; display: block;
        }
        .scf-section-head h2 { font-size: 36px; font-weight: 600; margin: 0 0 14px; line-height: 1.2; }
        .scf-section-head p { color: var(--text-muted); font-size: 16.5px; line-height: 1.6; margin: 0; }

        .scf-alt-bg { background: var(--surface-alt); }

        /* Features */
        .scf-feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .scf-feature-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
          padding: 28px 24px; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .scf-feature-card:hover {
          transform: translateY(-4px); border-color: #EAC69B;
          box-shadow: 0 20px 34px -20px rgba(232,93,4,0.35);
        }
        .scf-feature-icon {
          width: 44px; height: 44px; border-radius: 12px; background: var(--orange-tint);
          color: var(--orange-deep); display: flex; align-items: center; justify-content: center; margin-bottom: 18px;
        }
        .scf-feature-card h3 { font-size: 17px; font-weight: 700; margin: 0 0 8px; }
        .scf-feature-card p { font-size: 14.5px; color: var(--text-muted); line-height: 1.55; margin: 0; }

        /* How it works */
        .scf-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; position: relative; }
        .scf-step { position: relative; padding: 0 20px; }
        .scf-step:not(:last-child)::after {
          content: ''; position: absolute; top: 21px; right: -10px; width: calc(100% - 22px);
          border-top: 1.5px dashed #DCCFB9;
        }
        .scf-step-num {
          font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 600;
          color: var(--orange); width: 42px; height: 42px; border-radius: 50%;
          background: var(--surface); border: 1.5px solid var(--orange-tint-2);
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px; position: relative; z-index: 1;
        }
        .scf-step h3 { font-size: 16.5px; font-weight: 700; margin: 0 0 8px; }
        .scf-step p { font-size: 14px; color: var(--text-muted); line-height: 1.55; margin: 0; }

        /* Trust & Security */
        .scf-trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .scf-trust-list { display: flex; flex-direction: column; gap: 22px; }
        .scf-trust-item { display: flex; gap: 16px; align-items: flex-start; }
        .scf-trust-item-icon {
          width: 40px; height: 40px; border-radius: 11px; background: var(--orange-tint);
          color: var(--orange-deep); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .scf-trust-item h4 { font-size: 15.5px; font-weight: 700; margin: 0 0 4px; }
        .scf-trust-item p { font-size: 14px; color: var(--text-muted); margin: 0; line-height: 1.55; }

        .scf-security-panel {
          background: linear-gradient(160deg, #241F1A, #171310); border-radius: 24px; padding: 40px;
          color: white; position: relative; overflow: hidden;
        }
        .scf-security-panel::before {
          content: ''; position: absolute; width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(232,93,4,0.35), transparent 70%);
          top: -80px; right: -80px;
        }
        .scf-security-panel .icon-ring {
          width: 60px; height: 60px; border-radius: 16px; background: rgba(232,93,4,0.15);
          border: 1px solid rgba(232,93,4,0.4); display: flex; align-items: center; justify-content: center;
          color: var(--orange); margin-bottom: 22px; position: relative;
        }
        .scf-security-panel h3 { font-size: 22px; font-weight: 600; margin: 0 0 12px; position: relative; }
        .scf-security-panel p { color: #C9BFB3; font-size: 14.5px; line-height: 1.6; margin: 0 0 26px; position: relative; }
        .scf-badge-row { display: flex; flex-wrap: wrap; gap: 10px; position: relative; }
        .scf-badge {
          font-size: 12px; font-weight: 600; padding: 7px 12px; border-radius: 100px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #E8DFD1;
        }

        /* Testimonials */
        .scf-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .scf-testi-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 26px;
        }
        .scf-testi-stars { display: flex; gap: 3px; color: var(--orange); margin-bottom: 16px; }
        .scf-testi-card p.quote { font-size: 15px; line-height: 1.6; color: var(--text); margin: 0 0 22px; }
        .scf-testi-person { display: flex; align-items: center; gap: 12px; }
        .scf-testi-person img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; }
        .scf-testi-person .name { font-size: 14px; font-weight: 700; }
        .scf-testi-person .role { font-size: 12.5px; color: var(--text-muted); }

        /* Dashboard preview */
        .scf-dash-wrap { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 48px; align-items: center; }
        .scf-dash-card {
          background: var(--surface); border-radius: 24px; border: 1px solid var(--border);
          box-shadow: 0 30px 60px -30px rgba(36,31,26,0.3); padding: 26px; position: relative;
        }
        .scf-dash-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
        .scf-dash-top .label { font-size: 12.5px; color: var(--text-muted); margin-bottom: 4px; }
        .scf-dash-top .amount { font-size: 30px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }
        .scf-dash-pill { font-size: 12px; font-weight: 700; color: #2E7D46; background: #E4F3E8; padding: 6px 10px; border-radius: 100px; display: flex; align-items: center; gap: 4px; }
        .scf-dash-chart { display: flex; align-items: flex-end; gap: 6px; height: 70px; margin-bottom: 24px; }
        .scf-dash-chart .bar { flex: 1; border-radius: 5px 5px 2px 2px; background: var(--surface-alt); }
        .scf-dash-chart .bar.hi { background: var(--orange); }
        .scf-dash-tx { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--border); }
        .scf-dash-tx:first-of-type { border-top: none; }
        .scf-dash-tx-left { display: flex; align-items: center; gap: 12px; }
        .scf-dash-tx-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .scf-dash-tx-icon.in { background: #E4F3E8; color: #2E7D46; }
        .scf-dash-tx-icon.out { background: var(--orange-tint); color: var(--orange-deep); }
        .scf-dash-tx-name { font-size: 13.5px; font-weight: 600; }
        .scf-dash-tx-meta { font-size: 12px; color: var(--text-muted); }
        .scf-dash-tx-amt { font-size: 13.5px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }

        /* CTA */
        .scf-cta {
          max-width: 1200px; margin: 0 auto; padding: 0 24px 100px;
        }
        .scf-cta-inner {
          background: linear-gradient(135deg, #E85D04, #C4490A);
          border-radius: 28px; padding: 70px 40px; text-align: center; color: white; position: relative; overflow: hidden;
        }
        .scf-cta-inner::before {
          content: ''; position: absolute; width: 340px; height: 340px; border-radius: 50%;
          background: rgba(255,255,255,0.08); top: -140px; left: -80px;
        }
        .scf-cta-inner h2 { font-size: 36px; font-weight: 600; margin: 0 0 14px; position: relative; }
        .scf-cta-inner p { font-size: 16px; color: rgba(255,255,255,0.85); max-width: 480px; margin: 0 auto 30px; position: relative; }
        .scf-cta-inner .scf-btn-primary { background: white; color: var(--orange-deep); box-shadow: 0 10px 24px -10px rgba(0,0,0,0.35); position: relative; }
        .scf-cta-inner .scf-btn-primary:hover { background: #FFF3E9; transform: translateY(-1px); }

        /* Footer */
        .scf-footer { background: #211C18; color: #C9BFB3; padding: 64px 24px 32px; }
        .scf-footer-inner { max-width: 1200px; margin: 0 auto; }
        .scf-footer-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 44px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .scf-footer-brand p { font-size: 13.5px; line-height: 1.6; color: #9C9186; max-width: 260px; margin: 14px 0 0; }
        .scf-footer-col h5 { color: white; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 16px; }
        .scf-footer-col a { display: block; color: #9C9186; text-decoration: none; font-size: 14px; margin-bottom: 11px; transition: color .15s; }
        .scf-footer-col a:hover { color: white; }
        .scf-footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 26px; font-size: 12.5px; color: #877D72; flex-wrap: wrap; gap: 12px; }

        @media (max-width: 920px) {
          .scf-nav-links, .scf-nav-actions .scf-btn-ghost { display: none; }
          .scf-menu-toggle { display: block; }
          .scf-hero { grid-template-columns: 1fr; padding-top: 48px; }
          .scf-hero h1 { font-size: 38px; }
          .scf-hero-visual { max-width: 380px; margin: 40px auto 0; }
          .scf-feature-grid, .scf-steps, .scf-testi-grid { grid-template-columns: 1fr 1fr; }
          .scf-step:nth-child(2)::after { display: none; }
          .scf-trust-grid, .scf-dash-wrap { grid-template-columns: 1fr; }
          .scf-footer-top { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .scf-feature-grid, .scf-steps, .scf-testi-grid, .scf-footer-top { grid-template-columns: 1fr; }
          .scf-step::after { display: none; }
          .scf-section { padding: 64px 20px; }
          .scf-hero { padding: 40px 20px 40px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .scf-feature-card, .scf-btn { transition: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="scf-nav">
        <div className="scf-nav-inner">
          <a href="#" className="scf-logo">
              <img
        src="/logo.png"
        alt="Starling Crest Finance"
        style={{ height: 60, width: 'auto', display: 'block', borderRadius: 8 }}
      />
            
          </a>
          <div className="scf-nav-links">
            <a href="#features" className="scf-nav-link">Personal</a>
            <a href="#how" className="scf-nav-link">How it works</a>
            <a href="#security" className="scf-nav-link">Security</a>
            <a href="#preview" className="scf-nav-link">Dashboard</a>
          </div>
          <div className="scf-nav-actions">
            {user ? (
              <a href="/dashboard" className="scf-btn scf-btn-primary">Go to dashboard <ArrowRight size={16} /></a>
            ) : (
              <>
                <a href="/login" className="scf-btn scf-btn-ghost">Sign in</a>
                <a href="/register" className="scf-btn scf-btn-primary">Open an account</a>
              </>
            )}
          </div>
         

        </div>
      </nav>

      {/* HERO */}
      <section className="scf-hero">
        <div>
          <span className="scf-eyebrow"><Zap size={13} /> Banking that moves with you</span>
          <h1 className="scf-display">Your money, finally <em>easy to trust.</em></h1>
          <p className="lead">
            Real-time transfers, transparent fees, and a dashboard that actually makes sense —
            so you always know exactly where you stand, down to the last transaction.
          </p>
          <div className="scf-hero-ctas">
            <a href="/register" className="scf-btn scf-btn-primary scf-btn-lg">Open an account <ArrowRight size={17} /></a>
            <a href="#how" className="scf-btn scf-btn-ghost scf-btn-lg">See how it works <ChevronRight size={17} /></a>
          </div>
          <div className="scf-trust-line">
            <span><Lock size={14} /> AES-256 encryption</span>
            <span><ShieldCheck size={14} /> FCA-standard security</span>
            <span><Globe size={14} /> Global transfer network</span>
          </div>
        </div>

        <div className="scf-hero-visual">
          <div className="scf-hero-photo">
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
              alt="Person checking their account balance on a phone"
            />
          </div>
          <div className="scf-balance-card">
            <div className="label">Available balance</div>
            <div className="amount scf-mono">$24,180.52</div>
            <div className="row">
              <span className="chip"><ArrowUpRight size={13} /> +$2,450 today</span>
              <span className="dots"><span/><span/><span/></span>
            </div>
          </div>
          <div className="scf-notif-card">
            <div className="scf-notif-icon"><ArrowDownLeft size={17} /></div>
            <div>
              <div className="t1">Transfer received</div>
              <div className="t2">+$2,450.00 · just now</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="scf-section" id="features">
        <div className="scf-section-inner">
          <div className="scf-section-head">
            <span className="scf-kicker">What you get</span>
            <h2 className="scf-display">Everything a modern account should do</h2>
            <p>No fine print gymnastics, no waiting on hold. Just banking that works the way you'd expect it to.</p>
          </div>
          <div className="scf-feature-grid">
            {features.map((f, i) => (
              <div className="scf-feature-card" key={i}>
                <div className="scf-feature-icon"><f.icon size={20} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="scf-section scf-alt-bg" id="how">
        <div className="scf-section-inner">
          <div className="scf-section-head">
            <span className="scf-kicker">Getting started</span>
            <h2 className="scf-display">Four steps, no branch visit</h2>
            <p>Most people are moving money within ten minutes of starting.</p>
          </div>
          <div className="scf-steps">
            {steps.map((s, i) => (
              <div className="scf-step" key={i}>
                <div className="scf-step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & SECURITY */}
      <section className="scf-section" id="security">
        <div className="scf-section-inner">
          <div className="scf-trust-grid">
            <div>
              <span className="scf-kicker">Trust & security</span>
              <h2 className="scf-display" style={{fontSize: '32px', marginBottom: '16px'}}>
                Security you don't have to think about
              </h2>
              <div className="scf-trust-list" style={{marginTop: '28px'}}>
                <div className="scf-trust-item">
                  <div className="scf-trust-item-icon"><Lock size={18} /></div>
                  <div>
                    <h4>End-to-end encryption</h4>
                    <p>Every transaction and message is encrypted with AES-256, both in transit and at rest.</p>
                  </div>
                </div>
                <div className="scf-trust-item">
                  <div className="scf-trust-item-icon"><Fingerprint size={18} /></div>
                  <div>
                    <h4>Continuous fraud monitoring</h4>
                    <p>Unusual activity is flagged and paused automatically, before it ever reaches your balance.</p>
                  </div>
                </div>
                <div className="scf-trust-item">
                  <div className="scf-trust-item-icon"><ShieldCheck size={18} /></div>
                  <div>
                    <h4>Protected deposits</h4>
                    <p>Your funds are held under secure insurance terms, up to institutional limits.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="scf-security-panel">
              <div className="icon-ring"><ShieldCheck size={26} /></div>
              <h3>Built on the same standards banks are audited against</h3>
              <p>
                Two-factor authentication on every login, device-level session control, and
                a security team that reviews every flagged event by hand — not just an algorithm.
              </p>
              <div className="scf-badge-row">
                <span className="scf-badge">FCA-standard</span>
                <span className="scf-badge">AES-256</span>
                <span className="scf-badge">2FA on every login</span>
                <span className="scf-badge">SOC 2 aligned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="scf-section scf-alt-bg">
        <div className="scf-section-inner">
          <div className="scf-section-head">
            <span className="scf-kicker">Trusted by real people</span>
            <h2 className="scf-display">What our customers say</h2>
            <p>Small business owners, freelancers, and teams who moved off their old bank.</p>
          </div>
          <div className="scf-testi-grid">
            {testimonials.map((t, i) => (
              <div className="scf-testi-card" key={i}>
                <div className="scf-testi-stars">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" strokeWidth={0} />)}
                </div>
                <p className="quote">"{t.quote}"</p>
                <div className="scf-testi-person">
                  <img src={t.img} alt={t.name} />
                  <div>
                    <div className="name">{t.name}</div>
                    <div className="role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section className="scf-section" id="preview">
        <div className="scf-section-inner">
          <div className="scf-dash-wrap">
            <div>
              <span className="scf-kicker">Your dashboard</span>
              <h2 className="scf-display" style={{fontSize: '32px', marginBottom: '16px'}}>
                Every balance, one clear view
              </h2>
              <p style={{color: 'var(--text-muted)', fontSize: '15.5px', lineHeight: 1.6, marginBottom: '24px'}}>
                Spending trends, upcoming transfers, and account balances update live —
                no refreshing, no waiting for end-of-day statements.
              </p>
              <a href="/login" className="scf-btn scf-btn-primary">Preview your dashboard <ArrowRight size={16} /></a>
            </div>

            <div className="scf-dash-card">
              <div className="scf-dash-top">
                <div>
                  <div className="label">Total balance</div>
                  <div className="amount">$24,180.52</div>
                </div>
                <span className="scf-dash-pill"><ArrowUpRight size={13} /> 8.2%</span>
              </div>
              <div className="scf-dash-chart">
                {[38,52,44,60,48,70,55,64,58,72,50,66].map((h, i) => (
                  <div key={i} className={`bar${i === 9 ? ' hi' : ''}`} style={{height: `${h}%`}} />
                ))}
              </div>
              <div className="scf-dash-tx">
                <div className="scf-dash-tx-left">
                  <div className="scf-dash-tx-icon in"><ArrowDownLeft size={16} /></div>
                  <div>
                    <div className="scf-dash-tx-name">Client payment</div>
                    <div className="scf-dash-tx-meta">Today, 9:41 AM</div>
                  </div>
                </div>
                <div className="scf-dash-tx-amt" style={{color: '#2E7D46'}}>+$2,450.00</div>
              </div>
              <div className="scf-dash-tx">
                <div className="scf-dash-tx-left">
                  <div className="scf-dash-tx-icon out"><ArrowUpRight size={16} /></div>
                  <div>
                    <div className="scf-dash-tx-name">Studio rent</div>
                    <div className="scf-dash-tx-meta">Yesterday, 4:12 PM</div>
                  </div>
                </div>
                <div className="scf-dash-tx-amt">-$1,200.00</div>
              </div>
              <div className="scf-dash-tx">
                <div className="scf-dash-tx-left">
                  <div className="scf-dash-tx-icon out"><ArrowUpRight size={16} /></div>
                  <div>
                    <div className="scf-dash-tx-name">Software subscriptions</div>
                    <div className="scf-dash-tx-meta">Mon, 11:05 AM</div>
                  </div>
                </div>
                <div className="scf-dash-tx-amt">-$86.40</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="scf-cta">
        <div className="scf-cta-inner">
          <h2 className="scf-display">Take control of your finances today</h2>
          <p>Open an account in minutes — no minimum balance, no hidden monthly fees, cancel anytime.</p>
          <a href="/register" className="scf-btn scf-btn-primary scf-btn-lg">Create free account <ArrowRight size={17} /></a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="scf-footer">
        <div className="scf-footer-inner">
          <div className="scf-footer-top">
            <div className="scf-footer-brand">
              <div className="scf-logo">
                <span className="scf-logo-mark">S</span>
                <span className="scf-logo-word" style={{color: 'white'}}>StarlingCrest <span>Finance</span></span>
              </div>
              <p>Premium digital banking for people and businesses who'd rather not think about their bank.</p>
            </div>
            <div className="scf-footer-col">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#preview">Dashboard</a>
            </div>
            <div className="scf-footer-col">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#security">Security</a>
            </div>
            <div className="scf-footer-col">
              <h5>Contact</h5>
              <a href="mailto:support@starlingcrestfinance.com">support@starlingcrestfinance.com</a>
              <a href="#">Help center</a>
              <a href="#">Status</a>
            </div>
          </div>
          <div className="scf-footer-bottom">
            <span>&copy; {new Date().getFullYear()} StarlingCrest Finance. All rights reserved.</span>
            <span>Deposits protected under secure insurance terms up to institutional limits.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;