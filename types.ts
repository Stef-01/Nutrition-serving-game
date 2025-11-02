
import React from 'react';

// Base nutrient structure
export interface Nutrients {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fiber_g: number;
  fat_g: number;
  sodium_mg: number;
}

// Props for visual components
export interface VisualProps {
  volume_ml?: number;
  grams?: number;
}

// Represents a food item in the library
export interface FoodItem {
  id: string;
  label: string;
  category: string;
  visual: React.FC<VisualProps>;
  density_g_per_ml?: number;
  volume_options_ml?: number[];
  volume_labels?: string[];
  portion_g?: number[];
  portion_labels?: string[];
  nutrients_per_100g: Nutrients;
  isTreat?: boolean;
}

// Represents a group of food items
export interface FoodGroup {
    name: string;
    items: FoodItem[];
}

// Represents a specific instance of a food item on the user's plate
export interface PlateItem {
  id: string; // Corresponds to FoodItem id
  instanceId: string; // Unique ID for this specific item on the plate
  volume_ml?: number;
  grams?: number;
}

// Nutrient target bands
export interface TargetBand {
  min: number;
  max: number;
  target: number;
}

// Structure for meal goals
export interface MealGoals {
  calories_kcal: TargetBand;
  protein_g: { min: number };
  carbs_g: { max: number };
  fat_g: { max: number };
  fiber_g: { min: number };
  sodium_mg: { max: number };
}

// Type for nutrient status used in UI feedback
export type NutrientStatus = 'low' | 'good' | 'high' | 'ok';

// For Glycemic Forecast Graph
export interface GlycemicPoint {
  time: number; // minutes post-meal
  rise: number; // relative glucose rise
}

// --- Game-related types ---

export type CharacterReaction = 'happy' | 'neutral' | 'sad';

// Represents a customer character
export interface Character {
  id: string;
  name: string;
  visuals: {
    default: React.FC;
    happy: React.FC;
    sad: React.FC;
  };
  order: {
    description: string;
    plateSize: 'Light' | 'Regular' | 'Hearty';
    diabetesMode: 'None' | 'Balanced' | 'Low-Carb';
    required_items?: string[];
  };
  dialogue: {
    intro: string;
    positive: string;
    neutral: string;
    negative: string;
  };
}

// The result of serving an order
export interface OrderResult {
  score: number;
  feedback: string;
  reaction: CharacterReaction;
  customerIndex: number;
}

// For fun facts widget
export interface Fact {
  id: string;
  text: string;
  source_name: string;
  source_url: string;
}

// For changelog
export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

// For new nutrition service
export interface Recipe {
  course?: 'main' | 'side' | 'snack';
  high_protein?: boolean;
  high_fiber?: boolean;
  low_carb?: boolean;
  diabetic_friendly?: boolean;
  calories_kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fiber_g?: number;
  fat_g?: number;
}
