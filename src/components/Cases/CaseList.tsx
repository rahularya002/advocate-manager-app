import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, Clock, AlertTriangle, Loader, User } from 'lucide-react';
import { format } from 'date-fns';
import { AddCaseModal } from './AddCaseModal';
import { getCases, getTeamMembers, Case } from '../../lib/api';

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [casesResult, teamResult] = await Promise.all([
        getCases(),
        getTeamMembers()
      ]);

      if (casesResult.success && casesResult.cases) {
        setCases(casesResult.cases);
      } else {
        setError(casesResult.error || 'Failed to load cases');
      }

      if (teamResult.success && teamResult.teamMembers) {
        setTeamMembers(teamResult.teamMembers);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamMemberName = (memberId: string) => {
    const member = teamMembers.find(m => m._id === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.caseType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddCase = async (newCaseData: any) => {
    // The AddCaseModal will handle the API call and refresh
    await loadData();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-gold-100 text-gold-800',
      closed: 'bg-gray-100 text-gray-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600',
      medium: 'text-gold-600',
      low: 'text-green-600'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-primary-600">Loading cases...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Cases</h1>
            <p className="text-primary-600">Manage and track all legal cases</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Case</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="on_hold">On Hold</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="space-y-4">
        {filteredCases.map((case_) => (
          <div key={case_._id} className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-primary-900">{case_.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                    {case_.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <AlertTriangle className={`h-4 w-4 ${getPriorityColor(case_.priority)}`} />
                </div>
                <p className="text-primary-600 mb-2">Client: {case_.clientName}</p>
                {case_.summary && (
                  <p className="text-sm text-primary-500 mb-3">{case_.summary}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-primary-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {format(new Date(case_.createdAt), 'MMM dd, yyyy')}</span>
                  </span>
                  {case_.dueDate && (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Due: {format(new Date(case_.dueDate), 'MMM dd, yyyy')}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-600 mb-1">Case Type</p>
                <p className="font-medium text-primary-900">{case_.caseType}</p>
                <p className="text-sm text-primary-500 mt-2">{case_.billableHours} billable hours</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-primary-100">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-primary-600">Assigned to:</span>
                <div className="flex space-x-1">
                  {case_.assignedTo && case_.assignedTo.length > 0 ? (
                    case_.assignedTo.map((memberId, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-primary-500" />
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          {getTeamMemberName(memberId)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-primary-400">Unassigned</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                  View Details
                </button>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCases.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-primary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary-900 mb-2">No cases found</h3>
          <p className="text-primary-500">
            {cases.length === 0 
              ? "Get started by creating your first case" 
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </div>
      )}

      <AddCaseModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCase}
      />
    </div>
  );
}