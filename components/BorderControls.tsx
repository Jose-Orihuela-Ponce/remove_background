'use client';

import { useState, useCallback, useEffect } from 'react';

interface BorderControlsProps {
  onBorderChange: (enabled: boolean, color: string, width: number) => void;
}

const BorderControls: React.FC<BorderControlsProps> = ({ onBorderChange }) => {
  const [borderEnabled, setBorderEnabled] = useState<boolean>(false);
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF'); // Default: white
  const [borderWidth, setBorderWidth] = useState<number>(5); // Default: 5px
  
  // Predefined colors
  const predefinedColors = [
    { name: 'Rojo', value: '#FF0000' },
    { name: 'Azul', value: '#0000FF' },
    { name: 'Verde', value: '#00FF00' },
    { name: 'Amarillo', value: '#FFFF00' },
    { name: 'Púrpura', value: '#800080' },
    { name: 'Naranja', value: '#FFA500' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Negro', value: '#000000' },
  ];

  // Removed debounce function as it's now implemented inline

  // Debounced version of onBorderChange
  const debouncedBorderChange = useCallback((enabled: boolean, color: string, width: number) => {
    const timeoutId = setTimeout(() => {
      onBorderChange(enabled, color, width);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [onBorderChange]
  );

  // Effect to trigger border change when any parameter changes
  useEffect(() => {
    const cleanup = debouncedBorderChange(borderEnabled, borderColor, borderWidth);
    return cleanup;
  }, [borderEnabled, borderColor, borderWidth, debouncedBorderChange]);

  // Handle checkbox change
  const handleEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderEnabled(e.target.checked);
  };

  // Handle color selection
  const handleColorChange = (color: string) => {
    setBorderColor(color);
  };

  // Handle width slider change
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderWidth(parseInt(e.target.value, 10));
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="enableBorder"
          checked={borderEnabled}
          onChange={handleEnableChange}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="enableBorder" className="ml-2 text-sm font-medium text-gray-700">
          Agregar borde con efecto halo
        </label>
      </div>

      {borderEnabled && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color del borde
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorChange(color.value)}
                  className={`w-8 h-8 rounded-full border ${borderColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : 'ring-1 ring-gray-300'}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Color ${color.name}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="borderWidth" className="block text-sm font-medium text-gray-700 mb-2">
              Grosor del borde: {borderWidth}px
            </label>
            <input
              type="range"
              id="borderWidth"
              min="1"
              max="20"
              value={borderWidth}
              onChange={handleWidthChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BorderControls;