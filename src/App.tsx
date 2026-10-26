import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { CanvasArea } from './components/CanvasArea';
import { Sidebar } from './components/Sidebar';
import { ThumbnailBar } from './components/ThumbnailBar';
import { useWatermarkStore } from './store/useWatermarkStore';

export const App: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen, images, selectedImageIndex, selectImage } =
    useWatermarkStore();

  // 화면 크기 변경 시 모바일에서는 사이드바 기본 닫힘 설정
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    // 초기 체크
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  // 키보드 단축키 (좌/우 화살표로 이미지 전환)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력창에 포커스가 있는 경우 단축키 무시
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        if (images.length > 1 && selectedImageIndex > 0) {
          selectImage(selectedImageIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (images.length > 1 && selectedImageIndex < images.length - 1) {
          selectImage(selectedImageIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, selectedImageIndex, selectImage]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors">
      {/* 상단 네비게이션 헤더 */}
      <Header />

      {/* 중앙 메인 작업 영역 */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* 좌측 메인 캔버스 뷰포트 & 하단 썸네일 탐색기 */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <CanvasArea />
          <ThumbnailBar />
        </main>

        {/* 모바일 화면에서 사이드바 열림 시 배경 오버레이 */}
        {isSidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-xs transition-opacity"
          />
        )}

        {/* 우측 워터마크 설정 컨트롤 사이드바 */}
        <div
          className={`
            fixed md:relative right-0 top-16 md:top-0 bottom-0 z-30 md:z-10
            transition-all duration-300 ease-in-out
            ${
              isSidebarOpen
                ? 'translate-x-0 w-80 sm:w-96 opacity-100'
                : 'translate-x-full md:translate-x-0 md:w-0 md:p-0 md:overflow-hidden md:border-0 opacity-0 pointer-events-none md:pointer-events-auto'
            }
          `}
        >
          {isSidebarOpen && <Sidebar />}
        </div>
      </div>
    </div>
  );
};

export default App;
