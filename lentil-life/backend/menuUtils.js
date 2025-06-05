const supabase = require('./supabaseClient');

// Get all menu items, e.g., for an admin panel
async function getAllMenuItems() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true }); // Order by name for admin display

    if (error) {
        console.error('Error fetching all menu items:', error.message);
        throw new Error(`Error fetching all menu items: ${error.message}`);
    }
    return data || [];
}

// Get only featured menu items, e.g., for the homepage
async function getFeaturedMenuItems() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_featured', true)
        .order('name', { ascending: true }); // Or some other relevant order for featured items

    if (error) {
        console.error('Error fetching featured menu items:', error.message);
        throw new Error(`Error fetching featured menu items: ${error.message}`);
    }
    return data || []; // Return empty array if no featured items found or in case data is null
}

// Get a single menu item by its ID
async function getMenuItemByIdFromSupabase(id) {
    console.log(`[menuUtils.js] Attempting to fetch item with ID (type: ${typeof id}):`, id);
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single(); // .single() is appropriate here as ID should be unique

    if (error) {
        // If the error is because no row was found, Supabase client with .single() throws an error.
        // PGRST116 is the code for "The result contains 0 rows"
        if (error.code === 'PGRST116') {
            return null; // Explicitly return null if item not found
        }
        console.error(`Error fetching menu item with id ${id}:`, error.message);
        throw new Error(`Error fetching menu item with id ${id}: ${error.message}`);
    }
    console.log(`[menuUtils.js] Fetched item for ID ${id}:`, data);
    return data;
}

// Get menu items by category from Supabase
async function getMenuItemsByCategory(category) {
    console.log(`[menuUtils.js] Fetching items for category: ${category}`);
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

    if (error) {
        console.error(`Error fetching menu items in category ${category}:`, error.message);
        throw new Error(`Error fetching menu items in category ${category}: ${error.message}`);
    }
    return data || [];
}

// Get all unique categories from Supabase
async function getAllCategories() {
    console.log(`[menuUtils.js] Fetching all categories`);
    const { data, error } = await supabase
        .from('menu_items')
        .select('category')
        .not('category', 'is', null);

    if (error) {
        console.error('Error fetching menu categories:', error.message);
        throw new Error(`Error fetching menu categories: ${error.message}`);
    }

    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
}

// Add a new menu item to Supabase
async function addMenuItem(newItem) {
    console.log(`[menuUtils.js] Adding new menu item:`, newItem);
    const { data, error } = await supabase
        .from('menu_items')
        .insert([newItem])
        .select()
        .single();

    if (error) {
        console.error('Error adding menu item:', error.message);
        throw new Error(`Error adding menu item: ${error.message}`);
    }
    return data;
}

// Update an existing menu item in Supabase
async function updateMenuItem(id, updatedItem) {
    console.log(`[menuUtils.js] Updating menu item ${id}:`, updatedItem);
    const { data, error } = await supabase
        .from('menu_items')
        .update(updatedItem)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Item not found
        }
        console.error(`Error updating menu item ${id}:`, error.message);
        throw new Error(`Error updating menu item ${id}: ${error.message}`);
    }
    return data;
}

// Delete a menu item from Supabase
async function deleteMenuItem(id) {
    console.log(`[menuUtils.js] Deleting menu item ${id}`);
    const { data, error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return false; // Item not found
        }
        console.error(`Error deleting menu item ${id}:`, error.message);
        throw new Error(`Error deleting menu item ${id}: ${error.message}`);
    }
    return true;
}

module.exports = {
    getAllMenuItems,
    getFeaturedMenuItems,
    getMenuItemByIdFromSupabase,
    getMenuItemsByCategory,
    getAllCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
}; 