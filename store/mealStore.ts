import { create } from 'zustand';
import type { PlateItem } from '../types';
import { FOOD_DATA } from '../constants';

interface MealState {
  plateItems: PlateItem[];
  addItemToPlate: (foodId: string) => void;
  removeItemFromPlate: (instanceId: string) => void;
  updateItemPortion: (instanceId: string, portion: Partial<Pick<PlateItem, 'volume_ml' | 'grams'>>) => void;
  clearPlate: () => void;
}

export const useMealStore = create<MealState>((set) => ({
  plateItems: [],
  addItemToPlate: (foodId) => {
    const foodItem = FOOD_DATA.find(f => f.id === foodId);
    if (!foodItem) return;

    const newPlateItem: PlateItem = {
      id: foodId,
      instanceId: `${foodId}_${Date.now()}_${Math.random()}`, // Unique ID
      // Set a sensible default portion size.
      // For volume-based, pick the second option if available (e.g., 'Katori' or 'Medium').
      // For portion-based, pick the first option (e.g., '1 piece').
      volume_ml: foodItem.volume_options_ml?.[1] ?? foodItem.volume_options_ml?.[0],
      grams: foodItem.portion_g?.[0],
    };

    set((state) => ({
      plateItems: [...state.plateItems, newPlateItem],
    }));
  },
  removeItemFromPlate: (instanceId) => {
    set((state) => ({
      plateItems: state.plateItems.filter(item => item.instanceId !== instanceId),
    }));
  },
  updateItemPortion: (instanceId, portion) => {
    set((state) => ({
      plateItems: state.plateItems.map(item =>
        item.instanceId === instanceId ? { ...item, ...portion } : item
      ),
    }));
  },
  clearPlate: () => {
    set({ plateItems: [] });
  },
}));
