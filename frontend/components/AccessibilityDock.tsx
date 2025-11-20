
import React from 'react';

interface AccessibilityDockProps {
  onFontSizeChange: (increase: boolean) => void;
  onContrastToggle: () => void;
}


export const AccessibilityDock: React.FC<AccessibilityDockProps> = ({ onFontSizeChange, onContrastToggle }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-2 rounded-full shadow-lg border border-gray-200">
      <div className="flex items-center gap-1">
        <button onClick={() => onFontSizeChange(true)} title="Aumentar Fonte" className="h-10 w-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
          <span className="font-bold">A+</span>
        </button>
        <button onClick={() => onFontSizeChange(false)} title="Diminuir Fonte" className="h-10 w-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
          <span className="font-bold">A-</span>
        </button>
        <button onClick={onContrastToggle} title="Modo de Alto Contraste" className="h-10 w-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
          <i className="fa-solid fa-circle-half-stroke fa-lg"></i>
        </button>
      </div>
    </div>
  );
};