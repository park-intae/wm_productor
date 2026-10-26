import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Download,
  FolderArchive,
  ImagePlus,
  Sparkles,
  Loader2,
  Sun,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Keyboard,
  X,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useWatermarkStore } from '../store/useWatermarkStore';
import { generateWatermarkedBlob } from '../utils/watermarkRenderer';

export const Header: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const {
    images,
    selectedImageIndex,
    textConfig,
    imageConfig,
    watermarkMode,
    addImages,
    isProcessing,
    setIsProcessing,
    theme,
    toggleTheme,
    isSidebarOpen,
    toggleSidebar,
    resetSettings,
  } = useWatermarkStore();

  const currentImage = images[selectedImageIndex];

  // 단일 이미지 다운로드
  const handleDownloadSingle = useCallback(async () => {
    if (!currentImage || isProcessing) return;

    try {
      setIsProcessing(true);
      const blob = await generateWatermarkedBlob(
        currentImage,
        textConfig,
        imageConfig,
        watermarkMode
      );
      saveAs(blob, `watermarked_${currentImage.name}`);
    } catch (err) {
      console.error(err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [currentImage, isProcessing, textConfig, imageConfig, watermarkMode, setIsProcessing]);

  // 단축키 Ctrl+S 감지하여 현재 이미지 저장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (currentImage && !isProcessing) {
          handleDownloadSingle();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImage, isProcessing, handleDownloadSingle]);

  // 전체 이미지 ZIP 일괄 다운로드
  const handleDownloadAllZip = async () => {
    if (images.length === 0 || isProcessing) return;

    try {
      setIsProcessing(true);
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const blob = await generateWatermarkedBlob(
          item,
          textConfig,
          imageConfig,
          watermarkMode
        );
        zip.file(`watermarked_${item.name}`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `watermarked_images_${Date.now()}.zip`);
    } catch (err) {
      console.error(err);
      alert('일괄 압축 저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 새 이미지 추가 파일 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUploadedImages = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        file,
        previewUrl: url,
        width: 0,
        height: 0,
      };
    });

    addImages(newUploadedImages);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 워터마크 설정 초기화 확인
  const handleResetSettings = () => {
    if (window.confirm('모든 워터마크 설정을 기본값으로 초기화하시겠습니까?')) {
      resetSettings();
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 transition-colors">
      {/* 로고 & 타이틀 */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            Watermark Studio
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-medium">
              v1.0
            </span>
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            빠르고 안전한 브라우저 워터마크 생성기
          </p>
        </div>
      </div>

      {/* 액션 버튼 그룹 */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 단축키 안내 버튼 */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition border border-slate-200 dark:border-slate-700 cursor-pointer"
          title="단축키 안내"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* 설정 초기화 버튼 */}
        <button
          onClick={handleResetSettings}
          className="p-2 sm:px-3 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
          title="워터마크 설정 기본값으로 리셋"
        >
          <RotateCcw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="hidden md:inline">설정 리셋</span>
        </button>

        {/* 테마 토글 버튼 */}
        <button
          onClick={toggleTheme}
          className="p-2 sm:px-2.5 sm:py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <ImagePlus className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">이미지 추가</span>
          <span className="sm:hidden">추가</span>
        </button>

        {images.length > 0 && (
          <>
            {/* 단일 다운로드 버튼 */}
            <button
              onClick={handleDownloadSingle}
              disabled={isProcessing}
              className="px-3 sm:px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-800 dark:text-white text-xs sm:text-sm font-medium transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="현재 이미지 저장 (단축키: Ctrl + S)"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              ) : (
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              )}
              <span className="hidden lg:inline">현재 저장</span>
            </button>

            {/* ZIP 일괄 다운로드 버튼 */}
            <button
              onClick={handleDownloadAllZip}
              disabled={isProcessing}
              className="px-3 sm:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
              title="전체 일괄 ZIP 압축 저장"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FolderArchive className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                전체 일괄 저장 {images.length > 1 && `(${images.length}장)`}
              </span>
              <span className="sm:hidden">일괄 저장</span>
            </button>
          </>
        )}

        {/* 사이드바 토글 버튼 (모바일 및 데스크톱) */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
          title={isSidebarOpen ? '설정창 닫기' : '설정창 열기'}
        >
          {isSidebarOpen ? (
            <PanelRightClose className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          ) : (
            <PanelRightOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          )}
        </button>
      </div>

      {/* 단축키 안내 팝업 모달 */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <Keyboard className="w-4 h-4 text-indigo-500" />
                단축키 안내
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">이전 / 다음 이미지</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs">←</kbd>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs">→</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">현재 이미지 저장</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-mono text-xs">Ctrl + S</kbd>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">워터마크 위치 이동</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">캔버스 마우스 클릭/드래그</span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
