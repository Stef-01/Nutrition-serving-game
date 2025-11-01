import React, { useState } from 'react';
import { useMealStore } from '../store/mealStore';
import { useGameStore } from '../store/gameStore';
import { calculateTotalNutrients, getMealGoals } from '../utils/nutrition';
import FoodLibrary from './FoodLibrary';
import Plate from './Plate';
import PortionControlModal from './PortionControlModal';
import MacroMeter from './MacroMeter';
import GlycemicForecastGraph from './GlycemicForecastGraph';
import CustomerView from './CustomerView';
import PostOrderModal from './PostOrderModal';
import FunFactsWidget from './FunFactsWidget';
import ChangelogModal from './ChangelogModal';
import type { PlateItem } from '../types';
import { FOOD_DATA } from '../constants';
import { CHARACTERS } from '../characters';
import { IconArrowLeftCircle, IconArrowRightCircle } from './Icons';

export default function Dashboard() {
  const [editingItem, setEditingItem] = useState<PlateItem | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [analysisView, setAnalysisView] = useState<'meters' | 'forecast'>('meters');

  const plateItems = useMealStore(state => state.plateItems);
  const { isPostOrder, lastOrderResult, currentCustomerIndex } = useGameStore();

  const totalNutrients = calculateTotalNutrients(plateItems);
  const customer = CHARACTERS[currentCustomerIndex];
  const mealGoals = getMealGoals(customer.order.plateSize, customer.order.diabetesMode);

  const editingFoodItem = editingItem ? FOOD_DATA.find(f => f.id === editingItem.id) : null;

  const toggleView = () => {
    setAnalysisView(prev => prev === 'meters' ? 'forecast' : 'meters');
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">NutriServe 🥗</h1>
        <button 
          onClick={() => setShowChangelog(true)} 
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          Changelog
        </button>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <div className="lg:col-span-1 xl:col-span-1 h-[90vh]">
          <FoodLibrary />
        </div>

        <div className="lg:col-span-2 xl:col-span-2 space-y-6">
          <CustomerView />
          <Plate onEditItem={setEditingItem} />
        </div>

        <div className="lg:col-span-3 xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {analysisView === 'meters' ? 'Meal Analysis' : 'Glycemic Forecast'}
                </h2>
                <div className="flex items-center space-x-2">
                    <button onClick={toggleView} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors rounded-full"><IconArrowLeftCircle /></button>
                    <div className="flex space-x-1.5">
                        <div className={`w-2 h-2 rounded-full ${analysisView === 'meters' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${analysisView === 'forecast' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <button onClick={toggleView} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors rounded-full"><IconArrowRightCircle /></button>
                </div>
             </div>
             {analysisView === 'meters' ? (
                <div className="grid grid-cols-2 gap-4">
                    <MacroMeter name="Calories" value={totalNutrients.calories_kcal} unit="kcal" target={mealGoals.calories_kcal} mode="band" />
                    <MacroMeter name="Protein" value={totalNutrients.protein_g} unit="g" target={mealGoals.protein_g} mode="min" />
                    <MacroMeter name="Carbs" value={totalNutrients.carbs_g} unit="g" target={mealGoals.carbs_g} mode="max" />
                    <MacroMeter name="Fat" value={totalNutrients.fat_g} unit="g" target={mealGoals.fat_g} mode="max" />
                    <MacroMeter name="Fiber" value={totalNutrients.fiber_g} unit="g" target={mealGoals.fiber_g} mode="min" />
                    <MacroMeter name="Sodium" value={totalNutrients.sodium_mg} unit="mg" target={mealGoals.sodium_mg} mode="max" />
                </div>
             ) : (
                <GlycemicForecastGraph totalNutrients={totalNutrients} />
             )}
          </div>
          <FunFactsWidget />
        </div>

      </main>
      
      {editingItem && editingFoodItem && (
        <PortionControlModal 
          item={editingItem} 
          foodItem={editingFoodItem} 
          onClose={() => setEditingItem(null)} 
        />
      )}

      {isPostOrder && lastOrderResult && (
        <PostOrderModal
          score={lastOrderResult.score}
          feedback={lastOrderResult.feedback}
          reaction={lastOrderResult.reaction}
          character={CHARACTERS[lastOrderResult.customerIndex]}
        />
      )}

      {showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}
    </div>
  );
}