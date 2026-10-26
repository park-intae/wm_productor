import React, { useRef } from 'react';
import { Plus, Trash2, X, Images } from 'lucide-react';
import { useWatermarkStore } from '../store/useWatermarkStore';

export const ThumbnailBar: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    images,
    selectedImageIndex,
    selectImage,
    removeImage,
    clearImages,
    addImages,
  } = useWatermarkStore();

  if (images.length === 0) return null;

  // 새 이미지 파일 추가 핸들러
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
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

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-20 sm:h-24 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 shrink-0 z-10 overflow-hidden transition-colors">
      {/* 썸네일 리스트 상단 라벨 & 전체 삭제 */}
      <div className="flex flex-col items-center justify-center pr-2 sm:pr-3 border-r border-slate-200 dark:border-slate-800 text-xs shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-700 dark:text-slate-300 font-medium mb-1">
          <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-[11px] sm:text-xs">{images.length}장</span>
        </div>
        <button
          onClick={clearImages}
          className="text-[10px] sm:text-[11px] text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
          title="모든 이미지 삭제"
        >
          <Trash2 className="w-3 h-3" />
          <span>비우기</span>
        </button>
      </div>

      {/* 가로 스크롤 썸네일 목록 */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {images.map((img, idx) => {
          const isSelected = idx === selectedImageIndex;
          return (
            <div
              key={img.id}
              onClick={() => selectImage(idx)}
              className={`relative group shrink-0 w-16 h-14 sm:w-20 sm:h-18 rounded-lg overflow-hidden border-2 cursor-pointer transition-all bg-slate-100 dark:bg-slate-950 flex items-center justify-center ${
                isSelected
                  ? 'border-indigo-500 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={img.previewUrl}
                alt={img.name}
                className="w-full h-full object-cover"
              />

              {/* 순번 배지 */}
              <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] font-mono text-white pointer-events-none">
                {idx + 1}
              </span>

              {/* 개별 삭제 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-slate-300 hover:text-rose-400 hover:bg-black/90 opacity-0 group-hover:opacity-100 transition"
                title="삭제"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* 썸네일 리스트 내 추가 버튼 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAddFiles}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 w-16 h-14 sm:w-20 sm:h-18 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] sm:text-[10px] font-medium">추가</span>
        </button>
      </div>
    </div>
  );
};