import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { API_URL } from '../App';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  availableCount: number;
  isAvailable: boolean;
}

interface TimeSlotConfig {
  availableDays: string[];
  timeSlots: TimeSlot[];
  leadTime: number;
  maxAdvanceBookingDays: number;
}

interface PickupTimeSelectorProps {
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  selectedDate: string;
  selectedTime: string;
}

const PickupTimeSelector: React.FC<PickupTimeSelectorProps> = ({
  onSelectDate,
  onSelectTime,
  selectedDate,
  selectedTime
}) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Helper to parse YYYY-MM-DD string to local Date object components
  const getLocalDateComponents = (dateStr: string): { year: number, month: number, day: number } => {
    const parts = dateStr.split('-');
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10) - 1, // JavaScript months are 0-indexed
      day: parseInt(parts[2], 10)
    };
  };
  
  // Helper function to format a Date object to YYYY-MM-DD string based on local date parts
  const formatDateToYyyyMmDd = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Get available dates based on constraints
  useEffect(() => {
    const fetchTimeSlotConfig = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/time-slots/config`);
        const data = await response.json();
        
        if (data.success) {
          generateAvailableDates(data.config);
        } else {
          setError('Failed to load available dates');
        }
      } catch (error) {
        console.error('Error fetching available dates:', error);
        setError('Error loading available dates. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeSlotConfig();
  }, []);
  
  // Generate available dates based on config
  const generateAvailableDates = (config: TimeSlotConfig) => {
    const { availableDays, leadTime, maxAdvanceBookingDays } = config;
    
    const dates: string[] = [];
    const now = new Date();
    const startDate = new Date();
    
    // Add lead time
    startDate.setDate(now.getDate() + leadTime);
    
    // Generate dates for the next maxAdvanceBookingDays days
    for (let i = 0; i < maxAdvanceBookingDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Get day of week
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      
      // Check if this day is available
      if (availableDays.includes(dayOfWeek)) {
        const dateString = formatDateToYyyyMmDd(date);
        dates.push(dateString);
      }
    }
    
    setAvailableDates(dates);
  };
  
  // Fetch available time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchAvailableTimeSlots = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/time-slots/available/${selectedDate}`);
        const data = await response.json();
        
        if (data.success) {
          setAvailableTimeSlots(data.availableSlots);
          
          // Clear selected time if it's no longer available
          if (selectedTime) {
            const isTimeAvailable = data.availableSlots.some(
              (slot: TimeSlot) => slot.startTime === selectedTime && slot.isAvailable
            );
            
            if (!isTimeAvailable) {
              onSelectTime('');
            }
          }
        } else {
          setError('Failed to load available time slots');
        }
      } catch (error) {
        console.error('Error fetching available time slots:', error);
        setError('Error loading available time slots. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableTimeSlots();
  }, [selectedDate, onSelectTime, selectedTime]);
  
  // Format date for display (May 15, 2023)
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    // Ensure dateString is treated as local time
    const { year, month, day } = getLocalDateComponents(dateString);
    const date = new Date(year, month, day);
    return date.toLocaleDateString(undefined, options);
  };
  
  // Format time for display (10:00 AM - 11:00 AM)
  const formatTimeSlot = (slot: TimeSlot) => {
    const startTime = new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTime = new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `${startTime} - ${endTime}`;
  };
  
  // Check if date is today
  const isToday = (dateStr: string) => {
    const today = new Date(); // Current moment in local time
    const dateComponents = getLocalDateComponents(dateStr);

    return dateComponents.year === today.getFullYear() &&
           dateComponents.month === today.getMonth() &&
           dateComponents.day === today.getDate();
  };
  
  // Check if date is tomorrow
  const isTomorrow = (dateStr: string) => {
    const tomorrow = new Date(); // Current moment in local time
    tomorrow.setDate(tomorrow.getDate() + 1); // Advance to tomorrow
    const dateComponents = getLocalDateComponents(dateStr);
    
    return dateComponents.year === tomorrow.getFullYear() &&
           dateComponents.month === tomorrow.getMonth() &&
           dateComponents.day === tomorrow.getDate();
  };
  
  // Get day display (Today, Tomorrow, or day of week)
  const getDayDisplay = (dateString: string) => {
    if (isToday(dateString)) return 'Today';
    if (isTomorrow(dateString)) return 'Tomorrow';
    
    // Ensure dateString is treated as local time for weekday display
    const { year, month, day } = getLocalDateComponents(dateString);
    const date = new Date(year, month, day);
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  };
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded mb-6">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <div>{error}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Date selection */}
      <div>
        <h3 className="text-lg font-light mb-3 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Select Pickup Date
        </h3>
        
        {loading && !availableDates.length ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : availableDates.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 px-4 py-3 rounded">
            No pickup dates available at this time.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableDates.slice(0, 8).map(date => (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                className={`border rounded-lg p-3 text-left transition-colors ${
                  selectedDate === date
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">{getDayDisplay(date)}</div>
                <div className="text-xs text-gray-500">{formatDate(date)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Time selection */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-light mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Select Pickup Time
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 px-4 py-3 rounded">
              No pickup times available for this date.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableTimeSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => slot.isAvailable && onSelectTime(slot.startTime)}
                  disabled={!slot.isAvailable}
                  className={`border rounded-lg p-3 text-left transition-colors ${
                    !slot.isAvailable
                      ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : selectedTime === slot.startTime
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{formatTimeSlot(slot)}</div>
                  {slot.isAvailable ? (
                    <div className="text-xs text-gray-500">
                      {slot.availableCount} spot{slot.availableCount !== 1 ? 's' : ''} left
                    </div>
                  ) : (
                    <div className="text-xs text-red-400">Unavailable</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PickupTimeSelector; 