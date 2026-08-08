import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, Zap, Globe, Award, Percent, ChevronRight, Lock } from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-stone-900 text-white font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="StarlingCrest Finance"
              className="h-10 w-auto rounded-lg shadow-md border border-stone-800"
            />
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-orange-500 transition-colors">
              StarlingCrest <span className="text-orange-500">Finance</span>
            </span>
          </Link>

          {/* Nav Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-stone-300 hover:text-white font-bold text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-900 overflow-hidden">
        {/* Subtle orange ambient glow in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800/80 border border-stone-700/50 rounded-full text-xs text-orange-400 font-bold tracking-wide uppercase">
            <Award size={14} /> Next-Generation Wealth Management
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            The Secure Way to Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Global Capital</span>
          </h1>

          <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            At StarlingCrest Finance, we provide premium banking services, including international wire transfers, multi-currency savings, high-yield fixed deposits, and secure virtual cards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-base font-extrabold rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-base font-extrabold rounded-2xl shadow-xl shadow-orange-500/25 transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                >
                  Open An Account <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-base font-extrabold rounded-2xl transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                >
                  Sign In to Portal <ChevronRight size={18} />
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 pt-12 text-xs md:text-sm text-stone-500 font-semibold tracking-wider uppercase">
            <span className="flex items-center gap-2"><Lock size={16} className="text-orange-500" /> AES-256 Encryption</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-orange-500" /> FCA Registered Standard</span>
            <span className="flex items-center gap-2"><Globe size={16} className="text-orange-500" /> Global Wire Network</span>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 md:py-28 bg-stone-950 border-t border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Designed for the <span className="text-orange-500">Modern Wealth Holder</span>
            </h2>
            <p className="text-stone-400 max-w-2xl mx-auto">
              StarlingCrest Finance gives you complete flexibility, security, and global reach for your capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl space-y-4 hover:border-orange-500/30 transition-all hover:translate-y-[-4px]">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl w-fit">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold">International Transfers</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Send wire transfers to any country in the world. Our platform guarantees real-time notification alerts, swift bank updates, and complete security.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl space-y-4 hover:border-orange-500/30 transition-all hover:translate-y-[-4px]">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl w-fit">
                <Percent size={24} />
              </div>
              <h3 className="text-xl font-bold">High-Yield Fixed Deposits</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Watch your assets grow with secure tier-gated Fixed Deposits offering rates up to 7% APY. Lock in flexible durations designed for your financial targets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl space-y-4 hover:border-orange-500/30 transition-all hover:translate-y-[-4px]">
              <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl w-fit">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold">Secure Virtual Cards</h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Fund and generate Visa or Mastercard virtual debit cards on demand. Maintain strict controls with custom spending caps and card freezing in one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Call to Action */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-stone-900">
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          <Zap size={48} className="mx-auto text-orange-500" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Ready to Begin Your Financial Upgrade?
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Join thousands of corporate and private clients globally who trust StarlingCrest Finance for high-frequency transfers, savings, and investments.
          </p>
          <div className="pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
              >
                Create Free Account <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 border-t border-stone-800 text-stone-500 text-xs py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="StarlingCrest" className="h-6 w-auto grayscale opacity-50" />
            <span className="font-bold text-stone-400">StarlingCrest Finance</span>
          </div>
          <p className="text-center md:text-right leading-relaxed max-w-md">
            &copy; {new Date().getFullYear()} StarlingCrest Finance. All rights reserved.
            Deposits are protected under secure insurance terms up to institutional limits. Registered Support desk: support@starlingcrestfinance.com.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
