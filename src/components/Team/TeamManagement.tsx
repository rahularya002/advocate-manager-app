import { useState, useEffect } from 'react';
import { Plus, Search, Filter, User, Mail, Phone, Shield, Edit, Trash2, UserCheck, UserX, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { AddTeamMemberModal } from './AddTeamMemberModal';
import { getTeamMembers, TeamMember } from '../../lib/api';

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getTeamMembers();
      if (result.success && result.teamMembers) {
        setTeamMembers(result.teamMembers);
      } else {
        setError(result.error || 'Failed to load team members');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddTeamMember = async () => {
    // The AddTeamMemberModal will handle the API call and refresh
    await loadTeamMembers();
  };

  const getRoleColor = (role: string) => {
    const colors = {
      partner: 'bg-gold-100 text-gold-800 border-gold-200',
      senior_associate: 'bg-blue-100 text-blue-800 border-blue-200',
      associate: 'bg-green-100 text-green-800 border-green-200',
      paralegal: 'bg-purple-100 text-purple-800 border-purple-200',
      admin: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role as keyof typeof colors] || colors.admin;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getRoleStats = () => {
    const stats = teamMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      partner: stats.partner || 0,
      senior_associate: stats.senior_associate || 0,
      associate: stats.associate || 0,
      paralegal: stats.paralegal || 0,
      total: teamMembers.length
    };
  };

  const stats = getRoleStats();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-primary-600">Loading team members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Team Management</h1>
            <p className="text-primary-600">Manage team members, roles, and permissions</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Team Member</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-primary-200">
            <div className="text-2xl font-bold text-primary-900">{stats.total}</div>
            <div className="text-sm text-primary-600">Total Members</div>
          </div>
          <div className="bg-gold-50 rounded-lg p-4 border border-gold-200">
            <div className="text-2xl font-bold text-gold-800">{stats.partner}</div>
            <div className="text-sm text-gold-600">Partners</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-800">{stats.senior_associate}</div>
            <div className="text-sm text-blue-600">Senior Associates</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-800">{stats.associate}</div>
            <div className="text-sm text-green-600">Associates</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-800">{stats.paralegal}</div>
            <div className="text-sm text-purple-600">Paralegals</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
          >
            <option value="all">All Roles</option>
            <option value="partner">Partner</option>
            <option value="senior_associate">Senior Associate</option>
            <option value="associate">Associate</option>
            <option value="paralegal">Paralegal</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900">{member.name}</h3>
                  <p className="text-sm text-primary-600">{member.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {member.status === 'active' ? <UserCheck className="h-3 w-3 inline mr-1" /> : <UserX className="h-3 w-3 inline mr-1" />}
                  {member.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-primary-600">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center space-x-2 text-sm text-primary-600">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-primary-600">
                <Shield className="h-4 w-4" />
                <span>{member.permissions.length} permissions</span>
              </div>
            </div>

            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(member.role)}`}>
                {member.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {member.specializations && member.specializations.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-primary-500 mb-1">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {member.specializations.slice(0, 2).map((spec, index) => (
                    <span key={index} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                  {member.specializations.length > 2 && (
                    <span className="text-xs text-primary-500">
                      +{member.specializations.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="text-xs text-primary-500 mb-4">
              Joined: {format(new Date(member.joinDate), 'MMM dd, yyyy')}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-primary-100">
              <button 
                onClick={() => setSelectedMember(member)}
                className="text-gold-600 hover:text-gold-700 text-sm font-medium"
              >
                View Details
              </button>
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:text-primary-700">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-primary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary-900 mb-2">No team members found</h3>
          <p className="text-primary-500">
            {teamMembers.length === 0 
              ? "Get started by adding your first team member" 
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-primary-900">Team Member Details</h2>
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="text-primary-400 hover:text-primary-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-900">{selectedMember.name}</h3>
                  <p className="text-primary-600">{selectedMember.department}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedMember.role)}`}>
                    {selectedMember.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-primary-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm text-primary-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedMember.email}</span>
                    </div>
                    {selectedMember.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedMember.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-primary-900 mb-2">Employment Details</h4>
                  <div className="space-y-2 text-sm text-primary-600">
                    <p>Joined: {format(new Date(selectedMember.joinDate), 'MMMM dd, yyyy')}</p>
                    <p>Status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedMember.status)}`}>
                      {selectedMember.status.toUpperCase()}
                    </span></p>
                  </div>
                </div>
              </div>

              {selectedMember.specializations && selectedMember.specializations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-primary-900 mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.specializations.map((spec, index) => (
                      <span key={index} className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-primary-900 mb-2">Permissions ({selectedMember.permissions.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedMember.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-primary-50 rounded-lg">
                      <Shield className="h-4 w-4 text-primary-600" />
                      <div>
                        <p className="text-sm font-medium text-primary-900">{permission.name}</p>
                        <p className="text-xs text-primary-600">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddTeamMemberModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTeamMember}
      />
    </div>
  );
}