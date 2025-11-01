
import React from 'react';
import { changelogData } from '../changelogData';
import { IconXMark } from './Icons';

interface ChangelogModalProps {
  onClose: () => void;
}

/**
 * @description A modal component that displays the application's version history.
 * @param {ChangelogModalProps} props - The component props.
 * @param {function} props.onClose - The function to call when the modal should be closed.
 * @returns {React.ReactElement} The rendered modal.
 */
export default function ChangelogModal({ onClose }: ChangelogModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl h-[80vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold">Changelog</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <IconXMark />
          </button>
        </div>
        <div className="overflow-y-auto pr-4 -mr-4 space-y-6">
          {changelogData.map((entry) => (
            <div key={entry.version}>
              <div className="flex items-baseline space-x-3">
                <h3 className="text-lg font-bold text-emerald-600">Version {entry.version}</h3>
                <p className="text-sm text-slate-500">{entry.date}</p>
              </div>
              <ul className="list-disc list-inside mt-2 text-slate-700 space-y-1 pl-2">
                {entry.changes.map((change, index) => (
                  <li key={index}>
                    <span className={`font-semibold ${change.startsWith('Feat:') ? 'text-sky-700' : change.startsWith('Fix:') ? 'text-rose-700' : 'text-slate-700'}`}>
                      {change.split(':')[0]}:
                    </span>
                    {change.substring(change.indexOf(':') + 1)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}