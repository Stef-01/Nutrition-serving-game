import React, { useState, useEffect, useCallback } from 'react';
import { healthFacts } from '../funFacts';
import type { Fact } from '../types';
import { IconInfoCircle } from './Icons';

/**
 * @description A widget that displays sourced health facts, rotating them periodically.
 */
export default function FunFactsWidget() {
  const [factIndex, setFactIndex] = useState(0);

  const getNextFactIndex = useCallback(() => {
    setFactIndex(prevIndex => (prevIndex + 1) % healthFacts.length);
  }, []);

  useEffect(() => {
    // Select a random fact on component mount
    setFactIndex(Math.floor(Math.random() * healthFacts.length));
    
    const intervalId = setInterval(() => {
        getNextFactIndex();
    }, 15000); // Rotate every 15 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [getNextFactIndex]);
  
  const currentFact: Fact | undefined = healthFacts[factIndex];

  if (!currentFact) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-bold mb-2 text-emerald-600 flex items-center gap-2">
        <IconInfoCircle className="w-6 h-6" />
        <span>Did You Know?</span>
      </h3>
      <div className="min-h-[8em]">
        <p className="text-slate-700">{currentFact.text}</p>
        <a 
          href={currentFact.source_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-slate-500 hover:text-emerald-600 transition-colors mt-2 block"
        >
          Source: {currentFact.source_name}
        </a>
      </div>
      <button 
        onClick={getNextFactIndex}
        className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
      >
        Next Tip
      </button>
    </div>
  );
}
