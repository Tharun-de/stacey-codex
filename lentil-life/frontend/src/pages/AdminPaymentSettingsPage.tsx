import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Save, AlertCircle, RefreshCw, Image as ImageIcon, AtSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';
import AdminSidebar from '../components/AdminSidebar';

interface PaymentSettings {
  venmoUsername: string;
  venmoQrCodeUrl: string;
  // Add other payment settings here in the future if needed
}

const AdminPaymentSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/payment-settings`);
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      } else {
        setError(data.message || 'Failed to load payment settings.');
      }
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('An error occurred while fetching settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/payment-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        showNotification('Payment settings updated successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to update settings.', 'error');
      }
    } catch (err) {
      console.error('Error updating payment settings:', err);
      showNotification('An error occurred while saving settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Error Loading Settings</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchSettings} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!settings) {
     // This case should ideally be handled by the error state or initial empty state
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8 text-center">
          <p>No payment settings found or an error occurred.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Helmet>
          <title>Admin - Payment Settings | Lentil Life</title>
        </Helmet>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-light">Payment Settings</h1>
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="text-sm flex items-center gap-1 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

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

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm max-w-lg mx-auto">
          <h2 className="text-lg font-light mb-6 border-b pb-3">Venmo Configuration</h2>

          <div className="mb-6">
            <label htmlFor="venmoUsername" className="block text-sm text-gray-600 mb-2 flex items-center">
              <AtSign className="w-4 h-4 mr-2 text-gray-400" />
              Venmo Username
            </label>
            <input
              type="text"
              id="venmoUsername"
              name="venmoUsername"
              value={settings.venmoUsername}
              onChange={handleInputChange}
              placeholder="@YourVenmoHandle"
              className="w-full p-3 border border-gray-300 rounded font-light"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Your public Venmo username (e.g., @John-Doe-123).</p>
          </div>

          <div className="mb-8">
            <label htmlFor="venmoQrCodeUrl" className="block text-sm text-gray-600 mb-2 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2 text-gray-400" />
              Venmo QR Code Image URL (Optional)
            </label>
            <input
              type="url"
              id="venmoQrCodeUrl"
              name="venmoQrCodeUrl"
              value={settings.venmoQrCodeUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/your-venmo-qr.png"
              className="w-full p-3 border border-gray-300 rounded font-light"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link to your Venmo QR code image. Customers will see this to scan.
            </p>
            {settings.venmoQrCodeUrl && (
              <div className="mt-3 p-2 border rounded inline-block">
                <img 
                  src={settings.venmoQrCodeUrl} 
                  alt="Venmo QR Code Preview" 
                  className="h-24 w-24 object-contain" 
                  onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-black text-white px-6 py-2 rounded text-sm flex items-center hover:bg-gray-800 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminPaymentSettingsPage; 