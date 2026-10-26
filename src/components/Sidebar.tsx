import React, { useRef, useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  LayoutGrid,
  RotateCw,
  Bold,
  Italic,
  Upload,
  Trash2,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useWatermarkStore } from '../store/useWatermarkStore';
import type { WatermarkPosition } from '../types/watermark';

// 9방향 위치 그리드 옵션 정의
const POSITION_GRID: { label: string; value: WatermarkPosition }[] = [
  { label: '좌상단', value: 'top-left' },
  { label: '상단 중앙', value: 'top-center' },
  { label: '우상단', value: 'top-right' },
  { label: '좌측 중앙', value: 'middle-left' },
  { label: '정중앙', value: 'center' },
  { label: '우측 중앙', value: 'middle-right' },
  { label: '좌하단', value: 'bottom-left' },
  { label: '하단 중앙', value: 'bottom-center' },
  { label: '우하단', value: 'bottom-right' },
];

// 기본 지원 폰트 목록
const FONT_OPTIONS = [
  { label: '기본 (Pretendard / Sans)', value: 'Pretendard, system-ui, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Impact (강조용)', value: 'Impact, sans-serif' },
  { label: '명조체 (Serif)', value: 'Georgia, "Times New Roman", serif' },
  { label: '고정폭 (Monospace)', value: '"Courier New", Courier, monospace' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive, sans-serif' },
];

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'position'>('text');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    watermarkMode,
    setWatermarkMode,
    textConfig,
    updateTextConfig,
    imageConfig,
    updateImageConfig,
    setImageLogo,
    removeImageLogo,
    setSidebarOpen,
  } = useWatermarkStore();

  // 로고 이미지 파일 업로드 핸들러
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageLogo(url, img);
    };
    img.src = url;
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur flex flex-col h-full shrink-0 z-10 overflow-hidden shadow-xl md:shadow-none transition-colors">
      {/* 탭 네비게이션 & 모바일 닫기 버튼 */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1.5 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'text'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>텍스트</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'image'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>로고 이미지</span>
        </button>

        <button
          onClick={() => setActiveTab('position')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeTab === 'position'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>배치 & 모드</span>
        </button>

        {/* 모바일 닫기 버튼 */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          title="설정창 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 설정 폼 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-700 dark:text-slate-300">
        {/* ======================= TAB 1: 텍스트 설정 ======================= */}
        {activeTab === 'text' && (
          <div className="space-y-5">
            {/* 텍스트 워터마크 활성화 스위치 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                텍스트 워터마크 표시
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={textConfig.enabled}
                  onChange={(e) => updateTextConfig({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {textConfig.enabled && (
              <>
                {/* 문구 입력 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    워터마크 문구
                  </label>
                  <input
                    type="text"
                    value={textConfig.text}
                    onChange={(e) => updateTextConfig({ text: e.target.value })}
                    placeholder="표시할 텍스트 입력"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
                  />
                </div>

                {/* 폰트 선택 & 스타일 (굵게, 기울임) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    서체 (Font)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={textConfig.fontFamily}
                      onChange={(e) => updateTextConfig({ fontFamily: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition text-xs cursor-pointer"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => updateTextConfig({ bold: !textConfig.bold })}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        textConfig.bold
                          ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="굵게"
                    >
                      <Bold className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => updateTextConfig({ italic: !textConfig.italic })}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        textConfig.italic
                          ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="기울임"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 글자 크기 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">글자 크기</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {textConfig.fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="180"
                    value={textConfig.fontSize}
                    onChange={(e) => updateTextConfig({ fontSize: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* 색상 및 투명도 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      글자 색상
                    </label>
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg">
                      <input
                        type="color"
                        value={textConfig.color}
                        onChange={(e) => updateTextConfig({ color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <span className="font-mono text-xs uppercase text-slate-700 dark:text-slate-300">
                        {textConfig.color}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400">투명도</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        {Math.round(textConfig.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={textConfig.opacity}
                      onChange={(e) => updateTextConfig({ opacity: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2.5"
                    />
                  </div>
                </div>

                {/* 회전 각도 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> 회전 각도
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {textConfig.rotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={textConfig.rotation}
                    onChange={(e) => updateTextConfig({ rotation: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* 그림자 효과 */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">
                      텍스트 그림자 효과
                    </span>
                    <input
                      type="checkbox"
                      checked={textConfig.shadow}
                      onChange={(e) => updateTextConfig({ shadow: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer accent-indigo-500"
                    />
                  </div>
                  {textConfig.shadow && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/40">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">그림자 흐림 (Blur)</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                          {textConfig.shadowBlur}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={textConfig.shadowBlur}
                        onChange={(e) =>
                          updateTextConfig({ shadowBlur: Number(e.target.value) })
                        }
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================= TAB 2: 로고 이미지 설정 ======================= */}
        {activeTab === 'image' && (
          <div className="space-y-5">
            {/* 이미지 워터마크 활성화 스위치 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                로고 이미지 표시
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={imageConfig.enabled}
                  onChange={(e) => updateImageConfig({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* 이미지 업로드 영역 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                워터마크 로고 파일
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {imageConfig.imageSrc ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={imageConfig.imageSrc}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded p-1"
                    />
                    <div className="text-xs text-slate-700 dark:text-slate-300 truncate">
                      <p className="font-medium text-slate-900 dark:text-white">등록된 로고</p>
                      <p className="text-[11px] text-slate-500">배경 투명 PNG 권장</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="로고 교체"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={removeImageLogo}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      title="로고 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-50 dark:bg-slate-950/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 flex flex-col items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-600/20 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                    로고 이미지 (PNG/JPG) 업로드
                  </span>
                </button>
              )}
            </div>

            {imageConfig.enabled && imageConfig.imageSrc && (
              <>
                {/* 로고 크기 비율 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      크기 비율 (원본 가로 대비)
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {imageConfig.widthRatio}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={imageConfig.widthRatio}
                    onChange={(e) =>
                      updateImageConfig({ widthRatio: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* 로고 투명도 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">로고 투명도</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {Math.round(imageConfig.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={imageConfig.opacity}
                    onChange={(e) =>
                      updateImageConfig({ opacity: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* 로고 회전 각도 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> 회전 각도
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {imageConfig.rotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={imageConfig.rotation}
                    onChange={(e) =>
                      updateImageConfig({ rotation: Number(e.target.value) })
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* ======================= TAB 3: 배치 & 패턴 모드 ======================= */}
        {activeTab === 'position' && (
          <div className="space-y-6">
            {/* 워터마크 모드 선택 (단일 vs 사선 타일링) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                출력 모드
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWatermarkMode('single')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer text-xs ${
                    watermarkMode === 'single'
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-200'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold">단일 배치</span>
                  <span className="text-[10px] text-slate-500">지정 위치 1곳 표시</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWatermarkMode('tiled')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer text-xs ${
                    watermarkMode === 'tiled'
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-200'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold">사선 반복 타일</span>
                  <span className="text-[10px] text-slate-500">전체 영역 패턴 보호</span>
                </button>
              </div>
            </div>

            {/* 단일 배치일 때: 9방향 프리셋 선택 */}
            {watermarkMode === 'single' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      위치 프리셋 (9방향)
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                      캔버스 위 클릭/드래그로도 이동 가능
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {POSITION_GRID.map((pos) => {
                      const isSelected =
                        textConfig.position === pos.value &&
                        imageConfig.position === pos.value;
                      return (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => {
                            updateTextConfig({ position: pos.value });
                            updateImageConfig({ position: pos.value });
                          }}
                          className={`py-2 px-1 rounded text-xs font-medium transition cursor-pointer border ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 모서리 여백 (Padding) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      외곽 여백 (Padding)
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {textConfig.padding}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={textConfig.padding}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateTextConfig({ padding: val });
                      updateImageConfig({ padding: val });
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            ) : (
              /* 타일 모드일 때: 간격 설정 */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      가로 간격 (Gap X)
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {textConfig.tileGapX}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={textConfig.tileGapX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateTextConfig({ tileGapX: val });
                      updateImageConfig({ tileGapX: val });
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      세로 간격 (Gap Y)
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {textConfig.tileGapY}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    value={textConfig.tileGapY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateTextConfig({ tileGapY: val });
                      updateImageConfig({ tileGapY: val });
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
