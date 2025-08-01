'use client';

import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import ImageEditor from './ImageEditor';

const BackgroundRemover = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (processedImage) URL.revokeObjectURL(processedImage);
      if (originalImage) URL.revokeObjectURL(originalImage);
    };
  }, [processedImage, originalImage]);

  // Handle processed image from ImageUploader
  const handleImageProcessed = (imageUrl: string) => {
    setProcessedImage(imageUrl);
  };
  
  // Handle original image from ImageUploader
  const handleOriginalImageChange = (imageUrl: string | null) => {
    setOriginalImage(imageUrl);
  };


  return (
    <div className="w-full mx-auto">
      <ImageUploader 
        onImageProcessed={handleImageProcessed}
        setIsProcessing={setIsProcessing}
        onOriginalImageChange={handleOriginalImageChange}
      />

      {isProcessing && (
        <div className="mt-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-gray-600">Procesando imagen...</p>
        </div>
      )}

      {processedImage && originalImage && !isProcessing && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4 text-black">Resultado:</h3>
          <ImageEditor 
            processedImage={processedImage} 
            originalImage={originalImage}
          />
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;