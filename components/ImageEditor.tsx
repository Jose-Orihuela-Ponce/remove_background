'use client';

import { useState, useCallback, useMemo } from 'react';
import BorderControls from './BorderControls';
import ImageCanvas from './ImageCanvas';

interface ImageEditorProps {
  processedImage: string;
  originalImage: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ processedImage, originalImage }) => {
  const [borderEnabled, setBorderEnabled] = useState<boolean>(false);
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF');
  const [borderWidth, setBorderWidth] = useState<number>(5);
  const [finalImage, setFinalImage] = useState<string | null>(null);

  // Memoize the processed image to avoid unnecessary re-renders
  const memoizedProcessedImage = useMemo(() => processedImage, [processedImage]);

  // Handle border changes from BorderControls
  const handleBorderChange = useCallback((enabled: boolean, color: string, width: number) => {
    setBorderEnabled(enabled);
    setBorderColor(color);
    setBorderWidth(width);
  }, []);

  // Handle final image changes from ImageCanvas
  const handleFinalImageChange = useCallback((imageUrl: string | null) => {
    setFinalImage(imageUrl);
  }, []);

  // Download the final image
  const downloadImage = () => {
    if (finalImage) {
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = borderEnabled ? 'image-with-halo-effect.png' : 'image-without-background.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="mt-6">
      {/* Contenedor flex para las imágenes - horizontal en desktop, vertical en móvil */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Imagen original */}
        <div className="flex-1">
          <p className="mb-2 text-sm font-medium text-gray-700">Imagen Original</p>
          <div className="border rounded-lg overflow-hidden flex justify-center items-center bg-[conic-gradient(#f0f0f0_0.25turn,#ffffff_0.25turn_0.5turn,#f0f0f0_0.5turn_0.75turn,#ffffff_0.75turn)]">
            <img
              src={originalImage}
              alt="Original"
              className="max-w-full h-auto object-contain"
            />
          </div>
        </div>
        
        {/* Imagen procesada */}
        <div className="flex-1">
          <p className="mb-2 text-sm font-medium text-gray-700">Sin Fondo</p>
          <ImageCanvas
            processedImage={memoizedProcessedImage}
            borderEnabled={borderEnabled}
            borderColor={borderColor}
            borderWidth={borderWidth}
            onFinalImageChange={handleFinalImageChange}
          />
        </div>
      </div>
      
      {/* Controles de borde - ancho completo */}
      <div className="w-full">
        <BorderControls onBorderChange={handleBorderChange} />
      </div>
      
      <button
        onClick={downloadImage}
        className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
      >
        Descargar PNG {borderEnabled ? 'con efecto' : 'sin fondo'}
      </button>
    </div>
  );
};

export default ImageEditor;