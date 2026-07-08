'use client';

import { useState, useCallback, useEffect } from 'react';

interface BorderControlsProps {
  onBorderChange: (enabled: boolean, color: string, width: number) => void;
}

const BorderControls: React.FC<BorderControlsProps> = ({ onBorderChange }) => {
  const [borderEnabled, setBorderEnabled] = useState<boolean>(false);
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF');
  const [borderWidth, setBorderWidth] = useState<number>(5);

  const predefinedColors = [
    { name: 'Rojo', value: '#FF4D6D' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#22C55E' },
    { name: 'Amarillo', value: '#FACC15' },
    { name: 'Purpura', value: '#A855F7' },
    { name: 'Naranja', value: '#FB923C' },
    { name: 'Blanco', value: '#FFFFFF' },
    { name: 'Negro', value: '#0F172A' },
  ];

  const debouncedBorderChange = useCallback(
    (enabled: boolean, color: string, width: number) => {
      const timeoutId = setTimeout(() => {
        onBorderChange(enabled, color, width);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [onBorderChange]
  );

  useEffect(() => {
    const cleanup = debouncedBorderChange(borderEnabled, borderColor, borderWidth);
    return cleanup;
  }, [borderEnabled, borderColor, borderWidth, debouncedBorderChange]);

  const handleEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderEnabled(e.target.checked);
  };

  const handleColorChange = (color: string) => {
    setBorderColor(color);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderWidth(parseInt(e.target.value, 10));
  };

  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableBorder"
          checked={borderEnabled}
          onChange={handleEnableChange}
          className="h-4 w-4 rounded border-white/20 bg-transparent text-cyan-400 focus:ring-cyan-400"
        />
        <label htmlFor="enableBorder" className="ml-2 text-sm font-medium text-slate-200">
          Agregar borde con efecto halo
        </label>
      </div>

      {borderEnabled && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Color del borde
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorChange(color.value)}
                  className={`h-8 w-8 rounded-full border transition-transform hover:scale-105 ${
                    borderColor === color.value
                      ? 'ring-2 ring-cyan-300 ring-offset-2 ring-offset-slate-950'
                      : 'border-white/20'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  aria-label={`Color ${color.name}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="borderWidth" className="mb-2 block text-sm font-medium text-slate-300">
              Grosor del borde: {borderWidth}px
            </label>
            <input
              type="range"
              id="borderWidth"
              min="1"
              max="20"
              value={borderWidth}
              onChange={handleWidthChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BorderControls;
