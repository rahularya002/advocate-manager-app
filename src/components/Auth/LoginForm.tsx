import React, { useState } from 'react';
import { Scale, Mail, Lock, Eye, EyeOff, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { FirmRegistration } from './FirmRegistration';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const { signIn, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    setError('');
  };

  if (showRegistration) {
    return (
      <FirmRegistration 
        onBack={() => setShowRegistration(false)}
        onSuccess={handleRegistrationSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-800 rounded-full mb-4">
              <Scale className="h-8 w-8 text-gold-400" />
            </div>
            <h1 className="text-2xl font-bold text-primary-800 mb-2">AdvocateManager</h1>
            <p className="text-primary-600">Legal Case Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-800 text-white py-3 rounded-lg font-medium hover:bg-primary-900 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary-600 text-sm mb-4">
              Don't have an account?
            </p>
            <button
              onClick={() => setShowRegistration(true)}
              className="w-full bg-gold-600 text-white py-3 rounded-lg font-medium hover:bg-gold-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Building className="h-4 w-4" />
              <span>Register Your Firm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}