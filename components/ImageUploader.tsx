'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';

interface ImageUploaderProps {
  onImageProcessed: (processedImage: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  onOriginalImageChange?: (originalImage: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageProcessed, setIsProcessing, onOriginalImageChange }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Cleanup URLs when component unmounts or when URLs change
  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
    };
  }, [originalImage]);
  
  // Notify parent component when original image changes
  useEffect(() => {
    if (onOriginalImageChange) {
      onOriginalImageChange(originalImage);
    }
  }, [originalImage, onOriginalImageChange]);

  const handleFile = useCallback(async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Cleanup previous URLs
      if (originalImage) URL.revokeObjectURL(originalImage);

      // Create URL for original image
      const originalUrl = URL.createObjectURL(file);
      setOriginalImage(originalUrl);
      setError(null);
      setIsProcessing(true);

      // Process image to remove background
      const processedBlob = await removeBackground(file);

      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      onImageProcessed(processedUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Error al procesar la imagen. Por favor intenta con otra imagen.');
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, onImageProcessed, setIsProcessing]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
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

  return (
    <div className="w-full">
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

      {/* La imagen original ahora se muestra en el layout flex del componente padre */}
    </div>
  );
};

export default ImageUploader;