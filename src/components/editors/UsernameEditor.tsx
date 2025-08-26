import React, { useState, useEffect } from 'react';
import { Globe, Check, X, AlertCircle, Loader } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';

interface UsernameEditorProps {
  currentUsername?: string;
  onUsernameUpdate: (username: string) => void;
}

const UsernameEditor: React.FC<UsernameEditorProps> = ({ currentUsername, onUsernameUpdate }) => {
  const { user } = useAuth();
  const { checkUsernameAvailability, updateUsername } = useProfile(user?.id || null);
  const [username, setUsername] = useState(currentUsername || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean | null;
    message: string;
  }>({ available: null, message: '' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setUsername(currentUsername || '');
    setHasChanges(false);
    setAvailability({ available: null, message: '' });
  }, [currentUsername]);

  const validateUsername = (value: string): string | null => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-z0-9]+$/.test(value)) {
      return 'Username can only contain lowercase letters and numbers';
    }
    return null;
  };

  const checkAvailability = async (value: string) => {
    if (value === currentUsername) {
      setAvailability({ available: true, message: 'Current username' });
      return;
    }

    const validationError = validateUsername(value);
    if (validationError) {
      setAvailability({ available: false, message: validationError });
      return;
    }

    setIsChecking(true);
    try {
      const isAvailable = await checkUsernameAvailability(value);
      setAvailability({
        available: isAvailable,
        message: isAvailable ? 'Username is available!' : 'Username is already taken'
      });
    } catch (error) {
      setAvailability({
        available: false,
        message: 'Error checking availability'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(cleanValue);
    setHasChanges(cleanValue !== currentUsername);
    
    if (cleanValue.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkAvailability(cleanValue);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setAvailability({ available: null, message: '' });
    }
  };

  const handleSaveUsername = async () => {
    if (!availability.available || !hasChanges) return;

    setIsUpdating(true);
    try {
      await updateUsername(username);
      onUsernameUpdate(username);
      setHasChanges(false);
      setAvailability({ available: true, message: 'Username updated successfully!' });
    } catch (error) {
      setAvailability({
        available: false,
        message: error instanceof Error ? error.message : 'Failed to update username'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader className="w-4 h-4 text-text-500 animate-spin" />;
    }
    if (availability.available === true) {
      return <Check className="w-4 h-4 text-success-600" />;
    }
    if (availability.available === false) {
      return <X className="w-4 h-4 text-danger-600" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (availability.available === true) return 'text-success-600';
    if (availability.available === false) return 'text-danger-600';
    return 'text-text-500';
  };

  const getBorderColor = () => {
    if (availability.available === true) return 'border-success-600 focus:ring-success-600';
    if (availability.available === false) return 'border-danger-600 focus:ring-danger-600';
    return 'border-border focus:ring-ring';
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-700 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Profile URL
        </label>
        
        <div className="flex items-center space-x-2">
          <span className="text-text-500 text-sm">qrprofile.com/</span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:border-transparent transition-all pr-10 bg-surface ${getBorderColor()}`}
              placeholder="your-username"
              maxLength={20}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getStatusIcon()}
            </div>
          </div>
        </div>
        
        {availability.message && (
          <div className={`flex items-center space-x-2 mt-2 text-sm ${getStatusColor()}`}>
            {availability.available === false && <AlertCircle className="w-4 h-4" />}
            <span>{availability.message}</span>
          </div>
        )}
      </div>

      {hasChanges && availability.available && (
        <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-primary-700">
              You have unsaved changes to your username
            </span>
          </div>
          <button
            onClick={handleSaveUsername}
            disabled={isUpdating || !availability.available}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isUpdating ? 'Saving...' : 'Save Username'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UsernameEditor;