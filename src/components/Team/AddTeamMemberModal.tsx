import React, { useState } from 'react';
import { X, User, Loader } from 'lucide-react';
import { createTeamMember } from '../../lib/api';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: any) => void;
}

export function AddTeamMemberModal({ isOpen, onClose, onSubmit }: AddTeamMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'associate',
    department: '',
    specializations: [] as string[],
    permissions: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  const departments = [
    'Corporate Law',
    'Litigation',
    'Family Law',
    'Criminal Law',
    'Real Estate Law',
    'Employment Law',
    'Immigration Law',
    'Tax Law',
    'Environmental Law',
    'Intellectual Property',
    'Estate Planning',
    'General'
  ];

  const specializationOptions = [
    'Corporate Law', 'Criminal Law', 'Family Law', 'Personal Injury',
    'Real Estate Law', 'Employment Law', 'Immigration Law', 'Tax Law',
    'Intellectual Property', 'Environmental Law', 'Healthcare Law', 'Bankruptcy Law',
    'Civil Litigation', 'Commercial Disputes', 'Mergers & Acquisitions',
    'Child Custody', 'Document Preparation', 'Research'
  ];

  const availablePermissions = [
    { id: 'view_cases', name: 'View Cases', description: 'Can view all cases' },
    { id: 'edit_cases', name: 'Edit Cases', description: 'Can create and edit cases' },
    { id: 'delete_cases', name: 'Delete Cases', description: 'Can delete cases' },
    { id: 'manage_team', name: 'Manage Team', description: 'Can add/remove team members' },
    { id: 'view_documents', name: 'View Documents', description: 'Can view documents' },
    { id: 'upload_documents', name: 'Upload Documents', description: 'Can upload documents' },
    { id: 'manage_calendar', name: 'Manage Calendar', description: 'Can create/edit calendar events' },
    { id: 'system_settings', name: 'System Settings', description: 'Can modify system settings' }
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.department) newErrors.department = 'Department is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Convert permission IDs to permission objects
      const selectedPermissions = formData.permissions.map(permId => 
        availablePermissions.find(p => p.id === permId)
      ).filter(Boolean).map(perm => ({
        name: perm!.name,
        description: perm!.description,
        category: perm!.id.split('_')[0] // Extract category from ID
      }));

      const memberData = {
        ...formData,
        permissions: selectedPermissions
      };

      const result = await createTeamMember(memberData);
      
      if (result.success) {
        if (result.tempPassword) {
          setTempPassword(result.tempPassword);
        }
        onSubmit(result.member);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'associate',
          department: '',
          specializations: [],
          permissions: []
        });
        
        // Don't close immediately if we have a temp password to show
        if (!result.tempPassword) {
          onClose();
        }
      } else {
        setErrors({ submit: result.error || 'Failed to create team member' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpecialization = (spec: string) => {
    const current = formData.specializations;
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    handleInputChange('specializations', updated);
  };

  const togglePermission = (permId: string) => {
    const current = formData.permissions;
    const updated = current.includes(permId)
      ? current.filter(p => p !== permId)
      : [...current, permId];
    handleInputChange('permissions', updated);
  };

  const handleClose = () => {
    setTempPassword('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-primary-900">Add Team Member</h2>
            </div>
            <button 
              onClick={handleClose}
              className="text-primary-400 hover:text-primary-600 transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {tempPassword ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-green-900 mb-4">Team Member Added Successfully!</h3>
              <div className="bg-white border border-green-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-700 mb-2">Temporary Password:</p>
                <p className="text-lg font-mono font-bold text-green-900">{tempPassword}</p>
              </div>
              <p className="text-sm text-green-600 mb-4">
                Please share this temporary password with the new team member. They should change it upon first login.
              </p>
              <button
                onClick={handleClose}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                  placeholder="Enter full name"
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                  disabled={isLoading}
                >
                  <option value="partner">Partner</option>
                  <option value="senior_associate">Senior Associate</option>
                  <option value="associate">Associate</option>
                  <option value="paralegal">Paralegal</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Specializations
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-primary-200 rounded-lg p-3">
                {specializationOptions.map(spec => (
                  <label key={spec} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specializations.includes(spec)}
                      onChange={() => toggleSpecialization(spec)}
                      className="rounded border-primary-300 text-gold-600 focus:ring-gold-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-primary-700">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-primary-200 rounded-lg p-3">
                {availablePermissions.map(permission => (
                  <label key={permission.id} className="flex items-start space-x-2 cursor-pointer p-2 hover:bg-primary-50 rounded">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="rounded border-primary-300 text-gold-600 focus:ring-gold-500 mt-1"
                      disabled={isLoading}
                    />
                    <div>
                      <span className="text-sm font-medium text-primary-900">{permission.name}</span>
                      <p className="text-xs text-primary-600">{permission.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-primary-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary-800 text-white px-6 py-2 rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Member</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}