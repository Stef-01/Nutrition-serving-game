import type { PlateItem, MealGoals, NutrientStatus, GlycemicPoint, Character, CharacterReaction } from '../types';
import { FOOD_DATA, MEAL_GOALS } from '../constants';

// ============================================================================
// CONSTANTS - Extracted magic numbers for maintainability
// ============================================================================

// Nutrition calculation constants
const GRAMS_PER_100G = 100;
const MIN_VALID_GRAMS = 0.1;

// Macronutrient calorie conversion constants (kcal per gram)
const KCAL_PER_GRAM_PROTEIN = 4;
const KCAL_PER_GRAM_CARBS = 4;
const KCAL_PER_GRAM_FAT = 9;

// Glycemic curve model constants
const FIBER_EFFECTIVENESS_MULTIPLIER = 1.5;
const BASE_PEAK_TIME_MINUTES = 45;
const FAT_DELAY_FACTOR = 0.5;
const CARB_TO_RISE_RATIO = 0.5;
const CURVE_STANDARD_DEVIATION = 30;
const CURVE_DURATION_MINUTES = 180;

// Score calculation penalty constants
const PERFECT_SCORE = 100;
const PENALTY_CALORIES_LOW = 20;
const PENALTY_CALORIES_HIGH = 25;
const PENALTY_CARBS_HIGH_DIABETES = 20;
const PENALTY_CARBS_HIGH_NORMAL = 15;
const PENALTY_PROTEIN_LOW = 15;
const PENALTY_FAT_HIGH = 15;
const PENALTY_FIBER_LOW = 10;
const PENALTY_SODIUM_HIGH = 15;
const PENALTY_TREAT_DIABETES = 25;
const PENALTY_MISSING_REQUIRED_ITEM = 60; // Results in a score of 40

// Score thresholds for feedback
const SCORE_THRESHOLD_EXCELLENT = 90;
const SCORE_THRESHOLD_GOOD = 60;

// Macronutrient distribution by diabetes mode
const MACRO_DISTRIBUTIONS = {
  'Low-Carb': { carbs: 0.25, protein: 0.35, fat: 0.40 },
  'Balanced': { carbs: 0.45, protein: 0.25, fat: 0.30 },
  'None': { carbs: 0.50, protein: 0.20, fat: 0.30 },
} as const;

// ============================================================================
// NUTRIENT CALCULATION
// ============================================================================

/**
 * Calculates the total nutrients for a given list of items on a plate.
 * Now includes input validation and prevents negative values.
 * 
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

  if (!Array.isArray(plateItems) || plateItems.length === 0) {
    return totals;
  }

  plateItems.forEach(item => {
    if (!item || !item.id) return;

    const foodItem = FOOD_DATA.find(f => f.id === item.id);
    if (!foodItem) return;

    const itemGrams = calculateItemGrams(item, foodItem);
    
    if (itemGrams >= MIN_VALID_GRAMS) {
      addNutrientsToTotals(totals, foodItem, itemGrams);
    }
  });

  return totals;
}

/**
 * Calculates the weight in grams for a plate item.
 * Handles both gram-based and volume-based measurements.
 */
function calculateItemGrams(item: PlateItem, foodItem: typeof FOOD_DATA[0]): number {
  if (item.grams && item.grams > 0) {
    return item.grams;
  }
  
  if (item.volume_ml && item.volume_ml > 0 && foodItem.density_g_per_ml && foodItem.density_g_per_ml > 0) {
    return item.volume_ml * foodItem.density_g_per_ml;
  }
  
  return 0;
}

/**
 * Adds scaled nutrients from a food item to the running totals.
 * Ensures no negative values are added.
 */
function addNutrientsToTotals(
  totals: ReturnType<typeof calculateTotalNutrients>,
  foodItem: typeof FOOD_DATA[0],
  itemGrams: number
): void {
  const scale = itemGrams / GRAMS_PER_100G;
  const nutrients = foodItem.nutrients_per_100g;

  totals.calories_kcal += Math.max(0, (nutrients.calories_kcal || 0) * scale);
  totals.protein_g += Math.max(0, (nutrients.protein_g || 0) * scale);
  totals.carbs_g += Math.max(0, (nutrients.carbs_g || 0) * scale);
  totals.fiber_g += Math.max(0, (nutrients.fiber_g || 0) * scale);
  totals.fat_g += Math.max(0, (nutrients.fat_g || 0) * scale);
  totals.sodium_mg += Math.max(0, (nutrients.sodium_mg || 0) * scale);
}

