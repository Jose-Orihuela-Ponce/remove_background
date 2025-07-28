'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Cleanup URLs when component unmounts or when URLs change
  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (processedImage) URL.revokeObjectURL(processedImage);
    };
  }, [originalImage, processedImage]);

  const handleFile = async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Cleanup previous URLs
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (processedImage) URL.revokeObjectURL(processedImage);

      // Create URL for original image
      const originalUrl = URL.createObjectURL(file);
      setOriginalImage(originalUrl);
      setProcessedImage(null);
      setError(null);
      setIsProcessing(true);

      // Process image to remove background
      const processedBlob = await removeBackground(file);

      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error al procesar la imagen. Por favor intenta con otra imagen.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'image-without-background.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        ref={dropAreaRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
      )}

      {isProcessing && (
        <div className="mt-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Procesando imagen...</p>
        </div>
      )}

      {(originalImage || processedImage) && !isProcessing && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Resultado:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {originalImage && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Imagen Original</p>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}

            {processedImage && (
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Sin Fondo</p>
                <div className="border rounded-lg overflow-hidden bg-[conic-gradient(#f0f0f0_0.25turn,#ffffff_0.25turn_0.5turn,#f0f0f0_0.5turn_0.75turn,#ffffff_0.75turn)]">
                  <img
                    src={processedImage}
                    alt="Sin fondo"
                    className="w-full h-auto"
                  />
                </div>
                <button
                  onClick={downloadImage}
                  className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Descargar PNG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;