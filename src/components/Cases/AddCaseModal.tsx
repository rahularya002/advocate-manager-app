import React, { useState, useEffect } from 'react';
import { X, Scale, Loader } from 'lucide-react';
import { createCase, getTeamMembers } from '../../lib/api';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (caseData: any) => void;
}

export function AddCaseModal({ isOpen, onClose, onSubmit }: AddCaseModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    caseType: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: [] as string[],
    dueDate: '',
    summary: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const caseTypes = [
    'Commercial Litigation',
    'Corporate Law',
    'Family Law',
    'Criminal Law',
    'Personal Injury',
    'Real Estate Law',
    'Employment Law',
    'Immigration Law',
    'Tax Law',
    'Environmental Law',
    'Intellectual Property',
    'Estate Planning'
  ];

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
    }
  }, [isOpen]);

  const loadTeamMembers = async () => {
    setLoadingTeam(true);
    try {
      const result = await getTeamMembers();
      if (result.success && result.teamMembers) {
        // Filter only active team members
        const activeMembers = result.teamMembers.filter(member => member.status === 'active');
        setTeamMembers(activeMembers);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Case title is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.caseType) newErrors.caseType = 'Case type is required';
    if (!formData.summary.trim()) newErrors.summary = 'Case summary is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await createCase(formData);
      
      if (result.success) {
        onSubmit(result.case);
        setFormData({
          title: '',
          clientName: '',
          caseType: '',
          priority: 'medium',
          status: 'pending',
          assignedTo: [],
          dueDate: '',
          summary: ''
        });
        onClose();
      } else {
        setErrors({ submit: result.error || 'Failed to create case' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAssignee = (memberId: string) => {
    const current = formData.assignedTo;
    const updated = current.includes(memberId)
      ? current.filter(id => id !== memberId)
      : [...current, memberId];
    handleInputChange('assignedTo', updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Scale className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-primary-900">Add New Case</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-primary-400 hover:text-primary-600 transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Case Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                placeholder="Enter case title"
                disabled={isLoading}
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                placeholder="Enter client name"
                disabled={isLoading}
              />
              {errors.clientName && <p className="text-red-600 text-sm mt-1">{errors.clientName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Case Type *
              </label>
              <select
                value={formData.caseType}
                onChange={(e) => handleInputChange('caseType', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              >
                <option value="">Select case type</option>
                {caseTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.caseType && <p className="text-red-600 text-sm mt-1">{errors.caseType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Assign To Team Members
            </label>
            {loadingTeam ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-4 w-4 animate-spin text-primary-600" />
                <span className="ml-2 text-sm text-primary-600">Loading team members...</span>
              </div>
            ) : teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-primary-200 rounded-lg p-3">
                {teamMembers.map(member => (
                  <label key={member._id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(member._id)}
                      onChange={() => toggleAssignee(member._id)}
                      className="rounded border-primary-300 text-gold-600 focus:ring-gold-500"
                      disabled={isLoading}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-primary-700 font-medium">{member.name}</span>
                      <p className="text-xs text-primary-500">{member.role.replace('_', ' ')} - {member.department}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-primary-200 rounded-lg">
                <p className="text-sm text-primary-500">No team members available</p>
                <p className="text-xs text-primary-400">Add team members first to assign cases</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Case Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none resize-none"
              placeholder="Provide a brief summary of the case..."
              disabled={isLoading}
            />
            {errors.summary && <p className="text-red-600 text-sm mt-1">{errors.summary}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-primary-200">
            <button
              type="button"
              onClick={onClose}
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
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Case</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}