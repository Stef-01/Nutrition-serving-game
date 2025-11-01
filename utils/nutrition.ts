
import type { PlateItem, MealGoals, NutrientStatus, GlycemicPoint, Character, CharacterReaction } from '../types';
import { FOOD_DATA, MEAL_GOALS } from '../constants';

/**
 * Calculates the total nutrients for a given list of items on a plate.
 * @param plateItems - An array of items currently on the plate.
 * @returns An object containing the sum of all nutrients.
 */
export function calculateTotalNutrients(plateItems: PlateItem[]) {
  const totals = {
    calories_kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fiber_g: 0,
    fat_g: 0,
    sodium_mg: 0,
  };

  plateItems.forEach(item => {
    const foodItem = FOOD_DATA.find(f => f.id === item.id);
    if (!foodItem) return;

    let itemGrams = 0;
    if (item.grams) {
      itemGrams = item.grams;
    } else if (item.volume_ml && foodItem.density_g_per_ml) {
      itemGrams = item.volume_ml * foodItem.density_g_per_ml;
    }

    if (itemGrams > 0) {
      const scale = itemGrams / 100;
      totals.calories_kcal += foodItem.nutrients_per_100g.calories_kcal * scale;
      totals.protein_g += foodItem.nutrients_per_100g.protein_g * scale;
      totals.carbs_g += foodItem.nutrients_per_100g.carbs_g * scale;
      totals.fiber_g += foodItem.nutrients_per_100g.fiber_g * scale;
      totals.fat_g += foodItem.nutrients_per_100g.fat_g * scale;
      totals.sodium_mg += foodItem.nutrients_per_100g.sodium_mg * scale;
    }
  });

  return totals;
}

/**
 * Determines if a nutrient value is low, good, or high compared to its target.
 * @param value - The current nutrient value.
 * @param target - The target range or limit for the nutrient.
 * @returns A status string: 'low', 'good', 'high', or 'ok'.
 */
export function getNutrientStatus(value: number, target: any): NutrientStatus {
  if ('min' in target && 'max' in target) {
    if (value < target.min) return 'low';
    if (value > target.max) return 'high';
    return 'good';
  }
  if ('min' in target) {
    return value < target.min ? 'low' : 'good';
  }
  if ('max' in target) {
    return value > target.max ? 'high' : 'good';
  }
  return 'ok';
}

/**
 * Gets the nutritional goals for a meal based on size and dietary considerations.
 * @param plateSize - The desired size of the meal ('Light', 'Regular', 'Hearty').
 * @param diabetesMode - The diabetes-related dietary mode ('None', 'Balanced', 'Low-Carb').
 * @returns An object with detailed meal goals.
 */
export function getMealGoals(
    plateSize: 'Light' | 'Regular' | 'Hearty',
    diabetesMode: 'None' | 'Balanced' | 'Low-Carb'
): MealGoals {
    const baseGoals = MEAL_GOALS[plateSize];
    const targetCalories = baseGoals.calories_kcal.target;

    let carbMax, proteinMin, fatMax;

    // Macronutrient goals are driven by calorie target and diabetes mode
    // Using 4-4-9 kcal/g for protein, carbs, fat
    switch (diabetesMode) {
        case 'Low-Carb': // e.g., ~25% carbs, 35% protein, 40% fat
            carbMax = (targetCalories * 0.25) / 4;
            proteinMin = (targetCalories * 0.35) / 4;
            fatMax = (targetCalories * 0.40) / 9;
            break;
        case 'Balanced': // e.g., ~45% carbs, 25% protein, 30% fat
            carbMax = (targetCalories * 0.45) / 4;
            proteinMin = (targetCalories * 0.25) / 4;
            fatMax = (targetCalories * 0.30) / 9;
            break;
        case 'None': // e.g., ~50% carbs, 20% protein, 30% fat
        default:
            carbMax = (targetCalories * 0.50) / 4;
            proteinMin = (targetCalories * 0.20) / 4;
            fatMax = (targetCalories * 0.30) / 9;
            break;
    }

    return {
        ...baseGoals,
        carbs_g: { max: carbMax },
        protein_g: { min: proteinMin },
        fat_g: { max: fatMax },
    };
}

/**
 * Simulates a post-meal glycemic curve based on meal composition.
 * This is a simplified model for educational purposes.
 * @param carbs_g - Total carbohydrates in grams.
 * @param fiber_g - Total fiber in grams.
 * @param fat_g - Total fat in grams.
 * @returns An array of points representing the glycemic curve over time.
 */
