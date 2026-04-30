import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { getPreviewClassById, isPreviewMode } from '@/lib/preview';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';

// ─── 수업 정보 타입 ─────────────────────────────────────────
interface ClassInfo {
  id: number;
  title: string;
  staffName: string;
  startTime: string;
  endTime: string;
  lesson_status: string | null;
  signature_url: string | null;
  signature_at: string | null;
  completed_at: string | null;
}

// ─── 서명 캔버스 컴포넌트 ───────────────────────────────────
function SignatureCanvas({ onSign }: { onSign: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  // 캔버스 크기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const start = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    setDrawing(true);
    setHasDrawn(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    setDrawing(false);
    if (canvasRef.current && hasDrawn) {
      onSign(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSign('');
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-[200px] bg-white rounded-card border-2 border-dashed border-line touch-none"
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
      />
      {!hasDrawn && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-content-tertiary text-[14px]">여기에 서명해주세요</p>
        </div>
      )}
      <button
        onClick={clear}
        className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-lg border border-line text-content-secondary hover:text-content"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

// ─── 메인 페이지 ────────────────────────────────────────────
export default function LessonSignature() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const member = useAuthStore((state) => state.member);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // 수업 정보 로드
  useEffect(() => {
    if (!classId) return;
    const fetchClass = async () => {
      setLoading(true);

      if (isPreviewMode()) {
        const previewClass = getPreviewClassById(Number(classId));
        setClassInfo(
          previewClass
            ? {
                id: previewClass.id,
                title: previewClass.title,
                staffName: previewClass.staffName,
                startTime: previewClass.startTime,
                endTime: previewClass.endTime,
                lesson_status: previewClass.lesson_status ?? null,
                signature_url: null,
                signature_at: null,
                completed_at: null,
              }
            : null
        );
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('classes')
        .select('id, title, staffName, startTime, endTime, lesson_status, signature_url, signature_at, completed_at')
        .eq('id', classId)
        .single();
      if (data) setClassInfo(data as ClassInfo);
      setLoading(false);
    };
    fetchClass();
  }, [classId]);

  const uploadSignature = async (dataUrl: string) => {
    const blob = await (await fetch(dataUrl)).blob();
    const fileName = `signatures/member_class_${classInfo?.id}_${Date.now()}.png`;
    const { error } = await supabase.storage
      .from('files')
      .upload(fileName, blob, { contentType: 'image/png', upsert: true });

    if (error) return dataUrl;
    const { data } = supabase.storage.from('files').getPublicUrl(fileName);
    return data.publicUrl || dataUrl;
  };

  // 서명 제출: classes 완료/서명 컬럼에 저장
  const handleSubmit = useCallback(async () => {
    if (!signatureDataUrl || !classInfo) {
      toast.error('서명을 해주세요.');
      return;
    }

    setSaving(true);
    try {
      if (isPreviewMode()) {
        setDone(true);
        toast.success('서명이 완료되었습니다!');
        setTimeout(() => navigate('/lessons', { replace: true }), 2000);
        return;
      }

      const signedAt = new Date().toISOString();
      const signatureUrl = await uploadSignature(signatureDataUrl);
      const { error } = await supabase
        .from('classes')
        .update({
          lesson_status: 'completed',
          signature_url: signatureUrl,
          signature_at: signedAt,
          completed_at: signedAt,
        })
        .eq('id', classInfo.id);

      if (error) throw error;

      await supabase.from('audit_log').insert({
        tenantId: 1,
        userId: member?.id ?? 0,
        action: 'UPDATE',
        targetType: 'lesson',
        targetId: classInfo.id,
        beforeValue: {
          status: classInfo.lesson_status,
          signatureUrl: classInfo.signature_url,
        },
        afterValue: {
          status: 'completed',
          signatureUrl,
          completedAt: signedAt,
        },
        detail: {
          message: '모바일 레슨 완료 서명 저장됨',
          memberId: member?.id ?? null,
          mobileSignatureLinked: true,
        },
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

      setClassInfo((prev) => prev ? {
        ...prev,
        lesson_status: 'completed',
        signature_url: signatureUrl,
        signature_at: signedAt,
        completed_at: signedAt,
      } : prev);
      setDone(true);
      toast.success('서명이 완료되었습니다!');
      setTimeout(() => navigate('/lessons', { replace: true }), 2000);
    } catch {
      toast.error('서명 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }, [signatureDataUrl, classInfo, navigate, member?.id]);

  const fmtDateTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary-light border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <p className="text-content-tertiary">수업 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 이미 서명 완료
  if (classInfo.signature_url) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="px-4 pt-8 text-center">
          <div className="w-16 h-16 rounded-full bg-state-success/10 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-state-success" />
          </div>
          <h2 className="text-[18px] font-bold text-content mb-2">서명 완료</h2>
          <p className="text-[14px] text-content-secondary mb-6">이 수업의 서명이 이미 완료되었습니다.</p>
          <Button
            variant="tertiary"
            fullWidth
            onClick={() => navigate('/lessons', { replace: true })}
          >
            수업 목록으로
          </Button>
        </div>
      </div>
    );
  }

  // 서명 완료 애니메이션
  if (done) {
    return (
      <div className="min-h-screen bg-surface-secondary">
        <div className="px-4 pt-16 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-state-success/10 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-state-success" />
          </div>
          <h2 className="text-[20px] font-bold text-content mb-2">서명이 완료되었습니다!</h2>
          <p className="text-[14px] text-content-secondary">수업 확인이 완료되었습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      <div className="px-4 pt-4 pb-8">
        {/* 수업 정보 */}
        <div className="p-4 bg-primary-light rounded-card border border-primary/20 mb-6">
          <p className="text-[16px] font-bold text-content">{classInfo.title}</p>
          <div className="mt-2 space-y-1 text-[13px] text-content-secondary">
            <p>강사: <strong className="text-content">{classInfo.staffName}</strong></p>
            <p>일시: <strong className="text-content">{fmtDateTime(classInfo.startTime)} ~ {fmtDateTime(classInfo.endTime)}</strong></p>
          </div>
        </div>

        {/* 서명 안내 */}
        <div className="flex items-start gap-2 mb-4 p-3 bg-state-warning/5 border border-state-warning/20 rounded-card">
          <AlertTriangle size={16} className="text-state-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-state-warning">수업 확인 서명</p>
            <p className="text-[11px] text-content-secondary mt-0.5">
              수업이 정상적으로 진행되었음을 확인하는 서명입니다.
              서명 후에는 수정할 수 없으며, 수업 진행 증빙으로 사용됩니다.
            </p>
          </div>
        </div>

        {/* 서명 캔버스 */}
        <div className="mb-6">
          <label className="text-[13px] font-bold text-content mb-2 block">아래에 서명해주세요</label>
          <SignatureCanvas onSign={setSignatureDataUrl} />
        </div>

        {/* 제출 버튼 */}
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={!signatureDataUrl || saving}
          loading={saving}
          leftIcon={!saving ? <Check size={18} /> : undefined}
        >
          서명 확인 및 완료
        </Button>

        <p className="text-center text-[11px] text-content-tertiary mt-3">
          서명 시 수업이 정상 진행된 것으로 확인됩니다
        </p>
      </div>
    </div>
  );
}
