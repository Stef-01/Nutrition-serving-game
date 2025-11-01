
import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useMealStore } from '../store/mealStore';
import { CHARACTERS } from '../characters';

/**
 * @description Displays the current customer and their order, and provides the button to serve the plate.
 */
export default function CustomerView() {
  const currentCustomerIndex = useGameStore(state => state.currentCustomerIndex);
  const servePlate = useGameStore(state => state.servePlate);
  const plateItems = useMealStore(state => state.plateItems);
  const customer = CHARACTERS[currentCustomerIndex];
  
  if (!customer) return null;

  const CustomerVisual = customer.visuals.default;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
          <CustomerVisual />
        </div>
        <div className="flex-1">
            <h2 className="text-xl font-bold">{customer.name}</h2>
            <div className="mt-2 bg-slate-100 p-3 rounded-lg relative">
                <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-100 transform rotate-45"></div>
                <p className="text-slate-700 italic">"{customer.order.description}"</p>
            </div>
        </div>
      </div>
      <button 
        onClick={servePlate}
        disabled={plateItems.length === 0}
        className="mt-4 w-full bg-emerald-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none animate-breathe"
      >
        Serve Plate
      </button>
       <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3), 0 4px 6px -2px rgba(22, 163, 74, 0.2); }
          50% { transform: scale(1.03); box-shadow: 0 20px 25px -5px rgba(22, 163, 74, 0.4), 0 10px 10px -5px rgba(22, 163, 74, 0.3); }
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        .disabled\\:transform-none {
            transform: none !important;
            animation: none !important;
            box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}