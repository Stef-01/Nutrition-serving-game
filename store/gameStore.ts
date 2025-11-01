
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMealStore } from './mealStore';
import { CHARACTERS } from '../characters';
import { calculateScore } from '../utils/nutrition';
import type { OrderResult } from '../types';

interface GameState {
    currentCustomerIndex: number;
    totalScore: number;
    isPostOrder: boolean;
    lastOrderResult: OrderResult | null;
    servePlate: () => void;
    nextCustomer: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            currentCustomerIndex: 0,
            totalScore: 0,
            isPostOrder: false,
            lastOrderResult: null,
            servePlate: () => {
                const customer = CHARACTERS[get().currentCustomerIndex];
                const plateItems = useMealStore.getState().plateItems;
                const { score, feedback, reaction } = calculateScore(customer, plateItems);
                
                set(state => ({
                    totalScore: state.totalScore + score,
                    isPostOrder: true,
                    lastOrderResult: {
                        score,
                        feedback,
                        reaction,
                        customerIndex: get().currentCustomerIndex,
                    },
                }));
            },
            nextCustomer: () => {
                useMealStore.getState().clearPlate();
                set(state => ({
                    currentCustomerIndex: (state.currentCustomerIndex + 1) % CHARACTERS.length,
                    isPostOrder: false,
                }));
            },
        }),
        {
            name: 'game-storage',
            storage: createJSONStorage(() => sessionStorage), 
        }
    )
);