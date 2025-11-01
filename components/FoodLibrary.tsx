import React, { useState } from 'react';
import { FOOD_GROUPS } from '../constants';
import type { FoodItem } from '../types';
import { useMealStore } from '../store/mealStore';
import { IconChevronDown } from './Icons';

const FoodItemCard: React.FC<{ item: FoodItem }> = ({ item }) => {
  const addItemToPlate = useMealStore(state => state.addItemToPlate);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('foodId', item.id);
  };

  const VisualComponent = item.visual;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => addItemToPlate(item.id)}
      className="flex flex-col items-center p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:shadow-md cursor-grab active:cursor-grabbing transition-all border border-slate-200"
      title={`Add ${item.label}`}
    >
      <div className="w-20 h-20 pointer-events-none">
        <VisualComponent />
      </div>
      <p className="text-sm font-semibold text-center mt-2 text-slate-700">{item.label}</p>
    </div>
  );
};

export default function FoodLibrary() {
  const [openGroup, setOpenGroup] = useState<string>(FOOD_GROUPS[0]?.name || '');

  const toggleGroup = (groupName: string) => {
    setOpenGroup(prevGroup => (prevGroup === groupName ? '' : groupName));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Food Library</h2>
      <div className="space-y-2 overflow-y-auto pr-2 -mr-4">
        {FOOD_GROUPS.map(group => (
          <div key={group.name}>
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full text-left font-bold p-3 bg-slate-100 hover:bg-slate-200 rounded-lg flex justify-between items-center transition-colors"
            >
              <span>{group.name}</span>
              <span className={`transform transition-transform duration-200 ${openGroup === group.name ? 'rotate-180' : ''}`}>
                <IconChevronDown />
              </span>
            </button>
            {openGroup === group.name && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-b-lg">
                {group.items.map(item => (
                  <FoodItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}