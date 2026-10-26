import { create } from 'zustand';
import type {
  ImageWatermarkConfig,
  TextWatermarkConfig,
  UploadedImage,
  WatermarkMode,
} from '../types/watermark';

export type ThemeMode = 'dark' | 'light';

interface WatermarkState {
  // 테마 및 반응형 레이아웃 상태
  theme: ThemeMode;
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // 업로드된 이미지 상태
  images: UploadedImage[];
  selectedImageIndex: number;
  addImages: (newImages: UploadedImage[]) => void;
  removeImage: (id: string) => void;
  selectImage: (index: number) => void;
  clearImages: () => void;

  // 워터마크 표시 모드 (단일 위치 vs 타일링 사선 반복)
  watermarkMode: WatermarkMode;
  setWatermarkMode: (mode: WatermarkMode) => void;

  // 텍스트 워터마크 설정
  textConfig: TextWatermarkConfig;
  updateTextConfig: (config: Partial<TextWatermarkConfig>) => void;

  // 이미지/로고 워터마크 설정
  imageConfig: ImageWatermarkConfig;
  updateImageConfig: (config: Partial<ImageWatermarkConfig>) => void;
  setImageLogo: (src: string, imgEl: HTMLImageElement) => void;
  removeImageLogo: () => void;

  // 설정 초기화
  resetSettings: () => void;

  // 다운로드 진행 상태
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

// 텍스트 워터마크 기본값
const defaultTextConfig: TextWatermarkConfig = {
  enabled: true,
  text: 'SAMPLE WATERMARK',
  fontSize: 36,
  fontFamily: 'Pretendard, sans-serif',
  color: '#ffffff',
  opacity: 0.7,
  rotation: -30,
  bold: true,
  italic: false,
  position: 'center',
  customX: 50,
  customY: 50,
  padding: 30,
  shadow: true,
  shadowColor: '#000000',
  shadowBlur: 4,
  tileGapX: 180,
  tileGapY: 140,
};

// 이미지 워터마크 기본값
const defaultImageConfig: ImageWatermarkConfig = {
  enabled: false,
  imageSrc: null,
  imageElement: null,
  widthRatio: 20, // 가로 20%
  opacity: 0.7,
  rotation: 0,
  position: 'bottom-right',
  customX: 50,
  customY: 50,
  padding: 30,
  tileGapX: 200,
  tileGapY: 200,
};

// 초기 테마 확인 (기본값 다크 모드)
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('wm_theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  }
  return 'dark';
};

export const useWatermarkStore = create<WatermarkState>((set) => {
  const initialTheme = getInitialTheme();
  if (typeof document !== 'undefined') {
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    theme: initialTheme,
    toggleTheme: () =>
      set((state) => {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          localStorage.setItem('wm_theme', nextTheme);
        }
        return { theme: nextTheme };
      }),

    isSidebarOpen: true,
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    images: [],
    selectedImageIndex: 0,

    addImages: (newImages) =>
      set((state) => {
        const merged = [...state.images, ...newImages];
        return {
          images: merged,
          selectedImageIndex:
            state.images.length === 0 ? 0 : state.selectedImageIndex,
        };
      }),

    removeImage: (id) =>
      set((state) => {
        const filtered = state.images.filter((img) => img.id !== id);
        const nextIndex = Math.min(
          state.selectedImageIndex,
          Math.max(0, filtered.length - 1)
        );
        return { images: filtered, selectedImageIndex: nextIndex };
      }),

    selectImage: (index) => set({ selectedImageIndex: index }),

    clearImages: () => set({ images: [], selectedImageIndex: 0 }),

    watermarkMode: 'single',
    setWatermarkMode: (mode) => set({ watermarkMode: mode }),

    textConfig: defaultTextConfig,
    updateTextConfig: (config) =>
      set((state) => ({ textConfig: { ...state.textConfig, ...config } })),

    imageConfig: defaultImageConfig,
    updateImageConfig: (config) =>
      set((state) => ({ imageConfig: { ...state.imageConfig, ...config } })),

    setImageLogo: (src, imgEl) =>
      set((state) => ({
        imageConfig: {
          ...state.imageConfig,
          imageSrc: src,
          imageElement: imgEl,
          enabled: true,
        },
      })),

    removeImageLogo: () =>
      set((state) => ({
        imageConfig: {
          ...state.imageConfig,
          imageSrc: null,
          imageElement: null,
          enabled: false,
        },
      })),

    resetSettings: () =>
      set({
        textConfig: defaultTextConfig,
        imageConfig: defaultImageConfig,
        watermarkMode: 'single',
      }),

    isProcessing: false,
    setIsProcessing: (processing) => set({ isProcessing: processing }),
  };
});
