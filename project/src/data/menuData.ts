import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Mediterranean Delight",
    description: "A fresh blend of hummus, falafel, mixed greens, tomatoes, cucumbers, and tahini sauce.",
    price: 9.95,
    image: "https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 420,
      protein: 15,
      carbs: 48,
      fat: 18,
      fiber: 12
    },
    ingredients: ["Whole wheat wrap", "Hummus", "Falafel", "Mixed greens", "Tomatoes", "Cucumbers", "Tahini sauce"]
  },
  {
    id: 2,
    name: "Avocado Ranch Chicken",
    description: "Grilled chicken, avocado, lettuce, tomato, and ranch dressing in a spinach wrap.",
    price: 10.95,
    image: "https://images.pexels.com/photos/4145365/pexels-photo-4145365.jpeg",
    dietaryInfo: {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      dairyFree: false
    },
    nutritionalInfo: {
      calories: 550,
      protein: 32,
      carbs: 42,
      fat: 28,
      fiber: 8
    },
    ingredients: ["Spinach wrap", "Grilled chicken", "Avocado", "Lettuce", "Tomato", "Ranch dressing"]
  },
  {
    id: 3,
    name: "Quinoa Power Bowl",
    description: "Protein-packed quinoa, black beans, roasted sweet potatoes, kale, and avocado with cilantro lime dressing.",
    price: 11.95,
    image: "https://images.pexels.com/photos/5966431/pexels-photo-5966431.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 480,
      protein: 18,
      carbs: 62,
      fat: 20,
      fiber: 15
    },
    ingredients: ["Quinoa", "Black beans", "Roasted sweet potatoes", "Kale", "Avocado", "Cilantro lime dressing"]
  },
  {
    id: 4,
    name: "Berry Protein Smoothie Bowl",
    description: "Mixed berries, banana, plant protein, topped with granola, coconut flakes, and chia seeds.",
    price: 8.95,
    image: "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 380,
      protein: 22,
      carbs: 52,
      fat: 12,
      fiber: 10
    },
    ingredients: ["Mixed berries", "Banana", "Plant protein", "Granola", "Coconut flakes", "Chia seeds"]
  },
  {
    id: 5,
    name: "Spicy Southwest",
    description: "Black beans, corn, brown rice, bell peppers, and avocado with chipotle sauce.",
    price: 9.95,
    image: "https://images.pexels.com/photos/8448323/pexels-photo-8448323.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 520,
      protein: 16,
      carbs: 68,
      fat: 22,
      fiber: 14
    },
    ingredients: ["Whole grain wrap", "Black beans", "Corn", "Brown rice", "Bell peppers", "Avocado", "Chipotle sauce"]
  },
  {
    id: 6,
    name: "Tofu Teriyaki",
    description: "Marinated tofu, brown rice, steamed broccoli, carrots, and teriyaki glaze.",
    price: 10.95,
    image: "https://images.pexels.com/photos/5945559/pexels-photo-5945559.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 460,
      protein: 20,
      carbs: 65,
      fat: 15,
      fiber: 9
    },
    ingredients: ["Rice paper wrap", "Marinated tofu", "Brown rice", "Steamed broccoli", "Carrots", "Teriyaki glaze"]
  },
  {
    id: 7,
    name: "Sunrise Citrus Burst Smoothie",
    description: "A refreshing blend of orange, mango, pineapple, and a hint of ginger. Perfect to kickstart your day.",
    price: 7.95,
    image: "https://images.pexels.com/photos/775031/pexels-photo-775031.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 280,
      protein: 4,
      carbs: 65,
      fat: 2,
      fiber: 8
    },
    ingredients: ["Orange", "Mango", "Pineapple", "Ginger", "Coconut Water"]
  },
  {
    id: 8,
    name: "Green Goddess Veggie Wrap",
    description: "Packed with fresh spinach, cucumber, green bell pepper, avocado, and a creamy green goddess dressing.",
    price: 9.50,
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg",
    dietaryInfo: {
      vegan: false, // Assuming dressing might not be vegan by default
      vegetarian: true,
      glutenFree: false, // Assuming wrap might not be GF by default
      dairyFree: false // Assuming dressing might have dairy
    },
    nutritionalInfo: {
      calories: 390,
      protein: 10,
      carbs: 40,
      fat: 20,
      fiber: 9
    },
    ingredients: ["Whole Wheat Wrap", "Spinach", "Cucumber", "Green Bell Pepper", "Avocado", "Green Goddess Dressing"]
  },
  {
    id: 9,
    name: "Smoked Salmon & Dill Bowl",
    description: "Flaky smoked salmon, quinoa, mixed greens, capers, red onion, and a light lemon-dill vinaigrette.",
    price: 12.95,
    image: "https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg",
    dietaryInfo: {
      vegan: false,
      vegetarian: false,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 450,
      protein: 25,
      carbs: 35,
      fat: 22,
      fiber: 7
    },
    ingredients: ["Smoked Salmon", "Quinoa", "Mixed Greens", "Capers", "Red Onion", "Lemon-Dill Vinaigrette"]
  },
  {
    id: 10,
    name: "Roasted Root Veggie Bowl",
    description: "A hearty bowl of roasted carrots, parsnips, beets, and sweet potatoes over brown rice, with a balsamic glaze.",
    price: 10.25,
    image: "https://images.pexels.com/photos/1580466/pexels-photo-1580466.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: true,
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 420,
      protein: 9,
      carbs: 70,
      fat: 12,
      fiber: 14
    },
    ingredients: ["Carrots", "Parsnips", "Beets", "Sweet Potatoes", "Brown Rice", "Balsamic Glaze"]
  },
  {
    id: 11,
    name: "Spicy Mango Chicken Wrap",
    description: "Grilled chicken with a spicy mango salsa, mixed greens, and a hint of lime in a chili tortilla.",
    price: 11.50,
    image: "https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg",
    dietaryInfo: {
      vegan: false,
      vegetarian: false,
      glutenFree: false, // Assuming chili tortilla is not GF
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 510,
      protein: 30,
      carbs: 45,
      fat: 20,
      fiber: 6
    },
    ingredients: ["Chili Tortilla", "Grilled Chicken", "Mango Salsa (Mango, Red Onion, Jalapeno, Cilantro, Lime)", "Mixed Greens"]
  },
  {
    id: 12,
    name: "Hearty Lentil & Veggie Soup",
    description: "A warm and nourishing soup with green lentils, carrots, celery, tomatoes, and herbs. Served with a side of whole grain bread.",
    price: 7.50,
    image: "https://images.pexels.com/photos/539432/pexels-photo-539432.jpeg",
    dietaryInfo: {
      vegan: true,
      vegetarian: true,
      glutenFree: false, // Bread side typically not GF
      dairyFree: true
    },
    nutritionalInfo: {
      calories: 350,
      protein: 18,
      carbs: 55,
      fat: 5,
      fiber: 20
    },
    ingredients: ["Green Lentils", "Carrots", "Celery", "Diced Tomatoes", "Vegetable Broth", "Onion", "Garlic", "Herbs", "Whole Grain Bread (side)"]
  }
];