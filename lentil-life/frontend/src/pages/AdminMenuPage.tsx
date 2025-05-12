import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Upload, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  FileText, 
  Download, 
  Plus, 
  Edit,
  Save,
  Trash2,
  Image,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { menuItems } from '../data/menuData';
import { API_URL } from '../App';

// Remove hardcoded API URL
// const API_URL = 'http://localhost:4000/api'; // Change this to your actual API URL in production

// Define MenuItemAdmin interface specifically for the admin panel
interface MenuItemAdmin {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image: string;
  additionalImages?: string[]; // Array of additional image URLs
  isVegan?: boolean;
  isGlutenFree?: boolean;
  ingredients?: string[]; // Add ingredients array
  nutritionalInfo?: {     // Add nutritional info
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

const AdminMenuPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'update' | 'directEdit'>('directEdit');
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [items, setItems] = useState<MenuItemAdmin[]>(menuItems.map(item => ({
    id: String(item.id),
    name: item.name,
    price: item.price,
    category: item.category,
    description: item.description,
    image: item.image,
    isVegan: item.dietaryInfo?.vegan,
    isGlutenFree: item.dietaryInfo?.glutenFree
  })));
  const [editingItem, setEditingItem] = useState<MenuItemAdmin | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItemAdmin>>({
    name: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    additionalImages: [],
    isVegan: false,
    isGlutenFree: false,
    ingredients: [], // Initialize ingredients as empty array
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    } // Initialize nutritional info
  });
  const [isAddingItem, setIsAddingItem] = useState(false);

  // File input refs
  const newItemImageRef = useRef<HTMLInputElement>(null);
  const editItemImageRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Add state for additional image upload functionality
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const editAdditionalImagesInputRef = useRef<HTMLInputElement>(null);

  // Load menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_URL}/menu/items`);
        const data = await response.json();
        if (data.success) {
          setItems(data.items.map((item: {
            id: number;
            name: string;
            price: number;
            category: string;
            description?: string;
            image: string;
            additionalImages?: string[];
            ingredients: string[];
            nutritionalInfo: {
              calories: number;
              protein: number;
              carbs: number;
              fat: number;
              fiber: number;
            };
            dietaryInfo?: {
              vegan: boolean;
              vegetarian: boolean;
              glutenFree: boolean;
              dairyFree: boolean;
            };
          }) => ({
            id: String(item.id),
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            image: item.image,
            additionalImages: item.additionalImages || [],
            ingredients: item.ingredients || [],
            nutritionalInfo: item.nutritionalInfo || {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0
            },
            isVegan: item.dietaryInfo?.vegan,
            isGlutenFree: item.dietaryInfo?.glutenFree
          })));
        } else {
          setNotification({
            show: true,
            message: data.message || 'Failed to load menu items',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setNotification({
          show: true,
          message: 'Error connecting to server. Please try again.',
          type: 'error'
        });
      }
    };
    fetchMenuItems();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setNotification({
        show: true,
        message: 'Please select a file to upload',
        type: 'error'
      });
      return;
    }

    // Check if it's an Excel file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setNotification({
        show: true,
        message: 'Please upload an Excel file (.xlsx or .xls)',
        type: 'error'
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('menuFile', file);

