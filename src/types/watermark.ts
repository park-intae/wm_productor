/**
 * 워터마크 관련 타입 정의 모듈
 */

// 워터마크 배치 위치 타입
export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'custom'; // 커스텀 좌표 (x, y)

// 워터마크 모드
export type WatermarkMode = 'single' | 'tiled'; // 단일 배치 또는 전체 반복 타일링

// 텍스트 워터마크 설정
export interface TextWatermarkConfig {
  enabled: boolean;
  text: string;
  fontSize: number; // px 단위 (기준 해상도 대비 비율로 계산 가능)
  fontFamily: string;
  color: string;
  opacity: number; // 0 ~ 1
  rotation: number; // -180 ~ 180도
  bold: boolean;
  italic: boolean;
  position: WatermarkPosition;
  customX: number; // custom 위치일 때의 X 비율 (0 ~ 100%)
  customY: number; // custom 위치일 때의 Y 비율 (0 ~ 100%)
  padding: number; // 모서리 여백 (px)
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  
  // 타일 모드 설정
  tileGapX: number; // 가로 간격
  tileGapY: number; // 세로 간격
}

// 이미지/로고 워터마크 설정
export interface ImageWatermarkConfig {
  enabled: boolean;
  imageSrc: string | null; // Base64 또는 Blob URL
  imageElement: HTMLImageElement | null;
  widthRatio: number; // 원본 이미지 가로 대비 비율 (5% ~ 50%)
  opacity: number; // 0 ~ 1
  rotation: number; // -180 ~ 180도
  position: WatermarkPosition;
  customX: number; // custom 위치일 때의 X 비율 (0 ~ 100%)
  customY: number; // custom 위치일 때의 Y 비율 (0 ~ 100%)
  padding: number; // 모서리 여백 (px)
  
  // 타일 모드 설정
  tileGapX: number;
  tileGapY: number;
}

// 업로드된 이미지 항목
export interface UploadedImage {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}
