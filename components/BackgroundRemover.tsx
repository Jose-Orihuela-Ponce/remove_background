'use client';

import { useState, useEffect } from 'react';
import { preload, type Config } from '@imgly/background-removal';
import ImageUploader from './ImageUploader';
import ImageEditor from './ImageEditor';

const backgroundRemovalConfig: Config = {
  proxyToWorker: true,
  rescale: true,
  model: 'isnet_fp16',
};

const BackgroundRemover = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [processingStage, setProcessingStage] = useState('Preparando procesamiento...');

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (processedImage) URL.revokeObjectURL(processedImage);
      if (originalImage) URL.revokeObjectURL(originalImage);
    };
  }, [processedImage, originalImage]);

  useEffect(() => {
    preload(backgroundRemovalConfig).catch((error) => {
      console.warn('Background removal preload failed:', error);
    });
  }, []);

  // Handle processed image from ImageUploader
  const handleImageProcessed = (imageUrl: string) => {
    if (processedImage) URL.revokeObjectURL(processedImage);
    setProcessedImage(imageUrl);
  };
  
  // Handle original image from ImageUploader
  const handleOriginalImageChange = (imageUrl: string | null) => {
    setOriginalImage(imageUrl);
  };

  const handleProcessingStateChange = (progress: number | null, stage: string) => {
    setProcessingProgress(progress);
    setProcessingStage(stage);
  };


  return (
    <div className="w-full mx-auto text-slate-100">
      <ImageUploader 
        onImageProcessed={handleImageProcessed}
        setIsProcessing={setIsProcessing}
        onOriginalImageChange={handleOriginalImageChange}
        onProcessingStateChange={handleProcessingStateChange}
      />

      {isProcessing && (
        <div className="mt-6 rounded-3xl border border-cyan-400/15 bg-slate-900/90 p-5 shadow-xl shadow-black/30">
          <div className="flex items-start gap-4">
            <div className="relative mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{processingStage}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    La primera imagen puede tardar mas porque carga el modelo en el navegador.
                  </p>
                </div>
                <p className="text-sm font-semibold text-cyan-200">
                  {processingProgress !== null ? `${processingProgress}%` : '...'}
                </p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 transition-all duration-300"
                  style={{ width: `${processingProgress ?? 12}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {processedImage && originalImage && !isProcessing && (
        <div className="mt-6">
          <h3 className="mb-4 text-lg font-medium text-white">Resultado</h3>
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
