import React, { useState } from 'react';
import { Edit3, Eye, QrCode, User, LogOut, Settings, Home } from 'lucide-react';
import { AuthUser } from '../hooks/useAuth';

interface NavigationProps {
  currentView: 'edit' | 'preview' | 'qr';
  onViewChange: (view: 'edit' | 'preview' | 'qr') => void;
  user: AuthUser;
  onLogout: () => void;
  onBackToLanding?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, user, onLogout, onBackToLanding }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'edit', label: 'Edit Profile', icon: Edit3 },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'qr', label: 'QR Code', icon: QrCode }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <button 
              onClick={onBackToLanding}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                QR Profile
              </h1>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Items */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id as 'edit' | 'preview' | 'qr')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-gradient-to-br from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold">
                  {getInitials(user.name)}
                </div>
                <span className="hidden sm:inline font-medium">{user.name.split(' ')[0]}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200/50 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;