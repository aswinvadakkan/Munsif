"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface SignaturePadProps {
  /** Called with the signature data URL (PNG) when the user draws */
  onSignatureChange?: (dataUrl: string | null) => void;
  /** Width of the canvas in pixels (default: responsive to container) */
  width?: number;
  /** Height of the canvas in pixels (default: 180) */
  height?: number;
  /** Label shown above the pad */
  label?: string;
  /** Placeholder text shown when no signature is drawn */
  placeholder?: string;
  /** Clear button label */
  clearLabel?: string;
  /** Undo button label */
  undoLabel?: string;
  /** External control: set to true to clear the pad programmatically */
  clearTrigger?: number;
}

interface StrokePoint {
  x: number;
  y: number;
}

type Stroke = StrokePoint[];

export default function SignaturePad({
  onSignatureChange,
  width,
  height = 180,
  label = "Draw your signature",
  placeholder = "Sign here",
  clearLabel = "Clear",
  undoLabel = "Undo",
  clearTrigger,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(width || 500);

  // Responsive canvas width
  useEffect(() => {
    if (width) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasWidth(Math.max(w - 4, 280)); // minus border
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [width]);

  // Handle external clear trigger
  useEffect(() => {
    if (clearTrigger !== undefined && clearTrigger > 0) {
      clearPad();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearTrigger]);

  // Redraw canvas when strokes change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw placeholder if no signature
    if (strokesRef.current.length === 0) {
      ctx.font = "italic 16px Georgia, serif";
      ctx.fillStyle = "#a8a29e";
      ctx.textAlign = "center";
      ctx.fillText(placeholder, canvas.width / 2, canvas.height / 2 + 6);
      return;
    }

    // Draw all completed strokes
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }
  }, [placeholder]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.length < 2) {
      // Single point — draw a dot
      ctx.beginPath();
      ctx.arc(stroke[0].x, stroke[0].y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#1c1917";
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);

    for (let i = 1; i < stroke.length; i++) {
      const midX = (stroke[i - 1].x + stroke[i].x) / 2;
      const midY = (stroke[i - 1].y + stroke[i].y) / 2;
      ctx.quadraticCurveTo(stroke[i - 1].x, stroke[i - 1].y, midX, midY);
    }

    // Connect to last point
    const last = stroke[stroke.length - 1];
    ctx.lineTo(last.x, last.y);

    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  // Set up canvas and redraw on mount / resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    redrawCanvas();
  }, [canvasWidth, height, redrawCanvas]);

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const scaleY = height / rect.height;

      let clientX: number, clientY: number;

      if ("touches" in e) {
        const touch = e.touches[0] || (e as TouchEvent).changedTouches[0];
        if (!touch) return { x: 0, y: 0 };
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [canvasWidth, height]
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const coords = getCanvasCoords(e as React.MouseEvent);
      setIsDrawing(true);
      currentStrokeRef.current = [coords];
    },
    [getCanvasCoords]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || !currentStrokeRef.current) return;
      e.preventDefault();
      const coords = getCanvasCoords(e as React.MouseEvent);
      currentStrokeRef.current.push(coords);

      // Real-time draw on canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Redraw everything for simplicity (good enough for signature pads)
      ctx.clearRect(0, 0, canvasWidth, height);
      for (const stroke of strokesRef.current) {
        drawStroke(ctx, stroke);
      }
      drawStroke(ctx, currentStrokeRef.current);
    },
    [isDrawing, getCanvasCoords, canvasWidth, height]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStrokeRef.current && currentStrokeRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
      currentStrokeRef.current = null;
      setHasSignature(strokesRef.current.length > 0);

      // Emit signature data URL
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = strokesRef.current.length > 0 ? canvas.toDataURL("image/png") : null;
        onSignatureChange?.(dataUrl);
      }
    }
  }, [isDrawing, onSignatureChange]);

  const clearPad = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setHasSignature(false);
    onSignatureChange?.(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw for placeholder
    redrawCanvas();
  }, [onSignatureChange, redrawCanvas]);

  const undo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setHasSignature(strokesRef.current.length > 0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (strokesRef.current.length === 0) {
      onSignatureChange?.(null);
      redrawCanvas();
      return;
    }

    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke);
    }

    const dataUrl = canvas.toDataURL("image/png");
    onSignatureChange?.(dataUrl);
  }, [onSignatureChange, redrawCanvas]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      startDrawing(e);
    },
    [startDrawing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      draw(e);
    },
    [draw]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      stopDrawing();
    },
    [stopDrawing]
  );

  return (
    <div ref={containerRef} className="w-full">
      {label && (
        <div className="flex items-center gap-2 mb-2.5">
          <svg
            className="w-4 h-4 text-stone-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <span className="text-sm font-medium text-stone-700">{label}</span>
        </div>
      )}

      <div className="relative">
        {/* Signature canvas */}
        <canvas
          ref={canvasRef}
          className="block w-full border-2 border-dashed rounded-xl cursor-crosshair touch-none select-none bg-white"
          style={{
            borderColor: hasSignature ? "#a8a29e" : "#d6d3d1",
            height: `${height}px`,
            transition: "border-color 0.2s ease",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Dashed guide line */}
        {!hasSignature && (
          <div
            className="absolute left-1/2 bottom-[35%] -translate-x-1/2 pointer-events-none"
            style={{ width: "60%" }}
          >
            <div className="border-b border-dashed border-stone-300" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={!hasSignature}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            {undoLabel}
          </button>

          <button
            type="button"
            onClick={clearPad}
            disabled={!hasSignature}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {clearLabel}
          </button>
        </div>

        {hasSignature && (
          <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Signature captured
          </span>
        )}
      </div>
    </div>
  );
}