export function calculateGlycemicCurve(carbs_g: number, fiber_g: number, fat_g: number): GlycemicPoint[] {
  if (carbs_g <= 0) {
    return Array.from({ length: 181 }, (_, i) => ({ time: i, rise: 0 }));
  }

  // Fiber flattens the curve by reducing the "effective" carbs
  const effectiveCarbs = Math.max(0, carbs_g - fiber_g * 1.5);

  // Fat delays the peak of the curve
  const peakTime = 45 + fat_g * 0.5; // Base peak at 45 mins, delayed by fat

  // Carbs determine the height of the peak
  const peakRise = effectiveCarbs * 0.5;

  const curve: GlycemicPoint[] = [];
  for (let t = 0; t <= 180; t++) {
    // Using a Gaussian-like function to model the curve
    const rise = peakRise * Math.exp(-((t - peakTime) ** 2) / (2 * 30 ** 2));
    curve.push({ time: t, rise: Math.max(0, rise) });
  }

  return curve;
}


/**
 * Calculates the score and feedback for a served plate.
 * @param customer - The customer character who placed the order.
 * @param plateItems - The items on the plate being served.
 * @returns An object with the calculated score and feedback string.
 */
export const calculateScore = (customer: Character, plateItems: PlateItem[]): { score: number; feedback: string; reaction: CharacterReaction } => {
    if (plateItems.length === 0) {
        return { score: 0, feedback: "You served me an empty plate!", reaction: 'sad' };
    }

    const totalNutrients = calculateTotalNutrients(plateItems);
    const goals = getMealGoals(customer.order.plateSize, customer.order.diabetesMode);
    
    const plateItemIds = new Set(plateItems.map(p => p.id));
    const missingItems = customer.order.required_items?.filter(reqId => !plateItemIds.has(reqId)) || [];

    if (missingItems.length > 0) {
        const missingItemLabels = missingItems.map(id => FOOD_DATA.find(f => f.id === id)?.label || 'a specific dish').join(' and ');
        const feedback = `${customer.dialogue.neutral} But I was really hoping for some ${missingItemLabels}.`;
        return { score: 40, feedback, reaction: 'sad' };
    }

    let score = 100;
    let feedbackPoints: string[] = [];

    const calStatus = getNutrientStatus(totalNutrients.calories_kcal, goals.calories_kcal);
    if (calStatus === 'low') {
        score -= 20;
        feedbackPoints.push("it was a bit too light for me.");
    } else if (calStatus === 'high') {
        score -= 25;
        feedbackPoints.push("it was a bit too heavy.");
    }

    const carbStatus = getNutrientStatus(totalNutrients.carbs_g, goals.carbs_g);
    if (carbStatus === 'high') {
        score -= customer.order.diabetesMode !== 'None' ? 20 : 15;
        feedbackPoints.push("it was too high in carbs.");
    }
    
    const proteinStatus = getNutrientStatus(totalNutrients.protein_g, goals.protein_g);
    if (proteinStatus === 'low') {
        score -= 15;
        feedbackPoints.push("I wish it had more protein.");
    }
    
    const fatStatus = getNutrientStatus(totalNutrients.fat_g, goals.fat_g);
    if (fatStatus === 'high') {
        score -= 15;
        feedbackPoints.push("it was a little too fatty.");
    }

    const fiberStatus = getNutrientStatus(totalNutrients.fiber_g, goals.fiber_g);
    if (fiberStatus === 'low') {
        score -= 10;
        feedbackPoints.push("some more fiber would be great.");
    }

    const sodiumStatus = getNutrientStatus(totalNutrients.sodium_mg, goals.sodium_mg);
    if (sodiumStatus === 'high') {
        score -= 15;
        feedbackPoints.push("it was a little too salty.");
    }

    const hasTreat = plateItems.some(p => FOOD_DATA.find(f => f.id === p.id)?.isTreat);
    if (customer.order.diabetesMode !== 'None' && hasTreat) {
        score -= 25;
        feedbackPoints.push("that treat might be too sugary for me.");
    }

    score = Math.max(0, score);
    
    let feedback: string;
    let reaction: CharacterReaction;

    if (score >= 90) {
        feedback = customer.dialogue.positive;
        reaction = 'happy';
    } else if (score >= 60) {
        feedback = customer.dialogue.neutral;
        if (feedbackPoints.length > 0) feedback += " Though, " + feedbackPoints[0];
        reaction = 'neutral';
    } else {
        feedback = customer.dialogue.negative;
        if (feedbackPoints.length > 0) feedback += " Specifically, " + feedbackPoints.join(" and ");
        reaction = 'sad';
    }

    return { score, feedback, reaction };
};