    try {
      const response = await fetch(`${API_URL}/menu/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          show: true,
          message: 'Menu updated successfully! Refresh the page to see changes.',
          type: 'success'
        });
        // Reset file input
        setFile(null);
        // Reset file input element
        const fileInput = document.getElementById('menuFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setNotification({
          show: true,
          message: result.message || 'Failed to upload menu data',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setNotification({
        show: true,
        message: 'Error uploading file. Please try again.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle Google Sheets sync
  const handleSync = async () => {
    setSyncing(true);

    try {
      const response = await fetch(`${API_URL}/menu/sync`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        setNotification({
          show: true,
          message: 'Menu synced successfully! Refresh the page to see changes.',
          type: 'success'
        });
      } else {
        setNotification({
          show: true,
          message: result.message || 'Failed to sync menu data',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error syncing with Google Sheets:', error);
      setNotification({
        show: true,
        message: 'Error connecting to server. Please try again.',
        type: 'error'
      });
    } finally {
      setSyncing(false);
    }
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    const templateURL = '/menuTemplateStructure.txt';
    
    const link = document.createElement('a');
    link.href = templateURL;
    link.download = 'menu-template-structure.txt';
    link.click();
  };

  // Close notification after 5 seconds
  React.useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Get unique categories plus add standard categories
  const getCategories = () => {
    const existingCategories = Array.from(new Set(items.map(item => item.category)));
    const standardCategories = ['breakfast', 'lunch', 'dinner', 'dessert'];
    
    // Combine existing categories with standard categories, removing duplicates
    const allCategories = Array.from(new Set([...existingCategories, ...standardCategories]));
    
    return allCategories;
  };

  const categories = getCategories();

  // Start editing an item
  const handleEditItem = (item: MenuItemAdmin) => {
    setEditingItem({ ...item });
  };

  // Save edited item
  const handleSaveItem = async () => {
    if (!editingItem) return;

    try {
      // Transform the item data to match API expectations
      const apiItem = {
        name: editingItem.name,
        price: editingItem.price,
        category: editingItem.category,
        description: editingItem.description || '',
        image: editingItem.image,
        additionalImages: editingItem.additionalImages || [],
        popular: false, // Default value
        dietaryInfo: {
          vegan: editingItem.isVegan || false,
          vegetarian: true, // Default value
          glutenFree: editingItem.isGlutenFree || false,
          dairyFree: false // Default value
        },
        nutritionalInfo: editingItem.nutritionalInfo || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        ingredients: editingItem.ingredients || []
      };

      const response = await fetch(`${API_URL}/menu/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiItem)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setItems(items.map(item => 
          item.id === editingItem.id ? editingItem : item
        ));
        
        setNotification({
          show: true,
          message: 'Menu item updated successfully!',
          type: 'success'
        });
        
        setEditingItem(null);
      } else {
        setNotification({
          show: true,
          message: result.message || 'Failed to update menu item',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      setNotification({
        show: true,
        message: 'Error updating menu item. Please try again.',
        type: 'error'
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${API_URL}/menu/items/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setItems(items.filter(item => item.id !== id));
        
        setNotification({
          show: true,
          message: 'Menu item deleted successfully!',
          type: 'success'
        });
      } else {
        setNotification({
          show: true,
          message: result.message || 'Failed to delete menu item',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setNotification({
        show: true,
        message: 'Error deleting menu item. Please try again.',
        type: 'error'
      });
    }
  };

  // Handle input change for editing
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingItem) return;
    
    const { name, value, type } = e.target as HTMLInputElement;
    
    setEditingItem(prev => ({
      ...prev!,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }));
  };

  // Handle adding new item
  const handleAddItem = () => {
    setIsAddingItem(true);
  };

  // Handle input change for new item
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }));
  };

  // Save new item
  const handleSaveNewItem = async () => {
    // Validate required fields
    if (!newItem.name || !newItem.price || !newItem.category) {
      setNotification({
        show: true,
        message: 'Name, price, and category are required',
        type: 'error'
      });
      return;
    }

    // Validate image
    if (!newItem.image) {
      setNotification({
        show: true,
        message: 'Please upload a main image for the item',
        type: 'error'
      });
      return;
    }

    try {
      // Transform the form data to match the API expectations
      const apiItem = {
        name: newItem.name,
        price: newItem.price,
        category: newItem.category,
        description: newItem.description || '',
        image: newItem.image,
        additionalImages: newItem.additionalImages || [],
        popular: false, // Default value
        dietaryInfo: {
          vegan: newItem.isVegan || false,
          vegetarian: true, // Default value
          glutenFree: newItem.isGlutenFree || false,
          dairyFree: false // Default value
        },
        nutritionalInfo: newItem.nutritionalInfo || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        },
        ingredients: newItem.ingredients || []
      };

      const response = await fetch(`${API_URL}/menu/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiItem)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add new item to local state with the returned id
        const addedItem = {
          id: String(result.item.id),
          name: newItem.name,
          price: Number(newItem.price),
          category: newItem.category,
          description: newItem.description,
          image: newItem.image || 'https://via.placeholder.com/100',
          isVegan: newItem.isVegan,
          isGlutenFree: newItem.isGlutenFree
        };
        
        setItems([...items, addedItem]);
        
        setNotification({
          show: true,
          message: 'Menu item added successfully!',
          type: 'success'
        });
        
        // Reset form
        setNewItem({
          name: '',
          price: 0,
          category: '',
          description: '',
          image: '',
          additionalImages: [],
          isVegan: false,
          isGlutenFree: false,
          ingredients: [],
          nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          }
        });
        setIsAddingItem(false);
      } else {
        setNotification({
          show: true,
          message: result.message || 'Failed to add menu item',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      setNotification({
        show: true,
        message: 'Error adding menu item. Please try again.',
        type: 'error'
      });
    }
  };

  // Cancel adding new item
  const handleCancelAddItem = () => {
    setIsAddingItem(false);
    setNewItem({
      name: '',
      price: 0,
      category: '',
      description: '',
      image: '',
      additionalImages: [],
      isVegan: false,
      isGlutenFree: false,
      ingredients: [],
      nutritionalInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
      }
    });
  };

  // Update the uploadNewItemImage function to handle multiple image upload
  const uploadNewItemImage = async (file: File, isMainImage = true) => {
    if (!file) {
      setNotification({
        show: true,
        message: 'Please select an image file',
        type: 'error'
      });
      return null;
    }

    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      setNotification({
        show: true,
        message: 'Please upload an image file (JPEG, PNG, or GIF)',
        type: 'error'
      });
      return null;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const imageUrl = result.imageUrl;
        
        if (isMainImage) {
          // If this is the main image, update the image field
          setNewItem(prevItem => ({
            ...prevItem,
            image: imageUrl
          }));
        } else {
          // If this is an additional image, add it to the additionalImages array
          setNewItem(prevItem => ({
            ...prevItem,
            additionalImages: [...(prevItem.additionalImages || []), imageUrl]
          }));
        }

        setNotification({
          show: true,
          message: 'Image uploaded successfully',
          type: 'success'
        });
        
        return imageUrl;
      } else {
        setNotification({
          show: true,
          message: result.message || 'Failed to upload image',
          type: 'error'
        });
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({
        show: true,
        message: 'Error uploading image. Please try again.',
        type: 'error'
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Update the uploadEditItemImage function for multiple image upload
  const uploadEditItemImage = async (file: File, isMainImage = true) => {
    if (!file) {
      setNotification({
        show: true,
        message: 'Please select an image file',
        type: 'error'
      });
      return null;
    }

    if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
      setNotification({
        show: true,
        message: 'Please upload an image file (JPEG, PNG, or GIF)',
        type: 'error'
      });
      return null;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const imageUrl = result.imageUrl;
        
        if (isMainImage) {
          // If this is the main image, update the image field
          setEditingItem(prevItem => {
            if (!prevItem) return null;
            return {
              ...prevItem,
              image: imageUrl
            };
          });
        } else {
          // If this is an additional image, add it to the additionalImages array
          setEditingItem(prevItem => {
            if (!prevItem) return null;
            return {
              ...prevItem,
              additionalImages: [...(prevItem.additionalImages || []), imageUrl]
            };
          });
        }

        setNotification({
          show: true,
          message: 'Image uploaded successfully',
          type: 'success'
        });
        
        return imageUrl;
      } else {
        setNotification({
          show: true,
          message: result.message || 'Failed to upload image',
          type: 'error'
        });
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({
        show: true,
        message: 'Error uploading image. Please try again.',
        type: 'error'
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Add function to handle additional image upload for new item
  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadNewItemImage(e.target.files[0], false);
    }
  };

  // Add function to handle additional image upload for editing item
  const handleEditAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadEditItemImage(e.target.files[0], false);
    }
  };

  // Add function to remove an additional image
  const handleRemoveAdditionalImage = (index: number, isNewItem: boolean) => {
    if (isNewItem) {
      setNewItem(prevItem => {
        const updatedImages = [...(prevItem.additionalImages || [])];
        updatedImages.splice(index, 1);
        return {
          ...prevItem,
          additionalImages: updatedImages
        };
      });
    } else {
      setEditingItem(prevItem => {
        if (!prevItem) return null;
        const updatedImages = [...(prevItem.additionalImages || [])];
        updatedImages.splice(index, 1);
        return {
          ...prevItem,
          additionalImages: updatedImages
        };
      });
    }
  };

  // Handle image file selection for new item (main image)
  const handleNewItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadNewItemImage(e.target.files[0], true);
    }
  };

  // Handle image file selection for editing item (main image)
  const handleEditItemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadEditItemImage(e.target.files[0], true);
    }
  };

  // Function to add ingredient to new item
  const handleAddIngredient = () => {
    const newIngredient = prompt("Enter ingredient:");
    if (newIngredient && newIngredient.trim()) {
      setNewItem(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), newIngredient.trim()]
      }));
    }
  };

  // Function to remove ingredient from new item
  const handleRemoveIngredient = (index: number) => {
    setNewItem(prev => {
      const updatedIngredients = [...(prev.ingredients || [])];
      updatedIngredients.splice(index, 1);
      return {
        ...prev,
        ingredients: updatedIngredients
      };
    });
  };

  // Function to add ingredient when editing an item
  const handleAddEditIngredient = () => {
    const newIngredient = prompt("Enter ingredient:");
    if (newIngredient && newIngredient.trim() && editingItem) {
      setEditingItem(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ingredients: [...(prev.ingredients || []), newIngredient.trim()]
        };
      });
    }
  };

  // Function to remove ingredient when editing an item
  const handleRemoveEditIngredient = (index: number) => {
    setEditingItem(prev => {
      if (!prev) return null;
      const updatedIngredients = [...(prev.ingredients || [])];
      updatedIngredients.splice(index, 1);
      return {
        ...prev,
        ingredients: updatedIngredients
      };
    });
  };

  // Handle nutritional info change for new item
  const handleNutritionalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      nutritionalInfo: {
        ...(prev.nutritionalInfo || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        }),
        [name]: parseInt(value) || 0
      }
    }));
  };

  // Handle nutritional info change for editing item
  const handleEditNutritionalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    
    const { name, value } = e.target;
    setEditingItem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        nutritionalInfo: {
          ...(prev.nutritionalInfo || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          }),
          [name]: parseInt(value) || 0
        }
      };
    });
  };

  return (
    <>
      <Helmet>
        <title>Menu Management | Lentil Life</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header with tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('view')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'view' 
                      ? 'bg-[#7D9D74] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  View Menu
                </button>
                <button
                  onClick={() => setActiveTab('directEdit')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'directEdit' 
                      ? 'bg-[#7D9D74] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Edit Menu
                </button>
                <button
                  onClick={() => setActiveTab('update')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'update' 
                      ? 'bg-[#7D9D74] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bulk Update
                </button>
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

            {/* Content based on active tab */}
            <div className="p-6">
              {activeTab === 'view' ? (
                /* View Menu Tab */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-[#7D9D74]" />
                      Current Menu Items ({items.length})
              </h2>
              <Link 
                to="/shop" 
                className="text-[#7D9D74] hover:text-[#5D7D54] font-medium"
              >
                      View Live Menu
              </Link>
            </div>

                  {/* Menu Categories */}
                  <div className="space-y-6">
                    {categories.map(category => (
                      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="font-medium capitalize">{category}</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {items
                            .filter(item => item.category === category)
                            .map(item => (
                              <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-12 h-12 rounded-md object-cover" 
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'directEdit' ? (
                /* Direct Edit Menu Tab */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Edit className="w-5 h-5 mr-2 text-[#7D9D74]" />
                      Edit Menu Items Directly
                    </h2>
                    <button
                      onClick={handleAddItem}
                      className="flex items-center px-3 py-1.5 bg-[#7D9D74] text-white rounded-md hover:bg-[#5D7D54]"
                      disabled={isAddingItem}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                  
                  {/* Add New Item Form */}
                  {isAddingItem && (
                    <div className="mb-6 p-4 border border-dashed border-[#7D9D74] rounded-lg bg-[#7D9D74]/5">
                      <h3 className="font-medium mb-3 text-[#5D7D54]">Add New Menu Item</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                          <input
                            type="text"
                            name="name"
                            value={newItem.name}
                            onChange={handleNewItemChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                          <select
                            name="category"
                            value={newItem.category}
                            onChange={handleNewItemChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                            <option value="new">+ New Category</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)*</label>
                          <input
                            type="number"
                            name="price"
                            value={newItem.price}
                            onChange={handleNewItemChange}
                            step="0.01"
                            min="0"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              name="image"
                              value={newItem.image || ''}
                              onChange={handleNewItemChange}
                              placeholder="Image URL or upload an image"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => newItemImageRef.current?.click()}
                              className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? <Loader className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
                            </button>
                            <input
                              type="file"
                              ref={newItemImageRef}
                              onChange={handleNewItemImageChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                          {newItem.image && (
                            <div className="mt-2">
                              <img 
                                src={newItem.image} 
                                alt="Preview" 
                                className="w-20 h-20 object-cover rounded-md border border-gray-300" 
                              />
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            name="description"
                            value={newItem.description}
                            onChange={handleNewItemChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              name="isVegan"
                              checked={newItem.isVegan}
                              onChange={handleNewItemChange}
                              className="mr-2"
                            />
                            Vegan
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              name="isGlutenFree"
                              checked={newItem.isGlutenFree}
                              onChange={handleNewItemChange}
                              className="mr-2"
                            />
                            Gluten Free
                          </label>
                        </div>
                        {/* Additional Images */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Images (optional)
                          </label>
                          
                          {/* Display current additional images */}
                          {newItem.additionalImages && newItem.additionalImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {newItem.additionalImages.map((img, index) => (
                                <div key={index} className="relative group">
                                  <img 
                                    src={img} 
                                    alt={`Additional ${index + 1}`} 
                                    className="w-16 h-16 object-cover border border-gray-200 rounded"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => handleRemoveAdditionalImage(index, true)}
                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Upload additional images button */}
                          <div className="flex items-center mt-1">
                            <button
                              type="button"
                              onClick={() => additionalImagesInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {uploadingImage ? (
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4 mr-2" />
                              )}
                              Add More Images
                            </button>
                            <input
                              type="file"
                              ref={additionalImagesInputRef}
                              onChange={handleAdditionalImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <span className="ml-2 text-xs text-gray-500">
                              You can add multiple images for better product visualization
                            </span>
                          </div>
                        </div>
                        {/* Ingredients Section */}
                        <div className="md:col-span-2 mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ingredients
                          </label>
                          
                          <div className="mb-2 flex flex-wrap gap-2">
                            {(newItem.ingredients || []).map((ingredient, index) => (
                              <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                <span className="text-sm">{ingredient}</span>
                                <button 
                                  type="button"
                                  onClick={() => handleRemoveIngredient(index)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Ingredient
                          </button>
                        </div>
                        {/* Nutritional Information Section */}
                        <div className="md:col-span-2 mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nutritional Information
                          </label>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Calories</label>
                              <input
                                type="number"
                                name="calories"
                                value={newItem.nutritionalInfo?.calories || 0}
                                onChange={handleNutritionalInfoChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                              <input
                                type="number"
                                name="protein"
                                value={newItem.nutritionalInfo?.protein || 0}
                                onChange={handleNutritionalInfoChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                              <input
                                type="number"
                                name="carbs"
                                value={newItem.nutritionalInfo?.carbs || 0}
                                onChange={handleNutritionalInfoChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                              <input
                                type="number"
                                name="fat"
                                value={newItem.nutritionalInfo?.fat || 0}
                                onChange={handleNutritionalInfoChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Fiber (g)</label>
                              <input
                                type="number"
                                name="fiber"
                                value={newItem.nutritionalInfo?.fiber || 0}
                                onChange={handleNutritionalInfoChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={handleCancelAddItem}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                <button
                          onClick={handleSaveNewItem}
                          className="px-3 py-1.5 bg-[#7D9D74] text-white rounded-md hover:bg-[#5D7D54]"
                        >
                          <Save className="w-4 h-4 mr-1 inline-block" />
                          Save Item
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Edit Menu Categories */}
                  <div className="space-y-6">
                    {categories.map(category => (
                      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="font-medium capitalize">{category}</h3>
                          {items.filter(item => item.category === category).length === 0 && (
                            <span className="text-sm text-gray-500">No items in this category</span>
                          )}
                        </div>
                        <div className="divide-y divide-gray-200">
                          {items
                            .filter(item => item.category === category)
                            .map(item => (
                              <div key={item.id} className="p-4">
                                {editingItem && editingItem.id === item.id ? (
                                  /* Edit Form */
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                      <input
                                        type="text"
                                        name="name"
                                        value={editingItem.name}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                      <select
                                        name="category"
                                        value={editingItem.category}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      >
                                        {categories.map(cat => (
                                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                      <input
                                        type="number"
                                        name="price"
                                        value={editingItem.price}
                                        onChange={handleEditInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="text"
                                          name="image"
                                          value={editingItem.image}
                                          onChange={handleEditInputChange}
                                          className="w-full p-2 border border-gray-300 rounded-md"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => editItemImageRef.current?.click()}
                                          className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                                          disabled={uploadingImage}
                                        >
                                          {uploadingImage ? <Loader className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
                                        </button>
                                        <input
                                          type="file"
                                          ref={editItemImageRef}
                                          onChange={handleEditItemImageChange}
                                          accept="image/*"
                                          className="hidden"
                                        />
                                      </div>
                                      {editingItem.image && (
                                        <div className="mt-2">
                                          <img 
                                            src={editingItem.image} 
                                            alt="Preview" 
                                            className="w-20 h-20 object-cover rounded-md border border-gray-300" 
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="md:col-span-2">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                      <textarea
                                        name="description"
                                        value={editingItem.description || ''}
                                        onChange={handleEditInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <label className="flex items-center text-sm font-medium text-gray-700">
                                        <input
                                          type="checkbox"
                                          name="isVegan"
                                          checked={editingItem.isVegan || false}
                                          onChange={handleEditInputChange}
                                          className="mr-2"
                                        />
                                        Vegan
                                      </label>
                                    </div>
                                    <div>
                                      <label className="flex items-center text-sm font-medium text-gray-700">
                                        <input
                                          type="checkbox"
                                          name="isGlutenFree"
                                          checked={editingItem.isGlutenFree || false}
                                          onChange={handleEditInputChange}
                                          className="mr-2"
                                        />
                                        Gluten Free
                                      </label>
                                    </div>
                                    {/* Additional Images */}
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Additional Images (optional)
                                      </label>
                                      
                                      {/* Display current additional images */}
                                      {editingItem.additionalImages && editingItem.additionalImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                          {editingItem.additionalImages.map((img, index) => (
                                            <div key={index} className="relative group">
                                              <img 
                                                src={img} 
                                                alt={`Additional ${index + 1}`} 
                                                className="w-16 h-16 object-cover border border-gray-200 rounded"
                                              />
                                              <button 
                                                type="button"
                                                onClick={() => handleRemoveAdditionalImage(index, false)}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      
                                      {/* Upload additional images button */}
                                      <div className="flex items-center mt-1">
                                        <button
                                          type="button"
                                          onClick={() => editAdditionalImagesInputRef.current?.click()}
                                          disabled={uploadingImage}
                                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                          {uploadingImage ? (
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                          ) : (
                                            <Plus className="w-4 h-4 mr-2" />
                                          )}
                                          Add More Images
                                        </button>
                                        <input
                                          type="file"
                                          ref={editAdditionalImagesInputRef}
                                          onChange={handleEditAdditionalImageUpload}
                                          accept="image/*"
                                          className="hidden"
                                        />
                                        <span className="ml-2 text-xs text-gray-500">
                                          You can add multiple images for better product visualization
                                        </span>
                                      </div>
                                    </div>
                                    {/* Ingredients Section for Edit Item */}
                                    <div className="md:col-span-2 mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ingredients
                                      </label>
                                      
                                      <div className="mb-2 flex flex-wrap gap-2">
                                        {(editingItem?.ingredients || []).map((ingredient, index) => (
                                          <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                            <span className="text-sm">{ingredient}</span>
                                            <button 
                                              type="button"
                                              onClick={() => handleRemoveEditIngredient(index)}
                                              className="ml-1 text-red-500 hover:text-red-700"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={handleAddEditIngredient}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Ingredient
                                      </button>
                                    </div>
                                    {/* Nutritional Information Section for Edit Item */}
                                    <div className="md:col-span-2 mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nutritional Information
                                      </label>
                                      
                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Calories</label>
                                          <input
                                            type="number"
                                            name="calories"
                                            value={editingItem?.nutritionalInfo?.calories || 0}
                                            onChange={handleEditNutritionalInfoChange}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            min="0"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                                          <input
                                            type="number"
                                            name="protein"
                                            value={editingItem?.nutritionalInfo?.protein || 0}
                                            onChange={handleEditNutritionalInfoChange}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            min="0"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                                          <input
                                            type="number"
                                            name="carbs"
                                            value={editingItem?.nutritionalInfo?.carbs || 0}
                                            onChange={handleEditNutritionalInfoChange}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            min="0"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                                          <input
                                            type="number"
                                            name="fat"
                                            value={editingItem?.nutritionalInfo?.fat || 0}
                                            onChange={handleEditNutritionalInfoChange}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            min="0"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-500 mb-1">Fiber (g)</label>
                                          <input
                                            type="number"
                                            name="fiber"
                                            value={editingItem?.nutritionalInfo?.fiber || 0}
                                            onChange={handleEditNutritionalInfoChange}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            min="0"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="md:col-span-2 flex justify-end space-x-2">
                                      <button
                                        onClick={handleCancelEdit}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleSaveItem}
                                        className="px-3 py-1.5 bg-[#7D9D74] text-white rounded-md hover:bg-[#5D7D54]"
                                      >
                                        <Save className="w-4 h-4 mr-1 inline-block" />
                                        Save Changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Item Display */
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-14 h-14 rounded-md object-cover mr-4" 
                                      />
                                      <div>
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                                        {item.description && (
                                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                        title="Edit item"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                        title="Delete item"
                                      >
                                        <Trash2 className="w-4 h-4" />
                </button>
                                  </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Bulk Update Menu Tab */
                <div>
                  <h2 className="text-xl font-semibold mb-6">Bulk Update Menu:</h2>
                  
                  <div className="space-y-6">
                    {/* Simple Excel Upload Option */}
                    <div className="border border-gray-200 rounded-lg p-5 bg-white">
                      <div className="flex items-start mb-4">
                        <div className="bg-[#7D9D74]/10 p-3 rounded-full mr-4">
                          <Upload className="w-6 h-6 text-[#7D9D74]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-1">Upload Excel Menu</h3>
                          <p className="text-gray-600 mb-4">
                            The simplest way to update your entire menu at once.
                          </p>
                          
                <div className="mb-4">
                  <label 
                    htmlFor="menuFile" 
                              className="inline-flex items-center px-4 py-2 bg-[#7D9D74]/10 text-[#7D9D74] rounded-md font-medium hover:bg-[#7D9D74]/20 cursor-pointer"
                  >
                              <FileText className="w-4 h-4 mr-2" />
                              Select Excel File
                  <input
                    type="file"
                    id="menuFile"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                            {file && (
                              <span className="ml-3 text-sm">
                                {file.name}
                              </span>
                            )}
                </div>
                          
                          <div className="flex items-center space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                              className="flex items-center justify-center px-4 py-2 bg-[#7D9D74] text-white rounded-md hover:bg-[#5D7D54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                                  <Upload className="w-4 h-4 mr-2 animate-bounce" />
                      Uploading...
                    </>
                  ) : (
                    <>
                                  <Upload className="w-4 h-4 mr-2" />
                      Upload Menu
                    </>
                  )}
                </button>
                            
                            <button
                              onClick={handleDownloadTemplate}
                              className="flex items-center text-[#7D9D74] hover:text-[#5D7D54]"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download Template
                            </button>
                          </div>
                        </div>
              </div>
            </div>

                    {/* Google Sheets Option */}
                    <div className="border border-gray-200 rounded-lg p-5 bg-white">
                      <div className="flex items-start">
                        <div className="bg-[#7D9D74]/10 p-3 rounded-full mr-4">
                          <RefreshCw className="w-6 h-6 text-[#7D9D74]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-1">Sync from Google Sheets</h3>
                          <p className="text-gray-600 mb-4">
                            Update menu items from your connected Google Sheet.
                          </p>
                          
              <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center justify-center px-4 py-2 bg-[#7D9D74] text-white rounded-md hover:bg-[#5D7D54] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {syncing ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync Now
                              </>
                            )}
              </button>
                        </div>
                      </div>
                    </div>
            </div>

                  {/* Help Text */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-md text-blue-700">
                    <h3 className="font-medium mb-2">Need Help?</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Excel files should match the template format exactly</li>
                <li>Images should be accessible via URLs</li>
                      <li>Use Yes/No for features like vegan, vegetarian, etc.</li>
                      <li>Changes will be visible after page refresh</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminMenuPage; 