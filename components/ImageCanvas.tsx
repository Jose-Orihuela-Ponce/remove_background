'use client';

import { useRef, useEffect, useState, useMemo } from 'react';

interface ImageCanvasProps {
  processedImage: string;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
  onFinalImageChange: (finalImageUrl: string | null) => void;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  processedImage,
  borderEnabled,
  borderColor,
  borderWidth,
  onFinalImageChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const renderParams = useMemo(
    () => ({ processedImage, borderEnabled, borderColor, borderWidth }),
    [processedImage, borderEnabled, borderColor, borderWidth]
  );

  useEffect(() => {
    const img = new Image();
    img.src = processedImage;
    img.onload = () => {
      setCanvasSize({ width: img.width, height: img.height });
    };
  }, [processedImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = renderParams.processedImage;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (renderParams.borderEnabled && renderParams.borderWidth > 0) {
        applyBorderEffect(ctx, canvas, img, renderParams.borderColor, renderParams.borderWidth);
      }

      onFinalImageChange(canvas.toDataURL('image/png'));
    };
  }, [canvasSize, renderParams, onFinalImageChange]);

  const applyBorderEffect = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    color: string,
    width: number
  ) => {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    maskCtx.globalCompositeOperation = 'source-in';
    maskCtx.fillStyle = color;
    maskCtx.fillRect(0, 0, canvas.width, canvas.height);
    maskCtx.globalCompositeOperation = 'source-over';

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = canvas.width;
    glowCanvas.height = canvas.height;
    const glowCtx = glowCanvas.getContext('2d');
    if (!glowCtx) return;

    glowCtx.filter = `blur(${Math.max(1, width)}px)`;
    glowCtx.drawImage(maskCanvas, 0, 0);
    glowCtx.filter = 'none';

    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(glowCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04)_25%,rgba(255,255,255,0.08)_25%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.04)_50%,rgba(255,255,255,0.04)_75%,rgba(255,255,255,0.08)_75%)] bg-[length:20px_20px] p-2">
      {canvasSize.width === 0 || canvasSize.height === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          Renderizando imagen procesada...
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="h-auto max-w-full object-contain"
        />
      )}
    </div>
  );
};

export default ImageCanvas;
