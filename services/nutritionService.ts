
import type { Recipe } from '../types';

export const estimateNutritionFromIngredients = (recipe: Recipe): Partial<Recipe> => {
  // Basic estimation if nutrition data is missing
  const estimates = {
    calories_kcal: 200,
    protein_g: 10,
    carbs_g: 25,
    fiber_g: 3,
    fat_g: 8
  };
  
  // Adjust based on course
  if (recipe.course === 'main') {
    estimates.calories_kcal = 350;
    estimates.protein_g = 25;
  } else if (recipe.course === 'side') {
    estimates.calories_kcal = 150;
    estimates.protein_g = 5;
  } else if (recipe.course === 'snack') {
    estimates.calories_kcal = 100;
    estimates.protein_g = 3;
  }
  
  // Adjust for dietary tags
  if (recipe.high_protein) {
    estimates.protein_g *= 1.5;
  }
  if (recipe.high_fiber) {
    estimates.fiber_g *= 2;
  }
  if (recipe.low_carb) {
    estimates.carbs_g *= 0.5;
  }
  if (recipe.diabetic_friendly) {
    estimates.carbs_g = Math.min(estimates.carbs_g, 30);
  }
  
  return estimates;
};

export const calculateMealBalance = (recipes: Recipe[]): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFiber: number;
  totalFat: number;
  balance: 'good' | 'needs-protein' | 'needs-fiber' | 'too-heavy' | 'too-light';
} => {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFiber = 0;
  let totalFat = 0;
  
  recipes.forEach(recipe => {
    // Use actual values or estimates
    const nutrition = recipe.calories_kcal ? recipe : estimateNutritionFromIngredients(recipe);
    
    totalCalories += nutrition.calories_kcal || 0;
    totalProtein += nutrition.protein_g || 0;
    totalCarbs += nutrition.carbs_g || 0;
    totalFiber += nutrition.fiber_g || 0;
    totalFat += nutrition.fat_g || 0;
  });
  
  // Determine balance
  let balance: 'good' | 'needs-protein' | 'needs-fiber' | 'too-heavy' | 'too-light' = 'good';
  
  if (totalCalories < 400) balance = 'too-light';
  else if (totalCalories > 800) balance = 'too-heavy';
  else if (totalProtein < 15) balance = 'needs-protein';
  else if (totalFiber < 5) balance = 'needs-fiber';
  
  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFiber,
    totalFat,
    balance
  };
};
