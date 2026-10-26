import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UploadCloud, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useWatermarkStore } from '../store/useWatermarkStore';
import { renderWatermarkToCanvas } from '../utils/watermarkRenderer';

export const CanvasArea: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const {
    images,
    selectedImageIndex,
    textConfig,
    imageConfig,
    watermarkMode,
    addImages,
    updateTextConfig,
  } = useWatermarkStore();

  const currentImage = images[selectedImageIndex];

  // 뷰포트 줌 비율 (%)
  const [zoom, setZoom] = useState<number>(100);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // 성능 최적화: requestAnimationFrame을 통한 쓰로틀링 캔버스 렌더링
  const requestRender = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      if (canvasRef.current && imageElementRef.current) {
        renderWatermarkToCanvas(
          canvasRef.current,
          imageElementRef.current,
          textConfig,
          imageConfig,
          watermarkMode
        );
      }
      rafIdRef.current = null;
    });
  }, [textConfig, imageConfig, watermarkMode]);

  // 현재 이미지 로드 및 캔버스 렌더링
  useEffect(() => {
    if (!currentImage) {
      imageElementRef.current = null;
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage.previewUrl;

    img.onload = () => {
      imageElementRef.current = img;
      requestRender();
    };

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [currentImage, requestRender]);

  // 워터마크 설정 변경 시 최적화된 렌더링 호출
  useEffect(() => {
    if (imageElementRef.current) {
      requestRender();
    }
  }, [requestRender]);

  // 드래그 앤 드롭 파일 업로드 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newUploaded = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        file,
        previewUrl: URL.createObjectURL(file),
        width: 0,
        height: 0,
      }));

    if (newUploaded.length > 0) {
      addImages(newUploaded);
    }
  };

  // 캔버스 위에서 마우스 드래그/클릭으로 위치 실시간 조절
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (watermarkMode === 'tiled') return;
    setIsInteracting(true);
    updatePositionFromMouseEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteracting || watermarkMode === 'tiled') return;
    updatePositionFromMouseEvent(e);
  };

  const handleCanvasMouseUp = () => {
    setIsInteracting(false);
  };

  const updatePositionFromMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const percentX = Math.round(
      Math.max(0, Math.min(100, (clickX / rect.width) * 100))
    );
    const percentY = Math.round(
      Math.max(0, Math.min(100, (clickY / rect.height) * 100))
    );

    updateTextConfig({
      position: 'custom',
      customX: percentX,
      customY: percentY,
    });
  };

  // 줌 조절
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 300));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 25));
  const handleZoomReset = () => setZoom(100);

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none transition-colors ${
        isDraggingOver ? 'bg-indigo-50/70 dark:bg-indigo-950/30 ring-2 ring-indigo-500 ring-inset' : ''
      }`}
    >
      {/* 바둑판 투명 배경 그리드 효과 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* 이미지가 없을 때의 안내 UI */}
      {!currentImage ? (
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-md border-2 border-dashed border-slate-300 dark:border-slate-700/80 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 ring-1 ring-indigo-200 dark:ring-indigo-500/20">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            이미지를 여기에 드롭하세요
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            JPG, PNG, WebP 등 모든 이미지 포맷 지원<br />
            여러 장을 한 번에 올려 일괄 처리할 수 있습니다.
          </p>
          <label className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer">
            내 컴퓨터에서 파일 선택
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                const newUploaded = Array.from(files).map((f) => ({
                  id: `${f.name}-${Date.now()}-${Math.random()}`,
                  name: f.name,
                  file: f,
                  previewUrl: URL.createObjectURL(f),
                  width: 0,
                  height: 0,
                }));
                addImages(newUploaded);
              }}
            />
          </label>
        </div>
      ) : (
        /* 이미지가 있을 때의 캔버스 뷰어 */
        <div className="relative w-full h-full flex items-center justify-center overflow-auto p-2 sm:p-4">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
              transition: isInteracting ? 'none' : 'transform 0.15s ease-out',
            }}
            className="shadow-xl dark:shadow-2xl dark:shadow-black/80 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center max-w-full max-h-full"
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className={`max-w-full max-h-[68vh] sm:max-h-[72vh] object-contain block ${
                watermarkMode === 'single'
                  ? 'cursor-crosshair'
                  : 'cursor-default'
              }`}
            />
          </div>

          {/* 줌 및 캔버스 정보 플로팅 컨트롤러 */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-1.5 sm:gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 shadow-lg text-slate-700 dark:text-slate-300 text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400 pr-2 border-r border-slate-200 dark:border-slate-700 max-w-[120px] sm:max-w-[200px] truncate">
              {currentImage.name}
            </span>
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="축소"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-1.5 py-0.5 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition font-mono text-[11px] cursor-pointer"
              title="원래 크기 (100%)"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="확대"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition ml-0.5 cursor-pointer"
              title="화면에 맞춤"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};