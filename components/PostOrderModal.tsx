
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Character, CharacterReaction } from '../types';

interface PostOrderModalProps {
  score: number;
  feedback: string;
  character: Character;
  reaction: CharacterReaction;
}

/**
 * @description A modal that appears after an order is served, showing the results and customer reaction.
 */
export default function PostOrderModal({ score, feedback, character, reaction }: PostOrderModalProps) {
  const nextCustomer = useGameStore(state => state.nextCustomer);
  
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (score === 0) return;
    const duration = 800;
    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= duration) {
        setDisplayScore(score);
        return;
      }
      const progress = elapsedTime / duration;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayScore(Math.round(score * easedProgress));
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [score]);


  const getReactionVisual = () => {
    if (reaction === 'happy') return character.visuals.happy;
    if (reaction === 'sad') return character.visuals.sad;
    return character.visuals.default;
  };
  
  const ReactionVisual = getReactionVisual();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-amber-50 rounded-2xl shadow-xl p-8 w-full max-w-sm text-center animate-pop-in" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-amber-900">Order Complete!</h2>
        
        <div className="my-4 w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-inner bg-amber-100">
            <ReactionVisual />
        </div>
        
        <p className="text-xl font-bold text-amber-800">Your Score</p>
        <p className="text-7xl font-bold text-amber-900 my-2 transition-colors duration-300">
            {displayScore}
        </p>
        
        <p className="text-slate-600 mt-4 italic h-12">"{feedback}"</p>
        
        <button 
            onClick={nextCustomer} 
            className="mt-8 w-full bg-emerald-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 animate-breathe"
        >
            Next Customer
        </button>
      </div>
      <style>{`
        @keyframes pop-in {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.3s ease-out forwards; }
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.3), 0 4px 6px -2px rgba(22, 163, 74, 0.2); }
          50% { transform: scale(1.03); box-shadow: 0 20px 25px -5px rgba(22, 163, 74, 0.4), 0 10px 10px -5px rgba(22, 163, 74, 0.3); }
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}