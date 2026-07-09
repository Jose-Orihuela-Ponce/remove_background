'use client';

import { useRef, useEffect, useMemo } from 'react';

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
  const imageRef = useRef<HTMLImageElement | null>(null);

  const renderParams = useMemo(
    () => ({ processedImage, borderEnabled, borderColor, borderWidth }),
    [processedImage, borderEnabled, borderColor, borderWidth]
  );

  useEffect(() => {
    const img = new Image();
    imageRef.current = img;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (renderParams.borderEnabled && renderParams.borderWidth > 0) {
        applyBorderEffect(ctx, canvas, img, renderParams.borderColor, renderParams.borderWidth);
      }

      onFinalImageChange(canvas.toDataURL('image/png'));
    };

    img.src = renderParams.processedImage;

    return () => {
      if (imageRef.current === img) {
        imageRef.current = null;
      }
    };
  }, [renderParams, onFinalImageChange]);

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
      <canvas
        ref={canvasRef}
        className="h-auto max-w-full object-contain"
      />
    </div>
  );
};

export default ImageCanvas;
