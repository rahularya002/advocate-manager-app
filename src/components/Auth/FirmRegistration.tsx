import React, { useState } from 'react';
import { Scale, Building, Mail, Phone, Globe, MapPin, Users, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FirmRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function FirmRegistration({ onBack, onSuccess }: FirmRegistrationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Firm Details
    firmName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    specializations: [] as string[],
    
    // Admin User
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, isLoading } = useAuth();

  const specializationOptions = [
    'Corporate Law', 'Criminal Law', 'Family Law', 'Personal Injury',
    'Real Estate Law', 'Employment Law', 'Immigration Law', 'Tax Law',
    'Intellectual Property', 'Environmental Law', 'Healthcare Law', 'Bankruptcy Law'
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isTestEmail = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    const testDomains = ['test.com', 'example.com', 'localhost', 'test.org', 'example.org'];
    return testDomains.includes(domain);
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.firmName.trim()) newErrors.firmName = 'Firm name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (stepNumber === 2) {
      if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
      if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      // Admin email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.adminEmail && !emailRegex.test(formData.adminEmail)) {
        newErrors.adminEmail = 'Please enter a valid email address';
      }
      
      // Check for test email domains
      if (formData.adminEmail && isTestEmail(formData.adminEmail)) {
        newErrors.adminEmail = 'Test email domains are not allowed. Please use a real email address from a valid provider (e.g., Gmail, Outlook, Yahoo).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    const result = await signUp(formData);
    
    if (result.success) {
      onSuccess();
    } else {
      setErrors({ submit: result.error || 'Registration failed. Please try again.' });
    }
  };

  const toggleSpecialization = (spec: string) => {
    const current = formData.specializations;
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    handleInputChange('specializations', updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-primary-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary-800 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Scale className="h-8 w-8 text-gold-400" />
                <div>
                  <h1 className="text-2xl font-bold">Register Your Firm</h1>
                  <p className="text-primary-300">Join AdvocateManager today</p>
                </div>
              </div>
              <button
                onClick={onBack}
                className="text-primary-300 hover:text-white transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-primary-100 px-6 py-4">
            <div className="flex items-center space-x-4">
              {[1, 2].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? 'bg-gold-500 text-white' : 'bg-primary-300 text-primary-600'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 2 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-gold-500' : 'bg-primary-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-primary-600">
              Step {step} of 2: {
                step === 1 ? 'Firm Information' : 'Admin Account'
              }
            </div>
          </div>

          <div className="p-6">
            {errors.submit && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Registration Error</p>
                  <p className="mt-1">{errors.submit}</p>
                  {(errors.submit.includes('email') || errors.submit.includes('invalid')) && (
                    <p className="mt-2 text-xs text-red-500">
                      Please use a real email address from a recognized provider like Gmail, Outlook, Yahoo, or your company domain.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Firm Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Firm Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="text"
                      value={formData.firmName}
                      onChange={(e) => handleInputChange('firmName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                      placeholder="Enter your firm name"
                    />
                  </div>
                  {errors.firmName && <p className="text-red-600 text-sm mt-1">{errors.firmName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                        placeholder="firm@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                      placeholder="https://www.yourfirm.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-primary-400" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none resize-none"
                      placeholder="Enter your firm's address"
                    />
                  </div>
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Practice Areas
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specializationOptions.map((spec) => (
                      <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => toggleSpecialization(spec)}
                          className="rounded border-primary-300 text-gold-600 focus:ring-gold-500"
                        />
                        <span className="text-sm text-primary-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-primary-900">Create Admin Account</h3>
                  <p className="text-primary-600">This will be the primary administrator for your firm</p>
                </div>

                {/* Email Requirements Notice */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email Requirements</p>
                    <p className="mt-1">Please use a real email address from a recognized provider (Gmail, Outlook, Yahoo, or your company domain). Test domains like test.com are not allowed.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => handleInputChange('adminName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                      placeholder="Enter admin's full name"
                    />
                  </div>
                  {errors.adminName && <p className="text-red-600 text-sm mt-1">{errors.adminName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none ${
                          formData.adminEmail && isTestEmail(formData.adminEmail) 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-primary-300'
                        }`}
                        placeholder="admin@yourcompany.com"
                      />
                    </div>
                    {errors.adminEmail && <p className="text-red-600 text-sm mt-1">{errors.adminEmail}</p>}
                    {formData.adminEmail && isTestEmail(formData.adminEmail) && !errors.adminEmail && (
                      <p className="text-amber-600 text-sm mt-1">⚠️ Test domains are not allowed. Please use a real email address.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400" />
                      <input
                        type="tel"
                        value={formData.adminPhone}
                        onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                      placeholder="Create a strong password"
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-primary-200">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : onBack()}
                className="px-6 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                {step === 1 ? 'Back to Login' : 'Previous'}
              </button>
              
              {step < 2 ? (
                <button
                  onClick={handleNext}
                  className="bg-primary-800 text-white px-6 py-2 rounded-lg hover:bg-primary-900 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-gold-600 text-white px-6 py-2 rounded-lg hover:bg-gold-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Creating Firm...</span>
                    </>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}