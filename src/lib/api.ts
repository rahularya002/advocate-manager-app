export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  firmId: string;
  firm: {
    id: string;
    name: string;
    email: string;
  };
  department?: string;
  phone?: string;
  specializations: string[];
  permissions: Array<{
    name: string;
    description: string;
    category: string;
  }>;
}

export interface Case {
  _id: string;
  title: string;
  clientName: string;
  caseType: string;
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'high' | 'medium' | 'low';
  summary?: string;
  dueDate?: string;
  billableHours: number;
  assignedTo: string[];
  firmId: string;
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  specializations: string[];
  status: 'active' | 'inactive';
  joinDate: string;
  permissions: Array<{
    name: string;
    description: string;
    category: string;
  }>;
  firmId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  eventType: 'meeting' | 'court_hearing' | 'deadline' | 'consultation' | 'other';
  location?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'completed' | 'cancelled';
  attendees: string[];
  caseId?: {
    _id: string;
    title: string;
    clientName: string;
  };
  firmId: string;
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth API
export const signIn = async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Sign in failed' };
    }

    return { success: true, user: data.user, token: data.token };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const signUp = async (firmData: any): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(firmData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }

    return { success: true, user: data.user, token: data.token };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const getUserFromToken = async (token: string): Promise<AuthUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get user from token error:', error);
    return null;
  }
};

// Cases API
export const getCases = async (): Promise<{ success: boolean; cases?: Case[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch cases' };
    }

    return { success: true, cases: data.cases };
  } catch (error) {
    console.error('Get cases error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const createCase = async (caseData: any): Promise<{ success: boolean; case?: Case; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(caseData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create case' };
    }

    return { success: true, case: data.case };
  } catch (error) {
    console.error('Create case error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const updateCase = async (id: string, caseData: any): Promise<{ success: boolean; case?: Case; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cases/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(caseData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update case' };
    }

    return { success: true, case: data.case };
  } catch (error) {
    console.error('Update case error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const deleteCase = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cases/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete case' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete case error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

// Team API
export const getTeamMembers = async (): Promise<{ success: boolean; teamMembers?: TeamMember[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/team`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch team members' };
    }

    return { success: true, teamMembers: data.teamMembers };
  } catch (error) {
    console.error('Get team members error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const createTeamMember = async (memberData: any): Promise<{ success: boolean; member?: TeamMember; tempPassword?: string; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/team`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create team member' };
    }

    return { success: true, member: data.member, tempPassword: data.tempPassword };
  } catch (error) {
    console.error('Create team member error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const updateTeamMember = async (id: string, memberData: any): Promise<{ success: boolean; member?: TeamMember; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/team/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update team member' };
    }

    return { success: true, member: data.member };
  } catch (error) {
    console.error('Update team member error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const deleteTeamMember = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/team/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete team member' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete team member error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

// Calendar API
export const getCalendarEvents = async (): Promise<{ success: boolean; events?: CalendarEvent[]; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch calendar events' };
    }

    return { success: true, events: data.events };
  } catch (error) {
    console.error('Get calendar events error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const createCalendarEvent = async (eventData: any): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create calendar event' };
    }

    return { success: true, event: data.event };
  } catch (error) {
    console.error('Create calendar event error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const updateCalendarEvent = async (id: string, eventData: any): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update calendar event' };
    }

    return { success: true, event: data.event };
  } catch (error) {
    console.error('Update calendar event error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};

export const deleteCalendarEvent = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calendar/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete calendar event' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete calendar event error:', error);
    return { success: false, error: 'Network error occurred' };
  }
};