// ============================================================================
// NUTRIENT STATUS EVALUATION
// ============================================================================

/**
 * Determines if a nutrient value is low, good, or high compared to its target.
 * @param value - The current nutrient value.
 * @param target - The target range or limit for the nutrient.
 * @returns A status string: 'low', 'good', 'high', or 'ok'.
 */
export function getNutrientStatus(value: number, target: any): NutrientStatus {
  if (target && 'min' in target && 'max' in target) {
    if (value < target.min) return 'low';
    if (value > target.max) return 'high';
    return 'good';
  }
  if (target && 'min' in target) {
    return value < target.min ? 'low' : 'good';
  }
  if (target && 'max' in target) {
    return value > target.max ? 'high' : 'good';
  }
  return 'ok';
}

// ============================================================================
// MEAL GOALS CALCULATION
// ============================================================================

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
    const distribution = MACRO_DISTRIBUTIONS[diabetesMode] || MACRO_DISTRIBUTIONS['None'];

    const carbMax = (targetCalories * distribution.carbs) / KCAL_PER_GRAM_CARBS;
    const proteinMin = (targetCalories * distribution.protein) / KCAL_PER_GRAM_PROTEIN;
    const fatMax = (targetCalories * distribution.fat) / KCAL_PER_GRAM_FAT;

    return {
        ...baseGoals,
        carbs_g: { max: carbMax },
        protein_g: { min: proteinMin },
        fat_g: { max: fatMax },
    };
}

// ============================================================================
// GLYCEMIC CURVE SIMULATION
// ============================================================================

/**
 * Simulates a post-meal glycemic curve based on meal composition.
 * @param carbs_g - Total carbohydrates in grams.
 * @param fiber_g - Total fiber in grams.
 * @param fat_g - Total fat in grams.
 * @returns An array of points representing the glycemic curve over time.
 */
export function calculateGlycemicCurve(carbs_g: number, fiber_g: number, fat_g: number): GlycemicPoint[] {
  if (carbs_g <= 0) {
    return Array.from({ length: CURVE_DURATION_MINUTES + 1 }, (_, i) => ({ time: i, rise: 0 }));
  }

  const effectiveCarbs = Math.max(0, carbs_g - fiber_g * FIBER_EFFECTIVENESS_MULTIPLIER);
  const peakTime = BASE_PEAK_TIME_MINUTES + fat_g * FAT_DELAY_FACTOR;
  const peakRise = effectiveCarbs * CARB_TO_RISE_RATIO;

  const curve: GlycemicPoint[] = [];
  for (let t = 0; t <= CURVE_DURATION_MINUTES; t++) {
    const rise = peakRise * Math.exp(-((t - peakTime) ** 2) / (2 * CURVE_STANDARD_DEVIATION ** 2));
    curve.push({ time: t, rise: Math.max(0, rise) });
  }

  return curve;
}

// ============================================================================
// SCORE CALCULATION
// ============================================================================

interface ScoreResult {
  score: number;
  feedback: string;
  reaction: CharacterReaction;
}

interface PenaltyInfo {
  amount: number;
  reason: string;
}

/**
 * Main scoring function - orchestrates the scoring process.
 * @param customer - The customer character who placed the order.
 * @param plateItems - The items on the plate being served.
 * @returns An object with the calculated score, feedback, and reaction.
 */
export const calculateScore = (customer: Character, plateItems: PlateItem[]): ScoreResult => {
  if (!customer || !Array.isArray(plateItems) || plateItems.length === 0) {
    return { score: 0, feedback: "You served me an empty plate!", reaction: 'sad' };
  }

  const missingItemResult = checkMissingRequiredItems(customer, plateItems);
  if (missingItemResult) return missingItemResult;

  const nutrients = calculateTotalNutrients(plateItems);
  const goals = getMealGoals(customer.order.plateSize, customer.order.diabetesMode);
  const penalties = evaluateMeal(nutrients, goals, customer, plateItems);
  
  const totalPenalty = penalties.reduce((sum, p) => sum + p.amount, 0);
  const finalScore = Math.max(0, PERFECT_SCORE - totalPenalty);
  
  const { feedback, reaction } = generateFeedback(customer, finalScore, penalties);
  
  return { score: finalScore, feedback, reaction };
};

