'use client';

import { useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui';

interface SignaturePadProps {
  /** 서명 완료(저장) 시 이미지 dataURL + 시각을 전달한다. */
  onComplete: (result: { image: string; signedAt: string }) => void;
  /** 저장 버튼 라벨 */
  saveLabel?: string;
  /** 상단 안내(예: "수업을 정상 수강했습니다") */
  notice?: string;
}

/**
 * 캔버스 기반 서명 패드 (마우스·터치). 그린 뒤 저장하면 서명 이미지(dataURL)와 타임스탬프를 반환한다.
 * 골프 쌍방서명(MA-312)·레슨 확인서의 법적 증거 이미지 캡처에 사용한다.
 */
export default function SignaturePad({ onComplete, saveLabel = '서명 완료', notice }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // 디스플레이 픽셀 비율을 반영해 선명하게 렌더
    const ratio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A';
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !last.current) return;
    const next = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    last.current = next;
    if (!hasDrawn) setHasDrawn(true);
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    onComplete({ image: canvas.toDataURL('image/png'), signedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-2">
      {notice && (
        <div className="rounded-card bg-primary-light p-3">
          <p className="text-body-sm font-bold text-primary">{notice}</p>
        </div>
      )}
      <div className="relative rounded-card border border-line-strong bg-surface overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block w-full h-40 touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!hasDrawn && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-caption text-content-tertiary">
            이 영역에 서명해 주세요
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="md" onClick={clear} leftIcon={<Eraser className="w-4 h-4" />}>
          지우기
        </Button>
        <Button variant="primary" size="md" fullWidth disabled={!hasDrawn} onClick={save}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
