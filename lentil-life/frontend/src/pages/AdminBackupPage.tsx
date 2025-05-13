import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Check, 
  AlertCircle, 
  Database, 
  RotateCcw, 
  Trash2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_URL } from '../App';

interface Backup {
  id: string;
  name: string;
  createdAt: string;
  size: number;
}

const AdminBackupPage: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch backups
  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/backups`);
      const data = await response.json();
      
      if (data.success) {
        setBackups(data.backups);
      } else {
        setNotification({
          show: true,
          message: data.message || 'Failed to load backups',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      setNotification({
        show: true,
        message: 'Error connecting to server. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load backups on component mount
  useEffect(() => {
    fetchBackups();
  }, []);

  // Create a new backup
  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const response = await fetch(`${API_URL}/backup`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          show: true,
          message: 'Backup created successfully',
          type: 'success'
        });
        
        // Refresh the list of backups
        fetchBackups();
      } else {
        setNotification({
          show: true,
          message: data.message || 'Failed to create backup',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setNotification({
        show: true,
        message: 'Error creating backup. Please try again.',
        type: 'error'
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  // Restore from backup
  const handleRestore = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to restore from this backup? This will overwrite your current data.')) {
      return;
    }
    
    try {
      setRestoring(true);
      setSelectedBackup(backupId);
      
      const response = await fetch(`${API_URL}/restore/${backupId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          show: true,
          message: 'Backup restored successfully. Please refresh the page to see changes.',
          type: 'success'
        });
      } else {
        setNotification({
          show: true,
          message: data.message || 'Failed to restore backup',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      setNotification({
        show: true,
        message: 'Error restoring backup. Please try again.',
        type: 'error'
      });
    } finally {
      setRestoring(false);
      setSelectedBackup(null);
    }
  };

  // Delete a backup
  const handleDelete = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/backup/${backupId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          show: true,
          message: 'Backup deleted successfully',
          type: 'success'
        });
        
        // Remove the deleted backup from the list
        setBackups(backups.filter(backup => backup.id !== backupId));
      } else {
        setNotification({
          show: true,
          message: data.message || 'Failed to delete backup',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      setNotification({
        show: true,
        message: 'Error deleting backup. Please try again.',
        type: 'error'
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  // Close notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  return (
    <>
      <Helmet>
        <title>Backup Management | Lentil Life</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">Backup Management</h1>
              <div className="flex space-x-1">
                <Link
                  to="/admin/menu"
                  className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Back to Menu
                </Link>
              </div>
            </div>

            {/* Notification */}
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mx-6 mt-4 p-4 rounded-md flex items-start ${
                  notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <span>{notification.message}</span>
              </motion.div>
            )}

            {/* Content */}
            <div className="p-6">
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-start mb-4 md:mb-0">
                  <div className="bg-[#7D9D74]/10 p-3 rounded-full mr-4">
                    <Database className="w-6 h-6 text-[#7D9D74]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium mb-1">Data Backups</h2>
                    <p className="text-gray-600">
                      Manage backups of your menu data. These backups can be restored in case of data loss.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleCreateBackup}
                  disabled={creatingBackup}
                  className="flex items-center justify-center px-4 py-2 bg-[#7D9D74] text-white rounded-md hover:bg-[#5D7D54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingBackup ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Create Backup
                    </>
                  )}
                </button>
              </div>
              
              {/* Backups List */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium">Available Backups</h3>
                </div>
                
                {loading ? (
                  <div className="p-6 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Loading backups...</p>
                  </div>
                ) : backups.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {backups.map(backup => (
                      <div key={backup.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">{formatDate(backup.createdAt)}</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Size: {formatFileSize(backup.size)}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-3 md:mt-0">
                          <button
                            onClick={() => handleRestore(backup.id)}
                            disabled={restoring}
                            className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center"
                            title="Restore from this backup"
                          >
                            {restoring && selectedBackup === backup.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            <span className="ml-1 text-sm">Restore</span>
                          </button>
                          
                          <button
                            onClick={() => handleDelete(backup.id)}
                            disabled={restoring}
                            className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center"
                            title="Delete this backup"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="ml-1 text-sm">Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No backups available. Create your first backup now!</p>
                  </div>
                )}
              </div>
              
              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-md text-blue-700">
                <h3 className="font-medium mb-2">About Backups</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Automatic backups are created daily</li>
                  <li>Only the 10 most recent backups are kept</li>
                  <li>Restoring a backup will overwrite current data</li>
                  <li>Create a manual backup before making significant changes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminBackupPage; 