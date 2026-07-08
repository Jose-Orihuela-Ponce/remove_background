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

  const memoizedProcessedImage = useMemo(() => processedImage, [processedImage]);

  const handleBorderChange = useCallback((enabled: boolean, color: string, width: number) => {
    setBorderEnabled(enabled);
    setBorderColor(color);
    setBorderWidth(width);
  }, []);

  const handleFinalImageChange = useCallback((imageUrl: string | null) => {
    setFinalImage(imageUrl);
  }, []);

  const downloadImage = () => {
    if (!finalImage) return;

    const link = document.createElement('a');
    link.href = finalImage;
    link.download = borderEnabled ? 'image-with-halo-effect.png' : 'image-without-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6">
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-sm font-medium text-slate-300">Imagen original</p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.08)_25%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,rgba(255,255,255,0.08)_75%)] bg-[length:20px_20px] p-2">
            <img
              src={originalImage}
              alt="Original"
              className="h-auto w-full rounded-xl object-contain"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-sm font-medium text-slate-300">Sin fondo</p>
          <ImageCanvas
            processedImage={memoizedProcessedImage}
            borderEnabled={borderEnabled}
            borderColor={borderColor}
            borderWidth={borderWidth}
            onFinalImageChange={handleFinalImageChange}
          />
        </div>
      </div>

      <div className="w-full">
        <BorderControls onBorderChange={handleBorderChange} />
      </div>

      <button
        onClick={downloadImage}
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        Descargar PNG {borderEnabled ? 'con efecto' : 'sin fondo'}
      </button>
    </div>
  );
};

export default ImageEditor;
