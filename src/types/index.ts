export interface User {
  id: string;
  name: string;
  email: string;
  role: 'partner' | 'senior_associate' | 'associate' | 'paralegal' | 'admin';
  firm: string;
  firmId: string;
  avatar?: string;
  joinDate: string;
  department: string;
  phone?: string;
  specialization?: string[];
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'cases' | 'team' | 'documents' | 'calendar' | 'settings';
}

export interface Case {
  id: string;
  title: string;
  client: string;
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string[];
  createdDate: string;
  dueDate?: string;
  caseType: string;
  summary: string;
  lastUpdate: string;
  documents: Document[];
  billableHours: number;
  firmId: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  caseId?: string;
  url?: string;
}

export interface Firm {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  founded: string;
  specializations: string[];
  subscriptionPlan: 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  currentUsers: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'court_hearing' | 'deadline' | 'consultation' | 'other';
  attendees: string[];
  location?: string;
  caseId?: string;
  firmId: string;
  createdBy: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'partner' | 'senior_associate' | 'associate' | 'paralegal' | 'admin';
  department: string;
  joinDate: string;
  phone?: string;
  specialization?: string[];
  permissions: Permission[];
  status: 'active' | 'inactive';
  firmId: string;
  avatar?: string;
}

export interface HiringUpdate {
  id: string;
  candidateName: string;
  position: string;
  department: string;
  status: 'interviewed' | 'offered' | 'hired' | 'rejected';
  date: string;
  interviewer: string;
  notes?: string;
  firmId: string;
}