function checkMissingRequiredItems(customer: Character, plateItems: PlateItem[]): ScoreResult | null {
  const requiredItems = customer.order.required_items || [];
  if (requiredItems.length === 0) return null;

  const plateItemIds = new Set(plateItems.map(p => p.id));
  const missingItems = requiredItems.filter(reqId => !plateItemIds.has(reqId));

  if (missingItems.length > 0) {
    const missingLabels = missingItems.map(id => FOOD_DATA.find(f => f.id === id)?.label || 'a specific dish').join(' and ');
    const feedback = `${customer.dialogue.neutral} But I was really hoping for some ${missingLabels}.`;
    return { score: PERFECT_SCORE - PENALTY_MISSING_REQUIRED_ITEM, feedback, reaction: 'sad' };
  }

  return null;
}

function evaluateMeal(nutrients: ReturnType<typeof calculateTotalNutrients>, goals: MealGoals, customer: Character, plateItems: PlateItem[]): PenaltyInfo[] {
  return [
    ...evaluateCalories(nutrients.calories_kcal, goals.calories_kcal),
    ...evaluateCarbs(nutrients.carbs_g, goals.carbs_g, customer.order.diabetesMode),
    ...evaluateProtein(nutrients.protein_g, goals.protein_g),
    ...evaluateFat(nutrients.fat_g, goals.fat_g),
    ...evaluateFiber(nutrients.fiber_g, goals.fiber_g),
    ...evaluateSodium(nutrients.sodium_mg, goals.sodium_mg),
    ...evaluateTreats(plateItems, customer.order.diabetesMode),
  ];
}

function evaluateCalories(value: number, target: MealGoals['calories_kcal']): PenaltyInfo[] {
  if (value < target.min) return [{ amount: PENALTY_CALORIES_LOW, reason: "it was a bit too light for me." }];
  if (value > target.max) return [{ amount: PENALTY_CALORIES_HIGH, reason: "it was a bit too heavy." }];
  return [];
}

function evaluateCarbs(value: number, target: MealGoals['carbs_g'], diabetesMode: Character['order']['diabetesMode']): PenaltyInfo[] {
  if (value > target.max) {
    const penalty = diabetesMode !== 'None' ? PENALTY_CARBS_HIGH_DIABETES : PENALTY_CARBS_HIGH_NORMAL;
    return [{ amount: penalty, reason: "it was too high in carbs." }];
  }
  return [];
}

function evaluateProtein(value: number, target: MealGoals['protein_g']): PenaltyInfo[] {
  if (value < target.min) return [{ amount: PENALTY_PROTEIN_LOW, reason: "I wish it had more protein." }];
  return [];
}

function evaluateFat(value: number, target: MealGoals['fat_g']): PenaltyInfo[] {
  if (value > target.max) return [{ amount: PENALTY_FAT_HIGH, reason: "it was a little too fatty." }];
  return [];
}

function evaluateFiber(value: number, target: MealGoals['fiber_g']): PenaltyInfo[] {
  if (value < target.min) return [{ amount: PENALTY_FIBER_LOW, reason: "some more fiber would be great." }];
  return [];
}

function evaluateSodium(value: number, target: MealGoals['sodium_mg']): PenaltyInfo[] {
  if (value > target.max) return [{ amount: PENALTY_SODIUM_HIGH, reason: "it was a little too salty." }];
  return [];
}

function evaluateTreats(plateItems: PlateItem[], diabetesMode: Character['order']['diabetesMode']): PenaltyInfo[] {
  if (diabetesMode === 'None') return [];
  if (plateItems.some(p => FOOD_DATA.find(f => f.id === p.id)?.isTreat)) {
    return [{ amount: PENALTY_TREAT_DIABETES, reason: "that treat might be too sugary for me." }];
  }
  return [];
}

function generateFeedback(customer: Character, score: number, penalties: PenaltyInfo[]): { feedback: string; reaction: CharacterReaction } {
  if (score >= SCORE_THRESHOLD_EXCELLENT) {
    return { feedback: customer.dialogue.positive, reaction: 'happy' };
  }
  if (score >= SCORE_THRESHOLD_GOOD) {
    const feedback = penalties.length > 0 ? `${customer.dialogue.neutral} Though, ${penalties[0].reason}` : customer.dialogue.neutral;
    return { feedback, reaction: 'neutral' };
  }
  const reasons = penalties.map(p => p.reason).join(" and ");
  const feedback = penalties.length > 0 ? `${customer.dialogue.negative} Specifically, ${reasons}` : customer.dialogue.negative;
  return { feedback, reaction: 'sad' };
}
