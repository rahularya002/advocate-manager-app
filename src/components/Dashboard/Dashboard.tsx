import React, { useState, useEffect } from 'react';
import { Scale, Users, FileText, Calendar,  AlertTriangle, Loader } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useAuth } from '../../context/AuthContext';
import { getCases, getTeamMembers, getCalendarEvents } from '../../lib/api';
import { format, isAfter, isBefore, addDays } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCases: 0,
    teamMembers: 0,
    totalDocuments: 0,
    upcomingDeadlines: 0
  });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [priorityAlerts, setPriorityAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [casesResult, teamResult, eventsResult] = await Promise.all([
        getCases(),
        getTeamMembers(),
        getCalendarEvents()
      ]);

      // Process cases data
      if (casesResult.success && casesResult.cases) {
        const cases = casesResult.cases;
        const activeCases = cases.filter(c => c.status === 'active').length;
        
        // Get recent cases (last 5)
        const recent = cases
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);
        setRecentCases(recent);

        // Count upcoming deadlines (next 7 days)
        const now = new Date();
        const nextWeek = addDays(now, 7);
        const upcomingDeadlines = cases.filter(c => 
          c.dueDate && 
          isAfter(new Date(c.dueDate), now) && 
          isBefore(new Date(c.dueDate), nextWeek)
        ).length;

        // Create priority alerts
        const alerts: React.SetStateAction<any[]> = [];
        
        // Critical deadlines (next 2 days)
        const criticalDeadlines = cases.filter(c => 
          c.dueDate && 
          isAfter(new Date(c.dueDate), now) && 
          isBefore(new Date(c.dueDate), addDays(now, 2))
        );
        
        criticalDeadlines.forEach(case_ => {
          alerts.push({
            type: 'deadline',
            title: 'Case deadline approaching',
            description: `${case_.title} - Due ${format(new Date(case_.dueDate!), 'MMM dd')}`,
            priority: 'high'
          });
        });

        // High priority pending cases
        const highPriorityPending = cases.filter(c => 
          c.priority === 'high' && c.status === 'pending'
        );
        
        highPriorityPending.slice(0, 2).forEach(case_ => {
          alerts.push({
            type: 'case',
            title: 'High priority case pending',
            description: `${case_.title} - Requires attention`,
            priority: 'medium'
          });
        });

        setPriorityAlerts(alerts);
        
        setStats(prev => ({
          ...prev,
          activeCases,
          upcomingDeadlines,
          totalDocuments: cases.reduce((sum, c) => sum + (c.billableHours || 0), 0) // Using billable hours as document proxy
        }));
      }

      // Process team data
      if (teamResult.success && teamResult.teamMembers) {
        const activeMembers = teamResult.teamMembers.filter(m => m.status === 'active').length;
        setStats(prev => ({ ...prev, teamMembers: activeMembers }));
      }

      // Process events data
      if (eventsResult.success && eventsResult.events) {
        const events = eventsResult.events;
        const now = new Date();
        
        // Get upcoming events (next 7 days)
        const upcoming = events
          .filter(e => isAfter(new Date(e.startDate), now))
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 3);
        
        setUpcomingEvents(upcoming);

        // Add event alerts
        const eventAlerts = upcoming.slice(0, 1).map(event => ({
          type: 'event',
          title: getEventTypeLabel(event.eventType),
          description: `${event.title} - ${format(new Date(event.startDate), 'MMM dd')} at ${event.startTime}`,
          priority: event.priority === 'high' ? 'high' : 'low'
        }));

        setPriorityAlerts(prev => [...prev, ...eventAlerts]);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      meeting: 'Client Meeting',
      court_hearing: 'Court Hearing',
      deadline: 'Deadline',
      consultation: 'Consultation',
      other: 'Event'
    };
    return labels[type as keyof typeof labels] || 'Event';
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-50 border-blue-200 text-blue-800',
      court_hearing: 'bg-red-50 border-red-200 text-red-800',
      deadline: 'bg-gold-50 border-gold-200 text-gold-800',
      consultation: 'bg-green-50 border-green-200 text-green-800',
      other: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getAlertColor = (priority: string) => {
    const colors = {
      high: 'bg-red-50 border-red-200 text-red-800',
      medium: 'bg-gold-50 border-gold-200 text-gold-800',
      low: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-primary-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900 mb-2">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-primary-600">
          Here's what's happening at {user?.firm?.name} today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Cases"
          value={stats.activeCases}
          icon={Scale}
          change={stats.activeCases > 0 ? `${stats.activeCases} active` : "No active cases"}
          changeType={stats.activeCases > 0 ? "positive" : "neutral"}
          color="blue"
        />
        <StatsCard
          title="Team Members"
          value={stats.teamMembers}
          icon={Users}
          change={`${stats.teamMembers} active`}
          changeType="positive"
          color="green"
        />
        <StatsCard
          title="Total Hours"
          value={stats.totalDocuments}
          icon={FileText}
          change="Billable hours"
          changeType="positive"
          color="gold"
        />
        <StatsCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          icon={Calendar}
          change={stats.upcomingDeadlines > 0 ? "Next 7 days" : "None upcoming"}
          changeType={stats.upcomingDeadlines > 2 ? "negative" : "neutral"}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Recent Cases</h3>
          <div className="space-y-3">
            {recentCases.length > 0 ? (
              recentCases.map((case_) => (
                <div key={case_._id} className="p-3 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Scale className="h-5 w-5 text-blue-600" />
                      <div>
                        <span className="font-medium text-primary-900">{case_.title}</span>
                        <p className="text-sm text-primary-600">{case_.clientName}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      case_.status === 'active' ? 'bg-green-100 text-green-800' :
                      case_.status === 'pending' ? 'bg-gold-100 text-gold-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {case_.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Scale className="h-8 w-8 text-primary-300 mx-auto mb-2" />
                <p className="text-primary-500">No cases yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Priority Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-900">Priority Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {priorityAlerts.length > 0 ? (
              priorityAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertColor(alert.priority)}`}>
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs opacity-75">{alert.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="h-8 w-8 text-primary-300 mx-auto mb-2" />
                <p className="text-primary-500">No alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-900">Upcoming Events</h3>
          <Calendar className="h-5 w-5 text-primary-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <div key={event._id} className={`p-4 rounded-lg border ${getEventTypeColor(event.eventType)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">{getEventTypeLabel(event.eventType)}</span>
                </div>
                <p className="text-xs mb-1">{event.title}</p>
                <p className="text-xs opacity-75">
                  {format(new Date(event.startDate), 'MMM dd')} at {event.startTime}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4">
              <Calendar className="h-8 w-8 text-primary-300 mx-auto mb-2" />
              <p className="text-primary-500">No upcoming events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}