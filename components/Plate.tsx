import React, { useState } from 'react';
import { useMealStore } from '../store/mealStore';
import { FOOD_DATA } from '../constants';
import type { PlateItem, FoodItem } from '../types';
import { IconXCircle } from './Icons';

interface PlateProps {
  onEditItem: (item: PlateItem) => void;
}

const PLATE_DIAMETER_PX = 400; 
const TOTAL_AREA_CAPACITY_ML = 1000; // Visual capacity of the plate in ml

const getItemVolume = (item: PlateItem, foodItem: FoodItem): number => {
    if (item.volume_ml) {
        return item.volume_ml;
    }
    if (item.grams && foodItem.density_g_per_ml) {
        return item.grams / foodItem.density_g_per_ml;
    }
    return 50; // Default volume for items without density
};

export default function Plate({ onEditItem }: PlateProps) {
  const { plateItems, removeItemFromPlate, addItemToPlate } = useMealStore();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const foodId = e.dataTransfer.getData('foodId');
    if (foodId) {
      addItemToPlate(foodId);
    }
  };

  const hoveredItem = plateItems.find(item => item.instanceId === hoveredItemId);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Your Plate</h2>
      <div 
        className={`relative w-full aspect-square max-w-md mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${isDraggingOver ? 'scale-105 shadow-2xl border-emerald-500' : 'shadow-lg border-slate-300'} border-4`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{
            backgroundImage: 'radial-gradient(circle, #f1f5f9 0%, #e2e8f0 80%)'
        }}
      >
        {plateItems.length === 0 && (
            <p className="text-slate-500 text-center px-8 z-0">Drag food items here to build your meal.</p>
        )}

        {plateItems.map((item, index) => {
          const foodItem = FOOD_DATA.find(f => f.id === item.id);
          if (!foodItem) return null;
          
          const itemVolume = getItemVolume(item, foodItem);
          const itemAreaRatio = itemVolume / TOTAL_AREA_CAPACITY_ML;
          const plateArea = Math.PI * (PLATE_DIAMETER_PX / 2) ** 2;
          const itemArea = itemAreaRatio * plateArea * 1.8; // Multiply by 1.8 to make sizes more prominent
          const itemDiameter = Math.sqrt(itemArea / Math.PI) * 2;

          const angle = (index / plateItems.length) * 2 * Math.PI + Math.PI / 4;
          const placementRadius = plateItems.length > 1 ? PLATE_DIAMETER_PX * 0.25 : 0;
          
          const x = placementRadius * Math.cos(angle);
          const y = placementRadius * Math.sin(angle);
          
          const VisualComponent = foodItem.visual;

          const style: React.CSSProperties = {
            width: `${itemDiameter}px`,
            height: `${itemDiameter}px`,
            top: `calc(50% + ${y}px)`,
            left: `calc(50% + ${x}px)`,
            transform: `translate(-50%, -50%)`,
            zIndex: index + 1,
          };

          return (
            <div
              key={item.instanceId}
              style={style}
              className="absolute cursor-pointer transition-all duration-300 ease-out group hover:!z-20 drop-shadow-md hover:drop-shadow-lg"
              onClick={() => onEditItem(item)}
              onMouseEnter={() => setHoveredItemId(item.instanceId)}
              onMouseLeave={() => setHoveredItemId(null)}
              title={foodItem.label} // Keep for accessibility
            >
              <button 
                onClick={(e) => { e.stopPropagation(); removeItemFromPlate(item.instanceId); }}
                className="absolute -top-1 -right-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label={`Remove ${foodItem.label}`}
              >
                <IconXCircle />
              </button>
              <VisualComponent volume_ml={item.volume_ml} grams={item.grams} />
            </div>
          );
        })}

        {hoveredItem && (() => {
          const foodItem = FOOD_DATA.find(f => f.id === hoveredItem.id);
          if (!foodItem) return null;

          const itemIndex = plateItems.findIndex(i => i.instanceId === hoveredItem.instanceId);
          const angle = (itemIndex / plateItems.length) * 2 * Math.PI + Math.PI / 4;
          const placementRadius = plateItems.length > 1 ? PLATE_DIAMETER_PX * 0.25 : 0;
          const x = placementRadius * Math.cos(angle);
          const y = placementRadius * Math.sin(angle);
          
          const itemVolume = getItemVolume(hoveredItem, foodItem);
          const itemAreaRatio = itemVolume / TOTAL_AREA_CAPACITY_ML;
          const plateArea = Math.PI * (PLATE_DIAMETER_PX / 2) ** 2;
          const itemArea = itemAreaRatio * plateArea * 1.8;
          const itemDiameter = Math.sqrt(itemArea / Math.PI) * 2;

          const tooltipStyle: React.CSSProperties = {
            top: `calc(50% + ${y}px - ${itemDiameter / 2}px)`, // Position above the item's top edge
            left: `calc(50% + ${x}px)`,
            transform: 'translate(-50%, -120%)',
            zIndex: 50,
          };

          return (
            <div style={tooltipStyle} className="absolute bg-slate-800 text-white text-sm font-semibold px-3 py-1.5 rounded-md shadow-lg pointer-events-none transition-opacity duration-200">
              {foodItem.label}
            </div>
          );
        })()}
      </div>
    </div>
  );
}