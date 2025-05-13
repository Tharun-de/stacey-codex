import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Calendar, 
  Clock,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../App';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
}

interface TimeSlotConfig {
  availableDays: string[];
  timeSlots: TimeSlot[];
  leadTime: number;
  maxAdvanceBookingDays: number;
}

const AdminTimeSlotPage: React.FC = () => {
  const [timeSlotConfig, setTimeSlotConfig] = useState<TimeSlotConfig>({
    availableDays: [],
    timeSlots: [],
    leadTime: 1,
    maxAdvanceBookingDays: 7
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id'>>({
    startTime: '',
    endTime: '',
    maxOrders: 5
  });
  
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Days of the week for checkboxes
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Fetch time slot configuration
  const fetchTimeSlotConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/time-slots/config`);
      const data = await response.json();
      
      if (data.success) {
        setTimeSlotConfig(data.config);
      } else {
        setError(data.message || 'Failed to load time slot configuration');
      }
    } catch (error) {
      console.error('Error fetching time slot configuration:', error);
      setError('Error loading time slot configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchTimeSlotConfig();
  }, []);
  
  // Update available days
  const handleDayToggle = async (day: string) => {
    try {
      const updatedDays = timeSlotConfig.availableDays.includes(day)
        ? timeSlotConfig.availableDays.filter(d => d !== day)
        : [...timeSlotConfig.availableDays, day];
      
      const updatedConfig = {
        ...timeSlotConfig,
        availableDays: updatedDays
      };
      
      const response = await fetch(`${API_URL}/time-slots/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeSlotConfig(data.config);
        showNotification(`${day} ${updatedDays.includes(day) ? 'added to' : 'removed from'} available days`, 'success');
      } else {
        throw new Error(data.message || 'Failed to update available days');
      }
    } catch (error) {
      console.error('Error updating available days:', error);
      showNotification('Failed to update available days', 'error');
    }
  };
  
  // Update lead time
  const handleLeadTimeChange = async (value: number) => {
    try {
      const updatedConfig = {
        ...timeSlotConfig,
        leadTime: value
      };
      
      const response = await fetch(`${API_URL}/time-slots/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeSlotConfig(data.config);
        showNotification('Lead time updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update lead time');
      }
    } catch (error) {
      console.error('Error updating lead time:', error);
      showNotification('Failed to update lead time', 'error');
    }
  };
  
  // Update max advance booking days
  const handleMaxAdvanceDaysChange = async (value: number) => {
    try {
      const updatedConfig = {
        ...timeSlotConfig,
        maxAdvanceBookingDays: value
      };
      
      const response = await fetch(`${API_URL}/time-slots/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeSlotConfig(data.config);
        showNotification('Maximum advance booking days updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update maximum advance booking days');
      }
    } catch (error) {
      console.error('Error updating maximum advance booking days:', error);
      showNotification('Failed to update maximum advance booking days', 'error');
    }
  };
  
  // Add new time slot
  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!newSlot.startTime || !newSlot.endTime || newSlot.maxOrders <= 0) {
        showNotification('Please fill out all fields correctly', 'error');
        return;
      }
      
      const response = await fetch(`${API_URL}/time-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeSlotConfig(data.config);
        setNewSlot({
          startTime: '',
          endTime: '',
          maxOrders: 5
        });
        setShowAddForm(false);
        showNotification('Time slot added successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to add time slot');
      }
    } catch (error) {
      console.error('Error adding time slot:', error);
      showNotification('Failed to add time slot', 'error');
    }
  };
  
  // Edit time slot
  const handleEditTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSlot) return;
    
    try {
      // Validation
      if (!editingSlot.startTime || !editingSlot.endTime || editingSlot.maxOrders <= 0) {
        showNotification('Please fill out all fields correctly', 'error');
        return;
      }
      
      const response = await fetch(`${API_URL}/time-slots/${editingSlot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSlot)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeSlotConfig(data.config);
        setEditingSlot(null);
        showNotification('Time slot updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update time slot');
      }
    } catch (error) {
      console.error('Error updating time slot:', error);
      showNotification('Failed to update time slot', 'error');
    }
  };
  
  // Delete time slot
  const handleDeleteTimeSlot = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/time-slots/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeSlotConfig(data.config);
        showNotification('Time slot deleted successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to delete time slot');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      showNotification('Failed to delete time slot', 'error');
    }
  };
  
  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow-sm">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded shadow-sm">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Error Loading Time Slots</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTimeSlotConfig}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Admin - Pickup Time Management | Lentil Life</title>
      </Helmet>
      
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light">Pickup Time Management</h1>
        <button
          onClick={() => fetchTimeSlotConfig()}
          className="text-sm flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-6 p-4 rounded ${
            notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {notification.message}
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available days */}
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-lg font-light mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Available Days
          </h2>
          
          <div className="space-y-3">
            {daysOfWeek.map(day => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={timeSlotConfig.availableDays.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor={`day-${day}`} className="cursor-pointer">
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order settings */}
        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-lg font-light mb-4">Order Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="leadTime" className="block text-sm text-gray-600 mb-1">
                Lead Time (days in advance)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="leadTime"
                  min="0"
                  max="14"
                  value={timeSlotConfig.leadTime}
                  onChange={(e) => handleLeadTimeChange(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-20 text-center"
                />
                <span className="ml-2 text-sm text-gray-500">
                  {timeSlotConfig.leadTime === 0 
                    ? 'Orders can be placed for same day' 
                    : timeSlotConfig.leadTime === 1 
                      ? 'Orders must be placed at least 1 day in advance' 
                      : `Orders must be placed at least ${timeSlotConfig.leadTime} days in advance`}
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="maxDays" className="block text-sm text-gray-600 mb-1">
                Maximum Advance Booking (days)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="maxDays"
                  min="1"
                  max="90"
                  value={timeSlotConfig.maxAdvanceBookingDays}
                  onChange={(e) => handleMaxAdvanceDaysChange(Number(e.target.value))}
                  className="border rounded px-3 py-2 w-20 text-center"
                />
                <span className="ml-2 text-sm text-gray-500">
                  {timeSlotConfig.maxAdvanceBookingDays === 1 
                    ? 'Orders can be placed up to 1 day in advance'
                    : `Orders can be placed up to ${timeSlotConfig.maxAdvanceBookingDays} days in advance`}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Time slots */}
        <div className="lg:col-span-3 bg-white p-6 rounded shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-light flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Time Slots
            </h2>
            
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-black text-white px-3 py-1 rounded text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New Slot
              </button>
            )}
          </div>
          
          {/* Add new time slot form */}
          {showAddForm && (
            <form onSubmit={handleAddTimeSlot} className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="text-base mb-3">Add New Time Slot</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm text-gray-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endTime" className="block text-sm text-gray-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="maxOrders" className="block text-sm text-gray-600 mb-1">
                    Maximum Orders
                  </label>
                  <input
                    type="number"
                    id="maxOrders"
                    min="1"
                    value={newSlot.maxOrders}
                    onChange={(e) => setNewSlot({ ...newSlot, maxOrders: Number(e.target.value) })}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSlot({ startTime: '', endTime: '', maxOrders: 5 });
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-3 py-1 bg-black text-white rounded text-sm flex items-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
              </div>
            </form>
          )}
          
          {/* Time slots table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm">
                  <th className="px-4 py-2">Start Time</th>
                  <th className="px-4 py-2">End Time</th>
                  <th className="px-4 py-2">Maximum Orders</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeSlotConfig.timeSlots.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                      No time slots configured yet. Add your first time slot to get started.
                    </td>
                  </tr>
                ) : (
                  timeSlotConfig.timeSlots.map(slot => (
                    <tr key={slot.id} className="border-t">
                      {editingSlot?.id === slot.id ? (
                        // Edit mode
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="time"
                              value={editingSlot.startTime}
                              onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                              className="border rounded px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="time"
                              value={editingSlot.endTime}
                              onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                              className="border rounded px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="1"
                              value={editingSlot.maxOrders}
                              onChange={(e) => setEditingSlot({ ...editingSlot, maxOrders: Number(e.target.value) })}
                              className="border rounded px-2 py-1 w-24"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={handleEditTimeSlot}
                              className="p-1 text-green-600 hover:text-green-800 mr-2"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingSlot(null)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-4 py-2">
                            {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-2">
                            {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-2">{slot.maxOrders}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => setEditingSlot(slot)}
                              className="p-1 text-blue-600 hover:text-blue-800 mr-2"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTimeSlotPage; 