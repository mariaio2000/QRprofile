import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Sparkles, Shield, Zap, QrCode, User2, Stars, ChevronRight, Quote, LogIn, Check, Globe, Smartphone, Users, Award, Clock, TrendingUp, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';
import ShadowStableQr from './ShadowStableQr';
import HowItWorks from './HowItWorks';

interface LandingPageProps {
  onEnterApp: (user: { email: string; name: string }) => void;
}

const gradient = "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600";
const textGradient = "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent";
const subtleGradient = "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50";

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [username, setUsername] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  
  const placeholderNames = [
    'alex',
    'sarah',
    'mike',
    'emma',
    'david',
    'lisa',
    'james',
    'maria'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholderNames.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClaimUsername = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleExploreFirst = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleAuthenticated = (user: { email: string; name: string }) => {
    onEnterApp(user);
  };

  const Nav = () => (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${gradient} grid place-items-center text-white shadow-lg`}>
            <QrCode className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl text-slate-900">QR Profile</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <LogIn className="h-4 w-4"/>Sign in
          </button>
          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className={`${gradient} text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );

  const Hero = () => (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          {/* Copy */}
          <div>
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Trusted by 10,000+ professionals
              </div>
              
            <h1 className="mt-6 text-5xl/tight sm:text-6xl/tight font-extrabold tracking-tight text-slate-900">
              Your Digital Identity,
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                Reimagined
                </span>
              </h1>
              
            <p className="mt-6 max-w-xl text-lg text-slate-700">
              Transform how you connect. Create a professional QR profile with your face at the center — making every introduction memorable and every follow‑up effortless.
            </p>

            {/* URL + CTA */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleClaimUsername();
              }}
              className="mt-8 flex w-full max-w-xl flex-col sm:flex-row gap-3"
              role="search"
              aria-label="Claim your profile URL"
            >
              <div className="relative flex-1">
                <label htmlFor="handle" className="sr-only">
                  Profile URL handle
                </label>
                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm select-none">
                  qrprofile.com/
                </div>
                      <input
                  id="handle"
                  name="handle"
                        type="text"
                  autoComplete="off"
                  inputMode="text"
                  placeholder={placeholderNames[currentPlaceholder]}
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                  className="w-full rounded-2xl border border-slate-300 bg-white/90 pl-[9.5rem] pr-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                  aria-describedby="handle-help"
                        maxLength={20}
                      />
              </div>
              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-md shadow-indigo-600/20 transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
              >
                Claim Profile
              </button>
            </form>
            <p id="handle-help" className="mt-2 text-sm text-slate-500">
              Tip: Keep it short and memorable.
            </p>

            {/* Social proof strip */}
            <div className="mt-8 flex items-center gap-4 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy-first. You control what's shared.</span>
            </div>
            </div>
            
          {/* Visual */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl"
            >
              {/* QR card */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, -0.5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "reverse"
                }}
                whileHover={{ scale: 1.02 }}
                className="rounded-3xl bg-white p-6 shadow-inner ring-1 ring-slate-200"
              >
                <div className="aspect-square rounded-2xl grid place-items-center border-8 border-slate-800/90 bg-white p-4">
                  <ShadowStableQr 
                    value={`https://qrprofile.com/${username || placeholderNames[currentPlaceholder]}`}
                    size={128}
                    className="w-full h-full"
                  />
                </div>
                <div className="mt-4 text-center text-sm text-slate-600">
                  Scan to preview your profile card
                </div>
              </motion.div>
            </motion.div>

            {/* Background accents */}
            <div className="pointer-events-none absolute -z-10 inset-0 blur-3xl opacity-60">
              <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-indigo-300/40" />
              <div className="absolute -right-6 bottom-0 h-64 w-64 rounded-full bg-violet-300/40" />
            </div>
            </div>
          </div>
        </div>
      </section>
  );



  const Features = () => (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">
            Everything you need to <span className={textGradient}>stand out</span>
            </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Professional features designed to make every connection count. From instant sharing to smart analytics.
            </p>
          </div>
          
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Smartphone className="h-8 w-8"/>,
              title: "One-Tap Sharing",
              desc: "Share your profile instantly with a single scan. No apps, no downloads, no friction.",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: <Users className="h-8 w-8"/>,
              title: "Smart Analytics",
              desc: "Track profile views, connections made, and engagement metrics to optimize your networking.",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: <Globe className="h-8 w-8"/>,
              title: "Custom Domains",
              desc: "Use your own domain or choose from our professional subdomains for maximum credibility.",
              gradient: "from-indigo-500 to-blue-500"
            },
            {
              icon: <Award className="h-8 w-8"/>,
              title: "Professional Templates",
              desc: "Choose from industry-specific templates designed for executives, creatives, and entrepreneurs.",
              gradient: "from-emerald-500 to-teal-500"
            },
            {
              icon: <TrendingUp className="h-8 w-8"/>,
              title: "Lead Generation",
              desc: "Capture leads automatically with built-in contact forms and CRM integrations.",
              gradient: "from-orange-500 to-red-500"
            },
            {
              icon: <Shield className="h-8 w-8"/>,
              title: "Enterprise Security",
              desc: "Bank-level security with SSO, 2FA, and compliance certifications for enterprise use.",
              gradient: "from-slate-500 to-gray-500"
            }
          ].map((feature, i) => (
            <div key={i} className="group relative p-8 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white grid place-items-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );



  const Testimonials = () => (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">
            Trusted by <span className={textGradient}>professionals</span> worldwide
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            See how QR Profile is transforming networking for executives, entrepreneurs, and creatives.
              </p>
            </div>
            
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              name: "Sarah Johnson",
              role: "VP of Marketing, TechCorp",
              quote: "QR Profile has revolutionized how our team networks at conferences. The instant sharing and professional presentation make us stand out.",
              avatar: "SJ"
            },
            {
              name: "Michael Chen",
              role: "Founder, DesignStudio",
              quote: "As a creative professional, I love how QR Profile lets me showcase my work and personality. It's like having a digital portfolio that fits in your pocket.",
              avatar: "MC"
            },
            {
              name: "Priya Patel",
              role: "Sales Director, GlobalTech",
              quote: "The analytics and lead capture features are game-changing. I can track every connection and follow up efficiently. ROI is incredible.",
              avatar: "PP"
            }
          ].map((testimonial, i) => (
            <div key={i} className="relative p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300">
              <Quote className={`h-8 w-8 ${textGradient} mb-6`} />
              <p className="text-slate-700 text-lg leading-relaxed mb-8">{testimonial.quote}</p>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${gradient} text-white grid place-items-center font-bold`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
    </section>
  );

  const CTA = () => (
    <section className={`relative ${gradient} overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-white/10 to-purple-600/0"/>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"/>
      
      <div className="relative mx-auto max-w-7xl px-6 py-24 text-center text-white">
        <h2 className="text-5xl lg:text-6xl font-black tracking-tight mb-6">
          Ready to transform your <span className="text-blue-100">networking?</span>
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
          Join thousands of professionals who are already making every connection count with QR Profile.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
            onClick={handleClaimUsername}
            className="btn bg-white text-slate-900 hover:bg-blue-50 inline-flex items-center gap-3"
          >
            Start Building Your Profile <ArrowRight className="h-5 w-5"/>
          </button>
          <button className="btn-ghost border-white/30 text-white hover:bg-white/10">
            Schedule Demo
            </button>
        </div>
        <p className="text-blue-100 mt-6 text-sm">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>
  );

  const Footer = () => (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-12 w-12 rounded-2xl ${gradient} grid place-items-center text-white shadow-lg`}>
                <QrCode className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl text-white">QR Profile</span>
            </div>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-8">
              The professional way to share your digital identity. Transform every connection into an opportunity.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleClaimUsername}
                className={`${gradient} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300`}
              >
                Get Started Free
              </button>
            </div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-white mb-6">Product</div>
            <ul className="space-y-3 text-slate-400">
              <li><a className="hover:text-white transition-colors" href="#features">Features</a></li>
              <li><a className="hover:text-white transition-colors" href="#pricing">Pricing</a></li>
              <li><a className="hover:text-white transition-colors" href="#testimonials">Testimonials</a></li>
              <li><a className="hover:text-white transition-colors" href="#">API</a></li>
            </ul>
          </div>
          
                <div>
            <div className="text-lg font-bold text-white mb-6">Company</div>
            <ul className="space-y-3 text-slate-400">
              <li><a className="hover:text-white transition-colors" href="#about">About</a></li>
              <li><a className="hover:text-white transition-colors" href="#contact">Contact</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Blog</a></li>
            </ul>
                </div>
              </div>
            </div>
            
      <div className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm">
            © {new Date().getFullYear()} QR Profile. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
        initialMode={authMode}
      />
    </div>
  );
};

export default LandingPage;