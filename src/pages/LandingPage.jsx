import React, { useState, useEffect } from 'react';
import {
  ArrowRight, ShieldCheck, Zap, Globe, Lock, ChevronRight,
  Phone, Mail, CheckCircle2,
  Menu, X, Home, CreditCard, PiggyBank, Umbrella,
  Heart, User, Key, HelpCircle, MessageSquare
} from 'lucide-react';

const LandingPage = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loginForm, setLoginForm] = useState({ user: '', bid: '' });

  const slides = [
    {
      title: 'Helping small businesses like yours',
      text: 'There are numerous reasons for starting a business, including pursuing a passion, wanting to set your own hours and wanting to make more money. We are here to help you actualize this goal.',
      img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
      link: '#services'
    },
    {
      title: 'Investment',
      text: 'Investment provides comprehensive financial advisory, capital raising, financing and risk management services to corporations.',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      link: '#investing'
    },
    {
      title: 'Global Finance',
      text: 'Our M&A team works in partnership with EU in providing solutions, using a highly analytical approach, providing unique insights.',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      link: '#services'
    }
  ];

  const colorfulFeatures = [
    { title: 'Register', desc: 'Discover the benefits of a new customer.', color: 'feature-color-1', href: '/register' },
    { title: 'Mortgages', desc: 'Find one that’s right for your needs and circumstances.', color: 'feature-color-2', href: '#borrowing' },
    { title: 'Travel Money', desc: 'Check rates and order online now.', color: 'feature-color-3', href: '#services' },
    { title: 'Savings', desc: 'See how we could help your money work harder.', color: 'feature-color-4', href: '#savings' },
  ];

  const blogCards = [
    { img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80', title: 'Up to USD20,000 this tax year', text: 'Make the most of your ISA allowance with a Selection Stocks and Shares ISA.' },
    { img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80', title: 'Book an appointment', text: 'You can now book an appointment online or through email to make booking even simpler.', cta: 'Book Now', cta2: 'Login and book now' },
    { img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80', title: 'Ring-fencing', text: 'We’re changing the way we are structured in the US.' },
  ];

  const portfolioCards = [
    { img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80', title: 'Insurance', text: 'Protect your family and property.' },
    { img: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=400&q=80', title: 'Activate your card', text: 'There are several ways to easily activate your card.' },
    { img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80', title: 'Security centre', text: 'Handy tips designed to help you stay safe online.' },
    { img: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=400&q=80', title: 'Helpful guides', text: 'A range of guides and articles from understanding APRs to saving tips.' },
    { img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80', title: 'Secure Key', text: 'Handy demos to help you activate, reset and use your Secure Key' },
    { img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80', title: 'Voice ID', text: 'Make your voice your password for our incoming app' },
    { img: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c27?auto=format&fit=crop&w=400&q=80', title: 'Card support', text: 'Activate, lost or stolen, and general card support' },
    { img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80', title: 'PPI', text: 'Payment Protection Insurance claim deadlines' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
          --navy: #033d75;
          --navy-light: #054a8c;
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }
        .scf-page * { box-sizing: border-box; margin: 0; padding: 0; }
        .scf-display { font-family: 'Fraunces', serif; letter-spacing: -0.01em; }
        .scf-mono { font-family: 'IBM Plex Mono', monospace; }

        /* TOP BAR */
        .scf-topbar {
          background: var(--navy);
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          padding: 10px 24px;
        }
        .scf-topbar-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }
        .scf-topbar a { color: white; text-decoration: none; margin-left: 18px; font-size: 13px; }
        .scf-topbar a:hover { text-decoration: underline; }

        /* NAV */
        .scf-nav {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 50;
        }
        .scf-nav-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 80px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .scf-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); }
        .scf-logo-mark {
          width: 36px; height: 36px; border-radius: 9px;
          background: linear-gradient(145deg, var(--orange), var(--orange-deep));
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: 'Fraunces', serif; font-weight: 700; font-size: 18px;
        }
        .scf-logo-word { font-weight: 700; font-size: 18px; letter-spacing: -0.01em; }
        .scf-logo-word span { color: var(--orange); }

        .scf-nav-links { display: flex; align-items: center; gap: 6px; }
        .scf-nav-item { position: relative; }
        .scf-nav-link {
          color: var(--text-muted); font-size: 14px; font-weight: 600;
          text-decoration: none; padding: 10px 14px; border-radius: 8px;
          display: flex; align-items: center; gap: 4px; transition: all .15s;
        }
        .scf-nav-link:hover { color: var(--text); background: var(--bg); }
        .scf-nav-link svg { opacity: 0.6; }

        .scf-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 600; font-size: 14px; border-radius: 10px;
          border: none; cursor: pointer; text-decoration: none;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
          white-space: nowrap;
        }
        .scf-btn-primary {
          background: var(--orange); color: white; padding: 11px 20px;
          box-shadow: 0 8px 20px -8px rgba(232,93,4,0.55);
        }
        .scf-btn-primary:hover { background: var(--orange-deep); transform: translateY(-1px); }
        .scf-btn-ghost {
          background: transparent; color: var(--text); padding: 10px 18px;
          border: 1px solid var(--border);
        }
        .scf-btn-ghost:hover { border-color: #D8CBB6; background: var(--surface); }
        .scf-menu-toggle { display: none; background: none; border: none; color: var(--text); cursor: pointer; }

        /* HERO SLIDER + LOGIN */
        .scf-hero-area {
          position: relative;
          background: linear-gradient(135deg, #f8f5f0 0%, #ebe4d8 100%);
          border-bottom: 1px solid var(--border);
        }
        .scf-hero-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px;
          min-height: 560px; align-items: center;
        }
        .scf-slider { position: relative; overflow: hidden; }
        .scf-slider-item {
          display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px; align-items: center;
          opacity: 0; position: absolute; inset: 0; pointer-events: none;
          transition: opacity .6s ease;
        }
        .scf-slider-item.active { opacity: 1; position: relative; pointer-events: auto; }
        .scf-slider-content h2 {
          font-size: 36px; line-height: 1.15; font-weight: 600; margin: 0 0 16px;
          font-family: 'Fraunces', serif;
        }
        .scf-slider-content p {
          font-size: 15.5px; line-height: 1.65; color: var(--text-muted); margin: 0 0 24px;
        }
        .scf-slider-img {
          border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px -20px rgba(36,31,26,0.3);
        }
        .scf-slider-img img { width: 100%; height: 260px; object-fit: cover; display: block; }
        .scf-slider-dots {
          display: flex; gap: 8px; margin-top: 28px;
        }
        .scf-slider-dot {
          width: 10px; height: 10px; border-radius: 50%; border: none;
          background: var(--border); cursor: pointer; transition: background .2s;
        }
        .scf-slider-dot.active { background: var(--orange); }

        .scf-login-box {
          background: var(--surface); border-radius: 20px;
          border: 1px solid var(--border); padding: 32px;
          box-shadow: 0 20px 50px -20px rgba(36,31,26,0.2);
        }
        .scf-login-box h3 {
          font-family: 'Fraunces', serif; font-size: 22px; margin-bottom: 20px; font-weight: 600;
        }
        .scf-input {
          width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border);
          background: var(--bg); font-size: 14px; margin-bottom: 12px; outline: none;
          transition: border-color .15s;
        }
        .scf-input:focus { border-color: var(--orange); }
        .scf-login-options {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12.5px; color: var(--text-muted); margin: 8px 0 18px;
        }
        .scf-login-options label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
        .scf-login-links { font-size: 12.5px; line-height: 2; }
        .scf-login-links a {
          color: var(--orange-deep); text-decoration: none; font-weight: 500;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .scf-login-links a:hover { text-decoration: underline; }

        /* CHOOSE SECTION */
        .scf-choose {
          max-width: 1200px; margin: 0 auto; padding: 70px 24px 20px;
        }
        .scf-section-title {
          text-align: center; margin-bottom: 40px;
        }
        .scf-section-title h2 {
          font-family: 'Fraunces', serif; font-size: 30px; font-weight: 600; margin-bottom: 10px;
        }
        .scf-title-border {
          width: 60px; height: 3px; background: var(--orange); margin: 0 auto; border-radius: 2px;
        }
        .scf-choose-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
        }
        .scf-choose-img { border-radius: 20px; overflow: hidden; }
        .scf-choose-img img { width: 100%; height: 320px; object-fit: cover; display: block; }
        .scf-choose-text h5 {
          font-size: 18px; font-weight: 700; line-height: 1.4; margin-bottom: 16px; color: var(--text);
        }
        .scf-choose-text p {
          font-size: 14.5px; line-height: 1.7; color: var(--text-muted); margin-bottom: 20px;
        }

        /* COLORFUL FEATURES */
        .scf-colorful {
          max-width: 1200px; margin: 0 auto; padding: 40px 24px 60px;
        }
        .scf-colorful-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          border-radius: 16px; overflow: hidden;
        }
        .scf-colorful-card {
          padding: 32px 24px; color: white; text-align: center;
          transition: transform .2s;
        }
        .scf-colorful-card:hover { transform: translateY(-4px); }
        .scf-colorful-card h2 {
          font-family: 'Fraunces', serif; font-size: 20px; margin-bottom: 10px;
        }
        .scf-colorful-card h2 a {
          color: white; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .scf-colorful-card p { font-size: 13.5px; opacity: 0.95; line-height: 1.5; }
        .feature-color-1 { background: linear-gradient(135deg, #2E7D46, #1B5E2E); }
        .feature-color-2 { background: linear-gradient(135deg, var(--navy), #022a50); }
        .feature-color-3 { background: linear-gradient(135deg, #C4490A, var(--orange-deep)); }
        .feature-color-4 { background: linear-gradient(135deg, #5D4037, #3E2723); }

        /* BLOG CARDS */
        .scf-blog {
          max-width: 1200px; margin: 0 auto; padding: 60px 24px;
        }
        .scf-blog-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .scf-blog-card {
          background: var(--surface); border-radius: 16px; overflow: hidden;
          border: 1px solid var(--border); transition: transform .2s, box-shadow .2s;
        }
        .scf-blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -20px rgba(36,31,26,0.25);
        }
        .scf-blog-card figure { margin: 0; overflow: hidden; }
        .scf-blog-card img { width: 100%; height: 200px; object-fit: cover; display: block; transition: transform .4s; }
        .scf-blog-card:hover img { transform: scale(1.05); }
        .scf-blog-content { padding: 22px; }
        .scf-blog-content a {
          font-size: 16px; font-weight: 700; color: var(--text); text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px;
        }
        .scf-blog-content a:hover { color: var(--orange); }
        .scf-blog-content span {
          font-size: 13.5px; color: var(--text-muted); line-height: 1.6; display: block;
        }
        .scf-booking-btns {
          display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;
        }
        .scf-booking-btns a {
          font-size: 12.5px; font-weight: 600; color: var(--orange-deep);
          background: var(--orange-tint); padding: 6px 12px; border-radius: 8px;
        }

        /* PORTFOLIO GRID */
        .scf-portfolio {
          max-width: 1200px; margin: 0 auto; padding: 40px 24px 60px;
        }
        .scf-portfolio-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
        }
        .scf-portfolio-card {
          background: var(--surface); border-radius: 14px; overflow: hidden;
          border: 1px solid var(--border); transition: all .2s;
        }
        .scf-portfolio-card:hover { border-color: #EAC69B; box-shadow: 0 12px 24px -16px rgba(232,93,4,0.3); }
        .scf-portfolio-card img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .scf-portfolio-card .content { padding: 18px; }
        .scf-portfolio-card a {
          font-size: 15px; font-weight: 700; color: var(--text); text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px; margin-bottom: 6px;
        }
        .scf-portfolio-card a:hover { color: var(--orange); }
        .scf-portfolio-card span { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; display: block; }
        .scf-divider {
          max-width: 1200px; margin: 0 auto 40px; height: 1px; background: var(--orange-tint-2);
        }

        /* NEWS / APP PRESENT */
        .scf-news {
          background: var(--surface-alt); padding: 70px 24px;
        }
        .scf-news-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 48px; align-items: center;
        }
        .scf-news-img { border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px -20px rgba(36,31,26,0.25); }
        .scf-news-img img { width: 100%; height: 320px; object-fit: cover; display: block; }
        .scf-news-content {
          background: rgba(3, 61, 117, 0.06); border-radius: 20px; padding: 40px;
        }
        .scf-news-content h2 {
          font-family: 'Fraunces', serif; font-size: 26px; font-weight: 600; margin-bottom: 12px;
        }
        .scf-news-content p { font-size: 15px; color: var(--text-muted); line-height: 1.65; margin-bottom: 20px; }

        /* CTA */
        .scf-cta-banner {
          background: linear-gradient(135deg, var(--navy), #022a50);
          padding: 60px 24px; text-align: center; color: white;
        }
        .scf-cta-banner h2 { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; margin-bottom: 8px; }
        .scf-cta-banner h3 { font-size: 17px; opacity: 0.85; font-weight: 400; margin-bottom: 24px; }
        .scf-cta-banner .scf-btn-primary { background: white; color: var(--navy); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }

        /* CONNECT */
        .scf-connect {
          max-width: 1200px; margin: 0 auto; padding: 70px 24px;
        }
        .scf-connect-inner {
          background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
          padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px;
        }
        .scf-connect h5 {
          font-family: 'Fraunces', serif; font-size: 22px; margin-bottom: 20px;
        }
        .scf-connect-form label {
          display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: var(--text-muted);
        }
        .scf-connect-form input,
        .scf-connect-form textarea {
          width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--border);
          background: var(--bg); font-size: 14px; margin-bottom: 16px; outline: none;
          font-family: inherit;
        }
        .scf-connect-form textarea { resize: vertical; min-height: 100px; }
        .scf-connect-info p { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 12px; }
        .scf-connect-info strong { color: var(--text); }

        /* FOOTER */
        .scf-footer { background: #1a1613; color: #b0a69b; padding: 60px 24px 30px; }
        .scf-footer-inner { max-width: 1200px; margin: 0 auto; }
        .scf-footer-top {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px;
          padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .scf-footer-col h5 {
          color: white; font-size: 13px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.04em; margin-bottom: 18px;
        }
        .scf-footer-col a {
          display: block; color: #9C9186; text-decoration: none; font-size: 13.5px;
          margin-bottom: 10px; transition: color .15s;
        }
        .scf-footer-col a:hover { color: white; }
        .scf-footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 24px; font-size: 12.5px; color: #7a7066; flex-wrap: wrap; gap: 12px;
        }
        .scf-social { display: flex; gap: 10px; }
        .scf-social a {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.08); color: #b0a69b;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; transition: all .15s;
        }
        .scf-social a:hover { background: var(--orange); color: white; }

        @media (max-width: 920px) {
          .scf-nav-links { display: none; }
          .scf-menu-toggle { display: block; }
          .scf-hero-inner { grid-template-columns: 1fr; min-height: auto; padding: 40px 24px; }
          .scf-slider-item { grid-template-columns: 1fr; }
          .scf-slider-img { order: -1; }
          .scf-choose-grid { grid-template-columns: 1fr; }
          .scf-colorful-grid { grid-template-columns: 1fr 1fr; }
          .scf-blog-grid { grid-template-columns: 1fr; }
          .scf-portfolio-grid { grid-template-columns: 1fr 1fr; }
          .scf-news-inner { grid-template-columns: 1fr; }
          .scf-connect-inner { grid-template-columns: 1fr; }
          .scf-footer-top { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .scf-colorful-grid { grid-template-columns: 1fr; }
          .scf-portfolio-grid { grid-template-columns: 1fr; }
          .scf-footer-top { grid-template-columns: 1fr; }
          .scf-hero-inner { padding: 30px 20px; }
        }
      `}</style>

      {/* TOP BAR */}
      <div className="scf-topbar">
        <div className="scf-topbar-inner">
          <span>Need help? Contact Us</span>
          <div>
            <a href="mailto:support@starlingcrestfinance.com"><Mail size={13} /> support@starlingcrestfinance.com</a>
            <a href="#"><Phone size={13} /> Help center</a>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="scf-nav">
        <div className="scf-nav-inner">
          <a href="#" className="scf-logo">
            <span className="scf-logo-mark">S</span>
            <span className="scf-logo-word">StarlingCrest <span>Finance</span></span>
          </a>
          <div className="scf-nav-links">
            <div className="scf-nav-item">
              <a href="#services" className="scf-nav-link">Services <ChevronRight size={14} style={{transform:'rotate(90deg)'}} /></a>
            </div>
            <div className="scf-nav-item">
              <a href="#borrowing" className="scf-nav-link">Borrowing <ChevronRight size={14} style={{transform:'rotate(90deg)'}} /></a>
            </div>
            <div className="scf-nav-item">
              <a href="#investing" className="scf-nav-link">Investing <ChevronRight size={14} style={{transform:'rotate(90deg)'}} /></a>
            </div>
            <div className="scf-nav-item">
              <a href="#insurance" className="scf-nav-link">Insurance <ChevronRight size={14} style={{transform:'rotate(90deg)'}} /></a>
            </div>
            <div className="scf-nav-item">
              <a href="#life" className="scf-nav-link">Life events <ChevronRight size={14} style={{transform:'rotate(90deg)'}} /></a>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <a href="/login" className="scf-btn scf-btn-ghost">Sign in</a>
            <a href="/register" className="scf-btn scf-btn-primary">Open an account</a>
            <button className="scf-menu-toggle" onClick={() => setNavOpen(!navOpen)}>{navOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </nav>

      {/* HERO SLIDER + LOGIN */}
      <div className="scf-hero-area">
        <div className="scf-hero-inner">
          <div className="scf-slider">
            {slides.map((slide, i) => (
              <div key={i} className={`scf-slider-item ${i === slideIndex ? 'active' : ''}`}>
                <div className="scf-slider-content">
                  <h2 className="scf-display">{slide.title}</h2>
                  <p>{slide.text}</p>
                  <a href={slide.link} className="scf-btn scf-btn-primary">Find out more <ArrowRight size={16} /></a>
                </div>
                <div className="scf-slider-img">
                  <img src={slide.img} alt={slide.title} />
                </div>
              </div>
            ))}
            <div className="scf-slider-dots">
              {slides.map((_, i) => (
                <button key={i} className={`scf-slider-dot ${i === slideIndex ? 'active' : ''}`} onClick={() => setSlideIndex(i)} />
              ))}
            </div>
          </div>

          <div className="scf-login-box">
            <h3 className="scf-display">Welcome</h3>
            <form onSubmit={e => e.preventDefault()}>
              <input
                type="text"
                className="scf-input"
                placeholder="Username"
                value={loginForm.user}
                onChange={e => setLoginForm({...loginForm, user: e.target.value})}
              />
              <input
                type="password"
                className="scf-input"
                placeholder="Password"
                value={loginForm.bid}
                onChange={e => setLoginForm({...loginForm, bid: e.target.value})}
              />
              <div className="scf-login-options">
                <label><input type="checkbox" /> Remember me</label>
              </div>
              <button type="submit" className="scf-btn scf-btn-primary" style={{width:'100%', marginBottom:'14px'}}>
                Sign in
              </button>
              <div className="scf-login-links">
                <a href="/forgot">Can't login? Forgot password <ChevronRight size={12} /></a><br/>
                <a href="/register">Not enrolled? Sign up now <ChevronRight size={12} /></a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* CHOOSE WHAT'S RIGHT FOR YOU */}
      <section className="scf-choose">
        <div className="scf-section-title">
          <h2 className="scf-display">Choose what's right for you</h2>
          <div className="scf-title-border" />
        </div>
        <div className="scf-choose-grid">
          <div className="scf-choose-img">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" alt="Home" />
          </div>
          <div className="scf-choose-text">
            <h5>GET 12 MONTHS' COVER FOR THE PRICE OF 10 WHEN YOU BUY HOME INSURANCE*</h5>
            <p>
              We welcome new Home Insurance customers with top quality cover for everything you care about most —
              and 12 months cover for the price of 10 for the first year. You can choose from Buildings or Contents cover,
              or combine the two for total peace of mind.
            </p>
            <p style={{fontSize:'13.5px'}}>
              No additional charges if you opt to pay monthly. We'll aim to get a local tradesperson to you within 2 hours
              to secure your home if it's unsecure or unsafe as a result of damage. US-based contact centres.
            </p>
            <a href="#services" className="scf-btn scf-btn-primary">MORE <ArrowRight size={14} /></a>
          </div>
        </div>
      </section>

      {/* COLORFUL FEATURES */}
      <section className="scf-colorful">
        <div className="scf-colorful-grid">
          {colorfulFeatures.map((f, i) => (
            <div className={`scf-colorful-card ${f.color}`} key={i}>
              <h2><a href={f.href}>{f.title} <ArrowRight size={16} /></a></h2>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG CARDS */}
      <section className="scf-blog">
        <div className="scf-blog-grid">
          {blogCards.map((card, i) => (
            <div className="scf-blog-card" key={i}>
              <figure><img src={card.img} alt={card.title} /></figure>
              <div className="scf-blog-content">
                <a href="#">{card.title} <ArrowRight size={14} /></a>
                <span>{card.text}</span>
                {card.cta && (
                  <div className="scf-booking-btns">
                    <a href="/register">{card.cta} <ArrowRight size={12} /></a>
                    <a href="/login">{card.cta2} <ArrowRight size={12} /></a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section className="scf-portfolio">
        <div className="scf-portfolio-grid">
          {portfolioCards.slice(0,4).map((card, i) => (
            <div className="scf-portfolio-card" key={i}>
              <img src={card.img} alt={card.title} />
              <div className="content">
                <a href="#">{card.title} <ArrowRight size={13} /></a>
                <span>{card.text}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="scf-divider" />
        <div className="scf-portfolio-grid">
          {portfolioCards.slice(4,8).map((card, i) => (
            <div className="scf-portfolio-card" key={i}>
              <img src={card.img} alt={card.title} />
              <div className="content">
                <a href="#">{card.title} <ArrowRight size={13} /></a>
                <span>{card.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEWS & INFORMATION */}
      <section className="scf-news">
        <div className="scf-section-title" style={{marginBottom:'40px'}}>
          <h2 className="scf-display">Your news and information</h2>
          <div className="scf-title-border" />
        </div>
        <div className="scf-news-inner">
          <div className="scf-news-img">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80" alt="Support" />
          </div>
          <div className="scf-news-content">
            <h2 className="scf-display">Account questions? Just ask me.</h2>
            <p>Kindly contact our live support team for immediate assistance with your account, transfers, or any banking needs.</p>
            <a href="#support" className="scf-btn scf-btn-primary">Contact support <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="scf-cta-banner">
        <h2 className="scf-display">Open our most popular savings account</h2>
        <h3>Apply for a new Savings account in minutes.</h3>
        <a href="/register" className="scf-btn scf-btn-primary scf-btn-lg">Apply Now <ArrowRight size={17} /></a>
      </section>

      {/* CONNECT WITH US */}
      <section className="scf-connect">
        <div className="scf-connect-inner">
          <div className="scf-connect-form">
            <h5 className="scf-display">Connect with us</h5>
            <p style={{fontSize:'14px',color:'var(--text-muted)',marginBottom:'20px'}}>
              Listening to what you have to say about our services matters to us.
            </p>
            <form onSubmit={e => e.preventDefault()}>
              <label>Name</label>
              <input type="text" placeholder="Your name" required />
              <label>Email</label>
              <input type="email" placeholder="your@email.com" required />
              <label>Message</label>
              <textarea placeholder="How can we help?" required />
              <button type="submit" className="scf-btn scf-btn-primary">Submit</button>
            </form>
          </div>
          <div className="scf-connect-info">
            <h5 className="scf-display">Get in touch</h5>
            <p>
              Whether you have a question about features, pricing, need a demo, or anything else,
              our team is ready to answer all your questions.
            </p>
            <p><strong>Headquarters:</strong><br/>400 Robert Street North, Saint Paul, MN 55101, USA.</p>
            <p><strong>Email:</strong><br/><a href="mailto:support@starlingcrestfinance.com" style={{color:'var(--orange-deep)'}}>support@starlingcrestfinance.com</a></p>
            <div className="scf-social" style={{marginTop:'20px'}}>
             
              
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="scf-footer">
        <div className="scf-footer-inner">
          <div className="scf-footer-top">
            <div className="scf-footer-col">
              <h5>Help & support</h5>
              <a href="mailto:support@starlingcrestfinance.com">Got a question? We are here to help you</a>
            </div>
            <div className="scf-footer-col">
              <h5>Our performance</h5>
              <a href="/register">View our service dashboard to see how we're doing</a>
            </div>
            <div className="scf-footer-col">
              <h5>About StarlingCrest</h5>
              <a href="#">Careers</a>
              <a href="#">Media</a>
              <a href="#">Investor relations</a>
              <a href="#">Corporate information</a>
            </div>
            <div className="scf-footer-col">
              <h5>Product</h5>
              <a href="#services">Features</a>
              <a href="#how">How it works</a>
              <a href="#preview">Dashboard</a>
              <a href="#security">Security</a>
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
