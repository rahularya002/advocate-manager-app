import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users, AlertTriangle, Loader } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { AddEventModal } from './AddEventModal';
import { getCalendarEvents, CalendarEvent } from '../../lib/api';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await getCalendarEvents();
      if (result.success && result.events) {
        setEvents(result.events);
      } else {
        setError(result.error || 'Failed to load calendar events');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleAddEvent = async (newEventData: any) => {
    // The AddEventModal will handle the API call and refresh
    await loadEvents();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), date));
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      court_hearing: 'bg-red-100 text-red-800 border-red-200',
      deadline: 'bg-gold-100 text-gold-800 border-gold-200',
      consultation: 'bg-green-100 text-green-800 border-green-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getEventTypeIcon = (type: string) => {
    const icons = {
      meeting: Users,
      court_hearing: AlertTriangle,
      deadline: Clock,
      consultation: CalendarIcon,
      other: CalendarIcon
    };
    return icons[type as keyof typeof icons] || CalendarIcon;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'border-l-red-500',
      medium: 'border-l-gold-500',
      low: 'border-l-green-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-2 text-primary-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Calendar</h1>
            <p className="text-primary-600">Manage your schedule and important dates</p>
          </div>
          <button 
            onClick={() => setShowEventModal(true)}
            className="bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Calendar Header */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-primary-600" />
              </button>
              <h2 className="text-xl font-semibold text-primary-900">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-primary-600" />
              </button>
            </div>
            
            <div className="flex space-x-2">
              {(['month', 'week', 'day'] as const).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    view === viewType
                      ? 'bg-primary-800 text-white'
                      : 'text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] p-2 border border-primary-100 cursor-pointer transition-all hover:bg-primary-50 ${
                    !isCurrentMonth ? 'opacity-30' : ''
                  } ${isSelected ? 'bg-gold-50 border-gold-300' : ''} ${
                    isTodayDate ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'text-blue-800' : 'text-primary-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => {
                      const EventIcon = getEventTypeIcon(event.eventType);
                      return (
                        <div
                          key={event._id}
                          className={`text-xs p-1 rounded border-l-2 ${getEventTypeColor(event.eventType)} ${getPriorityColor(event.priority)}`}
                        >
                          <div className="flex items-center space-x-1">
                            <EventIcon className="h-3 w-3" />
                            <span className="truncate">{event.title}</span>
                          </div>
                          <div className="text-xs opacity-75">
                            {event.startTime}
                          </div>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-primary-500 font-medium">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details Sidebar */}
      {selectedDate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">
                Events for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              
              {getEventsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-primary-300 mx-auto mb-4" />
                  <p className="text-primary-500">No events scheduled for this date</p>
                  <button 
                    onClick={() => setShowEventModal(true)}
                    className="mt-4 text-gold-600 hover:text-gold-700 font-medium"
                  >
                    Add Event
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getEventsForDate(selectedDate).map((event) => {
                    const EventIcon = getEventTypeIcon(event.eventType);
                    return (
                      <div key={event._id} className={`border-l-4 ${getPriorityColor(event.priority)} bg-white border border-primary-200 rounded-lg p-4 hover:shadow-md transition-shadow`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getEventTypeColor(event.eventType)}`}>
                              <EventIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-primary-900">{event.title}</h4>
                              <p className="text-sm text-primary-600">{event.description}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                            {event.eventType.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees.length} attendees</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              event.priority === 'high' ? 'text-red-500' :
                              event.priority === 'medium' ? 'text-gold-500' : 'text-green-500'
                            }`} />
                            <span className="capitalize">{event.priority} priority</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-primary-100 flex justify-between items-center">
                          <div className="text-xs text-primary-500">
                            Attendees: {event.attendees.join(', ') || 'None'}
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">This Month</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">Total Events</span>
                  <span className="font-semibold text-primary-900">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">Court Hearings</span>
                  <span className="font-semibold text-red-600">
                    {events.filter(e => e.eventType === 'court_hearing').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">Consultations</span>
                  <span className="font-semibold text-green-600">
                    {events.filter(e => e.eventType === 'consultation').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary-600">Deadlines</span>
                  <span className="font-semibold text-gold-600">
                    {events.filter(e => e.eventType === 'deadline').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-4">Upcoming</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => {
                  const EventIcon = getEventTypeIcon(event.eventType);
                  return (
                    <div key={event._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary-50">
                      <div className={`p-1 rounded ${getEventTypeColor(event.eventType)}`}>
                        <EventIcon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-900 truncate">{event.title}</p>
                        <p className="text-xs text-primary-500">
                          {format(new Date(event.startDate), 'MMM d')} at {event.startTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddEventModal 
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSubmit={handleAddEvent}
      />
    </div>
  );
}