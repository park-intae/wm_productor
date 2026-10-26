import type {
  ImageWatermarkConfig,
  TextWatermarkConfig,
  UploadedImage,
  WatermarkMode,
  WatermarkPosition,
} from '../types/watermark';

/**
 * 9방향 기준 좌표 및 커스텀 위치를 계산하는 헬퍼 함수
 */
function calculatePosition(
  position: WatermarkPosition,
  customX: number,
  customY: number,
  padding: number,
  contentWidth: number,
  contentHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  if (position === 'custom') {
    return {
      x: (canvasWidth * customX) / 100,
      y: (canvasHeight * customY) / 100,
    };
  }

  let x = 0;
  let y = 0;

  // X축 계산
  if (position.includes('left')) {
    x = padding + contentWidth / 2;
  } else if (position.includes('right')) {
    x = canvasWidth - padding - contentWidth / 2;
  } else {
    // center
    x = canvasWidth / 2;
  }

  // Y축 계산
  if (position.startsWith('top')) {
    y = padding + contentHeight / 2;
  } else if (position.startsWith('bottom')) {
    y = canvasHeight - padding - contentHeight / 2;
  } else {
    // middle or center
    y = canvasHeight / 2;
  }

  return { x, y };
}

/**
 * 텍스트 워터마크를 캔버스에 렌더링하는 함수
 */
function drawTextWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: TextWatermarkConfig,
  mode: WatermarkMode
) {
  if (!config.enabled || !config.text.trim()) return;

  ctx.save();

  // 폰트 스타일 설정 (원본 이미지 해상도에 맞게 폰트 크기 비례 스케일링)
  const fontStyle = `${config.italic ? 'italic ' : ''}${config.bold ? 'bold ' : ''}${config.fontSize}px ${config.fontFamily}`;
  ctx.font = fontStyle;
  ctx.fillStyle = config.color;
  ctx.globalAlpha = config.opacity;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 그림자 설정
  if (config.shadow) {
    ctx.shadowColor = config.shadowColor;
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  }

  const metrics = ctx.measureText(config.text);
  const textWidth = metrics.width;
  const textHeight = config.fontSize; // 대략적인 폰트 높이

  if (mode === 'tiled') {
    // 타일링 반복 모드: 대각선 커버를 위해 캔버스 대각선보다 넉넉한 범위 반복
    const diag = Math.sqrt(width * width + height * height);
    const stepX = Math.max(30, textWidth + config.tileGapX);
    const stepY = Math.max(30, textHeight + config.tileGapY);

    ctx.translate(width / 2, height / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);

    const startX = -diag;
    const endX = diag;
    const startY = -diag;
    const endY = diag;

    for (let y = startY; y < endY; y += stepY) {
      // 행마다 엇갈려 배치 (벽돌 패턴)
      const isOddRow = Math.floor(y / stepY) % 2 !== 0;
      const offsetX = isOddRow ? stepX / 2 : 0;

      for (let x = startX; x < endX; x += stepX) {
        ctx.fillText(config.text, x + offsetX, y);
      }
    }
  } else {
    // 단일 배치 모드
    const { x, y } = calculatePosition(
      config.position,
      config.customX,
      config.customY,
      config.padding,
      textWidth,
      textHeight,
      width,
      height
    );

    ctx.translate(x, y);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.fillText(config.text, 0, 0);
  }

  ctx.restore();
}

/**
 * 이미지/로고 워터마크를 캔버스에 렌더링하는 함수
 */
function drawImageWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ImageWatermarkConfig,
  mode: WatermarkMode
) {
  if (!config.enabled || !config.imageElement) return;

  const logoImg = config.imageElement;
  if (!logoImg.complete || logoImg.naturalWidth === 0) return;

  ctx.save();
  ctx.globalAlpha = config.opacity;

  // 원본 캔버스 너비 대비 비율로 로고 크기 산출
  const targetWidth = (width * config.widthRatio) / 100;
  const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
  const targetHeight = targetWidth * aspectRatio;

  if (mode === 'tiled') {
    // 타일링 모드
    const diag = Math.sqrt(width * width + height * height);
    const stepX = Math.max(30, targetWidth + config.tileGapX);
    const stepY = Math.max(30, targetHeight + config.tileGapY);

    ctx.translate(width / 2, height / 2);
    ctx.rotate((config.rotation * Math.PI) / 180);

    const startX = -diag;
    const endX = diag;
    const startY = -diag;
    const endY = diag;

    for (let y = startY; y < endY; y += stepY) {
      const isOddRow = Math.floor(y / stepY) % 2 !== 0;
      const offsetX = isOddRow ? stepX / 2 : 0;

      for (let x = startX; x < endX; x += stepX) {
        ctx.drawImage(
          logoImg,
          x + offsetX - targetWidth / 2,
          y - targetHeight / 2,
          targetWidth,
          targetHeight
        );
      }
    }
  } else {
    // 단일 모드
    const { x, y } = calculatePosition(
      config.position,
      config.customX,
      config.customY,
      config.padding,
      targetWidth,
      targetHeight,
      width,
      height
    );

    ctx.translate(x, y);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.drawImage(
      logoImg,
      -targetWidth / 2,
      -targetHeight / 2,
      targetWidth,
      targetHeight
    );
  }

  ctx.restore();
}

/**
 * 주어진 Canvas 엘리먼트에 원본 이미지와 워터마크를 합성 렌더링합니다.
 */
export function renderWatermarkToCanvas(
  canvas: HTMLCanvasElement,
  imgElement: HTMLImageElement,
  textConfig: TextWatermarkConfig,
  imageConfig: ImageWatermarkConfig,
  mode: WatermarkMode
) {
  const width = imgElement.naturalWidth || imgElement.width;
  const height = imgElement.naturalHeight || imgElement.height;

  // 불필요한 GPU 버퍼 재할당 방지 (크기가 바뀔 때만 리사이징)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. 원본 이미지 그리기
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(imgElement, 0, 0, width, height);

  // 2. 이미지 워터마크 그리기 (텍스트 아래에 배치)
  drawImageWatermark(ctx, width, height, imageConfig, mode);

  // 3. 텍스트 워터마크 그리기
  drawTextWatermark(ctx, width, height, textConfig, mode);
}

/**
 * 업로드된 이미지를 워터마크가 합성된 고해상도 Blob(파일)으로 변환하여 반환합니다.
 */
export async function generateWatermarkedBlob(
  item: UploadedImage,
  textConfig: TextWatermarkConfig,
  imageConfig: ImageWatermarkConfig,
  mode: WatermarkMode,
  type = 'image/png',
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const offscreenCanvas = document.createElement('canvas');
      renderWatermarkToCanvas(
        offscreenCanvas,
        img,
        textConfig,
        imageConfig,
        mode
      );

      offscreenCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('워터마크 이미지 생성에 실패했습니다.'));
          }
        },
        type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('원본 이미지를 로드할 수 없습니다.'));
    };

    img.src = item.previewUrl;
  });
}
