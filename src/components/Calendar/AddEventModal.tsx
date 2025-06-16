import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader } from 'lucide-react';
import { createCalendarEvent, getCases, getTeamMembers } from '../../lib/api';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

export function AddEventModal({ isOpen, onClose, onSubmit }: AddEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    eventType: 'meeting',
    attendees: [] as string[],
    location: '',
    priority: 'medium',
    caseId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const eventTypes = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'court_hearing', label: 'Court Hearing' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [casesResult, teamResult] = await Promise.all([
        getCases(),
        getTeamMembers()
      ]);

      if (casesResult.success && casesResult.cases) {
        setCases(casesResult.cases);
      }

      if (teamResult.success && teamResult.teamMembers) {
        // Filter only active team members
        const activeMembers = teamResult.teamMembers.filter(member => member.status === 'active');
        setTeamMembers(activeMembers);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoadingData(false);
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
    
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    // Validate end date is not before start date
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    
    // Validate end time is not before start time (for same day events)
    if (formData.startDate && formData.endDate && formData.startDate === formData.endDate) {
      if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
        newErrors.endTime = 'End time must be after start time';
      }
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
      const eventData = {
        ...formData,
        endDate: formData.endDate || formData.startDate,
        caseId: formData.caseId || undefined
      };

      const result = await createCalendarEvent(eventData);
      
      if (result.success) {
        onSubmit(result.event);
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          eventType: 'meeting',
          attendees: [],
          location: '',
          priority: 'medium',
          caseId: ''
        });
        onClose();
      } else {
        setErrors({ submit: result.error || 'Failed to create event' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAttendee = (memberId: string) => {
    const current = formData.attendees;
    const updated = current.includes(memberId)
      ? current.filter(id => id !== memberId)
      : [...current, memberId];
    handleInputChange('attendees', updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-primary-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-primary-900">Add New Event</h2>
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

          {loadingData && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg text-sm flex items-center">
              <Loader className="h-4 w-4 animate-spin mr-2" />
              Loading cases and team members...
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
              placeholder="Enter event title"
              disabled={isLoading}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none resize-none"
              placeholder="Enter event description"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Event Type
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
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
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
                disabled={isLoading}
              />
              {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
              placeholder="Enter location or meeting room"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Related Case
            </label>
            <select
              value={formData.caseId}
              onChange={(e) => handleInputChange('caseId', e.target.value)}
              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
              disabled={isLoading || loadingData}
            >
              <option value="">Select a case (optional)</option>
              {cases.map(case_ => (
                <option key={case_._id} value={case_._id}>{case_.title} - {case_.clientName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Attendees
            </label>
            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-primary-200 rounded-lg p-3">
                {teamMembers.map(member => (
                  <label key={member._id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.attendees.includes(member._id)}
                      onChange={() => toggleAttendee(member._id)}
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
              </div>
            )}
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
                <span>Create Event</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}