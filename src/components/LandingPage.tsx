import React, { useState, useEffect } from 'react';
import { ArrowRight, Scan, User, Mail, Sparkles, Shield, Zap, Palette } from 'lucide-react';
import AuthModal from './AuthModal';

interface LandingPageProps {
  onEnterApp: (user: { email: string; name: string }) => void;
}

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/50 via-transparent to-pink-100/50" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-violet-200/50 mb-6">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">No apps required</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Make every connection{' '}
                <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                  unforgettable
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                No more awkward exchanges, lost contacts, or forgotten names. Create a profile with your face at the center of a QR code — and let people remember you the way you want to be remembered.
              </p>
              
              {/* Username Input */}
              <div className="max-w-lg mx-auto mb-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/50">
                  <div className="flex items-center">
                    <div className="flex-1 flex items-center px-4 py-3">
                      <span className="text-gray-500 font-medium mr-2">qrprofile.com/</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        placeholder={placeholderNames[currentPlaceholder]}
                        className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 transition-all duration-300"
                        maxLength={20}
                      />
                    </div>
                    <button
                      onClick={handleClaimUsername}
                      className="group bg-gradient-to-r from-violet-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <span className="hidden sm:inline">Claim</span>
                      <ArrowRight className="w-5 h-5 sm:hidden group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Choose your unique username • Free forever
                </p>
              </div>
              
              <button
                onClick={handleExploreFirst}
                className="group inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm text-violet-600 px-6 py-3 rounded-full font-semibold border border-violet-200/50 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <span>Or explore with demo account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Hero Visual */}
            <div className="relative mt-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 max-w-md mx-auto transform hover:scale-105 transition-all duration-500">
                <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl p-6 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  <div className="relative bg-white rounded-xl p-4">
                    <div className="w-32 h-32 mx-auto bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                      <div className="relative grid grid-cols-8 gap-1 p-2">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 ${
                              Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">
                    {username || placeholderNames[currentPlaceholder]}
                  </h3>
                  <p className="text-gray-600 text-sm">Product Designer</p>
                  <div className="mt-3 text-xs text-gray-500 font-mono bg-gray-50 rounded-lg px-3 py-2">
                    qrprofile.com/{username || placeholderNames[currentPlaceholder]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              It's this easy to stand out
            </h2>
            <p className="text-xl text-gray-600">
              One scan. One click. One real connection.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Show your QR</h3>
              <p className="text-gray-600 mb-2 font-medium">"Your face, your QR, your vibe."</p>
              <p className="text-gray-600">
                When someone scans your QR, they're taken straight to your unique profile page — no app required.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Let them explore you</h3>
              <p className="text-gray-600 mb-2 font-medium">"Your digital card, but way cooler."</p>
              <p className="text-gray-600">
                They'll see everything you want them to see: your socials, links, contact info, even fun widgets like Spotify or Notion.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Follow up instantly</h3>
              <p className="text-gray-600 mb-2 font-medium">"One-tap gratitude."</p>
              <p className="text-gray-600">
                They can send a pre-filled "Nice meeting you at [event]" email in seconds. You get the message in your inbox. Done.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center space-x-2 bg-white text-violet-600 px-6 py-3 rounded-full font-semibold border-2 border-violet-200 hover:border-violet-300 hover:bg-violet-50 transition-all duration-300"
            >
              <span>Try it live</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your identity, your way
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Widgets</h3>
              <p className="text-gray-600 text-sm">Pick what to show: tags, links, music, calendars, anything</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile with Personality</h3>
              <p className="text-gray-600 text-sm">Your photo is centered inside the QR itself</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Email Launcher</h3>
              <p className="text-gray-600 text-sm">Let others follow up in one tap</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy by Default</h3>
              <p className="text-gray-600 text-sm">You choose what's public, what's private</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              People remember me now. Literally.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <p className="text-gray-700 text-lg mb-4 italic">
                "Everyone was asking about my QR at the conference. Easiest networking ever."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">SJ</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-gray-600 text-sm">Marketing Director</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <p className="text-gray-700 text-lg mb-4 italic">
                "It's like a business card, portfolio, and inbox shortcut in one."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">MC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mike Chen</p>
                  <p className="text-gray-600 text-sm">Freelance Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Be more than a contact. Be remembered.
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Start for free. Add your vibe. Let people connect with you, not just your email address.
            </p>
            <button
              onClick={handleClaimUsername}
              className="group inline-flex items-center space-x-3 bg-white text-violet-600 px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <span>Claim your profile</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

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