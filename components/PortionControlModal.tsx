
import React, { useState, useEffect } from 'react';
import type { PlateItem, FoodItem } from '../types';
import { useMealStore } from '../store/mealStore';
import { IconXMark } from './Icons';

interface PortionControlModalProps {
  item: PlateItem;
  foodItem: FoodItem;
  onClose: () => void;
}

export default function PortionControlModal({ item, foodItem, onClose }: PortionControlModalProps) {
  const { updateItemPortion } = useMealStore();
  
  const isVolumeBased = !!foodItem.volume_options_ml;
  const options = isVolumeBased ? foodItem.volume_options_ml! : foodItem.portion_g!;
  const labels = isVolumeBased ? foodItem.volume_labels : foodItem.portion_labels;
  const initialValue = isVolumeBased ? item.volume_ml : item.grams;
  
  const findClosestIndex = (value: number | undefined) => {
    if (value === undefined) return 0;
    return options.reduce((closestIndex, current, index) => 
      Math.abs(current - value) < Math.abs(options[closestIndex] - value) ? index : closestIndex
    , 0);
  };
  
  const [sliderIndex, setSliderIndex] = useState(findClosestIndex(initialValue));
  
  useEffect(() => {
    const newValue = options[sliderIndex];
    const portion = isVolumeBased ? { volume_ml: newValue } : { grams: newValue };
    updateItemPortion(item.instanceId, portion);
  }, [sliderIndex, item.instanceId, isVolumeBased, options, updateItemPortion]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderIndex(parseInt(e.target.value, 10));
  };

  const getTooltipText = () => {
    if (isVolumeBased && foodItem.density_g_per_ml) {
      const grams = (foodItem.volume_options_ml?.[sliderIndex] ?? 0) * foodItem.density_g_per_ml;
      return `~${Math.round(grams)}g`;
    }
    return '';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Adjust Portion</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <IconXMark />
          </button>
        </div>
        <p className="text-lg font-semibold text-emerald-600 mb-2">{foodItem.label}</p>
        <div className="my-6 text-center">
            <p className="text-2xl font-bold">{labels ? labels[sliderIndex] : options[sliderIndex]}</p>
            <p className="text-sm text-slate-500">{getTooltipText()}</p>
        </div>

        <div className="relative pt-1">
          <input
            type="range"
            min="0"
            max={options.length - 1}
            step="1"
            value={sliderIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 px-1 mt-2">
            {labels ? labels.map((label, index) => (
                <span key={index}>{label}</span>
            )) : options.map((option, index) => (
                <span key={index}>{option}</span>
            ))}
          </div>
        </div>
        <button 
            onClick={onClose} 
            className="mt-8 w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
            Done
        </button>
      </div>
    </div>
  );
}