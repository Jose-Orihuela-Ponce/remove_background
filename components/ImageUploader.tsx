'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { removeBackground } from '@imgly/background-removal';

const MAX_PROCESSING_SIZE = 1800;
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploaderProps {
  onImageProcessed: (processedImage: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  onOriginalImageChange?: (originalImage: string | null) => void;
  onProcessingStateChange?: (progress: number | null, stage: string) => void;
}

const yieldToMain = () =>
  new Promise<void>((resolve) => {
    if ('scheduler' in window && 'yield' in (window as unknown as { scheduler: { yield: () => Promise<void> } }).scheduler) {
      (window as unknown as { scheduler: { yield: () => Promise<void> } }).scheduler.yield().then(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });

const getStageLabel = (key: string) => {
  const normalized = key.toLowerCase();
  if (normalized.includes('download') || normalized.includes('fetch')) return 'Descargando recursos';
  if (normalized.includes('model')) return 'Cargando modelo';
  if (normalized.includes('worker')) return 'Iniciando motor';
  return 'Procesando imagen';
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageProcessed,
  setIsProcessing,
  onOriginalImageChange,
  onProcessingStateChange,
}) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
    };
  }, [originalImage]);

  useEffect(() => {
    if (onOriginalImageChange) {
      onOriginalImageChange(originalImage);
    }
  }, [originalImage, onOriginalImageChange]);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
          setError('Por favor selecciona una imagen PNG, JPG o WEBP');
          return;
        }

        if (originalImage) URL.revokeObjectURL(originalImage);

        const originalUrl = URL.createObjectURL(file);
        setOriginalImage(originalUrl);
        setError(null);
        setIsProcessing(true);
        onProcessingStateChange?.(0, 'Preparando procesamiento...');

        await yieldToMain();
        onProcessingStateChange?.(5, 'Optimizando imagen...');

        const imageForProcessing = await resizeImageForProcessing(file);

        await yieldToMain();

        const processedBlob = await removeBackground(imageForProcessing, {
          proxyToWorker: false,
          rescale: true,
          model: 'isnet_quint8',
          progress: (key: string, current: number, total: number) => {
            const percent = total > 0 ? Math.min(99, Math.round((current / total) * 100)) : null;
            onProcessingStateChange?.(percent, getStageLabel(key));
          },
        });

        const processedUrl = URL.createObjectURL(processedBlob);

        await yieldToMain();
        onProcessingStateChange?.(100, 'Imagen lista');
        onImageProcessed(processedUrl);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Error al procesar la imagen. Por favor intenta con otra imagen.');
      } finally {
        setIsProcessing(false);
        onProcessingStateChange?.(null, 'Procesamiento finalizado');
      }
    },
    [originalImage, onImageProcessed, onProcessingStateChange, setIsProcessing]
  );

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

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className="w-full">
      <div
        ref={dropAreaRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="group cursor-pointer rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center transition-all duration-300 hover:border-cyan-300/50 hover:bg-white/[0.06] hover:shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-3 h-12 w-12 text-cyan-300/70 transition-transform duration-300 group-hover:scale-105 group-hover:text-cyan-200"
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
          <p className="mb-2 text-sm text-slate-300">
            <span className="font-semibold text-white">Haz clic para subir</span> o arrastra y suelta
          </p>
          <p className="text-xs text-slate-400">PNG, JPG, WEBP. Max. 10MB</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
};

async function resizeImageForProcessing(file: File): Promise<Blob | File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_PROCESSING_SIZE / Math.max(bitmap.width, bitmap.height));

  if (scale === 1) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  return new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      outputType,
      0.92
    );
  });
}

export default ImageUploader;
