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
  
  // Memoize the parameters to avoid unnecessary re-renders
  const renderParams = useMemo(
    () => ({ processedImage, borderEnabled, borderColor, borderWidth }),
    [processedImage, borderEnabled, borderColor, borderWidth]
  );

  // Effect to load the image and set canvas size
  useEffect(() => {
    const img = new Image();
    img.src = processedImage;
    img.onload = () => {
      setCanvasSize({ width: img.width, height: img.height });
    };
  }, [processedImage]);

  // Effect to render the image with border effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load the processed image
    const img = new Image();
    img.src = renderParams.processedImage;
    img.onload = () => {
      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Apply border effect if enabled
      if (renderParams.borderEnabled && renderParams.borderWidth > 0) {
        applyBorderEffect(ctx, canvas, img, renderParams.borderColor, renderParams.borderWidth);
      }

      // Convert canvas to data URL and update final image
      const finalImageUrl = canvas.toDataURL('image/png');
      onFinalImageChange(finalImageUrl);
    };
  }, [canvasSize, renderParams, onFinalImageChange]);

  // Function to apply border effect
  const applyBorderEffect = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    color: string,
    width: number
  ) => {
    // Create a temporary canvas to work with the image data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw the image on the temporary canvas
    tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data to find edges
    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create a new canvas for the glow effect
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = canvas.width;
    glowCanvas.height = canvas.height;
    const glowCtx = glowCanvas.getContext('2d');
    if (!glowCtx) return;

    // Find the edges (pixels with alpha > 0 that have transparent neighbors)
    const edgePixels: [number, number][] = [];
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        // If pixel has alpha > 0
        if (data[idx + 3] > 0) {
          // Check surrounding pixels
          let isEdge = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= canvas.width || ny < 0 || ny >= canvas.height) {
                isEdge = true;
                break;
              }
              const nidx = (ny * canvas.width + nx) * 4;
              if (data[nidx + 3] === 0) {
                isEdge = true;
                break;
              }
            }
            if (isEdge) break;
          }
          if (isEdge) {
            edgePixels.push([x, y]);
          }
        }
      }
    }

    // Parse the color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Draw glow effect
    glowCtx.fillStyle = 'rgba(0,0,0,0)';
    glowCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each edge pixel with a radial gradient for glow effect
    for (const [x, y] of edgePixels) {
      // Reducir la separación entre el borde y la imagen
      // Comenzamos el gradiente directamente en el borde (0) y usamos un valor inicial más alto de opacidad
      const gradient = glowCtx.createRadialGradient(x, y, 0, x, y, width);
      gradient.addColorStop(0, `rgba(${r},${g},${b},1.0)`);
      gradient.addColorStop(0.3, `rgba(${r},${g},${b},0.8)`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
      
      glowCtx.fillStyle = gradient;
      glowCtx.beginPath();
      // Reducimos ligeramente el tamaño del arco para que esté más pegado al contorno
      glowCtx.arc(x, y, width - 1, 0, Math.PI * 2);
      glowCtx.fill();
    }

    // Draw the glow effect on the main canvas
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(glowCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // Draw the original image on top to ensure it's visible
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="relative border rounded-lg overflow-hidden bg-[conic-gradient(#f0f0f0_0.25turn,#ffffff_0.25turn_0.5turn,#f0f0f0_0.5turn_0.75turn,#ffffff_0.75turn)] flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="max-w-full h-auto object-contain"
      />
    </div>
  );
};

export default ImageCanvas;